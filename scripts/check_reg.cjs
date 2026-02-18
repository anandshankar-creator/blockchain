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

    const version = await Voting.electionVersion();
    const results = { currentVersion: version.toString(), users: [] };

    for (let addr of addresses) {
        addr = ethers.getAddress(addr.toLowerCase());
        const userVersion = await Voting.voterElectionVersion(addr);
        const voter = await Voting.voters(addr);
        results.users.push({
            address: addr,
            userVersion: userVersion.toString(),
            allowed: voter[4].toString(),
            voted: voter[5],
            isValid: userVersion.toString() === version.toString()
        });
    }
    console.log(JSON.stringify(results, null, 2));
}

main().catch(console.error);
