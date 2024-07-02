import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useLocation } from 'react-router-dom'
import styles from '../styles/payyourshare.module.css'
import UPIPaymentCard from './UPIPaymentCard'

function PayYourShare(props) {
  const location = useLocation()
  const { trip, user } = location.state
  const [amount, setAmount] = useState(0)
  const [money, setMoney] = useState(0)
  const [showUPICard, setShowUPICard] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [tripOrganizerDetails, setTripOrganizerDetails] = useState('')

  const fetchSpending = async (userId, tripId) => {
    try {
      const response = await axios.get(
        `/api/spending`,
        {
          params: { userId, tripId }
        }
      )
      return response.data
    } catch (error) {
      console.error('Error fetching spending:', error.message)
      throw error
    }
  }
  const fetchTripOrganizer = async () => {
    try {
      const response = await axios.get(`/api/user/${trip.trip_organizer}`)
      setTripOrganizerDetails(response.data || { user_name: 'Unknown' })
      console.log(response.data);
    } catch (error) {
      console.error('Error fetching trip organizer:', error.message)
      setTripOrganizerDetails({ user_name: 'Unknown' })
    }
  }
  const updateMoney = async () => {
    try {
      const data = await fetchSpending(user.user_id, trip.trip_id)
      setMoney(data.user_spending.toFixed(2))
      console.log('Money updated:', Math.abs(data.user_spending))
    } catch (error) {
      console.error('Failed to fetch spending:', error.message)
    }
  }

  useEffect(() => {
    if (trip && trip.trip_id && user && user.user_id) {
      updateMoney()
      if (trip.trip_organizer) {
        fetchTripOrganizer()
      }
    }
  }, [trip, user])
  

  const handlePayClick = () => {
    setShowUPICard(true)
  }

  const handleUPICardClose = () => {
    setShowUPICard(false)
    setShowConfirmation(true)
  }

  const handleConfirmation = async (confirmed) => {
    setShowConfirmation(false)
    if (confirmed && trip && user && tripOrganizerDetails){
      try {
        await axios.patch(
          `/api/pay/${trip.trip_id}`,
          {
            money: amount,
            paidToId: trip.trip_organizer,
            paidBy: user.user_id,
            paidToName: tripOrganizerDetails.user_name
          }
        )
        updateMoney()
        console.log('Payment successful')
        setAmount(0)
      } catch (error) {
        console.error('Error paying your share', error)
      }
    }
  }

  const handleChange = (event) => {
    const value = event.target.value

    if (value === '') {
      setAmount('')
    } else {
      const parsedValue = parseFloat(value)
      if (!isNaN(parsedValue)) {
        setAmount(Math.min(Math.max(parsedValue, 0), money > 0 ? 0 : Math.abs(money)))
      }
    }
  }

  const incrementAmount = () => {
    setAmount((prev) =>
      Math.min(typeof prev === 'number' ? prev + 100 : 100, money > 0 ? 0 : Math.abs(money))
    )
  }

  const decrementAmount = () => {
    setAmount((prev) => Math.max(typeof prev === 'number' ? prev - 100 : 0, 0))
  }

  return (
    
    <div className={styles.paymentContainer}>
      <div className={styles.paymentCard}>
        <h2 className={styles.paymentTitle}>Payment to Trip Organizer</h2>
        <div className={styles.inputGroup}>
          <button className={styles.incrementButton} onClick={decrementAmount}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              width="24"
              height="24"
            >
              <path
                d="M5 12h14"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <input
            className={styles.paymentInput}
            value={amount}
            onChange={handleChange}
            type="number"
            min="0"
            max={money > 0 ? 0 : Math.abs(money)}
          />
          <button className={styles.incrementButton} onClick={incrementAmount}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              width="24"
              height="24"
            >
              <path
                d="M12 5v14M5 12h14"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
        <button className={styles.payButton} onClick={handlePayClick}>
          Pay ₹{amount}
        </button>
        <div className={styles.balanceInfo}>
          <span>Amount to pay:</span>
          <span className={styles.negative}>₹{money > 0 ? 0 : Math.abs(money)}</span>
        </div>
      </div>

      {showUPICard && (
        <div className={styles.upiOverlay}>
          <UPIPaymentCard
            merchantName={tripOrganizerDetails.user_name}
            upiId={tripOrganizerDetails.user_upi_id}
          />
          <button className={styles.closeButton} onClick={handleUPICardClose}>
            Close
          </button>
        </div>
      )}

      {showConfirmation && (
        <div className={styles.confirmationOverlay}>
          <div className={styles.confirmationCard}>
            <h3 className={styles.confirmationTitle}>Confirm Payment</h3>
            <p className={styles.confirmationText}>Have you completed the payment of ₹{amount}?</p>
            <div className={styles.confirmationButtons}>
              <button className={styles.confirmButton} onClick={() => handleConfirmation(true)}>
                Yes, I've paid
              </button>
              <button className={styles.cancelButton} onClick={() => handleConfirmation(false)}>
                No, cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PayYourShare
