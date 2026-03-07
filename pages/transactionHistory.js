import React, { useContext, useEffect } from "react";
import NavBar from "../components/NavBar";
import TransactionHistory from "../components/TransactionHistory";
import styles from "../styles/Home.module.css";
import { VotingContext } from "../context/Voter";

const TransactionHistoryPage = () => {
    const { checkIfWalletIsConnected } = useContext(VotingContext);

    useEffect(() => {
        checkIfWalletIsConnected();
    }, []);

    return (
        <div className={styles.home}>
            <NavBar />
            <div className={styles.header}>
                <div className={styles.header_content}>
                    <h1>Transaction History</h1>
                    <p>Track all smart contract activities safely on Sepolia Testnet.</p>
                </div>
            </div>
            <div className={styles.container} style={{ marginTop: "2rem" }}>
                <TransactionHistory />
            </div>
        </div>
    );
};

export default TransactionHistoryPage;
