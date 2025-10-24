# UniSlot

> A modern slot-based platform connecting university students for collaborative activities, powered by real-time communication and AI-driven content moderation.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)

## Overview

UniSlot is a comprehensive platform designed to enhance university life by enabling students to create and join time-bound activity slots. Whether forming project teams, organizing sports activities, arranging ride-shares, or creating study groups, UniSlot facilitates meaningful connections through an intuitive interface and intelligent moderation.

### Key Highlights

- **Secure Authentication**: Firebase phone OTP verification
- **Real-time Communication**: Socket.IO powered instant messaging
- **AI Moderation**: Hugging Face-powered profanity detection
- **Admin Dashboard**: Comprehensive monitoring and analytics
- **Responsive Design**: Seamless experience across all devices

## Features

### Core Functionality

- **10 Activity Categories**
  - Project Teams - Collaborate on academic projects
  - Sports - Organize athletic activities
  - Ride Share - Coordinate cost-effective transportation
  - Study Groups - Form exam preparation sessions
  - Social Hangout - Casual meetups and networking
  - Music & Arts - Creative collaborations
  - Food & Dining - Group meals and food events
  - Gaming - Gaming sessions and tournaments
  - Photography - Photo walks and projects
  - Volunteering - Community service initiatives

### Advanced Features

- **Real-time Chat**: Instant messaging within activity slots
- **Smart Moderation**: AI-powered content filtering with confidence scoring
- **Message Tracking**: Complete audit trail of all communications
- **Participant Management**: Dynamic slot capacity and member tracking
- **Search & Filter**: Efficient discovery of relevant activities
- **Admin Analytics**: Comprehensive moderation statistics and insights

## Getting Started

### Prerequisites

- Node.js 14.x or higher
- npm or yarn
- Firebase account
- Hugging Face API key (free tier available)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Dhuvie/unislot.git
cd unislot
```

2. **Install dependencies**
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

3. **Configure Firebase**

Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)

**Backend Configuration:**
- Go to Project Settings → Service Accounts
- Generate new private key
- Create `.env` in root directory:

```env
PORT=5000
JWT_SECRET=your_secure_random_string

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY="your_private_key"
FIREBASE_CLIENT_EMAIL=your_service_account_email

# Hugging Face API
HUGGINGFACE_API_KEY=hf_your_api_key
```

**Frontend Configuration:**
- Go to Project Settings → General
- Add web app and copy config
- Create `client/.env`:

```env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

4. **Set up Firebase services**

Enable the following in Firebase Console:
- Authentication → Phone (Sign-in method)
- Firestore Database (Start in test mode for development)

Create Firestore indexes:
```
Collection: slots
- category (Ascending), createdAt (Descending)
- status (Ascending), createdAt (Descending)

Collection: messages
- slotId (Ascending), timestamp (Ascending)
- moderation.isProfane (Ascending), timestamp (Descending)

Collection: flaggedMessages
- slotId (Ascending), timestamp (Descending)
```

