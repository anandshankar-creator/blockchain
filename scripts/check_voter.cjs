const hre = require("hardhat");

async function main() {
    const votingAddress = "0x48893DB1B1c5CC1336047e97f3186f646120C977";
    const voterAddress = "0x8cD8848b24149B5f7C21f59bF9f41846BAe4f8e1"; // The address from the screenshot

    console.log(`Checking status for ${voterAddress} on Voting contract ${votingAddress}...`);

    const Voting = await hre.ethers.getContractAt("Voting", votingAddress);

    // Check if voter exists in the mapping
    const voter = await Voting.voters(voterAddress);

    console.log("\n--- Voter Data ---");
    console.log("ID:", voter.voter_voterId.toString());
    console.log("Name:", voter.voter_name);
    console.log("Allowed:", voter.voter_allowed.toString());
    console.log("Voted:", voter.voter_voted);
    console.log("Vote Index:", voter.voter_vote.toString());

    if (voter.voter_allowed == 0) {
        console.log("\n[!] ERROR: Voter is NOT registered (Allowed == 0).");
        console.log("    Solution: Register this address as a voter using the Organizer account.");
    } else if (voter.voter_voted) {
        console.log("\n[!] ERROR: Voter has ALREADY voted.");
        console.log("    Solution: You cannot vote twice.");
    } else {
        console.log("\n[+] SUCCESS: Voter is registered and has NOT voted yet.");
        console.log("    If transaction fails, it might be a gas limit issue or Relayer balance issue.");
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
