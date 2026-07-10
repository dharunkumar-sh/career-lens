"use client";

import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Rocket, Loader2 } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import React, { useState, useEffect, Suspense } from "react";
import toast from "react-hot-toast";
import { logIn, resendVerificationEmail } from "@/utils/firebaseConfig";
import { useAuth } from "@/context/AuthContext";

const LoginContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  const { isAuthenticated } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isRocketLaunching, setIsRocketLaunching] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in or just logged in
  useEffect(() => {
    if (isAuthenticated) {
      if (redirect === "pricing") {
        router.replace("/#pricing");
      } else {
        router.replace("/dashboard");
      }
    }
  }, [isAuthenticated, router, redirect]);

  const handleLoginClick = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);

    try {
      const userCredential = await logIn(email, password);
      const loggedInUser = userCredential.user;

      if (!loggedInUser.emailVerified) {
        toast(
          (t) => (
            <div className="flex flex-col gap-2">
              <span>Please verify your email before logging in.</span>
              <button
                onClick={async () => {
                  try {
                    await resendVerificationEmail(loggedInUser);
                    toast.success("Verification email sent!");
                    toast.dismiss(t.id);
                  } catch (error) {
                    toast.error("Failed to send verification email");
                  }
                }}
                className="text-amber-400 hover:text-amber-300 underline text-sm"
              >
                Resend verification email
              </button>
            </div>
          ),
          {
            duration: 6000,
            icon: "📧",
          }
        );
        setIsLoading(false);
        return;
      }

      setIsRocketLaunching(true);
      toast.success("Welcome back! Logging you in...");
    } catch (error) {
      console.error("Login error:", error);
      switch (error.code) {
        case "auth/user-not-found":
          toast.error("No account found with this email");
          break;
        case "auth/wrong-password":
          toast.error("Incorrect password");
          break;
        case "auth/invalid-email":
          toast.error("Please enter a valid email address");
          break;
        case "auth/too-many-requests":
          toast.error("Too many failed attempts. Please try again later");
          break;
        case "auth/invalid-credential":
          toast.error("Invalid email or password");
          break;
        default:
          toast.error("Login failed. Please try again");
      }
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen relative flex items-center justify-center font-sans"
      style={{
        backgroundImage: "url('/auth.jpeg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs" />

      <div className="relative z-10 w-full max-w-lg mx-auto p-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl flex flex-col items-center">
          <div className="mb-6 hover:scale-105 transition-transform duration-300">
            <Link href="/">
              <Image src="/logo.svg" alt="Project Logo" width={220} height={220} />
            </Link>
          </div>

          <h2 className="text-3xl font-extrabold text-white text-center mb-2 tracking-tight">
            Welcome Back!
          </h2>
          <p className="text-slate-400 text-base text-center mb-8 font-medium">
            Log in to continue optimizing your career journey
          </p>

          <form onSubmit={handleLoginClick} className="w-full space-y-5">
            <div>
              <label className="block text-sm text-slate-300 font-bold mb-2 uppercase tracking-wide">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-4 bg-slate-950 border border-slate-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 rounded-2xl text-slate-200 text-base outline-none transition-all duration-300 placeholder:text-slate-600"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm text-slate-300 font-bold uppercase tracking-wide">
                  Password
                </label>
                <a
                  href="/reset-password"
                  className="text-amber-500 text-sm hover:text-amber-400 transition-colors"
                >
                  Forgot Password?
                </a>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-950 border border-slate-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 rounded-2xl text-slate-200 text-base outline-none transition-all duration-350 pr-12 placeholder:text-slate-600 font-mono"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              variant="outline"
              disabled={isRocketLaunching || isLoading}
              className={`mt-4 w-full bg-transparent border-amber-600 shadow-2xl border-2 shadow-amber-600/10 hover:bg-amber-600/10 hover:text-white text-lg relative overflow-hidden transition-all duration-300 group cursor-pointer ${
                isRocketLaunching ? "glow-pulse" : ""
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                {isLoading ? "Logging in..." : "Log In"}
                <Rocket
                  size={20}
                  className={`transition-all duration-300 ${
                    isRocketLaunching
                      ? "rocket-launch"
                      : "opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"
                  }`}
                />
              </span>
            </Button>
          </form>

          <div className="flex justify-center items-center mt-5">
            <a
              href="/signup"
              className="text-teal-300 text-base underline underline-offset-2 font-medium hover:text-teal-200 transition-colors duration-300"
            >
              Create an account
            </a>
          </div>

          <div className="mt-6 text-base text-center text-slate-300">
            🔒 Secure login. Your data stays private.
          </div>
        </div>
      </div>
    </div>
  );
};

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
