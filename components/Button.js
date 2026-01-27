import React from 'react';
import styles from '../styles/Button.module.css';

const Button = ({ btnName, handleClick, classStyles }) => (
    <button className={styles.button} type="button" onClick={handleClick}>
        {btnName}
    </button>
);

export default Button;
