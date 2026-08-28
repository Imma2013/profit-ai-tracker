"use client";

import { ReactNode } from "react";
import { usePaidAccess } from "@/lib/usePaidAccess";

export default function ProtectedAnalysisLayout({ children }: { children: ReactNode }) {
  const { loading, allowed } = usePaidAccess();

  if (loading || !allowed) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
        <p className="text-slate-500 font-bold text-sm">Checking access...</p>
      </div>
    );
  }

  return children;
}
