import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../config/api';
import { Search, Filter, Users, MapPin, Calendar, Briefcase, Dumbbell, Car, BookOpen, Coffee, Music, Utensils, Gamepad2, Camera, Heart } from 'lucide-react';
import { format } from 'date-fns';
import './Dashboard.css';

const categoryIcons = {
  'Project Team': Briefcase,
  'Sports': Dumbbell,
  'Ride Share': Car,
  'Study Group': BookOpen,
  'Social Hangout': Coffee,
  'Music & Arts': Music,
  'Food & Dining': Utensils,
  'Gaming': Gamepad2,
  'Photography': Camera,
  'Volunteering': Heart
};

const categoryColors = {
  'Project Team': '#6366f1',
  'Sports': '#10b981',
  'Ride Share': '#f59e0b',
  'Study Group': '#8b5cf6',
  'Social Hangout': '#ec4899',
  'Music & Arts': '#f97316',
  'Food & Dining': '#14b8a6',
  'Gaming': '#a855f7',
  'Photography': '#06b6d4',
  'Volunteering': '#ef4444'
};

function Dashboard({ user }) {
  const [slots, setSlots] = useState([]);
  const [filteredSlots, setFilteredSlots] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSlots();
  }, []);

  useEffect(() => {
    filterSlots();
  }, [searchTerm, selectedCategory, slots]);

  const fetchSlots = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/slots`);
      setSlots(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching slots:', error);
      setLoading(false);
    }
  };

  const filterSlots = () => {
    let filtered = [...slots];

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(slot => slot.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(slot =>
        slot.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        slot.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        slot.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredSlots(filtered);
  };

  const getStatusBadge = (slot) => {
    if (slot.status === 'full') {
      return <span className="badge badge-danger">Full</span>;
    }
    if (slot.currentParticipants >= slot.maxParticipants * 0.8) {
      return <span className="badge badge-warning">Almost Full</span>;
    }
    return <span className="badge badge-success">Open</span>;
  };

  const handleSlotClick = (slotId) => {
    navigate(`/slot/${slotId}`);
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header fade-in">
          <div>
            <h1>Discover Slots</h1>
            <p>Find and join activities that match your interests</p>
          </div>
        </div>

        <div className="dashboard-filters fade-in">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search slots by title, description, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input"
            />
          </div>

          <div className="category-filters">
            <button
              className={`category-btn ${selectedCategory === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('all')}
            >
              <Filter size={18} />
              All
            </button>
            {Object.keys(categoryIcons).map(category => {
              const Icon = categoryIcons[category];
              return (
                <button
                  key={category}
                  className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category)}
                  style={{
                    borderColor: selectedCategory === category ? categoryColors[category] : 'transparent',
                    color: selectedCategory === category ? categoryColors[category] : 'inherit'
                  }}
                >
                  <Icon size={18} />
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        <div className="slots-grid">
          {filteredSlots.length === 0 ? (
            <div className="no-slots">
              <Users size={48} />
              <h3>No slots found</h3>
              <p>Try adjusting your filters or create a new slot</p>
            </div>
          ) : (
            filteredSlots.map(slot => {
              const Icon = categoryIcons[slot.category];
              return (
                <div
                  key={slot.id}
                  className="slot-card fade-in"
                  onClick={() => handleSlotClick(slot.id)}
                >
                  <div className="slot-header">
                    <div
                      className="slot-icon"
                      style={{ backgroundColor: `${categoryColors[slot.category]}20`, color: categoryColors[slot.category] }}
                    >
                      {Icon && <Icon size={24} />}
                    </div>
                    {getStatusBadge(slot)}
                  </div>

                  <h3 className="slot-title">{slot.title}</h3>
                  <p className="slot-description">{slot.description}</p>

                  <div className="slot-meta">
                    <div className="slot-meta-item">
                      <Users size={16} />
                      <span>{slot.currentParticipants}/{slot.maxParticipants} joined</span>
                    </div>
                    <div className="slot-meta-item">
                      <MapPin size={16} />
                      <span>{slot.location}</span>
                    </div>
                    <div className="slot-meta-item">
                      <Calendar size={16} />
                      <span>{format(new Date(slot.dateTime), 'MMM dd, yyyy')}</span>
                    </div>
                  </div>

                  {slot.tags.length > 0 && (
                    <div className="slot-tags">
                      {slot.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="badge badge-primary">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="slot-footer">
                    <span className="slot-creator">by {slot.creatorName}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
