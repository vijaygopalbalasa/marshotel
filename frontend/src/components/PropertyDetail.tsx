import React, { useEffect, useState } from 'react';
import { AirbnbContractAbi__factory } from '../contracts';
import { useParams } from 'react-router-dom';
import { hexToBase58 } from './utils/Convert'
import Modal from './utils/Modal';
import BookingForm from './forms/BookingForm'
import './style/PropertyDetail.css';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Scrollbar, A11y } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import {
  useConnectUI,
  useIsConnected,
  useWallet,
} from '@fuel-wallet/react';


const CONTRACT_ID = process.env.REACT_APP_CONTRACT_ID;

interface PropertyInfo {
    owner: string;
    pincode: number;
    listed: string;
    available: string;
    image1: string;
    image2: string;
}

interface PropertyDetailProps {
    account: string; 
}

const PropertyDetail: React.FC<PropertyDetailProps> = ({ account }) => {
    const [property, setProperty] = useState<PropertyInfo | null>(null);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const { id } = useParams<{ id: string }>();
    const { connect, setTheme, isConnecting } =
    useConnectUI();
    const { isConnected } = useIsConnected();
    const { wallet } = useWallet();

    const handleOpenBookingModal = () => setShowBookingModal(true);
    const handleCloseBookingModal = () => setShowBookingModal(false);

    // Convert from Hex to CID
    function convertFromB256(hexString: string) {
    // Remove '0x' prefix if it exists
    if (hexString.startsWith('0x')) {
        hexString = "1220" + hexString.substring(2);
    }
    const CID = hexToBase58(hexString);

    return CID;
    }

    useEffect(() => {
        const fetchData = async () => {
            await fetchProperty();
        };
    
        fetchData();
    }, [id, account]);

    const fetchProperty = async () => {
            if (isConnected && wallet && CONTRACT_ID && id !== undefined && CONTRACT_ID) {
                try {
                    const contract = AirbnbContractAbi__factory.connect(CONTRACT_ID, wallet);
                    const { value } = await contract
                    .multiCall([
                        contract.functions.property_info(parseInt(id)),
                        contract.functions.get_property_images(parseInt(id)),
                    ])
                    .call();
                    const formattedData: PropertyInfo = {
                        owner: value[0].owner.toString(),
                        pincode: value[0].pincode.toString(),
                        listed: value[0].listed.toString(),
                        available: value[0].available.toString(),
                        image1: (await convertFromB256(value[1].image1)).toString(),
                        image2: (await convertFromB256(value[1].image2)).toString(),
                    };
                    setProperty(formattedData);
                } catch (error) {
                    console.error('Error fetching property:', error);
                    // Handle error (show message to user, etc.)
                }
            }
        };

        return (
            <div className="property-detail-container">
              {property ? (
                <>
                  <div className="property-images">
                    <Swiper 
                        modules={[Navigation, Pagination, Scrollbar, A11y]}
                        spaceBetween={50}
                        slidesPerView={1}
                        navigation
                        pagination={{ clickable: true }}
                        scrollbar={{ draggable: true }}>
                      <SwiperSlide>
                        <img
                          src={`https://gateway.pinata.cloud/ipfs/${property.image1}`}
                          alt="Property Image 1"
                        />
                      </SwiperSlide>
                      <SwiperSlide>
                        <img
                          src={`https://gateway.pinata.cloud/ipfs/${property.image2}`}
                          alt="Property Image 2"
                        />
                      </SwiperSlide>
                      {/* Add more SwiperSlides if needed */}
                    </Swiper>
                  </div>
        
                  <div className="property-details">
                    <h1>Property Details</h1>
                    <p className="property-info">Pincode: {property.pincode}</p>
                    <p className="property-info">Listed: {property.listed}</p>
                    <p className="property-info">Availability: {property.available}</p>
                    <button className="book-button" onClick={handleOpenBookingModal}>Book</button>
                  </div>
        
                  <div className="modal-container">
                    <Modal
                      show={showBookingModal}
                      title="Book Property"
                      content={<BookingForm account={account} />}
                      onClose={handleCloseBookingModal}
                    />
                  </div>
                </>
              ) : (
                <p>Loading property details...</p>
              )}
            </div>
          );
        };
        
        export default PropertyDetail;
