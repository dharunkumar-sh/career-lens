"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ProfileDropdown from "@/components/ui/profile-dropdown";
import {
  saveJob,
  removeSavedJob,
  getSavedJobs,
  trackJobApplication,
} from "@/utils/firebaseConfig";
import {
  TrendingUp,
  ArrowLeft,
  MapPin,
  Building2,
  Clock,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  Search,
  Loader2,
  Briefcase,
  Sparkles,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";

export default function JobMatchingPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  // State
  const [jobs, setJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");
  const [filter, setFilter] = useState("all");
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [userSkills, setUserSkills] = useState([]);
  const [expandedJob, setExpandedJob] = useState(null);
  const [isDemo, setIsDemo] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Autocomplete state
  const [jobSuggestions, setJobSuggestions] = useState([]);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showJobSuggestions, setShowJobSuggestions] = useState(false);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);

  // Load saved jobs and user skills from localStorage and Firestore
  useEffect(() => {
    const loadSavedJobs = async () => {
      // Try to load from Firestore first
      if (user?.uid) {
        try {
          const firestoreJobs = await getSavedJobs(user.uid);
          if (firestoreJobs.length > 0) {
            setSavedJobs(firestoreJobs);
            localStorage.setItem("savedJobs", JSON.stringify(firestoreJobs));
            return;
          }
        } catch (error) {
          console.error("Error loading from Firestore:", error);
        }
      }

      // Fallback to localStorage
      const saved = localStorage.getItem("savedJobs");
      if (saved) {
        setSavedJobs(JSON.parse(saved));
      }
    };

    loadSavedJobs();

    // Load user skills from last resume analysis
    const analysisResult = localStorage.getItem("lastResumeAnalysis");
    if (analysisResult) {
      try {
        const analysis = JSON.parse(analysisResult);
        if (analysis.skills?.present) {
          setUserSkills(analysis.skills.present);
        }
      } catch (e) {
        console.error("Error loading skills:", e);
      }
    }
  }, [user?.uid]);

  // Save jobs to localStorage when updated
  useEffect(() => {
    localStorage.setItem("savedJobs", JSON.stringify(savedJobs));
  }, [savedJobs]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

  // Fetch job title suggestions
  useEffect(() => {
    const fetchJobSuggestions = async () => {
      if (searchQuery.length < 2) {
        setJobSuggestions([]);
        return;
      }

      try {
        const response = await fetch(
          `/api/jobs?autocomplete=job&query=${encodeURIComponent(searchQuery)}`
        );
        const data = await response.json();
        if (data.success) {
          setJobSuggestions(data.suggestions || []);
        }
      } catch (error) {
        console.error("Job suggestions error:", error);
      }
    };

    const debounceTimer = setTimeout(fetchJobSuggestions, 200);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  // Fetch location suggestions
  useEffect(() => {
    const fetchLocationSuggestions = async () => {
      if (location.length < 2) {
        setLocationSuggestions([]);
        return;
      }

      try {
        const response = await fetch(
          `/api/jobs?autocomplete=location&query=${encodeURIComponent(
            location
          )}`
        );
        const data = await response.json();
        if (data.success) {
          setLocationSuggestions(data.suggestions || []);
        }
      } catch (error) {
        console.error("Location suggestions error:", error);
      }
    };

    const debounceTimer = setTimeout(fetchLocationSuggestions, 200);
    return () => clearTimeout(debounceTimer);
  }, [location]);

  // Search jobs
  const handleSearch = async (e) => {
    e?.preventDefault();
    setShowJobSuggestions(false);
    setShowLocationSuggestions(false);

    if (!searchQuery.trim() && !location.trim()) {
      toast.error("Please enter a job title or location");
      return;
    }

    setIsSearching(true);
    setHasSearched(true);

    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("query", searchQuery);
      if (location) params.append("location", location);
      if (filter === "remote") params.append("remote", "true");
      if (filter === "fulltime") params.append("type", "FULLTIME");
      if (filter === "contract") params.append("type", "CONTRACTOR");

      const response = await fetch(`/api/jobs?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        // Add match scores based on user skills
        const jobsWithScores = data.jobs.map((job) => ({
          ...job,
          matchScore:
            job.matchScore || calculateLocalMatchScore(job.skills, userSkills),
        }));
        setJobs(jobsWithScores);
        setIsDemo(data.isDemo || false);
        if (data.isDemo) {
          toast("Showing demo jobs. Add RAPIDAPI_KEY for live listings.", {
            icon: "ℹ️",
          });
        }
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Failed to search jobs");
    } finally {
      setIsSearching(false);
    }
  };

  // Get job suggestions based on skills
  const getSuggestedJobs = async () => {
    if (userSkills.length === 0) {
      toast.error("Analyze your resume first to get personalized suggestions");
      router.push("/dashboard/resume-analysis");
      return;
    }

    setIsLoadingSuggestions(true);
    setHasSearched(true);

    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skills: userSkills }),
      });

      const data = await response.json();

      if (data.success) {
        setJobs(data.jobs);
        setIsDemo(data.isDemo || false);
        toast.success(`Found ${data.jobs.length} jobs matching your skills!`);
      }
    } catch (error) {
      console.error("Suggestion error:", error);
      toast.error("Failed to get job suggestions");
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  // Calculate match score locally
  const calculateLocalMatchScore = (jobSkills = [], userSkillsList = []) => {
    if (!jobSkills.length || !userSkillsList.length) return 50;

    const jobSkillsLower = jobSkills.map((s) => s.toLowerCase());
    const userSkillsLower = userSkillsList.map((s) => s.toLowerCase());

    let matches = 0;
    for (const skill of userSkillsLower) {
      if (
        jobSkillsLower.some((js) => js.includes(skill) || skill.includes(js))
      ) {
        matches++;
      }
    }

    const matchRatio =
      matches / Math.max(jobSkills.length, userSkillsList.length);
    return Math.min(99, Math.max(40, Math.round(50 + matchRatio * 50)));
  };

  const toggleSaveJob = async (job) => {
    const isAlreadySaved = savedJobs.some(
      (j) => j.id === job.id || j.jobId === job.id
    );

    if (isAlreadySaved) {
      // Remove job
      setSavedJobs((prev) =>
        prev.filter((j) => j.id !== job.id && j.jobId !== job.id)
      );
      toast.success("Job removed from saved");

      // Remove from Firestore
      if (user?.uid) {
        try {
          await removeSavedJob(user.uid, job.id);
        } catch (error) {
          console.error("Error removing from Firestore:", error);
        }
      }
    } else {
      // Save job
      setSavedJobs((prev) => [...prev, job]);
      toast.success("Job saved!");

      // Save to Firestore
      if (user?.uid) {
        try {
          await saveJob(user.uid, job);
        } catch (error) {
          console.error("Error saving to Firestore:", error);
        }
      }
    }

    // Update localStorage
    localStorage.setItem("savedJobs", JSON.stringify(savedJobs));
  };

  const handleApply = async (job) => {
    // Track application in Firestore
    if (user?.uid) {
      try {
        await trackJobApplication(user.uid, job);
        toast.success("Application tracked!");
      } catch (error) {
        console.error("Error tracking application:", error);
      }
    }

    // Open apply link
    if (job.applyLink) {
      window.open(job.applyLink, "_blank");
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "bg-green-500/20 text-green-400";
    if (score >= 60) return "bg-cyan-500/20 text-cyan-400";
    if (score >= 40) return "bg-amber-500/20 text-amber-400";
    return "bg-red-500/20 text-red-400";
  };

  // When filter is "saved", show all saved jobs; otherwise filter from search results
  const filteredJobs =
    filter === "saved"
      ? savedJobs.map((job) => ({
          ...job,
          id: job.jobId || job.id, // Ensure consistent id field
        }))
      : jobs.filter((job) => {
          if (filter === "all") return true;
          if (filter === "remote") return job.isRemote;
          if (filter === "fulltime") return job.type === "Full-time";
          if (filter === "contract") return job.type === "Contract";
          return true;
        });

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

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-800/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/logo.svg" alt="Career Lens" width={160} height={160} />
          </div>
          <ProfileDropdown />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
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
            <div className="w-12 h-12 bg-cyan-500/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-cyan-400" />
            </div>
            <h1 className="text-3xl font-bold text-white">Job Matching</h1>
          </div>
          <p className="text-slate-400">
            Search for jobs or get AI-powered suggestions based on your resume
          </p>
        </div>

        {/* Search Section */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Job Title Input with Autocomplete */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 z-10" />
                <input
                  type="text"
                  placeholder="Job title, keywords, or company"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowJobSuggestions(true)}
                  onBlur={() =>
                    setTimeout(() => setShowJobSuggestions(false), 200)
                  }
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                />
                {/* Job Suggestions Dropdown */}
                {showJobSuggestions && jobSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden">
                    {jobSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => {
                          setSearchQuery(suggestion);
                          setShowJobSuggestions(false);
                        }}
                        className="w-full px-4 py-2.5 text-left text-slate-300 hover:bg-slate-700 hover:text-white transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <Briefcase className="w-4 h-4 text-slate-500" />
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Location Input with Autocomplete */}
              <div className="flex-1 relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 z-10" />
                <input
                  type="text"
                  placeholder="Location (city, state, or 'remote')"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  onFocus={() => setShowLocationSuggestions(true)}
                  onBlur={() =>
                    setTimeout(() => setShowLocationSuggestions(false), 200)
                  }
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                />
                {/* Location Suggestions Dropdown */}
                {showLocationSuggestions && locationSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden">
                    {locationSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => {
                          setLocation(suggestion);
                          setShowLocationSuggestions(false);
                        }}
                        className="w-full px-4 py-2.5 text-left text-slate-300 hover:bg-slate-700 hover:text-white transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <MapPin className="w-4 h-4 text-slate-500" />
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isSearching}
                className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors flex items-center gap-2 cursor-pointer"
              >
                {isSearching ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Search className="w-5 h-5" />
                )}
                Search
              </button>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={getSuggestedJobs}
                disabled={isLoadingSuggestions}
                className="px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded-lg font-medium transition-colors flex items-center gap-2 border border-purple-500/30 cursor-pointer"
              >
                {isLoadingSuggestions ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                {userSkills.length > 0
                  ? "Get Jobs Matching My Skills"
                  : "Analyze Resume for Suggestions"}
              </button>

              {userSkills.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <span>Your skills:</span>
                  <div className="flex flex-wrap gap-1">
                    {userSkills.slice(0, 5).map((skill, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-slate-700/50 rounded text-slate-300 text-xs"
                      >
                        {skill}
                      </span>
                    ))}
                    {userSkills.length > 5 && (
                      <span className="text-slate-500">
                        +{userSkills.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          {["all", "remote", "fulltime", "contract", "saved"].map(
            (filterType) => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize cursor-pointer ${
                  filter === filterType
                    ? "bg-cyan-600 text-white"
                    : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                }`}
              >
                {filterType === "all"
                  ? "All Jobs"
                  : filterType === "fulltime"
                  ? "Full-time"
                  : filterType === "saved"
                  ? `Saved (${savedJobs.length})`
                  : filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              </button>
            )
          )}
        </div>

        {/* Demo Mode Notice */}
        {isDemo && hasSearched && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-400 font-medium">Demo Mode</p>
              <p className="text-amber-400/70 text-sm">
                Showing sample jobs. To get real job listings, add your
                RAPIDAPI_KEY to the environment variables. Get a free API key
                from{" "}
                <a
                  href="https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-amber-300"
                >
                  RapidAPI JSearch
                </a>
              </p>
            </div>
          </div>
        )}

        {/* Results Count */}
        {(hasSearched || filter === "saved") && (
          <p className="text-slate-400 mb-4">
            {filteredJobs.length} {filter === "saved" ? "saved " : ""}job
            {filteredJobs.length !== 1 ? "s" : ""}{" "}
            {filter === "saved" ? "" : "found"}
            {filter !== "all" && filter !== "saved" && ` (filtered: ${filter})`}
          </p>
        )}

        {/* Job Listings */}
        {!hasSearched && filter !== "saved" ? (
          <div className="text-center py-16">
            <Briefcase className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">
              Start Your Job Search
            </h2>
            <p className="text-slate-400 mb-6 max-w-md mx-auto">
              Search for jobs by title or location, or get personalized
              recommendations based on your resume skills.
            </p>
            <button
              onClick={getSuggestedJobs}
              disabled={isLoadingSuggestions}
              className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition-colors inline-flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-5 h-5" />
              Get Personalized Job Suggestions
            </button>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400">
              {filter === "saved"
                ? "You haven't saved any jobs yet. Search for jobs and click the bookmark icon to save them."
                : "No jobs found matching your criteria."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6 hover:border-cyan-500/30 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-white">
                        {job.title}
                      </h3>
                      {job.matchScore && (
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(
                            job.matchScore
                          )}`}
                        >
                          {job.matchScore}% Match
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-slate-400 text-sm mb-4">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-4 h-4" />
                        {job.company}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {job.isRemote ? "Remote" : job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {job.posted}
                      </span>
                      {job.salary && job.salary !== "Salary not disclosed" && (
                        <span className="text-green-400 font-medium">
                          {job.salary}
                        </span>
                      )}
                    </div>

                    {/* Skills */}
                    {job.skills && job.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {job.skills.map((skill, index) => {
                          const isMatch = userSkills.some(
                            (us) =>
                              us.toLowerCase().includes(skill.toLowerCase()) ||
                              skill.toLowerCase().includes(us.toLowerCase())
                          );
                          return (
                            <span
                              key={index}
                              className={`px-3 py-1 rounded-full text-sm ${
                                isMatch
                                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                  : "bg-slate-700/50 text-slate-300"
                              }`}
                            >
                              {skill}
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {/* Expanded Details */}
                    {expandedJob === job.id && (
                      <div className="mt-4 pt-4 border-t border-slate-700/50 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                        {job.highlights && job.highlights.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-slate-300 mb-2">
                              Requirements
                            </h4>
                            <ul className="list-disc list-inside text-slate-400 text-sm space-y-1">
                              {job.highlights.slice(0, 5).map((h, i) => (
                                <li key={i}>{h}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {job.responsibilities &&
                          job.responsibilities.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium text-slate-300 mb-2">
                                Responsibilities
                              </h4>
                              <ul className="list-disc list-inside text-slate-400 text-sm space-y-1">
                                {job.responsibilities
                                  .slice(0, 5)
                                  .map((r, i) => (
                                    <li key={i}>{r}</li>
                                  ))}
                              </ul>
                            </div>
                          )}
                        {job.publisher && (
                          <p className="text-slate-500 text-sm">
                            Posted on: {job.publisher}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-3 mt-4">
                      <a
                        href={job.applyLink || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => {
                          if (!job.applyLink || job.applyLink === "#") {
                            e.preventDefault();
                            toast(
                              "This is a demo job. Real jobs will have apply links.",
                              {
                                icon: "ℹ️",
                              }
                            );
                          } else {
                            // Track application
                            handleApply(job);
                          }
                        }}
                        className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        Apply Now
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() =>
                          setExpandedJob(expandedJob === job.id ? null : job.id)
                        }
                        className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        {expandedJob === job.id ? (
                          <>
                            Less Details
                            <ChevronUp className="w-4 h-4" />
                          </>
                        ) : (
                          <>
                            More Details
                            <ChevronDown className="w-4 h-4" />
                          </>
                        )}
                      </button>
                      <span className="px-3 py-1 bg-slate-700 text-slate-300 rounded-lg text-sm">
                        {job.type}
                      </span>
                    </div>
                  </div>

                  {/* Save Button */}
                  <button
                    onClick={() => toggleSaveJob(job)}
                    className={`p-2 rounded-lg transition-colors shrink-0 cursor-pointer ${
                      savedJobs.some(
                        (j) => j.id === job.id || j.jobId === job.id
                      )
                        ? "bg-cyan-500/20 text-cyan-400"
                        : "bg-slate-700/50 text-slate-400 hover:text-white"
                    }`}
                    title={
                      savedJobs.some(
                        (j) => j.id === job.id || j.jobId === job.id
                      )
                        ? "Remove from saved"
                        : "Save job"
                    }
                  >
                    {savedJobs.some(
                      (j) => j.id === job.id || j.jobId === job.id
                    ) ? (
                      <BookmarkCheck className="w-5 h-5" />
                    ) : (
                      <Bookmark className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
