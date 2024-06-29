import React from 'react'
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom'
import AddTrip from './AddTrip.jsx'
import Trip from './trip.jsx'
import TransactionHistory from './transactionHistory.jsx'
import Pay from './pay.jsx'
import PayYourShare from './payYourShare.jsx'

function Home(props) {
  return (
    <Router>
      <Switch>
        <Route exact path="/" render={() => <AddTrip user={props.user} />} />
        <Route 
          exact
          path="/trip/:id" 
          render={(routeProps) => <Trip user={props.user} {...routeProps} />} 
        />
        <Route 
          exact
          path="/trip/:id/history" 
          render={(routeProps) => <TransactionHistory user={props.user} {...routeProps} />} 
        />
        <Route 
          exact
          path="/trip/:id/pay" 
          render={(routeProps) => <Pay user={props.user} {...routeProps} />} 
        />
        <Route 
          exact
          path="/trip/:id/payYourShare" 
          render={(routeProps) => <PayYourShare user={props.user} {...routeProps} />} 
        />
        <Route path="*">
          <Redirect to="/" />
        </Route>
      </Switch>
    </Router>
  )
}

export default Home;