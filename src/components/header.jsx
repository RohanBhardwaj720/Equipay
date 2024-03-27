import React from "react";

function Header(props){
    
return (
        <header>
          <h1><i id="equi">Equi</i><i>Pay</i></h1>
          {props.isAuth ?
          (<button id="logout" onClick={()=>{props.setAuth(false); console.log("Logout successful:");} }>Logout</button>):(null)
          }
        </header>
      );
}
export default Header;