const hre = require("hardhat");

async function main() {
    const accounts = await hre.ethers.getSigners();
    console.log("Available Accounts:");
    for (let i = 0; i < 5; i++) {
        console.log(`Account #${i}: ${accounts[i].address}`);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
