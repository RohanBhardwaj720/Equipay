import React from 'react';
import styles from '../styles/upipaymentcard.module.css';

const UPIPaymentCard = ({ merchantName, upiId }) => {
  return (
    <div className={styles.card}>
      <h2 className={styles.merchantName}>{merchantName.toUpperCase()}</h2>
      
      <img
        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi%3A%2F%2Fpay%3Fpa%3D${encodeURIComponent(upiId)}%26cu%3DINR`}
        alt="QR Code"
        className={styles.qrCode}
      />
      
      <p className={styles.upiId}>{upiId}</p>
      
      <p className={styles.scanInstructions}>
        Scan and pay with any BHIM UPI app
      </p>
      
      <div className={styles.paymentLogo}>
        <img src="/payment.png" alt="payment png" />
      </div>
    </div>
  );
};

export default UPIPaymentCard;