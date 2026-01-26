import React from 'react';
import styles from '../styles/Card.module.css';

const Card = ({ image, name, role, address, handleClick, voteCount, showVoteBtn }) => (
    <div className={styles.card}>
        <div className={styles.imageBox}>
            <img src={image} alt={name} className={styles.image} />
        </div>
        <div className={styles.cardData}>
            <h3>{name}</h3>
            <p>{role}</p>
            {typeof voteCount !== 'undefined' && (
                <p>Total Votes: <span style={{ fontWeight: 'bold', color: '#9b1fe9' }}>{voteCount}</span></p>
            )}
            <p>Address: <span className={styles.address}>{address.slice(0, 10)}...</span></p>

            {showVoteBtn === true && (
                <button
                    onClick={handleClick}
                    style={{
                        marginTop: '1rem',
                        padding: '10px 20px',
                        backgroundColor: '#9b1fe9',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}
                >
                    Give Vote
                </button>
            )}
        </div>
    </div>
);

export default Card;
