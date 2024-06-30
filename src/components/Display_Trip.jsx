import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import axios from 'axios';
import styles from '../styles/displaytrip.module.css';

function DisplayTrip({ trip, user }) {
  const [Trip, setTrip] = useState(trip);
  const [ amount,setAmount] = useState(0);
  useEffect(() => {
    const fetchTripData = async () => {
      try {
        const response = await axios.get('http://localhost:3001/trip', {
          params: { trip_id: trip.trip_id }
        });
        setTrip(response.data);
      } catch (error) {
        console.error('Error fetching trip data:', error);
      }
    };

    fetchTripData();
  }, [trip.trip_id]);

  useEffect(() => {
    const fetchUserSpendings = async () => {
      try {
        const response = await axios.get('http://localhost:3001/userSpendings', {
          params: { trip_id: trip.trip_id , user_id: user.user_id}
        });
        setAmount(response.data.user_spending.toFixed(2));
      } catch (error) {
        console.error('Error fetching user Spendings:', error);
      }
    };

    fetchUserSpendings();
  }, []);

  const { message, moneyColor, formattedDate } = useMemo(() => {
    let message = '';
    let moneyColor = '';
    const formattedDate = format(new Date(trip.start_datetime), 'MMMM dd, yyyy');

    if (amount > 0) {
      message = 'You lent';
      moneyColor = 'green';
    } else if (amount < 0) {
      message = 'You owe';
      moneyColor = 'red';
    } else {
      message = 'Settled';
      moneyColor = '';
    }

    return { message, moneyColor, formattedDate };
  }, [Trip.total_spendings, Trip.start_datetime, amount]);

  return (
    <Link to={{ pathname: `/trip/${trip.trip_id}`, state: { user, trip } }} className={styles.trip_link}>
      <div id={styles.trip_display}>
        <div id={styles.trip_header}>
          <h2>{Trip.place}</h2>
          <p>{formattedDate}</p>
        </div>
        <div id={styles.trip_body}>
          <div id={styles.trip_total}>
            Total Spendings: ₹{Trip.total_spendings}
          </div>
          <div id={styles.trip_status}>
            <span id={styles.status_message}>{message}</span>
            <span id={styles.status_amount} className={styles[moneyColor]}>
              ₹{Math.abs(amount).toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
export default DisplayTrip;