import React from 'react'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import styles from '../styles/transaction.module.css'

function Transaction(props) {
  return (
    <div id={styles.trip_card_1}>
      <h1>
        <span style={{ color: '#BF1227' }}>
          <LocationOnIcon />
        </span>{' '}
        {props.place} Trip
      </h1>
      <hr />
      <div className={styles.icons}>
        <div className={styles.icon} onClick={props.toggleHistory}>
          <img
            src="https://i.pinimg.com/564x/94/03/1e/94031ef5b93fefabfa594e9e0b2503d8.jpg"
            rel="history_icon"
          />
          <p>
            Transaction <br />
            History
          </p>
        </div>
        <div className={styles.icon} onClick={props.togglePay}>
          <img
            src="https://i.pinimg.com/564x/2e/08/f0/2e08f02e3be8eed4a8f86766c15900c4.jpg"
            rel="scan_and_pay_icon"
          />
          <p>Scan & Pay</p>
        </div>
        <div className={styles.icon} onClick={props.togglePayYourShare}>
          <img
            src="https://i.pinimg.com/564x/1b/5f/ef/1b5fef94158fdbc0ac4f8b53c812c224.jpg"
            rel="pay_your_share_icon"
          />
          <p>
            Pay Your <br />
            Share
          </p>
        </div>
      </div>
    </div>
  )
}

export default Transaction
