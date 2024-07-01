import React, { useState, useEffect } from 'react'
import { GoogleLogin } from '@react-oauth/google'
import Home from './home.jsx'
import Header from './header.jsx'
import axios from 'axios'
import { jwtDecode } from 'jwt-decode'
import styles from '../styles/app.module.css'

function App() {
  const [isAuthenticated, setAuthenticated] = useState(false)
  const [userDetails, setUserDetails] = useState({})
  const [upiId, setUpiId] = useState('')
  const [showUpiForm, setShowUpiForm] = useState(false)
  const [quoteText, setQuoteText] = useState('')

  useEffect(() => {
    const quote =
      'Empower your adventures with Equipay, simplifying trip expenses and letting you focus on unforgettable moments.'
    let index = 0
    const intervalId = setInterval(() => {
      if (index <= quote.length) {
        setQuoteText(quote.slice(0, index))
        index++
      } else {
        clearInterval(intervalId)
      }
    }, 50)

    return () => clearInterval(intervalId)
  }, [])

  const handleGoogleLogin = async (credentialResponse) => {
    const info = jwtDecode(credentialResponse.credential)
    try {
      const response = await axios.post('http://${process.env.HOST}:${process.env.PORT}/user', {
        email: info.email,
        picture: info.picture,
        name: info.name
      })

      if (response.status === 201) {
        // New user
        setUserDetails({
          email: info.email,
          picture: info.picture,
          name: info.name,
          user_id: response.data.user_id
        })
        setShowUpiForm(true)
      } else if (response.status === 200) {
        // Existing user
        setUserDetails({
          email: info.email,
          picture: info.picture,
          name: info.name,
          user_id: response.data.user_id
        })
        setAuthenticated(true)
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleUpiSubmit = async (e) => {
    e.preventDefault()
    if (upiId) {
      try {
        const response = await axios.post(
          'http://${process.env.HOST}:${process.env.PORT}/user/upi',
          {
            user_id: userDetails.user_id,
            upiId: upiId
          }
        )
        setUserDetails((prevDetails) => ({
          ...prevDetails,
          upiId: upiId
        }))
        setAuthenticated(true)
      } catch (error) {
        console.error('Error:', error)
      }
    }
  }

  const handleLogout = () => {
    setAuthenticated(false)

    localStorage.clear()
    sessionStorage.clear()

    window.location.href = '/'
  }
  return (
    <div>
      <Header isAuth={isAuthenticated} handleLogout={handleLogout} />

      {isAuthenticated ? (
        <div>
          <Home user={userDetails} />
        </div>
      ) : (
        <div className={styles.container}>
          <div className={styles.loginSection}>
            <div className={styles.loginCard}>
              <h2>Welcome to Equipay</h2>
              <p>Sign in to access your account</p>
              {!showUpiForm ? (
                <div className={styles.googleLoginWrapper}>
                  <GoogleLogin
                    onSuccess={handleGoogleLogin}
                    onError={() => console.log('Login Failed')}
                    theme="filled_blue"
                    size="large"
                    text="continue_with"
                    shape="rectangular"
                  />
                </div>
              ) : (
                <form onSubmit={handleUpiSubmit}>
                  <input
                    type="text"
                    placeholder="Enter UPI ID"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    required
                  />
                  <button type="submit" className={styles.submitButton}>
                    Complete Registration
                  </button>
                </form>
              )}
            </div>
            <div className={styles.quoteContainer}>
              <p className={styles.quote}>{quoteText}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
