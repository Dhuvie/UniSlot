const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');

// Get user profile
router.get('/:id', async (req, res) => {
  try {
    const userDoc = await db().collection('users').doc(req.params.id).get();
    
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

module.exports = router;
