const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { auth, db } = require('../config/firebase');

router.post('/verify-phone', async (req, res) => {
  try {
    const { idToken, username, university, major } = req.body;
    const decodedToken = await auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;
    const phoneNumber = decodedToken.phone_number;

    const userRef = db().collection('users').doc(uid);
    const userDoc = await userRef.get();
    let userData;

    if (!userDoc.exists) {
      userData = {
        id: uid,
        phoneNumber,
        username: username || `User_${uid.substring(0, 8)}`,
        university: university || '',
        major: major || '',
        createdAt: new Date().toISOString()
      };
      await userRef.set(userData);
    } else {
      userData = userDoc.data();
      if (username || university || major) {
        const updates = {};
        if (username) updates.username = username;
        if (university) updates.university = university;
        if (major) updates.major = major;
        await userRef.update(updates);
        userData = { ...userData, ...updates };
      }
    }

    const token = jwt.sign(
      { id: uid, phoneNumber },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: userData.id,
        username: userData.username,
        phoneNumber: userData.phoneNumber,
        university: userData.university,
        major: userData.major
      }
    });
  } catch (error) {
    console.error('Phone verification error:', error);
    res.status(401).json({ message: 'Invalid token', error: error.message });
  }
});

// Get user profile
router.get('/profile/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    
    const userDoc = await db().collection('users').doc(uid).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userData = userDoc.data();
    res.json({
      id: userData.id,
      username: userData.username,
      phoneNumber: userData.phoneNumber,
      university: userData.university,
      major: userData.major
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update user profile
router.put('/profile/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    const { username, university, major } = req.body;

    const updates = {};
    if (username) updates.username = username;
    if (university) updates.university = university;
    if (major) updates.major = major;
    updates.updatedAt = new Date().toISOString();

    await db().collection('users').doc(uid).update(updates);

    res.json({ message: 'Profile updated successfully', updates });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
