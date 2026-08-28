"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function PaywallPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<"yearly" | "monthly">("yearly");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.replace("/onboarding");
        return;
      }

      setUser(currentUser);

      try {
        const token = await currentUser.getIdToken();
        const response = await fetch("/api/stripe/entitlement", {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });

        if (response.ok) {
          const data = await response.json();
          if (data?.entitled === true) {
            router.replace("/");
            return;
          }
        }
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleSubscribe = async () => {
    if (!user) return;

    setCheckoutLoading(true);
    setError("");

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planType: selectedPlan,
          userId: user.uid,
          userEmail: user.email || undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.url) {
        throw new Error(data.error || "Unable to start checkout");
      }

      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to start checkout");
      setCheckoutLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white text-slate-900 px-6 py-6 max-w-md mx-auto font-sans">
      <div className="space-y-6 my-4">
        <div className="text-center space-y-2 pt-2">
          <div className="inline-block px-3 py-1 bg-emerald-100 border border-emerald-300 rounded-full text-emerald-800 text-xs font-black uppercase tracking-wider mb-1">
            Unlock Full Access
          </div>
          <h1 className="text-4xl font-black text-slate-900">Choose Your Plan</h1>
          <p className="text-slate-500 text-sm font-semibold">Cancel anytime. No commitment.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-3 rounded-xl text-center font-bold">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div
            onClick={() => setSelectedPlan("yearly")}
            className={`relative rounded-3xl p-5 border-2 cursor-pointer transition-all ${
              selectedPlan === "yearly"
                ? "bg-slate-900 border-slate-900 text-white shadow-2xl scale-[1.01]"
                : "bg-white border-slate-200 text-slate-900"
            }`}
          >
            <div className="absolute -top-3.5 right-4 bg-emerald-500 text-white text-[11px] font-black px-3.5 py-1 rounded-full uppercase tracking-wider shadow-md">
              ★ 3-DAY FREE TRIAL
            </div>
            <div className="flex justify-between items-start mb-2 pt-1">
              <div>
                <h2 className="font-black text-2xl">Yearly Plan</h2>
                <p className="text-sm font-bold text-emerald-400">3 Days Free, then $29.99/year</p>
              </div>
              <div className="text-right">
                <span className="text-4xl font-black">$2.49</span>
                <span className="text-sm font-bold text-slate-400"> /mo</span>
              </div>
            </div>
            <p className="text-sm font-medium text-slate-300">Billed annually ($29.99/yr) after 3 days. Save 75% compared to monthly.</p>
          </div>

          <div
            onClick={() => setSelectedPlan("monthly")}
            className={`rounded-3xl p-5 border-2 cursor-pointer transition-all ${
              selectedPlan === "monthly"
                ? "bg-slate-900 border-slate-900 text-white shadow-2xl scale-[1.01]"
                : "bg-white border-slate-200 text-slate-900"
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h2 className="font-black text-2xl">Monthly Plan</h2>
                <p className={`text-sm font-medium ${selectedPlan === "monthly" ? "text-slate-300" : "text-slate-500"}`}>Standard monthly access</p>
              </div>
              <div className="text-right">
                <span className="text-4xl font-black">$9.99</span>
                <span className={`text-sm font-bold ${selectedPlan === "monthly" ? "text-slate-400" : "text-slate-500"}`}> /mo</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4 text-sm font-bold text-slate-700">
          <div className="flex items-start space-x-3"><span className="text-emerald-600 text-lg">✓</span><span>Unlimited AI Chart Analyses & Signals</span></div>
          <div className="flex items-start space-x-3"><span className="text-emerald-600 text-lg">✓</span><span>Real-time Support & Resistance Target Mapping</span></div>
          <div className="flex items-start space-x-3"><span className="text-emerald-600 text-lg">✓</span><span>Complete Trade Game Plan & Risk Assessment</span></div>
        </div>

        <button
          onClick={handleSubscribe}
          disabled={checkoutLoading}
          className="w-full bg-emerald-600 text-white font-black py-4 rounded-2xl text-lg hover:bg-emerald-700 transition-all shadow-xl disabled:opacity-60"
        >
          {checkoutLoading
            ? "Redirecting to Checkout..."
            : selectedPlan === "yearly"
              ? "START 3-DAY FREE TRIAL"
              : "Subscribe Monthly ($9.99)"}
        </button>
      </div>
    </div>
  );
}
