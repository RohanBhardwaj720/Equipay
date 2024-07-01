// Path: frontend/src/index.js

// import dotenv from 'dotenv'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './components/App.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './styles/style.css'
import { SpeedInsights } from "@vercel/speed-insights/react"

// Import environment variables
// dotenv.config()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SpeedInsights/>
    <GoogleOAuthProvider clientId="157143555627-6mirt4dujjl9p8pf88v6qpmgkj4ua830.apps.googleusercontent.com">
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
)
