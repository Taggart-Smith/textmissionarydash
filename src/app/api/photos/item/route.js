import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { getMediaItem } from "@/lib/google";

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session || !session.access_token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const item = await getMediaItem({ access_token: session.access_token, id });
  return NextResponse.json(item);
}