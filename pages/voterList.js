import React, { useState, useEffect, useContext } from 'react';
import { VotingContext } from '../context/Voter';
import styles from '../styles/VoterList.module.css';
import NavBar from '../components/NavBar';
import Card from '../components/Card';

const VoterList = () => {
    const { getAllVoterData, voterArray, currentAccount, adminAddress } = useContext(VotingContext);

    const isAdmin = currentAccount && adminAddress && currentAccount.toLowerCase() === adminAddress.toLowerCase();

    useEffect(() => {
        getAllVoterData();
    }, []);

    return (
        <div className={styles.voterList}>
            <NavBar />
            <div className={styles.voterList__container}>
                <div className={styles.voterList__header}>
                    <h1>Registered Voters</h1>
                </div>
                {isAdmin ? (
                    <div className={styles.voterList__list}>
                        {voterArray.map((el, i) => (
                            <Card
                                key={i}
                                image={el.image}
                                name={el.name}
                                role={"Voter"}
                                address={el.address}
                                handleClick={() => { }}
                            />
                        ))}
                    </div>
                ) : (
                    <p style={{ textAlign: "center", color: "red", marginTop: "2rem" }}>
                        Access Denied: Only Admin can view the voter list.
                    </p>
                )}
            </div>
        </div>
    );
};

export default VoterList;
