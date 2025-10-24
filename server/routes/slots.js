const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');

// Get all slots
router.get('/', async (req, res) => {
  try {
    const { category, status } = req.query;
    
    let query = db().collection('slots');
    
    if (category) {
      query = query.where('category', '==', category);
    }
    
    if (status) {
      query = query.where('status', '==', status);
    }
    
    const snapshot = await query.orderBy('createdAt', 'desc').get();
    const slots = [];
    
    snapshot.forEach(doc => {
      slots.push({ id: doc.id, ...doc.data() });
    });
    
    res.json(slots);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get slot by ID
router.get('/:id', async (req, res) => {
  try {
    const slotDoc = await db().collection('slots').doc(req.params.id).get();
    
    if (!slotDoc.exists) {
      return res.status(404).json({ message: 'Slot not found' });
    }
    
    res.json({ id: slotDoc.id, ...slotDoc.data() });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create slot
router.post('/', async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      maxParticipants,
      location,
      dateTime,
      creatorId,
      creatorName,
      tags,
      requirements
    } = req.body;

    const slotData = {
      title,
      description,
      category,
      maxParticipants,
      currentParticipants: 1,
      participants: [{
        id: creatorId,
        name: creatorName,
        joinedAt: new Date().toISOString()
      }],
      location,
      dateTime: new Date(dateTime).toISOString(),
      creatorId,
      creatorName,
      tags: tags || [],
      requirements: requirements || [],
      status: 'open',
      createdAt: new Date().toISOString()
    };

    const docRef = await db().collection('slots').add(slotData);
    const newSlot = { id: docRef.id, ...slotData };
    
    res.status(201).json(newSlot);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Join slot
router.post('/:id/join', async (req, res) => {
  try {
    const { userId, userName } = req.body;
    const slotRef = db().collection('slots').doc(req.params.id);
    const slotDoc = await slotRef.get();

    if (!slotDoc.exists) {
      return res.status(404).json({ message: 'Slot not found' });
    }

    const slotData = slotDoc.data();

    if (slotData.currentParticipants >= slotData.maxParticipants) {
      return res.status(400).json({ message: 'Slot is full' });
    }

    if (slotData.participants.some(p => p.id === userId)) {
      return res.status(400).json({ message: 'Already joined this slot' });
    }

    const newParticipant = {
      id: userId,
      name: userName,
      joinedAt: new Date().toISOString()
    };

    const updatedParticipants = [...slotData.participants, newParticipant];
    const updatedCount = slotData.currentParticipants + 1;
    const updatedStatus = updatedCount >= slotData.maxParticipants ? 'full' : 'open';

    await slotRef.update({
      participants: updatedParticipants,
      currentParticipants: updatedCount,
      status: updatedStatus
    });

    const updatedSlot = {
      id: slotDoc.id,
      ...slotData,
      participants: updatedParticipants,
      currentParticipants: updatedCount,
      status: updatedStatus
    };

    res.json(updatedSlot);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Leave slot
router.post('/:id/leave', async (req, res) => {
  try {
    const { userId } = req.body;
    const slotRef = db().collection('slots').doc(req.params.id);
    const slotDoc = await slotRef.get();

    if (!slotDoc.exists) {
      return res.status(404).json({ message: 'Slot not found' });
    }

    const slotData = slotDoc.data();
    const participantIndex = slotData.participants.findIndex(p => p.id === userId);
    
    if (participantIndex === -1) {
      return res.status(400).json({ message: 'Not a participant of this slot' });
    }

    const updatedParticipants = slotData.participants.filter(p => p.id !== userId);
    const updatedCount = slotData.currentParticipants - 1;
    const updatedStatus = 'open';

    await slotRef.update({
      participants: updatedParticipants,
      currentParticipants: updatedCount,
      status: updatedStatus
    });

    const updatedSlot = {
      id: slotDoc.id,
      ...slotData,
      participants: updatedParticipants,
      currentParticipants: updatedCount,
      status: updatedStatus
    };

    res.json(updatedSlot);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete slot
router.delete('/:id', async (req, res) => {
  try {
    const slotRef = db().collection('slots').doc(req.params.id);
    const slotDoc = await slotRef.get();

    if (!slotDoc.exists) {
      return res.status(404).json({ message: 'Slot not found' });
    }

    await slotRef.delete();
    
    // Also delete associated messages
    const messagesSnapshot = await db().collection('messages')
      .where('slotId', '==', req.params.id)
      .get();
    
    const batch = db().batch();
    messagesSnapshot.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    res.json({ message: 'Slot deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
