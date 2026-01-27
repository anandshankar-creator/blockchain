const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    // 1. Deploy Forwarder
    const Forwarder = await hre.ethers.getContractFactory("Forwarder");
    const forwarder = await Forwarder.deploy();
    await forwarder.waitForDeployment();
    const forwarderAddress = await forwarder.getAddress();
    console.log("Forwarder Deployed to:", forwarderAddress);

    // 2. Deploy Voting with Forwarder Address
    const Voting = await hre.ethers.getContractFactory("Voting");
    const voting = await Voting.deploy(forwarderAddress);
    await voting.waitForDeployment();
    const votingAddress = await voting.getAddress();
    console.log("Voting Contract Deployed to:", votingAddress);

    // 3. Save ABIs
    const contextDir = path.join(__dirname, "../context");

    // Voting ABI
    const votingArtifact = JSON.parse(fs.readFileSync(path.join(__dirname, "../artifacts/contracts/Voting.sol/Voting.json"), "utf-8"));
    fs.writeFileSync(path.join(contextDir, "Voting.json"), JSON.stringify(votingArtifact, null, 2));

    // Forwarder ABI
    const forwarderArtifact = JSON.parse(fs.readFileSync(path.join(__dirname, "../artifacts/contracts/Forwarder.sol/Forwarder.json"), "utf-8"));
    fs.writeFileSync(path.join(contextDir, "Forwarder.json"), JSON.stringify(forwarderArtifact, null, 2));

    console.log(`ABIs copied to ${contextDir}`);

    // 4. Update Constants
    const constantsPath = path.join(contextDir, "constants.js");
    let constantsContent = fs.readFileSync(constantsPath, "utf-8");

    // Update Voting Address
    constantsContent = constantsContent.replace(/export const VotingAddress = ".*";/, `export const VotingAddress = "${votingAddress}";`);

    // Update or Add Forwarder Address
    if (constantsContent.includes("export const ForwarderAddress")) {
        constantsContent = constantsContent.replace(/export const ForwarderAddress = ".*";/, `export const ForwarderAddress = "${forwarderAddress}";`);
    } else {
        constantsContent += `\nexport const ForwarderAddress = "${forwarderAddress}";`;
    }

    fs.writeFileSync(constantsPath, constantsContent);
    console.log(`Addresses updated in ${constantsPath}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
