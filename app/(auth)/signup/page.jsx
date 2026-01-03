"use client";

import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Rocket, Mail } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { signUp, initializeUserDocument } from "@/utils/firebaseConfig";
import { useAuth } from "@/context/AuthContext";

const SignupPage = () => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isRocketLaunching, setIsRocketLaunching] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);

  // Redirect if already logged in and verified
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  const validatePassword = (password) => {
    if (password.length < 6) {
      return "Password must be at least 6 characters long";
    }
    return null;
  };

  const handleSignupClick = async (e) => {
    e.preventDefault();

    if (!name || !email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      toast.error(passwordError);
      return;
    }

    setIsLoading(true);

    try {
      const userCredential = await signUp(email, password);

      // Initialize user document in Firestore
      try {
        await initializeUserDocument(userCredential.user.uid, email, name);
      } catch (firestoreError) {
        console.error("Error initializing user document:", firestoreError);
        // Don't block signup if Firestore fails
      }

      setIsRocketLaunching(true);
      toast.success("Account created! Please check your email to verify.");

      setTimeout(() => {
        setShowVerificationMessage(true);
        setIsRocketLaunching(false);
      }, 600);
    } catch (error) {
      console.error("Signup error:", error);
      switch (error.code) {
        case "auth/email-already-in-use":
          toast.error("An account with this email already exists");
          break;
        case "auth/invalid-email":
          toast.error("Please enter a valid email address");
          break;
        case "auth/weak-password":
          toast.error("Password is too weak. Use at least 6 characters");
          break;
        case "auth/operation-not-allowed":
          toast.error("Email/password signup is not enabled");
          break;
        default:
          toast.error("Signup failed. Please try again");
      }
      setIsLoading(false);
    }
  };

  if (showVerificationMessage) {
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
        <div className="text-white text-3xl font-bold text-right absolute top-8 right-12">
          <Link href="/">
            <Image src={"/logo.svg"} alt="Logo" width={185} height={185} />
          </Link>
        </div>

        <div className="relative w-170 pl-16">
          <div className="bg-[rgba(26,30,34,0.55)] border border-white/6 rounded-2xl p-10 backdrop-blur-lg text-slate-200 max-w-3xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail size={32} className="text-teal-400" />
              </div>
              <h1 className="text-white text-4xl font-bold mb-3">
                Verify Your Email
              </h1>
              <p className="text-slate-400 mb-6 text-base">
                We've sent a verification link to{" "}
                <span className="text-teal-400">{email}</span>
              </p>
              <p className="text-slate-500 text-sm mb-6">
                Please check your inbox and click the verification link to
                activate your account. Don&apos;t forget to check your spam
                folder!
              </p>
              <Button
                size="lg"
                variant="outline"
                onClick={() => router.push("/login")}
                className="mt-2 min-w-md bg-transparent border-teal-600 shadow-2xl border-2 shadow-teal-600/10 hover:bg-teal-600/10 hover:text-white text-lg transition-all duration-300 cursor-pointer"
              >
                Go to Login
              </Button>
            </div>

            <div className="mt-6 text-base text-center text-slate-300">
              🔒 Secure signup. Your data stays private.
            </div>
          </div>
        </div>
      </div>
    );
  }

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
          <h1 className="text-white text-4xl font-bold mb-1">Create Account</h1>
          <p className="text-slate-400 mb-6 text-base">
            Start improving your resume alignment today.
          </p>

          <form onSubmit={handleSignupClick}>
            <label className="block text-sm text-slate-300 mt-3 mb-2">
              Full Name
            </label>
            <input
              className="w-full h-10 rounded-full px-4 bg-transparent border border-slate-400/30 placeholder-slate-400 focus:bg-transparent focus:placeholder-slate-200 transition-colors duration-300"
              placeholder="Enter your full name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              spellCheck="false"
              autoComplete="name"
            />

            <label className="block text-sm text-slate-300 mt-4 mb-2">
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
                placeholder="Enter your password (min. 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
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

            <Button
              type="submit"
              size="lg"
              variant="outline"
              disabled={isRocketLaunching || isLoading}
              className={`mt-6 min-w-md bg-transparent ml-9 border-teal-600 shadow-2xl border-2 shadow-teal-600/10 hover:bg-teal-600/10 hover:text-white text-lg transition-all duration-300 relative overflow-hidden group cursor-pointer ${
                isRocketLaunching ? "glow-pulse" : ""
              }`}
            >
              <span className="flex items-center gap-2">
                {isLoading ? "Creating Account..." : "Create Account"}
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
              href="/login"
              className="text-amber-300 text-base underline underline-offset-2 font-medium hover:text-amber-200 transition-colors duration-300"
            >
              Already have an account? Log in
            </a>
          </div>

          <div className="mt-6 text-base text-center text-slate-300">
            🔒 Secure signup. Your data stays private.
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
