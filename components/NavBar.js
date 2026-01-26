import React, { useState, useContext } from 'react';
import Link from 'next/link';
import { VotingContext } from '../context/Voter';
import styles from '../styles/NavBar.module.css';

const NavBar = () => {
    const { connectWallet, error, currentAccount } = useContext(VotingContext);

    return (
        <div className={styles.navbar}>
            <div className={styles.navbar_box}>
                <div className={styles.title}>
                    <Link href={{ pathname: '/' }}>
                        <h1>Voting DApp</h1>
                    </Link>
                </div>

                <div className={styles.menu}>
                    <Link href={{ pathname: '/' }} className={styles.link}>Home</Link>
                    <Link href={{ pathname: 'candidateRegistration' }} className={styles.link}>Candidate Registration</Link>
                    <Link href={{ pathname: 'allowVoter' }} className={styles.link}>Voter Registration</Link>
                    <Link href={{ pathname: 'voterList' }} className={styles.link}>Voter List</Link>
                </div>

                <div className={styles.connect}>
                    {currentAccount ? (
                        <div className={styles.connected}>{currentAccount.slice(0, 15)}...</div>
                    ) : (
                        <button onClick={() => connectWallet()} className={styles.button}>Connect Wallet</button>
                    )}
                </div>
            </div>
            {error && <div className={styles.error}>{error}</div>}
        </div>
    );
};

export default NavBar;
