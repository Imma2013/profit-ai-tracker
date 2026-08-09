"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, googleProvider } from "@/lib/firebase";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  User,
} from "firebase/auth";

export default function OnboardingPage() {
  const router = useRouter();
  
  // Step 1: Feature Intro | Step 2: Authentication (Sign In) | Step 3: Subscription Paywall
  const [step, setStep] = useState<"intro" | "auth" | "paywall">("intro");
  
  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Paywall plan selection ('yearly' has 3-day trial)
  const [selectedPlan, setSelectedPlan] = useState<"yearly" | "monthly">("yearly");
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser && step === "auth") {
        // Automatically move to paywall once signed in!
        setStep("paywall");
      }
    });
    return () => unsubscribe();
  }, [step]);

  const handleNextFromIntro = () => {
    if (user) {
      setStep("paywall");
    } else {
      setStep("auth");
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError("");
    setAuthLoading(true);
    try {
      const res = await signInWithPopup(auth, googleProvider);
      setUser(res.user);
      setStep("paywall");
    } catch (err: any) {
      setAuthError(err.message || "Failed to sign in with Google");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);
    try {
      let res;
      if (isSignUp) {
        res = await createUserWithEmailAndPassword(auth, email, password);
      } else {
        res = await signInWithEmailAndPassword(auth, email, password);
      }
      setUser(res.user);
      setStep("paywall");
    } catch (err: any) {
      setAuthError(err.message || "Authentication failed");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSubscribe = async () => {
    setCheckoutLoading(true);
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planType: selectedPlan,
          userId: user?.uid || "anonymous",
          userEmail: user?.email || undefined,
        }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        // If Stripe keys aren't set up yet, allow proceeding to main app
        router.push("/");
      }
    } catch (err) {
      console.error("Checkout redirect failed", err);
      router.push("/");
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-black text-white px-6 py-8 justify-between max-w-md mx-auto relative overflow-hidden">
      {/* Step Progress Indicator */}
      <div className="flex items-center space-x-2 pt-4 px-2">
        <div className={`h-1.5 flex-1 rounded-full transition-colors ${step === "intro" ? "bg-white" : "bg-gray-700"}`} />
        <div className={`h-1.5 flex-1 rounded-full transition-colors ${step === "auth" ? "bg-white" : "bg-gray-700"}`} />
        <div className={`h-1.5 flex-1 rounded-full transition-colors ${step === "paywall" ? "bg-white" : "bg-gray-700"}`} />
      </div>

      {/* STEP 1: FEATURE INTRO */}
      {step === "intro" && (
        <div className="flex-1 flex flex-col justify-between my-8 animate-fadeIn">
          <div className="flex-1 flex flex-col justify-center items-center text-center space-y-6">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-green-500/20 to-emerald-400/20 border border-green-500/30 flex items-center justify-center text-5xl shadow-[0_0_50px_rgba(34,197,94,0.2)]">
              📈
            </div>
            
            <div className="space-y-3">
              <h1 className="text-3xl font-extrabold tracking-tight">
                Master the Charts with <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">Profit AI</span>
              </h1>
              <p className="text-gray-400 text-sm leading-relaxed px-4">
                Instant AI trading analysis, support & resistance levels, and high-probability entry & exit strategies directly from your chart screenshots.
              </p>
            </div>

            <div className="w-full bg-[#111111] rounded-2xl p-4 border border-gray-800 text-left space-y-3">
              <div className="flex items-center space-x-3 text-sm">
                <span className="text-green-400 font-bold">✓</span>
                <span className="text-gray-300">Gemini-powered chart vision engine</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <span className="text-green-400 font-bold">✓</span>
                <span className="text-gray-300">Automated Buy/Sell risk signals</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <span className="text-green-400 font-bold">✓</span>
                <span className="text-gray-300">Support & Resistance price target mapping</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleNextFromIntro}
            className="w-full bg-white text-black font-bold py-4 rounded-2xl text-lg hover:bg-gray-200 transition-colors shadow-lg"
          >
            Get Started
          </button>
        </div>
      )}

      {/* STEP 2: SIGN IN / SIGN UP (BEFORE PAYWALL) */}
      {step === "auth" && (
        <div className="flex-1 flex flex-col justify-between my-6 animate-fadeIn">
          <div className="flex-1 flex flex-col justify-center space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Create your Account</h2>
              <p className="text-gray-400 text-sm">
                Sign in first to save your chart analyses & start your free trial
              </p>
            </div>

            {authError && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-xl text-center">
                {authError}
              </div>
            )}

            <button
              onClick={handleGoogleSignIn}
              disabled={authLoading}
              className="w-full bg-[#1a1a1a] border border-gray-800 text-white font-medium rounded-xl px-4 py-3.5 flex items-center justify-center space-x-3 hover:bg-[#222] transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="flex items-center justify-center space-x-2 my-2">
              <div className="h-px bg-gray-800 flex-1" />
              <span className="text-gray-500 text-xs uppercase">Or with email</span>
              <div className="h-px bg-gray-800 flex-1" />
            </div>

            <form onSubmit={handleEmailAuth} className="space-y-3">
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#111111] border border-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gray-500"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#111111] border border-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gray-500"
                required
              />
              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-white text-black font-semibold rounded-xl px-4 py-3 hover:bg-gray-200 transition-colors"
              >
                {authLoading ? "Processing..." : isSignUp ? "Sign Up & Continue" : "Sign In & Continue"}
              </button>
            </form>

            <div className="text-center pt-2">
              <p className="text-gray-400 text-xs">
                {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                <button
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-white font-medium hover:underline focus:outline-none"
                >
                  {isSignUp ? "Sign In" : "Sign Up"}
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: SUBSCRIPTION PAYWALL (YEARLY PLAN INCLUDES 3-DAY FREE TRIAL) */}
      {step === "paywall" && (
        <div className="flex-1 flex flex-col justify-between my-4 animate-fadeIn">
          <div className="space-y-6">
            <div className="text-center space-y-2 pt-2">
              <div className="inline-block px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-full text-green-400 text-xs font-bold uppercase tracking-wider mb-1">
                Unlock Full Access
              </div>
              <h2 className="text-3xl font-extrabold">Choose Your Plan</h2>
              <p className="text-gray-400 text-xs">
                Cancel anytime. No commitment.
              </p>
            </div>

            {/* Plans Selection */}
            <div className="space-y-4">
              {/* Yearly Plan with 3-DAY FREE TRIAL */}
              <div
                onClick={() => setSelectedPlan("yearly")}
                className={`relative rounded-3xl p-5 border-2 cursor-pointer transition-all ${
                  selectedPlan === "yearly"
                    ? "bg-gradient-to-b from-[#18261e] to-[#0f1712] border-green-500 shadow-[0_0_35px_rgba(34,197,94,0.25)]"
                    : "bg-[#111111] border-gray-800 hover:border-gray-700"
                }`}
              >
                {/* 3-Day Free Trial Badge */}
                <div className="absolute -top-3.5 right-4 bg-gradient-to-r from-green-500 to-emerald-400 text-black text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                  ★ 3-DAY FREE TRIAL
                </div>

                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-lg text-white">Yearly Plan</h3>
                    <p className="text-green-400 text-xs font-semibold">3 Days Free, then $59.99/year</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-extrabold text-white">$4.99</span>
                    <span className="text-xs text-gray-400"> /mo</span>
                  </div>
                </div>

                <p className="text-gray-400 text-xs">
                  Billed annually ($59.99/yr) after 3 days. Save 50% compared to monthly.
                </p>
              </div>

              {/* Monthly Plan */}
              <div
                onClick={() => setSelectedPlan("monthly")}
                className={`rounded-3xl p-5 border-2 cursor-pointer transition-all ${
                  selectedPlan === "monthly"
                    ? "bg-gradient-to-b from-[#1c1c1c] to-[#121212] border-gray-400"
                    : "bg-[#111111] border-gray-800 hover:border-gray-700"
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <h3 className="font-bold text-lg text-white">Monthly Plan</h3>
                    <p className="text-gray-400 text-xs">Standard monthly access</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-extrabold text-white">$9.99</span>
                    <span className="text-xs text-gray-400"> /mo</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature Highlights */}
            <div className="bg-[#111111] rounded-2xl p-4 border border-gray-800/80 space-y-2 text-xs text-gray-300">
              <div className="flex items-center space-x-2">
                <span className="text-green-400 font-bold">⚡</span>
                <span>Unlimited AI Chart Analyses & Signals</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-400 font-bold">⚡</span>
                <span>Real-time Support & Resistance Target Alerts</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-400 font-bold">⚡</span>
                <span>Complete Trade Game Plan & Risk Assessment</span>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-4">
            <button
              onClick={handleSubscribe}
              disabled={checkoutLoading}
              className="w-full bg-gradient-to-r from-green-400 to-emerald-500 text-black font-extrabold py-4 rounded-2xl text-lg hover:brightness-110 transition-all shadow-[0_0_30px_rgba(34,197,94,0.3)] flex items-center justify-center space-x-2"
            >
              {checkoutLoading ? (
                <span>Redirecting to Checkout...</span>
              ) : selectedPlan === "yearly" ? (
                <span>START 3-DAY FREE TRIAL</span>
              ) : (
                <span>Subscribe Monthly ($9.99)</span>
              )}
            </button>

            <button
              onClick={() => router.push("/")}
              className="w-full text-center text-xs text-gray-500 hover:text-gray-300 py-1"
            >
              Skip for now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
