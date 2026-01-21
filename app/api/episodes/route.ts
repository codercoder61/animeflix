export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const animeId = searchParams.get('animeId')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '24')

  if (!animeId) {
    return Response.json({ error: 'animeId is required' }, { status: 400 })
  }

  // Mock anime database with episode counts
  const animeDatabase: Record<string, number> = {
    '1': 16,
    '2': 26,
    '3': 24,
    '4': 1000,
  }

  const totalEpisodes = animeDatabase[animeId] || 0

  if (totalEpisodes === 0) {
    return Response.json({ error: 'Anime not found' }, { status: 404 })
  }

  // Calculate pagination
  const startIndex = (page - 1) * limit
  const endIndex = Math.min(startIndex + limit, totalEpisodes)
  const hasMore = endIndex < totalEpisodes

  // Generate episode data
  const episodes = Array.from({ length: endIndex - startIndex }).map((_, i) => ({
    id: startIndex + i + 1,
    episodeNumber: startIndex + i + 1,
    title: `Episode ${startIndex + i + 1}`,
    description: `Description for episode ${startIndex + i + 1}`,
    duration: '24:45',
    releaseDate: new Date(2023, 0, startIndex + i + 1).toISOString().split('T')[0],
  }))

  return Response.json({
    episodes,
    pagination: {
      currentPage: page,
      limit,
      totalEpisodes,
      totalPages: Math.ceil(totalEpisodes / limit),
      hasMore,
      startIndex: startIndex + 1,
      endIndex,
    },
  })
}
