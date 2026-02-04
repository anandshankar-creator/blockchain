import React, { useState, useContext } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { VotingContext } from '../context/Voter';
import styles from '../styles/NavBar.module.css';

const NavBar = () => {
    const { connectWallet, error, currentAccount, resetElection } = useContext(VotingContext);
    const router = useRouter();

    const isActive = (path) => router.pathname === path ? styles.active : '';
    const isActiveLink = (path) => router.pathname === path ? styles.activeLink : '';

    return (
        <>
            {/* Top Desktop / Mobile Header */}
            <div className={styles.navbar}>
                <div className={styles.navbar_box}>
                    <div className={styles.title}>
                        <Link href={{ pathname: '/' }}>
                            <h1>Voting DApp</h1>
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className={styles.menu}>
                        <Link href={{ pathname: '/' }}>
                            <a className={`${styles.link} ${isActiveLink('/')}`}>Home</a>
                        </Link>
                        <Link href={{ pathname: 'candidateRegistration' }}>
                            <a className={`${styles.link} ${isActiveLink('/candidateRegistration')}`}>Candidate Registration</a>
                        </Link>
                        <Link href={{ pathname: 'allowVoter' }}>
                            <a className={`${styles.link} ${isActiveLink('/allowVoter')}`}>Voter Registration</a>
                        </Link>
                        <Link href={{ pathname: 'voterList' }}>
                            <a className={`${styles.link} ${isActiveLink('/voterList')}`}>Voter List</a>
                        </Link>
                        {/* Admin Reset Button (For Demo Purposes) */}
                        <div className={styles.link} onClick={() => {
                            if (confirm("Are you sure you want to RESET the election? This deletes all candidates and voters.")) {
                                resetElection();
                            }
                        }} style={{ cursor: 'pointer', color: 'red' }}>
                            Reset
                        </div>
                    </div>

                    {/* Connect Wallet Button (Visible on both, but positioned differently via CSS) */}
                    <div className={styles.connect}>
                        {currentAccount ? (
                            <div className={styles.connected}>
                                {currentAccount.slice(0, 6)}...{currentAccount.slice(-4)}
                            </div>
                        ) : (
                            <button onClick={() => connectWallet()} className={styles.button}>Connect</button>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Bottom Navigation */}
            <div className={styles.mobileBottomNav}>
                <Link href="/">
                    <div className={`${styles.navItem} ${isActive('/')}`}>
                        <svg viewBox="0 0 24 24">
                            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                        </svg>
                        <span>Home</span>
                    </div>
                </Link>

                <Link href="/candidateRegistration">
                    <div className={`${styles.navItem} ${isActive('/candidateRegistration')}`}>
                        <svg viewBox="0 0 24 24">
                            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                        </svg>
                        <span>Register</span>
                    </div>
                </Link>

                <Link href="/allowVoter">
                    <div className={`${styles.navItem} ${isActive('/allowVoter')}`}>
                        <svg viewBox="0 0 24 24">
                            <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                        <span>Add Voter</span>
                    </div>
                </Link>

                <Link href="/voterList">
                    <div className={`${styles.navItem} ${isActive('/voterList')}`}>
                        <svg viewBox="0 0 24 24">
                            <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                        </svg>
                        <span>Voters</span>
                    </div>
                </Link>

                <div className={styles.navItem} onClick={() => {
                    if (confirm("Are you sure you want to RESET the election? This deletes all candidates and voters.")) {
                        resetElection();
                    }
                }}>
                    <svg viewBox="0 0 24 24" fill="red">
                        <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
                    </svg>
                    <span style={{ color: 'red' }}>Reset</span>
                </div>
            </div>

            {error && <div className={styles.error}>{error}</div>}
        </>
    );
};

export default NavBar;


