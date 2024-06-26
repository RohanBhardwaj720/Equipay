import React, { useState, useEffect } from 'react'
import Transaction from './Transaction.jsx'
import Pay from './pay.jsx'
import PayYourShare from './payYourShare.jsx'
import TransactionHistory from './transactionHistory.jsx'
import axios from 'axios'
import styles from '../styles/trip.module.css'

function Trip(props) {
  document.body.style.backgroundColor = '#00a6e4'
  const [historyPage, setHistoryPage] = useState(false)
  const [payPage, setPayPage] = useState(false)
  const [payYourSharePage, setPayYourSharePage] = useState(false)
  const [names, setNames] = useState([])
  const [moneyArray, setMoneyArray] = useState([])

  async function getNames() {
    try {
      const tripResponse = await axios.get('http://localhost:3001/trip', {
        params: {
          id: props.trip.id
        }
      })
      const moneyArrayResponse = tripResponse.data.money_array // Assuming money_array is returned in the response

      // Update moneyArray with the response data
      setMoneyArray(moneyArrayResponse)

      const promises = props.trip.members_emails.map((email) => {
        return axios.get('http://localhost:3001/user', {
          params: {
            email: email
          }
        })
      })

      const responses = await Promise.all(promises)
      const names = responses.map((res) => res.data.person_name)
      setNames(names)
      console.log(names)
    } catch (error) {
      console.log('Error fetching data:', error)
    }
  }

  useEffect(() => {
    const handlePopstate = () => {
      // Update pages based on the browser's history
      const path = window.location.pathname
      if (path === '/history') {
        setHistoryPage(true)
        setPayPage(false)
        setPayYourSharePage(false)
      } else if (path === '/pay') {
        setHistoryPage(false)
        setPayPage(true)
        setPayYourSharePage(false)
      } else if (path === '/payYourShare') {
        setHistoryPage(false)
        setPayPage(false)
        setPayYourSharePage(true)
      } else {
        setHistoryPage(false)
        setPayPage(false)
        setPayYourSharePage(false)
      }
      getNames()
    }

    window.addEventListener('popstate', handlePopstate)
    getNames()
    return () => {
      window.removeEventListener('popstate', handlePopstate)
    }
  }, [])

  function toggle_payPage() {
    setPayPage(!payPage)
    setPayYourSharePage(false)
    setHistoryPage(false)
    window.history.pushState(null, '', '/pay')
  }

  function toggle_payYourSharePage() {
    setPayYourSharePage(!payYourSharePage)
    setPayPage(false)
    setHistoryPage(false)
    window.history.pushState(null, '', '/payYourShare')
  }

  function toggle_historyPage() {
    setHistoryPage(!historyPage)
    setPayPage(false)
    setPayYourSharePage(false)
    window.history.pushState(null, '', '/history')
  }
  const name = ''
  console.log(props.trip)
  return (
    <div>
      {historyPage ? (
        <TransactionHistory tripId={props.trip.id} />
      ) : payPage ? (
        <Pay email={props.user.email} trip={props.trip} />
      ) : payYourSharePage ? (
        <PayYourShare
          tripId={props.trip.id}
          userEmail={props.user.email}
          moneyArr={moneyArray}
          members={props.trip.members_emails}
        />
      ) : (
        <div>
          <div id={styles.trip}>
            <Transaction
              place={props.trip.place}
              toggleHistory={toggle_historyPage}
              togglePay={toggle_payPage}
              togglePayYourShare={toggle_payYourSharePage}
            />
          </div>
          <div id={styles.trip_members}>
            <h1>Members</h1>
            <hr />
            <ol className={styles.sexy_list}>
              {names.map((name, idx) => (
                <li key={idx}>
                  {name}
                  <span>₹ {moneyArray[idx]}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  )
}

export default Trip
