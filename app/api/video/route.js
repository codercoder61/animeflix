export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get('url');

  if (!url) {
    return new Response('No URL provided', { status: 400 });
  }

  const decodedUrl = decodeURIComponent(url);

  // Forward Range header if present
  const range = req.headers.get('range');

  const response = await fetch(decodedUrl, {
    headers: range ? { range } : {},
  });

  if (!response.ok && response.status !== 206) {
    return new Response('Failed to fetch video', { status: response.status });
  }

  const headers = new Headers(response.headers);

  // Ensure correct content-type
  headers.set('Content-Type', 'video/mp4');

  return new Response(response.body, {
    status: response.status, // 200 or 206
    headers,
  });
}
