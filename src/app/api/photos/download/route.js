import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { getMediaItem } from "@/lib/google";

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session || !session.access_token) return new Response("Unauthorized", { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return new Response("Missing id", { status: 400 });

  const item = await getMediaItem({ access_token: session.access_token, id });
  const isVideo = item.mimeType?.startsWith("video/") ?? false;
  const downloadUrl = `${item.baseUrl}${isVideo ? "=dv" : "=d"}`;

  const upstream = await fetch(downloadUrl);
  if (!upstream.ok) return new Response("Unable to fetch media", { status: 502 });

  const headers = new Headers(upstream.headers);
  headers.set("Content-Disposition", `attachment; filename="${item.filename || item.id}"`);
  return new Response(upstream.body, { headers });
}