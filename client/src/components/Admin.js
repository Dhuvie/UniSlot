import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../config/api';
import { Shield, MessageSquare, AlertTriangle, BarChart3, RefreshCw, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import './Admin.css';

function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [stats, setStats] = useState(null);
  const [messages, setMessages] = useState([]);
  const [flaggedMessages, setFlaggedMessages] = useState([]);
  const [activeTab, setActiveTab] = useState('stats');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const adminAuth = sessionStorage.getItem('adminAuth');
    if (adminAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchStats();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      if (activeTab === 'messages') fetchMessages();
      if (activeTab === 'flagged') fetchFlaggedMessages();
    }
  }, [activeTab, isAuthenticated]);

  const handleLogin = (e) => {
    e.preventDefault();
    setAuthError('');

    if (email === 'thedhruvbajaj@gmail.com' && password === 'adminisbest') {
      setIsAuthenticated(true);
      sessionStorage.setItem('adminAuth', 'true');
    } else {
      setAuthError('Invalid credentials. Access denied.');
      setPassword('');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('adminAuth');
    setEmail('');
    setPassword('');
  };

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/admin/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
    setLoading(false);
  };

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/admin/messages`);
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
    setLoading(false);
  };

  const fetchFlaggedMessages = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/admin/flagged-messages`);
      setFlaggedMessages(response.data.flaggedMessages);
    } catch (error) {
      console.error('Error fetching flagged messages:', error);
    }
    setLoading(false);
  };

  const handleRefresh = () => {
    if (activeTab === 'stats') fetchStats();
    if (activeTab === 'messages') fetchMessages();
    if (activeTab === 'flagged') fetchFlaggedMessages();
  };

  if (!isAuthenticated) {
    return (
      <div className="admin-container">
        <div className="container">
          <div className="admin-login">
            <div className="admin-login-card">
              <Shield size={48} className="login-icon" />
              <h1>Admin Access</h1>
              <p>Enter your credentials to access the admin dashboard</p>

              <form onSubmit={handleLogin} className="login-form">
                {authError && (
                  <div className="error-message">
                    <AlertCircle size={18} />
                    {authError}
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@example.com"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary btn-full">
                  Login
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="container">
        <div className="admin-header">
          <div className="admin-title">
            <Shield size={32} />
            <h1>Admin Dashboard</h1>
          </div>
          <div className="admin-actions">
            <button onClick={handleRefresh} className="btn btn-secondary">
              <RefreshCw size={18} />
              Refresh
            </button>
            <button onClick={handleLogout} className="btn btn-danger">
              Logout
            </button>
          </div>
        </div>

        <div className="admin-tabs">
          <button
            className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            <BarChart3 size={18} />
            Statistics
          </button>
          <button
            className={`tab-btn ${activeTab === 'messages' ? 'active' : ''}`}
            onClick={() => setActiveTab('messages')}
          >
            <MessageSquare size={18} />
            All Messages
          </button>
          <button
            className={`tab-btn ${activeTab === 'flagged' ? 'active' : ''}`}
            onClick={() => setActiveTab('flagged')}
          >
            <AlertTriangle size={18} />
            Flagged Messages
          </button>
        </div>

        {loading && (
          <div className="admin-loading">
            <div className="spinner"></div>
          </div>
        )}

        {!loading && activeTab === 'stats' && stats && (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: '#10b98120', color: '#10b981' }}>
                <MessageSquare size={24} />
              </div>
              <div className="stat-info">
                <div className="stat-label">Total Messages</div>
                <div className="stat-value">{stats.totalMessages}</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: '#ef444420', color: '#ef4444' }}>
                <AlertTriangle size={24} />
              </div>
              <div className="stat-info">
                <div className="stat-label">Flagged Messages</div>
                <div className="stat-value">{stats.totalFlagged}</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: '#f59e0b20', color: '#f59e0b' }}>
                <BarChart3 size={24} />
              </div>
              <div className="stat-info">
                <div className="stat-label">Flagged Rate</div>
                <div className="stat-value">{stats.flaggedPercentage}%</div>
              </div>
            </div>

            <div className="checker-stats">
              <h3>Moderation System Usage</h3>
              <div className="checker-grid">
                <div className="checker-item">
                  <span className="checker-label">Hugging Face AI</span>
                  <span className="checker-value">{stats.checkedBy.huggingface}</span>
                </div>
                <div className="checker-item">
                  <span className="checker-label">Rule-Based Fallback</span>
                  <span className="checker-value">{stats.checkedBy.ruleBased}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {!loading && activeTab === 'messages' && (
          <div className="messages-list">
            <div className="list-header">
              <h3>All Messages ({messages.length})</h3>
            </div>
            {messages.length === 0 ? (
              <div className="empty-state">No messages yet</div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className="message-item">
                  <div className="message-header">
                    <span className="message-user">{msg.username}</span>
                    <span className="message-time">
                      {format(new Date(msg.timestamp), 'MMM dd, yyyy HH:mm')}
                    </span>
                  </div>
                  <div className="message-content">{msg.message}</div>
                  <div className="message-meta">
                    <span className={`badge ${msg.moderation?.isProfane ? 'badge-danger' : 'badge-success'}`}>
                      {msg.moderation?.isProfane ? 'Profane' : 'Clean'}
                    </span>
                    <span className="meta-text">
                      Confidence: {(msg.moderation?.confidence * 100).toFixed(0)}%
                    </span>
                    <span className="meta-text">
                      Checked by: {msg.moderation?.checkedBy}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {!loading && activeTab === 'flagged' && (
          <div className="messages-list">
            <div className="list-header">
              <h3>Flagged Messages ({flaggedMessages.length})</h3>
            </div>
            {flaggedMessages.length === 0 ? (
              <div className="empty-state">No flagged messages</div>
            ) : (
              flaggedMessages.map((msg) => (
                <div key={msg.id} className="message-item flagged">
                  <div className="message-header">
                    <span className="message-user">{msg.username}</span>
                    <span className="message-time">
                      {format(new Date(msg.timestamp), 'MMM dd, yyyy HH:mm')}
                    </span>
                  </div>
                  <div className="message-content">{msg.originalMessage}</div>
                  <div className="message-suggestion">
                    <AlertTriangle size={16} />
                    {msg.moderation?.suggestion}
                  </div>
                  <div className="message-meta">
                    <span className="badge badge-danger">Blocked</span>
                    <span className="meta-text">
                      Confidence: {(msg.moderation?.confidence * 100).toFixed(0)}%
                    </span>
                    <span className="meta-text">
                      Checked by: {msg.moderation?.checkedBy}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Admin;
