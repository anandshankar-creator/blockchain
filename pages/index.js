import React, { useState, useEffect, useContext } from 'react';
import Image from 'next/image';
import { VotingContext } from '../context/Voter';
import styles from '../styles/Home.module.css';
import Card from '../components/Card';
import NavBar from '../components/NavBar';

const Home = () => {
    const { getNewCandidate, candidateArray, giveVote, checkIfWalletIsConnected, currentAccount, adminAddress, isLoading } = useContext(VotingContext);

    const isAdmin = currentAccount && adminAddress && currentAccount.toLowerCase() === adminAddress.toLowerCase();

    useEffect(() => {
        checkIfWalletIsConnected();
        getNewCandidate();
    }, []);

    return (
        <div className={styles.home}>
            <NavBar />
            <div className={styles.header}>
                <div className={styles.header_content}>
                    <h1>{isAdmin ? "Admin Dashboard" : "Welcome to Decentralized Voting"}</h1>
                    <p>{isAdmin ? "Manage the election and voters securely." : "Your vote matters. Secure, Transparent, and Immutable."}</p>
                </div>
            </div>

            <div className={styles.container}>


                {!isAdmin && (
                    <div className={styles.header_content} style={{ marginTop: '1rem', marginBottom: '2rem' }}>
                        <h2>Voter Panel - Candidates</h2>
                    </div>
                )}

                {!isAdmin && isLoading ? (
                    <div className={styles.header_content} style={{ marginTop: '2rem' }}>
                        <h1>Loading Candidates...</h1>
                    </div>
                ) : (
                    <div className={styles.card_container}>
                        {candidateArray.map((el, i) => (
                            <Card
                                key={i + 1}
                                image={el.image}
                                name={el.name}
                                role={`Age: ${el.age}`} // Shows age explicitly
                                address={el._address}
                                voteCount={el.voteCount}
                                showVoteBtn={!isAdmin} // Only show if not admin, or we can keep it for admin to test
                                isLoading={isLoading}
                                handleClick={() => giveVote({ id: el.candidateId, address: el._address })}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div >
    );
};

export default Home;
