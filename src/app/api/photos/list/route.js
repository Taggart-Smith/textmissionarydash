import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { searchMediaItems } from "@/lib/google";

export async function POST(req) {
  const session = await getServerSession(authOptions);

  if (!session || !session.access_token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const pageSize = body.pageSize || 60;       // default to 60 if not provided
  const pageToken = body.pageToken || undefined;

  const results = await searchMediaItems({
    access_token: session.access_token,
    pageSize,
    pageToken,
  });

  return NextResponse.json(results);
}
