const { ethers } = require("ethers");
const path = require("path");
require("dotenv").config();
const votingJson = require(path.join(__dirname, "..", "context", "Voting.json"));

async function main() {
    const votingAddress = ethers.getAddress("0x12e323fc58BEE23E5B3431469Fba3653514E166d".toLowerCase());
    const addresses = [
        "0xcf0A8F7f2B16C93C7dd6f85a783e75568018D0F6",
        "0xe4cEF3150EB4a98eE28e9DF041e6F980a16dC4a2"
    ];

    const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
    const Voting = new ethers.Contract(votingAddress, votingJson.abi, provider);

    console.log(`Checking status on Voting contract ${votingAddress}...\n`);

    const electionVersion = await Voting.electionVersion();
    console.log(`Current Election Version: ${electionVersion}\n`);

    for (let voterAddress of addresses) {
        voterAddress = ethers.getAddress(voterAddress.toLowerCase());
        console.log(`--- Checking Voter: ${voterAddress} ---`);
        try {
            const userVersion = await Voting.voterElectionVersion(voterAddress);
            console.log("User Election Version:", userVersion.toString());

            // Check mapping directly via voters()
            const voter = await Voting.voters(voterAddress);
            console.log("ID:", voter[0].toString());
            console.log("Name:", voter[1]);
            console.log("Allowed:", voter[4].toString());
            console.log("Voted:", voter[5]);

            if (userVersion.toString() !== electionVersion.toString()) {
                console.log("[!] REJECT REASON: Wrong Election Version");
            } else if (voter[4].toString() === "0") {
                console.log("[!] REJECT REASON: Not allowed");
            } else if (voter[5]) {
                console.log("[!] REJECT REASON: Already voted");
            } else {
                console.log("[+] Voter is VALID.");
            }
        } catch (err) {
            console.log(`Error checking:`, err.message);
        }
        console.log("");
    }
}

main().catch(console.error);
