import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import Home from './home.jsx';
import Header from './header.jsx';
import Footer from './footer.jsx';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; // Fix import statement

import styles from '../styles/app.module.css';

function App() {
  const [isAuthenticated, setAuthenticated] = useState(false);
  const [userDetails, setUserDetails] = useState({});

  return (
    <div>
      <Header isAuth={isAuthenticated} setAuth={setAuthenticated} />
      <div>
        {isAuthenticated ? (
          <div>
            <Home user={userDetails} />
          </div>
        ) : (
          <div id={styles.login}>
            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                const info = jwtDecode(credentialResponse.credential);
                // console.log(info);
                try {
                  const response = await axios.post('http://localhost:3001/user', {
                    email: info.email,
                    picture: info.picture,
                    name: info.name
                  });
                  // console.log('Post request is successful', response.data);

                  // Update userDetails state with response data
                  setUserDetails({
                    email: info.email,
                    picture: info.picture,
                    name: info.name,
                    user_id: response.data.user_id 
                  });
                  
                  setAuthenticated(true); 
                } catch (error) {
                  console.error('Error:', error);
                }
              }}
              onError={() => console.log('Login Failed')}
            />
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default App;
