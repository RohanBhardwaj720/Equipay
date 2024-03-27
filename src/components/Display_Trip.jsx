import React, { useState,useEffect } from "react";
import axios from "axios";

function DisplayTrip(props) {
  const trip = props.trip;
  const userEmail = props.user.email;
  var message = "";
  var moneyColor = "";
  var amount = 0;
  const [moneyArray,setMoneyArray] = useState([]);

  async function fetch(){
    try{
        const response = await axios.get("http://localhost:3001/trip",{
        params:{
          id: trip.id
        }
      });
      setMoneyArray(response.data.money_array);
    }
    catch(err){
      console.log("Error fetching meony Array from a trip", err);
    }  
  }

  useEffect(()=>{
    fetch();
  },[trip.id]);

  for(var i=0;i<moneyArray.length;i++){
    if(trip.members_emails[i]===userEmail){
      amount = moneyArray[i];
      break;
    }
  }
  if(amount>0){
    message="You lent ";
    moneyColor="green";
  }else if(amount<0){
    message="You owe ";
    moneyColor="red";
  }else{
    message="You are settled";
    moneyColor="none"
  }
 
  return (
    <div id="trip_display" onClick={() => {props.click(); props.clicked_trip_idx(props.idx)}}>
      <div id="heading_in_trip_card">
        <h1>{trip.place}</h1>
        <p>{trip.starting_date}</p>
        <p>₹ {trip.total_spendings}</p>
      </div>
      <h2 id="message">
        {message}
        {amount !== 0 && <span id={moneyColor}>₹{Math.abs(amount)}</span>}
      </h2>
    </div>    
  );
}

export default DisplayTrip;