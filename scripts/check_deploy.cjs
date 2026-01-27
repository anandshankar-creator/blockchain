const hre = require("hardhat");

async function main() {
    const address = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Deterministic address for first deployment
    const code = await hre.ethers.provider.getCode(address);
    console.log("Code length:", code.length);
    if (code !== "0x") {
        console.log("Contract is deployed.");
    } else {
        console.log("Contract is NOT deployed.");
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
