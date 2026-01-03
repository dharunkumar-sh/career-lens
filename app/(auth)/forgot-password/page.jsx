"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, Rocket } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { resetPassword } from "@/utils/firebaseConfig";
import { useAuth } from "@/context/AuthContext";

const ForgotPasswordPage = () => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setIsLoading(true);

    try {
      await resetPassword(email);
      setEmailSent(true);
      toast.success("Password reset email sent! Check your inbox.");
    } catch (error) {
      console.error("Password reset error:", error);
      switch (error.code) {
        case "auth/user-not-found":
          toast.error("No account found with this email address");
          break;
        case "auth/invalid-email":
          toast.error("Please enter a valid email address");
          break;
        case "auth/too-many-requests":
          toast.error("Too many requests. Please try again later");
          break;
        default:
          toast.error("Failed to send reset email. Please try again");
      }
    } finally {
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
          {!emailSent ? (
            <>
              <Button
                variant="outline"
                onClick={() => router.push("/login")}
                className="flex items-center gap-2 bg-transparent border-accent transition-colors mb-6 cursor-pointer"
              >
                <ArrowLeft size={20} />
                Back to login
              </Button>

              <h1 className="text-white text-4xl font-bold mb-1">
                Forgot Password?
              </h1>
              <p className="text-slate-400 mb-6 text-base">
                No worries! Enter your email and we&apos;ll send you reset
                instructions.
              </p>

              <form onSubmit={handleResetPassword}>
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

                <Button
                  type="submit"
                  size="lg"
                  variant="outline"
                  disabled={isLoading}
                  className="mt-6 min-w-md bg-transparent ml-9 border-amber-600 shadow-2xl border-2 shadow-amber-600/10 hover:bg-amber-600/10 hover:text-white text-lg relative overflow-hidden transition-all duration-300 group cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    {isLoading ? "Sending..." : "Send Reset Link"}
                    <Mail
                      size={20}
                      className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
                    />
                  </span>
                </Button>
              </form>
            </>
          ) : (
            <>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Mail size={32} className="text-green-400" />
                </div>
                <h1 className="text-white text-4xl font-bold mb-3">
                  Check Your Email
                </h1>
                <p className="text-slate-400 mb-6 text-base">
                  We&apos;ve sent a password reset link to{" "}
                  <span className="text-amber-400">{email}</span>
                </p>
                <p className="text-slate-500 text-sm mb-6">
                  Didn&apos;t receive the email? Check your spam folder or{" "}
                  <button
                    onClick={() => setEmailSent(false)}
                    className="text-amber-400 hover:text-amber-300 underline cursor-pointer"
                  >
                    try again
                  </button>
                </p>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => router.push("/login")}
                  className="mt-2 min-w-md bg-transparent border-amber-600 shadow-2xl border-2 shadow-amber-600/10 hover:bg-amber-600/10 hover:text-white text-lg transition-all duration-300 cursor-pointer"
                >
                  Back to Login
                </Button>
              </div>
            </>
          )}

          <div className="mt-6 text-base text-center text-slate-300">
            🔒 Secure password reset. Your data stays private.
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
