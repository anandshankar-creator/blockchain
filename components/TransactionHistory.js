import React, { useState, useEffect, useContext } from 'react';
import { VotingContext } from '../context/Voter';
import styles from '../styles/TransactionHistory.module.css';

const TransactionHistory = () => {
    const { getTransactionHistory, currentAccount, adminAddress } = useContext(VotingContext);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    const isAdmin = currentAccount && adminAddress && currentAccount.toLowerCase() === adminAddress.toLowerCase();

    useEffect(() => {
        const fetchTxs = async () => {
            setLoading(true);
            const history = await getTransactionHistory();
            if (history) setTransactions(history);
            setLoading(false);
        };
        fetchTxs();
    }, [getTransactionHistory]);

    const filteredTransactions = isAdmin
        ? transactions
        : transactions.filter(tx =>
            currentAccount &&
            tx.action === "Vote Cast" &&
            tx.details.toLowerCase().includes(currentAccount.toLowerCase())
        );

    return (
        <div className={styles.container}>
            <h2>{isAdmin ? "Global Transaction History" : "My Transaction History"}</h2>
            {loading ? (
                <p>Loading transactions...</p>
            ) : filteredTransactions.length === 0 ? (
                <p>No transactions found.</p>
            ) : (
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Action</th>
                            <th>Details</th>
                            <th>Tx Hash</th>
                            <th>Block Number</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTransactions.map((tx, idx) => {
                            const isMyTx = currentAccount && tx.details.toLowerCase().includes(currentAccount.toLowerCase());
                            return (
                                <tr key={idx} style={isMyTx ? { backgroundColor: "#1e3a8a" } : {}}>
                                    <td>{tx.action} {isMyTx && "⭐"}</td>
                                    <td>{tx.details}</td>
                                    <td>
                                        <a
                                            href={`https://sepolia.etherscan.io/tx/${tx.txHash}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            {tx.txHash.substring(0, 10)}...
                                        </a>
                                    </td>
                                    <td>{tx.blockNumber}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default TransactionHistory;
