import React from 'react';
import styles from '../styles/Card.module.css';

const Card = ({ image, name, role, address, handleClick, voteCount, showVoteBtn, isLoading }) => {
    // Helper to resolve potential IPFS raw hashes or broken URLs
    // Helper to resolve potential IPFS raw hashes or broken URLs
    const resolveImage = (url) => {
        // Specific check for the "broken" imgur image that returns 200 OK but shows text art
        // This is necessary because Imgur redirects deleted images to a placeholder which triggers 'onLoad' not 'onError'
        if (!url || url === "undefined" || url === "null" || (url && url.includes("imgur.com"))) {
            return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=random&color=fff&size=200`;
        }

        if (url.startsWith('Qm')) return `https://gateway.pinata.cloud/ipfs/${url}`;
        if (url.startsWith('ipfs://')) return url.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/');
        return url;
    };

    return (
        <div className={styles.card}>
            <div className={styles.imageBox}>
                <img
                    src={resolveImage(image)}
                    alt={name}
                    className={styles.image}
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=random&color=fff&size=200`;
                    }}
                />
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
                        disabled={isLoading}
                        style={{
                            marginTop: '1rem',
                            padding: '10px 20px',
                            backgroundColor: isLoading ? '#ccc' : '#9b1fe9',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: isLoading ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {isLoading ? "Voting..." : "Give Vote"}
                    </button>
                )}
            </div>
        </div>
    );
};

export default Card;
