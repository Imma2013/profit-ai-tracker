"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

const AccordionItem = ({ title, content }: { title: string; content?: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="py-3.5 border-b border-slate-100 last:border-0">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full flex justify-between items-center text-left hover:text-slate-900 transition-colors font-bold text-slate-800"
      >
        <span className="text-sm">{title}</span>
        <span 
          className="text-slate-400 font-extrabold transition-transform duration-200 text-base" 
          style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          ⌄
        </span>
      </button>
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-96 mt-3 opacity-100" : "max-h-0 opacity-0"}`}
      >
        <p className="text-sm text-slate-600 leading-relaxed font-medium bg-slate-50 p-3 rounded-xl border border-slate-200">
          {content || "No data available."}
        </p>
      </div>
    </div>
  );
};

export default function AnalysisDetail() {
  const params = useParams();
  const router = useRouter();
  
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user: any) => {
      setUserId(user?.uid || null);
    });
    return () => unsubscribe();
  }, []);

  const data = useQuery(
    api.analyses.getAnalysis,
    params?.id ? { id: params.id as Id<"analyses"> } : "skip"
  );

  const loading = data === undefined;

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-slate-900 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
        <p className="text-slate-500 font-extrabold text-sm">Loading analysis...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-white text-slate-900 flex flex-col items-center justify-center space-y-4">
        <p className="text-slate-500 font-bold">Analysis not found.</p>
        <button onClick={() => router.push("/")} className="text-slate-900 underline font-extrabold">Go Home</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 px-5 py-8 pb-28 max-w-md mx-auto font-sans">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 mt-4">
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => router.push("/")}
            className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 font-black shadow-sm"
          >
            ←
          </button>
          <h1 className="text-2xl font-black text-slate-900">Analysis Breakdown</h1>
        </div>
      </div>

      {/* Thumbnail Card */}
      <div className="w-full h-40 bg-slate-900 rounded-3xl mb-6 flex items-end p-3 relative overflow-hidden shadow-lg border-2 border-slate-200">
        {data.imageUrl ? (
          <img src={data.imageUrl} alt="Chart" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-slate-400 font-bold text-sm">No Chart Image</div>
        )}
        <div className="bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-black text-white z-10 border border-slate-700">
          Chart Scan
        </div>
      </div>

      {/* Key Insights */}
      <div className="mb-6">
        <h2 className="text-slate-500 text-xs font-black uppercase tracking-wider mb-3 ml-1">Key Insights</h2>
        <div className="grid grid-cols-2 gap-3">
          {/* Trend */}
          <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 flex items-center space-x-3 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-lg">
              <span className="text-slate-900">{data.trend === "Bullish" ? "↗" : data.trend === "Bearish" ? "↘" : "→"}</span>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Trend</p>
              <p className={`font-black text-base ${data.trend === "Bullish" ? "text-emerald-600" : data.trend === "Bearish" ? "text-red-600" : "text-slate-700"}`}>
                {data.trend || "Neutral"}
              </p>
            </div>
          </div>

          {/* Signal */}
          <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 flex items-center space-x-3 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-lg">
              <span>🎯</span>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Signal</p>
              <p className="font-black text-base text-emerald-600">{data.signal || "Buy"}</p>
            </div>
          </div>

          {/* Risk Level */}
          <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 flex items-center space-x-3 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black">
              <div className="flex items-end space-x-0.5 h-4">
                <div className="w-1.5 h-2 bg-amber-500 rounded-sm" />
                <div className="w-1.5 h-3 bg-amber-500 rounded-sm" />
                <div className="w-1.5 h-4 bg-slate-300 rounded-sm" />
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Risk Level</p>
              <p className="font-black text-base text-amber-600">{data.riskLevel || "Medium"}</p>
            </div>
          </div>

          {/* Volume */}
          <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 flex items-center space-x-3 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-lg">
              <span>📊</span>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Volume</p>
              <p className="font-black text-base text-purple-600">{data.volume || "Unknown"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Support/Resistance */}
      <div className="mb-6">
        <h2 className="text-slate-500 text-xs font-black uppercase tracking-wider mb-3 ml-1">Support / Resistance</h2>
        <div className="bg-white border-2 border-slate-200 rounded-3xl p-4 space-y-3 shadow-sm">
          <div className="flex justify-between items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3">
            <span className="text-xs font-bold text-slate-500">Support Level</span>
            <span className="font-black text-base text-emerald-600">{data.supportLevel || "N/A"}</span>
          </div>
          <div className="flex justify-between items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3">
            <span className="text-xs font-bold text-slate-500">Resistance Level</span>
            <span className="font-black text-base text-purple-600">{data.resistanceLevel || "N/A"}</span>
          </div>
        </div>
      </div>

      {/* Game Plan */}
      <div className="mb-20">
        <h2 className="text-slate-500 text-xs font-black uppercase tracking-wider mb-3 ml-1">Game Plan</h2>
        <div className="bg-white border-2 border-slate-200 rounded-3xl p-5 space-y-4 shadow-sm">
          <div>
            <h3 className="text-sm font-black text-slate-900 mb-1">Overview</h3>
            <p className="text-sm text-slate-600 font-medium leading-relaxed">{data.overview || "No overview available for this chart."}</p>
          </div>
          <div className="space-y-1 mt-2">
            <AccordionItem title="Entry & Exit Strategy" content={data.entryExitStrategy} />
            <AccordionItem title="Risk & Reward Assessment" content={data.riskRewardAssessment} />
            <AccordionItem title="Trade Duration & Monitoring" content={data.tradeDuration} />
            <AccordionItem title="Technical Indicators" content={data.technicalIndicators} />
            <AccordionItem title="Recognized Patterns" content={data.recognizedPatterns} />
          </div>
        </div>
      </div>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-xl pb-8 pt-4 px-8 border-t border-slate-200 flex justify-around z-50">
        <button onClick={() => router.push("/")} className="text-slate-900 font-bold text-xl">🏠</button>
        <button onClick={() => router.push("/")} className="w-12 h-12 relative -top-3 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg font-bold">
           ➕
        </button>
        <button onClick={() => router.push(userId ? "/profile" : "/onboarding")} className="text-slate-400 font-bold text-xl hover:text-slate-900">👤</button>
      </div>
    </div>
  );
}
