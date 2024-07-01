import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom'
import AddTrip from './AddTrip.jsx'
import Trip from './trip.jsx'
import TransactionHistory from './transactionHistory.jsx'
import Pay from './pay.jsx'
import PayYourShare from './payYourShare.jsx'
import SettlePayment from './SettlePayment.jsx'
import axios from 'axios'

function Home(props) {
  const [user, setUser] = useState(props.user)
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/user`,
          {
            params: { email: user.email }
          }
        )
        setUser(response.data)
      } catch (error) {
        console.error('Error fetching user data:', error)
      }
    }

    fetchUser()
  }, [props.user.user_id])
  return (
    <Router>
      <Switch>
        <Route exact path="/" render={() => <AddTrip user={user} />} />
        <Route
          exact
          path="/trip/:id"
          render={(routeProps) => <Trip user={user} {...routeProps} />}
        />
        <Route
          exact
          path="/trip/:id/history"
          render={(routeProps) => <TransactionHistory user={user} {...routeProps} />}
        />
        <Route
          exact
          path="/trip/:id/pay"
          render={(routeProps) => <Pay user={user} {...routeProps} />}
        />
        <Route
          exact
          path="/trip/:id/payYourShare"
          render={(routeProps) => <PayYourShare user={user} {...routeProps} />}
        />
        <Route
          exact
          path="/trip/:id/settlePayment"
          render={(routeProps) => <SettlePayment user={user} {...routeProps} />}
        />
        <Route path="*">
          <Redirect to="/" />
        </Route>
      </Switch>
    </Router>
  )
}

export default Home
