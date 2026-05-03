import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { allocateNextRank } from "@/lib/arrival-store";

export const dynamic = "force-dynamic";

const COOKIE = "homecoming_arrival_rank";
const YEAR = 60 * 60 * 24 * 365;

export async function GET() {
  const jar = await cookies();
  const existing = jar.get(COOKIE)?.value;
  const parsed = existing ? parseInt(existing, 10) : NaN;
  if (existing && Number.isFinite(parsed) && parsed > 0) {
    return NextResponse.json({ rank: parsed });
  }

  const rank = await allocateNextRank();

  const res = NextResponse.json({ rank });
  res.cookies.set(COOKIE, String(rank), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: YEAR,
    secure: process.env.NODE_ENV === "production",
  });

  return res;
}
