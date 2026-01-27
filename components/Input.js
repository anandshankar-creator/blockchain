import React from 'react';
import styles from '../styles/Input.module.css';

const Input = ({ inputType = "text", title, placeholder, handleClick }) => (
    <div className={styles.input}>
        <p>{title}</p>
        <input
            type={inputType}
            className={styles.inputData}
            placeholder={placeholder}
            onChange={handleClick}
        />
    </div>
);

export default Input;

