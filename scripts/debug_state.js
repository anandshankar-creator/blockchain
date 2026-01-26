const hre = require("hardhat");

async function main() {
    // 1. Get the contract address
    // We need to read this from the same place the frontend does or ask the user.
    // For now, I'll try to attach to the most recent deployment if possible, 
    // or I will assume the address from the previous context if hardcoded.
    // Ideally, we read 'context/constants.js' but that's a JS file.
    // I will ask the user to provide the address if this fails, but let's try the one known.

    // You can also just get the deployed contract if you know the name
    const Voting = await hre.ethers.getContractFactory("Voting");

    // REPLACE THIS WITH YOUR CURRENT DEPLOYED ADDRESS
    // I am reading this from what I saw in previous turns: 0x5FbDB2315678afecb367f032d93F642f64180aa3
    const votingAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

    console.log(`Checking contract at: ${votingAddress}`);
    const voting = Voting.attach(votingAddress);

    // 2. Fetch Candidates
    try {
        const candidateList = await voting.getCandidate();
        console.log(`\nFound ${candidateList.length} candidates:`);

        for (const address of candidateList) {
            const data = await voting.getCandidateData(address);
            console.log(`- Name: ${data[1]}, ID: ${data[2]}, Address: ${data[6]}`);
        }
    } catch (error) {
        console.error("\nError feching candidates (Contract might not exist at this address):", error.message);
    }

    // 3. Fetch Voters
    try {
        const voterList = await voting.getVoterList();
        console.log(`\nFound ${voterList.length} voters:`);

        for (const address of voterList) {
            const data = await voting.getVoterData(address);
            console.log(`- Name: ${data[1]}, Address: ${data[3]}, Voted: ${data[5]}`);
        }
    } catch (error) {
        console.error("\nError fetching voters:", error.message);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
