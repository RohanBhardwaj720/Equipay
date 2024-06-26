import React, { useState, useEffect } from 'react'
import axios from 'axios'
import styles from '../styles/transactionhistory.module.css'

function TransactionHistory(props) {
  document.body.style.backgroundColor = '#fff'
  const [history, setHistory] = useState([])
  const [userDetails, setUserDetails] = useState({})

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.get('http://localhost:3001/history', {
          params: {
            tripId: props.tripId
          }
        })
        setHistory(response.data.reverse())

        // Fetch user details for each unique email
        const uniqueEmails = Array.from(new Set(response.data.map((data) => data.payed_by)))
        const userDetailsPromises = uniqueEmails.map((email) =>
          axios.get('http://localhost:3001/user', { params: { email } })
        )
        const userDetailsResponses = await Promise.all(userDetailsPromises)
        const userDetailsMap = userDetailsResponses.reduce((map, response) => {
          const userDetails = response.data
          map[userDetails.email] = userDetails
          return map
        }, {})
        setUserDetails(userDetailsMap)
      } catch (err) {
        console.log('Error fetching data:', err)
      }
    }

    fetchData()
  }, [])

  return (
    <div>
      <h2 id={styles.history_heading}>Transaction history</h2>
      <hr />
      {history.map((data, idx) => {
        const userDetail = userDetails[data.payed_by] || {}
        return (
          <div className={idx % 2 === 0 ? 'grey data' : 'data'} key={idx}>
            <div id={styles.profile_image}>
              <img src={userDetail.picture} alt="profile image" />
            </div>
            <div className={styles.left}>
              <h3>{userDetail.person_name}</h3>
              <p>{data.date}</p>
            </div>
            <div className={styles.right}>
              <h3>{data.payed_to}</h3>
              <p> ₹{data.amount}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default TransactionHistory
