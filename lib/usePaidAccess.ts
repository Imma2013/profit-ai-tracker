"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";

export function usePaidAccess() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (!currentUser) {
        setAllowed(false);
        setLoading(false);
        router.replace("/onboarding");
        return;
      }

      try {
        const token = await currentUser.getIdToken();
        const response = await fetch("/api/stripe/entitlement", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });

        if (!response.ok) {
          setAllowed(false);
          setLoading(false);
          router.replace("/onboarding?paywall=1");
          return;
        }

        const data = await response.json();
        const entitled = data?.entitled === true;
        setAllowed(entitled);
        setLoading(false);

        if (!entitled) {
          router.replace("/onboarding?paywall=1");
        }
      } catch {
        setAllowed(false);
        setLoading(false);
        router.replace("/onboarding?paywall=1");
      }
    });

    return () => unsubscribe();
  }, [router]);

  return { loading, allowed, user };
}
