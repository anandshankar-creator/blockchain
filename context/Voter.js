import React, { useState, useEffect } from 'react';
import { ethers } from "ethers";
import { useRouter } from "next/router";
import { VotingAddress, VotingAddressABI, ForwarderAddress, ForwarderABI } from "./constants";
import { MetaMaskSDK } from '@metamask/sdk';

export const VotingContext = React.createContext();

export const VotingProvider = ({ children }) => {
    const [currentAccount, setCurrentAccount] = useState("");
    const [candidateArray, setCandidateArray] = useState([]);
    const [candidateLength, setCandidateLength] = useState("");
    const [error, setError] = useState("");
    const [voterArray, setVoterArray] = useState([]);
    const [voterLength, setVoterLength] = useState("");
    const [voterAddress, setVoterAddress] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [sdk, setSdk] = useState(null);

    const router = useRouter();

    // Initialize MetaMask SDK for mobile deep linking
    useEffect(() => {
        if (typeof window !== "undefined") {
            const mmsdk = new MetaMaskSDK({
                dappMetadata: {
                    name: "Decentralized Voting DApp",
                    url: window.location.origin,
                },
                // Set to true to see more details in console if debugging
                debug: false
            });
            setSdk(mmsdk);
        }
    }, []);

    const RPC_URL = "https://ethereum-sepolia-rpc.publicnode.com"; // More stable public RPC

    const fetchContract = (signerOrProvider) => new ethers.Contract(VotingAddress, VotingAddressABI, signerOrProvider);

    const getProvider = () => {
        if (!sdk) throw new Error("MetaMask SDK not initialized");
        const ethereum = sdk.getProvider();
        return new ethers.BrowserProvider(ethereum);
    };

    const checkIfWalletIsConnected = async () => {
        try {
            if (!sdk) return;
            const ethereum = sdk.getProvider();
            const accounts = await ethereum.request({ method: "eth_accounts" });
            if (accounts && accounts.length) {
                setCurrentAccount(accounts[0]);
            }
        } catch (error) {
            console.log("Error checking connection:", error);
        }
    };

    const connectWallet = async () => {
        try {
            if (!sdk) return setError("Initializing MetaMask...");
            const ethereum = sdk.getProvider();
            const accounts = await ethereum.request({ method: "eth_requestAccounts" });
            if (accounts && accounts.length) {
                setCurrentAccount(accounts[0]);
            }
        } catch (error) {
            console.log("Error connecting wallet:", error);
            setError("Connection failed");
        }
    };

    // IMAGE COMPRESSION (To avoid IPFS keys for demo)
    const compressImage = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    const MAX_WIDTH = 200;
                    const MAX_HEIGHT = 200;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    ctx.drawImage(img, 0, 0, width, height);

                    const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                    resolve(dataUrl);
                };
                img.onerror = (err) => reject(err);
            };
            reader.onerror = (err) => reject(err);
        });
    };

    const uploadToIPFS = async (file) => {
        try {
            const dataUrl = await compressImage(file);
            return dataUrl;
        } catch (error) {
            console.error("Error formatting image", error);
            setError("Error Uploading Image");
        }
    };

    const uploadToIPFSCandidate = async (file) => {
        try {
            const dataUrl = await compressImage(file);
            return dataUrl;
        } catch (error) {
            console.error("Error formatting image", error);
            setError("Error Uploading Image");
        }
    };

    // DATA FETCHING
    const getNewCandidate = async () => {
        setIsLoading(true);
        setError("");
        try {
            const provider = new ethers.JsonRpcProvider(RPC_URL);
            const contract = new ethers.Contract(VotingAddress, VotingAddressABI, provider);

            const allCandidate = await contract.getCandidate();
            console.log("Fetched raw candidates:", allCandidate);

            const data = [];
            for (const el of allCandidate) {
                try {
                    const singleData = await contract.getCandidateData(el);
                    data.push(singleData);
                } catch (err) {
                    console.error("Error fetching data for candidate:", el, err);
                }
            }

            const formattedData = data.map(item => {
                let imageUrl = item[3];
                if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('ipfs')) {
                    if (imageUrl.startsWith('Qm')) {
                        imageUrl = `https://gateway.pinata.cloud/ipfs/${imageUrl}`;
                    }
                }

                return {
                    age: item[0],
                    name: item[1],
                    candidateId: item[2].toString(),
                    image: imageUrl,
                    voteCount: item[4].toString(),
                    ipfs: item[5],
                    _address: item[6]
                };
            });

            console.log("Formatted candidate data:", formattedData);
            setCandidateArray(formattedData);
            setCandidateLength(allCandidate.length);
        } catch (error) {
            console.log("Error fetching candidates", error);
            setError("Failed to load candidates. Please refresh.");
        }
        setIsLoading(false);
    };

    const getAllVoterData = async () => {
        setIsLoading(true);
        try {
            const provider = new ethers.JsonRpcProvider(RPC_URL);
            const contract = new ethers.Contract(VotingAddress, VotingAddressABI, provider);

            const voterListData = await contract.getVoterList();
            console.log("Fetched raw voter list:", voterListData);
            setVoterAddress(voterListData);
            setVoterLength(voterListData.length);

            const allVoters = [];
            for (const el of voterListData) {
                try {
                    const singleVoterData = await contract.getVoterData(el);

                    let imageUrl = singleVoterData[2];
                    if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('ipfs')) {
                        if (imageUrl.startsWith('Qm')) {
                            imageUrl = `https://gateway.pinata.cloud/ipfs/${imageUrl}`;
                        }
                    }

                    allVoters.push({
                        id: singleVoterData[0].toString(),
                        name: singleVoterData[1],
                        image: imageUrl,
                        address: singleVoterData[3],
                        ipfs: singleVoterData[4],
                        voted: singleVoterData[5],
                        allowed: singleVoterData[6].toString()
                    });
                } catch (err) {
                    console.error("Error fetching data for voter:", el, err);
                }
            }

            console.log("Formatted voter data:", allVoters);
            setVoterArray(allVoters);
        } catch (error) {
            console.log("Error fetching voters", error);
        }
        setIsLoading(false);
    };

    // OPERATIONS
    const setCandidate = async (candidateForm, fileUrl, router) => {
        const { name, address, age } = candidateForm;
        if (!name || !address || !age || !fileUrl) return setError("Missing Inputs");
        setError("");

        try {
            const provider = getProvider();
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
        setError("");

        try {
            const provider = getProvider();
            const signer = await provider.getSigner();
            const contract = fetchContract(signer);

            const tx = await contract.setVoter(address, name, fileUrl, fileUrl);
            await tx.wait();

            router.push('/voterList');
        } catch (error) {
            setError("Error Creating Voter");
        }
    };

    const giveVote = async (id) => {
        try {
            console.log("Voting for:", id);

            const provider = getProvider();
            const signer = await provider.getSigner();
            const userAddress = await signer.getAddress();

            console.log("Preparing Gasless Vote...");

            const forwarder = new ethers.Contract(ForwarderAddress, ForwarderABI, provider);
            const nonce = await forwarder.nonces(userAddress);

            const votingInterface = new ethers.Interface(VotingAddressABI);

            const candidateAddress = id._address || id.address;
            const candidateId = id.candidateId || id.id;

            const functionData = votingInterface.encodeFunctionData("giveVote", [candidateAddress, candidateId]);

            const network = await provider.getNetwork();
            const chainId = network.chainId;

            const domain = {
                name: "VotingForwarder",
                version: "1",
                chainId: Number(chainId),
                verifyingContract: ForwarderAddress
            };

            const types = {
                ForwardRequest: [
                    { name: 'from', type: 'address' },
                    { name: 'to', type: 'address' },
                    { name: 'value', type: 'uint256' },
                    { name: 'gas', type: 'uint256' },
                    { name: 'nonce', type: 'uint256' },
                    { name: 'deadline', type: 'uint48' },
                    { name: 'data', type: 'bytes' }
                ]
            };

            const req = {
                from: userAddress,
                to: VotingAddress,
                value: 0,
                gas: 500000,
                nonce: Number(nonce),
                deadline: Math.floor(Date.now() / 1000) + 3600,
                data: functionData
            };

            const signature = await signer.signTypedData(domain, types, req);

            const serializedReq = {
                ...req,
                value: req.value.toString(),
                gas: req.gas.toString(),
                nonce: req.nonce.toString()
            };

            const response = await fetch('/api/relay', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    request: serializedReq,
                    signature: signature
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Relay Request Failed");
            }

            console.log("Voted successfully! Tx Hash:", result.txHash);
            alert("Voted Successfully (Gas Paid by Relayer)!");
            router.push('/voterList');

        } catch (error) {
            console.log("Voting Error:", error);
            alert("Voting Failed: " + (error.reason || error.message));
        };
    };

    const resetElection = async () => {
        try {
            const provider = getProvider();
            const signer = await provider.getSigner();
            const contract = fetchContract(signer);

            const tx = await contract.resetElection();
            await tx.wait();

            alert("Election Reset Successfully!");
            window.location.reload();
        } catch (error) {
            console.error("Error resetting election", error);
            alert("Error: " + (error.reason || error.message));
        }
    };

    useEffect(() => {
        try {
            getNewCandidate();
            getAllVoterData();
            checkIfWalletIsConnected();
        } catch (error) {
            console.log("Error in Initial Data Fetch:", error)
        }
    }, [sdk]); // Re-run check when SDK is ready

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
                resetElection,
                currentAccount,
                candidateArray,
                error,
                getAllVoterData,
                voterArray,
                voterLength,
                voterAddress,
                isLoading
            }}
        >
            {children}
        </VotingContext.Provider>
    );
};
