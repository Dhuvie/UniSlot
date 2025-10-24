import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../config/api';
import { Briefcase, Dumbbell, Car, BookOpen, MapPin, Calendar, Users, Tag, AlertCircle, Coffee, Music, Utensils, Gamepad2, Camera, Heart } from 'lucide-react';
import './CreateSlot.css';

const categories = [
  { name: 'Project Team', icon: Briefcase, color: '#6366f1' },
  { name: 'Sports', icon: Dumbbell, color: '#10b981' },
  { name: 'Ride Share', icon: Car, color: '#f59e0b' },
  { name: 'Study Group', icon: BookOpen, color: '#8b5cf6' },
  { name: 'Social Hangout', icon: Coffee, color: '#ec4899' },
  { name: 'Music & Arts', icon: Music, color: '#f97316' },
  { name: 'Food & Dining', icon: Utensils, color: '#14b8a6' },
  { name: 'Gaming', icon: Gamepad2, color: '#a855f7' },
  { name: 'Photography', icon: Camera, color: '#06b6d4' },
  { name: 'Volunteering', icon: Heart, color: '#ef4444' }
];

function CreateSlot({ user }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    maxParticipants: 2,
    location: '',
    dateTime: '',
    tags: '',
    requirements: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleCategorySelect = (category) => {
    setFormData({
      ...formData,
      category
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.category) {
      setError('Please select a category');
      setLoading(false);
      return;
    }

    try {
      const slotData = {
        ...formData,
        creatorId: user.id,
        creatorName: user.username,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        requirements: formData.requirements.split(',').map(req => req.trim()).filter(req => req),
        maxParticipants: parseInt(formData.maxParticipants)
      };

      const response = await axios.post(`${API_URL}/api/slots`, slotData);
      navigate(`/slot/${response.data.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create slot. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-slot">
      <div className="container">
        <div className="create-slot-card fade-in">
          <div className="create-slot-header">
            <h1>Create New Slot</h1>
            <p>Set up an activity and connect with fellow students</p>
          </div>

          <form onSubmit={handleSubmit} className="create-slot-form">
            {error && (
              <div className="error-message">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            <div className="form-section">
              <label className="form-label">Category *</label>
              <div className="category-grid">
                {categories.map(cat => {
                  const Icon = cat.icon;
                  return (
                    <div
                      key={cat.name}
                      className={`category-option ${formData.category === cat.name ? 'selected' : ''}`}
                      onClick={() => handleCategorySelect(cat.name)}
                      style={{
                        borderColor: formData.category === cat.name ? cat.color : 'transparent',
                        backgroundColor: formData.category === cat.name ? `${cat.color}10` : 'transparent'
                      }}
                    >
                      <Icon size={32} style={{ color: cat.color }} />
                      <span>{cat.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="form-section">
              <label htmlFor="title" className="form-label">Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                className="input"
                placeholder="e.g., Need 2 teammates for AI project"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-section">
              <label htmlFor="description" className="form-label">Description *</label>
              <textarea
                id="description"
                name="description"
                className="input textarea"
                placeholder="Describe your activity, goals, and what you're looking for..."
                value={formData.description}
                onChange={handleChange}
                rows="4"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-section">
                <label htmlFor="maxParticipants" className="form-label">
                  <Users size={18} />
                  Max Participants *
                </label>
                <input
                  type="number"
                  id="maxParticipants"
                  name="maxParticipants"
                  className="input"
                  min="2"
                  max="50"
                  value={formData.maxParticipants}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-section">
                <label htmlFor="dateTime" className="form-label">
                  <Calendar size={18} />
                  Date & Time *
                </label>
                <input
                  type="datetime-local"
                  id="dateTime"
                  name="dateTime"
                  className="input"
                  value={formData.dateTime}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-section">
              <label htmlFor="location" className="form-label">
                <MapPin size={18} />
                Location *
              </label>
              <input
                type="text"
                id="location"
                name="location"
                className="input"
                placeholder="e.g., Library 3rd Floor, Campus Gym, Main Gate"
                value={formData.location}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-section">
              <label htmlFor="tags" className="form-label">
                <Tag size={18} />
                Tags (comma-separated)
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                className="input"
                placeholder="e.g., Machine Learning, Python, Beginner-friendly"
                value={formData.tags}
                onChange={handleChange}
              />
            </div>

            <div className="form-section">
              <label htmlFor="requirements" className="form-label">
                Requirements (comma-separated)
              </label>
              <input
                type="text"
                id="requirements"
                name="requirements"
                className="input"
                placeholder="e.g., Python experience, Own laptop, Available weekends"
                value={formData.requirements}
                onChange={handleChange}
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/dashboard')}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Creating...' : 'Create Slot'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateSlot;
