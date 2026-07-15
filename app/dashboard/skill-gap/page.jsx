"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import ProfileDropdown from "@/components/ui/profile-dropdown";
import ReactMarkdown from "react-markdown";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Search,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Compass,
  Clock,
  Award,
  BookOpen,
  Code2,
  TrendingUp,
  Download,
  Save,
  Printer,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Zap,
  CheckSquare,
  Square,
  FileText,
  Share2,
  Layers,
  BarChart3,
  RefreshCw,
  Info,
} from "lucide-react";
import {
  ROLES_DATABASE,
  SKILLS_POOL,
  SKILL_CATEGORIES,
  POPULAR_TRANSITIONS,
  calculateSkillGap,
} from "@/lib/roleSkillsDatabase";

export default function SkillGapRoadmapPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  // Role selections
  const [currentRoleId, setCurrentRoleId] = useState("frontend_dev");
  const [targetRoleId, setTargetRoleId] = useState("fullstack_dev");

  // Search filter states for dropdowns
  const [currentSearch, setCurrentSearch] = useState("");
  const [targetSearch, setTargetSearch] = useState("");
  const [isCurrentOpen, setIsCurrentOpen] = useState(false);
  const [isTargetOpen, setIsTargetOpen] = useState(false);

  // Custom skills checklist & pace
  const [customPresentSkills, setCustomPresentSkills] = useState([]);
  const [studyHoursPerWeek, setStudyHoursPerWeek] = useState(15); // 15 hrs/week default
  const [completedSkillIds, setCompletedSkillIds] = useState([]);

  // Currency & User Presets
  const [currency, setCurrency] = useState("INR");
  const [customTransitions, setCustomTransitions] = useState([]);
  const [newTransitionTitle, setNewTransitionTitle] = useState("");

  // Format salary utility
  const formatSalary = (salaryStr, curr = currency) => {
    if (!salaryStr) return "N/A";
    const val = parseInt(salaryStr.replace(/[^0-9]/g, ""), 10);
    if (isNaN(val)) return salaryStr;

    if (curr === "INR") {
      const inrVal = Math.round(val * 83.5);
      if (inrVal >= 100000) {
        const lakhs = (inrVal / 100000).toFixed(1);
        return `₹${lakhs} Lakhs / Year (LPA)`;
      }
      return `₹${inrVal.toLocaleString("en-IN")}`;
    }
    return salaryStr;
  };

  // Merge default presets and user-created custom presets
  const allTransitions = useMemo(() => {
    return [...POPULAR_TRANSITIONS, ...customTransitions];
  }, [customTransitions]);

  // AI Advice state
  const [aiAdvice, setAiAdvice] = useState("");
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiSource, setAiSource] = useState("");

  // Tab state within roadmap
  const [activeTab, setActiveTab] = useState("roadmap"); // 'roadmap' | 'comparison' | 'projects' | 'ai-advice'

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [loading, isAuthenticated, router]);

  // Load saved roadmap from localStorage or resume skills
  useEffect(() => {
    try {
      const saved = localStorage.getItem("savedCareerRoadmap");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.currentRoleId) setCurrentRoleId(parsed.currentRoleId);
        if (parsed.targetRoleId) setTargetRoleId(parsed.targetRoleId);
        if (parsed.customPresentSkills) setCustomPresentSkills(parsed.customPresentSkills);
        if (parsed.completedSkillIds) setCompletedSkillIds(parsed.completedSkillIds);
        if (parsed.studyHoursPerWeek) setStudyHoursPerWeek(parsed.studyHoursPerWeek);
      } else {
        // Check if there are extracted skills from Resume Analysis
        const lastResume = localStorage.getItem("lastResumeAnalysis");
        if (lastResume) {
          const parsedResume = JSON.parse(lastResume);
          if (parsedResume.skills?.present && Array.isArray(parsedResume.skills.present)) {
            const matchedIds = Object.keys(SKILLS_POOL).filter((sid) =>
              parsedResume.skills.present.some(
                (rs) => rs.toLowerCase().includes(sid.toLowerCase()) || sid.toLowerCase().includes(rs.toLowerCase())
              )
            );
            if (matchedIds.length > 0) {
              setCustomPresentSkills((prev) => [...new Set([...prev, ...matchedIds])]);
            }
          }
        }
      }

      // Load custom user presets
      const savedCustomTrans = localStorage.getItem("customCareerTransitions");
      if (savedCustomTrans) {
        setCustomTransitions(JSON.parse(savedCustomTrans));
      }
    } catch (e) {
      console.error("Error loading saved state:", e);
    }
  }, []);

  // Save current transition as a new popular preset
  const handleSaveCustomTransition = (e) => {
    e.preventDefault();
    if (!newTransitionTitle.trim()) {
      toast.error("Please enter a title for your transition preset!");
      return;
    }
    
    // Find current and target titles for validation or preset info
    const fromRole = ROLES_DATABASE.find((r) => r.id === currentRoleId);
    const toRole = ROLES_DATABASE.find((r) => r.id === targetRoleId);
    
    if (!fromRole || !toRole) {
      toast.error("Invalid roles selected.");
      return;
    }

    const newPreset = {
      id: `custom_${Date.now()}`,
      title: `${newTransitionTitle.trim()} (${fromRole.title} ➔ ${toRole.title})`,
      from: currentRoleId,
      to: targetRoleId,
      badge: "My Preset",
    };

    const updated = [...customTransitions, newPreset];
    setCustomTransitions(updated);
    localStorage.setItem("customCareerTransitions", JSON.stringify(updated));
    setNewTransitionTitle("");
    toast.success(`Added preset: "${newTransitionTitle}"!`);
  };

  const handleDeleteCustomTransition = (id, e) => {
    e.stopPropagation();
    const updated = customTransitions.filter((t) => t.id !== id);
    setCustomTransitions(updated);
    localStorage.setItem("customCareerTransitions", JSON.stringify(updated));
    toast.success("Preset removed.");
  };

  // Filtered dropdown lists
  const filteredCurrentRoles = useMemo(() => {
    if (!currentSearch.trim()) return ROLES_DATABASE;
    const q = currentSearch.toLowerCase();
    return ROLES_DATABASE.filter(
      (r) => r.title.toLowerCase().includes(q) || r.category.toLowerCase().includes(q) || r.description.toLowerCase().includes(q)
    );
  }, [currentSearch]);

  const filteredTargetRoles = useMemo(() => {
    if (!targetSearch.trim()) return ROLES_DATABASE;
    const q = targetSearch.toLowerCase();
    return ROLES_DATABASE.filter(
      (r) => r.title.toLowerCase().includes(q) || r.category.toLowerCase().includes(q) || r.description.toLowerCase().includes(q)
    );
  }, [targetSearch]);

  // Calculate gap & roadmap metrics
  const gapAnalysis = useMemo(() => {
    return calculateSkillGap(currentRoleId, targetRoleId, [...customPresentSkills, ...completedSkillIds]);
  }, [currentRoleId, targetRoleId, customPresentSkills, completedSkillIds]);

  // Time calculations
  const totalWeeksEstimated = useMemo(() => {
    return Math.max(1, Math.ceil(gapAnalysis.totalMissingHours / studyHoursPerWeek));
  }, [gapAnalysis.totalMissingHours, studyHoursPerWeek]);

  const totalMonthsEstimated = useMemo(() => {
    return (totalWeeksEstimated / 4.3).toFixed(1);
  }, [totalWeeksEstimated]);

  // Handlers
  const handleSelectPresetTransition = (t) => {
    setCurrentRoleId(t.from);
    setTargetRoleId(t.to);
    toast.success(`Loaded transition: ${t.title}`);
  };

  const handleToggleSkillCompleted = (skillId) => {
    setCompletedSkillIds((prev) =>
      prev.includes(skillId) ? prev.filter((id) => id !== skillId) : [...prev, skillId]
    );
  };

  const handleSaveRoadmap = () => {
    try {
      const dataToSave = {
        currentRoleId,
        targetRoleId,
        customPresentSkills,
        completedSkillIds,
        studyHoursPerWeek,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem("savedCareerRoadmap", JSON.stringify(dataToSave));
      toast.success("Roadmap saved! Accessible from your dashboard anytime.");
    } catch (err) {
      toast.error("Failed to save roadmap to local storage.");
    }
  };

  const handleExportMarkdown = () => {
    const { currentRole, targetRole, matchingSkills, missingSkills, roadmapPhases, matchPercentage } = gapAnalysis;

    let md = `# Career Transition Roadmap: ${currentRole.title} ➔ ${targetRole.title}\n\n`;
    md += `**Generated on**: ${new Date().toLocaleDateString()} via CareerLens\n`;
    md += `**Current Skill Match**: ${matchPercentage}%\n`;
    md += `**Estimated Learning Time**: ~${gapAnalysis.totalMissingHours} total hours (${totalWeeksEstimated} weeks @ ${studyHoursPerWeek} hrs/week)\n\n`;
    md += `--- \n\n`;

    md += `## 📊 Skill Comparison Summary\n\n`;
    md += `- **Already Mastered (${matchingSkills.length})**: ${matchingSkills.map((s) => s.name).join(", ") || "None yet"}\n`;
    md += `- **Skills to Acquire (${missingSkills.length})**: ${missingSkills.map((s) => s.name).join(", ")}\n\n`;

    md += `## 🚀 Step-by-Step Learning Milestones\n\n`;

    roadmapPhases.forEach((phase) => {
      const phaseWeeks = Math.max(1, Math.ceil(phase.hours / studyHoursPerWeek));
      md += `### ${phase.title} (~${phase.hours} hrs | ~${phaseWeeks} weeks)\n`;
      md += `${phase.description}\n\n`;

      phase.skills.forEach((skill) => {
        const isDone = completedSkillIds.includes(skill.id);
        md += `- [${isDone ? "x" : " "}] **${skill.name}** (${skill.importance} | ${skill.difficulty} | ~${skill.estimatedHours} hrs)\n`;
        if (skill.prerequisites && skill.prerequisites.length > 0) {
          const prereqNames = skill.prerequisites.map((pid) => SKILLS_POOL[pid]?.name || pid).join(", ");
          md += `  - *Prerequisites*: ${prereqNames}\n`;
        }
        if (skill.suggestedProject) {
          md += `  - 💻 *Hands-on Project*: ${skill.suggestedProject}\n`;
        }
        if (skill.learningResources && skill.learningResources.length > 0) {
          md += `  - 📚 *Top Resources*: ${skill.learningResources.join("; ")}\n`;
        }
        if (skill.certification) {
          md += `  - 🏅 *Recommended Certification*: ${skill.certification}\n`;
        }
        md += `\n`;
      });
    });

    if (aiAdvice) {
      md += `--- \n\n## ✨ AI Career Coach Advice\n\n${aiAdvice}\n`;
    }

    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Career_Roadmap_${currentRoleId}_to_${targetRoleId}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Downloaded Career Roadmap Markdown!");
  };

  const handleGenerateAiAdvice = async () => {
    setIsGeneratingAi(true);
    setAiAdvice("");
    setActiveTab("ai-advice");

    try {
      const res = await fetch("/api/role-transition-advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentRoleTitle: gapAnalysis.currentRole.title,
          targetRoleTitle: gapAnalysis.targetRole.title,
          missingSkills: gapAnalysis.missingSkills,
          matchPercentage: gapAnalysis.matchPercentage,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate AI advice");

      setAiAdvice(data.content);
      if (data.source) setAiSource(data.source);
      toast.success("AI Transition Advice Generated successfully!");
    } catch (err) {
      if (err.name === "AbortError") return;
      console.error("AI Generation error:", err);
      toast.error("Failed to generate AI advice. Check network.");
    } finally {
      setIsGeneratingAi(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
          <p className="text-slate-400 font-medium animate-pulse">Loading Career Roadmap Engine...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Page Actions & Title Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-xl">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-linear-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight text-transparent bg-clip-text bg-linear-to-r from-white via-slate-100 to-slate-400">
                Role & Skill Gap Analyzer
              </h1>
              <p className="text-xs text-cyan-400 font-medium">AI-Powered Career Roadmap Engine</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Currency Selector */}
            <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 text-xs gap-1">
              <button
                type="button"
                onClick={() => {
                  setCurrency("INR");
                  toast.success("Switched salary format to Indian Rupees (INR)");
                }}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  currency === "INR" ? "bg-cyan-500 text-black shadow-md" : "text-slate-400 hover:text-white"
                }`}
              >
                ₹ INR
              </button>
              <button
                type="button"
                onClick={() => {
                  setCurrency("USD");
                  toast.success("Switched salary format to US Dollars (USD)");
                }}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  currency === "USD" ? "bg-cyan-500 text-black shadow-md" : "text-slate-400 hover:text-white"
                }`}
              >
                $ USD
              </button>
            </div>

            <button
              onClick={handleSaveRoadmap}
              className="px-3.5 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-lg text-sm font-medium flex items-center gap-2 transition-all cursor-pointer shadow-md"
            >
              <Save className="w-4 h-4" />
              <span>Save Roadmap</span>
            </button>
            <button
              onClick={handleExportMarkdown}
              className="px-3.5 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-lg text-sm font-medium flex items-center gap-2 transition-all cursor-pointer shadow-md"
            >
              <Download className="w-4 h-4" />
              <span>Export MD</span>
            </button>
          </div>
        </div>
        {/* Popular Transitions Quick Select */}
        <div className="mb-8 bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md shadow-xl">
          <div className="flex items-center justify-between mb-3.5">
            <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
              Popular Career Transitions (Instant Load)
            </h3>
            <span className="text-xs text-slate-500 hidden sm:inline">Click any transition to populate roles</span>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {allTransitions.map((transition) => {
              const isSelected = currentRoleId === transition.from && targetRoleId === transition.to;
              const isCustom = String(transition.id).startsWith("custom_");
              return (
                <div
                  key={transition.id}
                  onClick={() => handleSelectPresetTransition(transition)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-medium border flex items-center gap-2 transition-all cursor-pointer ${
                    isSelected
                      ? "bg-linear-to-r from-cyan-500/20 to-blue-500/20 border-cyan-500 text-cyan-300 shadow-lg shadow-cyan-500/10 scale-102"
                      : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white hover:border-white/20"
                  }`}
                >
                  <span>{transition.title}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      transition.badge === "Most Popular"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        : transition.badge === "AI Boom"
                        ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                        : transition.badge === "My Preset"
                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                        : "bg-slate-800 text-slate-300"
                    }`}
                  >
                    {transition.badge}
                  </span>
                  {isCustom && (
                    <button
                      type="button"
                      onClick={(e) => handleDeleteCustomTransition(transition.id, e)}
                      className="ml-1 text-slate-500 hover:text-rose-400 font-bold text-xs"
                      title="Delete Preset"
                    >
                      ×
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Form to Save Current Role -> Target Role as a Custom Preset */}
          <form onSubmit={handleSaveCustomTransition} className="mt-5 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center gap-3">
            <div className="text-xs text-slate-400 font-semibold shrink-0">
              Save currently selected path as a preset:
            </div>
            <div className="flex gap-2 w-full">
              <input
                type="text"
                value={newTransitionTitle}
                onChange={(e) => setNewTransitionTitle(e.target.value)}
                placeholder="Preset Name (e.g. My Cloud Transition)"
                className="bg-black/60 border border-white/10 rounded-lg text-xs text-white px-3 py-2 w-full focus:outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs px-4 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                + Save Preset
              </button>
            </div>
          </form>
        </div>

        {/* Searchable Dropdowns & Selector Bar */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          {/* Current Role Dropdown */}
          <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-xl relative">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-bold text-slate-300 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-cyan-400" />
                Current Role / Baseline
              </label>
              <span className="text-xs text-cyan-400 font-medium px-2 py-0.5 bg-cyan-500/10 rounded-full border border-cyan-500/20">
                Step 1: Your Starting Point
              </span>
            </div>

            <div className="relative mt-2">
              <button
                type="button"
                onClick={() => {
                  setIsCurrentOpen(!isCurrentOpen);
                  setIsTargetOpen(false);
                }}
                className="w-full px-4 py-3.5 bg-black/40 border border-white/15 rounded-xl text-left flex items-center justify-between hover:border-cyan-500/50 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              >
                <div>
                  <div className="text-white font-bold text-base">{gapAnalysis.currentRole.title}</div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {gapAnalysis.currentRole.category} • Avg: {formatSalary(gapAnalysis.currentRole.avgSalary)}
                  </div>
                </div>
                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isCurrentOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Dropdown Menu */}
              {isCurrentOpen && (
                <div className="absolute z-50 left-0 right-0 mt-2 bg-slate-900 border border-white/20 rounded-xl shadow-2xl max-h-80 overflow-y-auto backdrop-blur-xl p-2">
                  <div className="sticky top-0 bg-slate-900 pb-2 z-10">
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        placeholder="Search current roles (e.g., Frontend, Python, QA...)"
                        value={currentSearch}
                        onChange={(e) => setCurrentSearch(e.target.value)}
                        className="w-full bg-black/60 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>

                  <div className="space-y-1 mt-1">
                    {filteredCurrentRoles.map((role) => (
                      <div
                        key={role.id}
                        onClick={() => {
                          setCurrentRoleId(role.id);
                          setIsCurrentOpen(false);
                        }}
                        className={`p-3 rounded-lg cursor-pointer transition-all flex items-center justify-between ${
                          currentRoleId === role.id ? "bg-cyan-500/20 border border-cyan-500/40 text-white font-semibold" : "hover:bg-white/5 text-slate-300"
                        }`}
                      >
                        <div>
                          <div className="text-sm font-medium">{role.title}</div>
                          <div className="text-xs text-slate-500">
                            {role.category} • Avg: {formatSalary(role.avgSalary)} • {role.skills?.length || 0} base skills
                          </div>
                        </div>
                        {currentRoleId === role.id && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                      </div>
                    ))}
                    {filteredCurrentRoles.length === 0 && (
                      <div className="text-center py-6 text-sm text-slate-500">No roles found matching &quot;{currentSearch}&quot;</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Baseline Skills Badge Preview */}
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="text-xs font-semibold text-slate-400 mb-2 flex items-center justify-between">
                <span>Baseline Skills ({gapAnalysis.currentRole.skills?.length || 0}):</span>
                <span className="text-cyan-400 text-[11px]">Included automatically in comparison</span>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                {(gapAnalysis.currentRole.skills || []).map((sid) => {
                  const sk = SKILLS_POOL[sid];
                  return (
                    <span
                      key={sid}
                      className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-md text-xs text-slate-300 flex items-center gap-1"
                    >
                      <span>{sk ? sk.name : sid}</span>
                    </span>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Target Role Dropdown */}
          <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-xl relative">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-bold text-slate-300 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                Target Role / Career Goal
              </label>
              <span className="text-xs text-amber-400 font-medium px-2 py-0.5 bg-amber-500/10 rounded-full border border-amber-500/20">
                Step 2: Where You Want to Go
              </span>
            </div>

            <div className="relative mt-2">
              <button
                type="button"
                onClick={() => {
                  setIsTargetOpen(!isTargetOpen);
                  setIsCurrentOpen(false);
                }}
                className="w-full px-4 py-3.5 bg-black/40 border border-white/15 rounded-xl text-left flex items-center justify-between hover:border-amber-500/50 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              >
                <div>
                  <div className="text-white font-bold text-base">{gapAnalysis.targetRole.title}</div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {gapAnalysis.targetRole.category} • Avg: {formatSalary(gapAnalysis.targetRole.avgSalary)} ({gapAnalysis.targetRole.demandLevel} Demand)
                  </div>
                </div>
                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isTargetOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Dropdown Menu */}
              {isTargetOpen && (
                <div className="absolute z-50 left-0 right-0 mt-2 bg-slate-900 border border-white/20 rounded-xl shadow-2xl max-h-80 overflow-y-auto backdrop-blur-xl p-2">
                  <div className="sticky top-0 bg-slate-900 pb-2 z-10">
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        placeholder="Search target roles (e.g., Full Stack, Cloud, AI Engineer...)"
                        value={targetSearch}
                        onChange={(e) => setTargetSearch(e.target.value)}
                        className="w-full bg-black/60 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>

                  <div className="space-y-1 mt-1">
                    {filteredTargetRoles.map((role) => (
                      <div
                        key={role.id}
                        onClick={() => {
                          setTargetRoleId(role.id);
                          setIsTargetOpen(false);
                        }}
                        className={`p-3 rounded-lg cursor-pointer transition-all flex items-center justify-between ${
                          targetRoleId === role.id ? "bg-amber-500/20 border border-amber-500/40 text-white font-semibold" : "hover:bg-white/5 text-slate-300"
                        }`}
                      >
                        <div>
                          <div className="text-sm font-medium">{role.title}</div>
                          <div className="text-xs text-slate-500">
                            {role.category} • Avg: {formatSalary(role.avgSalary)} ({role.demandLevel})
                          </div>
                        </div>
                        {targetRoleId === role.id && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                      </div>
                    ))}
                    {filteredTargetRoles.length === 0 && (
                      <div className="text-center py-6 text-sm text-slate-500">No target roles found matching &quot;{targetSearch}&quot;</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Target Role Description & Required Skills Preview */}
            <div className="mt-4 pt-4 border-t border-white/10 space-y-4">
              <p className="text-xs text-slate-400 leading-relaxed">{gapAnalysis.targetRole.description}</p>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Matched Column */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Matched ({gapAnalysis.matchingSkills.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
                    {gapAnalysis.matchingSkills.map((sk) => (
                      <span
                        key={sk.id}
                        className="px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-md text-[11px] font-medium"
                      >
                        {sk.name}
                      </span>
                    ))}
                    {gapAnalysis.matchingSkills.length === 0 && (
                      <span className="text-[11px] text-slate-600 italic">None matched yet</span>
                    )}
                  </div>
                </div>

                {/* Missing Column */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-rose-400" />
                    <span>Missing ({gapAnalysis.missingSkills.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
                    {gapAnalysis.missingSkills.map((sk) => (
                      <span
                        key={sk.id}
                        className="px-2.5 py-0.5 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-md text-[11px] font-medium"
                      >
                        {sk.name}
                      </span>
                    ))}
                    {gapAnalysis.missingSkills.length === 0 && (
                      <span className="text-[11px] text-emerald-400 italic">100% Matched!</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Match Percentage & Study Pace Hero Section */}
        <div className="mb-10 bg-linear-to-r from-slate-900 via-slate-900/90 to-slate-900 border border-white/10 rounded-3xl p-8 backdrop-blur-md shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-1/2 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            {/* Radial Match Score Metric */}
            <div className="lg:col-span-4 flex flex-col items-center justify-center text-center border-b lg:border-b-0 lg:border-r border-white/10 pb-6 lg:pb-0 lg:pr-8">
              <div className="relative w-40 h-40 flex items-center justify-center mb-4">
                {/* SVG Progress Ring */}
                <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    className="text-white/10"
                    strokeWidth="10"
                    stroke="currentColor"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    className="text-cyan-400 transition-all duration-1000 ease-out"
                    strokeWidth="10"
                    strokeDasharray={264}
                    strokeDashoffset={264 - (264 * gapAnalysis.matchPercentage) / 100}
                    strokeLinecap="round"
                    stroke="url(#gradient-match)"
                    fill="transparent"
                  />
                  <defs>
                    <linearGradient id="gradient-match" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#06b6d4" />
                      <stop offset="50%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-4xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-cyan-400 via-blue-400 to-green-400">
                    {gapAnalysis.matchPercentage}%
                  </span>
                  <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400 mt-1">
                    Skill Match
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-semibold">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 text-green-300 rounded-lg border border-green-500/20">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{gapAnalysis.matchingSkills.length} Matched</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 text-amber-300 rounded-lg border border-amber-500/20">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{gapAnalysis.missingSkills.length} Missing</span>
                </div>
              </div>
            </div>

            {/* Estimated Learning Time & Study Pace Sliders */}
            <div className="lg:col-span-8 flex flex-col justify-between">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2.5">
                    <TrendingUp className="w-6 h-6 text-cyan-400" />
                    Roadmap & Time Forecast
                  </h2>
                  <p className="text-slate-400 text-sm mt-1">
                    Customized study schedule based on <span className="text-white font-semibold">{gapAnalysis.totalMissingHours} total hours</span> of required skill acquisition.
                  </p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-xl self-start">
                  <Clock className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-bold text-purple-300">
                    ~{totalWeeksEstimated} Weeks ({totalMonthsEstimated} Months)
                  </span>
                </div>
              </div>

              {/* Study Pace Slider Component */}
              <div className="bg-black/30 border border-white/10 rounded-2xl p-5 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
                    Your Study Pace: <span className="text-cyan-400 font-bold">{studyHoursPerWeek} hours / week</span>
                  </span>
                  <span className="text-xs text-slate-400">
                    {studyHoursPerWeek <= 10 && "Casual Pace (Evenings/Weekends)"}
                    {studyHoursPerWeek > 10 && studyHoursPerWeek <= 20 && "Dedicated Study (Standard Pace)"}
                    {studyHoursPerWeek > 20 && studyHoursPerWeek <= 30 && "Intensive Study (Fast-Track)"}
                    {studyHoursPerWeek > 30 && "Full-Time Bootcamp Pace"}
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
                  <span>5 hrs/wk</span>
                  <span>15 hrs/wk</span>
                  <span>25 hrs/wk</span>
                  <span>40 hrs/wk</span>
                </div>
              </div>

              {/* Progress Bar of Milestones */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-slate-400">
                  <span>Overall Roadmap Progress (Completed + Matched)</span>
                  <span className="text-cyan-400">
                    {Math.round(
                      ((gapAnalysis.matchingSkills.length +
                        gapAnalysis.missingSkills.filter((ms) => completedSkillIds.includes(ms.id)).length) /
                        Math.max(1, gapAnalysis.targetRole.skills?.length || 1)) *
                        100
                    )}%
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden flex">
                  <div
                    className="bg-green-500 h-full transition-all duration-500"
                    style={{ width: `${gapAnalysis.matchPercentage}%` }}
                    title={`Base Match: ${gapAnalysis.matchPercentage}%`}
                  />
                  <div
                    className="bg-cyan-400 h-full transition-all duration-500"
                    style={{
                      width: `${
                        Math.round(
                          (gapAnalysis.missingSkills.filter((ms) => completedSkillIds.includes(ms.id)).length /
                            Math.max(1, gapAnalysis.targetRole.skills?.length || 1)) *
                            100
                        )
                      }%`,
                    }}
                    title="Locally Completed Skills"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-white/10 mb-8 overflow-x-auto gap-2">
          <button
            onClick={() => setActiveTab("roadmap")}
            className={`px-5 py-3.5 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "roadmap"
                ? "border-cyan-400 text-cyan-400 bg-cyan-500/10"
                : "border-transparent text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Personalized Roadmap ({gapAnalysis.roadmapPhases.length} Phases)</span>
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
            <span>Category Competency Comparison</span>
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
            <span>Suggested Projects & Certifications ({gapAnalysis.missingSkills.length})</span>
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
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>AI Transition Coach Advice</span>
          </button>
        </div>

        {/* TAB 1: PERSONALIZED ROADMAP PHASES */}
        {activeTab === "roadmap" && (
          <div className="space-y-8 animate-fadeIn">
            {gapAnalysis.roadmapPhases.length === 0 ? (
              <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-10 text-center">
                <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Incredible! You have 100% Skill Match!</h3>
                <p className="text-slate-300 max-w-xl mx-auto">
                  Your current skill set already covers all required technical requirements for <span className="text-white font-bold">{gapAnalysis.targetRole.title}</span>. You are fully ready to apply or step into leadership!
                </p>
              </div>
            ) : (
              gapAnalysis.roadmapPhases.map((phase) => {
                const phaseWeeks = Math.max(1, Math.ceil(phase.hours / studyHoursPerWeek));
                const completedInPhase = phase.skills.filter((sk) => completedSkillIds.includes(sk.id)).length;
                const isPhaseComplete = completedInPhase === phase.skills.length;

                return (
                  <div
                    key={phase.phaseNumber}
                    className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-md shadow-xl transition-all"
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
                              ~{phase.hours} Hours • {phaseWeeks} Weeks
                            </span>
                          </div>
                          <p className="text-slate-400 text-sm mt-1">{phase.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-start md:self-center">
                        <span className="text-xs font-bold text-slate-400">
                          Progress: {completedInPhase}/{phase.skills.length} Completed
                        </span>
                        <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="bg-cyan-400 h-full transition-all duration-300"
                            style={{ width: `${(completedInPhase / phase.skills.length) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Phase Skills Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {phase.skills.map((skill) => {
                        const isDone = completedSkillIds.includes(skill.id);
                        const categoryMeta = SKILL_CATEGORIES[skill.category] || { name: skill.category, color: "blue" };

                        return (
                          <div
                            key={skill.id}
                            className={`p-5 rounded-2xl border transition-all ${
                              isDone
                                ? "bg-green-500/10 border-green-500/30 opacity-90"
                                : "bg-black/30 border-white/10 hover:border-cyan-500/40 hover:bg-black/40"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3 mb-3">
                              <div className="flex items-start gap-3">
                                <button
                                  type="button"
                                  onClick={() => handleToggleSkillCompleted(skill.id)}
                                  className="mt-0.5 text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
                                >
                                  {isDone ? (
                                    <CheckSquare className="w-5 h-5 text-green-400" />
                                  ) : (
                                    <Square className="w-5 h-5" />
                                  )}
                                </button>
                                <div>
                                  <h4 className={`text-base font-bold ${isDone ? "line-through text-slate-300" : "text-white"}`}>
                                    {skill.name}
                                  </h4>
                                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                                    <span className="px-2 py-0.5 bg-white/10 text-slate-300 rounded text-[11px] font-medium">
                                      {categoryMeta.name}
                                    </span>
                                    <span
                                      className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                        skill.importance === "Critical"
                                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                          : skill.importance === "High"
                                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                          : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                                      }`}
                                    >
                                      {skill.importance}
                                    </span>
                                    <span className="text-xs text-slate-500 font-medium">
                                      ~{skill.estimatedHours} hrs ({skill.difficulty})
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Prerequisites */}
                            {skill.prerequisites && skill.prerequisites.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-white/10 text-xs text-slate-400 flex items-center gap-2">
                                <span className="text-slate-500 font-semibold">Prerequisites:</span>
                                {skill.prerequisites.map((pid) => {
                                  const pName = SKILLS_POOL[pid]?.name || pid;
                                  const isPReqDone = completedSkillIds.includes(pid) || gapAnalysis.matchingSkills.some((ms) => ms.id === pid);
                                  return (
                                    <span
                                      key={pid}
                                      className={`px-2 py-0.5 rounded text-[11px] flex items-center gap-1 ${
                                        isPReqDone ? "bg-green-500/10 text-green-400" : "bg-slate-800 text-amber-400"
                                      }`}
                                    >
                                      {isPReqDone && <CheckCircle2 className="w-3 h-3" />}
                                      <span>{pName}</span>
                                    </span>
                                  );
                                })}
                              </div>
                            )}

                            {/* Learning Resources */}
                            {skill.learningResources && skill.learningResources.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-white/10">
                                <div className="text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1.5">
                                  <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                                  <span>Recommended Learning Guides:</span>
                                </div>
                                <ul className="space-y-1 pl-5 list-disc text-xs text-slate-300">
                                  {skill.learningResources.map((res, i) => (
                                    <li key={i}>{res}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Suggested Project Banner inside card */}
                            {skill.suggestedProject && (
                              <div className="mt-3 p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-xs text-cyan-200">
                                <div className="font-bold flex items-center gap-1.5 mb-1">
                                  <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                                  <span>Hands-on Practice Project:</span>
                                </div>
                                <p className="text-slate-300">{skill.suggestedProject}</p>
                              </div>
                            )}
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

        {/* TAB 2: CATEGORY COMPETENCY COMPARISON */}
        {activeTab === "comparison" && (
          <div className="space-y-8 animate-fadeIn">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md shadow-xl">
              <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-cyan-400" />
                Category Competency Comparison Bar Chart
              </h3>
              <p className="text-slate-400 text-sm mb-8">
                Visualizing how your current skills match up against the required distribution across technical domains.
              </p>

              <div className="space-y-6">
                {gapAnalysis.categoryStats.map((stat, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between items-center text-sm font-semibold">
                      <span className="text-white flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            stat.color === "cyan"
                              ? "bg-cyan-400"
                              : stat.color === "blue"
                              ? "bg-blue-400"
                              : stat.color === "green"
                              ? "bg-green-400"
                              : stat.color === "purple"
                              ? "bg-purple-400"
                              : stat.color === "amber"
                              ? "bg-amber-400"
                              : "bg-rose-400"
                          }`}
                        />
                        {stat.name}
                      </span>
                      <span className="text-slate-400 text-xs">
                        {stat.matchingCount} / {stat.targetCount} Skills ({stat.percentage}%)
                      </span>
                    </div>

                    <div className="w-full h-4 bg-black/50 border border-white/10 rounded-full overflow-hidden p-0.5 flex">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${
                          stat.percentage === 100
                            ? "bg-linear-to-r from-green-500 to-emerald-400"
                            : stat.percentage >= 50
                            ? "bg-linear-to-r from-cyan-500 to-blue-500"
                            : "bg-linear-to-r from-amber-500 to-rose-500"
                        }`}
                        style={{ width: `${stat.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Skill Badges Overview */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md shadow-xl">
              <h3 className="text-xl font-bold text-white mb-4">Complete Skill Badges & Status</h3>

              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-bold text-green-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Matched & Mastered Skills ({gapAnalysis.matchingSkills.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {gapAnalysis.matchingSkills.map((sk) => (
                      <span
                        key={sk.id}
                        className="px-3.5 py-1.5 bg-green-500/10 border border-green-500/30 text-green-300 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                        <span>{sk.name}</span>
                      </span>
                    ))}
                    {gapAnalysis.matchingSkills.length === 0 && (
                      <span className="text-xs text-slate-500 italic">No exact matching skills found in baseline yet.</span>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <h4 className="text-sm font-bold text-rose-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-rose-400" />
                    Missing Skills to Acquire ({gapAnalysis.missingSkills.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {gapAnalysis.missingSkills.map((sk) => {
                      const isDone = completedSkillIds.includes(sk.id);
                      return (
                        <span
                          key={sk.id}
                          onClick={() => handleToggleSkillCompleted(sk.id)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 border cursor-pointer transition-all ${
                            isDone
                              ? "bg-green-500/20 border-green-500/40 text-green-300 line-through"
                              : "bg-rose-500/10 border-rose-500/30 text-rose-300 hover:bg-rose-500/20"
                          }`}
                        >
                          {isDone ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> : <Square className="w-3.5 h-3.5 text-rose-400" />}
                          <span>{sk.name}</span>
                          <span className="text-[10px] opacity-75">({sk.importance})</span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SUGGESTED PROJECTS & CERTIFICATIONS */}
        {activeTab === "projects" && (
          <div className="space-y-8 animate-fadeIn">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md shadow-xl">
              <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                <Code2 className="w-6 h-6 text-cyan-400" />
                Portfolio-Ready Capstone Projects & Certifications
              </h3>
              <p className="text-slate-400 text-sm mb-6">
                Hands-on project work is the #1 way to prove practical competency during technical interviews and bridge resume gaps.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {gapAnalysis.missingSkills.map((sk) => (
                  <div key={sk.id} className="bg-black/40 border border-white/10 rounded-2xl p-6 hover:border-cyan-500/40 transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-lg text-xs font-bold">
                          Target: {sk.name}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">~{sk.estimatedHours} hrs</span>
                      </div>

                      {sk.suggestedProject ? (
                        <div className="mb-4">
                          <h4 className="text-sm font-bold text-white mb-1.5 flex items-center gap-2">
                            <Code2 className="w-4 h-4 text-cyan-400" />
                            Suggested Project Idea:
                          </h4>
                          <p className="text-slate-300 text-xs leading-relaxed bg-white/5 p-3.5 rounded-xl border border-white/5">
                            {sk.suggestedProject}
                          </p>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 italic mb-4">Focus on core theoretical and syntax exercises.</p>
                      )}

                      {sk.certification && (
                        <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-3">
                          <Award className="w-6 h-6 text-amber-400 shrink-0" />
                          <div>
                            <div className="text-[11px] font-bold text-amber-300 uppercase">Recommended Industry Cert:</div>
                            <div className="text-xs font-semibold text-white">{sk.certification}</div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between">
                      <button
                        onClick={() => handleToggleSkillCompleted(sk.id)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                          completedSkillIds.includes(sk.id)
                            ? "bg-green-600 text-white"
                            : "bg-white/10 hover:bg-white/20 text-slate-200"
                        }`}
                      >
                        {completedSkillIds.includes(sk.id) ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" /> Marked Mastered
                          </>
                        ) : (
                          <>
                            <CheckSquare className="w-4 h-4" /> Mark Completed
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(sk.suggestedProject || sk.name);
                          toast.success("Copied project prompt to clipboard!");
                        }}
                        className="px-3 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Copy Prompt
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: AI TRANSITION COACH ADVICE */}
        {activeTab === "ai-advice" && (
          <div className="space-y-8 animate-fadeIn">
            <div className="bg-linear-to-br from-purple-900/40 via-slate-900 to-slate-900 border border-purple-500/30 rounded-3xl p-8 backdrop-blur-md shadow-2xl relative">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-500/20 border border-purple-500/40 rounded-2xl flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Personalized AI Career Coach Transition Advice</h3>
                    <p className="text-slate-400 text-xs mt-0.5">
                      Tailored strategy for transitioning from <span className="text-purple-300 font-semibold">{gapAnalysis.currentRole.title}</span> to <span className="text-cyan-300 font-semibold">{gapAnalysis.targetRole.title}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {aiSource && (
                    <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs font-semibold border border-purple-500/30">
                      Powered by {aiSource}
                    </span>
                  )}
                  <button
                    onClick={handleGenerateAiAdvice}
                    disabled={isGeneratingAi}
                    className="px-4 py-2.5 bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-lg disabled:opacity-50"
                  >
                    {isGeneratingAi ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" /> Analyzing Transition...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" /> {aiAdvice ? "Regenerate Advice" : "Generate Advice Now"}
                      </>
                    )}
                  </button>
                </div>
              </div>

              {isGeneratingAi ? (
                <div className="py-20 flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mb-4" />
                  <h4 className="text-lg font-bold text-white mb-1">Evaluating Core Competency Gaps...</h4>
                  <p className="text-slate-400 text-sm max-w-md">
                    Our AI Coach is synthesizing resume reframing tactics and 30-60-90 day execution strategies for {gapAnalysis.targetRole.title}.
                  </p>
                </div>
              ) : aiAdvice ? (
                <div className="prose prose-invert prose-cyan max-w-none text-slate-200 text-sm leading-relaxed space-y-4 bg-black/40 p-6 md:p-8 rounded-2xl border border-white/10">
                  <ReactMarkdown
                    components={{
                      h1: ({ node, ...props }) => <h1 className="text-2xl font-bold text-white border-b border-white/10 pb-3 mb-4 mt-6" {...props} />,
                      h2: ({ node, ...props }) => <h2 className="text-xl font-bold text-cyan-400 mb-3 mt-6" {...props} />,
                      h3: ({ node, ...props }) => <h3 className="text-lg font-bold text-purple-300 mb-2 mt-5" {...props} />,
                      ul: ({ node, ...props }) => <ul className="list-disc pl-6 space-y-2 my-4 text-slate-300" {...props} />,
                      li: ({ node, ...props }) => <li className="leading-relaxed" {...props} />,
                      strong: ({ node, ...props }) => <strong className="font-bold text-white" {...props} />,
                      blockquote: ({ node, ...props }) => (
                        <blockquote className="border-l-4 border-cyan-500 bg-cyan-500/10 px-4 py-3 rounded-r-xl text-cyan-200 my-4 italic" {...props} />
                      ),
                    }}
                  >
                    {aiAdvice}
                  </ReactMarkdown>

                  <div className="mt-8 pt-6 border-t border-white/10 flex justify-end">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(aiAdvice);
                        toast.success("Copied AI Advice to clipboard!");
                      }}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
                    >
                      Copy Full Advice
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-16 text-center">
                  <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-3 opacity-60" />
                  <h4 className="text-lg font-bold text-white mb-2">Get Tailored Transition Coaching</h4>
                  <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
                    Click the button above to receive expert mentorship detailing mental shifts, resume reframing, and interview gotchas specifically for your career change.
                  </p>
                  <button
                    onClick={handleGenerateAiAdvice}
                    className="px-6 py-3 bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-sm font-bold shadow-lg transition-all cursor-pointer"
                  >
                    ✨ Generate AI Transition Advice
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
