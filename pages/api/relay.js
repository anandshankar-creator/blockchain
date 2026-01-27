import { ethers } from "ethers";
import { VotingAddress, VotingAddressABI, ForwarderAddress, ForwarderABI } from "../../context/constants";

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { request, signature } = req.body;

    if (!request || !signature) {
        return res.status(400).json({ message: 'Missing request or signature' });
    }

    console.log("Relay Request Received:", request);

    try {
        // 1. Setup Relayer Wallet
        const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
        const privateKey = process.env.PRIVATE_KEY;
        if (!privateKey) throw new Error("Relayer Private Key not configured");

        const wallet = new ethers.Wallet(privateKey, provider);

        // 2. Connect to Forwarder Contract
        const forwarder = new ethers.Contract(ForwarderAddress, ForwarderABI, wallet);

        // Construct the struct
        const val = BigInt(request.value);
        const gas = BigInt(request.gas);

        const forwardRequest = {
            from: request.from,
            to: request.to,
            value: val,
            gas: gas,
            deadline: request.deadline,
            data: request.data,
            signature: signature
        };

        console.log("Forward Request Value:", val.toString());
        console.log("Forward Request Gas:", gas.toString());

        // 3. Verify Request
        try {
            const valid = await forwarder.verify(forwardRequest);
            if (!valid) {
                console.error("Signature verification failed on Relayer");
                return res.status(400).json({ message: 'Invalid signature' });
            }
        } catch (err) {
            console.error("Verification Error:", err);
            return res.status(400).json({ message: `Verification failed: ${err.message}` });
        }

        // 5. Execute Transaction
        console.log("Executing transaction...");

        // Explicitly handle value to ensure it matches
        const txOverrides = { value: val };
        console.log("Transaction Overrides:", { value: val.toString() });

        const tx = await forwarder.execute(forwardRequest, txOverrides);
        console.log("Relay Transaction Sent:", tx.hash);

        const receipt = await tx.wait();
        console.log("Relay Transaction Confirmed:", receipt.hash);

        return res.status(200).json({
            success: true,
            txHash: receipt.hash
        });

    } catch (error) {
        console.error("Relayer Error:", error);
        return res.status(500).json({
            success: false,
            error: error.message || error.reason
        });
    }
}
