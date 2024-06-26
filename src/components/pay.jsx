import React, { useState } from 'react'
import axios from 'axios'

function Pay(props) {
  const [inputMoney, setInputMoney] = useState('')
  const [payedTo, setPayedTo] = useState('')

  function handleChangeInMoney(event) {
    const amount = event.target.value
    setInputMoney(amount)
  }

  function handleChange(event) {
    const name = event.target.value
    setPayedTo(name)
  }

  function handle() {
    axios.post(
      'http://localhost:3001/history',
      {
        amount: inputMoney,
        payedBy: props.email,
        payedTo: payedTo,
        tripId: props.trip.id
      },
      (err, res) => {
        if (err) {
          console.log('error posting transection history', err)
        }
      }
    )
    axios.patch(
      `http://localhost:3001/trip/${props.trip.id}`,
      {
        payedBy: props.email,
        money: inputMoney
      },
      (err, res) => {
        if (err) {
          console.log('error patching the trip', err)
        }
      }
    )
    props.trip.total_spendings += parseInt(inputMoney)
    setPayedTo('')
    setInputMoney('')
  }

  return (
    <div>
      <input
        placeholder="Enter amount of money you want to pay"
        value={inputMoney}
        onChange={handleChangeInMoney}
      />
      <input placeholder="to whome you are paying" value={payedTo} onChange={handleChange} />
      <button onClick={handle}>Submit </button>
    </div>
  )
}

export default Pay
