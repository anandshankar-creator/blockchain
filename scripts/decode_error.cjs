const { ethers } = require("ethers");

const errors = [
    "ERC2771ForwarderExpiredRequest(uint48)",
    "ERC2771ForwarderInvalidSigner(address,address)",
    "ERC2771ForwarderMismatchedValue(uint256,uint256)",
    "ERC2771UntrustfulTarget(address,address)",
    "FailedCall()",
    "InsufficientBalance(uint256,uint256)",
    "InvalidAccountNonce(address,uint256)",
    "InvalidShortString()",
    "StringTooLong(string)",
    "AddressEmptyCode(address)",
    "AddressInsufficientBalance(address)",
    "FailedInnerCall()"
];

async function main() {
    console.log("Target Selector: 0xd6bda275");
    console.log("--------------------------------");

    for (const err of errors) {
        const selector = ethers.id(err).slice(0, 10);
        console.log(`${selector} : ${err}`);
    }
}

main();
