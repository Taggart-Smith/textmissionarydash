const PHOTOS_API = "https://photoslibrary.googleapis.com/v1";

export async function searchMediaItems({ access_token, pageSize = 60, pageToken }) {
  const body = {
    pageSize,
    pageToken,
    filters: { mediaTypeFilter: { mediaTypes: ["PHOTO"] } },
  };
  const res = await fetch(
    `https://photoslibrary.googleapis.com/v1/mediaItems:search`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access_token}`, // Make sure this is access_token
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google Photos error ${res.status}: ${text}`);
  }
  return res.json();
}

export async function getMediaItem({ access_token, id }) {
  const res = await fetch(`${PHOTOS_API}/mediaItems/${id}`, {
    headers: { Authorization: `Bearer ${access_token}` },
  });
  if (!res.ok) throw new Error(`Failed to fetch media item: ${res.status}`);
  return res.json();
}

async function refreshaccess_token(refreshToken) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to refresh token");
  return {
    access_token: data.access_token,
    expires_at: Date.now() + data.expires_in * 1000,
  };
}
