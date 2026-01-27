# 🗳️ Decentralized Voting Application (dApp) - Sepolia Version

Welcome to the **Blockchain-based Voting System**. This project is fully configured to run on the **Ethereum Sepolia Testnet**.

---

## 🚀 Overview
This application allows an organizer to manage a secure, transparent election.
- **Organizer**: Deploys the contract and registers candidates/voters.
- **Voters**: Cast a single vote for their preferred candidate **GASLESSLY** (Relayer pays the fee).
- **Transparency**: Every action is saved on the blockchain and can be viewed on [Etherscan](https://sepolia.etherscan.io/).

---

## 🏁 Quick Start (Beginner to Pro)

### 1. Prerequisites
- **Node.js** installed.
- **MetaMask** extension installed in your browser.
- **Sepolia ETH**: Get it free from the [Alchemy Faucet](https://www.alchemy.com/faucets/ethereum-sepolia).

### 2. Setup (Connection)
1. **Get an RPC URL**: Create a free account on [Infura.io](https://www.infura.io/), create a new key, and copy the **Sepolia HTTPS URL**.
2. **Create `.env` file**: In the root folder, create a file named `.env` and add:
   ```env
   SEPOLIA_RPC_URL="YOUR_INFURA_URL"
   PRIVATE_KEY="YOUR_WALLET_PRIVATE_KEY"
   ```
   *(This Private Key will act as the **Organizer** and the **Relayer** paying for gas).*

### 3. Installation
Run this in your terminal:
```bash
npm install
```

### 4. Deploy once
Run this command to push the contract to the blockchain:
```bash
npx hardhat run scripts/deploy.cjs --network sepolia
```
*Note: This script automatically updates the frontend with the new address and ABI.*

### 5. Start the App
Run the website:
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)**. Ensure MetaMask is set to **Sepolia**.

---

## 🎮 How to use (Gasless Flow)
1. **Register Candidate**: Log in as the Organizer (Private Key Account). Go to "Candidate Registration" and add a candidate.
2. **Register Voter**: Go to "Voter Registration" and add a friend's wallet address.
3. **Vote (Gasless)**: 
   - Switch MetaMask to the **Friend's Account** (Empty wallet with 0 ETH is fine!).
   - Go to Home page, click **Give Vote**.
   - **Sign** the popup (Cost: $0).
   - **Wait**: The server (Relayer) will pick it up and pay the gas for you.
   - Success! Check Etherscan to see the Relayer paid the fee.

### 📱 Mobile Usage
If you are on a smartphone, you cannot use Chrome Extensions.
1.  **Install MetaMask App**: Download from App Store / Play Store.
2.  **Use Built-in Browser**: Open MetaMask App -> Click the **Browser** tab (bottom right or menu).
3.  **Enter URL**: Type your Vercel URL (e.g., `https://blockchain-five-lemon.vercel.app`).
4.  **Vote**: It works exactly the same! The app will pop up to sign the message.

---

## 📂 Key Files
- `contracts/Voting.sol`: Smart Contract with EIP-2771 (Meta-Transaction support).
- `contracts/Forwarder.sol`: Trusted Forwarder contract validating signatures.
- `pages/api/relay.js`: The Backend Relayer that submits transactions.
- `scripts/deploy.cjs`: Automates deployment of both Voting and Forwarder.
- `context/Voter.js`: Frontend logic handling EIP-712 signatures.

