// Client-side home data service that calls the API
export class ClientHomeDataService {
  async getHomeData() {
    try {
      const response = await fetch('/api/home-data', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch home data')
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching home data:', error)
      // Return empty data structure on error
      return {
        spotify: {
          topTracks: [],
          newReleases: [],
          featuredPlaylists: [],
          trending: [],
          recentlyPlayed: []
        },
        youtube: {
          trendingVideos: [],
          popularMusic: [],
          newReleases: [],
          topCharts: []
        },
        combined: {
          recommendations: [],
          trending: [],
          newReleases: []
        }
      }
    }
  }
}

export const clientHomeDataService = new ClientHomeDataService()
