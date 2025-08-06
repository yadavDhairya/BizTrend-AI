
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  projectId: "biztrend-ai-tiyzm",
  appId: "1:672366636544:web:ed74963731dd0e4edbb2e5",
  storageBucket: "biztrend-ai-tiyzm.firebasestorage.app",
  apiKey: "AIzaSyCkqAnltWrlxJ4F3nqNffEAER1-FscheNU",
  authDomain: "biztrend-ai-tiyzm.firebaseapp.com",
  measurementId: "G-HW8YR56XT9",
  messagingSenderId: "672366636544"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
