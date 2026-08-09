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
      <div className="flex flex-col min-h-screen bg-black text-white items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-600 border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-black text-white px-5 py-8 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center mb-8 mt-4 space-x-4">
        <button 
          onClick={() => router.push("/")}
          className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center border border-gray-800"
        >
          <span className="text-xl">←</span>
        </button>
        <h1 className="text-2xl font-bold">Profile</h1>
      </div>

      <div className="bg-[#111111] rounded-3xl p-6 border border-gray-800 flex flex-col items-center">
        <div className="w-24 h-24 rounded-full bg-gray-800 overflow-hidden mb-4 flex items-center justify-center text-4xl border-2 border-gray-700">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            "👤"
          )}
        </div>
        
        <h2 className="text-xl font-bold mb-1">{user?.displayName || "Trader"}</h2>
        <p className="text-gray-400 text-sm mb-6">{user?.email}</p>

        <button
          onClick={() => router.push("/onboarding")}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-400 text-black font-extrabold rounded-xl px-4 py-3 mb-3 hover:brightness-110 transition-all flex items-center justify-center space-x-2 shadow-lg"
        >
          <span>★ Start 3-Day Free Trial (Yearly Plan)</span>
        </button>

        <button
          onClick={handleSignOut}
          className="w-full bg-red-500/10 text-red-500 border border-red-500/20 font-semibold rounded-xl px-4 py-3 hover:bg-red-500/20 transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
