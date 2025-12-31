"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ProfileDropdown from "@/components/ui/profile-dropdown";
import {
  Briefcase,
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Github,
  Save,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    displayName: "",
    email: "",
    phone: "",
    location: "",
    title: "",
    bio: "",
    linkedin: "",
    github: "",
    skills: "",
    experience: "",
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

  // Load user data
  useEffect(() => {
    if (user) {
      setProfile((prev) => ({
        ...prev,
        displayName: user.displayName || "",
        email: user.email || "",
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    // Simulate save - replace with actual API call
    setTimeout(() => {
      setSaving(false);
      toast.success("Profile updated successfully!");
    }, 1500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-slate-400 text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-800/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.svg"
              alt="Project Logo"
              width={160}
              height={160}
            />
          </div>
          <ProfileDropdown />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Back Button */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-green-400" />
            </div>
            <h1 className="text-3xl font-bold text-white">My Profile</h1>
          </div>
          <p className="text-slate-400">
            Manage your profile information and career preferences
          </p>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Avatar Section */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-cyan-400 flex items-center justify-center">
                <span className="text-slate-900 font-bold text-2xl">
                  {profile.displayName
                    ? profile.displayName.charAt(0).toUpperCase()
                    : profile.email.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">
                  {profile.displayName || "Your Name"}
                </h2>
                <p className="text-slate-400">{profile.email}</p>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-6">
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Full Name
                </label>
                <input
                  type="text"
                  name="displayName"
                  value={profile.displayName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-green-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={profile.email}
                  disabled
                  className="w-full px-4 py-3 bg-slate-700/30 border border-slate-600 rounded-lg text-slate-400 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={profile.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-green-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={profile.location}
                  onChange={handleChange}
                  placeholder="San Francisco, CA"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-green-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-6">
              Professional Information
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
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-green-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={profile.bio}
                  onChange={handleChange}
                  placeholder="Tell us about yourself and your career goals..."
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-green-500 transition-colors resize-none"
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
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-green-500 transition-colors"
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
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-green-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-6">
              Social Links
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  <Linkedin className="w-4 h-4 inline mr-2" />
                  LinkedIn Profile
                </label>
                <input
                  type="url"
                  name="linkedin"
                  value={profile.linkedin}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-green-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  <Github className="w-4 h-4 inline mr-2" />
                  GitHub Profile
                </label>
                <input
                  type="url"
                  name="github"
                  value={profile.github}
                  onChange={handleChange}
                  placeholder="https://github.com/username"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-green-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Profile
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
