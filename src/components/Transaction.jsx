import React from 'react';
import { useHistory } from 'react-router-dom';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import styles from '../styles/transaction.module.css';

function Transaction({ place, trip, user }) {
  const history = useHistory();
  const id = trip ? trip.trip_id : null;

  const navigateTo = (path) => {
    if (id) {
      history.push(`/trip/${id}${path}`, { trip: trip, user: user });
    } else {
      console.error('Trip ID is not available');
      // You might want to handle this later , Rohan
    }
  };

  if (!trip) {
    return <div>Loading...</div>; // Loading for now
  }

  return (
    <div className={styles.trip_card_1}>
      <h1>
        <span className={styles.locationIcon}>
          <LocationOnIcon />
        </span>{' '}
        {place} Trip
      </h1>
      <hr />
      <div className={styles.icons}>
        <div className={styles.icon} onClick={() => navigateTo('/history')}>
          <img
            src="https://i.pinimg.com/564x/94/03/1e/94031ef5b93fefabfa594e9e0b2503d8.jpg"
            alt="history_icon"
          />
          <p>
            Transaction <br />
            History
          </p>
        </div>
        <div className={styles.icon} onClick={() => navigateTo('/pay')}>
          <img
            src="https://i.pinimg.com/564x/2e/08/f0/2e08f02e3be8eed4a8f86766c15900c4.jpg"
            alt="scan_and_pay_icon"
          />
          <p>Add Payment</p>
        </div>
        <div className={styles.icon} onClick={() => user.user_id === trip.trip_organizer ? navigateTo('/settlePayment') : navigateTo('/payYourShare')}>
          {user.user_id === trip.trip_organizer ? (
            <>
              <img
                src="/SettlePayment.png"
                alt="SettlePayment icon"
              />
              <p>Settle Payment</p>
            </>
          ) : (
            <>
              <img
                src="https://i.pinimg.com/564x/1b/5f/ef/1b5fef94158fdbc0ac4f8b53c812c224.jpg"
                alt="pay_your_share_icon"
              />
              <p>
                Pay Your <br />
                Share
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Transaction;