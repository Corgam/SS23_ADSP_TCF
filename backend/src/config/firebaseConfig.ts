const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};
  
export default {
  apiKey: process.env.FIREBASE_APP_API_KEY ?? firebaseConfig.apiKey,
  authDomain: process.env.FIREBASE_APP_AUTH_DOMAIN ?? firebaseConfig.authDomain,
  projectId: process.env.FIREBASE_APP_PROJECT_ID ?? firebaseConfig.projectId,
  storageBucket: process.env.FIREBASE_APP_STORAGE_BUCKET ?? firebaseConfig.storageBucket,
  messagingSenderId: process.env.FIREBASE_APP_MESSAGE_SENDER_ID ?? firebaseConfig.messagingSenderId,
  appId: process.env.FIREBASE_APP_APP_ID  ?? firebaseConfig.appId,
};