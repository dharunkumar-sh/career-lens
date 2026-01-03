"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { applyActionCode, auth } from "@/utils/firebaseConfig";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("verifying"); // verifying, success, error
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const oobCode = searchParams.get("oobCode");

    const verifyEmail = async () => {
      if (!oobCode) {
        setStatus("error");
        setErrorMessage("Invalid verification link. Please try again.");
        return;
      }

      try {
        await applyActionCode(auth, oobCode);
        setStatus("success");
        // Auto redirect to login after 3 seconds
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } catch (error) {
        console.error("Verification error:", error);
        setStatus("error");
        switch (error.code) {
          case "auth/expired-action-code":
            setErrorMessage(
              "This verification link has expired. Please request a new one."
            );
            break;
          case "auth/invalid-action-code":
            setErrorMessage(
              "This verification link is invalid or has already been used."
            );
            break;
          default:
            setErrorMessage("Failed to verify email. Please try again.");
        }
      }
    };

    verifyEmail();
  }, [searchParams, router]);

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
            {status === "verifying" && (
              <>
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Loader2 size={32} className="text-blue-400 animate-spin" />
                </div>
                <h1 className="text-white text-4xl font-bold mb-3">
                  Verifying Your Email
                </h1>
                <p className="text-slate-400 mb-6 text-base">
                  Please wait while we verify your email address...
                </p>
              </>
            )}

            {status === "success" && (
              <>
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle size={32} className="text-green-400" />
                </div>
                <h1 className="text-white text-4xl font-bold mb-3">
                  Email Verified!
                </h1>
                <p className="text-slate-400 mb-6 text-base">
                  Your email has been successfully verified. Redirecting you to
                  login...
                </p>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => router.push("/login")}
                  className="mt-2 min-w-md bg-transparent border-green-600 shadow-2xl border-2 shadow-green-600/10 hover:bg-green-600/10 hover:text-white text-lg transition-all duration-300 cursor-pointer"
                >
                  Go to Login Now
                </Button>
              </>
            )}

            {status === "error" && (
              <>
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <XCircle size={32} className="text-red-400" />
                </div>
                <h1 className="text-white text-4xl font-bold mb-3">
                  Verification Failed
                </h1>
                <p className="text-slate-400 mb-6 text-base">{errorMessage}</p>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => router.push("/login")}
                  className="mt-2 min-w-md bg-transparent border-red-600 shadow-2xl border-2 shadow-red-600/10 hover:bg-red-600/10 hover:text-white text-lg transition-all duration-300 cursor-pointer"
                >
                  Go to Login
                </Button>
              </>
            )}
          </div>

          <div className="mt-6 text-base text-center text-slate-300">
            🔒 Secure verification. Your data stays private.
          </div>
        </div>
      </div>
    </div>
  );
}
