const EPISODES_API_URL = 'https://pneuexpress.online/anime_gang/getEpisodes.php'

export async function GET(request: Request) {
  const animeId = new URL(request.url).searchParams.get('animeId')

  if (!animeId) {
    return Response.json({ error: 'animeId is required' }, { status: 400 })
  }

  try {
    const response = await fetch(`${EPISODES_API_URL}?id=${encodeURIComponent(animeId)}`, {
      next: { revalidate: 300 },
    })

    if (!response.ok) {
      return Response.json({ error: `Episodes API returned ${response.status}` }, { status: response.status })
    }

    return Response.json(await response.json())
  } catch (error) {
    console.error('Error proxying episodes API:', error)
    return Response.json({ error: 'Unable to load anime episodes' }, { status: 502 })
  }
}
