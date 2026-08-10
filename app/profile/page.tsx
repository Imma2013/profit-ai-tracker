"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser: any) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        router.push("/onboarding");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push("/onboarding");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-white text-slate-900 items-center justify-center">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 px-5 py-8 max-w-md mx-auto font-sans">
      {/* Header */}
      <div className="flex items-center mb-8 mt-4 space-x-4">
        <button 
          onClick={() => router.push("/")}
          className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center font-black text-slate-700 shadow-sm"
        >
          <span className="text-xl">←</span>
        </button>
        <h1 className="text-2xl font-black text-slate-900">Profile</h1>
      </div>

      <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 flex flex-col items-center shadow-lg">
        <div className="w-24 h-24 rounded-full bg-slate-100 border-2 border-slate-300 overflow-hidden mb-4 flex items-center justify-center text-4xl shadow-inner">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            "👤"
          )}
        </div>
        
        <h2 className="text-xl font-black text-slate-900 mb-1">{user?.displayName || "Trader"}</h2>
        <p className="text-slate-500 font-semibold text-sm mb-6">{user?.email}</p>

        <button
          onClick={() => router.push("/onboarding")}
          className="w-full bg-emerald-600 text-white font-black rounded-2xl px-4 py-4 mb-3 hover:bg-emerald-700 transition-all flex items-center justify-center space-x-2 shadow-lg hover:scale-[1.01]"
        >
          <span>★ Start 3-Day Free Trial (Yearly Plan)</span>
        </button>

        <button
          onClick={handleSignOut}
          className="w-full bg-red-50 text-red-600 border border-red-200 font-extrabold rounded-2xl px-4 py-3.5 hover:bg-red-100 transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
