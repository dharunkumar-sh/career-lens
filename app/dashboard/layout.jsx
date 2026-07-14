"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import ProfileDropdown from "@/components/ui/profile-dropdown";
import {
  LayoutDashboard,
  Layers,
  ChevronDown,
  ChevronUp,
  Compass,
  FileText,
  TrendingUp,
  Sparkles,
  User,
  History,
  Menu,
  X,
  LogOut,
  Briefcase
} from "lucide-react";
import toast from "react-hot-toast";

export default function DashboardLayout({ children }) {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  
  const [isFeaturesOpen, setIsFeaturesOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Auto-expand features if we're on a features sub-page
  useEffect(() => {
    const featurePaths = [
      "/dashboard/skill-gap",
      "/dashboard/resume-analysis",
      "/dashboard/job-matching",
      "/dashboard/career-coach",
      "/dashboard/profile"
    ];
    if (featurePaths.some(p => pathname.startsWith(p))) {
      setIsFeaturesOpen(true);
    }
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      router.push("/login");
    } catch (error) {
      toast.error("Failed to log out");
    }
  };

  const featureItems = [
    {
      name: "Skill Gap Roadmap",
      href: "/dashboard/skill-gap",
      icon: Compass,
      color: "text-cyan-400"
    },
    {
      name: "Resume Analysis",
      href: "/dashboard/resume-analysis",
      icon: FileText,
      color: "text-blue-400"
    },
    {
      name: "Job Matching",
      href: "/dashboard/job-matching",
      icon: TrendingUp,
      color: "text-emerald-400"
    },
    {
      name: "AI Career Coach",
      href: "/dashboard/career-coach",
      icon: Sparkles,
      color: "text-purple-400"
    }
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-950/40 backdrop-blur-xl border-r border-white/10 text-slate-300 shadow-[inset_-1px_0_0_rgba(255,255,255,0.03),0_0_30px_rgba(0,0,0,0.4)]">
      {/* Brand Logo */}
      <div className="h-16 border-b border-white/10 flex items-center justify-between px-6 shrink-0 bg-white/1">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo.svg"
            alt="Project Logo"
            width={140}
            height={40}
            className="w-auto h-8"
          />
        </Link>
        {isMobileOpen && (
          <button
            onClick={() => setIsMobileOpen(false)}
            className="p-1 rounded-lg bg-white/5 border border-white/15 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
        {/* Dashboard Link */}
        <Link
          href="/dashboard"
          onClick={() => setIsMobileOpen(false)}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative cursor-pointer ${
            pathname === "/dashboard"
              ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/25 shadow-md shadow-cyan-950/20 font-semibold"
              : "hover:bg-white/5 text-slate-400 hover:text-slate-200 border border-transparent"
          }`}
        >
          {pathname === "/dashboard" && (
            <div className="absolute left-0 top-3 bottom-3 w-1 bg-cyan-400 rounded-r" />
          )}
          <LayoutDashboard
            className={`w-5 h-5 transition-transform group-hover:scale-110 ${pathname === "/dashboard" ? "text-cyan-400" : "text-slate-400 group-hover:text-slate-300"}`}
          />
          <span>Dashboard</span>
        </Link>

        {/* Features Dropdown Parent */}
        <div>
          <button
            onClick={() => setIsFeaturesOpen(!isFeaturesOpen)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group cursor-pointer ${
              featureItems.some((item) => pathname.startsWith(item.href))
                ? "text-slate-200 font-semibold"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            }`}
          >
            <div className="flex items-center gap-3">
              <Layers className="w-5 h-5 text-slate-400 group-hover:text-slate-300 transition-transform group-hover:rotate-6" />
              <span>Features</span>
            </div>
            {isFeaturesOpen ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {/* Features Dropdown Children */}
          {isFeaturesOpen && (
            <div className="mt-1 ml-4 pl-3 border-l border-white/10 space-y-1">
              {featureItems.map((item) => {
                const isActive = pathname === item.href;
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[15px] transition-all duration-200 group relative cursor-pointer ${
                      isActive
                        ? "bg-white/5 text-white border-l-2 border-cyan-400 font-medium"
                        : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                    }`}
                  >
                    <IconComponent
                      className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? item.color : "text-slate-400 group-hover:text-slate-300"}`}
                    />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* My Profile Link */}
        <Link
          href="/dashboard/profile"
          onClick={() => setIsMobileOpen(false)}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative cursor-pointer ${
            pathname === "/dashboard/profile"
              ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/25 shadow-md shadow-cyan-950/20 font-semibold"
              : "hover:bg-white/5 text-slate-400 hover:text-slate-200 border border-transparent"
          }`}
        >
          {pathname === "/dashboard/profile" && (
            <div className="absolute left-0 top-3 bottom-3 w-1 bg-cyan-400 rounded-r" />
          )}
          <User
            className={`w-5 h-5 transition-transform group-hover:scale-110 ${pathname === "/dashboard/profile" ? "text-cyan-400" : "text-slate-400 group-hover:text-slate-300"}`}
          />
          <span>My Profile</span>
        </Link>

        {/* History Link */}
        <Link
          href="/dashboard/history"
          onClick={() => setIsMobileOpen(false)}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative cursor-pointer ${
            pathname === "/dashboard/history"
              ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/25 shadow-md shadow-cyan-950/20 font-semibold"
              : "hover:bg-white/5 text-slate-400 hover:text-slate-200 border border-transparent"
          }`}
        >
          {pathname === "/dashboard/history" && (
            <div className="absolute left-0 top-3 bottom-3 w-1 bg-cyan-400 rounded-r" />
          )}
          <History
            className={`w-5 h-5 transition-transform group-hover:scale-110 ${pathname === "/dashboard/history" ? "text-cyan-400" : "text-slate-400 group-hover:text-slate-300"}`}
          />
          <span>History</span>
        </Link>
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-white/10 bg-slate-950/20">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 bg-red-500/10  border border-transparent  hover:font-medium hover:border-red-600 transition-all duration-200 cursor-pointer"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div
      className="min-h-screen flex bg-slate-950 bg-cover bg-center bg-fixed text-slate-100 font-sans"
      style={{
        backgroundImage:
          "linear-gradient(rgba(2, 6, 23, 0.75), rgba(2, 6, 23, 0.92)), url('/dashboard-bg.jpg')",
      }}
    >
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 shrink-0 h-screen sticky top-0 animate-fade-in">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar Slider */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 w-64 z-55 transition-transform duration-300 transform md:hidden ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 border-b border-white/10 bg-slate-950/20 backdrop-blur-md sticky top-0 z-40 px-6 flex items-center justify-between md:justify-end">
          {/* Mobile Hamburguer Menu */}
          <button
            onClick={() => setIsMobileOpen(true)}
            className="md:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex items-center gap-4">
            <ProfileDropdown />
          </div>
        </header>

        {/* Content Page wrapper */}
        <div className="grow">
          {children}
        </div>
      </div>
    </div>
  );
}
