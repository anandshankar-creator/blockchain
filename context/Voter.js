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
    const [isRequesting, setIsRequesting] = useState(false); // New lock state

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
        if (isRequesting) return;
        try {
            if (!sdk) return setError("Initializing MetaMask...");
            const ethereum = sdk.getProvider();

            setIsRequesting(true);
            setError("Opening MetaMask...");

            // Request accounts
            const accounts = await ethereum.request({ method: "eth_requestAccounts" });
            if (accounts && accounts.length) {
                setCurrentAccount(accounts[0]);
                setError("");
                // Ensure switched to Sepolia
                await switchNetwork();
            }
            setIsRequesting(false);
        } catch (error) {
            console.log("Error connecting wallet:", error);
            setError("Connection failed. Please open MetaMask.");
            setIsRequesting(false);
        }
    };

    const disconnectWallet = () => {
        if (sdk) {
            sdk.terminate();
        }
        setCurrentAccount("");
        window.location.reload();
    };

    const switchNetwork = async () => {
        if (isRequesting) return; // LOCK to prevent 'already pending'
        try {
            if (!sdk) return;
            const ethereum = sdk.getProvider();
            if (!ethereum) return;

            const targetChainId = "0xaa36a7";
            const targetChainIdDecimal = 11155111;

            const currentChainId = await ethereum.request({ method: 'eth_chainId' });
            if (parseInt(currentChainId, 16) === targetChainIdDecimal) {
                return;
            }

            console.log("Switching to Sepolia logic started...");
            setIsRequesting(true);
            setIsLoading(true);
            setError("Open MetaMask to switch network...");

            try {
                await ethereum.request({
                    method: "wallet_switchEthereumChain",
                    params: [{ chainId: targetChainId }],
                });
            } catch (switchError) {
                if (switchError.code === 4902) {
                    await ethereum.request({
                        method: "wallet_addEthereumChain",
                        params: [
                            {
                                chainId: targetChainId,
                                chainName: "Sepolia Test Network",
                                rpcUrls: ["https://ethereum-sepolia-rpc.publicnode.com"],
                                nativeCurrency: { name: "Sepolia ETH", symbol: "ETH", decimals: 18 },
                                blockExplorerUrls: ["https://sepolia.etherscan.io"],
                            },
                        ],
                    });
                } else if (switchError.code === -32002) {
                    setError("MetaMask is busy. Please open it manually.");
                    setIsRequesting(false);
                    setIsLoading(false);
                    return;
                } else {
                    throw switchError;
                }
            }

            let attempts = 0;
            const maxAttempts = 15;
            while (attempts < maxAttempts) {
                console.log(`Syncing mobile network... attempt ${attempts + 1}/${maxAttempts}`);
                const refreshedChainId = await ethereum.request({ method: 'eth_chainId' });

                if (parseInt(refreshedChainId, 16) === targetChainIdDecimal) {
                    console.log("Network sync confirmed!");
                    setError("");
                    await new Promise(r => setTimeout(r, 1000));
                    setIsRequesting(false);
                    return;
                }
                attempts++;
                setError(`Synchronizing network (${attempts}/${maxAttempts})...`);
                await new Promise(r => setTimeout(r, 1200));
            }

            setError("Network switch timed out. Please refresh page.");
            setIsRequesting(false);
        } catch (error) {
            console.error("Error in switchNetwork:", error);
            setError(error.message || "Network switch failed");
            setIsRequesting(false);
            setIsLoading(false);
            throw error;
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
            await switchNetwork();
            const provider = getProvider();

            // Verify network
            const network = await provider.getNetwork();
            const chainIdRpc = await sdk.getProvider().request({ method: 'eth_chainId' });
            const isSepolia = (network.chainId === 11155111n) || (chainIdRpc === "0xaa36a7");
            if (!isSepolia) throw new Error("Please switch to Sepolia network and try again.");

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
            await switchNetwork();
            const provider = getProvider();

            // Verify network
            const network = await provider.getNetwork();
            const chainIdRpc = await sdk.getProvider().request({ method: 'eth_chainId' });
            const isSepolia = (network.chainId === 11155111n) || (chainIdRpc === "0xaa36a7");
            if (!isSepolia) throw new Error("Please switch to Sepolia network and try again.");

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
            setIsLoading(true);
            setError("");
            console.log("Voting for:", id);

            await switchNetwork();
            const provider = getProvider();

            // Verify we are actually on Sepolia (0xaa36a7)
            // On mobile, provider.getNetwork() can sometimes be stale, so we double-check via RPC
            // Verify and Force Update Provider
            let currentChainId = await sdk.getProvider().request({ method: 'eth_chainId' });
            let isSepolia = (parseInt(currentChainId, 16) === 11155111);

            if (!isSepolia) {
                setError("Network mismatch. Retrying sync...");
                await new Promise(r => setTimeout(r, 2000));
                currentChainId = await sdk.getProvider().request({ method: 'eth_chainId' });
                isSepolia = (parseInt(currentChainId, 16) === 11155111);

                if (!isSepolia) {
                    throw new Error("Mobile provider is still not seeing Sepolia. Please briefly open MetaMask and switch manually.");
                }
            }

            // Create fresh provider for signing
            const browserProvider = new ethers.BrowserProvider(sdk.getProvider());
            const signer = await browserProvider.getSigner();
            const userAddress = await signer.getAddress();
            const network = await browserProvider.getNetwork();

            console.log("Preparing Gasless Vote...");

            const forwarder = new ethers.Contract(ForwarderAddress, ForwarderABI, provider);
            const nonce = await forwarder.nonces(userAddress);

            const votingInterface = new ethers.Interface(VotingAddressABI);

            const candidateAddress = id._address || id.address;
            const candidateId = id.candidateId || id.id;

            const functionData = votingInterface.encodeFunctionData("giveVote", [candidateAddress, candidateId]);

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

            // Capture signature (this pops up MetaMask)
            let signature;
            try {
                signature = await signer.signTypedData(domain, types, req);
            } catch (sigError) {
                if (sigError.code === -32002 || (sigError.message && sigError.message.includes("-32002"))) {
                    throw new Error("A signature request is already pending in MetaMask. Please open your MetaMask app and confirm it.");
                }
                throw sigError;
            }

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
                throw new Error(result.message || result.error || "Relay Failed");
            }

            console.log("Vote Pushed! TX:", result.txHash);

            // 1. Show processing state
            setError("Broadcast successful! Locking your vote into the blockchain...");

            // 2. WAIT FOR TRUE CONFIRMATION
            const receipt = await provider.waitForTransaction(result.txHash);

            if (receipt.status === 0) {
                throw new Error("Blockchain execution failed. Vote not counted.");
            }

            alert("✓ Success! Your vote is officially recorded on the blockchain.");
            window.location.reload();

        } catch (error) {
            console.log("Voting Error:", error.message);
            setError(error.message);
            alert("Voting Error: " + error.message);
        } finally {
            setIsLoading(false);
        }
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
        if (!sdk) return;
        const ethereum = sdk.getProvider();
        if (!ethereum) return;

        const handleAccountChanged = (accounts) => {
            if (accounts.length > 0) {
                setCurrentAccount(accounts[0]);
            } else {
                setCurrentAccount("");
            }
        };

        const handleChainChanged = (chainId) => {
            console.log("Chain changed to:", chainId);
            // DO NOT reload here, as it breaks the flow on mobile network switching.
            // Modern ethers/web3 providers handle this without a full reload.
            // If we absolutely must reload, we should only do it if NOT in a loading state.
        };

        ethereum.on("accountsChanged", handleAccountChanged);
        ethereum.on("chainChanged", handleChainChanged);

        try {
            getNewCandidate();
            getAllVoterData();
            checkIfWalletIsConnected();
        } catch (error) {
            console.log("Error in Initial Data Fetch:", error)
        }

        return () => {
            if (ethereum.removeListener) {
                ethereum.removeListener("accountsChanged", handleAccountChanged);
                ethereum.removeListener("chainChanged", handleChainChanged);
            }
        };
    }, [sdk]);

    return (
        <VotingContext.Provider
            value={{
                checkIfWalletIsConnected,
                connectWallet,
                disconnectWallet,
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
