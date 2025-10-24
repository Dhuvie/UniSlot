const admin = require('firebase-admin');

const initializeFirebase = () => {
  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
      const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    } else {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL
        })
      });
    }
  } catch (error) {
    console.error('Firebase init error:', error);
  }
};

const db = () => admin.firestore();
const auth = () => admin.auth();

module.exports = {
  initializeFirebase,
  db,
  auth,
  admin
};
