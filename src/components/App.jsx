import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import Home from "./home.jsx";
import Header from "./header.jsx";
import Footer from "./footer.jsx";
import {jwtDecode} from "jwt-decode"
import axios from "axios";

function App() {
  const [isAuthenticated, setAuthenticated] = useState(false); // issse false karo 
  const [userDetails,setUserDetails] = useState({});
  
  return (
    <div>
      <Header isAuth={isAuthenticated} setAuth={setAuthenticated}/>
       <div id="content">
      {isAuthenticated ? (
        <div>
          <Home user={userDetails}/>
          {console.log("Login successful:",userDetails)}
        </div>
      ) : (
        <div id="login">
          <GoogleLogin
            onSuccess={async (credentialResponse) => {
            const info = jwtDecode(credentialResponse.credential);
            console.log(info);
            setUserDetails(info);
            setAuthenticated(true);
            try {
            const response = await axios.post("http://localhost:3001/user", {
              email: info.email, 
              picture: info.picture,     
              name: info.name
            });
            console.log("Post request is successful", response);
            } catch (error) {
              console.error('Error:', error);
            }
          }}
          onError={() => console.log("Login Failed")}
          />
        </div>
      )}
      </div>
      <Footer/>
    </div>
  );
}

export default App;

// import React, { useState } from "react";
// import { GoogleLogin } from "@react-oauth/google";
// import Home from "./home";
// import {jwtDecode} from "jwt-decode"

// function App() {
//   const [isAuthenticated, setAuthenticated] = useState(false);

//   return (
//     <div>
//       {isAuthenticated ? (
//         <div>
//           <Home />
//         </div>
//       ) : (
//         <GoogleLogin
//           onSuccess={(credentialResponse) => {
//   console.log("Login successful:", jwtDecode(credentialResponse.credential));
//   setAuthenticated(true);
// }}

//           onError={() => console.log("Login Failed")}
//         />
//       )}
//     </div>
//   );
// }

// export default App;
