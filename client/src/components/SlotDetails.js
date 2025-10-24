import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
import API_URL from '../config/api';
import { 
  ArrowLeft, Users, MapPin, Calendar, Tag, CheckCircle, 
  Send, Sparkles, AlertCircle, UserPlus, UserMinus, Trash2 
} from 'lucide-react';
import { format } from 'date-fns';
import './SlotDetails.css';

function SlotDetails({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [slot, setSlot] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [moderationWarning, setModerationWarning] = useState(null);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchSlot();
    fetchMessages();
    
    // Initialize socket connection
    socketRef.current = io(API_URL);
    
    socketRef.current.emit('join-slot', id);
    
    socketRef.current.on('receive-message', (data) => {
      setMessages(prev => [...prev, data]);
      scrollToBottom();
    });

    socketRef.current.on('message-moderated', (data) => {
      setModerationWarning(data.suggestion);
      setTimeout(() => setModerationWarning(null), 5000);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [id]);

  const fetchSlot = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/slots/${id}`);
      setSlot(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching slot:', error);
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/chat/${id}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;

    socketRef.current.emit('send-message', {
      slotId: id,
      message: newMessage,
      userId: user.id,
      username: user.username
    });

    setNewMessage('');
  };

  const handleJoinSlot = async () => {
    setJoining(true);
    try {
      const response = await axios.post(`${API_URL}/api/slots/${id}/join`, {
        userId: user.id,
        userName: user.username
      });
      setSlot(response.data);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to join slot');
    } finally {
      setJoining(false);
    }
  };

  const handleLeaveSlot = async () => {
    if (!window.confirm('Are you sure you want to leave this slot?')) return;
    
    try {
      const response = await axios.post(`${API_URL}/api/slots/${id}/leave`, {
        userId: user.id
      });
      setSlot(response.data);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to leave slot');
    }
  };

  const handleDeleteSlot = async () => {
    if (!window.confirm('Are you sure you want to delete this slot? This action cannot be undone.')) return;
    
    try {
      await axios.delete(`${API_URL}/api/slots/${id}`);
      navigate('/dashboard');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete slot');
    }
  };

  const isParticipant = slot?.participants.some(p => p.id === user.id);
  const isCreator = slot?.creatorId === user.id;

  if (loading) {
    return (
      <div className="slot-details-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!slot) {
    return (
      <div className="slot-details-error">
        <AlertCircle size={48} />
        <h2>Slot not found</h2>
        <button onClick={() => navigate('/dashboard')} className="btn btn-primary">
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="slot-details">
      <div className="container">
        <button onClick={() => navigate('/dashboard')} className="back-button">
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>

        <div className="slot-details-grid">
          <div className="slot-info-section fade-in">
            <div className="slot-info-header">
              <div>
                <h1>{slot.title}</h1>
                <p className="slot-category">{slot.category}</p>
              </div>
              {slot.status === 'full' ? (
                <span className="badge badge-danger">Full</span>
              ) : (
                <span className="badge badge-success">Open</span>
              )}
            </div>

            <p className="slot-info-description">{slot.description}</p>

            <div className="slot-info-meta">
              <div className="meta-item">
                <Users size={20} />
                <div>
                  <span className="meta-label">Participants</span>
                  <span className="meta-value">{slot.currentParticipants}/{slot.maxParticipants}</span>
                </div>
              </div>
              <div className="meta-item">
                <MapPin size={20} />
                <div>
                  <span className="meta-label">Location</span>
                  <span className="meta-value">{slot.location}</span>
                </div>
              </div>
              <div className="meta-item">
                <Calendar size={20} />
                <div>
                  <span className="meta-label">Date & Time</span>
                  <span className="meta-value">{format(new Date(slot.dateTime), 'PPpp')}</span>
                </div>
              </div>
            </div>

            {slot.tags.length > 0 && (
              <div className="slot-info-section-block">
                <h3>
                  <Tag size={20} />
                  Tags
                </h3>
                <div className="tags-list">
                  {slot.tags.map((tag, index) => (
                    <span key={index} className="badge badge-primary">{tag}</span>
                  ))}
                </div>
              </div>
            )}

            {slot.requirements.length > 0 && (
              <div className="slot-info-section-block">
                <h3>
                  <CheckCircle size={20} />
                  Requirements
                </h3>
                <ul className="requirements-list">
                  {slot.requirements.map((req, index) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="slot-info-section-block">
              <h3>
                <Users size={20} />
                Participants ({slot.currentParticipants})
              </h3>
              <div className="participants-list">
                {slot.participants.map((participant) => (
                  <div key={participant.id} className="participant-item">
                    <div className="participant-avatar">
                      {participant.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="participant-info">
                      <span className="participant-name">{participant.name}</span>
                      {participant.id === slot.creatorId && (
                        <span className="badge badge-primary">Creator</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="slot-actions">
              {!isParticipant && slot.status !== 'full' && (
                <button 
                  onClick={handleJoinSlot} 
                  className="btn btn-success"
                  disabled={joining}
                >
                  <UserPlus size={18} />
                  {joining ? 'Joining...' : 'Join Slot'}
                </button>
              )}
              {isParticipant && !isCreator && (
                <button onClick={handleLeaveSlot} className="btn btn-secondary">
                  <UserMinus size={18} />
                  Leave Slot
                </button>
              )}
              {isCreator && (
                <button onClick={handleDeleteSlot} className="btn btn-danger">
                  <Trash2 size={18} />
                  Delete Slot
                </button>
              )}
            </div>
          </div>

          <div className="chat-section fade-in">
            <div className="chat-header">
              <h2>Group Chat</h2>
              <Sparkles size={20} className="ai-icon" />
            </div>

            {moderationWarning && (
              <div className="moderation-warning">
                <AlertCircle size={18} />
                {moderationWarning}
              </div>
            )}

            <div className="chat-messages">
              {messages.length === 0 ? (
                <div className="chat-empty">
                  <Sparkles size={48} />
                  <p>No messages yet. Start the conversation!</p>
                  <p className="chat-empty-hint">AI will help keep things positive 😊</p>
                </div>
              ) : (
                messages.map((msg, index) => (
                  <div key={index} className={`message ${msg.userId === user.id ? 'own-message' : ''}`}>
                    <div className="message-avatar">
                      {msg.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="message-content">
                      <div className="message-header">
                        <span className="message-username">{msg.username}</span>
                        <span className="message-time">
                          {format(new Date(msg.timestamp), 'HH:mm')}
                        </span>
                      </div>
                      <p className="message-text">{msg.message}</p>
                      {msg.aiEncouragement && (
                        <div className="ai-encouragement">
                          <Sparkles size={14} />
                          {msg.aiEncouragement}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {isParticipant && (
              <form onSubmit={handleSendMessage} className="chat-input-form">
                <input
                  type="text"
                  className="input chat-input"
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button type="submit" className="btn btn-primary send-btn">
                  <Send size={18} />
                </button>
              </form>
            )}
            {!isParticipant && (
              <div className="chat-locked">
                <Users size={20} />
                Join the slot to participate in the chat
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SlotDetails;
