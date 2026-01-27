import React, { useState, useEffect, useContext } from 'react';
import { VotingContext } from '../context/Voter';
import styles from '../styles/AllowedVoter.module.css'; // Reusing or new? Let's make separate.
import NavBar from '../components/NavBar';
import Button from '../components/Button';
import Input from '../components/Input';
import { useRouter } from 'next/router';

const CandidateRegistration = () => {
    const [fileUrl, setFileUrl] = useState(null);
    const [candidateForm, setCandidateForm] = useState({
        name: '',
        address: '',
        age: '',
    });

    const router = useRouter();
    const { setCandidate, uploadToIPFSCandidate } = useContext(VotingContext);

    const onDrop = async (event) => {
        const file = event.target.files[0];

        // Show immediate preview
        const previewUrl = URL.createObjectURL(file);
        setFileUrl(previewUrl);

        // Perform actual upload (if configured) or get IPFS URL
        const url = await uploadToIPFSCandidate(file);

        // If upload successful (and not just placeholder), use it. 
        // Logic: if returned URL differs from placeholder or is a real hash, usage.
        // For now, if mock returns placeholder, we might keep using previewUrl for display
        // BUT we must pass 'url' to setCandidate for persistence.

        // We will store the result in a ref or just rely on 'url' being passed to setCandidate?
        // Actually, setCandidate uses 'fileUrl' state. So we must update state with the real URL eventually?
        // If we update state with real URL, the preview might flicker if the real URL is slow/broken.
        // Let's rely on the fact that if uploadToIPFSCandidate works, it returns a string.

        setFileUrl(url);
    };

    const handleFormFieldChange = (fieldName, e) => {
        setCandidateForm({ ...candidateForm, [fieldName]: e.target.value });
    };

    // Image handling logic placeholder

    return (
        <div className={styles.allowedVoter}>
            <NavBar />
            <div className={styles.voter}>
                <div className={styles.voter__container}>
                    <h1>Candidate Registration</h1>
                    <div className={styles.voter__container__box}>
                        <div className={styles.voter__container__box__div}>
                            <div className={styles.sideInfo}>
                                <div className={styles.sideInfo_image}>
                                    <img src={fileUrl || "https://via.placeholder.com/150"} alt="Candidate" />
                                </div>
                                <p>Upload Candidate Image</p>
                                <div className={styles.card_box_img}>
                                    <input type="file" onChange={onDrop} />
                                </div>
                            </div>
                        </div>
                        <div className={styles.voter__container__box__div}>
                            <Input inputType="text" title="Name" placeholder="Candidate Name" handleClick={(e) => handleFormFieldChange('name', e)} />
                            <Input inputType="text" title="Address" placeholder="Candidate Address" handleClick={(e) => handleFormFieldChange('address', e)} />
                            <Input inputType="number" title="Age" placeholder="Candidate Age" handleClick={(e) => handleFormFieldChange('age', e)} />

                            <div className={styles.Button}>
                                <Button btnName="Authorize Candidate" handleClick={() => setCandidate(candidateForm, fileUrl, router)} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CandidateRegistration;
