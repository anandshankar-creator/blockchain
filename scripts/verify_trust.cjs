const hre = require("hardhat");

async function main() {
    const votingAddress = "0x48893DB1B1c5CC1336047e97f3186f646120C977";
    const forwarderAddress = "0x47E8EA514C9F33a19cB34ADD159884e302293384";

    console.log(`Checking trust...`);
    console.log(`Voting: ${votingAddress}`);
    console.log(`Forwarder: ${forwarderAddress}`);

    const Voting = await hre.ethers.getContractAt("Voting", votingAddress);

    const isTrusted = await Voting.isTrustedForwarder(forwarderAddress);

    console.log("\n---------------------------------------------------");
    console.log(`Is Forwarder Trusted? ${isTrusted}`);
    console.log("---------------------------------------------------");

    if (!isTrusted) {
        console.log("CRITICAL ERROR: The Voting contract does NOT trust this Forwarder.");
        console.log("This causes _msgSender() to fail, reverting all relay transactions.");
    } else {
        console.log("Trust configuration is CORRECT.");
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
