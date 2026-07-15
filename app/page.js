"use client";

import { Button } from "@/components/ui/button";
import {
  Rocket,
  Loader2,
  Check,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { getUserDashboardStats, updateUserSubscription } from "@/utils/firebaseConfig";

// Load Razorpay script dynamically
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (document.getElementById("razorpay-script")) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function Home() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [paymentLoading, setPaymentLoading] = useState(null); // plan key being processed
  const [userPlan, setUserPlan] = useState("free");
  const [loadingPlan, setLoadingPlan] = useState(false);

  // Fetch user stats/plan if authenticated
  useEffect(() => {
    const fetchUserPlan = async () => {
      if (isAuthenticated && user?.uid) {
        setLoadingPlan(true);
        try {
          const stats = await getUserDashboardStats(user.uid);
          if (stats && stats.plan) {
            setUserPlan(stats.plan);
          }
        } catch (error) {
          console.error("Error fetching user plan:", error);
        } finally {
          setLoadingPlan(false);
        }
      }
    };

    fetchUserPlan();
  }, [isAuthenticated, user?.uid]);

  const handleRazorpayPayment = useCallback(async (planKey, planName, amountINR) => {
    if (!isAuthenticated || !user) {
      toast.error("Please login or register to subscribe to Career Pro.");
      router.push("/login?redirect=pricing");
      return;
    }

    setPaymentLoading(planKey);

    try {
      // Load Razorpay checkout script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error("Failed to load payment gateway. Please check your internet connection.");
        setPaymentLoading(null);
        return;
      }

      // Create order on backend
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amountINR,
          currency: "INR",
          planName,
        }),
      });

      if (!res.ok) {
        throw new Error("Could not create payment order");
      }

      const { orderId, amount, currency } = await res.json();

      // Open Razorpay checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount,
        currency,
        name: "Career Lens",
        description: `${planName} Subscription`,
        image: "/logo.svg",
        order_id: orderId,
        handler: async function (response) {
          try {
            toast.loading("Saving your payment details...");
            
             // Store payment details in Firestore properly
             await updateUserSubscription(user.uid, {
               plan: "pro",
               billingCycle,
               paymentId: response.razorpay_payment_id,
               orderId: response.razorpay_order_id,
               amount: proPrice,
             });

            toast.dismiss();
            toast.success("Subscribed successfully! Welcome to Career Pro!");
            setUserPlan("pro");
            router.push("/dashboard");
          } catch (dbErr) {
            console.error("Error saving plan details to firestore:", dbErr);
            toast.dismiss();
            toast.error("Payment was successful, but we failed to update your plan details. Please contact support.");
          } finally {
            setPaymentLoading(null);
          }
        },
        prefill: {
          name: user.displayName || "",
          email: user.email || "",
        },
        notes: {
          plan: planName,
        },
        theme: {
          color: "#f59e0b", // Amber-500 to match app theme
          backdrop_color: "rgba(2, 6, 23, 0.92)",
        },
        modal: {
          ondismiss: function () {
            setPaymentLoading(null);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response) {
        console.error("Payment failed:", response.error);
        toast.error("Payment failed: " + response.error.description);
        setPaymentLoading(null);
      });
      rzp.open();
    } catch (err) {
      console.error("Payment error:", err);
      toast.error("Something went wrong while initiating payment. Please try again.");
      setPaymentLoading(null);
    }
  }, [isAuthenticated, user, billingCycle, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-955 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  // Price values in INR (numeric for Razorpay)
  const proPrice = billingCycle === "monthly" ? 799 : 649;
  const proLabel = billingCycle === "monthly" ? "₹799" : "₹649";

  return (
    <div
      className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans overflow-x-hidden selection:bg-cyan-500 selection:text-slate-900 bg-cover bg-center bg-fixed"
      style={{
        backgroundImage:
          "linear-gradient(rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0.85)), url('/hero.jpeg')",
      }}
    >
      {/* HERO SECTION */}
      <section className="relative w-full min-h-screen flex items-center justify-start px-6 md:px-16 py-20">
        {/* Logo Header */}
        <div className="absolute top-8 right-8 md:right-16 z-10">
          <Link href="/">
            <Image
              src={"/logo.svg"}
              alt="Logo"
              width={185}
              height={185}
              className="hover:scale-105 transition-transform"
            />
          </Link>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 w-full max-w-3xl mt-12 md:mt-0">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-6 animate-pulse">
            <Sparkles className="w-3.5 h-3.5" /> Empowering Career Growth
          </div>

          {/* Heading */}
          <h1 className="font-bold text-4xl sm:text-5xl lg:text-6xl leading-tight text-white mb-6 tracking-tight">
            Fix the gap between your{" "}
            <span className="bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 bg-clip-text text-transparent">
              resume
            </span>{" "}
            and real job roles.
          </h1>

          {/* Description */}
          <p className="text-slate-300 text-lg sm:text-xl font-medium mb-10 leading-relaxed max-w-2xl">
            AI that understands real job expectations, exposes skill gaps, and
            evolves your resume based on evidence — not just stuffing keywords.
          </p>

          {/* Bullet points */}
          <ul className="text-slate-300 text-base sm:text-lg font-medium mb-12 space-y-4">
            <li className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]"></span>
              Built for students and early-career professionals.
            </li>
            <li className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_10px_#f59e0b]"></span>
              Designed for freshers, career switchers, and placement-focused
              students.
            </li>
          </ul>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
            {isAuthenticated ? (
              <Link href={"/dashboard"}>
                <Button
                  size="lg"
                  className="w-full sm:w-auto px-8 py-6 text-base font-bold transition-all duration-300 bg-linear-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_25px_rgba(245,158,11,0.4)] border border-amber-400/20 active:scale-98 cursor-pointer"
                >
                  Go to Dashboard <Rocket className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            ) : (
              <Link href={"/signup"}>
                <Button
                  size="lg"
                  className="w-full sm:w-auto px-8 py-6 text-base font-bold transition-all duration-300 bg-linear-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_25px_rgba(245,158,11,0.4)] border border-amber-400/20 active:scale-98 cursor-pointer"
                >
                  Get Started <Rocket className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            )}
            <Link href={"/how-it-works"}>
              <Button
                size="lg"
                variant="ghost"
                className="w-full sm:w-auto px-8 py-6 text-base font-semibold border border-white/10 hover:bg-white/5 hover:text-white transition-all active:scale-98 cursor-pointer text-slate-100"
              >
                See How it works <span className="ml-2 text-cyan-400">▶</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-500 text-sm animate-bounce">
          <span>Scroll down to view plans</span>
          <span className="text-lg">↓</span>
        </div>
      </section>

      {/* PRICING & PAYMENT SECTION */}
      <section className="w-full py-24 bg-black/40 backdrop-blur-md border-t border-white/10 relative">
        {/* Decorative background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-6 tracking-tight">
              Invest in Your Career Success
            </h2>
            <p className="text-slate-400 text-lg sm:text-xl leading-relaxed">
              Expose your real skill gaps, benchmark against live job profiles,
              and stand out to placement coordinators and hiring teams. Choose
              the plan that fits your ambition.
            </p>

            {/* Billing Cycle Toggle */}
            <div className="relative inline-flex items-center p-1 rounded-full bg-white/5 border border-white/10 mt-10 backdrop-blur-md overflow-hidden">
              {/* Sliding background indicator */}
              <div
                className="absolute top-1 bottom-1 rounded-full bg-white/10 border border-white/10 transition-all duration-300 ease-out pointer-events-none"
                style={{
                  left: billingCycle === "monthly" ? "4px" : "154px",
                  width: "150px",
                }}
              />
              <button
                type="button"
                onClick={() => setBillingCycle("monthly")}
                className={`relative z-10 px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 cursor-pointer w-[150px] text-center ${
                  billingCycle === "monthly"
                    ? "text-cyan-400"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Monthly Billing
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle("yearly")}
                className={`relative z-10 px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer w-[150px] text-center ${
                  billingCycle === "yearly"
                    ? "text-cyan-400"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Yearly Billing
              </button>
            </div>
          </div>

          {/* Pricing Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
            {/* Starter Plan Card */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 hover:border-cyan-500/30 rounded-2xl p-8 flex flex-col justify-between transition-all duration-300 hover:translate-y-[-4px] shadow-xl relative group">
              <div>
                <div className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">
                  Starter / Student
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  Free Explorer
                </h3>
                <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                  Basic AI features to help check your resume alignment against
                  single job postings.
                </p>
                <div className="flex items-baseline gap-1.5 mb-8">
                  <span className="text-4xl font-extrabold text-white">₹0</span>
                  <span className="text-slate-500 text-sm font-medium">
                    / forever
                  </span>
                </div>

                <hr className="border-white/10 my-6" />

                <ul className="space-y-4">
                  <li className="flex items-start gap-3 text-sm text-slate-300">
                    <Check className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                    <span>3 resume analyses per month</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-slate-300">
                    <Check className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                    <span>Standard match scoring metrics</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-slate-300">
                    <Check className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                    <span>Basic keyword check report</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-slate-500 line-through decoration-white/10">
                    <span>Advanced skill gap breakdown</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-slate-500 line-through decoration-white/10">
                    <span>Real-time job matching feeds</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8">
                <Button 
                  disabled={isAuthenticated && userPlan === "free"}
                  className="w-full py-6 bg-white/5 hover:bg-white/10 text-white border border-white/10 font-semibold rounded-xl cursor-pointer disabled:opacity-80"
                >
                  {isAuthenticated && userPlan === "free" ? "Current Active Plan" : "Get Started"}
                </Button>
              </div>
            </div>

            {/* Pro Plan Card (Highlighted) */}
            <div className="bg-white/10 backdrop-blur-md border-2 border-amber-500/50 hover:border-amber-500/80 rounded-2xl p-8 flex flex-col justify-between transition-all duration-300 hover:translate-y-[-4px] shadow-[0_10px_30px_rgba(245,158,11,0.15)] relative group">
              <div className="absolute top-0 right-6 -translate-y-1/2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-955 font-bold uppercase tracking-wider text-[11px] px-4 py-1.5 rounded-full shadow-[0_4px_12px_rgba(245,158,11,0.3)]">
                Most Popular
              </div>

              <div>
                <div className="text-amber-500 text-xs font-extrabold uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4" /> Pro Growth Plan
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  Career Pro
                </h3>
                <p className="text-slate-300 text-sm mb-6 leading-relaxed">
                  Advanced AI analyzer detailing actual skill gaps, real-world
                  experience, and action steps.
                </p>
                <div className="flex items-baseline gap-1.5 mb-8">
                  <span className="text-5xl font-extrabold text-white font-sans">
                    {proLabel}
                  </span>
                  <span className="text-slate-400 text-sm font-medium">
                    / month{" "}
                    {billingCycle === "yearly" && (
                      <span className="text-cyan-400 font-semibold">
                        (billed annually)
                      </span>
                    )}
                  </span>
                </div>

                <hr className="border-white/10 my-6" />

                <ul className="space-y-4">
                  <li className="flex items-start gap-3 text-sm text-slate-200">
                    <Check className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <span className="font-semibold text-white">
                      Unlimited resume analyses
                    </span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-slate-200">
                    <Check className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <span>Evidence-based skill gap reports</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-slate-200">
                    <Check className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <span>Real-time job matching feeds & filters</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-slate-200">
                    <Check className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <span>Interactive AI Career Coach insights</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-slate-200">
                    <Check className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <span>Priority dashboard analytics</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8">
                {userPlan === "pro" ? (
                  <Button
                    disabled
                    className="w-full py-6 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold rounded-xl cursor-default disabled:opacity-100"
                  >
                    Active Plan
                  </Button>
                ) : (
                  <Button
                    onClick={() =>
                      handleRazorpayPayment("pro", "Career Pro", proPrice)
                    }
                    disabled={paymentLoading === "pro" || loadingPlan}
                    className="w-full py-6 bg-linear-to-r from-amber-500 to-amber-600 text-slate-950 hover:from-amber-600 hover:to-amber-700 font-bold rounded-xl shadow-lg active:scale-98 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {paymentLoading === "pro" ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Opening Payment...
                      </span>
                    ) : (
                      `Get Pro — ${proLabel}/mo`
                    )}
                  </Button>
                )}
              </div>
            </div>

            {/* Enterprise Plan Card */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 hover:border-cyan-500/30 rounded-2xl p-8 flex flex-col justify-between transition-all duration-300 hover:translate-y-[-4px] shadow-xl relative group">
              <div>
                <div className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">
                  Universities & Teams
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  Placement Cell
                </h3>
                <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                  Bulk analysis tools, statistics trackers, and dashboards
                  designed for departments and colleges.
                </p>
                <div className="flex items-baseline gap-1.5 mb-8">
                  <span className="text-3xl font-extrabold text-white">
                    Custom
                  </span>
                  <span className="text-slate-500 text-sm font-medium">
                    / institutional
                  </span>
                </div>

                <hr className="border-white/10 my-6" />

                <ul className="space-y-4">
                  <li className="flex items-start gap-3 text-sm text-slate-300">
                    <Check className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                    <span>All Pro plan features for all students</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-slate-300">
                    <Check className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                    <span className="font-semibold text-white">
                      Admin / Coordinator dashboard
                    </span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-slate-300">
                    <Check className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                    <span>Bulk import, scoring & statistics export</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-slate-300">
                    <Check className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                    <span>Dedicated account support manager</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8">
                <Button className="w-full py-6 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold rounded-xl cursor-pointer">
                  Contact Institutional Sales
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-black/40 py-12 px-6 border-t border-white/10 mt-auto text-center text-slate-500 text-sm backdrop-blur-xs">
        <p>
          © {new Date().getFullYear()} Career Lens. Helping freshers and
          professionals address real job gaps.
        </p>
      </footer>
    </div>
  );
}
