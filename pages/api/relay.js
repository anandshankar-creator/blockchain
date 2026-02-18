import { ethers } from "ethers";
import { VotingAddress, VotingAddressABI, ForwarderAddress, ForwarderABI } from "../../context/constants";

// Global variables to track nonces across parallel requests
let nextNonce = null;
let nonceLock = Promise.resolve();

// Global cache for blockchain connections (Saves ~1-2s per request)
const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
const privateKey = process.env.PRIVATE_KEY;
const wallet = new ethers.Wallet(privateKey, provider);
const forwarder = new ethers.Contract(ForwarderAddress, ForwarderABI, wallet);
const votingContract = new ethers.Contract(VotingAddress, VotingAddressABI, wallet);
const votingInterface = new ethers.Interface(VotingAddressABI);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { request, signature } = req.body;
    if (!request || !signature) {
        return res.status(400).json({ message: 'Missing request or signature' });
    }

    // 0. Jitter for Concurrency (Especially for Vercel Serverless)
    // Helps stagger concurrent requests to avoid simultaneous 'pending' count collisions.
    await new Promise(r => setTimeout(r, Math.floor(Math.random() * 1000)));

    try {
        // 1. Safety Guard: Check Relayer Balance
        const balance = await provider.getBalance(wallet.address);
        if (balance < ethers.parseEther("0.02")) {
            console.warn("Relayer Low Balance:", ethers.formatEther(balance));
        }

        const forwardRequest = {
            from: request.from,
            to: request.to,
            value: BigInt(request.value),
            gas: BigInt(request.gas),
            deadline: request.deadline,
            data: request.data,
            signature: signature
        };

        // 2. Simulation
        try {
            await forwarder.execute.staticCall(forwardRequest, {
                value: BigInt(request.value)
            });
        } catch (simError) {
            console.error("Simulation error:", simError);
            let reason = "Execution check failed. Only registered voters who haven't voted can vote.";
            if (simError.reason) reason = simError.reason;
            else if (simError.message && simError.message.includes("reverted")) {
                const match = simError.message.match(/reverted with reason string '(.+)'/);
                if (match) reason = match[1];
                else if (simError.message.includes("FailedCall")) reason = "Vote failed in Voting contract. Did you already vote or reset the election?";
            }
            return res.status(400).json({ message: `Vote Rejected: ${reason}` });
        }

        // 3. Broadcast with robust concurrent nonce handling
        let tx;
        let attempt = 0;

        // Always get the Freshest possible nonce
        const baseNonce = await provider.getTransactionCount(wallet.address, "pending");
        let targetNonce = baseNonce;

        while (attempt < 5) {
            try {
                console.log(`Attempt ${attempt + 1}: Sending for ${request.from} with Nonce ${targetNonce}`);

                tx = await forwarder.execute(forwardRequest, {
                    value: BigInt(request.value),
                    nonce: targetNonce,
                    // Use a slightly higher gas price to ensure prioritize it and avoid "underpriced"
                    gasPrice: (await provider.getFeeData()).gasPrice * 125n / 100n
                });

                break; // Found it!

            } catch (broadcastError) {
                const errMsg = (broadcastError.message || "").toLowerCase();
                const isNonceIssue =
                    errMsg.includes("replacement transaction underpriced") ||
                    errMsg.includes("nonce too low") ||
                    errMsg.includes("already known") ||
                    broadcastError.code === "NONCE_EXPIRED" ||
                    broadcastError.code === "REPLACEMENT_UNDERPRICED";

                if (isNonceIssue) {
                    console.warn(`Nonce issue on attempt ${attempt + 1}. Retrying...`);
                    targetNonce++;
                    attempt++;
                    await new Promise(r => setTimeout(r, 200)); // Small delay
                } else {
                    throw broadcastError;
                }
            }
        }

        if (!tx) throw new Error("Failed to broadcast vote after maximum attempts.");

        // 4. Success Response
        return res.status(200).json({
            success: true,
            txHash: tx.hash,
            message: "Vote broadcasted successfully"
        });

    } catch (error) {
        console.error("Relayer System Error:", error.message);
        return res.status(500).json({ success: false, error: "Relay Internal Error: " + error.message });
    }
}
