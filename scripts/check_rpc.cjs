const hre = require("hardhat");

async function main() {
    const networkName = hre.network.name;
    console.log(`Pinging ${networkName} network...`);

    try {
        const provider = hre.ethers.provider;
        const blockNumber = await provider.getBlockNumber();
        const network = await provider.getNetwork();

        console.log(`\n✅ SUCCESS: Connected to ${networkName}.`);
        console.log(`- Chain ID: ${network.chainId.toString()}`);
        console.log(`- Block Height: ${blockNumber}`);
    } catch (error) {
        console.error(`\n❌ ERROR: Could not connect to ${networkName}.`);
        console.error(`Details: ${error.message}`);
    }
}

main();
