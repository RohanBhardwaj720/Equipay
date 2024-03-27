import React from "react";

function DisplayMember(props){
    if(props.idx!==0){
        return (
            <p id="displayInForm">{props.member}</p>
        );
    }
}
export  {DisplayMember};