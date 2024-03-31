import { useEffect, useState } from 'react';
import { AirbnbContractAbi__factory } from '../contracts';
import { Link } from 'react-router-dom';
import './style/PropertyList.css';
import {
    useConnectUI,
    useIsConnected,
    useWallet,
  } from '@fuel-wallet/react';

const CONTRACT_ID = process.env.REACT_APP_CONTRACT_ID;

interface PropertyListProp {
    account: string;
}

const PropertyList: React.FC<PropertyListProp> = ({account}) => {
    const [propertyCount, setPropertyCount] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const { connect, setTheme, isConnecting } =
    useConnectUI();
    const { isConnected } = useIsConnected();
    const { wallet } = useWallet();

    useEffect(() => {
        const fetchProperties = async () => {
            try {
                if (isConnected && wallet && CONTRACT_ID && CONTRACT_ID) {
                    const contract = AirbnbContractAbi__factory.connect(CONTRACT_ID, wallet);
                    const {value} = await contract.functions.total_property_listed().txParams({gasPrice:1, gasLimit: 100_000}).call();
                    setPropertyCount(value.toNumber());
                    console.log(value.toNumber());
                }
            } catch (error) {
                console.error('Error fetching properties:', error);
                // Handle the error appropriately
            } finally {
                setLoading(false);
            }
        };
    
        fetchProperties();
    }, [account]);
    

    return (
        <div className="property-list-container">
            <h1 className="property-list-title">Property List</h1>
            {loading ? (
                <p className="loading-message">Loading Properties...</p>
            ) : propertyCount > 0 ? (
                <div className="property-cards-container">
                    {Array.from({ length: propertyCount }).map((_, index) => (
                        <div key={index} className="property-card">
                            <h3>Property {index + 1}</h3>
                            <Link to={`/property/${index + 1}`}>View Details</Link>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="no-property-message">No Property Listed</p>
            )}
        </div>
    );
};

export default PropertyList;
