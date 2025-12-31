"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import ProfileDropdown from "@/components/ui/profile-dropdown";
import { Briefcase, TrendingUp, FileText } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function DashboardPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

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
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-2">
            Welcome back, <span className="text-amber-600">{user?.email}</span>!
            👋
          </h2>
          <p className="text-slate-400">
            Manage your career profile and track your progress
          </p>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Resume Analysis Card */}
          <div className="bg-slate-800/50 border border-blue-500/30 rounded-lg p-6 hover:border-blue-500/30 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">
                Resume Analysis
              </h3>
            </div>
            <p className="text-slate-400 mb-4">
              Analyze your resume to identify skill gaps
            </p>
            <Link
              href="/dashboard/resume-analysis"
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors block text-center"
            >
              Analyze Resume
            </Link>
          </div>

          {/* Job Matching Card */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6 hover:border-cyan-500/30 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-cyan-500/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Job Matching</h3>
            </div>
            <p className="text-slate-400 mb-4">
              Find jobs that match your profile and skills
            </p>
            <Link
              href="/dashboard/job-matching"
              className="w-full px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition-colors block text-center"
            >
              Explore Jobs
            </Link>
          </div>

          {/* Profile Card */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6 hover:border-green-500/30 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">My Profile</h3>
            </div>
            <p className="text-slate-400 mb-4">
              Update your profile information and preferences
            </p>
            <Link
              href="/dashboard/profile"
              className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors block text-center"
            >
              Edit Profile
            </Link>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
            <p className="text-slate-400 text-sm mb-2">Resume Score</p>
            <p className="text-3xl font-bold text-white">85%</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
            <p className="text-slate-400 text-sm mb-2">Jobs Matched</p>
            <p className="text-3xl font-bold text-white">12</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
            <p className="text-slate-400 text-sm mb-2">Applications</p>
            <p className="text-3xl font-bold text-white">8</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
            <p className="text-slate-400 text-sm mb-2">Profile Views</p>
            <p className="text-3xl font-bold text-white">24</p>
          </div>
        </div>
      </main>
    </div>
  );
}
