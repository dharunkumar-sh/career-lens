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
  Award,
  Download,
  Mail,
  Phone,
  Linkedin,
  Github,
  GraduationCap,
  Code,
  Target,
  User,
  Info,
  CheckCircle,
  Crown,
  Sparkles
} from "lucide-react";
import Link from "next/link";

export default function HistoryPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  
  const [analyses, setAnalyses] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState("resumes"); // "resumes" | "jobs"
  const [printingAnalysis, setPrintingAnalysis] = useState(null);

  const getReportScoreColor = (score) => {
    if (score >= 80)
      return {
        bg: "bg-green-500/20",
        text: "text-green-400",
        border: "border-green-500/30",
      };
    if (score >= 60)
      return {
        bg: "bg-blue-500/20",
        text: "text-blue-400",
        border: "border-blue-500/30",
      };
    if (score >= 40)
      return {
        bg: "bg-amber-500/20",
        text: "text-amber-400",
        border: "border-amber-500/30",
      };
    return {
      bg: "bg-red-500/20",
      text: "text-red-400",
      border: "border-red-500/30",
    };
  };

  const getReportScoreMessage = (score) => {
    if (score >= 80)
      return "Excellent! Your resume is well-optimized and stands out.";
    if (score >= 60)
      return "Good resume! A few improvements could make it even better.";
    if (score >= 40)
      return "Your resume needs some work. Follow the suggestions below.";
    return "Your resume needs significant improvements. Focus on the areas highlighted.";
  };

  const downloadAnalysisPDF = async (analysis) => {
    const toast = (await import("react-hot-toast")).default;
    const toastId = toast.loading("Generating PDF report...");
    try {
      setPrintingAnalysis(analysis);
      // Wait for React to render the hidden container
      await new Promise((resolve) => setTimeout(resolve, 300));

      const html2canvas = (await import("html2canvas-pro")).default;
      const { jsPDF } = await import("jspdf");

      const element1 = document.getElementById("history-report-print-page-1");
      const element2 = document.getElementById("history-report-print-page-2");
      if (!element1 || !element2) throw new Error("Print content page elements not found");

      const options = {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#090a0b",
        windowWidth: 1000,
      };

      const canvas1 = await html2canvas(element1, options);
      const canvas2 = await html2canvas(element2, options);

      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210;
      const imgHeight = 297;

      const imgData1 = canvas1.toDataURL("image/png");
      pdf.addImage(imgData1, "PNG", 0, 0, imgWidth, imgHeight, "", "FAST");

      const imgData2 = canvas2.toDataURL("image/png");
      pdf.addPage();
      pdf.addImage(imgData2, "PNG", 0, 0, imgWidth, imgHeight, "", "FAST");

      const fileName = `${(analysis.targetRole || "Resume_Analysis").replace(/\s+/g, "_")}_Report_${Date.now()}.pdf`;
      pdf.save(fileName);
      toast.success("PDF Report downloaded successfully!", { id: toastId });
    } catch (err) {
      console.error("PDF generation failed:", err);
      toast.error("Failed to generate PDF. Please try again.", { id: toastId });
    } finally {
      setPrintingAnalysis(null);
    }
  };

  const canvasErrorIgnoreWorkaround = async (html2canvas, element) => {
    return await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#0f172a",
      windowWidth: 1200,
    });
  };

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
                    <button
                      onClick={() => downloadAnalysisPDF(analysis)}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white rounded-xl text-sm transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Download className="w-4 h-4 text-cyan-400" />
                      <span>Download Report</span>
                    </button>
                    <Link
                      href="/dashboard/resume-analysis"
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white rounded-xl text-sm transition-all"
                    >
                      View Analysis
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

      {/* Hidden Print Container for PDF Generation */}
      {printingAnalysis && (
        <div
          id="history-report-print-content"
          style={{
            position: "fixed",
            top: "-9999px",
            left: "-9999px",
            width: "1000px",
          }}
        >
          {/* PAGE 1 */}
          <div
            id="history-report-print-page-1"
            className="p-10 bg-[#090a0b] text-white flex flex-col justify-between"
            style={{
              width: "1000px",
              height: "1400px",
              boxSizing: "border-box",
            }}
          >
            <div className="space-y-6">
              {/* Header */}
              <div className="border-b border-white/10 pb-6 mb-8 flex justify-between items-end">
                <div>
                  <h1 className="text-3xl font-bold text-white">Resume Analysis Report</h1>
                </div>
                {printingAnalysis.analyzedAt && (
                  <p className="text-slate-500 text-xs">
                    Generated: {new Date(printingAnalysis.analyzedAt).toLocaleString()}
                  </p>
                )}
              </div>

              {/* Score Card - Hero Section */}
              <div
                className={`bg-white/5 border ${
                  getReportScoreColor(printingAnalysis.score || 0).border
                } rounded-xl p-8`}
              >
                <div className="flex flex-col md:flex-row items-center gap-6">
                  {/* Score Circle */}
                  <div className="relative">
                    <div
                      className={`w-32 h-32 rounded-full ${
                        getReportScoreColor(printingAnalysis.score || 0).bg
                      } flex items-center justify-center`}
                    >
                      <div className="text-center">
                        <span
                          className={`text-4xl font-bold ${
                            getReportScoreColor(printingAnalysis.score || 0).text
                          }`}
                        >
                          {printingAnalysis.score || 0}
                        </span>
                        <span
                          className={`text-lg ${
                            getReportScoreColor(printingAnalysis.score || 0).text
                          }`}
                        >
                          %
                        </span>
                      </div>
                    </div>
                    {/* Score Ring */}
                    <svg className="absolute inset-0 w-32 h-32 -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="58"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                        className="text-slate-700"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="58"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                        strokeDasharray={`${
                          ((printingAnalysis.score || 0) / 100) * 364
                        } 364`}
                        className={getReportScoreColor(printingAnalysis.score || 0).text}
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>

                  {/* Score Info */}
                  <div className="flex-1 text-center md:text-left">
                    <h2 className="text-2xl font-bold text-white mb-2">
                      Resume Score
                    </h2>
                    <p className="text-slate-400 mb-4">
                      {getReportScoreMessage(printingAnalysis.score || 0)}
                    </p>

                    {/* Quick Stats */}
                    <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-500" />
                        <span className="text-slate-300 text-sm">
                          {printingAnalysis.metadata?.pageCount || 1} page
                          {(printingAnalysis.metadata?.pageCount || 1) > 1
                            ? "s"
                            : ""}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Code className="w-4 h-4 text-slate-500" />
                        <span className="text-slate-300 text-sm">
                          {printingAnalysis.skills?.present?.length || 0} skills
                          found
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-slate-500" />
                        <span className="text-slate-300 text-sm">
                          {printingAnalysis.metadata?.wordCount || 0} words
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Info Extracted */}
              {printingAnalysis.contactInfo &&
                Object.keys(printingAnalysis.contactInfo).length > 0 && (
                  <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <User className="w-5 h-5 text-blue-400" />
                      Contact Information Detected
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                      {printingAnalysis.contactInfo.email && (
                        <div className="flex items-center gap-3 bg-slate-700/30 rounded-lg p-3">
                          <Mail className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-300 text-sm truncate">
                            {printingAnalysis.contactInfo.email}
                          </span>
                        </div>
                      )}
                      {printingAnalysis.contactInfo.phone && (
                        <div className="flex items-center gap-3 bg-slate-700/30 rounded-lg p-3">
                          <Phone className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-300 text-sm">
                            {printingAnalysis.contactInfo.phone}
                          </span>
                        </div>
                      )}
                      {printingAnalysis.contactInfo.linkedin && (
                        <div className="flex items-center gap-3 bg-slate-700/30 rounded-lg p-3">
                          <Linkedin className="w-4 h-4 text-blue-400" />
                          <span className="text-slate-300 text-sm truncate">
                            {printingAnalysis.contactInfo.linkedin}
                          </span>
                        </div>
                      )}
                      {printingAnalysis.contactInfo.github && (
                        <div className="flex items-center gap-3 bg-slate-700/30 rounded-lg p-3">
                          <Github className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-300 text-sm truncate">
                            {printingAnalysis.contactInfo.github}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              {/* Statistics Grid */}
              {printingAnalysis.metadata && (
                <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Info className="w-5 h-5 text-slate-400" />
                    Resume Statistics
                  </h2>
                  <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="bg-linear-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-lg p-4">
                      <p className="text-blue-400 text-xs font-medium mb-1">
                        Word Count
                      </p>
                      <p className="text-2xl font-bold text-white">
                        {printingAnalysis.metadata.wordCount?.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-linear-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-lg p-4">
                      <p className="text-purple-400 text-xs font-medium mb-1">
                        Pages
                      </p>
                      <p className="text-2xl font-bold text-white">
                        {printingAnalysis.metadata.pageCount}
                      </p>
                    </div>
                    <div className="bg-linear-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-lg p-4">
                      <p className="text-green-400 text-xs font-medium mb-1">
                        Action Verbs
                      </p>
                      <p className="text-2xl font-bold text-white">
                        {printingAnalysis.metadata.actionVerbCount}
                      </p>
                    </div>
                    <div className="bg-linear-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-lg p-4">
                      <p className="text-amber-400 text-xs font-medium mb-1">
                        Metrics Found
                      </p>
                      <p className="text-2xl font-bold text-white">
                        {printingAnalysis.metadata.quantifiableCount}
                      </p>
                    </div>
                  </div>

                  {/* Sections Found */}
                  {printingAnalysis.metadata.sectionsFound?.length > 0 && (
                    <div>
                      <p className="text-slate-400 text-sm mb-3">
                        Sections Detected in Resume
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {printingAnalysis.metadata.sectionsFound.map(
                          (section, index) => (
                            <span
                              key={index}
                              className="px-3 py-1.5 bg-slate-700/50 text-slate-300 rounded-lg text-sm capitalize flex items-center gap-2"
                            >
                              <CheckCircle className="w-3 h-3 text-green-400" />
                              {section}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
              {/* Action Verbs Found */}
              {printingAnalysis.metadata.actionVerbsFound?.length > 0 && (
                <div className="mt-4">
                  <p className="text-slate-400 text-sm mb-3">
                    Action Verbs Used
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {printingAnalysis.metadata.actionVerbsFound.map(
                      (verb, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-green-500/10 text-green-400 rounded text-xs capitalize"
                        >
                          {verb}
                        </span>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Quantifiable Examples */}
              {printingAnalysis.metadata.quantifiableExamples?.length > 0 && (
                <div className="mt-4">
                  <p className="text-slate-400 text-sm mb-3">
                    Quantifiable Achievements Found
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {printingAnalysis.metadata.quantifiableExamples.map(
                      (example, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-amber-500/10 text-amber-400 rounded-lg text-sm"
                        >
                          {example}
                        </span>
                      )
                    )}
                  </div>
                </div>
              )}

          {/* Experience Highlights */}
          {printingAnalysis.experienceHighlights?.length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-cyan-400" />
                Key Experience Highlights
              </h2>
              <ul className="space-y-2">
                {printingAnalysis.experienceHighlights.map(
                  (highlight, index) => (
                    <li
                      key={index}
                      className="text-slate-300 flex items-start gap-2 bg-slate-700/30 rounded-lg p-3"
                    >
                      <Target className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                      <span>{highlight}</span>
                    </li>
                  )
                )}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* PAGE 2 */}
      <div
        id="history-report-print-page-2"
        className="p-10 bg-[#090a0b] text-white flex flex-col justify-between"
        style={{
          width: "1000px",
          height: "1400px",
          boxSizing: "border-box",
        }}
      >
        <div className="space-y-6">

              {/* Strengths & Improvements Grid */}
              <div className="grid grid-cols-2 gap-6">
                {/* Strengths */}
                <div className="bg-white/5 border border-green-500/30 rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    Strengths
                  </h2>
                  <ul className="space-y-3">
                    {printingAnalysis.strengths?.map((item, index) => (
                      <li
                        key={index}
                        className="text-slate-300 flex items-start gap-3"
                      >
                        <span className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="w-3 h-3 text-green-400" />
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Areas for Improvement */}
                <div className="bg-white/5 border border-amber-500/30 rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-400" />
                    Areas for Improvement
                  </h2>
                  <ul className="space-y-3">
                    {printingAnalysis.improvements?.map((item, index) => (
                      <li
                        key={index}
                        className="text-slate-300 flex items-start gap-3"
                      >
                        <span className="w-6 h-6 bg-amber-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                          <AlertCircle className="w-3 h-3 text-amber-400" />
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Skills Analysis */}
              <div className="bg-white/5 border border-white/10 rounded-lg p-5">
                <h2 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
                  <Code className="w-4 h-4 text-blue-400" />
                  Skills Analysis
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                      Skills Found ({printingAnalysis.skills?.present?.length || 0})
                    </h3>
                    <div className="flex flex-wrap gap-1">
                      {printingAnalysis.skills?.present?.length > 0 ? (
                        printingAnalysis.skills.present.slice(0, 18).map((skill, index) => (
                          <span
                            key={index}
                            className="px-2 py-0.5 bg-green-500/15 text-green-400 rounded text-xs font-medium"
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <p className="text-slate-500 text-xs">
                          No technical skills detected
                        </p>
                      )}
                      {printingAnalysis.skills?.present?.length > 18 && (
                        <span className="text-slate-500 text-xs self-center">
                          +{printingAnalysis.skills.present.length - 18} more
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-2">
                      <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
                      Recommended Skills to Add
                    </h3>
                    <div className="flex flex-wrap gap-1">
                      {printingAnalysis.skills?.missing?.slice(0, 12).map((skill, index) => (
                        <span
                          key={index}
                          className="px-2 py-0.5 bg-blue-500/15 text-blue-400 rounded text-xs font-medium"
                        >
                          + {skill}
                        </span>
                      ))}
                      {printingAnalysis.skills?.missing?.length > 12 && (
                        <span className="text-slate-500 text-xs self-center">
                          +{printingAnalysis.skills.missing.length - 12} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              {printingAnalysis.categoryScores && (() => {
                const planKey = (printingAnalysis.plan || "free").toLowerCase();
                let title = "Explorer AI Analysis";
                let badge = "Free Explorer Plan";
                let badgeColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
                let borderClass = "border-emerald-500/20 shadow-[0_4px_20px_rgba(16,185,129,0.05)]";
                let IconComponent = Sparkles;
                let description = "Standard per-category evaluation breakdown scored by Career Lens AI.";

                if (planKey === "pro" || planKey === "career pro") {
                  title = "Pro AI Deep Analysis";
                  badge = "Career Pro Plan";
                  badgeColor = "text-amber-400 bg-amber-500/10 border-amber-500/20";
                  borderClass = "border-amber-500/20 shadow-[0_4px_20px_rgba(245,158,11,0.05)]";
                  IconComponent = TrendingUp;
                  description = "Advanced per-category analysis scored by Career Lens AI for Pro Growth subscribers.";
                } else if (planKey === "enterprise" || planKey === "placement cell" || planKey === "placement-cell") {
                  title = "Enterprise Deep Analysis";
                  badge = "Placement Cell / Enterprise";
                  badgeColor = "text-cyan-400 bg-cyan-500/10 border-cyan-500/20";
                  borderClass = "border-cyan-500/20 shadow-[0_4px_20px_rgba(6,182,212,0.05)]";
                  IconComponent = Crown;
                  description = "Comprehensive institutional-grade audit scored by Career Lens AI for placement evaluation.";
                }

                return (
                  <div className={`bg-white/5 border ${borderClass} rounded-xl p-6 transition-all duration-300`}>
                    <h2 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                      <IconComponent className="w-5 h-5" />
                      {title}
                      <span className={`ml-auto text-xs font-semibold px-2.5 py-1 rounded-full border flex items-center gap-1 ${badgeColor}`}>
                        {badge}
                      </span>
                    </h2>
                    <p className="text-slate-400 text-sm mb-6">{description}</p>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(printingAnalysis.categoryScores).map(([cat, score]) => {
                        const pct = Math.min(100, Math.max(0, Number(score)));
                        const color =
                          pct >= 80 ? { bar: "bg-emerald-500", text: "text-emerald-400", ring: "ring-emerald-500/30" }
                          : pct >= 60 ? { bar: "bg-cyan-500", text: "text-cyan-400", ring: "ring-cyan-500/30" }
                          : pct >= 40 ? { bar: "bg-amber-500", text: "text-amber-400", ring: "ring-amber-500/30" }
                          : { bar: "bg-red-500", text: "text-red-400", ring: "ring-red-500/30" };
                        return (
                          <div key={cat} className={`bg-slate-800/50 rounded-xl p-4 ring-1 ${color.ring} hover:bg-slate-800/80 transition-colors`}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-slate-300 text-sm font-medium">{cat}</span>
                              <span className={`text-lg font-extrabold ${color.text}`}>{pct}<span className="text-xs font-normal opacity-70">/100</span></span>
                            </div>
                            <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${color.bar} transition-all duration-700`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
