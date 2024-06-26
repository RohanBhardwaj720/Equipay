import React from 'react'
import AddTrip from './AddTrip.jsx'

function Home(props) {
  return (
    <div>
      <AddTrip user={props.user} />
    </div>
  )
}

export default Home
