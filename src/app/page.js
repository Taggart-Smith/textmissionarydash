"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  const [items, setItems] = useState([]);
  const [nextPageToken, setNextPageToken] = useState();
  const [loading, setLoading] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setInitialLoading(true);
      try {
        const res = await fetch("/api/photos/list", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });

        if (res.status === 401) {
          setAuthed(false);
          setInitialLoading(false);
          return;
        }

        setAuthed(true);

        let data;
        try {
          data = await res.json();
        } catch {
          console.error("Non-JSON response from /api/photos/list");
          data = {};
        }

        console.log("API response:", data); // Debugging

        setItems(data.mediaItems || []);
        setNextPageToken(data.nextPageToken || null);
      } catch (err) {
        console.error("Fetch failed:", err);
        setAuthed(false);
      } finally {
        setInitialLoading(false);
      }
    })();
  }, []);

  async function loadMore() {
    if (!nextPageToken) return;
    setLoading(true);
    try {
      const res = await fetch("/api/photos/list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageToken: nextPageToken }),
      });

      let data;
      try {
        data = await res.json();
      } catch {
        console.error("Non-JSON response from /api/photos/list (loadMore)");
        data = {};
      }

      setItems((prev) => [...prev, ...(data.mediaItems || [])]);
      setNextPageToken(data.nextPageToken || null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-6xl p-6">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Mission Media</h1>
        <div className="space-x-3">
          <Link href="/api/auth/signin">
            Sign in
          </Link>
          <Link className="rounded bg-gray-200 px-3 py-2" href="/api/auth/signout">
            Sign out
          </Link>
        </div>
      </header>

      {!authed ? (
        <p>Please sign in with Google to view your photos.</p>
      ) : initialLoading ? (
        <p>Loading photos...</p>
      ) : items.length === 0 ? (
        <p>No media found.</p>
      ) : (
        <>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {items.map((m) => (
              <li key={m.id} className="group overflow-hidden rounded-lg bg-white shadow">
                <Link href={`/viewer/${m.id}`}>
                  <Image
                    src={`${m.baseUrl}=w400-h400`}
                    alt={m.filename || m.id}
                    className="h-40 w-full object-cover transition-transform group-hover:scale-105"
                  />
                </Link>
                <div className="flex items-center justify-between px-2 py-1 text-xs">
                  <span className="truncate" title={m.filename}>
                    {m.filename || "(untitled)"}
                  </span>
                  <a
                    className="rounded bg-gray-900 px-2 py-1 text-white"
                    href={`/api/photos/download?id=${m.id}`}
                  >
                    Download
                  </a>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex justify-center">
            {nextPageToken ? (
              <button
                onClick={loadMore}
                disabled={loading}
                className="rounded bg-gray-800 px-4 py-2 text-white disabled:opacity-50"
              >
                {loading ? "Loading..." : "Load more"}
              </button>
            ) : (
              <span className="text-sm text-gray-500">All caught up ✅</span>
            )}
          </div>
        </>
      )}
    </main>
  );
}
