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

  // Step Index:
  // 0: Welcome Splash
  // 1: Tagline ("Your next winning trade starts with a photo")
  // 2: Feature 1 ("Just snap a pic of your chart")
  // 3: Feature 2 ("And get money making insights")
  // 4: Q1 Experience ("What's your trading experience?")
  // 5: Q2 Market ("Which market do you primarily trade in?")
  // 6: Q3 Style ("What's your trading style?")
  // 7: Q4 Detail ("How detailed should the analysis be?")
  // 8: Profitability Promise ("You are just few steps away from becoming a profitable trader")
  // 9: Personalizing Loader ("Personalizing Profit AI...")
  // 10: Transform Summary ("Transform your trading journey!")
  // 11: Sign In / Account Creation
  // 12: Enforced Payment Paywall ($29.99/yr 3-day trial & $7.99/wk)
  const [step, setStep] = useState<number>(0);

  // User selections
  const [experience, setExperience] = useState<string>("Beginner 🐥");
  const [market, setMarket] = useState<string>("Crypto 🔗");
  const [style, setStyle] = useState<string>("Long-Term Investing 👨‍🌾");
  const [detailLevel, setDetailLevel] = useState<string>("Advanced 🚀");

  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Paywall plan selection ('yearly' has 3-day trial)
  const [selectedPlan, setSelectedPlan] = useState<"yearly" | "weekly">("yearly");
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser && step === 11) {
        // Automatically move to paywall once signed in!
        setStep(12);
      }
    });
    return () => unsubscribe();
  }, [step]);

  // Handle personalizing loading animation timer (Step 9)
  useEffect(() => {
    if (step === 9) {
      const timer = setTimeout(() => {
        setStep(10);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const handleNext = () => {
    if (step === 10) {
      if (user) {
        setStep(12);
      } else {
        setStep(11);
      }
    } else {
      setStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (step > 0 && step !== 9 && step !== 10) {
      setStep((prev) => prev - 1);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError("");
    setAuthLoading(true);
    try {
      const res = await signInWithPopup(auth, googleProvider);
      setUser(res.user);
      setStep(12);
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
      setStep(12);
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
    <div className="flex flex-col min-h-screen bg-black text-white px-6 py-6 justify-between max-w-md mx-auto relative overflow-hidden font-sans select-none">
      {/* Top Header Navigation (for questions & detail steps) */}
      {step > 0 && step < 11 && step !== 9 && (
        <div className="flex items-center justify-between pt-2 pb-4">
          <button
            onClick={handleBack}
            className="w-9 h-9 rounded-full bg-[#161616] border border-gray-800 flex items-center justify-center text-gray-300 hover:text-white"
          >
            ←
          </button>
          
          {/* Progress bar line */}
          <div className="flex-1 mx-4 h-1 bg-[#1a1a1a] rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-300"
              style={{ width: `${(step / 11) * 100}%` }}
            />
          </div>
          
          <div className="w-9" />
        </div>
      )}

      {/* STEP 0: WELCOME SPLASH */}
      {step === 0 && (
        <div
          onClick={() => setStep(1)}
          className="flex-1 flex flex-col items-center justify-center text-center cursor-pointer animate-fadeIn py-12"
        >
          <div className="space-y-4">
            <h1 className="text-4xl font-extrabold tracking-tight">
              Welcome to <br />
              <span className="text-white">Profit AI!</span>
            </h1>
          </div>
          <p className="text-gray-500 text-xs mt-16 animate-pulse">Tap anywhere to continue</p>
        </div>
      )}

      {/* STEP 1: TAGLINE */}
      {step === 1 && (
        <div className="flex-1 flex flex-col justify-between my-6 animate-fadeIn">
          <div className="flex-1 flex flex-col justify-center items-start px-2 space-y-6">
            <div className="w-12 h-12 rounded-2xl bg-gray-900 border border-gray-800 flex items-center justify-center text-2xl">
              📈
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight leading-tight">
              Your next winning trade starts with a photo.
            </h1>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleNext}
              className="w-full bg-white text-black font-bold py-4 rounded-2xl text-lg hover:bg-gray-200 transition-colors shadow-lg"
            >
              Continue
            </button>
            <p className="text-center text-[10px] text-gray-600">
              Privacy Policy | Terms Of Use
            </p>
          </div>
        </div>
      )}

      {/* STEP 2: FEATURE 1 (JUST SNAP A PIC OF YOUR CHART) */}
      {step === 2 && (
        <div className="flex-1 flex flex-col justify-between my-4 animate-fadeIn">
          <div className="flex-1 flex flex-col justify-center items-center text-center space-y-4">
            <h2 className="text-2xl font-extrabold">Just snap a pic of your chart</h2>
            
            {/* Viewfinder Mockup */}
            <div className="relative w-full max-w-[260px] aspect-[9/16] bg-[#111111] rounded-[36px] border border-gray-800 flex flex-col items-center justify-center overflow-hidden shadow-2xl my-2">
              <div className="absolute inset-0 m-8 border-2 border-white/20 rounded-2xl pointer-events-none flex items-center justify-center">
                <div className="w-10 h-10 border-t-2 border-l-2 border-white absolute top-0 left-0 -translate-x-1 -translate-y-1 rounded-tl-lg" />
                <div className="w-10 h-10 border-t-2 border-r-2 border-white absolute top-0 right-0 translate-x-1 -translate-y-1 rounded-tr-lg" />
                <div className="w-10 h-10 border-b-2 border-l-2 border-white absolute bottom-0 left-0 -translate-x-1 translate-y-1 rounded-bl-lg" />
                <div className="w-10 h-10 border-b-2 border-r-2 border-white absolute bottom-0 right-0 translate-x-1 translate-y-1 rounded-br-lg" />
              </div>
              <div className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center opacity-80">
                <div className="w-10 h-10 rounded-full bg-white" />
              </div>
            </div>
          </div>

          <button
            onClick={handleNext}
            className="w-full bg-white text-black font-bold py-4 rounded-2xl text-lg hover:bg-gray-200 transition-colors shadow-lg"
          >
            Continue
          </button>
        </div>
      )}

      {/* STEP 3: FEATURE 2 (AND GET MONEY MAKING INSIGHTS) */}
      {step === 3 && (
        <div className="flex-1 flex flex-col justify-between my-4 animate-fadeIn">
          <div className="flex-1 flex flex-col justify-center items-center text-center space-y-4">
            <h2 className="text-2xl font-extrabold">And get money making insights</h2>
            
            {/* Insights Card Mockup */}
            <div className="w-full bg-[#111111] rounded-[32px] border border-gray-800 p-5 space-y-4 text-left shadow-2xl">
              <div className="flex items-center space-x-2 border-b border-gray-800/60 pb-3">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 font-bold">
                  ↗
                </div>
                <div>
                  <h3 className="font-bold text-sm">Profit AI</h3>
                  <p className="text-[10px] text-gray-400">Bitcoin Analysis</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-[#1a1a1a] p-3 rounded-xl">
                  <span className="text-gray-500 text-[10px]">Trend</span>
                  <p className="font-bold text-green-400">↗ Bullish</p>
                </div>
                <div className="bg-[#1a1a1a] p-3 rounded-xl">
                  <span className="text-gray-500 text-[10px]">Signal</span>
                  <p className="font-bold text-green-400">Buy Entry</p>
                </div>
                <div className="bg-[#1a1a1a] p-3 rounded-xl">
                  <span className="text-gray-500 text-[10px]">Risk Level</span>
                  <p className="font-bold text-yellow-400">Medium</p>
                </div>
                <div className="bg-[#1a1a1a] p-3 rounded-xl">
                  <span className="text-gray-500 text-[10px]">Volume</span>
                  <p className="font-bold text-purple-400">High</p>
                </div>
              </div>

              <div className="bg-[#1a1a1a] p-3 rounded-xl text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-400">Support Level</span>
                  <span className="font-bold">$84,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Resistance Level</span>
                  <span className="font-bold">$90,500</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleNext}
            className="w-full bg-white text-black font-bold py-4 rounded-2xl text-lg hover:bg-gray-200 transition-colors shadow-lg"
          >
            Continue
          </button>
        </div>
      )}

      {/* STEP 4: QUESTION 1 (TRADING EXPERIENCE) */}
      {step === 4 && (
        <div className="flex-1 flex flex-col justify-between my-4 animate-fadeIn">
          <div className="space-y-6">
            <h2 className="text-2xl font-extrabold text-left pt-2">
              What's your trading experience?
            </h2>

            <div className="space-y-3 pt-2">
              {[
                { label: "Beginner 🐥", val: "Beginner 🐥" },
                { label: "Intermediate 🧠", val: "Intermediate 🧠" },
                { label: "Expert 🚀", val: "Expert 🚀" },
              ].map((opt) => (
                <button
                  key={opt.val}
                  onClick={() => setExperience(opt.val)}
                  className={`w-full text-left p-4 rounded-2xl border text-sm font-semibold transition-all ${
                    experience === opt.val
                      ? "bg-[#1f1f1f] border-white text-white shadow-lg"
                      : "bg-[#111111] border-gray-800/80 text-gray-300 hover:border-gray-700"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleNext}
            className="w-full bg-white text-black font-bold py-4 rounded-2xl text-lg hover:bg-gray-200 transition-colors shadow-lg"
          >
            Continue
          </button>
        </div>
      )}

      {/* STEP 5: QUESTION 2 (MARKET) */}
      {step === 5 && (
        <div className="flex-1 flex flex-col justify-between my-4 animate-fadeIn">
          <div className="space-y-6">
            <h2 className="text-2xl font-extrabold text-left pt-2">
              Which market do you primarily trade in?
            </h2>

            <div className="space-y-3 pt-2">
              {[
                { label: "Stocks 🏦", val: "Stocks 🏦" },
                { label: "Crypto 🔗", val: "Crypto 🔗" },
                { label: "Forex 💵", val: "Forex 💵" },
                { label: "Futures ⏳", val: "Futures ⏳" },
                { label: "Other", val: "Other" },
              ].map((opt) => (
                <button
                  key={opt.val}
                  onClick={() => setMarket(opt.val)}
                  className={`w-full text-left p-4 rounded-2xl border text-sm font-semibold transition-all ${
                    market === opt.val
                      ? "bg-[#1f1f1f] border-white text-white shadow-lg"
                      : "bg-[#111111] border-gray-800/80 text-gray-300 hover:border-gray-700"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleNext}
            className="w-full bg-white text-black font-bold py-4 rounded-2xl text-lg hover:bg-gray-200 transition-colors shadow-lg"
          >
            Continue
          </button>
        </div>
      )}

      {/* STEP 6: QUESTION 3 (TRADING STYLE) */}
      {step === 6 && (
        <div className="flex-1 flex flex-col justify-between my-4 animate-fadeIn">
          <div className="space-y-6">
            <h2 className="text-2xl font-extrabold text-left pt-2">
              What's your trading style?
            </h2>

            <div className="space-y-3 pt-2">
              {[
                { label: "Scalping ⚡", sub: "Very short-term trades, minutes to hours", val: "Scalping ⚡" },
                { label: "Day Trading 🌅", sub: "Buying and selling within the same day", val: "Day Trading 🌅" },
                { label: "Swing Trading 🎯", sub: "Holding position for days or weeks", val: "Swing Trading 🎯" },
                { label: "Long-Term Investing 👨‍🌾", sub: "Holding position for months or years", val: "Long-Term Investing 👨‍🌾" },
                { label: "Not sure yet", sub: "", val: "Not sure yet" },
              ].map((opt) => (
                <button
                  key={opt.val}
                  onClick={() => setStyle(opt.val)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all ${
                    style === opt.val
                      ? "bg-[#1f1f1f] border-white text-white shadow-lg"
                      : "bg-[#111111] border-gray-800/80 text-gray-300 hover:border-gray-700"
                  }`}
                >
                  <p className="font-semibold text-sm">{opt.label}</p>
                  {opt.sub && <p className="text-[11px] text-gray-500 mt-0.5">{opt.sub}</p>}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleNext}
            className="w-full bg-white text-black font-bold py-4 rounded-2xl text-lg hover:bg-gray-200 transition-colors shadow-lg"
          >
            Continue
          </button>
        </div>
      )}

      {/* STEP 7: QUESTION 4 (ANALYSIS DEPTH) */}
      {step === 7 && (
        <div className="flex-1 flex flex-col justify-between my-4 animate-fadeIn">
          <div className="space-y-6">
            <h2 className="text-2xl font-extrabold text-left pt-2">
              How detailed should the analysis be?
            </h2>

            <div className="space-y-3 pt-2">
              {[
                { label: "Simple 💡", val: "Simple 💡" },
                { label: "Intermediate 📖", val: "Intermediate 📖" },
                { label: "Advanced 🚀", val: "Advanced 🚀" },
              ].map((opt) => (
                <button
                  key={opt.val}
                  onClick={() => setDetailLevel(opt.val)}
                  className={`w-full text-left p-4 rounded-2xl border text-sm font-semibold transition-all ${
                    detailLevel === opt.val
                      ? "bg-[#1f1f1f] border-white text-white shadow-lg"
                      : "bg-[#111111] border-gray-800/80 text-gray-300 hover:border-gray-700"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleNext}
            className="w-full bg-white text-black font-bold py-4 rounded-2xl text-lg hover:bg-gray-200 transition-colors shadow-lg"
          >
            Continue
          </button>
        </div>
      )}

      {/* STEP 8: PROFITABILITY PROMISE */}
      {step === 8 && (
        <div className="flex-1 flex flex-col justify-between my-4 animate-fadeIn">
          <div className="flex-1 flex flex-col justify-center items-center text-center space-y-6">
            <h2 className="text-2xl font-extrabold px-2">
              You are just few steps away from becoming a profitable trader
            </h2>

            {/* Profitability Graph Card */}
            <div className="w-full bg-[#111111] rounded-3xl p-5 border border-gray-800 shadow-2xl space-y-4 text-left">
              <h3 className="font-bold text-sm">Your Profitability</h3>
              
              <div className="flex space-x-4 text-[10px]">
                <div className="flex items-center space-x-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-gray-300 font-semibold">Profit AI</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-gray-400">Trading Gurus</span>
                </div>
              </div>

              {/* SVG Line Graph */}
              <div className="h-32 w-full relative pt-2">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 100 50" preserveAspectRatio="none">
                  {/* Grid Lines */}
                  <line x1="0" y1="25" x2="100" y2="25" stroke="#222" strokeDasharray="2" />
                  <line x1="0" y1="45" x2="100" y2="45" stroke="#222" />

                  {/* Red Line (Trading Gurus - wavy down) */}
                  <path
                    d="M 0 30 Q 25 10 50 35 T 100 40"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="2.5"
                  />

                  {/* Green Line (Profit AI - upward) */}
                  <path
                    d="M 0 35 Q 35 35 65 20 T 100 5"
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="3"
                  />
                  <circle cx="100" cy="5" r="3" fill="#22c55e" />
                </svg>
              </div>

              <p className="text-center text-[10px] text-gray-500 font-medium">
                80% of Profit AI users achieve long-term profitability.
              </p>
            </div>
          </div>

          <button
            onClick={handleNext}
            className="w-full bg-white text-black font-bold py-4 rounded-2xl text-lg hover:bg-gray-200 transition-colors shadow-lg"
          >
            Continue
          </button>
        </div>
      )}

      {/* STEP 9: PERSONALIZING LOADER */}
      {step === 9 && (
        <div className="flex-1 flex flex-col items-center justify-center text-center animate-fadeIn my-12">
          <div className="bg-[#111111] rounded-3xl p-8 border border-gray-800 flex flex-col items-center justify-center space-y-4 shadow-2xl">
            <div className="w-10 h-10 border-4 border-gray-700 border-t-white rounded-full animate-spin" />
            <p className="font-semibold text-sm text-gray-200 tracking-wide">
              Personalizing Profit AI <span className="animate-pulse">...</span>
            </p>
          </div>
        </div>
      )}

      {/* STEP 10: TRANSFORM SUMMARY */}
      {step === 10 && (
        <div className="flex-1 flex flex-col justify-between my-4 animate-fadeIn">
          <div className="flex-1 flex flex-col justify-center items-center text-center space-y-6">
            <h2 className="text-3xl font-extrabold px-2">
              Transform your trading journey!
            </h2>

            <div className="w-full bg-[#111111] rounded-3xl p-6 border border-gray-800 space-y-4 text-left shadow-2xl">
              <div className="flex items-center space-x-3 text-sm">
                <span className="text-xl">📸</span>
                <span className="font-semibold">Snap & Analyze Instantly</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <span className="text-xl">📈</span>
                <span className="font-semibold">Understand Key Market Trends</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <span className="text-xl">💡</span>
                <span className="font-semibold">Get Actionable Insights</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <span className="text-xl">⭐</span>
                <span className="font-semibold">Start Trading Like a Pro</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleNext}
            className="w-full bg-white text-black font-bold py-4 rounded-2xl text-lg hover:bg-gray-200 transition-colors shadow-lg"
          >
            Continue
          </button>
        </div>
      )}

      {/* STEP 11: SIGN IN / CREATE ACCOUNT */}
      {step === 11 && (
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

      {/* STEP 12: ENFORCED PAYMENT PAYWALL */}
      {step === 12 && (
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
              {/* Yearly Plan: $29.99/yr with 3-DAY FREE TRIAL ($2.49/mo) */}
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
                    <p className="text-green-400 text-xs font-semibold">3 Days Free, then $29.99/year</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-extrabold text-white">$2.49</span>
                    <span className="text-xs text-gray-400"> /mo</span>
                  </div>
                </div>

                <p className="text-gray-400 text-xs">
                  Billed annually ($29.99/yr) after 3 days. Save 70% compared to weekly.
                </p>
              </div>

              {/* Weekly Plan: $7.99/wk */}
              <div
                onClick={() => setSelectedPlan("weekly")}
                className={`rounded-3xl p-5 border-2 cursor-pointer transition-all ${
                  selectedPlan === "weekly"
                    ? "bg-gradient-to-b from-[#1c1c1c] to-[#121212] border-gray-400"
                    : "bg-[#111111] border-gray-800 hover:border-gray-700"
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <h3 className="font-bold text-lg text-white">Weekly Plan</h3>
                    <p className="text-gray-400 text-xs">Standard weekly access</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-extrabold text-white">$7.99</span>
                    <span className="text-xs text-gray-400"> /wk</span>
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
                <span>Real-time Support & Resistance Target Mapping</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-400 font-bold">⚡</span>
                <span>Complete Trade Game Plan & Risk Assessment</span>
              </div>
            </div>
          </div>

          <div className="pt-4">
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
                <span>Subscribe Weekly ($7.99)</span>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
