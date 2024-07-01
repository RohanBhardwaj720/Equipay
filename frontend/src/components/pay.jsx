import React, { useState } from 'react'
import axios from 'axios'
import { useLocation } from 'react-router-dom'
import styles from '../styles/pay.module.css'

function Pay(props) {
  const location = useLocation()
  const { trip, user } = location.state
  const [inputMoney, setInputMoney] = useState('')
  const [paidTo, setPaidTo] = useState('')

  function handleChangeInMoney(event) {
    const amount = event.target.value
    setInputMoney(amount)
  }

  function handleChange(event) {
    const name = event.target.value
    setPaidTo(name)
  }

  function handle() {
    axios.post(
      `/api/history`,
      {
        amount: inputMoney,
        paidBy: user.user_id,
        paidTo: paidTo,
        tripId: trip.trip_id
      },
      (err, res) => {
        if (err) {
          console.log('error posting transection history', err)
        }
      }
    )
    axios.patch(
      `/api/addpayment/${trip.trip_id}`,
      {
        paidBy: user.user_id,
        money: inputMoney
      },
      (err, res) => {
        if (err) {
          console.log('error patching the trip', err)
        }
      }
    )
    trip.total_spendings += parseInt(inputMoney)
    setPaidTo('')
    setInputMoney('')
  }

  return (
    <div className={styles.payment_form_container}>
      <div className={styles.payment_form}>
        <input
          className={styles.payment_input}
          placeholder="Enter amount of money you want to pay"
          value={inputMoney}
          onChange={handleChangeInMoney}
        />
        <input
          className={styles.payment_input}
          placeholder="To whom you are paying"
          value={paidTo}
          onChange={handleChange}
        />
        <button className={styles.payment_button} onClick={handle}>
          Add Payment
        </button>
      </div>
    </div>
  )
}

export default Pay
