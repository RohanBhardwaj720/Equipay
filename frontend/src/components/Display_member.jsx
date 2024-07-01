import React from 'react'
import styles from '../styles/displaymember.module.css'

function DisplayMember(props) {
  if (props.idx !== 0) {
    return <p id={styles.displayInForm}>{props.member}</p>
  }
}
export { DisplayMember }
