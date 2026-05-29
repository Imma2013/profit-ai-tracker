"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export default function AnalysisPage() {
  const params = useParams();
  const router = useRouter();
  
  const data = useQuery(
    api.analyses.getAnalysis,
    params?.id ? { id: params.id as Id<"analyses"> } : "skip"
  );

  const loading = data === undefined;

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-gray-600 border-t-white rounded-full animate-spin"></div>
        <p className="text-gray-400">Loading analysis...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center space-y-4">
        <p className="text-gray-400">Analysis not found.</p>
        <button onClick={() => router.push("/")} className="text-blue-500 underline">Go Home</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-black text-white px-5 py-8 max-w-md mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 mt-4">
        <h1 className="text-2xl font-bold">Profit AI</h1>
        <div className="flex space-x-3">
          <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center border border-gray-800">
            <span className="text-sm font-serif italic">i</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center border border-gray-800">
            <svg width="12" height="16" viewBox="0 0 12 16" fill="white" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 16L6 11L12 16V2C12 0.89543 11.1046 0 10 0H2C0.89543 0 0 0.89543 0 2V16Z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Thumbnail */}
      <div className="w-full h-24 bg-gradient-to-r from-gray-800 to-gray-700 rounded-2xl mb-6 flex items-end p-2 relative overflow-hidden">
        {data.imageUrl ? (
          <div className="absolute inset-0 bg-cover bg-center mix-blend-overlay" style={{ backgroundImage: `url(${data.imageUrl})`, opacity: 0.4 }}></div>
        ) : (
          <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=1000')] bg-cover bg-center mix-blend-overlay"></div>
        )}
        <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold z-10">
          Chart
        </div>
      </div>

      {/* Key Insights */}
      <div className="mb-6">
        <h2 className="text-gray-400 text-sm mb-3 ml-1 font-medium tracking-wide">Key Insights</h2>
        <div className="grid grid-cols-2 gap-3">
          {/* Trend */}
          <div className="bg-[#111111] rounded-2xl p-4 flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">
              <span className="text-gray-300 text-lg">{data.trend === "Bullish" ? "↗" : data.trend === "Bearish" ? "↘" : "→"}</span>
            </div>
            <div>
              <p className="text-xs text-gray-400">Trend</p>
              <p className="font-semibold text-sm">{data.trend || "Neutral"}</p>
            </div>
          </div>
          {/* Signal */}
          <div className="bg-[#111111] rounded-2xl p-4 flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">
              <span className="text-gray-300 text-lg">⚠️</span>
            </div>
            <div>
              <p className="text-xs text-gray-400">Signal</p>
              <p className="font-semibold text-sm">{data.signal || "Hold"}</p>
            </div>
          </div>
          {/* Risk Level */}
          <div className="bg-[#111111] rounded-2xl p-4 flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">
              <div className="flex items-end space-x-0.5 h-4">
                <div className="w-1 h-2 bg-gray-400 rounded-sm"></div>
                <div className="w-1 h-3 bg-gray-400 rounded-sm"></div>
                <div className="w-1 h-4 bg-gray-400 rounded-sm"></div>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-400">Risk Level</p>
              <p className="font-semibold text-sm">{data.riskLevel || "Medium"}</p>
            </div>
          </div>
          {/* Volume */}
          <div className="bg-[#111111] rounded-2xl p-4 flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">
              <span className="text-gray-300 text-lg">~</span>
            </div>
            <div>
              <p className="text-xs text-gray-400">Volume</p>
              <p className="font-semibold text-sm">{data.volume || "Unknown"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Support/Resistance */}
      <div className="mb-6">
        <h2 className="text-gray-400 text-sm mb-3 ml-1 font-medium tracking-wide">Support/Resistance</h2>
        <div className="bg-[#111111] rounded-3xl p-4 space-y-3">
          <div className="flex justify-between items-center bg-[#1a1a1a] rounded-2xl px-4 py-3">
            <span className="text-sm text-gray-400">Support Level</span>
            <span className="font-semibold text-sm">{data.supportLevel || "N/A"}</span>
          </div>
          <div className="flex justify-between items-center bg-[#1a1a1a] rounded-2xl px-4 py-3">
            <span className="text-sm text-gray-400">Resistance Level</span>
            <span className="font-semibold text-sm">{data.resistanceLevel || "N/A"}</span>
          </div>
        </div>
      </div>

      {/* Game Plan */}
      <div className="mb-20">
        <h2 className="text-gray-400 text-sm mb-3 ml-1 font-medium tracking-wide">Game Plan</h2>
        <div className="bg-[#111111] rounded-3xl p-5 space-y-4">
          <div>
            <h3 className="text-sm font-semibold mb-1">Overview</h3>
            <p className="text-sm text-gray-400">{data.overview || "No overview available for this chart."}</p>
          </div>
          <div className="space-y-2">
            {[
              "Entry & Exit Strategy",
              "Risk & Reward Assessment",
              "Trade Duration & Monitoring",
              "Technical Indicators",
              "Recognized Patterns"
            ].map((item, i) => (
              <div key={i} className="flex justify-between items-center py-3 border-b border-gray-800 last:border-0 opacity-50">
                <span className="text-sm">{item}</span>
                <span className="text-gray-500">⌄</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Bar (Mock) */}
      <div className="fixed bottom-0 left-0 w-full bg-black/80 backdrop-blur-md pb-8 pt-4 px-8 border-t border-gray-900 flex justify-around">
        <button onClick={() => router.push("/")} className="text-gray-400 hover:text-white">🏠</button>
        <div className="text-white relative">
          <button onClick={() => router.push("/")} className="w-12 h-12 absolute -top-4 -left-3 bg-white rounded-2xl flex items-center justify-center shadow-lg">
             <span className="text-black text-xl">📷</span>
          </button>
        </div>
        <button onClick={() => router.push("/login")} className="text-gray-400 hover:text-white">👤</button>
      </div>
    </div>
  );
}
