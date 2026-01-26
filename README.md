# Decentralized Voting Application (dApp)

Welcome! This is a **Blockchain-based Voting System**.

This project allows an administrator ("Organizer") to register voters and candidates, and allows users ("Voters") to cast votes securely. The data is stored on a **Blockchain**, making it secure, transparent, and impossible to tamper with.

---

## 🚀 How It Works (The "Why")

### Why use Blockchain?
In a normal voting app, a database administrator could change the numbers in the database. In this app:
1.  **Smart Contract**: The rules of voting are written in code (Solidity) and deployed to the blockchain. Once deployed, **nobody** (not even the developer) can change the rules.
2.  **Immutability**: Once a vote is cast, it is written to the blockchain forever. It cannot be deleted or modified.
3.  **Transparency**: Everyone can verify the vote count directly from the blockchain.

### Technologies Used
-   **Next.js (React)**: The Frontend (Website). It makes the app look good and easy to use.
-   **Solidity**: The Backend language for writing the "Smart Contract" (the voting logic).
-   **Hardhat**: A "Local Blockchain" simulator. It runs on your computer so you can test without spending real money (ETH).
-   **Ethers.js**: A library that lets the frontend talk to the blockchain.
-   **MetaMask**: A browser wallet that lets you sign transactions (prove you are who you say you are).

---

## 🛠 Prerequisites

Before starting, ensure you have:
1.  **Node.js**: Installed on your computer.
2.  **MetaMask Extension**: Installed in your browser (Chrome/Brave/Edge).

---

## 🏁 Getting Started (Step-by-Step)

Follow these steps exactly to run the project.

### 1. Installation
Open a terminal in the project folder and install the dependencies:
```bash
npm install
```
*This downloads all the necessary code libraries.*

### 2. Running the Application
To run a full blockchain app locally, you need **3 separate terminals** running at the same time.

#### Terminal 1: The Blockchain (The "Server")
This starts your personal local blockchain.
```bash
npx hardhat node
```
**What happens:**
-   It starts a blockchain on your computer at `http://127.0.0.1:8545`.
-   It gives you **20 Test Accounts** loaded with 10,000 fake ETH each.
-   **Keep this terminal OPEN.** If you close it, the blockchain stops.

#### Terminal 2: Deployment (Putting code on chain)
We need to put our Smart Contract onto the blockchain we just started.
Open a **new** terminal (Terminal 2) and run:
```bash
npx hardhat run scripts/deploy.cjs --network localhost
```
**What happens:**
-   It compiles the `Voting.sol` contract.
-   It "uploads" it to your local blockchain.
-   It prints an **Address** (e.g., `0x5FbDB...`).
-   *Note: This address is automatically saved to your settings, so the frontend knows where to look.*

#### Terminal 3: The Frontend (The "Website")
Now we start the website interface.
Open a **new** terminal (Terminal 3) and run:
```bash
npm run dev
```
**What happens:**
-   It starts the website at `http://localhost:3000`.

---

## 🎮 How to Use the App

### Step 1: Configure MetaMask
Since we are using a "Fake" local blockchain, we need to tell MetaMask to look at it.
1.  Open MetaMask.
2.  Add a Network:
    -   **Network Name**: Localhost 8545
    -   **RPC URL**: `http://127.0.0.1:8545`
    -   **Chain ID**: `1337`
    -   **Currency**: `ETH`
3.  **Import Accounts**:
    -   Go to **Terminal 1**. Copy the "Private Key" of Account #0.
    -   In MetaMask -> Click Icon -> **Import Account** -> Paste Key.
    -   *This Account #0 is the "Organizer" (Admin).*

### Step 2: The Organizer (Admin)
1.  Connect MetaMask using **Account #0**.
2.  Go to **Candidate Registration**: Register a candidate (Name, Age, Address, Image).
    -   *You will pay a small gas fee (fake ETH).*
3.  Go to **Voter Registration**: Register a voter (Name, Address, Image).
    -   *You can use Account #1's address from Terminal 1 as a "Voter".*

### Step 3: The Voter
1.  Switch MetaMask to **Account #1** (The one you just registered).
2.  Refresh the page.
3.  You will see the list of Candidates.
4.  Click **"Give Vote"**.
5.  Confirm the transaction.
6.  You will see the vote count increase!

---

## ❓ Troubleshooting

### "Nonce too high" or Transaction Errors
**Effect**: Transactions fail immediately or get stuck.
**Cause**: You restarted `npx hardhat node`. This resets the blockchain to zero, but MetaMask remembers the "old" history. They are out of sync.
**Fix**:
1.  Open MetaMask.
2.  Settings -> Advanced -> **Clear activity tab data**.
3.  This resets MetaMask's memory of the local chain. **Do this every time you restart Terminal 1.**

### "0 ETH Balance"
**Effect**: MetaMask shows 0 ETH even though you have 10,000.
**Cause**: Visual glitch in MetaMask.
**Fix**: Switch network to "Mainnet" and then back to "Localhost 8545". The balance will appear.

### "Only Organizer can..."
**Effect**: You cannot register people.
**Cause**: You are not connected with Account #0.
**Fix**: Switch MetaMask to the exact account that deployed the contract (Account #0).

---

## 📂 Project Structure

-   **`/contracts`**: valid Solidity code (`Voting.sol`).
-   **`/scripts`**: Scripts to deploy contracts (`deploy.cjs`).
-   **`/pages`**: Next.js pages (Home, VoterList, etc.).
-   **`/context`**: Logic connecting the Frontend to Blockchain (`Voter.js`).
-   **`/components`**: Reusable UI parts (Card, Button, NavBar).
