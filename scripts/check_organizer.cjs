const hre = require("hardhat");

async function main() {
    const VotingAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
    const VotingABI = [
        {
            "inputs": [],
            "name": "votingOrganizer",
            "outputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        }
    ];

    console.log("Checking Organizer on Contract:", VotingAddress);
    // Use the default provider for the network which is connected to localhost
    const contract = await hre.ethers.getContractAt(VotingABI, VotingAddress);

    const organizer = await contract.votingOrganizer();
    console.log("Organizer Address:", organizer);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
