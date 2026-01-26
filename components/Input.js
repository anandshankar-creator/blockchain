import React from 'react';
import styles from '../styles/Input.module.css';

const Input = ({ inputType, title, placeholder, handleClick }) => (
    <div className={styles.input}>
        <p>{title}</p>
        {inputType === "text" ? (
            <input type="text" className={styles.inputData} placeholder={placeholder} onChange={handleClick} />
        ) : (
            ""
        )}
    </div>
);

export default Input;
