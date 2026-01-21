export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get('url');

  if (!url) {
    return new Response('No URL provided', { status: 400 });
  }

  try {
    const decodedUrl = decodeURIComponent(url);

    // Native fetch works on the server in Next.js App Router
    const response = await fetch(decodedUrl);

    if (!response.ok) {
      return new Response('Failed to fetch video', { status: 500 });
    }

    // Stream the response directly to the client
    const body = response.body;

    return new Response(body, {
      headers: {
        'Content-Type': 'video/mp4',
        'Accept-Ranges': 'bytes',
      },
    });
  } catch (err) {
    console.error(err);
    return new Response('Error fetching video', { status: 500 });
  }
}
