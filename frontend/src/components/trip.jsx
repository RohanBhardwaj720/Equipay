import React, { useState, useEffect } from 'react'
import Transaction from './Transaction.jsx'
import axios from 'axios'
import { useLocation, useHistory } from 'react-router-dom'
import styles from '../styles/trip.module.css'

function Trip(props) {
  const location = useLocation()
  const history = useHistory()
  const [trip, setTrip] = useState(null)
  const user = props.user
  const [members, setMembers] = useState([])

  useEffect(() => {
    if (location.state && location.state.trip) {
      setTrip(location.state.trip)
    } else {
      history.push('/')
    }
  }, [location.state, history])

  useEffect(() => {
    if (trip) {
      const fetchTripMembers = async () => {
        try {
          const response = await axios.get(
            'http://${process.env.HOST}:${process.env.PORT}/trip/members',
            {
              params: { trip_id: trip.trip_id }
            }
          )
          const tripMembers = response.data
          console.log(tripMembers)
          setMembers(tripMembers)
        } catch (err) {
          console.error('Error fetching trip members:', err)
        }
      }
      fetchTripMembers()
    }
  }, [trip])

  if (!trip) {
    return <div className={styles.loading}>Loading...</div>
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentWrapper}>
        <div className={styles.transactionWrapper}>
          <Transaction place={trip.place} trip={trip} user={user} />
        </div>
        <div className={styles.membersWrapper}>
          <h2 className={styles.membersTitle}>Members</h2>
          <hr className={styles.divider} />
          <ol className={styles.membersList}>
            {members.map((member, idx) => (
              <li key={idx} className={styles.memberItem}>
                <span className={styles.memberName}>{member.user_name}</span>
                <span className={styles.memberSpending}>₹ {member.user_spending.toFixed(2)}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  )
}

export default Trip
