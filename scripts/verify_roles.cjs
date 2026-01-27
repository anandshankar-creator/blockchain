const hre = require("hardhat");
require("dotenv").config();

async function main() {
    console.log("--- Manual Verification ---");

    // 1. Relayer Address (From your .env file)
    // This is the account that PAYS for the votes.
    if (!process.env.PRIVATE_KEY) {
        console.log("Error: PRIVATE_KEY not found in .env");
        return;
    }
    const relayerWallet = new hre.ethers.Wallet(process.env.PRIVATE_KEY);
    console.log(`[Relayer] Address:   ${relayerWallet.address}`);

    // 2. Organizer Address (From the Blockchain)
    // This is the account that deployed the contract and controls it.
    const votingAddress = "0xe108190A9e539bc7d89D6CAfe6F9Aa77a7B88228";
    try {
        const Voting = await hre.ethers.getContractAt("Voting", votingAddress);
        const organizer = await Voting.votingOrganizer();
        console.log(`[Organizer] Address: ${organizer}`);
    } catch (e) {
        console.log(`[Organizer] Error: Could not fetch from contract. Ensure network is correct.`);
    }

    console.log("---------------------------");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
