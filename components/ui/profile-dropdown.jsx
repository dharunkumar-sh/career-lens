"use client";

import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { getUserDashboardStats } from "@/utils/firebaseConfig";

export default function ProfileDropdown() {
  const { user } = useAuth();
  const [userName, setUserName] = useState("");

  // Fetch user name from Firestore
  useEffect(() => {
    const fetchUserName = async () => {
      if (user?.uid) {
        try {
          const stats = await getUserDashboardStats(user.uid);
          if (stats.name) {
            setUserName(stats.name);
          }
        } catch (error) {
          console.error("Error fetching user name:", error);
        }
      }
    };

    fetchUserName();
  }, [user?.uid]);

  if (!user) {
    return null;
  }

  // Get display name - prioritize Firestore name, then displayName, then email
  const displayName = userName || user.displayName || user.email;
  const initials = userName
    ? userName.charAt(0).toUpperCase()
    : user.displayName
    ? user.displayName.charAt(0).toUpperCase()
    : user.email.charAt(0).toUpperCase();

  return (
    <div
      className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-200"
      title={displayName}
    >
      <span className="text-slate-900 font-bold text-sm">{initials}</span>
    </div>
  );
}
