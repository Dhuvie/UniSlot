const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const { initializeFirebase } = require('./config/firebase');
initializeFirebase();

const { moderateMessage } = require('./services/profanityDetection');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "https://uni-slot.vercel.app"
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://uni-slot.vercel.app"
  ],
  credentials: true
}));
app.use(express.json());

const authRoutes = require('./routes/auth');
const slotRoutes = require('./routes/slots');
const chatRoutes = require('./routes/chat');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');

app.use('/api/auth', authRoutes);
app.use('/api/slots', slotRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

io.on('connection', (socket) => {

  socket.on('join-slot', (slotId) => {
    socket.join(slotId);
  });

  socket.on('send-message', async (data) => {
    const { slotId, message, userId, username } = data;
    const moderationResult = await moderateMessage(message);
    
    if (moderationResult.isPositive) {
      const messageData = {
        slotId,
        message,
        userId,
        username,
        timestamp: new Date().toISOString(),
        moderation: {
          isProfane: false,
          confidence: moderationResult.confidence,
          checkedBy: moderationResult.fallback ? 'rule-based' : 'huggingface',
          checkedAt: new Date().toISOString()
        }
      };
      
      const { db } = require('./config/firebase');
      await db().collection('messages').add(messageData);
      
      io.to(slotId).emit('receive-message', {
        message,
        userId,
        username,
        timestamp: new Date(),
        aiEncouragement: moderationResult.encouragement
      });
    } else {
      const flaggedMessageData = {
        slotId,
        originalMessage: message,
        userId,
        username,
        timestamp: new Date().toISOString(),
        moderation: {
          isProfane: true,
          confidence: moderationResult.confidence,
          suggestion: moderationResult.suggestion,
          checkedBy: moderationResult.fallback ? 'rule-based' : 'huggingface',
          checkedAt: new Date().toISOString()
        }
      };
      
      const { db } = require('./config/firebase');
      await db().collection('flaggedMessages').add(flaggedMessageData);
      
      socket.emit('message-moderated', {
        original: message,
        suggestion: moderationResult.suggestion,
        confidence: moderationResult.confidence
      });
    }
  });

  socket.on('disconnect', () => {});
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
