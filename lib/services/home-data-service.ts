import { supabaseService } from '@/lib/supabase/service'

// Cache duration in milliseconds (1 hour)
const CACHE_DURATION = 60 * 60 * 1000

interface CachedData {
  data: any
  timestamp: number
}

class HomeDataService {
  private cache = new Map<string, CachedData>()

  // Get cached data or fetch new data
  private async getCachedOrFetch(key: string, fetchFn: () => Promise<any>): Promise<any> {
    const cached = this.cache.get(key)
    const now = Date.now()

    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      return cached.data
    }

    try {
      const data = await fetchFn()
      this.cache.set(key, { data, timestamp: now })
      return data
    } catch (error) {
      console.error(`Error fetching data for ${key}:`, error)
      return cached?.data || []
    }
  }

  // Get Spotify data for a user
  async getSpotifyData(userId: string) {
    return this.getCachedOrFetch(`spotify-${userId}`, async () => {
      try {
        const { SpotifyService } = await import('./spotify-service')
        const spotifyService = new SpotifyService()
        
        const isInitialized = await spotifyService.initialize(userId)
        if (!isInitialized) {
          console.log('Spotify service not connected for user:', userId)
          return {
            topTracks: [],
            newReleases: [],
            featuredPlaylists: [],
            trending: [],
            recentlyPlayed: []
          }
        }

        // Fetch data from Spotify
        const [topTracks, recentlyPlayed, recommendations] = await Promise.allSettled([
          spotifyService.getTopTracks(),
          spotifyService.getRecentlyPlayed(),
          spotifyService.getRecommendations()
        ])

        return {
          topTracks: topTracks.status === 'fulfilled' ? topTracks.value : [],
          newReleases: [], // Spotify doesn't provide new releases in basic API
          featuredPlaylists: recommendations.status === 'fulfilled' ? recommendations.value : [],
          trending: [],
          recentlyPlayed: recentlyPlayed.status === 'fulfilled' ? recentlyPlayed.value : []
        }
      } catch (error) {
        console.error('Error fetching Spotify data:', error)
        return {
          topTracks: [],
          newReleases: [],
          featuredPlaylists: [],
          trending: [],
          recentlyPlayed: []
        }
      }
    })
  }

  // Get YouTube data for a user
  async getYouTubeData(userId: string) {
    return this.getCachedOrFetch(`youtube-${userId}`, async () => {
      try {
        const { YouTubeMusicService } = await import('./youtube-music-service')
        const youtubeService = new YouTubeMusicService()
        
        const isInitialized = await youtubeService.initialize(userId)
        if (!isInitialized) {
          console.log('YouTube Music service not connected for user:', userId)
          return {
            trendingVideos: [],
            popularMusic: [],
            newReleases: [],
            topCharts: []
          }
        }

        // Fetch data from YouTube Music
        const [trendingVideos, popularMusic] = await Promise.allSettled([
          youtubeService.getTrendingVideos(),
          youtubeService.getPopularMusic()
        ])

        return {
          trendingVideos: trendingVideos.status === 'fulfilled' ? trendingVideos.value : [],
          popularMusic: popularMusic.status === 'fulfilled' ? popularMusic.value : [],
          newReleases: [],
          topCharts: []
        }
      } catch (error) {
        console.error('Error fetching YouTube data:', error)
        return {
          trendingVideos: [],
          popularMusic: [],
          newReleases: [],
          topCharts: []
        }
      }
    })
  }

  // Get combined home data
  async getHomeData(userId: string) {
    try {
      const [spotifyData, youtubeData] = await Promise.allSettled([
        this.getSpotifyData(userId),
        this.getYouTubeData(userId)
      ])

      const spotify = spotifyData.status === 'fulfilled' ? spotifyData.value : {
        topTracks: [],
        newReleases: [],
        featuredPlaylists: [],
        trending: [],
        recentlyPlayed: []
      }

      const youtube = youtubeData.status === 'fulfilled' ? youtubeData.value : {
        trendingVideos: [],
        popularMusic: [],
        newReleases: [],
        topCharts: []
      }

      return {
        spotify,
        youtube,
        // Combined sections
        continueListening: [
          ...(spotify.recentlyPlayed || []).slice(0, 6),
          ...(youtube.trendingVideos || []).slice(0, 6)
        ].slice(0, 12),
        madeForYou: [
          ...(spotify.featuredPlaylists || []).slice(0, 6),
          ...(youtube.popularMusic || []).slice(0, 6)
        ].slice(0, 12)
      }
    } catch (error) {
      console.error('Error in getHomeData:', error)
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
        continueListening: [],
        madeForYou: []
      }
    }
  }

  // Clear cache for a specific user
  clearUserCache(userId: string) {
    this.cache.delete(`spotify-${userId}`)
    this.cache.delete(`youtube-${userId}`)
  }

  // Clear all cache
  clearAllCache() {
    this.cache.clear()
  }
}

export const homeDataService = new HomeDataService()
