import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './components/App.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './styles/style.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId="800266975754-ou3vt81gj606tg60se2gmccofvb7o5f9.apps.googleusercontent.com">
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
)
