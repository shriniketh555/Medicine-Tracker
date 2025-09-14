import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD2RIOEE3bFk3IqxRnqLPlOe-i20pkOhng",
  authDomain: "medicine-tracker-10c96.firebaseapp.com",
  projectId: "medicine-tracker-10c96",
  storageBucket: "medicine-tracker-10c96.appspot.com",
  messagingSenderId: "989640599897",
  appId: "1:989640599897:web:00802c0594ff4ca25bc448",
  measurementId: "G-REBCC6TJX8"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);