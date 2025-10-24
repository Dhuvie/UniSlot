import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

import Navbar from './components/Navbar';
import PhoneAuth from './components/PhoneAuth';
import Dashboard from './components/Dashboard';
import SlotDetails from './components/SlotDetails';
import CreateSlot from './components/CreateSlot';
import Admin from './components/Admin';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData, token) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        {user && <Navbar user={user} onLogout={handleLogout} />}
        <Routes>
          <Route 
            path="/auth" 
            element={user ? <Navigate to="/dashboard" /> : <PhoneAuth onLogin={handleLogin} />} 
          />
          <Route 
            path="/dashboard" 
            element={user ? <Dashboard user={user} /> : <Navigate to="/auth" />} 
          />
          <Route 
            path="/create-slot" 
            element={user ? <CreateSlot user={user} /> : <Navigate to="/auth" />} 
          />
          <Route 
            path="/slot/:id" 
            element={user ? <SlotDetails user={user} /> : <Navigate to="/auth" />} 
          />
          <Route 
            path="/admin" 
            element={<Admin />} 
          />
          <Route 
            path="/" 
            element={<Navigate to={user ? "/dashboard" : "/auth"} />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
