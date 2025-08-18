import Link from "next/link";

async function getItem(id) {
  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/photos/item?id=${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

export default async function Viewer({ params }) {
  const item = await getItem(params.id);
  if (!item) return <div className="p-6">Not found</div>;
  const isVideo = item?.mimeType?.startsWith("video/");
  return (
    <main className="mx-auto max-w-4xl p-6">
      <Link href="/" className="text-sm text-blue-600">← Back</Link>
      <div className="mt-4 overflow-hidden rounded-lg bg-white p-3 shadow">
        {isVideo ? (
          <video controls className="w-full" src={`${item.baseUrl}=dv`} />
        ) : (
          <img className="w-full" src={`${item.baseUrl}=w1600-h1600`} alt={item.filename} />
        )}
      </div>
      <div className="mt-3">
        <a className="rounded bg-gray-900 px-4 py-2 text-white" href={`/api/photos/download?id=${item.id}`}>Download original</a>
      </div>
    </main>
  );
}