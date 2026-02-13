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
        // 1. Safety Guard: Check Relayer Balance
        // We do this every request to ensure the 60th vote doesn't fail.
        const balance = await provider.getBalance(wallet.address);
        if (balance < ethers.parseEther("0.05")) { // Safe threshold for multiple votes
            return res.status(500).json({ message: "Relayer low on ETH. Please top up relayer wallet." });
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

        // 2. Logic Guarantee: Simulation
        try {
            const decodedData = votingInterface.decodeFunctionData("giveVote", request.data);
            // Simulate as the user to catch registration/double-voting errors
            await votingContract.giveVote.staticCall(decodedData[0], decodedData[1], { from: request.from });
        } catch (simError) {
            console.error("Simulation error:", simError);

            // Extract the most readable error message
            let reason = "Execution would fail (Check if you are registered)";
            if (simError.reason) reason = simError.reason;
            else if (simError.message) {
                // Try to find the revert reason in the message string
                const match = simError.message.match(/reverted with reason string '(.+)'/);
                if (match) reason = match[1];
            }

            return res.status(400).json({ message: `Logic Error: ${reason}` });
        }

        // 3. Ultra-Fast Parallel Nonce Management
        // We use a lock ONLY for the calculation of the nonce, not for the broadcast.
        const txNonce = await new Promise((resolve) => {
            nonceLock = nonceLock.then(async () => {
                if (nextNonce === null) {
                    nextNonce = await provider.getTransactionCount(wallet.address, "pending");
                }
                const assignedNonce = nextNonce;
                nextNonce++;
                resolve(assignedNonce);
            });
        });

        // 4. FIRE AND FORGET (Broadcast Parallelly)
        console.log(`Broadcasting Vote for ${request.from} with Nonce ${txNonce}`);
        const tx = await forwarder.execute(forwardRequest, {
            value: BigInt(request.value),
            nonce: txNonce
        });

        // We return the Hash instantly. The frontend will wait for the TRUE confirmation.
        return res.status(200).json({
            success: true,
            txHash: tx.hash
        });

    } catch (error) {
        // Reset nonce on error to avoid gaps
        nextNonce = null;
        console.error("Relayer Error:", error.message);
        return res.status(500).json({ success: false, error: error.message });
    }
}
