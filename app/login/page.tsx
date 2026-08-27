"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, googleProvider } from "@/lib/firebase";
import {
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);

  // Completes the Google sign-in after the browser redirects back here.
  // Mobile browsers (iOS Safari especially) don't reliably support
  // signInWithPopup, so we use signInWithRedirect + this handler instead.
  useEffect(() => {
    if (!auth) return;
    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          router.push("/");
        }
      })
      .catch((err: any) => {
        setError(err.message);
      })
      .finally(() => {
        setGoogleLoading(false);
      });
  }, [router]);

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      await signInWithRedirect(auth, googleProvider);
      // Browser navigates away here; execution resumes in the
      // getRedirectResult effect above once it returns.
    } catch (err: any) {
      setGoogleLoading(false);
      setError(err.message);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      router.push("/");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 px-6 py-12 items-center justify-center font-sans">
      <div className="w-full max-w-sm bg-white rounded-3xl border-2 border-slate-200 p-8 shadow-2xl">
        <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-xl mx-auto mb-3 shadow-md">
          📈
        </div>
        <h1 className="text-3xl font-black mb-1 text-center text-slate-900">Profit AI</h1>
        <p className="text-slate-500 text-center text-sm font-semibold mb-8">
          {isSignUp ? "Create an account" : "Welcome back"}
        </p>

        {error && <p className="text-red-600 font-bold text-xs mb-4 text-center bg-red-50 p-2 rounded-xl border border-red-200">{error}</p>}

        <form onSubmit={handleEmailAuth} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-4 py-3.5 text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:border-slate-900"
              required
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-4 py-3.5 text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:border-slate-900"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-slate-900 text-white font-extrabold rounded-2xl px-4 py-4 hover:bg-black transition-colors shadow-lg"
          >
            {isSignUp ? "Sign Up" : "Sign In"}
          </button>
        </form>

        <div className="my-6 flex items-center justify-center space-x-2">
          <div className="h-px bg-slate-200 w-full" />
          <span className="text-slate-400 font-extrabold text-xs uppercase">OR</span>
          <div className="h-px bg-slate-200 w-full" />
        </div>

        <button
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
          className="w-full bg-slate-100 border border-slate-300 text-slate-800 font-bold rounded-2xl px-4 py-3.5 flex items-center justify-center space-x-3 hover:bg-slate-200 transition-colors shadow-sm disabled:opacity-60"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66 2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
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
          <span>{googleLoading ? "Redirecting..." : "Continue with Google"}</span>
        </button>

        <div className="mt-8 text-center">
          <p className="text-slate-500 font-semibold text-xs">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-slate-900 font-black hover:underline focus:outline-none"
            >
              {isSignUp ? "Sign In" : "Sign Up"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
