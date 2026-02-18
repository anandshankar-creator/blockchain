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

    try {
        // 1. Safety Guard: Check Relayer Balance (Throttle safely)
        const balance = await provider.getBalance(wallet.address);
        if (balance < ethers.parseEther("0.02")) {
            console.warn("Relayer Low Balance:", ethers.formatEther(balance));
            // Don't fail immediately if slightly low, but warn.
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

        // 2. Simulation (Crucial for error feedback)
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
            }
            return res.status(400).json({ message: `Vote Rejected: ${reason}` });
        }

        // 3. Serialized Nonce Allocation (Mutex)
        // We lock ONLY the nonce fetching/incrementing part.
        let tx;
        let attempt = 0;
        let currentNonce;

        // Get initial nonce
        await new Promise((resolve, reject) => {
            nonceLock = nonceLock.then(async () => {
                try {
                    // Sync nonce if needed (first run or recovery)
                    if (nextNonce === null) {
                        nextNonce = await provider.getTransactionCount(wallet.address, "pending");
                    }

                    currentNonce = nextNonce;
                    nextNonce++; // Optimistally increment
                    resolve();
                } catch (err) {
                    reject(err);
                }
            }).catch(reject); // Catch lock errors
        });

        // 4. Broadcast with Retry Logic
        console.log(`Broadcasting Vote for ${request.from} with Nonce ${currentNonce}`);

        while (attempt < 3) {
            try {
                // If this is a retry, we need to manually override the nonce
                // The first attempt uses the locked nonce.
                if (attempt > 0) {
                    console.log(`Retry attempt ${attempt}: Incrementing nonce to ${currentNonce}`);
                }

                tx = await forwarder.execute(forwardRequest, {
                    value: BigInt(request.value),
                    nonce: currentNonce
                });

                // If success, break loop
                break;

            } catch (broadcastError) {
                const errMsg = broadcastError.message ? broadcastError.message.toLowerCase() : "";
                const isNonceIssue =
                    errMsg.includes("replacement transaction underpriced") ||
                    errMsg.includes("nonce too low") ||
                    errMsg.includes("already known") ||
                    broadcastError.code === "NONCE_EXPIRED" ||
                    broadcastError.code === "REPLACEMENT_UNDERPRICED";

                if (isNonceIssue) {
                    currentNonce = currentNonce + 1; // Increment local nonce usage

                    // Update global tracker too if possible, to help next request
                    // We need to match the type (number)
                    if (nextNonce !== null && nextNonce <= currentNonce) {
                        nextNonce = currentNonce + 1;
                    }

                    console.warn(`Nonce Collision. Retrying with nonce ${currentNonce}...`);
                    attempt++;
                } else {
                    // If it's a different error, fail immediately but try to reset nonce if 1st attempt
                    if (attempt === 0) nextNonce = null;
                    throw broadcastError;
                }
            }
        }

        if (!tx) throw new Error("Failed to broadcast vote after retries.");

        // 5. Success Response (Fast)
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
