import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useLocation } from 'react-router-dom'
import styles from '../styles/transactionhistory.module.css'
import { format } from 'date-fns'

function TransactionHistory(props) {
  const location = useLocation()
  const trip = location.state?.trip
  const [history, setHistory] = useState([])
  const [userDetails, setUserDetails] = useState({})

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.get('http://${process.env.HOST}:${process.env.PORT}/history', {
          params: {
            tripId: trip.trip_id
          }
        })
        setHistory(response.data.reverse())

        // Fetch user details for each unique user ID
        const uniqueUserIds = Array.from(new Set(response.data.map((data) => data.paid_by)))
        const userDetailsPromises = uniqueUserIds.map((userId) =>
          axios.get(`http://${process.env.HOST}:${process.env.PORT}/user`, {
            params: { user_id: userId }
          })
        )

        const userDetailsResponses = await Promise.all(userDetailsPromises)

        const userDetailsMap = userDetailsResponses.reduce((map, response) => {
          const userDetails = response.data
          map[userDetails.user_id] = {
            ...userDetails,
            picture: userDetails.user_picture
              ? `data:image/jpeg;base64,${userDetails.user_picture}`
              : null // or a default image URL
          }
          return map
        }, {})
        setUserDetails(userDetailsMap)
      } catch (err) {
        console.error('Error fetching data:', err)
      }
    }
    fetchData()
  }, [trip])

  return (
    <div className={styles.outer_container}>
      <div className={styles.container}>
        <h2 className={styles.history_heading}>Transaction history</h2>
        <div className={styles.transaction_list}>
          {history.map((data, idx) => {
            const userDetail = userDetails[data.paid_by] || {}
            return (
              <div
                className={`${styles.transaction_item} ${idx % 2 === 0 ? styles.even : ''}`}
                key={idx}
              >
                <div className={styles.user_info}>
                  <div className={styles.profile_image}>
                    {userDetail.picture ? (
                      <img src={userDetail.picture} alt="profile" />
                    ) : (
                      <div className={styles.no_image}>No Image</div>
                    )}
                  </div>
                  <div className={styles.user_details}>
                    <h3>{userDetail.user_name || 'Unknown'}</h3>
                    <p>{format(data.transaction_datetime, 'MMM dd, yyyy')}</p>
                  </div>
                </div>
                <div className={styles.transaction_details}>
                  <h3>{data.paid_to}</h3>
                  <p>₹{data.amount}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default TransactionHistory
