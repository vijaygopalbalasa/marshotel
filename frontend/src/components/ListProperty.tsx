import React, { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import axios from 'axios';
import { AirbnbContractAbi__factory } from '../contracts';
import { base58ToHex } from './utils/Convert'
import Popup from './utils/Popup';
import './style/ListProperty.css';
import {
    useConnectUI,
    useIsConnected,
    useWallet,
} from '@fuel-wallet/react';


const CONTRACT_ID = process.env.REACT_APP_CONTRACT_ID;

console.log(CONTRACT_ID);

interface ListPropertyProps {
    account: string;
}

const ListProperty: React.FC<ListPropertyProps> = ({ account }) => {
    const [showModal, setShowModal] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalContent, setModalContent] = useState('');
    const [propertyDetails, setPropertyDetails] = useState({
        pincode: '',
        image1: null,
        image2: null
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { connect, setTheme, isConnecting } =
        useConnectUI();
    const { isConnected } = useIsConnected();
    const { wallet } = useWallet();

    const displayModal = (title: string, content: string) => {
        setModalTitle(title);
        setModalContent(content);
        setShowModal(true);
    };

    //Convert from CID to hex string
    const convertToB256 = async (data: string) => {

        const hexString = "0x" + (base58ToHex(data)).slice(4);
        return hexString;
    }

    const uploadToIPFS = async (file: File) => {
        const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;

        // Create form data
        let formData = new FormData();
        formData.append('file', file);
        const metadata = JSON.stringify({
            name: 'Property Image',
        });
        formData.append('pinataMetadata', metadata);
        const options = JSON.stringify({
            cidVersion: 0,
        })
        formData.append('pinataOptions', options);


        const res = await axios.post(url, formData, {
            method: "post",
            data: formData,
            headers: {
                'pinata_api_key': process.env.REACT_APP_PINATA_API_KEY,
                'pinata_secret_api_key': process.env.REACT_APP_PINATA_SECRET_API_KEY,
                "Content-Type": "multipart/form-data"
            },
        });


        return res.data.IpfsHash; // The CID of the uploaded file
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.type === "file") {
            const files = e.target.files;
            if (files && files.length > 0) {
                setPropertyDetails((prevDetails) => ({
                    ...prevDetails,
                    [e.target.name]: files[0],
                }));
            }
        } else {
            setPropertyDetails({ ...propertyDetails, [e.target.name]: e.target.value });
        }
    };



    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        console.log('Image 1:', propertyDetails.image1);
        console.log('Image 2:', propertyDetails.image2);

        try {
            if (propertyDetails.image1 && propertyDetails.image2) {
                const image1Cid = await uploadToIPFS(propertyDetails.image1);
                const image2Cid = await uploadToIPFS(propertyDetails.image2);
                const image1Hex = await convertToB256(image1Cid);
                const image2Hex = await convertToB256(image2Cid);
                console.log(image1Cid, image2Cid);
                console.log(image1Hex, image2Hex);
                if (isConnected && wallet && CONTRACT_ID) {
                    const contract = AirbnbContractAbi__factory.connect(CONTRACT_ID, wallet);
                    const { logs } = await contract.functions.list_property(propertyDetails.pincode, image1Hex, image2Hex).txParams({ gasPrice: 10, gasLimit: 100_0000 }).call()
                    setIsSubmitting(false);
                    console.log(logs[0]);
                    displayModal("Property Listed Successfully", `
                Property ID: ${logs[0].property_id.toString()}
                `);
                }
            } else {
                alert('Please select both images.');
            }
        } catch (error) {
            console.error('Error in form submission:', error);
            alert('Error submitting the property.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="form-container">
            <form onSubmit={handleSubmit} className='form'>
                <input
                    type="text"
                    name="pincode"
                    placeholder="Pincode"
                    className="input-field"
                    onChange={handleInputChange}
                    required
                />
                <input
                    type="file"
                    name="image1"
                    className="file-input"
                    onChange={handleInputChange}
                    required
                />
                <input
                    type="file"
                    name="image2"
                    className="file-input"
                    onChange={handleInputChange}
                    required
                />
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="submit-button"
                >
                    {isSubmitting ? 'Listing...' : 'List Property'}
                </button>
            </form>
            <Popup
                show={showModal}
                title={modalTitle}
                content={<pre>{modalContent}</pre>}
                onClose={() => setShowModal(false)}
            />
        </div>
    );
};


export default ListProperty;
