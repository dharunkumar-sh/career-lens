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
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDBR0NzEwQOoMVwVVZTxCxjPHt6T4tDTu8",
  authDomain: "career-lens-guide.firebaseapp.com",
  projectId: "career-lens-guide",
  storageBucket: "career-lens-guide.firebasestorage.app",
  messagingSenderId: "394447731286",
  appId: "1:394447731286:web:91c97755345af2385b19f7",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

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

// ============ FIRESTORE DATABASE FUNCTIONS ============

// Save or update user profile
export const saveUserProfile = async (userId, profileData) => {
  try {
    const userRef = doc(db, "users", userId);
    await setDoc(
      userRef,
      {
        ...profileData,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    return { success: true };
  } catch (error) {
    console.error("Error saving user profile:", error);
    throw error;
  }
};

// Get user profile
export const getUserProfile = async (userId) => {
  try {
    const userRef = doc(db, "users", userId);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (error) {
    console.error("Error getting user profile:", error);
    throw error;
  }
};

// Save resume analysis result
export const saveResumeAnalysis = async (userId, analysisData) => {
  try {
    const userRef = doc(db, "users", userId);

    // Save to user's resume analyses subcollection
    const analysesRef = collection(db, "users", userId, "resumeAnalyses");
    const analysisDoc = await addDoc(analysesRef, {
      ...analysisData,
      createdAt: serverTimestamp(),
    });

    // Update the user document with latest analysis summary
    await updateDoc(userRef, {
      latestResumeScore: analysisData.score || 0,
      latestResumeAnalysis: {
        score: analysisData.score,
        skills: analysisData.skills?.present || [],
        analyzedAt: new Date().toISOString(),
      },
      totalResumesAnalyzed: (await getResumeAnalysesCount(userId)) + 1,
      updatedAt: serverTimestamp(),
    });

    return { success: true, analysisId: analysisDoc.id };
  } catch (error) {
    console.error("Error saving resume analysis:", error);
    throw error;
  }
};

// Get resume analyses count
const getResumeAnalysesCount = async (userId) => {
  try {
    const analysesRef = collection(db, "users", userId, "resumeAnalyses");
    const snapshot = await getDocs(analysesRef);
    return snapshot.size;
  } catch (error) {
    return 0;
  }
};

// Get latest resume analysis
export const getLatestResumeAnalysis = async (userId) => {
  try {
    const analysesRef = collection(db, "users", userId, "resumeAnalyses");
    const q = query(analysesRef, orderBy("createdAt", "desc"), limit(1));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
    }
    return null;
  } catch (error) {
    console.error("Error getting latest resume analysis:", error);
    throw error;
  }
};

// Save saved job
export const saveJob = async (userId, jobData) => {
  try {
    const savedJobsRef = collection(db, "users", userId, "savedJobs");

    // Check if job already saved
    const q = query(savedJobsRef, where("jobId", "==", jobData.id));
    const existing = await getDocs(q);

    if (!existing.empty) {
      return { success: true, message: "Job already saved" };
    }

    await addDoc(savedJobsRef, {
      jobId: jobData.id,
      title: jobData.title,
      company: jobData.company,
      location: jobData.location,
      salary: jobData.salary,
      type: jobData.type,
      applyLink: jobData.applyLink,
      matchScore: jobData.matchScore,
      savedAt: serverTimestamp(),
    });

    // Update saved jobs count
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    const currentCount = userDoc.data()?.savedJobsCount || 0;
    await updateDoc(userRef, {
      savedJobsCount: currentCount + 1,
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error saving job:", error);
    throw error;
  }
};

// Remove saved job
export const removeSavedJob = async (userId, jobId) => {
  try {
    const savedJobsRef = collection(db, "users", userId, "savedJobs");
    const q = query(savedJobsRef, where("jobId", "==", jobId));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const { deleteDoc } = await import("firebase/firestore");
      await deleteDoc(snapshot.docs[0].ref);

      // Update saved jobs count
      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);
      const currentCount = userDoc.data()?.savedJobsCount || 0;
      await updateDoc(userRef, {
        savedJobsCount: Math.max(0, currentCount - 1),
        updatedAt: serverTimestamp(),
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Error removing saved job:", error);
    throw error;
  }
};

// Get all saved jobs
export const getSavedJobs = async (userId) => {
  try {
    const savedJobsRef = collection(db, "users", userId, "savedJobs");
    const q = query(savedJobsRef, orderBy("savedAt", "desc"));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting saved jobs:", error);
    throw error;
  }
};

// Track job application
export const trackJobApplication = async (userId, jobData) => {
  try {
    const applicationsRef = collection(db, "users", userId, "applications");
    await addDoc(applicationsRef, {
      jobId: jobData.id,
      title: jobData.title,
      company: jobData.company,
      applyLink: jobData.applyLink,
      appliedAt: serverTimestamp(),
      status: "applied",
    });

    // Update applications count
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    const currentCount = userDoc.data()?.applicationsCount || 0;
    await updateDoc(userRef, {
      applicationsCount: currentCount + 1,
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error tracking application:", error);
    throw error;
  }
};

// Get user dashboard stats
export const getUserDashboardStats = async (userId) => {
  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
        name: data.name || "",
        email: data.email || "",
        resumeScore: data.latestResumeScore || 0,
        savedJobsCount: data.savedJobsCount || 0,
        applicationsCount: data.applicationsCount || 0,
        totalResumesAnalyzed: data.totalResumesAnalyzed || 0,
        skills: data.latestResumeAnalysis?.skills || [],
        lastAnalyzedAt: data.latestResumeAnalysis?.analyzedAt || null,
      };
    }

    return {
      name: "",
      email: "",
      resumeScore: 0,
      savedJobsCount: 0,
      applicationsCount: 0,
      totalResumesAnalyzed: 0,
      skills: [],
      lastAnalyzedAt: null,
    };
  } catch (error) {
    console.error("Error getting dashboard stats:", error);
    throw error;
  }
};

// Initialize user document on signup
export const initializeUserDocument = async (userId, email, name = "") => {
  try {
    const userRef = doc(db, "users", userId);
    await setDoc(userRef, {
      name,
      email,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      latestResumeScore: 0,
      savedJobsCount: 0,
      applicationsCount: 0,
      totalResumesAnalyzed: 0,
    });
    return { success: true };
  } catch (error) {
    console.error("Error initializing user document:", error);
    throw error;
  }
};

export { onAuthStateChanged, applyActionCode };
