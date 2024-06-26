import React, { useState, useEffect } from 'react'
import DoneIcon from '@mui/icons-material/Done'
import { DisplayMember } from './Display_member.jsx'
import { DateTime } from 'luxon'
import DisplayTrip from './Display_Trip.jsx'
import AddIcon from '@mui/icons-material/Add'
import Trip from './trip.jsx'
import axios from 'axios'
import styles from '../styles/addtrip.module.css'

function AddTrip(props) {
  const [clicked, setClick] = useState(false)
  const [place, setPlace] = useState('')
  const [email, setEmail] = useState('')
  const [members, setMember] = useState([props.user.email])
  const [trips, setTrips] = useState([])
  const [clickedTripIdx, setClickedTripIdx] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const respon = await axios.get('http://localhost:3001/user', {
          params: {
            email: props.user.email
          }
        })
        const tripsId = respon.data.trips_id
        console.log(tripsId)

        const fetchedTrips = []

        for (let i = 0; i < tripsId.length; i++) {
          const response = await axios.get('http://localhost:3001/trip', {
            params: {
              id: tripsId[i]
            }
          })
          console.log(response.data)
          fetchedTrips.push(response.data)
        }

        setTrips(fetchedTrips)
      } catch (error) {
        console.log('Error fetching trips array', error)
      }
    }

    fetchData()

    const handlePopstate = () => {
      // Update the 'clicked' state based on the browser's history
      const path = window.location.pathname
      if (path === '/trip-details') {
        setClick(true)
      } else {
        setClick(false)
      }
    }

    // Add an event listener for the 'popstate' event when the component mounts
    window.addEventListener('popstate', handlePopstate)

    // Cleanup the event listener when the component is unmounted
    return () => {
      window.removeEventListener('popstate', handlePopstate)
    }
  }, [])

  function handlePlaceChange(event) {
    const place_name = event.target.value
    setPlace(place_name)
  }

  function get_it_clicked() {
    setClick(true)
    window.history.pushState(null, '', '/trip-details')
  }

  function handleClickedTrip(idx) {
    setClickedTripIdx(idx)
  }
  function handleEmailChange(event) {
    const Email = event.target.value
    setEmail(Email)
  }

  function AddPerson() {
    setMember((prev) => {
      return [...prev, email]
    })
    setEmail('')
  }

  async function handle(event) {
    event.preventDefault()
    const today = DateTime.local()
    const sexyFormattedDate = today.toFormat('MMMM dd, yyyy')
    const moneyArr = new Array(members.length).fill(0)

    try {
      const response = await axios.post('http://localhost:3001/trip', {
        Place: place,
        moneyArray: moneyArr,
        startingDate: sexyFormattedDate,
        membersEmails: members,
        totalSpending: 0,
        userEmail: props.user.email
      })

      const newTrip = {
        starting_date: sexyFormattedDate,
        place: place,
        members_emails: members,
        total_spendings: 0,
        money_array: moneyArr,
        id: response.data
      }
      setTrips((prev) => [newTrip, ...prev])
      console.log('trip added successfully')
    } catch (err) {
      console.log('failed adding trip')
      console.log('err:', err)
    }

    setEmail('')
    setPlace('')
    setMember([props.user.email])
  }

  return (
    <div>
      {clicked ? (
        <Trip trip={trips[clickedTripIdx]} user={props.user} />
      ) : (
        <div>
          <form className={styles.Add_trip} onSubmit={handle}>
            <input
              name="Place"
              placeholder="Trip To..."
              onChange={handlePlaceChange}
              value={place}
              autoComplete="off"
            />

            <input
              name="email"
              placeholder="Enter Member Email"
              onChange={handleEmailChange}
              value={email}
              autoComplete="off"
            />

            <button id={styles.Add_person} onClick={AddPerson} type="button">
              <DoneIcon />
            </button>

            <div>
              {members.map((member_detail, idx) => {
                if (idx !== 0) {
                  return <DisplayMember member={member_detail} idx={idx} key={idx} />
                }
                return null
              })}
            </div>

            <button type="submit" id={styles.Add_group}>
              <AddIcon />
            </button>
          </form>

          <div>
            {trips.map((Trip, idx) => (
              <DisplayTrip
                trip={Trip}
                key={idx}
                idx={idx}
                click={get_it_clicked}
                clicked_trip_idx={handleClickedTrip}
                user={props.user}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default AddTrip
