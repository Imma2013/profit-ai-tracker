import { NextResponse } from "next/server";
import { verifyFirebaseBearer } from "@/lib/server-auth";
import { hasPaidAccess } from "@/lib/subscription";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const user = await verifyFirebaseBearer(req);

  if (!user) {
    return NextResponse.json({ entitled: false }, { status: 401 });
  }

  const entitled = await hasPaidAccess(user.uid, user.email);
  return NextResponse.json({ entitled }, { status: entitled ? 200 : 403 });
}
