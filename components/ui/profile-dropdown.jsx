"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { LogOut, User } from "lucide-react";
import { getUserDashboardStats } from "@/utils/firebaseConfig";
import toast from "react-hot-toast";

export default function ProfileDropdown() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      setIsOpen(false);
      router.push("/");
    } catch (error) {
      toast.error("Failed to logout");
      console.error("Logout error:", error);
    }
  };

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
    <div className="relative" ref={dropdownRef}>
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-200 cursor-pointer group"
        title={displayName}
      >
        <span className="text-slate-900 font-bold text-sm">{initials}</span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-56 bg-slate-800 border border-slate-700/50 rounded-lg shadow-xl backdrop-blur-sm py-2 z-50 animate-in fade-in slide-in-from-top-2">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-slate-700/30">
            <p className="text-sm font-semibold text-white truncate">
              {displayName}
            </p>
            <p className="text-xs text-slate-400 truncate">{user.email}</p>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <button
              onClick={() => {
                setIsOpen(false);
                router.push("/dashboard/profile");
              }}
              className="w-full px-4 py-2 text-sm text-slate-300 hover:bg-slate-700/50 flex items-center gap-3 transition-colors cursor-pointer"
            >
              <User className="w-4 h-4" />
              View Profile
            </button>
          </div>

          {/* Logout Button */}
          <div className="border-t border-slate-700/30 py-2">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-3 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
