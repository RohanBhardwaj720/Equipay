import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useLocation } from 'react-router-dom'
import styles from '../styles/settlepayment.module.css'
import UPIPaymentCard from './UPIPaymentCard'

function SettlePayment() {
  const location = useLocation()
  const { trip, user } = location.state
  const [settlements, setSettlements] = useState([])
  const [selectedSettlement, setSelectedSettlement] = useState(null)
  const [showUPICard, setShowUPICard] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [amount, setAmount] = useState(0)

  useEffect(() => {
    fetchSettlements()
  }, [])

  const fetchSettlements = async () => {
    try {
      const response = await axios.get(
        `http://${process.env.HOST}:${process.env.PORT}/settlements?tripOrganizer=${trip.trip_organizer}&tripId=${trip.trip_id}`
      )
      setSettlements(response.data)
    } catch (error) {
      console.error('Error fetching settlements:', error)
    }
  }

  const handleCardClick = (settlement) => {
    setSelectedSettlement(settlement)
    setAmount(0)
  }

  const handlePayClick = () => {
    setShowUPICard(true)
  }

  const handleUPICardClose = () => {
    setShowUPICard(false)
    setShowConfirmation(true)
  }

  const handleConfirmation = async (confirmed) => {
    setShowConfirmation(false)
    if (confirmed) {
      try {
        await axios.patch(`http://${process.env.HOST}:${process.env.PORT}/pay/${trip.trip_id}`, {
          money: amount,
          paidTo: selectedSettlement.userId,
          paidBy: user.user_id
        })
        fetchSettlements()
        setSelectedSettlement(null)
        setAmount(0)
      } catch (error) {
        console.error('Error settling payment:', error)
      }
    } else {
      setSelectedSettlement(null)
      setAmount(0)
    }
  }

  const handleChange = (event) => {
    const value = event.target.value
    if (value === '') {
      setAmount('')
    } else {
      const parsedValue = parseFloat(value)
      if (!isNaN(parsedValue)) {
        setAmount(Math.min(Math.max(parsedValue, 0), selectedSettlement.user_spending))
      }
    }
  }

  const incrementAmount = () => {
    setAmount((prev) =>
      Math.min(typeof prev === 'number' ? prev + 100 : 100, selectedSettlement.user_spending)
    )
  }

  const decrementAmount = () => {
    setAmount((prev) => Math.max(typeof prev === 'number' ? prev - 100 : 0, 0))
  }

  return (
    <div className={styles.settleContainer}>
      <div className={styles.settleCard}>
        <h2 className={styles.settleTitle}>Settle Payments</h2>
        {!selectedSettlement ? (
          <div className={styles.settlementCards}>
            {settlements.map((settlement) => (
              <div
                key={settlement.user_id}
                className={styles.settlementCard}
                onClick={() => handleCardClick(settlement)}
              >
                <p className={styles.userName}>{settlement.user_name}</p>
                <p className={styles.amount}>₹{settlement.user_spending.toFixed(2)}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.paymentCard}>
            <h3 className={styles.paymentTitle}>Pay {selectedSettlement.user_name}</h3>
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
                max={selectedSettlement.user_spending}
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
              Pay ₹{amount.toFixed(2)}
            </button>
            <div className={styles.balanceInfo}>
              <span>Amount to pay:</span>
              <span className={styles.negative}>
                ₹{selectedSettlement.user_spending.toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </div>

      {showUPICard && (
        <div className={styles.upiOverlay}>
          <UPIPaymentCard
            merchantName={selectedSettlement.user_name}
            upiId={selectedSettlement.user_upi_id}
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
            <p className={styles.confirmationText}>
              Have you completed the payment of ₹{amount.toFixed(2)} to{' '}
              {selectedSettlement.user_name}?
            </p>
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

export default SettlePayment
