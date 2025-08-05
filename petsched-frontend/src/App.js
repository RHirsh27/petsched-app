import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import './App.css';
import Pets from './components/Pets';
import Appointments from './components/Appointments';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Register from './components/Register';
import { authAPI } from './services/api';

function App() {
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState('login'); // 'login' or 'register'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const currentUser = authAPI.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setShowAuth('login');
  };

  const handleRegister = (userData) => {
    setUser(userData);
    setShowAuth('register');
  };

  const handleLogout = () => {
    authAPI.logout();
    setUser(null);
  };

  const switchToRegister = () => setShowAuth('register');
  const switchToLogin = () => setShowAuth('login');

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">🐾</div>
        <p>Loading PetSched...</p>
      </div>
    );
  }

  // If not authenticated, show auth screen
  if (!user) {
    return (
      <div className="App">
        {showAuth === 'login' ? (
          <Login onLogin={handleLogin} onSwitchToRegister={switchToRegister} />
        ) : (
          <Register onRegister={handleRegister} onSwitchToLogin={switchToLogin} />
        )}
      </div>
    );
  }

  // If authenticated, show main app
  return (
    <Router>
      <div className="App">
        <nav className="navbar">
          <div className="nav-container">
            <div className="nav-logo">
              <h1>🐾 PetSched</h1>
            </div>
            <div className="nav-links">
              <Link to="/" className="nav-link">Dashboard</Link>
              <Link to="/pets" className="nav-link">Pets</Link>
              <Link to="/appointments" className="nav-link">Appointments</Link>
            </div>
            <div className="nav-user">
              <span className="user-name">Welcome, {user.name}!</span>
              <button onClick={handleLogout} className="logout-button">
                Logout
              </button>
            </div>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/pets" element={<Pets />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
