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
    const unsubscribe = auth.onAuthStateChanged((user) => {
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
    <div className="flex flex-col min-h-screen bg-black text-white px-5 py-8 pb-28">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 mt-4">
        <h1 className="text-2xl font-bold">Profit AI</h1>
        <div 
          onClick={() => router.push("/login")}
          className="w-10 h-10 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-xl overflow-hidden cursor-pointer hover:border-gray-500 transition-colors"
        >
           {auth.currentUser?.photoURL ? (
             <img src={auth.currentUser.photoURL} alt="Profile" className="w-full h-full object-cover" />
           ) : (
             <span className="text-sm">👤</span>
           )}
        </div>
      </div>

      <div className="mb-4">
        <h2 className="text-gray-400 font-medium tracking-wide">Recent Scans</h2>
      </div>

      {isUploading && (
        <div className="bg-[#111111] rounded-3xl p-5 mb-4 flex items-center justify-center space-x-3 border border-gray-800 shadow-lg">
           <div className="w-5 h-5 border-2 border-gray-600 border-t-white rounded-full animate-spin"></div>
           <p className="text-gray-300 font-medium text-sm tracking-wide">Analyzing chart...</p>
        </div>
      )}

      {/* Feed */}
      <div className="space-y-4">
        {analyses === undefined ? (
          <div className="text-center flex flex-col items-center justify-center py-10">
            <div className="w-8 h-8 border-2 border-gray-800 border-t-gray-500 rounded-full animate-spin mb-3"></div>
            <p className="text-gray-600 text-sm">Loading scans...</p>
          </div>
        ) : analyses.length === 0 ? (
          <div className="text-center text-gray-500 py-16 bg-[#111111] rounded-3xl border border-gray-800 shadow-sm flex flex-col items-center justify-center space-y-2">
            <span className="text-3xl mb-2">📸</span>
            <p className="font-medium text-gray-400">No recent scans</p>
            <p className="text-xs text-gray-600">Tap the + button to analyze your first chart</p>
          </div>
        ) : (
          analyses.map((analysis) => (
            <div 
              key={analysis._id} 
              onClick={() => router.push(`/analysis/${analysis._id}`)}
              className="bg-[#111111] rounded-[24px] p-3 pr-5 flex space-x-4 border border-gray-800/60 active:scale-[0.98] transition-transform cursor-pointer shadow-xl shadow-black/50"
            >
              {/* Thumbnail */}
              <div className="w-20 h-24 rounded-2xl bg-gray-900 overflow-hidden flex-shrink-0 relative border border-gray-800/50">
                {analysis.imageUrl ? (
                  <img src={analysis.imageUrl} alt="Chart" className="w-full h-full object-cover opacity-90 mix-blend-screen" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">No Image</div>
                )}
              </div>
              
              {/* Content */}
              <div className="flex-1 flex flex-col justify-center space-y-3 py-1">
                <div className="flex justify-between items-start">
                   <div>
                     <p className="text-xs font-semibold mb-1 text-gray-400 uppercase tracking-wider">
                       {new Date(analysis.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                     </p>
                     <div className="flex items-center mt-1">
                       <span className={`text-[15px] font-bold ${analysis.trend === "Bullish" ? "text-green-400" : analysis.trend === "Bearish" ? "text-red-400" : "text-gray-400"}`}>
                         {analysis.trend === "Bullish" ? "↗ Bullish" : analysis.trend === "Bearish" ? "↘ Bearish" : "→ Neutral"}
                       </span>
                     </div>
                   </div>
                   
                   {/* Signal Badge */}
                   <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase ${
                     analysis.signal === 'Entry' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                     analysis.signal === 'Exit' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                   }`}>
                     {analysis.signal || "HOLD"}
                   </div>
                </div>

                {/* Risk Visual */}
                <div className="flex items-center space-x-2 pt-1 border-t border-gray-800/50">
                  <span className="text-[10px] text-gray-500 font-medium tracking-wide uppercase">Risk</span>
                  <div className="flex space-x-1">
                    <div className={`w-1.5 h-1.5 rounded-full ${analysis.riskLevel === 'Low' ? 'bg-green-500' : analysis.riskLevel === 'Medium' ? 'bg-yellow-500' : analysis.riskLevel === 'High' ? 'bg-red-500' : 'bg-gray-700'}`}></div>
                    <div className={`w-1.5 h-1.5 rounded-full ${analysis.riskLevel === 'Medium' ? 'bg-yellow-500' : analysis.riskLevel === 'High' ? 'bg-red-500' : 'bg-gray-700'}`}></div>
                    <div className={`w-1.5 h-1.5 rounded-full ${analysis.riskLevel === 'High' ? 'bg-red-500' : 'bg-gray-700'}`}></div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Fixed Bottom Nav with FAB */}
      <div className="fixed bottom-0 left-0 w-full pb-8 pt-3 px-8 bg-black/80 backdrop-blur-xl border-t border-gray-900 flex justify-between items-center z-50">
         <button onClick={() => router.push("/")} className="text-white flex flex-col items-center opacity-100 px-4">
           <span className="text-xl mb-1 drop-shadow-md">🏠</span>
           <span className="text-[9px] font-bold tracking-widest uppercase">Home</span>
         </button>
         
         {/* FAB in center */}
         <div className="relative -top-7">
           <label className={`flex items-center justify-center w-16 h-16 rounded-full cursor-pointer transition-all ${isUploading ? 'bg-gray-600 scale-95' : 'bg-white hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.2)]'}`}>
             {isUploading ? (
               <div className="w-6 h-6 border-2 border-gray-400 border-t-white rounded-full animate-spin"></div>
             ) : (
               <span className="text-black text-2xl drop-shadow-sm">➕</span>
             )}
             <input 
               type="file" 
               accept="image/*" 
               capture="environment"
               className="hidden" 
               onChange={handleFileUpload}
               disabled={isUploading}
             />
           </label>
         </div>

         <button onClick={() => router.push("/login")} className="text-gray-600 flex flex-col items-center hover:text-gray-300 transition-colors px-4">
           <span className="text-xl mb-1">👤</span>
           <span className="text-[9px] font-bold tracking-widest uppercase">Profile</span>
         </button>
      </div>

    </div>
  );
}
