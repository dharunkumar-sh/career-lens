"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Compass,
  Clock,
  Award,
  BookOpen,
  Code2,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Zap,
  CheckSquare,
  Square,
  FileText,
  Layers,
  BarChart3,
  RefreshCw,
  Info,
  ChevronRight,
  ClipboardCopy,
  Download,
} from "lucide-react";
import {
  SKILL_CATEGORIES,
} from "@/lib/roleSkillsDatabase";
import { getLatestResumeAnalysis } from "@/utils/firebaseConfig";

export default function SkillGapRoadmapPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  // Resume Data State
  const [resumeAnalysis, setResumeAnalysis] = useState(null);
  const [loadingResume, setLoadingResume] = useState(true);

  // Dynamic Mapped Gaps State (AI Generated)
  const [mappedMissingSkills, setMappedMissingSkills] = useState([]);
  const [loadingAdvisor, setLoadingAdvisor] = useState(false);

  // Custom study pace & completed skills
  const [studyHoursPerWeek, setStudyHoursPerWeek] = useState(15); // 15 hrs/week default
  const [completedSkillIds, setCompletedSkillIds] = useState([]);
  const [expandedSkillId, setExpandedSkillId] = useState(null);

  // Tabs state
  const [activeTab, setActiveTab] = useState("roadmap"); // 'roadmap' | 'comparison' | 'projects' | 'ai-advice'

  // AI Advice State
  const [aiAdvice, setAiAdvice] = useState("");
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiSource, setAiSource] = useState("");

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [loading, isAuthenticated, router]);

  // Load resume analysis from Firestore or LocalStorage
  useEffect(() => {
    const loadResumeData = async () => {
      if (!user?.uid) {
        setLoadingResume(false);
        return;
      }

      try {
        setLoadingResume(true);
        // 1. Try fetching from Firestore first
        const firestoreData = await getLatestResumeAnalysis(user.uid);
        if (firestoreData) {
          setResumeAnalysis(firestoreData);
        } else {
          // 2. Fallback to localStorage
          const localData = localStorage.getItem("lastResumeAnalysis");
          if (localData) {
            setResumeAnalysis(JSON.parse(localData));
          }
        }
      } catch (err) {
        console.error("Error loading resume analysis:", err);
        const localData = localStorage.getItem("lastResumeAnalysis");
        if (localData) {
          setResumeAnalysis(JSON.parse(localData));
        }
      } finally {
        setLoadingResume(false);
      }
    };

    if (!loading && isAuthenticated) {
      loadResumeData();
    }
  }, [user?.uid, loading, isAuthenticated]);

  // Fetch detailed AI metadata for missing skills from /api/skill-advisor
  useEffect(() => {
    const fetchAdvisorMetadata = async () => {
      if (!resumeAnalysis || !resumeAnalysis.skills || !resumeAnalysis.skills.missing) {
        return;
      }
      
      const missingRaw = resumeAnalysis.skills.missing;
      if (missingRaw.length === 0) {
        setMappedMissingSkills([]);
        return;
      }

      try {
        setLoadingAdvisor(true);
        const res = await fetch("/api/skill-advisor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ missingSkills: missingRaw }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch advisor stats");
        
        if (data.skills) {
          const sanitized = data.skills.map((sk) => ({
            ...sk,
            id: sk.id || sk.name.toLowerCase().replace(/[^a-z0-9]/g, "_")
          }));
          setMappedMissingSkills(sanitized);
        }
      } catch (err) {
        console.error("Advisor API error:", err);
        toast.error("Failed to generate complete AI roadmap metadata.");
      } finally {
        setLoadingAdvisor(false);
      }
    };

    fetchAdvisorMetadata();
  }, [resumeAnalysis]);

  // Load completed skills checklist from localStorage
  useEffect(() => {
    if (user?.uid) {
      try {
        const savedCompleted = localStorage.getItem(`completedSkills_${user.uid}`);
        if (savedCompleted) {
          setCompletedSkillIds(JSON.parse(savedCompleted));
        }
      } catch (e) {
        console.error("Error loading completed skills checklist:", e);
      }
    }
  }, [user?.uid]);

  // Save completed skills to localStorage
  const handleToggleSkillCompleted = (skillId) => {
    const updated = completedSkillIds.includes(skillId)
      ? completedSkillIds.filter((id) => id !== skillId)
      : [...completedSkillIds, skillId];

    setCompletedSkillIds(updated);
    if (user?.uid) {
      try {
        localStorage.setItem(`completedSkills_${user.uid}`, JSON.stringify(updated));
      } catch (e) {
        console.error("Error saving completed skills checklist:", e);
      }
    }
    toast.success(
      completedSkillIds.includes(skillId)
        ? "Skill removed from completed list"
        : "Skill marked as completed!"
    );
  };

  // Compile present skills from resume (simpler mapping for display since they are already acquired)
  const resumePresentSkills = useMemo(() => {
    if (!resumeAnalysis || !resumeAnalysis.skills || !resumeAnalysis.skills.present) return [];

    return resumeAnalysis.skills.present.map((name) => {
      const query = name.toLowerCase().trim();
      let category = "FRAMEWORKS";
      if (["aws", "docker", "kubernetes", "devops", "cloud", "sre"].some(kw => query.includes(kw))) category = "CLOUD_DEVOPS";
      else if (["python", "javascript", "typescript", "java", "sql", "golang"].some(kw => query.includes(kw))) category = "LANGUAGES";
      else if (["ai", "ml", "tensorflow", "pytorch", "llm", "data"].some(kw => query.includes(kw))) category = "DATA_AI";

      return {
        id: query.replace(/[^a-z0-9]/g, "_"),
        name,
        category,
        importance: "Medium",
      };
    });
  }, [resumeAnalysis]);

  // Calculations for page metrics
  const stats = useMemo(() => {
    const presentCount = resumePresentSkills.length;
    const missingSkills = mappedMissingSkills;
    
    // Gaps marked completed by user
    const completedGaps = missingSkills.filter((s) => completedSkillIds.includes(s.id));
    const completedCount = completedGaps.length;

    const totalSkills = presentCount + missingSkills.length;
    
    // Match percentage accounts for present skills + checked off gaps
    const matchPercentage = totalSkills > 0
      ? Math.round(((presentCount + completedCount) / totalSkills) * 100)
      : 0;

    // Remaining hours
    const remainingMissing = missingSkills.filter((s) => !completedSkillIds.includes(s.id));
    const totalRemainingHours = remainingMissing.reduce((acc, s) => acc + (s.estimatedHours || 30), 0);

    // Group remaining missing skills into phases
    const phases = [
      {
        phaseNumber: 1,
        title: "Phase 1: Foundational Enhancements",
        description: "Master baseline syntax, foundational tools, and early prerequisites to start closing profile gaps.",
        skills: [],
        hours: 0,
        badgeColor: "cyan",
      },
      {
        phaseNumber: 2,
        title: "Phase 2: Core Stack Integration",
        description: "Build structural competency using modern frameworks, key libraries, and intermediate design principles.",
        skills: [],
        hours: 0,
        badgeColor: "purple",
      },
      {
        phaseNumber: 3,
        title: "Phase 3: Production Deployments & Mastery",
        description: "Focus on cloud deployment, scalable system design, security, and advanced specialization skills.",
        skills: [],
        hours: 0,
        badgeColor: "amber",
      },
    ];

    missingSkills.forEach((skill, idx) => {
      let phaseIndex = 0;
      if (skill.difficulty === "Beginner" || idx < Math.ceil(missingSkills.length / 3)) {
        phaseIndex = 0;
      } else if (skill.difficulty === "Intermediate" || idx < Math.ceil((missingSkills.length * 2) / 3)) {
        phaseIndex = 1;
      } else {
        phaseIndex = 2;
      }

      phases[phaseIndex].skills.push(skill);
      phases[phaseIndex].hours += skill.estimatedHours || 30;
    });

    const activePhases = phases.filter(p => p.skills.length > 0);

    // Category distribution stats
    const categoryStats = {};
    Object.keys(SKILL_CATEGORIES).forEach((key) => {
      categoryStats[key] = {
        name: SKILL_CATEGORIES[key].name,
        color: SKILL_CATEGORIES[key].color,
        total: 0,
        matched: 0,
        percentage: 100,
      };
    });

    // Count present
    resumePresentSkills.forEach((sk) => {
      if (categoryStats[sk.category]) {
        categoryStats[sk.category].total += 1;
        categoryStats[sk.category].matched += 1;
      }
    });

    // Count missing
    missingSkills.forEach((sk) => {
      if (categoryStats[sk.category]) {
        categoryStats[sk.category].total += 1;
        if (completedSkillIds.includes(sk.id)) {
          categoryStats[sk.category].matched += 1;
        }
      }
    });

    Object.keys(categoryStats).forEach((key) => {
      const cat = categoryStats[key];
      cat.percentage = cat.total > 0 ? Math.round((cat.matched / cat.total) * 100) : 100;
    });

    const filteredCategoryStats = Object.values(categoryStats).filter(
      (cat) => cat.total > 0
    );

    return {
      matchPercentage,
      totalSkills,
      presentCount,
      missingCount: missingSkills.length,
      completedCount,
      totalRemainingHours,
      phases: activePhases,
      categoryStats: filteredCategoryStats,
    };
  }, [resumePresentSkills, mappedMissingSkills, completedSkillIds]);

  // Study Forecast based on Pace
  const forecast = useMemo(() => {
    const weeks = Math.max(1, Math.ceil(stats.totalRemainingHours / studyHoursPerWeek));
    const months = (weeks / 4.3).toFixed(1);
    return { weeks, months };
  }, [stats.totalRemainingHours, studyHoursPerWeek]);

  // AI transition coaching advisor trigger
  const handleGenerateAiAdvice = async () => {
    setIsGeneratingAi(true);
    setAiAdvice("");
    setActiveTab("ai-advice");

    try {
      const missingSkillsNames = mappedMissingSkills
        .filter((s) => !completedSkillIds.includes(s.id))
        .map((s) => s.name);

      const response = await fetch("/api/role-transition-advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentRoleTitle: "My Resume Profile",
          targetRoleTitle: "Target Advanced Position",
          missingSkills: missingSkillsNames,
          matchPercentage: stats.matchPercentage,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to generate advice");

      setAiAdvice(data.content);
      if (data.source) setAiSource(data.source);
      toast.success("AI Coach transition plan generated!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate AI Coach advice. Check internet connection.");
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const parseSections = (markdownText) => {
    if (!markdownText) return [];
    // Split by horizontal rules
    const rawParts = markdownText.split(/(?:^|\n)---+(?:\n|$)/g);
    return rawParts.map((p) => p.trim()).filter(Boolean);
  };

  const handleDownloadPDF = async () => {
    const toastId = toast.loading("Generating transition coaching PDF report...");
    try {
      const html2canvas = (await import("html2canvas-pro")).default;
      const { jsPDF } = await import("jspdf");

      const sections = parseSections(aiAdvice);
      if (sections.length === 0) throw new Error("Coaching report content not found");

      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210;
      const pageHeight = 297;
      
      const options = {
        scale: 2.5, // high scale for professional enterprise resolution
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff", // clean white background
        windowWidth: 800,
      };

      for (let i = 0; i < sections.length; i++) {
        const element = document.getElementById(`print-section-${i}`);
        if (!element) continue;

        const canvas = await html2canvas(element, options);
        const imgData = canvas.toDataURL("image/png");
        
        // Fit perfectly with narrow margins (5mm on each side)
        const pdfWidth = 200; // 210 - 10 (5mm left, 5mm right)
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        
        if (i > 0) {
          pdf.addPage();
        }

        // Center on A4 with 5mm left margin, 5mm top margin
        pdf.addImage(imgData, "PNG", 5, 5, pdfWidth, Math.min(pdfHeight, pageHeight - 10), "", "FAST");
      }

      pdf.save(`AI_Coaching_Report_${Date.now()}.pdf`);
      toast.success("PDF Report downloaded successfully!", { id: toastId });
    } catch (err) {
      console.error("PDF generation failed:", err);
      toast.error("Failed to generate PDF. Please try again.", { id: toastId });
    }
  };

  // Render loading state
  if (loading || loadingResume || (loadingAdvisor && mappedMissingSkills.length === 0)) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4 text-white">
        <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
        <p className="text-slate-400 font-medium animate-pulse">
          {loadingAdvisor ? "Synthesizing dynamic learning paths with AI..." : "Loading Personalized Skill Engine..."}
        </p>
      </div>
    );
  }

  // Render empty state if no resume is parsed yet
  if (!resumeAnalysis) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16 text-white text-center animate-fadeIn">
        <div className="bg-white/5 border border-white/10 rounded-3xl p-12 backdrop-blur-md shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 bg-slate-900 border border-white/15 rounded-2xl flex items-center justify-center mb-8 shadow-xl">
              <Compass className="w-10 h-10 text-cyan-400 animate-pulse" />
            </div>
            
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-400 mb-4 leading-tight">
              Personalized Skill Gap Roadmaps
            </h1>
            
            <p className="text-slate-400 max-w-lg mx-auto mb-8 text-base leading-relaxed">
              We analyze the gaps between your current skill set and required industry profiles to draft a personalized milestones learning path.
              <span className="block mt-3 text-cyan-400 font-semibold">Please upload and analyze your resume to get started.</span>
            </p>

            <Link
              href="/dashboard/resume-analysis"
              className="px-8 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl font-bold shadow-lg shadow-cyan-500/25 transition-all hover:scale-102 flex items-center gap-2 group"
            >
              <span>Analyze Resume First</span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white pb-20">
      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Page Actions & Header Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Compass className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-extrabold text-2xl leading-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-400">
                Personalized Skill Gap Analyzer
              </h1>
              <p className="text-xs text-cyan-400 font-bold tracking-wider uppercase mt-0.5">
                Dynamic Career Advancement Roadmap
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/resume-analysis"
              className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer"
            >
              <FileText className="w-4 h-4 text-slate-400" />
              <span>Update Resume</span>
            </Link>
          </div>
        </div>

        {/* ATS Score and Study Pace Hero Panel */}
        <div className="mb-8 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-white/10 rounded-3xl p-8 backdrop-blur-md shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            {/* Radial Match Score Ring */}
            <div className="lg:col-span-4 flex flex-col items-center justify-center text-center border-b lg:border-b-0 lg:border-r border-white/10 pb-6 lg:pb-0 lg:pr-8">
              <div className="relative w-44 h-44 flex items-center justify-center mb-4">
                <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    className="text-white/5"
                    strokeWidth="8"
                    stroke="currentColor"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    className="text-cyan-400 transition-all duration-1000 ease-out"
                    strokeWidth="8"
                    strokeDasharray={264}
                    strokeDashoffset={264 - (264 * stats.matchPercentage) / 100}
                    strokeLinecap="round"
                    stroke="url(#radial-gradient)"
                    fill="transparent"
                  />
                  <defs>
                    <linearGradient id="radial-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#06b6d4" />
                      <stop offset="50%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-green-400">
                    {stats.matchPercentage}%
                  </span>
                  <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 mt-1">
                    Overall Fit
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs font-semibold">
                <div className="px-3 py-1.5 bg-green-500/10 text-green-300 rounded-lg border border-green-500/20 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{stats.presentCount + stats.completedCount} Mastered</span>
                </div>
                <div className="px-3 py-1.5 bg-amber-500/10 text-amber-300 rounded-lg border border-amber-500/20 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  <span>{stats.missingCount - stats.completedCount} Remaining</span>
                </div>
              </div>
            </div>

            {/* Forecaster and Study Pace Sliders */}
            <div className="lg:col-span-8 flex flex-col justify-between">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-cyan-400" />
                    Learning Speed & Schedule Forecast
                  </h2>
                  <p className="text-slate-400 text-sm mt-1">
                    Adjust your weekly study pacing. Dynamic forecast updates depending on remaining hours.
                  </p>
                </div>
                {stats.totalRemainingHours > 0 ? (
                  <div className="px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-xl text-sm font-bold text-purple-300 self-start sm:self-center flex items-center gap-2 whitespace-nowrap">
                    <Clock className="w-4 h-4 text-purple-400" />
                    <span>~{forecast.weeks} Weeks ({forecast.months} Months)</span>
                  </div>
                ) : (
                  <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-sm font-bold text-emerald-300 self-start sm:self-center flex items-center gap-2 whitespace-nowrap">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Roadmap Mastered!</span>
                  </div>
                )}
              </div>

              {/* Study Slider */}
              <div className="bg-black/40 border border-white/10 rounded-2xl p-5 mb-6">
                <div className="flex items-center justify-between mb-3 text-sm font-medium">
                  <span className="text-slate-300 flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
                    Study Commit: <span className="text-cyan-400 font-extrabold">{studyHoursPerWeek} hrs / week</span>
                  </span>
                  <span className="text-xs text-slate-500">
                    {studyHoursPerWeek <= 10 && "Casual Learning"}
                    {studyHoursPerWeek > 10 && studyHoursPerWeek <= 20 && "Steady Committer"}
                    {studyHoursPerWeek > 20 && studyHoursPerWeek <= 30 && "Intensive Study"}
                    {studyHoursPerWeek > 30 && "Full Bootcamp Pace"}
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="40"
                  step="5"
                  value={studyHoursPerWeek}
                  onChange={(e) => setStudyHoursPerWeek(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
                <div className="flex justify-between text-[11px] text-slate-500 mt-2 font-medium">
                  <span>5 hrs</span>
                  <span>15 hrs</span>
                  <span>25 hrs</span>
                  <span>40 hrs</span>
                </div>
              </div>

              {/* Learning Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-slate-400">
                  <span>Roadmap Completion Progress</span>
                  <span className="text-cyan-400">{stats.matchPercentage}% Completed</span>
                </div>
                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden flex">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full transition-all duration-500"
                    style={{ width: `${stats.matchPercentage}%` }}
                    title={`Completed: ${stats.matchPercentage}%`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab System Links */}
        <div className="flex border-b border-white/10 mb-8 overflow-x-auto gap-2 scrollbar-none">
          <button
            onClick={() => setActiveTab("roadmap")}
            className={`px-5 py-3.5 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "roadmap"
                ? "border-cyan-400 text-cyan-400 bg-cyan-500/10"
                : "border-transparent text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Structured roadmap ({stats.phases.length} Phases)</span>
          </button>

          <button
            onClick={() => setActiveTab("comparison")}
            className={`px-5 py-3.5 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "comparison"
                ? "border-cyan-400 text-cyan-400 bg-cyan-500/10"
                : "border-transparent text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Technical domains competency</span>
          </button>

          <button
            onClick={() => setActiveTab("projects")}
            className={`px-5 py-3.5 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "projects"
                ? "border-cyan-400 text-cyan-400 bg-cyan-500/10"
                : "border-transparent text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Projects & certifications portfolio ({mappedMissingSkills.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("ai-advice");
              if (!aiAdvice && !isGeneratingAi) {
                handleGenerateAiAdvice();
              }
            }}
            className={`px-5 py-3.5 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "ai-advice"
                ? "border-purple-400 text-purple-400 bg-purple-500/10"
                : "border-transparent text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
            <span>AI Coach transition advice</span>
          </button>
        </div>

        {/* Tab 1: Roadmap Phases */}
        {activeTab === "roadmap" && (
          <div className="space-y-8 animate-fadeIn">
            {stats.phases.length === 0 ? (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-12 text-center">
                <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4 animate-bounce" />
                <h3 className="text-2xl font-bold text-white mb-2">100% Skill Profile Match!</h3>
                <p className="text-slate-300 max-w-xl mx-auto">
                  Your resume lists all technical capabilities. You have no pending skill gaps detected. You are ready to explore jobs or advanced specializations!
                </p>
              </div>
            ) : (
              stats.phases.map((phase) => {
                const phaseWeeks = Math.max(1, Math.ceil(phase.hours / studyHoursPerWeek));
                const completedInPhase = phase.skills.filter((sk) => completedSkillIds.includes(sk.id)).length;
                const isPhaseComplete = completedInPhase === phase.skills.length;

                return (
                  <div
                    key={phase.phaseNumber}
                    className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-md shadow-xl transition-all hover:border-white/15"
                  >
                    {/* Phase Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-white/10">
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center font-extrabold text-lg shadow-lg ${
                            isPhaseComplete
                              ? "bg-green-500 text-white shadow-green-500/20"
                              : phase.phaseNumber === 1
                              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                              : phase.phaseNumber === 2
                              ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                              : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                          }`}
                        >
                          {isPhaseComplete ? <CheckCircle2 className="w-6 h-6" /> : `#${phase.phaseNumber}`}
                        </div>
                        <div>
                          <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="text-xl font-bold text-white">{phase.title}</h3>
                            <span className="px-3 py-1 bg-white/10 text-slate-300 rounded-full text-xs font-semibold">
                              ~{phase.hours} Study Hours • {phaseWeeks} Weeks
                            </span>
                          </div>
                          <p className="text-slate-400 text-sm mt-1">{phase.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-start md:self-center">
                        <span className="text-xs font-bold text-slate-400">
                          Progress: {completedInPhase}/{phase.skills.length} Mastered
                        </span>
                        <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full transition-all duration-300"
                            style={{ width: `${(completedInPhase / phase.skills.length) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Phase Skills Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {phase.skills.map((skill) => {
                        const isDone = completedSkillIds.includes(skill.id);
                        const isExpanded = expandedSkillId === skill.id;
                        const catMeta = SKILL_CATEGORIES[skill.category] || { name: skill.category, color: "blue" };

                        return (
                          <div
                            key={skill.id}
                            className={`rounded-2xl border transition-all duration-300 flex flex-col justify-between ${
                              isDone
                                ? "bg-green-500/5 border-green-500/20 hover:border-green-500/30 opacity-90"
                                : "bg-black/40 border-white/10 hover:border-cyan-500/40 hover:bg-black/50"
                            }`}
                          >
                            <div className="p-5">
                              {/* Main Card Header */}
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-3">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleSkillCompleted(skill.id)}
                                    className="mt-0.5 text-slate-400 hover:text-cyan-400 transition-colors focus:outline-none"
                                    title={isDone ? "Mark Uncompleted" : "Mark Completed"}
                                  >
                                    {isDone ? (
                                      <CheckSquare className="w-5.5 h-5.5 text-green-400" />
                                    ) : (
                                      <Square className="w-5.5 h-5.5 text-slate-500 hover:text-cyan-400" />
                                    )}
                                  </button>
                                  
                                  <div>
                                    <h4 className={`text-base font-bold transition-all ${isDone ? "line-through text-slate-400" : "text-white"}`}>
                                      {skill.name}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                      <span className="px-2.5 py-0.5 bg-white/5 border border-white/10 text-slate-300 rounded-md text-[10px] font-semibold">
                                        {catMeta.name}
                                      </span>
                                      <span
                                        className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${
                                          skill.importance === "Critical"
                                            ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                                            : skill.importance === "High"
                                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                            : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                        }`}
                                      >
                                        {skill.importance}
                                      </span>
                                      <span className="text-[11px] text-slate-500 font-semibold">
                                        ~{skill.estimatedHours} hrs ({skill.difficulty})
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Prerequisites badge */}
                              {skill.prerequisites && skill.prerequisites.length > 0 && (
                                <div className="mt-4 pt-3 border-t border-white/5 text-[11px] text-slate-400 flex flex-wrap items-center gap-2">
                                  <span className="text-slate-500 font-bold uppercase tracking-wider">Prereqs:</span>
                                  {skill.prerequisites.map((pName) => {
                                    const pid = pName.toLowerCase().replace(/[^a-z0-9]/g, "_");
                                    const isPrereqMet = resumePresentSkills.some((ps) => ps.id === pid) || completedSkillIds.includes(pid);
                                    return (
                                      <span
                                        key={pName}
                                        className={`px-2 py-0.5 rounded-md font-semibold flex items-center gap-1 ${
                                          isPrereqMet ? "bg-green-500/10 text-green-400 border border-green-500/25" : "bg-slate-800 text-amber-400 border border-white/5"
                                        }`}
                                      >
                                        {isPrereqMet && <CheckCircle2 className="w-3 h-3 text-green-400" />}
                                        <span>{pName}</span>
                                      </span>
                                    );
                                  })}
                                </div>
                              )}

                              {/* Expandable Details Container */}
                              {isExpanded && (
                                <div className="mt-4 pt-4 border-t border-white/5 space-y-4 animate-fadeIn">
                                  {/* suggested project */}
                                  {skill.suggestedProject && (
                                    <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-3.5">
                                      <div className="text-xs font-bold text-cyan-300 flex items-center gap-1.5 mb-1.5">
                                        <Code2 className="w-4 h-4" />
                                        <span>Hands-on Sandbox Project:</span>
                                      </div>
                                      <p className="text-slate-300 text-xs leading-relaxed">{skill.suggestedProject}</p>
                                      
                                      <button
                                        onClick={() => {
                                          navigator.clipboard.writeText(skill.suggestedProject);
                                          toast.success("Project prompt copied to clipboard!");
                                        }}
                                        className="mt-2.5 py-1 px-3 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-lg text-[10px] font-bold transition-all flex items-center gap-1"
                                      >
                                        <ClipboardCopy className="w-3.5 h-3.5" />
                                        <span>Copy Prompt</span>
                                      </button>
                                    </div>
                                  )}

                                  {/* learning guides */}
                                  {skill.learningResources && skill.learningResources.length > 0 && (
                                    <div>
                                      <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-1.5">
                                        <BookOpen className="w-4 h-4 text-cyan-400" />
                                        <span>Recommended Learning Guides:</span>
                                      </div>
                                      <ul className="space-y-1 pl-4 list-disc text-xs text-slate-400">
                                        {skill.learningResources.map((res, i) => (
                                          <li key={i}>{res}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}

                                  {/* industry certs */}
                                  {skill.certification && (
                                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3.5 flex items-center gap-3">
                                      <Award className="w-5 h-5 text-amber-400 shrink-0" />
                                      <div>
                                        <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Recommended Certification:</div>
                                        <div className="text-xs font-semibold text-white mt-0.5">{skill.certification}</div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Card Footer toggle */}
                            <button
                              onClick={() => setExpandedSkillId(isExpanded ? null : skill.id)}
                              className="w-full py-2.5 bg-white/2 hover:bg-white/5 border-t border-white/5 text-xs font-semibold text-slate-400 hover:text-white transition-all flex items-center justify-center gap-1 rounded-b-2xl focus:outline-none"
                            >
                              <span>{isExpanded ? "Collapse Details" : "View Learning Resources & Project"}</span>
                              <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Tab 2: Category Competency */}
        {activeTab === "comparison" && (
          <div className="space-y-8 animate-fadeIn">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-md shadow-xl">
              <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-cyan-400" />
                Technical Domain Match Strengths
              </h3>
              <p className="text-slate-400 text-sm mb-8">
                Distribution of skills extracted from your resume context across major technical skill types.
              </p>

              <div className="space-y-6">
                {stats.categoryStats.map((cat, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between items-center text-sm font-semibold">
                      <span className="text-white flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            cat.color === "cyan"
                              ? "bg-cyan-400"
                              : cat.color === "blue"
                              ? "bg-blue-400"
                              : cat.color === "green"
                              ? "bg-green-400"
                              : cat.color === "purple"
                              ? "bg-purple-400"
                              : cat.color === "amber"
                              ? "bg-amber-400"
                              : "bg-rose-400"
                          }`}
                        />
                        {cat.name}
                      </span>
                      <span className="text-slate-400 text-xs">
                        {cat.matched} / {cat.total} Skills ({cat.percentage}%)
                      </span>
                    </div>

                    <div className="w-full h-4 bg-black/40 border border-white/10 rounded-full overflow-hidden p-0.5 flex">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${
                          cat.percentage === 100
                            ? "bg-gradient-to-r from-green-500 to-emerald-400"
                            : cat.percentage >= 50
                            ? "bg-gradient-to-r from-cyan-500 to-blue-500"
                            : "bg-gradient-to-r from-amber-500 to-rose-500"
                        }`}
                        style={{ width: `${cat.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Complete Badge Grid */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-md shadow-xl">
              <h3 className="text-lg font-bold text-white mb-6">Mastered Skills vs. Learning Targets</h3>
              
              <div className="space-y-6">
                {/* Mastered */}
                <div>
                  <h4 className="text-sm font-bold text-green-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Mastered Resume Skills ({stats.presentCount + stats.completedCount})</span>
                  </h4>
                  <div className="flex flex-wrap gap-2.5">
                    {/* Uploaded present skills */}
                    {resumePresentSkills.map((sk) => (
                      <span
                        key={sk.id}
                        className="px-3 py-1.5 bg-green-500/10 border border-green-500/20 text-green-300 rounded-xl text-xs font-semibold flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                        <span>{sk.name}</span>
                      </span>
                    ))}
                    {/* Manually checked gaps */}
                    {mappedMissingSkills
                      .filter((s) => completedSkillIds.includes(s.id))
                      .map((sk) => (
                        <span
                          key={sk.id}
                          onClick={() => handleToggleSkillCompleted(sk.id)}
                          className="px-3 py-1.5 bg-green-500/10 border border-green-500/20 text-green-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer hover:bg-rose-500/10 hover:border-rose-500/20 hover:text-rose-300 transition-colors"
                          title="Click to mark incomplete"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-400 animate-pulse" />
                          <span>{sk.name} (Acquired)</span>
                        </span>
                      ))}
                    {stats.presentCount === 0 && stats.completedCount === 0 && (
                      <span className="text-xs text-slate-500 italic">No skills analyzed in baseline.</span>
                    )}
                  </div>
                </div>

                {/* Remaining Missing */}
                <div className="pt-6 border-t border-white/10">
                  <h4 className="text-sm font-bold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    <span>Learning Target Gaps ({stats.missingCount - stats.completedCount})</span>
                  </h4>
                  <div className="flex flex-wrap gap-2.5">
                    {mappedMissingSkills
                      .filter((s) => !completedSkillIds.includes(s.id))
                      .map((sk) => (
                        <span
                          key={sk.id}
                          onClick={() => handleToggleSkillCompleted(sk.id)}
                          className="px-3 py-1.5 bg-white/5 border border-white/10 hover:border-cyan-500/30 text-slate-300 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
                          title="Click to mark complete"
                        >
                          <Square className="w-3.5 h-3.5 text-slate-500" />
                          <span>{sk.name}</span>
                          <span className="text-[9px] px-1 bg-white/5 rounded-md text-slate-500">
                            {sk.importance}
                          </span>
                        </span>
                      ))}
                    {stats.missingCount === stats.completedCount && (
                      <span className="text-xs text-green-400 font-semibold italic">All skill gaps closed!</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Projects & Certifications Folder */}
        {activeTab === "projects" && (
          <div className="space-y-8 animate-fadeIn">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-md shadow-xl">
              <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                <Code2 className="w-6 h-6 text-cyan-400" />
                Portfolio Building Projects & Certifications
              </h3>
              <p className="text-slate-400 text-sm mb-6">
                Strengthen your resume and practical competency with hands-on practice projects specifically targeting your missing skills.
              </p>

              {mappedMissingSkills.length === 0 ? (
                <div className="py-12 text-center text-slate-500 italic">No missing skills detected. You have no pending projects needed!</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {mappedMissingSkills.map((sk) => {
                    const isDone = completedSkillIds.includes(sk.id);
                    return (
                      <div
                        key={sk.id}
                        className={`border rounded-2xl p-6 flex flex-col justify-between transition-all ${
                          isDone
                            ? "bg-green-500/5 border-green-500/25 opacity-80"
                            : "bg-black/40 border-white/10 hover:border-cyan-500/40 hover:bg-black/50"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                            <span className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 rounded-lg text-xs font-bold uppercase tracking-wider">
                              Target Skill: {sk.name}
                            </span>
                            <span className="text-xs text-slate-500 font-semibold">~{sk.estimatedHours} study hours</span>
                          </div>

                          {sk.suggestedProject ? (
                            <div className="mb-4">
                              <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-1.5">
                                <Code2 className="w-4 h-4 text-cyan-400" />
                                <span>Suggested Capstone Project:</span>
                              </h4>
                              <p className="text-slate-300 text-xs leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5">
                                {sk.suggestedProject}
                              </p>
                            </div>
                          ) : (
                            <p className="text-xs text-slate-500 italic mb-4">Master core concepts, API syntaxes, and small exercises.</p>
                          )}

                          {sk.certification && (
                            <div className="mt-4 p-3.5 bg-amber-500/5 border border-amber-500/20 rounded-xl flex items-center gap-3">
                              <Award className="w-6 h-6 text-amber-400 shrink-0 animate-pulse" />
                              <div>
                                <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Target Certification:</div>
                                <div className="text-xs font-bold text-white">{sk.certification}</div>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                          <button
                            onClick={() => handleToggleSkillCompleted(sk.id)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                              isDone
                                ? "bg-green-600 text-white shadow-md shadow-green-900/30"
                                : "bg-white/10 hover:bg-white/15 text-slate-200"
                            }`}
                          >
                            {isDone ? (
                              <>
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Acquired & Checked</span>
                              </>
                            ) : (
                              <>
                                <CheckSquare className="w-4 h-4" />
                                <span>Mark Acquired</span>
                              </>
                            )}
                          </button>

                          {sk.suggestedProject && (
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(sk.suggestedProject);
                                toast.success("Project prompt copied to clipboard!");
                              }}
                              className="px-3.5 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/25 rounded-xl text-xs font-bold transition-all cursor-pointer"
                            >
                              Copy Prompt
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: AI Advisor */}
        {activeTab === "ai-advice" && (
          <div className="space-y-8 animate-fadeIn">
            <div className="bg-gradient-to-br from-purple-950/30 via-slate-900 to-slate-950 border border-purple-500/30 rounded-3xl p-6 md:p-8 backdrop-blur-md shadow-2xl relative">
              <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-500/20 border border-purple-500/30 rounded-2xl flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-purple-400 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">AI Coach Transition Plan</h3>
                    <p className="text-slate-400 text-xs mt-0.5">
                      Expert roadmap generated specifically based on your resume profile and missing competencies.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-start md:self-auto">

                  <button
                    onClick={handleGenerateAiAdvice}
                    disabled={isGeneratingAi}
                    className="px-4 py-2.5 bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-lg disabled:opacity-50"
                  >
                    {isGeneratingAi ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" /> Synthesizing Plan...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" /> {aiAdvice ? "Regenerate Coaching Plan" : "Generate Plan Now"}
                      </>
                    )}
                  </button>
                </div>
              </div>

              {isGeneratingAi ? (
                <div className="py-20 flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mb-4" />
                  <h4 className="text-lg font-bold text-white mb-1">Analyzing Profile Competencies...</h4>
                  <p className="text-slate-400 text-sm max-w-md">
                    Our Senior Coach is framing resume translation strategies and weekly timelines customized for your profile.
                  </p>
                </div>
              ) : aiAdvice ? (
                <div className="space-y-6">
                  <div id="ai-coaching-report" className="space-y-6">
                    {parseSections(aiAdvice).map((sectionText, idx) => (
                      <div
                        key={idx}
                        id={`ai-coaching-section-${idx}`}
                        className="prose prose-invert prose-cyan max-w-none text-slate-200 text-sm leading-relaxed space-y-4 bg-black/50 p-6 md:p-8 rounded-2xl border border-white/10 animate-fadeIn"
                      >
                        <ReactMarkdown
                          components={{
                            h1: ({ node, ...props }) => <h1 className="text-2xl font-extrabold text-white border-b border-white/10 pb-3 mb-4 mt-6" {...props} />,
                            h2: ({ node, ...props }) => <h2 className="text-xl font-bold text-cyan-400 mb-3 mt-6" {...props} />,
                            h3: ({ node, ...props }) => <h3 className="text-lg font-bold text-purple-300 mb-2 mt-5" {...props} />,
                            ul: ({ node, ...props }) => <ul className="list-disc pl-6 space-y-2 my-4 text-slate-300" {...props} />,
                            li: ({ node, ...props }) => <li className="leading-relaxed" {...props} />,
                            strong: ({ node, ...props }) => <strong className="font-extrabold text-white" {...props} />,
                            blockquote: ({ node, ...props }) => (
                              <blockquote className="border-l-4 border-cyan-500 bg-cyan-500/10 px-4 py-3 rounded-r-xl text-cyan-200 my-4 italic" {...props} />
                            ),
                          }}
                        >
                          {sectionText}
                        </ReactMarkdown>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 pt-6 border-t border-white/10 flex justify-end gap-3">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(aiAdvice);
                        toast.success("AI coaching advice copied to clipboard!");
                      }}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer focus:outline-none"
                    >
                      Copy Advice Text
                    </button>
                    <button
                      onClick={handleDownloadPDF}
                      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer focus:outline-none shadow-lg"
                    >
                      <Download className="w-4 h-4" />
                      Download PDF Report
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-16 text-center">
                  <Sparkles className="w-12 h-12 text-purple-400/60 mx-auto mb-4" />
                  <h4 className="text-lg font-bold text-white mb-2">Generate Resume-Driven Mentorship Plan</h4>
                  <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
                    Request an expert-level transition strategy covering architectural mindset shifts, resume reframing tactics, and a weekly action plan tailored directly to your gaps.
                  </p>
                  <button
                    onClick={handleGenerateAiAdvice}
                    className="px-6 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-sm font-bold shadow-lg transition-all hover:scale-102 cursor-pointer"
                  >
                    ✨ Generate Coaching Plan
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Off-screen high-contrast white-background print template for clean PDF generation */}
      <div style={{ position: "absolute", left: "-9999px", top: "-9999px", zIndex: -100 }}>
        <div id="ai-coaching-print-template" className="bg-white text-slate-900 p-2 font-sans" style={{ width: "800px" }}>
          {parseSections(aiAdvice).map((sectionText, idx) => (
            <div
              key={idx}
              id={`print-section-${idx}`}
              className="bg-white p-4 mb-4"
              style={{ width: "760px" }}
            >
              <ReactMarkdown
                components={{
                  h1: ({ node, ...props }) => <h1 className="text-2xl font-bold text-slate-900 border-b border-slate-200 pb-2 mb-4 mt-6" {...props} />,
                  h2: ({ node, ...props }) => <h2 className="text-xl font-bold text-indigo-900 mb-3 mt-6" {...props} />,
                  h3: ({ node, ...props }) => <h3 className="text-lg font-bold text-slate-800 mb-2 mt-4" {...props} />,
                  ul: ({ node, ...props }) => <ul className="list-disc pl-6 space-y-2 my-4 text-slate-700" {...props} />,
                  li: ({ node, ...props }) => <li className="leading-relaxed text-slate-700 text-sm" {...props} />,
                  strong: ({ node, ...props }) => <strong className="font-bold text-slate-900" {...props} />,
                  blockquote: ({ node, ...props }) => (
                    <blockquote className="border-l-4 border-indigo-500 bg-slate-50 px-4 py-3 rounded-r-lg text-slate-600 my-4 italic" {...props} />
                  ),
                }}
              >
                {sectionText}
              </ReactMarkdown>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
