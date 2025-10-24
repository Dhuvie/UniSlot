const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');

// Get all messages with moderation info
router.get('/messages', async (req, res) => {
  try {
    const { slotId, isProfane } = req.query;
    
    let query = db().collection('messages');
    
    if (slotId) {
      query = query.where('slotId', '==', slotId);
    }
    
    if (isProfane !== undefined) {
      query = query.where('moderation.isProfane', '==', isProfane === 'true');
    }
    
    const snapshot = await query.orderBy('timestamp', 'desc').limit(100).get();
    const messages = [];
    
    snapshot.forEach(doc => {
      messages.push({ id: doc.id, ...doc.data() });
    });
    
    res.json({
      total: messages.length,
      messages
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all flagged messages
router.get('/flagged-messages', async (req, res) => {
  try {
    const { slotId, limit = 100 } = req.query;
    
    let query = db().collection('flaggedMessages');
    
    if (slotId) {
      query = query.where('slotId', '==', slotId);
    }
    
    const snapshot = await query
      .orderBy('timestamp', 'desc')
      .limit(parseInt(limit))
      .get();
    
    const flaggedMessages = [];
    
    snapshot.forEach(doc => {
      flaggedMessages.push({ id: doc.id, ...doc.data() });
    });
    
    res.json({
      total: flaggedMessages.length,
      flaggedMessages
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get moderation statistics
router.get('/stats', async (req, res) => {
  try {
    // Get total messages
    const messagesSnapshot = await db().collection('messages').get();
    const totalMessages = messagesSnapshot.size;
    
    // Get flagged messages
    const flaggedSnapshot = await db().collection('flaggedMessages').get();
    const totalFlagged = flaggedSnapshot.size;
    
    // Calculate stats by checker type
    let huggingfaceChecked = 0;
    let ruleBasedChecked = 0;
    
    messagesSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.moderation?.checkedBy === 'huggingface') {
        huggingfaceChecked++;
      } else if (data.moderation?.checkedBy === 'rule-based') {
        ruleBasedChecked++;
      }
    });
    
    flaggedSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.moderation?.checkedBy === 'huggingface') {
        huggingfaceChecked++;
      } else if (data.moderation?.checkedBy === 'rule-based') {
        ruleBasedChecked++;
      }
    });
    
    res.json({
      totalMessages,
      totalFlagged,
      flaggedPercentage: totalMessages > 0 ? ((totalFlagged / (totalMessages + totalFlagged)) * 100).toFixed(2) : 0,
      checkedBy: {
        huggingface: huggingfaceChecked,
        ruleBased: ruleBasedChecked
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete flagged message (admin action)
router.delete('/flagged-messages/:id', async (req, res) => {
  try {
    await db().collection('flaggedMessages').doc(req.params.id).delete();
    res.json({ message: 'Flagged message deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
