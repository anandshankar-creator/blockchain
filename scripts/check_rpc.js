const { ethers } = require("ethers");

async function main() {
    const url = "http://127.0.0.1:8545";
    console.log(`Pinging JSON-RPC at ${url}...`);

    try {
        const provider = new ethers.JsonRpcProvider(url);
        const network = await provider.getNetwork();
        const blockNumber = await provider.getBlockNumber();

        console.log("\n✅ SUCCESS: Local Node is RUNNING.");
        console.log(`- Chain ID: ${network.chainId}`);
        console.log(`- Block Height: ${blockNumber}`);
        console.log("- Connection URL: http://127.0.0.1:8545");
    } catch (error) {
        console.error("\n❌ ERROR: Could not connect to Local Node.");
        console.error("Is 'npx hardhat node' running in a separate terminal?");
        console.error(`Details: ${error.message}`);
    }
}

main();
