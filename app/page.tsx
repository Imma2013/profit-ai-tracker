"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function Home() {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [userId, setUserId] = useState<string | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user: any) => {
      setUserId(user?.uid || "anonymous");
    });
    return () => unsubscribe();
  }, []);

  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
  const saveAnalysis = useMutation(api.analyses.saveAnalysis);
  const analyses = useQuery(api.analyses.getUserAnalyses, userId ? { userId } : "skip");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64Data = reader.result as string;

        // 1. Call Gemini API
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: base64Data }),
        });
        
        if (!response.ok) {
          throw new Error("Failed to analyze image");
        }
        
        const analysisData = await response.json();

        // 2. Upload image to Convex Storage
        let storageId = undefined;
        try {
          const postUrl = await generateUploadUrl();
          const result = await fetch(postUrl, {
            method: "POST",
            headers: { "Content-Type": file.type },
            body: file,
          });
          const { storageId: returnedStorageId } = await result.json();
          storageId = returnedStorageId;
        } catch (uploadError) {
          console.error("Convex storage upload failed", uploadError);
        }

        // 3. Save to Convex Database
        const docId = await saveAnalysis({
          ...analysisData,
          storageId,
          userId: userId || "anonymous",
        });
        
        router.push(`/analysis/${docId}`);
      };
      
      reader.onerror = (error) => {
        console.error("Error reading file:", error);
        setIsUploading(false);
      };
    } catch (error) {
      console.error("Upload error:", error);
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 px-5 py-8 pb-28 max-w-md mx-auto relative font-sans">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 mt-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-sm shadow-md">
            📈
          </div>
          <h1 className="text-2xl font-black text-slate-900">Profit AI</h1>
        </div>
        <div 
          onClick={() => router.push(userId && userId !== "anonymous" ? "/profile" : "/onboarding")}
          className="w-10 h-10 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center text-xl overflow-hidden cursor-pointer hover:border-slate-400 transition-colors shadow-sm"
        >
           {auth.currentUser?.photoURL ? (
             <img src={auth.currentUser.photoURL} alt="Profile" className="w-full h-full object-cover" />
           ) : (
             <span className="text-sm">👤</span>
           )}
        </div>
      </div>

      <div className="mb-4">
        <h2 className="text-slate-500 font-extrabold text-xs uppercase tracking-wider">Recent Scans</h2>
      </div>

      {isUploading && (
        <div className="bg-white rounded-3xl p-5 mb-4 flex items-center justify-center space-x-3 border-2 border-slate-200 shadow-xl">
           <div className="w-5 h-5 border-3 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
           <p className="text-slate-900 font-extrabold text-sm tracking-wide">Analyzing chart...</p>
        </div>
      )}

      {/* Feed */}
      <div className="space-y-4">
        {analyses === undefined ? (
          <div className="text-center flex flex-col items-center justify-center py-12">
            <div className="w-8 h-8 border-3 border-slate-300 border-t-slate-900 rounded-full animate-spin mb-3" />
            <p className="text-slate-500 text-xs font-semibold">Loading scans...</p>
          </div>
        ) : analyses.length === 0 ? (
          <div className="text-center text-slate-500 py-16 bg-white rounded-3xl border-2 border-slate-200 shadow-sm flex flex-col items-center justify-center space-y-3">
            <span className="text-4xl mb-1">📸</span>
            <p className="font-extrabold text-slate-900 text-base">No recent scans</p>
            <p className="text-xs text-slate-500 font-medium max-w-xs">
              Tap the + button to upload or snap your first chart
            </p>
          </div>
        ) : (
          analyses.map((analysis) => (
            <div 
              key={analysis._id} 
              onClick={() => router.push(`/analysis/${analysis._id}`)}
              className="bg-white rounded-3xl p-3.5 pr-5 flex space-x-4 border-2 border-slate-200 active:scale-[0.98] transition-all cursor-pointer shadow-md hover:shadow-xl"
            >
              {/* Thumbnail */}
              <div className="w-20 h-24 rounded-2xl bg-slate-100 overflow-hidden flex-shrink-0 relative border border-slate-200">
                {analysis.imageUrl ? (
                  <img src={analysis.imageUrl} alt="Chart" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-bold">No Image</div>
                )}
              </div>
              
              {/* Content */}
              <div className="flex-1 flex flex-col justify-center space-y-2.5 py-1">
                <div className="flex justify-between items-start">
                   <div>
                     <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                       {new Date(analysis.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                     </p>
                     <div className="flex items-center">
                       <span className={`text-base font-black ${analysis.trend === "Bullish" ? "text-emerald-600" : analysis.trend === "Bearish" ? "text-red-600" : "text-slate-700"}`}>
                         {analysis.trend === "Bullish" ? "↗ Bullish" : analysis.trend === "Bearish" ? "↘ Bearish" : "→ Neutral"}
                       </span>
                     </div>
                   </div>
                   
                   {/* Signal Badge */}
                   <div className={`px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase ${
                     analysis.signal === 'Buy' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                     analysis.signal === 'Sell' ? 'bg-red-100 text-red-800 border border-red-300' : 'bg-slate-100 text-slate-700 border border-slate-300'
                   }`}>
                     {analysis.signal || "BUY"}
                   </div>
                </div>

                {/* Risk Visual */}
                <div className="flex items-center space-x-2 pt-1.5 border-t border-slate-100">
                  <span className="text-[10px] text-slate-400 font-extrabold tracking-wider uppercase">Risk</span>
                  <div className="flex space-x-1.5">
                    <div className={`w-2.5 h-2.5 rounded-full ${analysis.riskLevel === 'Low' ? 'bg-emerald-500' : analysis.riskLevel === 'Medium' ? 'bg-amber-500' : analysis.riskLevel === 'High' ? 'bg-red-500' : 'bg-slate-300'}`} />
                    <div className={`w-2.5 h-2.5 rounded-full ${analysis.riskLevel === 'Medium' ? 'bg-amber-500' : analysis.riskLevel === 'High' ? 'bg-red-500' : 'bg-slate-300'}`} />
                    <div className={`w-2.5 h-2.5 rounded-full ${analysis.riskLevel === 'High' ? 'bg-red-500' : 'bg-slate-300'}`} />
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Fixed Light Theme Glassmorphic Bottom Nav with FAB */}
      <div className="fixed bottom-0 left-0 w-full pb-8 pt-3 px-8 bg-white/90 backdrop-blur-xl border-t border-slate-200 flex justify-between items-center z-50">
         <button onClick={() => router.push("/")} className="text-slate-900 flex flex-col items-center px-4 font-bold">
           <span className="text-2xl mb-1">🏠</span>
           <span className="text-[10px] font-black tracking-widest uppercase text-slate-900">Home</span>
         </button>
         
         {/* FAB in center */}
         <div className="relative -top-7">
           <label className={`flex items-center justify-center w-16 h-16 rounded-full cursor-pointer transition-all ${isUploading ? 'bg-slate-400 scale-95' : 'bg-slate-900 hover:bg-black hover:scale-105 active:scale-95 shadow-2xl'}`}>
             {isUploading ? (
               <div className="w-6 h-6 border-3 border-slate-300 border-t-white rounded-full animate-spin" />
             ) : (
               <span className="text-white text-2xl drop-shadow-md">➕</span>
             )}
             <input 
               type="file" 
               accept="image/*" 
               className="hidden" 
               onChange={handleFileUpload}
               disabled={isUploading}
             />
           </label>
         </div>

         <button onClick={() => router.push(userId && userId !== "anonymous" ? "/profile" : "/onboarding")} className="text-slate-400 flex flex-col items-center hover:text-slate-900 transition-colors px-4 font-bold">
           <span className="text-2xl mb-1">👤</span>
           <span className="text-[10px] font-black tracking-widest uppercase">Profile</span>
         </button>
      </div>

    </div>
  );
}
