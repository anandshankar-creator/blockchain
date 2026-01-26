const hre = require("hardhat");

async function main() {
    // 1. Setup
    const VotingAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
    const VotingABI = require("../context/Voting.json").abi;

    console.log(`Connecting to contract at ${VotingAddress}`);

    // 2. Get Signer (Organizer - Account #0)
    const [organizer] = await hre.ethers.getSigners();
    console.log(`Organizer: ${organizer.address}`);

    // 3. Connect to Contract
    const contract = await hre.ethers.getContractAt(VotingABI, VotingAddress, organizer);

    // 4. Test Data
    const candidateAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"; // Account #1
    const age = "25";
    const name = "Test Candidate";
    const image = "http://test.image";
    const ipfs = "http://test.ipfs";

    // 5. Attempt Registration
    console.log("Attempting to register candidate...");
    try {
        const tx = await contract.setCandidate(candidateAddress, age, name, image, ipfs);
        console.log("Transaction hash:", tx.hash);

        await tx.wait();
        console.log("Transaction confirmed!");
        console.log("Candidate registered successfully.");
    } catch (error) {
        console.error("Registration Failed!");
        console.error("Error Reason:", error.reason);
        console.error("Full Error:", error);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
