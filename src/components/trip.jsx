import React, { useState, useEffect } from 'react'
import Transaction from './Transaction.jsx'
import axios from 'axios'
import { useLocation, useHistory } from 'react-router-dom';
import styles from '../styles/trip.module.css'

function Trip(props) {
  const location = useLocation();
  const history = useHistory();
  const [trip, setTrip] = useState(null);
  const user = props.user;
  const [members, setMembers] = useState([])
  
  useEffect(() => {
    if (location.state && location.state.trip) {
      setTrip(location.state.trip);
    } else {
      // Redirect to a different page or show an error message
      history.push('/'); // Redirect to home page
      // Alternatively, you could fetch the trip data here if you have the trip ID in the URL
    }
  }, [location.state, history]);

  useEffect(() => {
    if (trip) {
      const fetchTripMembers = async () => {
        try {
          const response = await axios.get('http://localhost:3001/trip/members', {
            params: { trip_id: trip.trip_id }
          });
          const tripMembers = response.data;
          console.log(tripMembers);
          setMembers(tripMembers);
        } catch (err) {
          console.error('Error fetching trip members:', err);
        }
      };
      fetchTripMembers();
    }
  }, [trip]);

  if (!trip) {
    return <div>Loading...</div>; // Or any loading indicator
  }

  return (
    <div>
      <div>
        <div id={styles.trip}>
          <Transaction
            place={trip.place}
            trip={trip}
            user={user}
          />
        </div>
        <div id={styles.trip_members}>
          <h1>Members</h1>
          <hr />
          <ol className={styles.sexy_list}>
            {members.map((member, idx) => (
              <li key={idx}>
                {member.user_name}
                <span>₹ {member.user_spending}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  )
}

export default Trip