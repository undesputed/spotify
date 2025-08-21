import { google } from 'googleapis'
import { supabaseService } from '@/lib/supabase/service'
import { supabaseServerService } from '@/lib/supabase/server'

// Types for YouTube Music
export interface YouTubeTrack {
  id: string
  title: string
  artist: string
  album?: string
  duration: number
  artwork: string
  videoId: string
  channelId: string
  channelTitle: string
  publishedAt: string
  viewCount: number
  likeCount: number
  description: string
  tags: string[]
  serviceId: 'youtube_music'
  originalId: string
  availableServices: string[]
}

export interface YouTubePlaylist {
  id: string
  title: string
  description?: string
  creator: {
    id: string
    name: string
    image?: string
  }
  tracks: YouTubeTrack[]
  artwork: string
  isPublic: boolean
  isLiked: boolean
  followers: number
  createdAt: string
  updatedAt: string
  serviceId: 'youtube_music'
  originalId: string
  availableServices: string[]
}

export class YouTubeMusicService {
  private youtubeApi: any
  private oauth2Client: any
  private accessToken: string | null = null
  private refreshToken: string | null = null
  private expiresAt: number | null = null

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.YOUTUBE_CLIENT_ID,
      process.env.YOUTUBE_CLIENT_SECRET,
      `${process.env.NEXT_PUBLIC_APP_URL}/auth/youtube/callback`
    )

    this.youtubeApi = google.youtube('v3')
  }

  // Initialize with user tokens
  async initialize(userId: string): Promise<boolean> {
    try {
      const userServices = await supabaseService.getUserServices(userId)
      const youtubeService = userServices.find(s => s.service_id === 'youtube_music')
      
      if (!youtubeService || !youtubeService.access_token) {
        return false
      }

      this.accessToken = youtubeService.access_token
      this.refreshToken = youtubeService.refresh_token
      this.expiresAt = youtubeService.expires_at ? new Date(youtubeService.expires_at).getTime() : null

      this.oauth2Client.setCredentials({
        access_token: this.accessToken,
        refresh_token: this.refreshToken,
        expiry_date: this.expiresAt
      })
      
      // Refresh token if expired
      if (this.expiresAt && Date.now() >= this.expiresAt) {
        await this.refreshAccessToken(userId)
      }

      return true
    } catch (error) {
      console.error('Failed to initialize YouTube Music service:', error)
      return false
    }
  }

  // Refresh access token
  private async refreshAccessToken(userId: string): Promise<void> {
    if (!this.refreshToken) throw new Error('No refresh token available')

    try {
      const { credentials } = await this.oauth2Client.refreshAccessToken()
      
      this.accessToken = credentials.access_token
      this.expiresAt = credentials.expiry_date
      
      this.oauth2Client.setCredentials(credentials)

      // Update tokens in database
      await supabaseService.connectService({
        user_id: userId,
        service_id: 'youtube_music',
        access_token: this.accessToken,
        refresh_token: this.refreshToken,
        expires_at: new Date(this.expiresAt).toISOString(),
        is_active: true,
      })
    } catch (error) {
      console.error('Failed to refresh YouTube access token:', error)
      throw error
    }
  }

  // Get authorization URL for OAuth
  getAuthorizationUrl(state?: string): string {
    const scopes = [
      'https://www.googleapis.com/auth/youtube.readonly',
      'https://www.googleapis.com/auth/youtube.force-ssl'
    ]

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      state: state || 'state'
    })
  }

  // Handle OAuth callback
  async handleCallback(code: string, userId: string): Promise<void> {
    try {
      const { tokens } = await this.oauth2Client.getToken(code)
      
      this.accessToken = tokens.access_token
      this.refreshToken = tokens.refresh_token
      this.expiresAt = tokens.expiry_date

      this.oauth2Client.setCredentials(tokens)

      // Get user profile
      const { data: profile } = await this.youtubeApi.channels.list({
        auth: this.oauth2Client,
        part: ['snippet'],
        mine: true
      })

      const channel = profile.items?.[0]
      const serviceUserId = channel?.id || 'unknown'
      const serviceUsername = channel?.snippet?.title || 'YouTube User'

      // Save to database using server-side service (bypasses RLS)
      await supabaseServerService.connectService({
        user_id: userId,
        service_id: 'youtube_music',
        access_token: this.accessToken,
        refresh_token: this.refreshToken,
        expires_at: new Date(this.expiresAt).toISOString(),
        is_active: true,
        service_user_id: serviceUserId,
        service_username: serviceUsername,
      })
    } catch (error) {
      console.error('Failed to handle YouTube callback:', error)
      throw error
    }
  }

  // Search tracks (using YouTube Data API)
  async searchTracks(query: string, limit = 20): Promise<YouTubeTrack[]> {
    try {
      const response = await this.youtubeApi.search.list({
        auth: this.oauth2Client,
        part: ['snippet'],
        q: `${query} music`,
        type: ['video'],
        videoCategoryId: '10', // Music category
        maxResults: limit,
        order: 'relevance'
      })

      if (!response.data.items) return []

      // Get detailed video information
      const videoIds = response.data.items.map((item: any) => item.id.videoId)
      const videoDetails = await this.getVideoDetails(videoIds)

      return response.data.items
        .map((item: any, index: number) => this.mapYouTubeTrack(item, videoDetails[index]))
        .filter(Boolean)
    } catch (error) {
      console.error('Failed to search YouTube tracks:', error)
      return []
    }
  }

  // Get video details
  private async getVideoDetails(videoIds: string[]): Promise<any[]> {
    try {
      const response = await this.youtubeApi.videos.list({
        auth: this.oauth2Client,
        part: ['snippet', 'contentDetails', 'statistics'],
        id: videoIds
      })

      return response.data.items || []
    } catch (error) {
      console.error('Failed to get video details:', error)
      return []
    }
  }

  // Get user's liked videos (requires OAuth)
  async getLikedTracks(limit = 50, pageToken?: string): Promise<YouTubeTrack[]> {
    try {
      const response = await this.youtubeApi.videos.list({
        auth: this.oauth2Client,
        part: ['snippet', 'contentDetails', 'statistics'],
        myRating: 'like',
        maxResults: limit,
        pageToken
      })

      if (!response.data.items) return []

      return response.data.items
        .map((item: any) => this.mapYouTubeTrack(item, item))
        .filter(Boolean)
    } catch (error) {
      console.error('Failed to get liked tracks:', error)
      return []
    }
  }

  // Get user's playlists
  async getUserPlaylists(limit = 50, pageToken?: string): Promise<YouTubePlaylist[]> {
    try {
      const response = await this.youtubeApi.playlists.list({
        auth: this.oauth2Client,
        part: ['snippet', 'contentDetails'],
        mine: true,
        maxResults: limit,
        pageToken
      })

      if (!response.data.items) return []

      return await Promise.all(
        response.data.items.map((playlist: any) => this.mapYouTubePlaylist(playlist))
      )
    } catch (error) {
      console.error('Failed to get user playlists:', error)
      return []
    }
  }

  // Get playlist tracks
  async getPlaylistTracks(playlistId: string, limit = 50, pageToken?: string): Promise<YouTubeTrack[]> {
    try {
      const response = await this.youtubeApi.playlistItems.list({
        auth: this.oauth2Client,
        part: ['snippet'],
        playlistId,
        maxResults: limit,
        pageToken
      })

      if (!response.data.items) return []

      const videoIds = response.data.items.map((item: any) => item.snippet.resourceId.videoId)
      const videoDetails = await this.getVideoDetails(videoIds)

      return response.data.items
        .map((item: any, index: number) => this.mapYouTubeTrack(item, videoDetails[index]))
        .filter(Boolean)
    } catch (error) {
      console.error('Failed to get playlist tracks:', error)
      return []
    }
  }

  // Map YouTube API response to our track format
  private mapYouTubeTrack(item: any, details?: any): YouTubeTrack | null {
    try {
      const snippet = item.snippet || details?.snippet
      const statistics = details?.statistics || {}
      const contentDetails = details?.contentDetails

      if (!snippet) return null

      // Parse duration (ISO 8601 format)
      const duration = this.parseDuration(contentDetails?.duration || 'PT0S')

      // Extract artist and title from video title
      const { artist, title } = this.parseVideoTitle(snippet.title)

      return {
        id: `youtube_${item.id?.videoId || item.id}`,
        title: title || snippet.title,
        artist: artist || snippet.channelTitle,
        album: undefined, // YouTube doesn't have album concept
        duration,
        artwork: snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url || '',
        videoId: item.id?.videoId || item.id,
        channelId: snippet.channelId,
        channelTitle: snippet.channelTitle,
        publishedAt: snippet.publishedAt,
        viewCount: parseInt(statistics.viewCount || '0'),
        likeCount: parseInt(statistics.likeCount || '0'),
        description: snippet.description,
        tags: snippet.tags || [],
        serviceId: 'youtube_music',
        originalId: item.id?.videoId || item.id,
        availableServices: ['youtube_music']
      }
    } catch (error) {
      console.error('Failed to map YouTube track:', error)
      return null
    }
  }

  // Map YouTube playlist
  private async mapYouTubePlaylist(playlist: any): Promise<YouTubePlaylist> {
    const snippet = playlist.snippet

    return {
      id: `youtube_${playlist.id}`,
      title: snippet.title,
      description: snippet.description,
      creator: {
        id: snippet.channelId,
        name: snippet.channelTitle,
        image: snippet.thumbnails?.high?.url
      },
      tracks: [], // Will be populated separately
      artwork: snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url || '',
      isPublic: snippet.privacyStatus === 'public',
      isLiked: false, // YouTube doesn't have playlist likes
      followers: 0, // YouTube doesn't have playlist followers
      createdAt: snippet.publishedAt,
      updatedAt: snippet.publishedAt,
      serviceId: 'youtube_music',
      originalId: playlist.id,
      availableServices: ['youtube_music']
    }
  }

  // Parse ISO 8601 duration to seconds
  private parseDuration(duration: string): number {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
    if (!match) return 0

    const hours = parseInt(match[1] || '0')
    const minutes = parseInt(match[2] || '0')
    const seconds = parseInt(match[3] || '0')

    return hours * 3600 + minutes * 60 + seconds
  }

  // Parse video title to extract artist and title
  private parseVideoTitle(title: string): { artist: string; title: string } {
    // Common patterns: "Artist - Title", "Artist: Title", "Artist | Title"
    const patterns = [
      /^(.+?)\s*[-–—]\s*(.+)$/, // Artist - Title
      /^(.+?)\s*:\s*(.+)$/,     // Artist: Title
      /^(.+?)\s*\|\s*(.+)$/,    // Artist | Title
      /^(.+?)\s*•\s*(.+)$/      // Artist • Title
    ]

    for (const pattern of patterns) {
      const match = title.match(pattern)
      if (match) {
        return {
          artist: match[1].trim(),
          title: match[2].trim()
        }
      }
    }

    // If no pattern matches, assume the whole title is the song title
    return {
      artist: '',
      title: title.trim()
    }
  }

  // Search using API key (for public searches without OAuth)
  async searchTracksPublic(query: string, limit = 20): Promise<YouTubeTrack[]> {
    try {
      const response = await this.youtubeApi.search.list({
        key: process.env.YOUTUBE_API_KEY,
        part: ['snippet'],
        q: `${query} music`,
        type: ['video'],
        videoCategoryId: '10', // Music category
        maxResults: limit,
        order: 'relevance'
      })

      if (!response.data.items) return []

      // Get detailed video information
      const videoIds = response.data.items.map((item: any) => item.id.videoId)
      const videoDetails = await this.getVideoDetailsPublic(videoIds)

      return response.data.items
        .map((item: any, index: number) => this.mapYouTubeTrack(item, videoDetails[index]))
        .filter(Boolean)
    } catch (error) {
      console.error('Failed to search YouTube tracks (public):', error)
      return []
    }
  }

  // Get video details using API key
  private async getVideoDetailsPublic(videoIds: string[]): Promise<any[]> {
    try {
      const response = await this.youtubeApi.videos.list({
        key: process.env.YOUTUBE_API_KEY,
        part: ['snippet', 'contentDetails', 'statistics'],
        id: videoIds
      })

      return response.data.items || []
    } catch (error) {
      console.error('Failed to get video details (public):', error)
      return []
    }
  }
}

// Export singleton instance
export const youtubeMusicService = new YouTubeMusicService()
