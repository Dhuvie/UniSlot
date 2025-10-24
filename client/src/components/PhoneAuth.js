import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '../config/firebase';
import axios from 'axios';
import API_URL from '../config/api';
import { Users, Phone, Lock, AlertCircle, User, GraduationCap, Building, Shield } from 'lucide-react';
import './Auth.css';

function PhoneAuth({ onLogin }) {
  const [step, setStep] = useState('phone'); // 'phone' or 'otp' or 'profile'
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState({
    username: '',
    university: '',
    major: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    };
  }, []);

  const setupRecaptcha = () => {
    try {
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
          callback: () => {},
          'expired-callback': () => {
            if (window.recaptchaVerifier) {
              window.recaptchaVerifier.clear();
              window.recaptchaVerifier = null;
            }
          }
        });
      }
    } catch (error) {
      console.error('reCAPTCHA setup error:', error);
      throw error;
    }
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch (e) {}
        window.recaptchaVerifier = null;
      }

      setupRecaptcha();
      const appVerifier = window.recaptchaVerifier;
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(confirmation);
      setStep('otp');
      setLoading(false);
    } catch (err) {
      console.error('OTP send error:', err);
      let errorMessage = 'Failed to send OTP. ';
      
      if (err.code === 'auth/invalid-phone-number') {
        errorMessage = 'Invalid phone number. Please include country code (e.g., +1234567890)';
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = 'Too many requests. Please try again later.';
      } else if (err.code === 'auth/quota-exceeded') {
        errorMessage = 'SMS quota exceeded. Please use a test phone number.';
      } else {
        errorMessage += err.message || 'Please try again.';
      }
      
      setError(errorMessage);
      setLoading(false);
      
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch (e) {}
        window.recaptchaVerifier = null;
      }
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await confirmationResult.confirm(otp);
      const user = result.user;
      const idToken = await user.getIdToken();
      
      try {
        await axios.get(`${API_URL}/api/auth/profile/${user.uid}`);
        const verifyResponse = await axios.post(`${API_URL}/api/auth/verify-phone`, {
          idToken
        });
        onLogin(verifyResponse.data.user, verifyResponse.data.token);
        navigate('/dashboard');
      } catch (profileError) {
        setStep('profile');
      }
      
      setLoading(false);
    } catch (err) {
      console.error('OTP verification error:', err);
      setError('Invalid OTP. Please try again.');
      setLoading(false);
    }
  };

  const handleCompleteProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = auth.currentUser;
      const idToken = await user.getIdToken();
      
      const response = await axios.post(`${API_URL}/api/auth/verify-phone`, {
        idToken,
        username: userProfile.username,
        university: userProfile.university,
        major: userProfile.major
      });
      
      onLogin(response.data.user, response.data.token);
      navigate('/dashboard');
    } catch (err) {
      console.error('Profile creation error:', err);
      setError('Failed to create profile. Please try again.');
      setLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    setUserProfile({
      ...userProfile,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="auth-container">
      <div className="auth-card fade-in">
        <div className="auth-header">
          <Users size={48} className="auth-icon" />
          <h1>Welcome to UniSlot</h1>
          <p>Sign in with your phone number</p>
        </div>

        {step === 'phone' && (
          <form onSubmit={handleSendOTP} className="auth-form">
            {error && (
              <div className="error-message">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="phone">
                <Phone size={18} />
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                className="input"
                placeholder="+1234567890 (with country code)"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />
              <small style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                Include country code (e.g., +1 for US, +91 for India)
              </small>
            </div>

            <div id="recaptcha-container"></div>

            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        )}

        {step === 'phone' && (
          <div className="auth-footer">
            <button 
              onClick={() => navigate('/admin')} 
              className="admin-link"
            >
              <Shield size={16} />
              Admin Access
            </button>
          </div>
        )}

        {step === 'otp' && (
          <form onSubmit={handleVerifyOTP} className="auth-form">
            {error && (
              <div className="error-message">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="otp">
                <Lock size={18} />
                Enter OTP
              </label>
              <input
                type="text"
                id="otp"
                name="otp"
                className="input"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength="6"
                required
              />
              <small style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                OTP sent to {phoneNumber}
              </small>
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>

            <button 
              type="button" 
              onClick={() => setStep('phone')} 
              className="btn btn-secondary btn-full"
              style={{ marginTop: '0.5rem' }}
            >
              Change Phone Number
            </button>
          </form>
        )}

        {step === 'profile' && (
          <form onSubmit={handleCompleteProfile} className="auth-form">
            {error && (
              <div className="error-message">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="username">
                <User size={18} />
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                className="input"
                placeholder="Choose a username"
                value={userProfile.username}
                onChange={handleProfileChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="university">
                <Building size={18} />
                University
              </label>
              <input
                type="text"
                id="university"
                name="university"
                className="input"
                placeholder="Your university name"
                value={userProfile.university}
                onChange={handleProfileChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="major">
                <GraduationCap size={18} />
                Major
              </label>
              <input
                type="text"
                id="major"
                name="major"
                className="input"
                placeholder="Your field of study"
                value={userProfile.major}
                onChange={handleProfileChange}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'Creating Profile...' : 'Complete Profile'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default PhoneAuth;
