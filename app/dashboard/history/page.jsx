"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { getResumeAnalyses, getJobApplications } from "@/utils/firebaseConfig";
import {
  FileText,
  Briefcase,
  TrendingUp,
  Clock,
  ExternalLink,
  ChevronRight,
  Loader2,
  Calendar,
  AlertCircle,
  Award
} from "lucide-react";
import Link from "next/link";

export default function HistoryPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  
  const [analyses, setAnalyses] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState("resumes"); // "resumes" | "jobs"

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    const fetchData = async () => {
      if (user?.uid) {
        try {
          const [analysesList, appsList] = await Promise.all([
            getResumeAnalyses(user.uid),
            getJobApplications(user.uid)
          ]);
          setAnalyses(analysesList || []);
          setApplications(appsList || []);
        } catch (error) {
          console.error("Error fetching history:", error);
        } finally {
          setLoadingData(false);
        }
      }
    };

    if (!loading && isAuthenticated) {
      fetchData();
    }
  }, [user?.uid, loading, isAuthenticated]);

  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  const getScoreColor = (score) => {
    if (score >= 80) return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    if (score >= 60) return "text-cyan-400 bg-cyan-500/10 border-cyan-500/20";
    if (score >= 40) return "text-amber-400 bg-amber-500/10 border-amber-500/20";
    return "text-rose-400 bg-rose-500/10 border-rose-500/20";
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Page Header */}
      <div className="mb-10">
        <h2 className="text-3xl font-bold text-white mb-2">History & Activity</h2>
        <p className="text-slate-400">Track your past resume analysis scores and job applications</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-white/10 mb-8">
        <button
          onClick={() => setActiveSubTab("resumes")}
          className={`pb-4 px-2 font-medium transition-all relative ${
            activeSubTab === "resumes"
              ? "text-cyan-400 font-semibold"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          {activeSubTab === "resumes" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-full" />
          )}
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span>Resume Analyses ({analyses.length})</span>
          </div>
        </button>
        <button
          onClick={() => setActiveSubTab("jobs")}
          className={`pb-4 px-2 font-medium transition-all relative ${
            activeSubTab === "jobs"
              ? "text-cyan-400 font-semibold"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          {activeSubTab === "jobs" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-full" />
          )}
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            <span>Applications ({applications.length})</span>
          </div>
        </button>
      </div>

      {/* Content */}
      {loadingData ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        </div>
      ) : activeSubTab === "resumes" ? (
        analyses.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center max-w-xl mx-auto shadow-lg backdrop-blur-md">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10 text-slate-400">
              <FileText className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No analyses found</h3>
            <p className="text-slate-400 mb-6">
              You haven&apos;t uploaded or analyzed any resumes yet. Get insights on your skill gaps and scores now.
            </p>
            <Link
              href="/dashboard/resume-analysis"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-medium transition-all cursor-pointer shadow-md shadow-cyan-900/20"
            >
              Analyze Resume
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {analyses.map((analysis) => {
              const date = analysis.createdAt?.seconds 
                ? new Date(analysis.createdAt.seconds * 1000).toLocaleString()
                : analysis.analyzedAt 
                  ? new Date(analysis.analyzedAt).toLocaleString() 
                  : "N/A";
                  
              return (
                <div
                  key={analysis.id}
                  className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden group"
                >
                  <div className="flex items-start gap-4">
                    <div className={`px-4 py-3 rounded-xl border text-xl font-extrabold flex flex-col items-center justify-center ${getScoreColor(analysis.score || 0)}`}>
                      <span>{analysis.score || 0}%</span>
                      <span className="text-[9px] uppercase tracking-wider mt-0.5 opacity-80">Score</span>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors">
                        {analysis.targetRole || "Resume Analysis"}
                      </h4>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-slate-400 text-sm">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          {date}
                        </span>
                        <span>•</span>
                        <span>
                          {analysis.skills?.present?.length || 0} Present Skills
                        </span>
                        <span>•</span>
                        <span className="text-rose-400">
                          {analysis.skills?.missing?.length || 0} Missing
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Link
                      href="/dashboard/resume-analysis"
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white rounded-xl text-sm transition-all"
                    >
                      Analyze Again
                    </Link>
                    <Link
                      href="/dashboard/skill-gap"
                      className="px-4 py-2 bg-cyan-600/90 hover:bg-cyan-600 text-white rounded-xl text-sm transition-all flex items-center gap-1.5"
                    >
                      <span>View Roadmap</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        applications.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center max-w-xl mx-auto shadow-lg backdrop-blur-md">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10 text-slate-400">
              <Briefcase className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No applications tracked</h3>
            <p className="text-slate-400 mb-6">
              Track jobs you apply to from our job matching page to monitor status.
            </p>
            <Link
              href="/dashboard/job-matching"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-medium transition-all cursor-pointer shadow-md shadow-cyan-900/20"
            >
              Explore Jobs
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {applications.map((app) => {
              const date = app.appliedAt?.seconds 
                ? new Date(app.appliedAt.seconds * 1000).toLocaleDateString()
                : "N/A";
              return (
                <div
                  key={app.id}
                  className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center border border-cyan-500/20 text-cyan-400">
                      <Briefcase className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white mb-1">{app.title}</h4>
                      <p className="text-slate-300 text-sm mb-2">{app.company}</p>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-slate-400 text-xs">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          Applied on {date}
                        </span>
                        <span>•</span>
                        <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full font-medium capitalize">
                          {app.status || "Applied"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {app.applyLink && (
                    <a
                      href={app.applyLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white rounded-xl text-sm transition-all self-start md:self-auto"
                    >
                      <span>View Job Posting</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}
