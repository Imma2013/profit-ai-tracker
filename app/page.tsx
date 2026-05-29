"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    // TODO: In the future we will upload this to Firebase Storage and pass the URL or base64 to /analysis
    // For now we just route to analysis
    setTimeout(() => {
      router.push("/analysis");
    }, 1500);
  };

  return (
    <div className="flex flex-col min-h-screen bg-black text-white px-6 py-12 items-center">
      {/* Header */}
      <div className="flex flex-col items-center mt-12 mb-16 text-center space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight">
          Just snap a picture of your chart
        </h1>
        <p className="text-gray-400 text-lg">
          Get an instant AI breakdown of the market.
        </p>
      </div>

      {/* Camera/Upload Area */}
      <div className="relative w-full max-w-sm aspect-[9/16] bg-[#111111] rounded-[40px] border border-gray-800 flex flex-col items-center justify-center overflow-hidden shadow-2xl">
        
        {/* Viewfinder UI Mockup */}
        <div className="absolute inset-0 m-12 border-2 border-white/20 rounded-2xl pointer-events-none flex items-center justify-center">
           <div className="w-16 h-16 border-t-2 border-l-2 border-white absolute top-0 left-0 -translate-x-1 -translate-y-1 rounded-tl-xl"></div>
           <div className="w-16 h-16 border-t-2 border-r-2 border-white absolute top-0 right-0 translate-x-1 -translate-y-1 rounded-tr-xl"></div>
           <div className="w-16 h-16 border-b-2 border-l-2 border-white absolute bottom-0 left-0 -translate-x-1 translate-y-1 rounded-bl-xl"></div>
           <div className="w-16 h-16 border-b-2 border-r-2 border-white absolute bottom-0 right-0 translate-x-1 translate-y-1 rounded-br-xl"></div>
        </div>

        {isUploading ? (
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-4 border-gray-600 border-t-white rounded-full animate-spin"></div>
            <p className="text-white font-medium">Analyzing chart...</p>
          </div>
        ) : (
          <>
            <p className="text-gray-500 mb-8 z-10">Tap button to upload</p>
            {/* Capture Button */}
            <div className="absolute bottom-12 flex justify-center w-full">
              <label className="relative flex items-center justify-center w-20 h-20 bg-white rounded-full cursor-pointer hover:scale-105 active:scale-95 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                <div className="absolute w-16 h-16 rounded-full border-2 border-gray-300"></div>
                <input 
                  type="file" 
                  accept="image/*" 
                  capture="environment"
                  className="hidden" 
                  onChange={handleFileUpload}
                />
              </label>
            </div>
            
            {/* Flash Icon Mockup */}
            <div className="absolute bottom-16 right-12 w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center">
              <svg width="14" height="18" viewBox="0 0 14 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 10.5H6V18L14 7.5H8V0L0 10.5Z" fill="white"/>
              </svg>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
