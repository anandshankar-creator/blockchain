import React, { useState, useEffect } from 'react';
import Web3Modal from "web3modal";
import { ethers } from "ethers";
import { create as ipfsHttpClient } from "ipfs-http-client";
import { useRouter } from "next/router";
import { VotingAddress, VotingAddressABI } from "./constants";

// Mock IPFS for now to function without keys
const client = {
    add: async (file) => {
        console.log("Mock IPFS Upload:", file);
        return { path: "QmTestPath" };
    }
};

const fetchContract = (signerOrProvider) =>
    new ethers.Contract(VotingAddress, VotingAddressABI, signerOrProvider);

export const VotingContext = React.createContext();

export const VotingProvider = ({ children }) => {
    const router = useRouter();
    const [currentAccount, setCurrentAccount] = useState('');
    const [candidateLength, setCandidateLength] = useState('');
    const [pushedCandidate, setPushedCandidate] = useState([]);
    const [candidateArray, setCandidateArray] = useState([]);

    const [error, setError] = useState('');
    const [voterArray, setVoterArray] = useState([]);
    const [voterLength, setVoterLength] = useState('');
    const [voterAddress, setVoterAddress] = useState([]);

    // CONNECT WALLET
    const checkIfWalletIsConnected = async () => {
        if (!window.ethereum) return setError("Please Install MetaMask");
        const account = await window.ethereum.request({ method: "eth_accounts" });
        if (account.length) {
            setCurrentAccount(account[0]);
        } else {
            setError("Please Install MetaMask & Connect, Reload");
        }
    };

    const connectWallet = async () => {
        if (!window.ethereum) return setError("Please Install MetaMask");
        const account = await window.ethereum.request({ method: "eth_requestAccounts" });
        setCurrentAccount(account[0]);
    };

    // UPLOAD TO IPFS
    const uploadToIPFS = async (file) => {
        try {
            const url = "https://via.placeholder.com/150"; // Use placeholder for local test
            return url;
        } catch (error) {
            setError("Error Uploading to IPFS");
            console.log("Error Uploading to IPFS", error);
        }
    };

    const uploadToIPFSCandidate = async (file) => {
        try {
            // const added = await client.add({ content: file });
            const url = "https://via.placeholder.com/150"; // Use placeholder for local test
            return url;
        } catch (error) {
            setError("Error Uploading to IPFS");
            console.log("Error Uploading to IPFS", error);
        }
    };


    // DATA FETCHING
    const getNewCandidate = async () => {
        try {
            const web3ModalInstance = new (Web3Modal.default || Web3Modal)();
            const connection = await web3ModalInstance.connect();
            const provider = new ethers.BrowserProvider(connection);
            const signer = await provider.getSigner();
            const contract = fetchContract(signer);

            const allCandidate = await contract.getCandidate();
            console.log("Raw Candidate Addresses:", allCandidate);

            const data = await Promise.all(allCandidate.map(async (el) => {
                const singleCandidateData = await contract.getCandidateData(el);
                console.log("Single Candidate Data:", singleCandidateData);
                return singleCandidateData;
            }));

            // Format data if Struct is returned as array/object
            const formattedData = data.map(item => ({
                age: item[0],
                name: item[1],
                candidateId: item[2].toString(),
                image: item[3],
                voteCount: item[4].toString(),
                ipfs: item[5],
                _address: item[6]
            }));

            setCandidateArray(formattedData);
            setCandidateLength(allCandidate.length);
        } catch (error) {
            console.log("Error fetching candidates", error);
        }
    };

    const getAllVoterData = async () => {
        try {
            const web3ModalInstance = new (Web3Modal.default || Web3Modal)();
            const connection = await web3ModalInstance.connect();
            const provider = new ethers.BrowserProvider(connection);
            const signer = await provider.getSigner();
            const contract = fetchContract(signer);

            // Get list of voter addresses
            const voterListData = await contract.getVoterList();
            setVoterAddress(voterListData);
            setVoterLength(voterListData.length);
            console.log(voterListData);

            // Fetch detail for each voter
            const allVoters = await Promise.all(voterListData.map(async (el) => {
                const singleVoterData = await contract.getVoterData(el);
                // Struct logic: [voter_voterId, voter_name, voter_image, voter_address, voter_ipfs, voter_voted, voter_allowed]
                return {
                    id: singleVoterData[0].toString(),
                    name: singleVoterData[1],
                    image: singleVoterData[2],
                    address: singleVoterData[3],
                    ipfs: singleVoterData[4],
                    voted: singleVoterData[5],
                    allowed: singleVoterData[6].toString()
                }
            }));

            setVoterArray(allVoters);
        } catch (error) {
            console.log("Error fetching voters", error);
        }
    };

    // OPERATIONS
    const setCandidate = async (candidateForm, fileUrl, router) => {
        const { name, address, age } = candidateForm;
        if (!name || !address || !age || !fileUrl) return setError("Missing Inputs");
        if (!ethers.isAddress(address)) return setError("Invalid Address Format: Please use a valid Ethereum address");
        setError("");

        try {
            const web3ModalInstance = new (Web3Modal.default || Web3Modal)();
            const connection = await web3ModalInstance.connect();
            const provider = new ethers.BrowserProvider(connection);
            const signer = await provider.getSigner();
            const contract = fetchContract(signer);

            const tx = await contract.setCandidate(address, age, name, fileUrl, fileUrl);
            await tx.wait();

            router.push('/');
        } catch (error) {
            console.log("Error details:", error);
            setError(`Error Creating Candidate: ${error.reason || error.message || "Unknown error"}`);
        }
    };

    const createVoter = async (formInput, fileUrl, router) => {
        const { name, address, position } = formInput;
        if (!name || !address || !position || !fileUrl) return setError("Missing Inputs");
        if (!ethers.isAddress(address)) return setError("Invalid Address Format: Please use a valid Ethereum address");
        setError("");

        try {
            const web3ModalInstance = new (Web3Modal.default || Web3Modal)();
            const connection = await web3ModalInstance.connect();
            const provider = new ethers.BrowserProvider(connection);
            const signer = await provider.getSigner();
            const contract = fetchContract(signer);

            const tx = await contract.setVoter(address, name, fileUrl, fileUrl);
            await tx.wait();

            router.push('/voterList');
        } catch (error) {
            setError("Error Creating Voter");
            console.log(error);
        }
    };

    const giveVote = async (id) => {
        try {
            console.log("Voting for:", id);
            // alert("Attempting to vote for: " + id.address); // Debug alert

            const web3ModalInstance = new (Web3Modal.default || Web3Modal)();
            const connection = await web3ModalInstance.connect();
            const provider = new ethers.BrowserProvider(connection);
            const signer = await provider.getSigner();
            const contract = fetchContract(signer);

            console.log("Contract fetched. Sending transaction...");
            const tx = await contract.giveVote(id.address, id.id);
            console.log("Transaction sent:", tx);
            await tx.wait();

            console.log("Voted successfully!");
            alert("Voted Successfully!");
            router.push('/voterList');
        } catch (error) {
            console.log("Voting Error:", error);
            alert("Voting Failed: " + (error.reason || error.message));
        }
    };

    return (
        <VotingContext.Provider
            value={{
                checkIfWalletIsConnected,
                connectWallet,
                uploadToIPFS,
                uploadToIPFSCandidate,
                setCandidate,
                createVoter,
                getNewCandidate,
                giveVote,
                currentAccount,
                candidateArray,
                error,
                getAllVoterData,
                voterArray,
                voterLength,
                voterAddress
            }}
        >
            {children}
        </VotingContext.Provider>
    );
};
