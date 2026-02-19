// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'

// Import your pages
import App from './App.jsx'                    // main voting page
import AdminLogin from './pages/AdminLogin.jsx' // create this file if missing
import AdminDashboard from './pages/AdminDashboard.jsx' // create this file if missing

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Home / voting page */}
        <Route path="/" element={<App />} />

        {/* Admin login */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Admin dashboard (only after login) */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        {/* Catch-all for 404 */}
        <Route path="*" element={
          <div style={{ 
            padding: '4rem', 
            textAlign: 'center', 
            color: '#94a3b8',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            background: '#0f172a'
          }}>
            <h1 style={{ color: '#60a5fa' }}>404 - Page Not Found</h1>
            <p>Go back to <a href="/" style={{ color: '#3b82f6' }}>Home</a></p>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)