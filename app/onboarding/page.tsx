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
  // 12: Enforced Payment Paywall ($29.99/yr 3-day trial & $9.99/mo)
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
  const [selectedPlan, setSelectedPlan] = useState<"yearly" | "monthly">("yearly");
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser && step === 11) {
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
    <div className="flex flex-col min-h-screen bg-white text-slate-900 px-6 py-6 justify-between max-w-md mx-auto relative overflow-hidden font-sans select-none">
      {/* Top Header Navigation (for questions & detail steps) */}
      {step > 0 && step < 11 && step !== 9 && (
        <div className="flex items-center justify-between pt-2 pb-4">
          <button
            onClick={handleBack}
            className="w-10 h-10 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-700 hover:bg-slate-200 font-bold transition-colors"
          >
            ←
          </button>
          
          {/* Progress bar line */}
          <div className="flex-1 mx-4 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
            <div
              className="h-full bg-slate-900 transition-all duration-300 rounded-full"
              style={{ width: `${(step / 11) * 100}%` }}
            />
          </div>
          
          <div className="w-10" />
        </div>
      )}

      {/* STEP 0: WELCOME SPLASH */}
      {step === 0 && (
        <div
          onClick={() => setStep(1)}
          className="flex-1 flex flex-col items-center justify-center text-center cursor-pointer animate-fadeIn py-12"
        >
          <div className="space-y-4">
            <div className="w-20 h-20 rounded-3xl bg-slate-900 text-white flex items-center justify-center text-3xl mx-auto shadow-2xl">
              📈
            </div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900 leading-tight">
              Welcome to <br />
              <span className="text-emerald-600">Profit AI</span>
            </h1>
          </div>
          <p className="text-slate-400 text-xs font-semibold mt-16 animate-pulse uppercase tracking-widest">
            Tap anywhere to continue
          </p>
        </div>
      )}

      {/* STEP 1: TAGLINE */}
      {step === 1 && (
        <div className="flex-1 flex flex-col justify-between my-6 animate-fadeIn">
          <div className="flex-1 flex flex-col justify-center items-start px-2 space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center text-3xl shadow-sm">
              📈
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 leading-tight">
              Your next winning trade starts with a photo.
            </h1>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleNext}
              className="w-full bg-slate-900 text-white font-extrabold py-4 rounded-2xl text-lg hover:bg-black transition-all shadow-xl hover:scale-[1.01]"
            >
              Continue
            </button>
            <p className="text-center text-[11px] text-slate-400 font-medium">
              Privacy Policy | Terms Of Use
            </p>
          </div>
        </div>
      )}

      {/* STEP 2: FEATURE 1 (JUST SNAP A PIC OF YOUR CHART) - HIGH VISIBILITY BOLD VIEWFINDER */}
      {step === 2 && (
        <div className="flex-1 flex flex-col justify-between my-4 animate-fadeIn">
          <div className="flex-1 flex flex-col justify-center items-center text-center space-y-4">
            <h2 className="text-2xl font-black text-slate-900">Just snap a pic of your chart</h2>
            
            {/* High-Contrast Bold Viewfinder Mockup */}
            <div className="relative w-full max-w-[270px] aspect-[9/16] bg-slate-950 rounded-[40px] border-4 border-slate-900 flex flex-col items-center justify-center overflow-hidden shadow-2xl my-2">
              {/* Bold Target Brackets */}
              <div className="absolute inset-0 m-8 border-2 border-white/20 rounded-2xl pointer-events-none flex items-center justify-center">
                <div className="w-12 h-12 border-t-4 border-l-4 border-emerald-400 absolute top-0 left-0 -translate-x-1.5 -translate-y-1.5 rounded-tl-xl shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                <div className="w-12 h-12 border-t-4 border-r-4 border-emerald-400 absolute top-0 right-0 translate-x-1.5 -translate-y-1.5 rounded-tr-xl shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                <div className="w-12 h-12 border-b-4 border-l-4 border-emerald-400 absolute bottom-0 left-0 -translate-x-1.5 translate-y-1.5 rounded-bl-xl shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                <div className="w-12 h-12 border-b-4 border-r-4 border-emerald-400 absolute bottom-0 right-0 translate-x-1.5 translate-y-1.5 rounded-br-xl shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
              </div>
              
              {/* Capture Button */}
              <div className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center shadow-lg bg-white/10">
                <div className="w-12 h-12 rounded-full bg-white shadow-md" />
              </div>
            </div>
          </div>

          <button
            onClick={handleNext}
            className="w-full bg-slate-900 text-white font-extrabold py-4 rounded-2xl text-lg hover:bg-black transition-all shadow-xl hover:scale-[1.01]"
          >
            Continue
          </button>
        </div>
      )}

      {/* STEP 3: FEATURE 2 (AND GET MONEY MAKING INSIGHTS) - HIGH VISIBILITY WHITE CARD */}
      {step === 3 && (
        <div className="flex-1 flex flex-col justify-between my-4 animate-fadeIn">
          <div className="flex-1 flex flex-col justify-center items-center text-center space-y-4">
            <h2 className="text-2xl font-black text-slate-900">And get money making insights</h2>
            
            {/* Bold Insights Card Mockup */}
            <div className="w-full bg-white rounded-[32px] border-2 border-slate-200 p-5 space-y-4 text-left shadow-2xl">
              <div className="flex items-center space-x-3 border-b border-slate-100 pb-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-black text-lg shadow-md">
                  ↗
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900">Profit AI Breakdown</h3>
                  <p className="text-xs text-slate-500 font-semibold">Bitcoin Chart Analysis</p>
                </div>
              </div>

              {/* Bold Metrics Grid */}
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl">
                  <span className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">Trend</span>
                  <p className="font-black text-emerald-600 text-base mt-0.5">↗ Bullish</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl">
                  <span className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">Signal</span>
                  <p className="font-black text-emerald-600 text-base mt-0.5">BUY ENTRY</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl">
                  <span className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">Risk Level</span>
                  <p className="font-black text-amber-600 text-base mt-0.5">Medium</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl">
                  <span className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">Volume</span>
                  <p className="font-black text-purple-600 text-base mt-0.5">High</p>
                </div>
              </div>

              {/* Support & Resistance */}
              <div className="bg-slate-900 text-white p-4 rounded-2xl text-xs space-y-2 shadow-md">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-semibold">Support Level</span>
                  <span className="font-black text-emerald-400 text-sm">$84,000</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-semibold">Resistance Level</span>
                  <span className="font-black text-purple-300 text-sm">$90,500</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleNext}
            className="w-full bg-slate-900 text-white font-extrabold py-4 rounded-2xl text-lg hover:bg-black transition-all shadow-xl hover:scale-[1.01]"
          >
            Continue
          </button>
        </div>
      )}

      {/* STEP 4: QUESTION 1 (TRADING EXPERIENCE) */}
      {step === 4 && (
        <div className="flex-1 flex flex-col justify-between my-4 animate-fadeIn">
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-slate-900 text-left pt-2">
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
                  className={`w-full text-left p-4 rounded-2xl border-2 text-base font-extrabold transition-all ${
                    experience === opt.val
                      ? "bg-slate-900 border-slate-900 text-white shadow-xl scale-[1.01]"
                      : "bg-white border-slate-200 text-slate-700 hover:border-slate-400"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleNext}
            className="w-full bg-slate-900 text-white font-extrabold py-4 rounded-2xl text-lg hover:bg-black transition-all shadow-xl hover:scale-[1.01]"
          >
            Continue
          </button>
        </div>
      )}

      {/* STEP 5: QUESTION 2 (MARKET) */}
      {step === 5 && (
        <div className="flex-1 flex flex-col justify-between my-4 animate-fadeIn">
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-slate-900 text-left pt-2">
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
                  className={`w-full text-left p-4 rounded-2xl border-2 text-base font-extrabold transition-all ${
                    market === opt.val
                      ? "bg-slate-900 border-slate-900 text-white shadow-xl scale-[1.01]"
                      : "bg-white border-slate-200 text-slate-700 hover:border-slate-400"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleNext}
            className="w-full bg-slate-900 text-white font-extrabold py-4 rounded-2xl text-lg hover:bg-black transition-all shadow-xl hover:scale-[1.01]"
          >
            Continue
          </button>
        </div>
      )}

      {/* STEP 6: QUESTION 3 (TRADING STYLE) */}
      {step === 6 && (
        <div className="flex-1 flex flex-col justify-between my-4 animate-fadeIn">
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-slate-900 text-left pt-2">
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
                  className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
                    style === opt.val
                      ? "bg-slate-900 border-slate-900 text-white shadow-xl scale-[1.01]"
                      : "bg-white border-slate-200 text-slate-700 hover:border-slate-400"
                  }`}
                >
                  <p className="font-extrabold text-base">{opt.label}</p>
                  {opt.sub && (
                    <p className={`text-xs mt-0.5 font-medium ${style === opt.val ? "text-slate-300" : "text-slate-500"}`}>
                      {opt.sub}
                    </p>
                  )}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleNext}
            className="w-full bg-slate-900 text-white font-extrabold py-4 rounded-2xl text-lg hover:bg-black transition-all shadow-xl hover:scale-[1.01]"
          >
            Continue
          </button>
        </div>
      )}

      {/* STEP 7: QUESTION 4 (ANALYSIS DEPTH) */}
      {step === 7 && (
        <div className="flex-1 flex flex-col justify-between my-4 animate-fadeIn">
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-slate-900 text-left pt-2">
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
                  className={`w-full text-left p-4 rounded-2xl border-2 text-base font-extrabold transition-all ${
                    detailLevel === opt.val
                      ? "bg-slate-900 border-slate-900 text-white shadow-xl scale-[1.01]"
                      : "bg-white border-slate-200 text-slate-700 hover:border-slate-400"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleNext}
            className="w-full bg-slate-900 text-white font-extrabold py-4 rounded-2xl text-lg hover:bg-black transition-all shadow-xl hover:scale-[1.01]"
          >
            Continue
          </button>
        </div>
      )}

      {/* STEP 8: PROFITABILITY PROMISE - BOLD HIGH-VISIBILITY GRAPH THAT POPS OUT */}
      {step === 8 && (
        <div className="flex-1 flex flex-col justify-between my-4 animate-fadeIn">
          <div className="flex-1 flex flex-col justify-center items-center text-center space-y-6">
            <h2 className="text-2xl font-black text-slate-900 px-2 leading-snug">
              You are just few steps away from becoming a profitable trader
            </h2>

            {/* Bold High-Visibility Profitability Graph Card */}
            <div className="w-full bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-2xl space-y-4 text-left">
              <h3 className="font-black text-base text-slate-900">Your Profitability</h3>
              
              <div className="flex space-x-5 text-xs font-bold">
                <div className="flex items-center space-x-2">
                  <div className="w-3.5 h-3.5 rounded-full bg-emerald-600 shadow-sm" />
                  <span className="text-slate-900 font-extrabold text-sm">Profit AI</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3.5 h-3.5 rounded-full bg-red-600 shadow-sm" />
                  <span className="text-slate-500 font-bold text-sm">Trading Gurus</span>
                </div>
              </div>

              {/* Bold SVG Line Graph with strokeWidth 5 & 4 */}
              <div className="h-36 w-full relative pt-2">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 100 50" preserveAspectRatio="none">
                  {/* Grid Lines */}
                  <line x1="0" y1="25" x2="100" y2="25" stroke="#e2e8f0" strokeDasharray="3" strokeWidth="1.5" />
                  <line x1="0" y1="45" x2="100" y2="45" stroke="#cbd5e1" strokeWidth="2" />

                  {/* Red Line (Trading Gurus - wavy down) - BOLDER strokeWidth 4 */}
                  <path
                    d="M 0 28 Q 25 10 50 35 T 100 42"
                    fill="none"
                    stroke="#dc2626"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />

                  {/* Green Line (Profit AI - upward) - THICK BOLD strokeWidth 5 */}
                  <path
                    d="M 0 38 Q 35 38 65 20 T 100 4"
                    fill="none"
                    stroke="#16a34a"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                  <circle cx="100" cy="4" r="5" fill="#16a34a" className="shadow-lg" />
                </svg>
              </div>

              <p className="text-center text-xs text-slate-600 font-bold bg-slate-50 py-2.5 px-3 rounded-xl border border-slate-200">
                80% of Profit AI users achieve long-term profitability.
              </p>
            </div>
          </div>

          <button
            onClick={handleNext}
            className="w-full bg-slate-900 text-white font-extrabold py-4 rounded-2xl text-lg hover:bg-black transition-all shadow-xl hover:scale-[1.01]"
          >
            Continue
          </button>
        </div>
      )}

      {/* STEP 9: PERSONALIZING LOADER */}
      {step === 9 && (
        <div className="flex-1 flex flex-col items-center justify-center text-center animate-fadeIn my-12">
          <div className="bg-white rounded-3xl p-10 border-2 border-slate-200 flex flex-col items-center justify-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
            <p className="font-extrabold text-base text-slate-900 tracking-wide">
              Personalizing Profit AI <span className="animate-pulse">...</span>
            </p>
          </div>
        </div>
      )}

      {/* STEP 10: TRANSFORM SUMMARY */}
      {step === 10 && (
        <div className="flex-1 flex flex-col justify-between my-4 animate-fadeIn">
          <div className="flex-1 flex flex-col justify-center items-center text-center space-y-6">
            <h2 className="text-3xl font-black text-slate-900 px-2 leading-tight">
              Transform your trading journey!
            </h2>

            <div className="w-full bg-white rounded-3xl p-6 border-2 border-slate-200 space-y-4 text-left shadow-2xl">
              <div className="flex items-center space-x-3 text-base">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-xl flex-shrink-0">
                  📸
                </div>
                <span className="font-extrabold text-slate-900">Snap & Analyze Instantly</span>
              </div>
              <div className="flex items-center space-x-3 text-base">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 border border-blue-300 flex items-center justify-center text-xl flex-shrink-0">
                  📈
                </div>
                <span className="font-extrabold text-slate-900">Understand Key Market Trends</span>
              </div>
              <div className="flex items-center space-x-3 text-base">
                <div className="w-10 h-10 rounded-2xl bg-purple-100 border border-purple-300 flex items-center justify-center text-xl flex-shrink-0">
                  💡
                </div>
                <span className="font-extrabold text-slate-900">Get Actionable Insights</span>
              </div>
              <div className="flex items-center space-x-3 text-base">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-xl flex-shrink-0">
                  ⭐
                </div>
                <span className="font-extrabold text-slate-900">Start Trading Like a Pro</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleNext}
            className="w-full bg-slate-900 text-white font-extrabold py-4 rounded-2xl text-lg hover:bg-black transition-all shadow-xl hover:scale-[1.01]"
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
              <h2 className="text-3xl font-black text-slate-900">Create your Account</h2>
              <p className="text-slate-500 text-sm font-medium">
                Sign in first to save your chart analyses & start your free trial
              </p>
            </div>

            {authError && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-3 rounded-xl text-center font-bold">
                {authError}
              </div>
            )}

            <button
              onClick={handleGoogleSignIn}
              disabled={authLoading}
              className="w-full bg-slate-900 text-white font-bold rounded-2xl px-4 py-4 flex items-center justify-center space-x-3 hover:bg-black transition-colors shadow-lg"
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
              <div className="h-px bg-slate-200 flex-1" />
              <span className="text-slate-400 text-xs font-bold uppercase">Or with email</span>
              <div className="h-px bg-slate-200 flex-1" />
            </div>

            <form onSubmit={handleEmailAuth} className="space-y-3">
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-4 py-3.5 text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:border-slate-900"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-4 py-3.5 text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:border-slate-900"
                required
              />
              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-slate-900 text-white font-extrabold rounded-2xl px-4 py-4 hover:bg-black transition-colors shadow-lg"
              >
                {authLoading ? "Processing..." : isSignUp ? "Sign Up & Continue" : "Sign In & Continue"}
              </button>
            </form>

            <div className="text-center pt-2">
              <p className="text-slate-500 text-xs font-semibold">
                {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                <button
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-slate-900 font-extrabold hover:underline focus:outline-none"
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
              <div className="inline-block px-3 py-1 bg-emerald-100 border border-emerald-300 rounded-full text-emerald-800 text-xs font-black uppercase tracking-wider mb-1">
                Unlock Full Access
              </div>
              <h2 className="text-3xl font-black text-slate-900">Choose Your Plan</h2>
              <p className="text-slate-500 text-xs font-semibold">
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
                    ? "bg-slate-900 border-slate-900 text-white shadow-2xl scale-[1.01]"
                    : "bg-white border-slate-200 text-slate-900 hover:border-slate-400"
                }`}
              >
                {/* 3-Day Free Trial Badge */}
                <div className="absolute -top-3.5 right-4 bg-emerald-500 text-white text-[11px] font-black px-3.5 py-1 rounded-full uppercase tracking-wider shadow-md">
                  ★ 3-DAY FREE TRIAL
                </div>

                <div className="flex justify-between items-start mb-2 pt-1">
                  <div>
                    <h3 className={`font-black text-lg ${selectedPlan === "yearly" ? "text-white" : "text-slate-900"}`}>
                      Yearly Plan
                    </h3>
                    <p className={`text-xs font-bold ${selectedPlan === "yearly" ? "text-emerald-400" : "text-emerald-600"}`}>
                      3 Days Free, then $29.99/year
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`text-2xl font-black ${selectedPlan === "yearly" ? "text-white" : "text-slate-900"}`}>
                      $2.49
                    </span>
                    <span className={`text-xs font-bold ${selectedPlan === "yearly" ? "text-slate-400" : "text-slate-500"}`}>
                      {" "}/mo
                    </span>
                  </div>
                </div>

                <p className={`text-xs font-medium ${selectedPlan === "yearly" ? "text-slate-300" : "text-slate-500"}`}>
                  Billed annually ($29.99/yr) after 3 days. Save 75% compared to monthly.
                </p>
              </div>

              {/* Monthly Plan: $9.99/mo */}
              <div
                onClick={() => setSelectedPlan("monthly")}
                className={`rounded-3xl p-5 border-2 cursor-pointer transition-all ${
                  selectedPlan === "monthly"
                    ? "bg-slate-900 border-slate-900 text-white shadow-2xl scale-[1.01]"
                    : "bg-white border-slate-200 text-slate-900 hover:border-slate-400"
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <h3 className={`font-black text-lg ${selectedPlan === "monthly" ? "text-white" : "text-slate-900"}`}>
                      Monthly Plan
                    </h3>
                    <p className={`text-xs font-medium ${selectedPlan === "monthly" ? "text-slate-300" : "text-slate-500"}`}>
                      Standard monthly access
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`text-2xl font-black ${selectedPlan === "monthly" ? "text-white" : "text-slate-900"}`}>
                      $9.99
                    </span>
                    <span className={`text-xs font-bold ${selectedPlan === "monthly" ? "text-slate-400" : "text-slate-500"}`}>
                      {" "}/mo
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature Highlights */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2 text-xs font-bold text-slate-700">
              <div className="flex items-center space-x-2">
                <span className="text-emerald-600 font-extrabold text-sm">✓</span>
                <span>Unlimited AI Chart Analyses & Signals</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-emerald-600 font-extrabold text-sm">✓</span>
                <span>Real-time Support & Resistance Target Mapping</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-emerald-600 font-extrabold text-sm">✓</span>
                <span>Complete Trade Game Plan & Risk Assessment</span>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={handleSubscribe}
              disabled={checkoutLoading}
              className="w-full bg-emerald-600 text-white font-black py-4 rounded-2xl text-lg hover:bg-emerald-700 transition-all shadow-xl hover:scale-[1.01] flex items-center justify-center space-x-2"
            >
              {checkoutLoading ? (
                <span>Redirecting to Checkout...</span>
              ) : selectedPlan === "yearly" ? (
                <span>START 3-DAY FREE TRIAL</span>
              ) : (
                <span>Subscribe Monthly ($9.99)</span>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
