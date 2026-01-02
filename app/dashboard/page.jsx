"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ProfileDropdown from "@/components/ui/profile-dropdown";
import { getUserDashboardStats } from "@/utils/firebaseConfig";
import {
  Briefcase,
  TrendingUp,
  FileText,
  Loader2,
  Bookmark,
  Send,
  BarChart3,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function DashboardPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    name: "",
    email: "",
    resumeScore: 0,
    savedJobsCount: 0,
    applicationsCount: 0,
    totalResumesAnalyzed: 0,
    skills: [],
    lastAnalyzedAt: null,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

  // Fetch user stats from Firestore
  useEffect(() => {
    const fetchStats = async () => {
      if (user?.uid) {
        try {
          const userStats = await getUserDashboardStats(user.uid);
          setStats(userStats);
        } catch (error) {
          console.error("Error fetching stats:", error);
        } finally {
          setLoadingStats(false);
        }
      } else {
        setLoadingStats(false);
      }
    };

    if (!loading && isAuthenticated) {
      fetchStats();
    }
  }, [user?.uid, loading, isAuthenticated]);

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-cyan-400";
    if (score >= 40) return "text-amber-400";
    if (score > 0) return "text-red-400";
    return "text-slate-400";
  };

  return (
    <div
      className="min-h-screen bg-slate-950 bg-cover bg-center bg-fixed"
      style={{
        backgroundImage:
          "linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.5)), url('/dashboard-bg.jpg')",
      }}
    >
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-md sticky top-0 z-50">
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
            Welcome back,{" "}
            <span className="text-amber-600">
              {stats.name || user?.email?.split("@")[0]}
            </span>
            ! 👋
          </h2>
          <p className="text-slate-400">
            Manage your career profile and track your progress
          </p>
        </div>

        {/* Stats Section */}
        <div className="mb-12 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-6 hover:bg-white/10 hover:border-cyan-500/30 transition-all shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              <p className="text-slate-400 text-sm">Resume Score</p>
            </div>
            {loadingStats ? (
              <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
            ) : (
              <p
                className={`text-3xl font-bold ${getScoreColor(
                  stats.resumeScore
                )}`}
              >
                {stats.resumeScore > 0 ? `${stats.resumeScore}%` : "—"}
              </p>
            )}
            {stats.lastAnalyzedAt && (
              <p className="text-xs text-slate-500 mt-1">
                Last analyzed:{" "}
                {new Date(stats.lastAnalyzedAt).toLocaleDateString()}
              </p>
            )}
          </div>

          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-6 hover:bg-white/10 hover:border-amber-500/30 transition-all shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <Bookmark className="w-4 h-4 text-amber-400" />
              <p className="text-slate-400 text-sm">Saved Jobs</p>
            </div>
            {loadingStats ? (
              <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
            ) : (
              <p className="text-3xl font-bold text-white">
                {stats.savedJobsCount}
              </p>
            )}
          </div>

          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-6 hover:bg-white/10 hover:border-green-500/30 transition-all shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <Send className="w-4 h-4 text-green-400" />
              <p className="text-slate-400 text-sm">Applications</p>
            </div>
            {loadingStats ? (
              <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
            ) : (
              <p className="text-3xl font-bold text-white">
                {stats.applicationsCount}
              </p>
            )}
          </div>

          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-6 hover:bg-white/10 hover:border-blue-500/30 transition-all shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-blue-400" />
              <p className="text-slate-400 text-sm">Resumes Analyzed</p>
            </div>
            {loadingStats ? (
              <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
            ) : (
              <p className="text-3xl font-bold text-white">
                {stats.totalResumesAnalyzed}
              </p>
            )}
          </div>
        </div>

        {/* Skills Preview */}
        {stats.skills.length > 0 && (
          <div className="mb-12 bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-6 hover:bg-white/10 transition-all shadow-lg">
            <h3 className="text-lg font-semibold text-white mb-4">
              Your Top Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {stats.skills.slice(0, 10).map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-cyan-500/10 text-cyan-400 rounded-full text-sm border border-cyan-500/20"
                >
                  {skill}
                </span>
              ))}
              {stats.skills.length > 10 && (
                <span className="px-3 py-1 bg-slate-700/50 text-slate-400 rounded-full text-sm">
                  +{stats.skills.length - 10} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Resume Analysis Card */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-6 hover:bg-white/10 hover:border-blue-500/50 transition-all shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">
                Resume Analysis
              </h3>
            </div>
            <p className="text-slate-400 mb-4">
              Analyze your resume to identify skill gaps and get improvement
              suggestions
            </p>
            <Link
              href="/dashboard/resume-analysis"
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors block text-center cursor-pointer"
            >
              {stats.totalResumesAnalyzed > 0
                ? "Analyze Again"
                : "Analyze Resume"}
            </Link>
          </div>

          {/* Job Matching Card */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-6 hover:bg-white/10 hover:border-cyan-500/30 transition-all shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-cyan-500/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Job Matching</h3>
            </div>
            <p className="text-slate-400 mb-4">
              Find jobs that match your profile and skills perfectly
            </p>
            <Link
              href="/dashboard/job-matching"
              className="w-full px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition-colors block text-center cursor-pointer"
            >
              Explore Jobs
            </Link>
          </div>

          {/* Profile Card */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-6 hover:bg-white/10 hover:border-green-500/30 transition-all shadow-lg">
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
              className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors block text-center cursor-pointer"
            >
              Edit Profile
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        {stats.resumeScore === 0 && (
          <div className="mt-12 bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-6 hover:bg-white/10 hover:border-cyan-500/30 transition-all shadow-lg">
            <h3 className="text-lg font-semibold text-white mb-2">
              Get Started
            </h3>
            <p className="text-slate-400 mb-4">
              Upload your resume to get personalized job recommendations and
              career insights.
            </p>
            <Link
              href="/dashboard/resume-analysis"
              className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition-colors cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              Upload Resume
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
