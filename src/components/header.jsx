import React from 'react'
import styles from '../styles/header.module.css'

function Header(props) {
  return (
    <header>
      <h1>
        <i id={styles.equi}>Equi</i>
        <i>Pay</i>
      </h1>
      {props.isAuth ? (
        <button
          id={styles.logout}
          onClick={() => {
            props.setAuth(false)
            console.log('Logout successful:')
          }}
        >
          Logout
        </button>
      ) : null}
    </header>
  )
}
export default Header
