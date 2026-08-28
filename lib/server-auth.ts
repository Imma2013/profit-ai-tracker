export type VerifiedFirebaseUser = {
  uid: string;
  email?: string;
};

export async function verifyFirebaseBearer(req: Request): Promise<VerifiedFirebaseUser | null> {
  const header = req.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

  if (!token || !apiKey) return null;

  try {
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: token }),
        cache: "no-store",
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    const user = data?.users?.[0];
    if (!user?.localId) return null;

    return {
      uid: user.localId,
      email: user.email || undefined,
    };
  } catch {
    return null;
  }
}