5. **Get Hugging Face API Key**
- Sign up at [huggingface.co](https://huggingface.co)
- Go to Settings → Access Tokens
- Create new token with read permissions

### Running the Application

**Development Mode:**
```bash
npm run dev
```

This starts:
- Backend server: `http://localhost:5000`
- Frontend app: `http://localhost:3000`

**Production Build:**
```bash
cd client
npm run build
```

## Project Structure

```
unislot/
├── server/                 # Backend application
│   ├── config/            # Configuration files
│   │   └── firebase.js    # Firebase Admin initialization
│   ├── routes/            # API endpoints
│   │   ├── auth.js        # Authentication routes
│   │   ├── slots.js       # Slot management
│   │   ├── chat.js        # Chat messages
│   │   ├── users.js       # User profiles
│   │   └── admin.js       # Admin endpoints
│   ├── services/          # Business logic
│   │   └── profanityDetection.js  # AI moderation
│   └── index.js           # Server entry point
├── client/                # Frontend application
│   ├── public/            # Static assets
│   └── src/
│       ├── components/    # React components
│       │   ├── PhoneAuth.js      # Authentication
│       │   ├── Dashboard.js      # Main dashboard
│       │   ├── CreateSlot.js     # Slot creation
│       │   ├── SlotDetails.js    # Slot view & chat
│       │   ├── Navbar.js         # Navigation
│       │   └── Admin.js          # Admin dashboard
│       ├── config/        # Configuration
│       │   └── firebase.js       # Firebase client config
│       ├── App.js         # Main app component
│       └── index.js       # Entry point
├── package.json          # Backend dependencies
└── README.md             # This file
```

## API Endpoints

### Authentication
```
POST   /api/auth/verify-phone     # Verify phone OTP and create/login user
GET    /api/auth/profile/:uid     # Get user profile
PUT    /api/auth/profile/:uid     # Update user profile
```

### Slots
```
GET    /api/slots                 # Get all slots (with filters)
GET    /api/slots/:id             # Get specific slot
POST   /api/slots                 # Create new slot
POST   /api/slots/:id/join        # Join a slot
POST   /api/slots/:id/leave       # Leave a slot
DELETE /api/slots/:id             # Delete a slot
```

### Chat
```
GET    /api/chat/:slotId          # Get messages for a slot
POST   /api/chat/:slotId          # Save a message
```

### Admin
```
GET    /api/admin/messages        # Get all messages with moderation info
GET    /api/admin/flagged-messages # Get flagged messages
GET    /api/admin/stats           # Get moderation statistics
DELETE /api/admin/flagged-messages/:id # Delete flagged message
```

### WebSocket Events
```
join-slot        # Join a slot's chat room
send-message     # Send a chat message
receive-message  # Receive a chat message
message-moderated # Receive moderation feedback
```

## Database Schema

### Collections

**users/**
```javascript
{
  id: string,
  phoneNumber: string,
  username: string,
  university: string,
  major: string,
  createdAt: timestamp
}
```

**slots/**
```javascript
{
  title: string,
  description: string,
  category: string,
  maxParticipants: number,
  currentParticipants: number,
  participants: [{id, name, joinedAt}],
  location: string,
  dateTime: timestamp,
  creatorId: string,
  creatorName: string,
  tags: [string],
  requirements: [string],
  status: 'open' | 'full',
  createdAt: timestamp
}
```

**messages/**
```javascript
{
  slotId: string,
  message: string,
  userId: string,
  username: string,
  timestamp: timestamp,
  moderation: {
    isProfane: boolean,
    confidence: number,
    checkedBy: 'huggingface' | 'rule-based',
    checkedAt: timestamp
  }
}
```

**flaggedMessages/**
```javascript
{
  slotId: string,
  originalMessage: string,
  userId: string,
  username: string,
  timestamp: timestamp,
  moderation: {
    isProfane: true,
    confidence: number,
    suggestion: string,
    checkedBy: 'huggingface' | 'rule-based',
    checkedAt: timestamp
  }
}
```

## Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Real-time**: Socket.IO
- **Authentication**: Firebase Admin SDK, JWT
- **Database**: Cloud Firestore
- **AI/ML**: Hugging Face Inference API

### Frontend
- **Framework**: React 18
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Real-time**: Socket.IO Client
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Styling**: Pure CSS with CSS Variables

### AI & Moderation
- **Model**: parsawar/profanity_model_3.1 (Hugging Face)
- **Fallback**: Rule-based detection system
- **Features**: Confidence scoring, real-time moderation

## Security

- Phone number verification via Firebase
- JWT token-based API authentication
- Environment variable protection
- Firestore security rules (configure for production)
- Input validation and sanitization
- XSS prevention through React
- CORS configuration

## Admin Dashboard

Access the admin dashboard at `/admin` (available from login page)

**Features:**
- Real-time moderation statistics
- View all messages with confidence scores
- Monitor flagged content
- Track AI vs rule-based detection usage
- Message audit trail

## Testing

**Using Test Phone Numbers (Free):**

1. Go to Firebase Console → Authentication → Sign-in method
2. Scroll to "Phone numbers for testing"
3. Add test number: `+1 650 555 3434` with code `123456`
4. Use in app without SMS charges

## Deployment

### Backend Deployment
- Deploy to Heroku, Railway, or any Node.js hosting
- Set environment variables
- Configure production Firestore rules

### Frontend Deployment
- Build: `cd client && npm run build`
- Deploy to Netlify, Vercel, or Firebase Hosting
- Update CORS settings in backend

## Future Enhancements

- [ ] Email notifications for slot updates
- [ ] Calendar integration (Google Calendar, Outlook)
- [ ] Advanced AI sentiment analysis
- [ ] User reputation system
- [ ] Mobile app (React Native)
- [ ] Push notifications
- [ ] File sharing in chats
- [ ] Video chat integration
- [ ] Recurring slots
- [ ] University verification system

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- Firebase for authentication and database services
- Hugging Face for AI moderation capabilities
- Socket.IO for real-time communication
- React community for excellent documentation

## Support

For support, open an issue in the repository.

