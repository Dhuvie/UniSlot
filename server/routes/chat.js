const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');

// Get messages for a slot
router.get('/:slotId', async (req, res) => {
  try {
    const messagesSnapshot = await db().collection('messages')
      .where('slotId', '==', req.params.slotId)
      .orderBy('timestamp', 'asc')
      .get();

    const messages = [];
    messagesSnapshot.forEach(doc => {
      messages.push({ id: doc.id, ...doc.data() });
    });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Save message
router.post('/:slotId', async (req, res) => {
  try {
    const { slotId } = req.params;
    const { message, userId, username } = req.body;

    const messageData = {
      slotId,
      message,
      userId,
      username,
      timestamp: new Date().toISOString()
    };

    const docRef = await db().collection('messages').add(messageData);
    const newMessage = { id: docRef.id, ...messageData };

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
