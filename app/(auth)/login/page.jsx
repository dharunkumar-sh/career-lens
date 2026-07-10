"use client";

import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Rocket } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { logIn, resendVerificationEmail } from "@/utils/firebaseConfig";
import { useAuth } from "@/context/AuthContext";

const AuthPage = () => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isRocketLaunching, setIsRocketLaunching] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in or just logged in
  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, router]);

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
          },
        );
        setIsLoading(false);
        return;
      }

      setIsRocketLaunching(true);
      toast.success("Welcome back! Logging you in...");

      // The useEffect watching isAuthenticated will handle the redirect
      // once Firebase auth state updates
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
      className="min-h-screen relative flex items-center"
      style={{
        backgroundImage: "url('/auth.jpeg')",
        backgroundSize: "cover",
        backgroundPosition: "center right",
      }}
    >
      <div className="absolute inset-0 bg-black/55 pointer-events-none" />
      {/* Logo */}
      <div className="text-white text-3xl font-bold text-right absolute top-8 right-12">
        <Link href="/">
          <Image src={"/logo.svg"} alt="Logo" width={185} height={185} />
        </Link>
      </div>

      <div className="relative w-170 pl-16">
        <div className="bg-[rgba(26,30,34,0.55)] border border-white/6 rounded-2xl p-10 backdrop-blur-lg text-slate-200 max-w-3xl">
          <h1 className="text-white text-4xl font-bold mb-1">Welcome back!</h1>
          <p className="text-slate-400 mb-6 text-base">
            Continue improving your resume alignment.
          </p>

          <form onSubmit={handleLoginClick}>
            <label className="block text-sm text-slate-300 mt-3 mb-2">
              Email Address
            </label>
            <input
              className="w-full h-10 rounded-full px-4 bg-transparent border border-slate-400/30 placeholder-slate-400 focus:bg-transparent focus:placeholder-slate-200 transition-colors duration-300"
              placeholder="Enter your email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              spellCheck="false"
              autoComplete="email"
            />

            <label className="block text-sm text-slate-300 mt-4 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                className="w-full h-10 rounded-full px-4 bg-transparent border border-slate-400/30 placeholder-slate-400 focus:bg-transparent focus:placeholder-slate-200 transition-colors duration-300"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 hover:bg-transparent transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </Button>
            </div>

            <div className="flex justify-end mt-2">
              <a
                href="/forgot-password"
                className="text-amber-400 text-sm hover:text-amber-300 transition-colors"
              >
                Forgot password?
              </a>
            </div>

            <Button
              type="submit"
              size="lg"
              variant="outline"
              disabled={isRocketLaunching || isLoading}
              className={`mt-4 min-w-md bg-transparent ml-9 border-amber-600 shadow-2xl border-2 shadow-amber-600/10 hover:bg-amber-600/10 hover:text-white text-lg relative overflow-hidden transition-all duration-300 group cursor-pointer ${
                isRocketLaunching ? "glow-pulse" : ""
              }`}
            >
              <span className="flex items-center gap-2">
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

export default AuthPage;
