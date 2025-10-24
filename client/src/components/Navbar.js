import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, LogOut, PlusCircle } from 'lucide-react';
import './Navbar.css';

function Navbar({ user, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/auth');
  };

  return (
    <nav className="navbar">
      <div className="container navbar-content">
        <Link to="/dashboard" className="navbar-brand">
          <Users size={28} />
          <span>UniSlot</span>
        </Link>
        
        <div className="navbar-actions">
          <Link to="/create-slot" className="btn btn-primary">
            <PlusCircle size={18} />
            Create Slot
          </Link>
          
          <div className="user-menu">
            <div className="user-info">
              <div className="user-avatar">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div className="user-details">
                <div className="user-name">{user.username}</div>
                <div className="user-university">{user.university}</div>
              </div>
            </div>
            
            <button onClick={handleLogout} className="btn btn-secondary logout-btn">
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
