"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import ProfileDropdown from "@/components/ui/profile-dropdown";
import ReactMarkdown from "react-markdown";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Sparkles,
  FileText,
  MessageSquare,
  Copy,
  Loader2,
  Briefcase,
  PenTool,
  Download,
  FileDown,
} from "lucide-react";

export default function AICareerCoachPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("cover-letter"); // 'cover-letter' | 'interview-prep'
  const [jobRole, setJobRole] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [generatedContent, setGeneratedContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Load last analyzed resume text if available
  useEffect(() => {
    const lastAnalysis = localStorage.getItem("lastResumeAnalysis");
    if (lastAnalysis) {
      try {
        const parsed = JSON.parse(lastAnalysis);
        if (parsed.extractedText) {
          setResumeText(parsed.extractedText);
        }
      } catch (e) {
        console.error("Failed to load saved resume context", e);
      }
    }
  }, []);

  // Redirect if not protected
  useEffect(() => {
    if (!loading && !isAuthenticated) router.push("/login");
  }, [loading, isAuthenticated, router]);

  const handleGenerate = async () => {
    if (!jobRole.trim()) {
      toast.error("Please enter a Job Role");
      return;
    }
    if (activeTab === "cover-letter" && !resumeText.trim()) {
      toast.error("Please provide Resume content for the Cover Letter");
      return;
    }

    setIsGenerating(true);
    setGeneratedContent("");

    try {
      const response = await fetch("/api/ai-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: activeTab,
          jobRole,
          resumeText,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Generation failed");

      setGeneratedContent(data.content);
      toast.success("Generated successfully!");
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (!generatedContent) return;
    navigator.clipboard.writeText(generatedContent);
    toast.success("Copied to clipboard");
  };

  const exportAsText = () => {
    if (!generatedContent) return;
    const blob = new Blob([generatedContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${
      activeTab === "cover-letter" ? "cover-letter" : "interview-prep"
    }-${jobRole.replace(/\s+/g, "-").toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Exported as TXT");
  };

  const exportAsPDF = () => {
    if (!generatedContent) return;
    // Create a simple HTML structure for PDF
    const printWindow = window.open("", "", "width=800,height=600");
    printWindow.document.write(`
      <html>
        <head>
          <title>${
            activeTab === "cover-letter" ? "Cover Letter" : "Interview Prep"
          } - ${jobRole}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; line-height: 1.6; }
            h1, h2, h3 { color: #333; }
            ul, ol { margin-left: 20px; }
          </style>
        </head>
        <body>
          <h1>${
            activeTab === "cover-letter"
              ? "Cover Letter"
              : "Interview Preparation Guide"
          }</h1>
          <h2>${jobRole}</h2>
          <hr>
          <pre style="white-space: pre-wrap; font-family: Arial, sans-serif;">${generatedContent}</pre>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
    toast.success("Opening print dialog for PDF export");
  };

  const exportAsMarkdown = () => {
    if (!generatedContent) return;
    const blob = new Blob([generatedContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${
      activeTab === "cover-letter" ? "cover-letter" : "interview-prep"
    }-${jobRole.replace(/\s+/g, "-").toLowerCase()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Exported as Markdown");
  };

  if (loading || !isAuthenticated) return null;

  return (
    <div
      className="min-h-screen bg-slate-950 bg-cover bg-center bg-fixed"
      style={{
        backgroundImage:
          "linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.5)), url('/dashboard-bg.jpg')",
      }}
    >
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/">
            <Image src="/logo.svg" alt="Logo" width={160} height={160} />
          </Link>
          <ProfileDropdown />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        {/* Hero */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-purple-400" />
            </div>
            <h1 className="text-3xl font-bold text-white">
              AI Career Assistant
            </h1>
          </div>
          <p className="text-slate-400">
            Intelligent tools to help you secure your next role. Powered by
            Gemini AI.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-white/10">
          <button
            onClick={() => {
              setActiveTab("cover-letter");
              setGeneratedContent("");
            }}
            className={`pb-4 px-2 text-sm font-medium transition-colors relative cursor-pointer ${
              activeTab === "cover-letter"
                ? "text-purple-400"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <span className="flex items-center gap-2">
              <PenTool className="w-4 h-4" /> Cover Letter Generator
            </span>
            {activeTab === "cover-letter" && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-400 rounded-t-full" />
            )}
          </button>
          <button
            onClick={() => {
              setActiveTab("interview-prep");
              setGeneratedContent("");
            }}
            className={`pb-4 px-2 text-sm font-medium transition-colors relative cursor-pointer ${
              activeTab === "interview-prep"
                ? "text-purple-400"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <span className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" /> Interview Prep
            </span>
            {activeTab === "interview-prep" && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-400 rounded-t-full" />
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6 flex flex-col h-full">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
              <label className="block text-white font-medium mb-2 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-slate-400" /> Target Job Role
              </label>
              <input
                type="text"
                value={jobRole}
                onChange={(e) => setJobRole(e.target.value)}
                placeholder="e.g. Senior Frontend Engineer, Product Manager..."
                className="w-full bg-slate-900/50 border border-white/10 rounded-lg p-4 text-slate-300 focus:outline-hidden focus:border-purple-500/50 text-sm"
              />
            </div>

            {activeTab === "cover-letter" && (
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-white font-medium flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-400" /> Resume
                    Context
                  </label>
                  <span className="text-xs text-slate-500">
                    (Auto-filled from last analysis)
                  </span>
                </div>
                <textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste your resume text here..."
                  className="w-full h-48 bg-slate-900/50 border border-white/10 rounded-lg p-4 text-slate-300 focus:outline-hidden focus:border-purple-500/50 resize-none text-sm"
                />
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="mt-auto w-full py-4 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-purple-500/20 active:scale-[0.98] cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {activeTab === "cover-letter" ? "Writing..." : "Analyzing..."}
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  {activeTab === "cover-letter"
                    ? "Generate Cover Letter"
                    : "Generate Interview Guide"}
                </>
              )}
            </button>
          </div>

          {/* Output Section */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-8 min-h-[500px] flex flex-col relative">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
              <h2 className="text-lg font-semibold text-white">AI Output</h2>
              {generatedContent && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={copyToClipboard}
                    className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                    title="Copy to clipboard"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                  <div className="relative group">
                    <button
                      className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                      title="Export options"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                    {/* Export Dropdown */}
                    <div className="absolute right-0 top-full mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 min-w-[160px]">
                      <button
                        onClick={exportAsText}
                        className="w-full px-4 py-2.5 text-left text-slate-300 hover:bg-slate-700 hover:text-white transition-colors flex items-center gap-2 cursor-pointer rounded-t-lg"
                      >
                        <FileText className="w-4 h-4" />
                        Export as TXT
                      </button>
                      <button
                        onClick={exportAsMarkdown}
                        className="w-full px-4 py-2.5 text-left text-slate-300 hover:bg-slate-700 hover:text-white transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <FileDown className="w-4 h-4" />
                        Export as MD
                      </button>
                      <button
                        onClick={exportAsPDF}
                        className="w-full px-4 py-2.5 text-left text-slate-300 hover:bg-slate-700 hover:text-white transition-colors flex items-center gap-2 cursor-pointer rounded-b-lg"
                      >
                        <FileDown className="w-4 h-4" />
                        Print as PDF
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {generatedContent ? (
              <div className="prose prose-invert prose-lg max-w-none overflow-y-auto custom-scrollbar flex-1">
                <style jsx global>{`
                  .prose h1 {
                    color: #fbbf24 !important;
                    font-size: 1.75rem;
                    margin-bottom: 1rem;
                    font-weight: 700;
                  }
                  .prose h2 {
                    color: #60a5fa !important;
                    font-size: 1.5rem;
                    margin-top: 1.5rem;
                    margin-bottom: 0.75rem;
                    font-weight: 600;
                  }
                  .prose h3 {
                    color: #a78bfa !important;
                    font-size: 1.25rem;
                    margin-top: 1.25rem;
                    margin-bottom: 0.5rem;
                    font-weight: 600;
                  }
                  .prose h4 {
                    color: #34d399 !important;
                    font-size: 1.125rem;
                    margin-top: 1rem;
                    margin-bottom: 0.5rem;
                    font-weight: 600;
                  }
                  .prose p {
                    color: #e2e8f0 !important;
                    line-height: 1.75;
                    margin-bottom: 1rem;
                  }
                  .prose strong {
                    color: #fbbf24 !important;
                    font-weight: 600;
                  }
                  .prose ul,
                  .prose ol {
                    color: #cbd5e1 !important;
                    margin-left: 1.5rem;
                    margin-bottom: 1rem;
                  }
                  .prose li {
                    margin-bottom: 0.5rem;
                    line-height: 1.6;
                  }
                  .prose li::marker {
                    color: #60a5fa !important;
                  }
                  .prose code {
                    background-color: #1e293b;
                    color: #fbbf24;
                    padding: 0.2rem 0.4rem;
                    border-radius: 0.25rem;
                    font-size: 0.875rem;
                  }
                  .prose blockquote {
                    border-left: 4px solid #60a5fa;
                    padding-left: 1rem;
                    color: #94a3b8 !important;
                    font-style: italic;
                  }
                  .prose a {
                    color: #60a5fa !important;
                    text-decoration: underline;
                  }
                  .prose hr {
                    border-color: #475569;
                    margin: 1.5rem 0;
                  }
                `}</style>
                <ReactMarkdown>{generatedContent}</ReactMarkdown>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 space-y-4">
                <Sparkles className="w-12 h-12 opacity-20" />
                <p className="text-center max-w-xs">
                  Fill in the details on the left and click Generate to see the
                  magic happen.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
