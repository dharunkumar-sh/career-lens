"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { auth, onAuthStateChanged, logOut, syncUserProfile } from "@/utils/firebaseConfig";

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeProfile = () => {};

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          emailVerified: firebaseUser.emailVerified,
        });

        // Set up real-time listener for user profile details
        unsubscribeProfile = syncUserProfile(firebaseUser.uid, (profileData) => {
          if (profileData) {
            setProfile(profileData);
          } else {
            setProfile({
              name: firebaseUser.displayName || "",
              email: firebaseUser.email || "",
              photoURL: "",
              status: "Actively Looking",
            });
          }
        });
      } else {
        setUser(null);
        setProfile(null);
        unsubscribeProfile();
      }
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeProfile();
    };
  }, []);

  const logout = async () => {
    setUser(null);
    setProfile(null);
    await logOut();
  };

  // Computed property to check if user is authenticated
  const isAuthenticated = !!(user && user.emailVerified);

  return (
    <AuthContext.Provider value={{ user, profile, loading, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};
