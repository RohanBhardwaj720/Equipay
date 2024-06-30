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
      message = 'You lent ';
      moneyColor = styles.green;
    } else if (amount < 0) {
      message = 'You owe ';
      moneyColor = styles.red;
    } else {
      message = 'You are settled';
      moneyColor = styles.none;
    }

    return { message, moneyColor, amount, formattedDate };
  }, [Trip.total_spendings, Trip.start_datetime,amount]);
  console.log(Trip.total_spendings);
  return (
    <Link
      to={{
        pathname: `/trip/${trip.trip_id}`,
        state: {
          user: user,
          trip: trip
        }
      }}
      className={styles.trip_link}
    >
      <div id={styles.trip_display}>
        <div id={styles.heading_in_trip_card}>
          <h1>{Trip.place}</h1>
          <p>{formattedDate}</p>
          <p>₹ {Trip.total_spendings}</p>
        </div>
        <h2 id={styles.message}>
          {message}
          {amount !== 0 && <span className={moneyColor}>₹{Math.abs(amount)}</span>}
        </h2>
      </div>
    </Link>
  );
}

export default DisplayTrip;