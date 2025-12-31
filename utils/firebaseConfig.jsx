// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  onAuthStateChanged,
  applyActionCode,
} from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "career-lens-guide.firebaseapp.com",
  projectId: "career-lens-guide",
  storageBucket: "career-lens-guide.firebasestorage.app",
  messagingSenderId: "394447731286",
  appId: "1:394447731286:web:91c97755345af2385b19f7",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Auth helper functions
export const signUp = async (email, password) => {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );
  // Send email verification
  await sendEmailVerification(userCredential.user);
  return userCredential;
};

export const logIn = async (email, password) => {
  return await signInWithEmailAndPassword(auth, email, password);
};

export const logOut = async () => {
  return await signOut(auth);
};

export const resetPassword = async (email) => {
  return await sendPasswordResetEmail(auth, email);
};

export const resendVerificationEmail = async (user) => {
  return await sendEmailVerification(user);
};

export { onAuthStateChanged, applyActionCode };
