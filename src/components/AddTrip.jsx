import React, { useState, useEffect } from 'react';
import { withRouter, Link } from 'react-router-dom';
import DoneIcon from '@mui/icons-material/Done';
import { DisplayMember } from './Display_member.jsx';
import { DateTime } from 'luxon';
import DisplayTrip from './Display_Trip.jsx';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';
import styles from '../styles/addtrip.module.css';

function AddTrip(props) {
  const [place, setPlace] = useState('');
  const [email, setEmail] = useState('');
  const [members, setMember] = useState([props.user.email]);
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:3001/trip/all', {
          params: {
            user_id: props.user.user_id
          }
        });
        setTrips(response.data);
      } catch (error) {
        console.log('Error fetching trips array', error);
      }
    };

    fetchData();
  }, [props.user]);

  function handlePlaceChange(event) {
    const place_name = event.target.value;
    setPlace(place_name);
  }

  function handleEmailChange(event) {
    const Email = event.target.value;
    setEmail(Email);
  }

  function AddPerson() {
    setMember((prev) => {
      return [...prev, email];
    });
    setEmail('');
  }

  async function handle(event) {
    event.preventDefault();
    const today = DateTime.local();
    const member_ids = [];

    for (let member of members) {
      try {
        const response = await axios.get('http://localhost:3001/user', {
          params: {
            email: member
          }
        });
        member_ids.push(response.data.user_id);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    }

    try {
      const response2 = await axios.post('http://localhost:3001/trip', {
        place: place,
        members_id: member_ids,
        tripOrganizer: props.user.user_id
      });

      const newTrip = {
        start_datetime: today.toJSDate(), // Convert to JavaScript Date object
        place: place,
        trip_organizer: props.user.user_id,
        total_spendings: 0,
        trip_id: response2.data.trip_id // Assuming response2.data contains the trip ID
      };

      setTrips((prev) => [newTrip, ...prev]);
    } catch (err) {
      console.log('failed adding trip');
      console.log('err:', err);
    }

    setEmail('');
    setPlace('');
    setMember([props.user.email]);
  }

  return (
    <div>
      <form className={styles.Add_trip} onSubmit={handle}>
        <input
          name="Place"
          placeholder="Trip To..."
          onChange={handlePlaceChange}
          value={place}
          autoComplete="off"
        />

        <input
          name="email"
          placeholder="Enter Member Email"
          onChange={handleEmailChange}
          value={email}
          autoComplete="off"
        />

        <button id={styles.Add_person} onClick={AddPerson} type="button">
          <DoneIcon />
        </button>

        <div>
          {members.map((member_detail, idx) => {
            if (idx !== 0) {
              return <DisplayMember member={member_detail} idx={idx} key={idx} />;
            }
            return null;
          })}
        </div>

        <button type="submit" id={styles.Add_group}>
          <AddIcon />
        </button>
      </form>

      <div>
        {trips.map((Trip, idx) => (
          <div key={idx}>
            <DisplayTrip
              trip={Trip}
              idx={idx}
              user={props.user}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default withRouter(AddTrip);
