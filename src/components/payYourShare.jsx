import React,{useState} from "react";
import axios from "axios";

function PayYourShare(props){
    const [amount,setAmount] = useState();
    const array = props.moneyArr;
    const members = props.members;

    async function handleClick() {
        var sum = 0;
        for (var i = 0; i < array.length; i++) {
            if (array[i] > 0) {
                sum += array[i];
            }
        }
        for (var i = 0; i < array.length; i++) {
            if (props.userEmail == members[i]) {
                array[i] += amount;
            } else {
                if (array[i] > 0) {
                    array[i] -= (array[i] / sum) * amount;
                }
            }
        }
        
        try {
            const response2  = await axios.post("http://localhost:3001/history",{
                amount:amount, payedTo:"Payed his share", payedBy:props.userEmail ,tripId:props.tripId
            });
            const response = await axios.patch(`http://localhost:3001/trip/${props.tripId}`, {
                array: array
            });
            console.log("Trip updated successfully", response.data);
        } catch (error) {
            console.error("Error paying your share", error);
        }
        setAmount("");
    }
    
    function handleChange(event){
        const a = parseInt(event.target.value);
        setAmount(a);
    }
    return (
        <div>
           <input
            placeholder="Enter the amount you want to pay"
            value={amount}
            onChange={handleChange}
           />
           <button onClick={handleClick}>Pay</button>
        </div>
    );
}

export default PayYourShare;