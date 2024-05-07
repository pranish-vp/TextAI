// Import the functions you need from the SDKs you need

import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth"
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FB_KEY,
  authDomain: "text-ai-18672.firebaseapp.com",
  projectId: "text-ai-18672",
  storageBucket: "text-ai-18672.appspot.com",
  messagingSenderId: "695873127531",
  appId: "1:695873127531:web:eefdadd26f41a6ef075d2e",
  measurementId: "G-WNZB1W999M"
};

// Initialize  Fire-base
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
