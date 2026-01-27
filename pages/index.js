import React, { useState, useEffect, useContext } from 'react';
import Image from 'next/image';
import { VotingContext } from '../context/Voter';
import styles from '../styles/Home.module.css';
import Card from '../components/Card';
import NavBar from '../components/NavBar';

const Home = () => {
    const { getNewCandidate, candidateArray, giveVote, checkIfWalletIsConnected, candidateLength, currentAccount, isLoading } = useContext(VotingContext);

    useEffect(() => {
        checkIfWalletIsConnected();
        getNewCandidate();
    }, []);

    return (
        <div className={styles.home}>
            <NavBar />
            <div className={styles.header}>
                <div className={styles.header_content}>
                    <h1>Welcome to Decentralized Voting</h1>
                    <p>Your vote matters. Secure, Transparent, and Immutable.</p>
                </div>
            </div>

            <div className={styles.container}>
                {isLoading ? (
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
                                role={el.age} // Using age as role/description placeholder based on contract struct
                                address={el._address}
                                voteCount={el.voteCount}
                                showVoteBtn={true}
                                handleClick={() => giveVote({ id: el.candidateId, address: el._address })}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;
