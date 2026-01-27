const { ethers } = require("ethers");
const fs = require("fs");

async function main() {
    const RPC_URL = "https://sepolia.infura.io/v3/af2d32753a144776b9a6d37364aaadd5";
    const VotingAddress = "0xC4c44BbD553E9eDe19EA93E0E96Df81E5037c4Af";
    const VotingABI = JSON.parse(fs.readFileSync("c:/Users/ACER/OneDrive/Documents/Desktop/pro/context/Voting.json")).abi;

    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const contract = new ethers.Contract(VotingAddress, VotingABI, provider);

    console.log("Fetching candidates...");
    try {
        const allCandidate = await contract.getCandidate();
        console.log("Number of candidates:", allCandidate.length);
        console.log("Candidate Addresses:", allCandidate);

        for (let i = 0; i < allCandidate.length; i++) {
            const addr = allCandidate[i];
            console.log(`Fetching data for ${addr}...`);
            try {
                const data = await contract.getCandidateData(addr);
                console.log(`Data for ${addr}:`, data);
            } catch (err) {
                console.error(`Error fetching data for ${addr}:`, err.message);
            }
        }
    } catch (error) {
        console.error("Critical Error:", error.message);
    }
}

main().catch(err => console.error("Unhandled Promise:", err));
