"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getUserDashboardStats, getLatestResumeAnalysis } from "@/utils/firebaseConfig";
import {
  Briefcase,
  TrendingUp,
  FileText,
  Loader2,
  Bookmark,
  Send,
  BarChart3,
  Sparkles,
  Compass,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  UserCheck,
  Award
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
  const [latestAnalysis, setLatestAnalysis] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, loading, router]);

  // Fetch user stats & latest analysis from Firestore
  useEffect(() => {
    const fetchStats = async () => {
      if (user?.uid) {
        try {
          const [userStats, analysis] = await Promise.all([
            getUserDashboardStats(user.uid),
            getLatestResumeAnalysis(user.uid)
          ]);
          setStats(userStats);
          setLatestAnalysis(analysis);
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
    <main className="max-w-7xl mx-auto px-6 py-12">
      {/* Welcome Section */}
      <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Welcome back,{" "}
            <span className="text-amber-500">
              {stats.name || user?.email?.split("@")[0]}
            </span>
            ! 👋
          </h2>
          <p className="text-slate-400">
            Real-time insights and tracker for your career advancement.
          </p>
        </div>
        <div className="self-start md:self-auto flex items-center gap-2.5 px-4.5 py-2.5 rounded-2xl bg-white/5 border border-white/10 shadow-lg backdrop-blur-md">
          <span className="text-slate-400 text-sm">Account Plan:</span>
          {loadingStats ? (
            <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
          ) : stats.plan === "pro" ? (
            <span className="text-amber-500 text-sm font-extrabold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> Career Pro ({stats.billingCycle === "yearly" ? "Annual" : "Monthly"})
            </span>
          ) : (
            <span className="text-slate-300 text-sm font-bold">Free Explorer</span>
          )}
        </div>
      </div>

      {/* Stats Section */}
      <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-cyan-500/30 transition-all shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            <p className="text-slate-400 text-sm font-medium">Resume Score</p>
          </div>
          {loadingStats ? (
            <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
          ) : (
            <p className={`text-4xl font-extrabold ${getScoreColor(stats.resumeScore)}`}>
              {stats.resumeScore > 0 ? `${stats.resumeScore}%` : "—"}
            </p>
          )}
        </div>

        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-amber-500/30 transition-all shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <Bookmark className="w-5 h-5 text-amber-400" />
            <p className="text-slate-400 text-sm font-medium">Saved Jobs</p>
          </div>
          {loadingStats ? (
            <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
          ) : (
            <p className="text-4xl font-extrabold text-white">{stats.savedJobsCount}</p>
          )}
        </div>

        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-green-500/30 transition-all shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <Send className="w-5 h-5 text-green-400" />
            <p className="text-slate-400 text-sm font-medium">Applications</p>
          </div>
          {loadingStats ? (
            <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
          ) : (
            <p className="text-4xl font-extrabold text-white">{stats.applicationsCount}</p>
          )}
        </div>

        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-blue-500/30 transition-all shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-5 h-5 text-blue-400" />
            <p className="text-slate-400 text-sm font-medium">Resumes Analyzed</p>
          </div>
          {loadingStats ? (
            <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
          ) : (
            <p className="text-4xl font-extrabold text-white">{stats.totalResumesAnalyzed}</p>
          )}
        </div>
      </div>

      {/* Interactive Dashboard Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Widget 1: Radial Score & Next Steps */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Award className="w-5 h-5 text-cyan-400" />
              <span>Resume Standing</span>
            </h3>

            {stats.resumeScore > 0 ? (
              <div className="flex flex-col items-center py-4">
                {/* Radial progress ring wrapper */}
                <div className="relative w-40 h-40 flex items-center justify-center mb-6">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="80"
                      cy="80"
                      r="68"
                      className="stroke-white/5"
                      strokeWidth="10"
                      fill="transparent"
                    />
                    <circle
                      cx="80"
                      cy="80"
                      r="68"
                      className={`stroke-current ${
                        stats.resumeScore >= 80 
                          ? "text-emerald-500" 
                          : stats.resumeScore >= 60 
                            ? "text-cyan-500" 
                            : "text-amber-500"
                      }`}
                      strokeWidth="10"
                      fill="transparent"
                      strokeDasharray={427.2}
                      strokeDashoffset={427.2 - (427.2 * stats.resumeScore) / 100}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-4xl font-extrabold text-white">{stats.resumeScore}%</span>
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 mt-0.5">ATS Score</span>
                  </div>
                </div>

                <div className="text-center px-2">
                  <h4 className="text-lg font-bold text-white mb-2">
                    {stats.resumeScore >= 80 ? "Superb Standing!" : stats.resumeScore >= 60 ? "Good Progress" : "Needs Upgrades"}
                  </h4>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {stats.resumeScore >= 80 
                      ? "Your resume is in the top 10% of candidates. You are ready to apply for matching roles." 
                      : stats.resumeScore >= 60 
                        ? "You are very close to standard ATS thresholds. Add a few missing key skills to stand out." 
                        : "Upload a version containing richer descriptions of projects and skills to rank higher."}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center py-10 text-center">
                <FileText className="w-16 h-16 text-slate-600 mb-4 stroke-1" />
                <p className="text-slate-400 text-sm mb-6">No resume score available. Upload your resume to begin analyzing.</p>
                <Link
                  href="/dashboard/resume-analysis"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-sm font-medium transition-all"
                >
                  Analyze Resume
                </Link>
              </div>
            )}
          </div>

          {stats.resumeScore > 0 && (
            <div className="mt-6 pt-6 border-t border-white/5 flex gap-2">
              <Link
                href="/dashboard/resume-analysis"
                className="w-full text-center py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 hover:text-white rounded-xl text-sm transition-all"
              >
                View Analysis
              </Link>
              <Link
                href="/dashboard/skill-gap"
                className="w-full text-center py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-sm font-semibold transition-all"
              >
                View Skill Gap
              </Link>
            </div>
          )}
        </div>

        {/* Widget 2: Real-time Skills Pool */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col justify-between lg:col-span-2">
          <div>
            <h3 className="text-xl font-bold text-white mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-emerald-400" />
                <span>Skills Analysis</span>
              </div>
              {latestAnalysis?.targetRole && (
                <span className="text-xs bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-3 py-1 rounded-full font-medium">
                  Target: {latestAnalysis.targetRole}
                </span>
              )}
            </h3>

            {stats.skills.length > 0 || (latestAnalysis?.skills?.missing && latestAnalysis.skills.missing.length > 0) ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Present Skills */}
                <div>
                  <h4 className="text-base font-semibold text-slate-300 mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Active Skills ({stats.skills.length})</span>
                  </h4>
                  <div className="flex flex-wrap gap-2 pr-1">
                    {stats.skills.map((skill, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg text-xs border border-emerald-500/20 font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Missing Skills */}
                <div>
                  <h4 className="text-base font-semibold text-slate-300 mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 animate-pulse" />
                    <span>Missing Skills ({latestAnalysis?.skills?.missing?.length || 0})</span>
                  </h4>
                  {latestAnalysis?.skills?.missing && latestAnalysis.skills.missing.length > 0 ? (
                    <div className="flex flex-wrap gap-2 pr-1">
                      {latestAnalysis.skills.missing.map((skill, i) => (
                        <span
                          key={i}
                          className="px-3 py-1.5 bg-amber-500/10 text-amber-400 rounded-lg text-xs border border-amber-500/20 font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 italic mt-2">
                      {latestAnalysis ? "No missing skills identified for your target role! You are fully aligned." : "Analyze a target role in Skill Gap to identify missing skills."}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center">
                <Compass className="w-16 h-16 text-slate-600 mb-4 mx-auto stroke-1" />
                <p className="text-slate-400 text-sm mb-6">No skills data available. Complete a transition plan or upload a resume.</p>
                <Link
                  href="/dashboard/skill-gap"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-sm font-medium transition-all"
                >
                  Create Transition Plan
                </Link>
              </div>
            )}
          </div>

          {stats.skills.length > 0 && (
            <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
              <p className="text-sm text-slate-500">
                Data synced from your latest resume profile.
              </p>
              <Link
                href="/dashboard/skill-gap"
                className="text-sm text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 group"
              >
                <span>Full Skill Mapping</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
