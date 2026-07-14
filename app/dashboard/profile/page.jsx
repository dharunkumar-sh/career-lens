"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { saveUserProfile, getUserProfile, syncUserProfile } from "@/utils/firebaseConfig";
import {
  Briefcase,
  ArrowLeft,
  User,
  Mail,
  Phone,
  Linkedin,
  Github,
  Save,
  Loader2,
  ChevronRight,
  ChevronLeft,
  Camera,
  Calendar
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { user, profile: globalProfile, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  
  // Ref for file input
  const fileInputRef = useRef(null);
  
  // Step/Tab Pagination state
  const [activeTab, setActiveTab] = useState("basic");

  // Modal states for image customization
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempImage, setTempImage] = useState("");
  const [zoom, setZoom] = useState(1.2);
  const [filter, setFilter] = useState("none");
  const [savingImage, setSavingImage] = useState(false);
  
  // Drag states for image positioning
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  
  const [profile, setProfile] = useState({
    displayName: "",
    email: "",
    phone: "",
    dob: "",
    countryCode: "+1",
    status: "Actively Looking",
    title: "",
    bio: "",
    linkedin: "",
    github: "",
    skills: "",
    experience: "",
    photoURL: "",
  });

  const tabs = [
    { id: "basic", label: "Basic Info" },
    { id: "professional", label: "Professional Details" },
    { id: "social", label: "Social Links" },
    { id: "preview", label: "View Profile" },
  ];

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

  // Load user data from context profile in real-time
  useEffect(() => {
    if (globalProfile) {
      setProfile({
        displayName: globalProfile.name || user?.displayName || "",
        email: globalProfile.email || user?.email || "",
        phone: globalProfile.phone || "",
        dob: globalProfile.dob || "",
        countryCode: globalProfile.countryCode || "+1",
        status: globalProfile.status || "Actively Looking",
        title: globalProfile.title || "",
        bio: globalProfile.bio || "",
        linkedin: globalProfile.linkedin || "",
        github: globalProfile.github || "",
        skills: globalProfile.skills || "",
        experience: globalProfile.experience || "",
        photoURL: globalProfile.photoURL || "",
      });
      setLoadingProfile(false);
    } else if (!loading && !globalProfile) {
      if (user) {
        setProfile((prev) => ({
          ...prev,
          displayName: user.displayName || "",
          email: user.email || "",
        }));
      }
      setLoadingProfile(false);
    }
  }, [globalProfile, user, loading]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let finalValue = value;
    
    if (name === "linkedin") {
      try {
        if (value.includes("linkedin.com")) {
          const parts = value.split("linkedin.com/in/");
          if (parts[1]) {
            finalValue = parts[1].split("/")[0].split("?")[0];
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
    
    if (name === "github") {
      try {
        if (value.includes("github.com")) {
          const parts = value.split("github.com/");
          if (parts[1]) {
            finalValue = parts[1].split("/")[0].split("?")[0];
          }
        }
      } catch (err) {
        console.error(err);
      }
    }

    setProfile((prev) => ({ ...prev, [name]: finalValue }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image size should be less than 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempImage(reader.result);
        setZoom(1.2);
        setFilter("none");
        setPosition({ x: 0, y: 0 });
        setIsModalOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  // Mouse Drag Handlers
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch Drag Handlers (for mobile support)
  const handleTouchStart = (e) => {
    if (e.touches[0]) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y
      });
    }
  };

  const handleTouchMove = (e) => {
    if (!isDragging || !e.touches[0]) return;
    setPosition({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y
    });
  };

  const handleSaveImage = async () => {
    setSavingImage(true);
    try {
      const img = new window.Image();
      img.src = tempImage;
      img.onload = async () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        
        // Define square size
        const size = Math.min(img.width, img.height);
        canvas.width = 400;
        canvas.height = 400;

        if (ctx) {
          ctx.filter = filter;
          
          const sx = (img.width - size) / 2;
          const sy = (img.height - size) / 2;

          // Scale the drag offset from preview coordinates (192px width) to canvas coordinates (400px width)
          const scaleRatio = 400 / 192;
          const dx = position.x * scaleRatio;
          const dy = position.y * scaleRatio;

          ctx.translate(canvas.width / 2 + dx, canvas.height / 2 + dy);
          ctx.scale(zoom, zoom);
          ctx.translate(-canvas.width / 2, -canvas.height / 2);

          ctx.drawImage(
            img,
            sx, sy, size, size,
            0, 0, canvas.width, canvas.height
          );
        }

        const processedBase64 = canvas.toDataURL("image/jpeg", 0.85);

        // Update local profile state
        setProfile((prev) => ({ ...prev, photoURL: processedBase64 }));

        // Save immediately to Firestore
        if (user?.uid) {
          await saveUserProfile(user.uid, {
            photoURL: processedBase64
          });
          toast.success("Profile picture updated successfully!");
        }
        setIsModalOpen(false);
        setSavingImage(false);
      };
    } catch (error) {
      console.error("Error processing profile image:", error);
      toast.error("Failed to save profile picture.");
      setSavingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setSaving(true);

    try {
      if (user?.uid) {
        await saveUserProfile(user.uid, {
          name: profile.displayName,
          phone: profile.phone,
          dob: profile.dob,
          countryCode: profile.countryCode,
          status: profile.status,
          title: profile.title,
          bio: profile.bio,
          linkedin: profile.linkedin,
          github: profile.github,
          skills: profile.skills,
          experience: profile.experience,
          photoURL: profile.photoURL,
        });
        toast.success("Profile updated successfully!");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading || loadingProfile) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen">
      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Back Button */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-all duration-200 mb-8 cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Dashboard</span>
        </Link>

        {/* Page Header */}
        <div className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-linear-to-br from-cyan-500/10 to-blue-500/10 rounded-2xl flex items-center justify-center border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
              <User className="w-7 h-7 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">My Profile</h1>
              <p className="text-slate-400 mt-1">
                Manage your career preferences, contact details, and platform credentials
              </p>
            </div>
          </div>
        </div>

        {/* Step Progress Indicator (Form Pagination) */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center mb-8 bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-2 gap-2">
          {tabs.map((tab, idx) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 text-center py-3 rounded-xl font-semibold transition-all duration-200 cursor-pointer ${
                activeTab === tab.id
                  ? "bg-linear-to-r from-cyan-500 to-blue-500 text-slate-900 shadow-md shadow-cyan-950/20"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              }`}
            >
              <span className={`mr-2 text-xs px-2 py-0.5 rounded-full ${
                activeTab === tab.id ? "bg-slate-900/20 text-slate-950 font-bold" : "bg-white/10 text-slate-400"
              }`}>{idx + 1}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Active Tab Contents */}
          {activeTab === "basic" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* Avatar Section */}
              <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-xl shadow-black/10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl -z-10 group-hover:bg-cyan-500/10 transition-colors duration-500" />
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-24 h-24 rounded-full bg-linear-to-br from-cyan-400 via-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-4 ring-white/10 group-hover:scale-105 transition-transform duration-300 cursor-pointer overflow-hidden relative group/avatar shrink-0"
                  >
                    {profile.photoURL ? (
                      <Image
                        src={profile.photoURL}
                        alt="Profile Picture"
                        fill
                        className="object-cover w-full h-full"
                        unoptimized
                      />
                    ) : (
                      <span className="text-white font-extrabold text-3xl">
                        {profile.displayName
                          ? profile.displayName.charAt(0).toUpperCase()
                          : profile.email.charAt(0).toUpperCase()}
                      </span>
                    )}
                    {/* Hover camera overlay */}
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-200">
                      <Camera className="w-6 h-6 text-white mb-1" />
                      <span className="text-[10px] text-white font-semibold uppercase tracking-wider">Upload</span>
                    </div>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <div className="text-center sm:text-left">
                    <h2 className="text-2xl font-bold text-white tracking-tight">
                      {profile.displayName || "Your Name"}
                    </h2>
                    <p className="text-slate-400 mt-1 flex items-center gap-2 justify-center sm:justify-start">
                      <Mail className="w-4 h-4 text-cyan-400" />
                      <span>{profile.email}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Basic Info Fields */}
              <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-xl shadow-black/10">
                <h2 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4">
                  Basic Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        name="displayName"
                        value={profile.displayName}
                        onChange={handleChange}
                        placeholder="John Doe"
                        className="w-full pl-10 pr-4 py-3 bg-slate-950/45 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        value={profile.email}
                        disabled
                        className="w-full pl-10 pr-4 py-3 bg-slate-950/20 border border-white/5 rounded-xl text-slate-500 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      Date of Birth
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <input
                        type="date"
                        name="dob"
                        value={profile.dob}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 bg-slate-950/45 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition-all duration-200 cursor-pointer scheme-dark"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        value={profile.phone}
                        onChange={handleChange}
                        placeholder="+91 98765 43210"
                        className="w-full pl-10 pr-4 py-3 bg-slate-950/45 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Footer Controls */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveTab("professional")}
                  className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-cyan-950/20 transition-all duration-200 flex items-center gap-2 cursor-pointer"
                >
                  <span>Next Step</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {activeTab === "professional" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-xl shadow-black/10">
                <h2 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4">
                  Professional Details
                </h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      Job Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={profile.title}
                      onChange={handleChange}
                      placeholder="Senior Software Engineer"
                      className="w-full px-4 py-3 bg-slate-950/45 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      Bio / Summary
                    </label>
                    <textarea
                      name="bio"
                      value={profile.bio}
                      onChange={handleChange}
                      placeholder="Tell us about yourself, your career highlights, and goals..."
                      rows={4}
                      className="w-full px-4 py-3 bg-slate-950/45 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition-all duration-200 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      Skills (comma separated)
                    </label>
                    <input
                      type="text"
                      name="skills"
                      value={profile.skills}
                      onChange={handleChange}
                      placeholder="JavaScript, React, Node.js, Python"
                      className="w-full px-4 py-3 bg-slate-950/45 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      Years of Experience
                    </label>
                    <input
                      type="text"
                      name="experience"
                      value={profile.experience}
                      onChange={handleChange}
                      placeholder="5 years"
                      className="w-full px-4 py-3 bg-slate-950/45 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition-all duration-200"
                    />
                  </div>
                </div>
              </div>

              {/* Form Footer Controls */}
              <div className="flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setActiveTab("basic")}
                  className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/10 font-bold rounded-xl transition-all duration-200 flex items-center gap-2 cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("social")}
                  className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-cyan-950/20 transition-all duration-200 flex items-center gap-2 cursor-pointer"
                >
                  <span>Next Step</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {activeTab === "social" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-xl shadow-black/10">
                <h2 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4">
                  Social Links
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      LinkedIn Username
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                        <Linkedin className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        name="linkedin"
                        value={profile.linkedin}
                        onChange={handleChange}
                        placeholder="Enter LinkedIn username"
                        className="w-full pl-10 pr-4 py-3 bg-slate-950/45 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      GitHub Username
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                        <Github className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        name="github"
                        value={profile.github}
                        onChange={handleChange}
                        placeholder="Enter GitHub username"
                        className="w-full pl-10 pr-4 py-3 bg-slate-950/45 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Footer Controls */}
              <div className="flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setActiveTab("professional")}
                  className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/10 font-bold rounded-xl transition-all duration-200 flex items-center gap-2 cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                  <span>Back</span>
                </button>
                <div className="flex items-center gap-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/10 font-bold rounded-xl transition-all duration-200 flex items-center gap-2 cursor-pointer"
                  >
                    {saving ? "Saving..." : "Save Progress"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("preview")}
                    className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-cyan-950/20 transition-all duration-200 flex items-center gap-2 cursor-pointer"
                  >
                    <span>Next: View Profile</span>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "preview" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* Header card / Summary banner */}
              <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-white/10 rounded-2xl p-8 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl -z-10" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -z-10" />
                
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {/* Styled Avatar */}
                  <div className="w-24 h-24 rounded-full bg-linear-to-br from-cyan-400 via-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-4 ring-white/10 shrink-0 overflow-hidden relative">
                    {profile.photoURL ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={profile.photoURL}
                        alt="Profile Picture"
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <span className="text-white font-extrabold text-3xl">
                        {profile.displayName
                          ? profile.displayName.charAt(0).toUpperCase()
                          : profile.email.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  
                  <div className="text-center sm:text-left flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h2 className="text-3xl font-extrabold text-white tracking-tight">
                          {profile.displayName || "Your Name"}
                        </h2>
                        <p className="text-cyan-400 font-semibold text-lg mt-1">
                          {profile.title || "No Title Specified"}
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold rounded-full self-center sm:self-start">
                        Active Profile
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 pt-6 border-t border-white/5 text-sm">
                  <div className="flex items-center gap-3 text-slate-300 bg-slate-950/20 p-3.5 rounded-xl border border-white/5">
                    <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
                    <div className="overflow-hidden">
                      <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Email Address</p>
                      <p className="truncate font-medium">{profile.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 text-slate-300 bg-slate-950/20 p-3.5 rounded-xl border border-white/5">
                    <Phone className="w-4 h-4 text-cyan-400 shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Phone Number</p>
                      <p className="font-medium">{profile.phone ? `${profile.countryCode} ${profile.phone}` : "Not Added"}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 text-slate-300 bg-slate-950/20 p-3.5 rounded-xl border border-white/5">
                    <Calendar className="w-4 h-4 text-cyan-400 shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Date of Birth</p>
                      <p className="font-medium">{profile.dob ? new Date(profile.dob).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : "Not Added"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bio & Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Side: About Me */}
                <div className="md:col-span-2 space-y-6">
                  <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <User className="w-5 h-5 text-cyan-400" />
                      About Me
                    </h3>
                    <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                      {profile.bio || "No bio added yet. Add a bio to help recruiters know you better!"}
                    </p>
                  </div>

                  <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-cyan-400" />
                      Professional Experience
                    </h3>
                    <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                      {profile.experience || "No professional experience added yet."}
                    </p>
                  </div>
                </div>

                {/* Right Side: Skills & Social Presence */}
                <div className="space-y-6">
                  {/* Skills Card */}
                  <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
                    <h3 className="text-lg font-bold text-white mb-4">
                      Key Skills
                    </h3>
                    {profile.skills ? (
                      <div className="flex flex-wrap gap-2">
                        {profile.skills.split(",").map((s, idx) => (
                          <span 
                            key={idx} 
                            className="px-3 py-1.5 bg-slate-950/50 border border-white/10 hover:border-cyan-500/30 text-slate-300 hover:text-cyan-400 text-xs font-semibold rounded-lg transition-colors cursor-default"
                          >
                            {s.trim()}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-400 text-sm italic">No skills listed yet.</p>
                    )}
                  </div>

                  {/* Social Presence Card */}
                  <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
                    <h3 className="text-lg font-bold text-white mb-4">
                      Social Presence
                    </h3>
                    <div className="space-y-3">
                      {profile.linkedin ? (
                        <a 
                          href={`https://linkedin.com/in/${profile.linkedin}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-3 bg-slate-950/40 hover:bg-slate-950 border border-white/5 hover:border-cyan-500/30 rounded-xl transition-all group text-sm text-slate-300 hover:text-white"
                        >
                          <div className="flex items-center gap-2.5">
                            <Linkedin className="w-4 h-4 text-[#0A66C2]" />
                            <span className="font-medium">LinkedIn</span>
                          </div>
                          <span className="text-xs text-slate-500 group-hover:text-cyan-400">View Profile →</span>
                        </a>
                      ) : (
                        <div className="p-3 bg-slate-950/20 border border-white/5 rounded-xl text-xs text-slate-500 italic">
                          LinkedIn profile not linked
                        </div>
                      )}

                      {profile.github ? (
                        <a 
                          href={`https://github.com/${profile.github}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-3 bg-slate-950/40 hover:bg-slate-950 border border-white/5 hover:border-cyan-500/30 rounded-xl transition-all group text-sm text-slate-300 hover:text-white"
                        >
                          <div className="flex items-center gap-2.5">
                            <Github className="w-4 h-4 text-white" />
                            <span className="font-medium">GitHub</span>
                          </div>
                          <span className="text-xs text-slate-500 group-hover:text-cyan-400">View Profile →</span>
                        </a>
                      ) : (
                        <div className="p-3 bg-slate-950/20 border border-white/5 rounded-xl text-xs text-slate-500 italic">
                          GitHub profile not linked
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </form>
      </main>

      {/* Image Crop/Customization Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-white mb-4">Customize Profile Picture</h3>
            
            {/* Image Preview Container */}
            <div 
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleMouseUp}
              className="relative w-48 h-48 mx-auto rounded-full overflow-hidden border-4 border-cyan-500/30 bg-slate-950 mb-6 flex items-center justify-center cursor-move select-none"
            >
              <div 
                className="w-full h-full relative"
                style={{
                  transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                  filter: filter,
                  transition: isDragging ? 'none' : 'transform 0.1s ease-out'
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={tempImage}
                  alt="Preview"
                  className="w-full h-full object-cover pointer-events-none"
                />
              </div>
            </div>

            {/* Zoom Slider */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-400 mb-1">Zoom</label>
              <input
                type="range"
                min="1"
                max="3"
                step="0.1"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            {/* Filter Choices */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-400 mb-2">Filter</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { name: "Original", value: "none" },
                  { name: "Grayscale", value: "grayscale(100%)" },
                  { name: "Sepia", value: "sepia(80%)" },
                  { name: "Cool Blue", value: "hue-rotate(180deg) saturate(1.5)" }
                ].map((f) => (
                  <button
                    key={f.name}
                    type="button"
                    onClick={() => setFilter(f.value)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      filter === f.value
                        ? "bg-cyan-500/20 border-cyan-400 text-cyan-300"
                        : "bg-slate-950 border-white/5 text-slate-400 hover:text-white"
                    }`}
                  >
                    {f.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setTempImage("");
                }}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white font-medium hover:bg-white/5 transition-all text-sm cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveImage}
                disabled={savingImage}
                className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-900 font-bold rounded-xl shadow-lg shadow-cyan-950/20 transition-all flex items-center gap-1.5 text-sm cursor-pointer"
              >
                {savingImage ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-900" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Picture</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
