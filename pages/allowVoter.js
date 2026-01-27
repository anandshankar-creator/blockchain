import React, { useState, useEffect, useContext } from 'react';
import { VotingContext } from '../context/Voter';
import styles from '../styles/AllowedVoter.module.css';
import NavBar from '../components/NavBar';
import Button from '../components/Button';
import Input from '../components/Input';
import { useRouter } from 'next/router';

const AllowedVoter = () => {
    const [fileUrl, setFileUrl] = useState(null);
    const [formInput, setFormInput] = useState({
        name: '',
        address: '',
        position: '',
    });

    const router = useRouter();
    const { uploadToIPFS, createVoter } = useContext(VotingContext);

    const onDrop = async (event) => {
        const file = event.target.files[0];

        // Show immediate preview
        const previewUrl = URL.createObjectURL(file);
        setFileUrl(previewUrl);

        const url = await uploadToIPFS(file);
        setFileUrl(url);
    };

    const handleFormFieldChange = (fieldName, e) => {
        setFormInput({ ...formInput, [fieldName]: e.target.value });
    };

    return (
        <div className={styles.allowedVoter}>
            <NavBar />
            <div className={styles.voter}>
                <div className={styles.voter__container}>
                    <h1>Voter Registration</h1>
                    <div className={styles.voter__container__box}>
                        <div className={styles.voter__container__box__div}>
                            <div className={styles.sideInfo}>
                                <div className={styles.sideInfo_image}>
                                    <img src={fileUrl || "https://via.placeholder.com/150"} alt="Voter" />
                                </div>
                                <p>Upload Voter Image</p>
                                <div className={styles.card_box_img}>
                                    <input type="file" onChange={onDrop} />
                                </div>
                            </div>
                        </div>
                        <div className={styles.voter__container__box__div}>
                            <Input inputType="text" title="Name" placeholder="Voter Name" handleClick={(e) => handleFormFieldChange('name', e)} />
                            <Input inputType="text" title="Address" placeholder="Voter Address" handleClick={(e) => handleFormFieldChange('address', e)} />
                            <Input inputType="text" title="Position" placeholder="Voter Position" handleClick={(e) => handleFormFieldChange('position', e)} />

                            <div className={styles.Button}>
                                <Button btnName="Authorize Voter" handleClick={() => createVoter(formInput, fileUrl, router)} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AllowedVoter;
