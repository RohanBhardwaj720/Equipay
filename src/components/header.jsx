import React from 'react';
import styles from '../styles/header.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import '../styles/confirmAlert.css';

function Header(props) {
  const handleAuthAction = () => {
    if (props.isAuth) {
      confirmAlert({
        title: 'Confirm Log Out',
        message: 'Are you sure you want to log out?',
        buttons: [
          {
            label: 'Yes',
            onClick: () => {
              props.setAuth(false);
              console.log('Logged out successfully');
            }
          },
          {
            label: 'No',
            onClick: () => console.log('Log out cancelled')
          }
        ]
      });
    }
  };

  return (
    <header className={styles.header}>
      <h1>
        <i className={styles.equi}>Equi</i>
        <i>Pay</i>
      </h1>
      {props.isAuth && (
        <button
          className={styles.authButton}
          onClick={handleAuthAction}
        >
          <FontAwesomeIcon icon={faSignOutAlt} />
          {' '}
          Log Out
        </button>
      )}
    </header>
  );
}

export default Header;
