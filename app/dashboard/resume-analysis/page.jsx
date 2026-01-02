"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ProfileDropdown from "@/components/ui/profile-dropdown";
import { saveResumeAnalysis } from "@/utils/firebaseConfig";
import {
  FileText,
  Upload,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader2,
  Info,
  Mail,
  Phone,
  Linkedin,
  Github,
  GraduationCap,
  Briefcase,
  Code,
  TrendingUp,
  Target,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";

export default function ResumeAnalysisPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [file, setFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate file size (10MB max)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error("File size exceeds 10MB limit");
        return;
      }
      setFile(selectedFile);
      setAnalysisResult(null);
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/parse-resume", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze resume");
      }

      setAnalysisResult(data);
      // Save to localStorage for job matching
      localStorage.setItem("lastResumeAnalysis", JSON.stringify(data));

      // Save to Firestore if user is logged in
      if (user?.uid) {
        try {
          await saveResumeAnalysis(user.uid, data);
          toast.success("Resume analyzed and saved!");
        } catch (firestoreError) {
          console.error("Error saving to Firestore:", firestoreError);
          toast.success("Resume analyzed! (Save to cloud failed)");
        }
      } else {
        toast.success("Resume analyzed successfully!");
      }
    } catch (err) {
      console.error("Analysis error:", err);
      setError(err.message);
      toast.error(err.message || "Failed to analyze resume");
    } finally {
      setAnalyzing(false);
    }
  };

  const getScoreColor = (score) => {
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

  const getScoreMessage = (score) => {
    if (score >= 80)
      return "Excellent! Your resume is well-optimized and stands out.";
    if (score >= 60)
      return "Good resume! A few improvements could make it even better.";
    if (score >= 40)
      return "Your resume needs some work. Follow the suggestions below.";
    return "Your resume needs significant improvements. Focus on the areas highlighted.";
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
      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Back Button */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold text-white">Resume Analysis</h1>
          </div>
          <p className="text-slate-400">
            Upload your resume to get AI-powered insights and recommendations
          </p>
        </div>

        {/* Upload Section */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-8 mb-8">
          <div className="flex flex-col items-center justify-center">
            <label
              htmlFor="resume-upload"
              className={`w-full border-2 border-dashed rounded-lg p-12 cursor-pointer transition-colors text-center ${
                file
                  ? "border-blue-500/50 bg-blue-500/5"
                  : "border-slate-600 hover:border-blue-500/50"
              }`}
            >
              <Upload
                className={`w-12 h-12 mx-auto mb-4 ${
                  file ? "text-blue-400" : "text-slate-500"
                }`}
              />
              <p className="text-white font-medium mb-2">
                {file ? file.name : "Click to upload your resume"}
              </p>
              <p className="text-slate-400 text-sm mb-1">
                Supports PDF files (Max 10MB)
              </p>
              {file && (
                <p className="text-blue-400 text-xs">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              )}
              <input
                id="resume-upload"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            {file && (
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setFile(null);
                    setAnalysisResult(null);
                    setError(null);
                  }}
                  className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg font-medium transition-colors cursor-pointer"
                >
                  Clear
                </button>
                <button
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-lg font-medium transition-colors flex items-center gap-2 cursor-pointer"
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <FileText className="w-5 h-5" />
                      Analyze Resume
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-8">
            <p className="text-red-400 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {error}
            </p>
          </div>
        )}

        {/* Analysis Results */}
        {analysisResult && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Score Card - Hero Section */}
            <div
              className={`bg-white/5 backdrop-blur-md border ${
                getScoreColor(analysisResult.score).border
              } rounded-xl p-8`}
            >
              <div className="flex flex-col md:flex-row items-center gap-6">
                {/* Score Circle */}
                <div className="relative">
                  <div
                    className={`w-32 h-32 rounded-full ${
                      getScoreColor(analysisResult.score).bg
                    } flex items-center justify-center`}
                  >
                    <div className="text-center">
                      <span
                        className={`text-4xl font-bold ${
                          getScoreColor(analysisResult.score).text
                        }`}
                      >
                        {analysisResult.score}
                      </span>
                      <span
                        className={`text-lg ${
                          getScoreColor(analysisResult.score).text
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
                        (analysisResult.score / 100) * 364
                      } 364`}
                      className={getScoreColor(analysisResult.score).text}
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
                    {getScoreMessage(analysisResult.score)}
                  </p>

                  {/* Quick Stats */}
                  <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-slate-500" />
                      <span className="text-slate-300 text-sm">
                        {analysisResult.metadata?.pageCount || 1} page
                        {(analysisResult.metadata?.pageCount || 1) > 1
                          ? "s"
                          : ""}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Code className="w-4 h-4 text-slate-500" />
                      <span className="text-slate-300 text-sm">
                        {analysisResult.skills?.present?.length || 0} skills
                        found
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-slate-500" />
                      <span className="text-slate-300 text-sm">
                        {analysisResult.metadata?.wordCount || 0} words
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Info Extracted */}
            {analysisResult.contactInfo &&
              Object.keys(analysisResult.contactInfo).length > 0 && (
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-400" />
                    Contact Information Detected
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analysisResult.contactInfo.name && (
                      <div className="flex items-center gap-3 bg-slate-700/30 rounded-lg p-3">
                        <User className="w-4 h-4 text-slate-400" />
                        <span className="text-white">
                          {analysisResult.contactInfo.name}
                        </span>
                      </div>
                    )}
                    {analysisResult.contactInfo.email && (
                      <div className="flex items-center gap-3 bg-slate-700/30 rounded-lg p-3">
                        <Mail className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-300 text-sm truncate">
                          {analysisResult.contactInfo.email}
                        </span>
                      </div>
                    )}
                    {analysisResult.contactInfo.phone && (
                      <div className="flex items-center gap-3 bg-slate-700/30 rounded-lg p-3">
                        <Phone className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-300 text-sm">
                          {analysisResult.contactInfo.phone}
                        </span>
                      </div>
                    )}
                    {analysisResult.contactInfo.linkedin && (
                      <div className="flex items-center gap-3 bg-slate-700/30 rounded-lg p-3">
                        <Linkedin className="w-4 h-4 text-blue-400" />
                        <span className="text-slate-300 text-sm truncate">
                          {analysisResult.contactInfo.linkedin}
                        </span>
                      </div>
                    )}
                    {analysisResult.contactInfo.github && (
                      <div className="flex items-center gap-3 bg-slate-700/30 rounded-lg p-3">
                        <Github className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-300 text-sm truncate">
                          {analysisResult.contactInfo.github}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

            {/* Statistics Grid */}
            {analysisResult.metadata && (
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Info className="w-5 h-5 text-slate-400" />
                  Resume Statistics
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-linear-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-lg p-4">
                    <p className="text-blue-400 text-xs font-medium mb-1">
                      Word Count
                    </p>
                    <p className="text-2xl font-bold text-white">
                      {analysisResult.metadata.wordCount?.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-linear-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-lg p-4">
                    <p className="text-purple-400 text-xs font-medium mb-1">
                      Pages
                    </p>
                    <p className="text-2xl font-bold text-white">
                      {analysisResult.metadata.pageCount}
                    </p>
                  </div>
                  <div className="bg-linear-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-lg p-4">
                    <p className="text-green-400 text-xs font-medium mb-1">
                      Action Verbs
                    </p>
                    <p className="text-2xl font-bold text-white">
                      {analysisResult.metadata.actionVerbCount}
                    </p>
                  </div>
                  <div className="bg-linear-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-lg p-4">
                    <p className="text-amber-400 text-xs font-medium mb-1">
                      Metrics Found
                    </p>
                    <p className="text-2xl font-bold text-white">
                      {analysisResult.metadata.quantifiableCount}
                    </p>
                  </div>
                </div>

                {/* Sections Found */}
                {analysisResult.metadata.sectionsFound?.length > 0 && (
                  <div>
                    <p className="text-slate-400 text-sm mb-3">
                      Sections Detected in Resume
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.metadata.sectionsFound.map(
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

                {/* Action Verbs Found */}
                {analysisResult.metadata.actionVerbsFound?.length > 0 && (
                  <div className="mt-4">
                    <p className="text-slate-400 text-sm mb-3">
                      Action Verbs Used
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.metadata.actionVerbsFound.map(
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
                {analysisResult.metadata.quantifiableExamples?.length > 0 && (
                  <div className="mt-4">
                    <p className="text-slate-400 text-sm mb-3">
                      Quantifiable Achievements Found
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.metadata.quantifiableExamples.map(
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
              </div>
            )}

            {/* Education Section */}
            {analysisResult.education?.length > 0 && (
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-purple-400" />
                  Education Detected
                </h2>
                <ul className="space-y-2">
                  {analysisResult.education.map((edu, index) => (
                    <li
                      key={index}
                      className="text-slate-300 flex items-start gap-2 bg-slate-700/30 rounded-lg p-3"
                    >
                      <CheckCircle className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>{edu}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Experience Highlights */}
            {analysisResult.experienceHighlights?.length > 0 && (
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-cyan-400" />
                  Key Experience Highlights
                </h2>
                <ul className="space-y-2">
                  {analysisResult.experienceHighlights.map(
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

            {/* Strengths & Improvements Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Strengths */}
              <div className="bg-white/5 backdrop-blur-md border border-green-500/30 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  Strengths
                </h2>
                <ul className="space-y-3">
                  {analysisResult.strengths?.map((item, index) => (
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
              <div className="bg-white/5 backdrop-blur-md border border-amber-500/30 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-400" />
                  Areas for Improvement
                </h2>
                <ul className="space-y-3">
                  {analysisResult.improvements?.map((item, index) => (
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
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Code className="w-5 h-5 text-blue-400" />
                Skills Analysis
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Skills Found ({analysisResult.skills?.present?.length || 0})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.skills?.present?.length > 0 ? (
                      analysisResult.skills.present.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1.5 bg-green-500/15 text-green-400 rounded-lg text-sm font-medium"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="text-slate-500 text-sm">
                        No technical skills detected
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-400" />
                    Recommended Skills to Add
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.skills?.missing?.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 bg-blue-500/15 text-blue-400 rounded-lg text-sm font-medium"
                      >
                        + {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
