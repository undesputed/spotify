import SpotifyWebApi from 'spotify-web-api-node'
import { supabaseService } from '@/lib/supabase/service'
import { supabaseServerService } from '@/lib/supabase/server'
import type { 
  Track as SupabaseTrack,
  Album as SupabaseAlbum,
  Artist as SupabaseArtist,
  TrackService as SupabaseTrackService,
  MusicService 
} from '@/lib/supabase/service'

// Unified interfaces for cross-service compatibility
export interface SpotifyTrack {
  id: string
  title: string
  artist: SpotifyArtist
  album: SpotifyAlbum
  duration: number
  streamUrl?: string
  previewUrl?: string
  isLiked: boolean
  playCount: number
  artwork: string
  genres: string[]
  releaseDate: string
  serviceId: 'spotify'
  originalId: string
  availableServices: MusicService[]
  quality: 'low' | 'medium' | 'high' | 'lossless'
}

export interface SpotifyArtist {
  id: string
  name: string
  image: string
  followers: number
  isFollowed: boolean
  genres: string[]
  bio?: string
  serviceId: 'spotify'
  originalId: string
  availableServices: MusicService[]
}

export interface SpotifyAlbum {
  id: string
  title: string
  artist: SpotifyArtist
  artwork: string
  releaseDate: string
  tracks: SpotifyTrack[]
  totalTracks: number
  duration: number
  genres: string[]
  type: 'album' | 'single' | 'ep'
  serviceId: 'spotify'
  originalId: string
  availableServices: MusicService[]
}

export interface SpotifyPlaylist {
  id: string
  title: string
  description?: string
  creator: {
    id: string
    name: string
    image?: string
  }
  tracks: SpotifyTrack[]
  artwork: string
  isPublic: boolean
  isLiked: boolean
  followers: number
  createdAt: string
  updatedAt: string
  serviceId: 'spotify'
  originalId: string
  availableServices: MusicService[]
}

export class SpotifyService {
  private spotifyApi: SpotifyWebApi
  private accessToken: string | null = null
  private refreshToken: string | null = null
  private expiresAt: number | null = null

  constructor() {
    this.spotifyApi = new SpotifyWebApi({
      clientId: process.env.SPOTIFY_CLIENT_ID!,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
      redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/spotify/callback`,
    })
  }

  // Initialize with user tokens
  async initialize(userId: string): Promise<boolean> {
    try {
      const userServices = await supabaseService.getUserServices(userId)
      const spotifyService = userServices.find(s => s.service_id === 'spotify')
      
      if (!spotifyService || !spotifyService.access_token) {
        return false
      }

      this.accessToken = spotifyService.access_token
      this.refreshToken = spotifyService.refresh_token
      this.expiresAt = spotifyService.expires_at ? new Date(spotifyService.expires_at).getTime() : null

      this.spotifyApi.setAccessToken(this.accessToken)
      
      // Refresh token if expired
      if (this.expiresAt && Date.now() >= this.expiresAt) {
        await this.refreshAccessToken(userId)
      }

      return true
    } catch (error) {
      console.error('Failed to initialize Spotify service:', error)
      return false
    }
  }

  // Refresh access token
  private async refreshAccessToken(userId: string): Promise<void> {
    if (!this.refreshToken) throw new Error('No refresh token available')

    try {
      this.spotifyApi.setRefreshToken(this.refreshToken)
      const { body } = await this.spotifyApi.refreshAccessToken()
      
      this.accessToken = body.access_token
      this.expiresAt = Date.now() + (body.expires_in * 1000)
      
      this.spotifyApi.setAccessToken(this.accessToken)

      // Update tokens in database
      await supabaseService.connectService({
        user_id: userId,
        service_id: 'spotify',
        access_token: this.accessToken,
        refresh_token: this.refreshToken,
        expires_at: new Date(this.expiresAt).toISOString(),
        is_active: true,
      })
    } catch (error) {
      console.error('Failed to refresh Spotify access token:', error)
      throw error
    }
  }

  // Get authorization URL for OAuth
  getAuthorizationUrl(state?: string): string {
    const scopes = [
      'user-read-private',
      'user-read-email',
      'user-library-read',
      'user-library-modify',
      'playlist-read-private',
      'playlist-read-collaborative',
      'playlist-modify-public',
      'playlist-modify-private',
      'user-read-playback-state',
      'user-modify-playback-state',
      'user-read-currently-playing',
      'user-read-recently-played',
      'user-top-read',
      'streaming',
    ]

    return this.spotifyApi.createAuthorizeURL(scopes, state || 'state')
  }

  // Handle OAuth callback
  async handleCallback(code: string, userId: string): Promise<void> {
    try {
      const { body } = await this.spotifyApi.authorizationCodeGrant(code)
      
      this.accessToken = body.access_token
      this.refreshToken = body.refresh_token
      this.expiresAt = Date.now() + (body.expires_in * 1000)

      // Get user profile
      this.spotifyApi.setAccessToken(this.accessToken)
      const { body: profile } = await this.spotifyApi.getMe()

      // Save to database using server-side service (bypasses RLS)
      await supabaseServerService.connectService({
        user_id: userId,
        service_id: 'spotify',
        access_token: this.accessToken,
        refresh_token: this.refreshToken,
        expires_at: new Date(this.expiresAt).toISOString(),
        is_active: true,
        service_user_id: profile.id,
        service_username: profile.display_name || profile.id,
      })
    } catch (error) {
      console.error('Failed to handle Spotify callback:', error)
      
      // Check for specific Spotify API errors
      if (error && typeof error === 'object' && 'statusCode' in error) {
        if (error.statusCode === 403) {
          throw new Error('Spotify API 403: Invalid redirect URI. Please update your Spotify Developer Dashboard with the correct redirect URI: https://3d686033c4c8.ngrok-free.app/api/auth/spotify/callback')
        }
        
        if (error.statusCode === 400) {
          throw new Error('Spotify API 400: Invalid authorization code. This usually means the code has expired or been used already.')
        }
      }
      
      throw error
    }
  }

  // Search tracks
  async searchTracks(query: string, limit = 20): Promise<SpotifyTrack[]> {
    try {
      const { body } = await this.spotifyApi.searchTracks(query, { limit })
      
      return await Promise.all(
        body.tracks?.items.map(track => this.mapSpotifyTrack(track)) || []
      )
    } catch (error) {
      console.error('Failed to search Spotify tracks:', error)
      return []
    }
  }

  // Get user's saved tracks
  async getLikedTracks(limit = 50, offset = 0): Promise<SpotifyTrack[]> {
    try {
      const { body } = await this.spotifyApi.getMySavedTracks({ limit, offset })
      
      return await Promise.all(
        body.items.map(item => this.mapSpotifyTrack(item.track))
      )
    } catch (error) {
      console.error('Failed to get liked tracks:', error)
      return []
    }
  }

  // Get user's playlists
  async getUserPlaylists(limit = 50, offset = 0): Promise<SpotifyPlaylist[]> {
    try {
      const { body } = await this.spotifyApi.getUserPlaylists({ limit, offset })
      
      return await Promise.all(
        body.items.map(playlist => this.mapSpotifyPlaylist(playlist))
      )
    } catch (error) {
      console.error('Failed to get user playlists:', error)
      return []
    }
  }

  // Get playlist tracks
  async getPlaylistTracks(playlistId: string): Promise<SpotifyTrack[]> {
    try {
      const { body } = await this.spotifyApi.getPlaylistTracks(playlistId)
      
      return await Promise.all(
        body.items
          .filter(item => item.track)
          .map(item => this.mapSpotifyTrack(item.track))
      )
    } catch (error) {
      console.error('Failed to get playlist tracks:', error)
      return []
    }
  }

  // Get user's top tracks
  async getTopTracks(limit = 20): Promise<SpotifyTrack[]> {
    try {
      const { body } = await this.spotifyApi.getMyTopTracks({ limit })
      
      return await Promise.all(
        body.items.map(track => this.mapSpotifyTrack(track))
      )
    } catch (error) {
      console.error('Failed to get top tracks:', error)
      return []
    }
  }

  // Get recently played tracks
  async getRecentlyPlayed(limit = 20): Promise<SpotifyTrack[]> {
    try {
      const { body } = await this.spotifyApi.getMyRecentlyPlayedTracks({ limit })
      
      return await Promise.all(
        body.items.map(item => this.mapSpotifyTrack(item.track))
      )
    } catch (error) {
      console.error('Failed to get recently played tracks:', error)
      return []
    }
  }

  // Get recommendations
  async getRecommendations(seedTracks?: string[], seedArtists?: string[], seedGenres?: string[], limit = 20): Promise<SpotifyTrack[]> {
    try {
      const { body } = await this.spotifyApi.getRecommendations({
        seed_tracks: seedTracks?.slice(0, 5),
        seed_artists: seedArtists?.slice(0, 5),
        seed_genres: seedGenres?.slice(0, 5),
        limit,
      })
      
      return await Promise.all(
        body.tracks.map(track => this.mapSpotifyTrack(track))
      )
    } catch (error) {
      console.error('Failed to get recommendations:', error)
      return []
    }
  }

  // Get track details
  async getTrack(trackId: string): Promise<SpotifyTrack | null> {
    try {
      const { body } = await this.spotifyApi.getTrack(trackId)
      return await this.mapSpotifyTrack(body)
    } catch (error) {
      console.error('Failed to get track:', error)
      return null
    }
  }

  // Get album details
  async getAlbum(albumId: string): Promise<SpotifyAlbum | null> {
    try {
      const { body } = await this.spotifyApi.getAlbum(albumId)
      return await this.mapSpotifyAlbum(body)
    } catch (error) {
      console.error('Failed to get album:', error)
      return null
    }
  }

  // Get artist details
  async getArtist(artistId: string): Promise<SpotifyArtist | null> {
    try {
      const { body } = await this.spotifyApi.getArtist(artistId)
      return await this.mapSpotifyArtist(body)
    } catch (error) {
      console.error('Failed to get artist:', error)
      return null
    }
  }

  // Map Spotify track to unified format
  private async mapSpotifyTrack(track: SpotifyApi.TrackObjectFull): Promise<SpotifyTrack> {
    try {
      // Check if track exists in our database
      let supabaseTrack = await this.findOrCreateTrack(track)
      
      return {
        id: supabaseTrack.id,
        title: track.name,
        artist: await this.mapSpotifyArtist(track.artists[0]),
        album: await this.mapSpotifyAlbum(track.album),
        duration: track.duration_ms / 1000, // Convert to seconds
        streamUrl: `spotify:track:${track.id}`,
        previewUrl: track.preview_url || undefined,
        isLiked: false, // Will be updated by user library
        playCount: 0, // Will be updated by analytics
        artwork: track.album.images && track.album.images.length > 0 ? track.album.images[0].url : '',
        genres: [], // Will be populated from artist
        releaseDate: track.album.release_date,
        serviceId: 'spotify',
        originalId: track.id,
        availableServices: ['spotify'],
        quality: 'high',
      }
    } catch (error) {
      console.error('Error mapping Spotify track:', error)
      // Return a minimal track object
      return {
        id: track.id,
        title: track.name,
        artist: {
          id: track.artists[0]?.id || 'unknown',
          name: track.artists[0]?.name || 'Unknown Artist',
          image: '',
          followers: 0,
          isFollowed: false,
          genres: [],
          serviceId: 'spotify',
          originalId: track.artists[0]?.id || 'unknown',
          availableServices: ['spotify'],
        },
        album: {
          id: track.album?.id || 'unknown',
          title: track.album?.name || 'Unknown Album',
          artist: {
            id: track.artists[0]?.id || 'unknown',
            name: track.artists[0]?.name || 'Unknown Artist',
            image: '',
            followers: 0,
            isFollowed: false,
            genres: [],
            serviceId: 'spotify',
            originalId: track.artists[0]?.id || 'unknown',
            availableServices: ['spotify'],
          },
          artwork: track.album?.images && track.album.images.length > 0 ? track.album.images[0].url : '',
          releaseDate: track.album?.release_date || '',
          tracks: [],
          totalTracks: track.album?.total_tracks || 0,
          duration: 0,
          genres: [],
          type: 'album',
          serviceId: 'spotify',
          originalId: track.album?.id || 'unknown',
          availableServices: ['spotify'],
        },
        duration: track.duration_ms / 1000,
        streamUrl: `spotify:track:${track.id}`,
        previewUrl: track.preview_url || undefined,
        isLiked: false,
        playCount: 0,
        artwork: track.album?.images && track.album.images.length > 0 ? track.album.images[0].url : '',
        genres: [],
        releaseDate: track.album?.release_date || '',
        serviceId: 'spotify',
        originalId: track.id,
        availableServices: ['spotify'],
        quality: 'high',
      }
    }
  }

  // Map Spotify artist to unified format
  private async mapSpotifyArtist(artist: SpotifyApi.ArtistObjectFull): Promise<SpotifyArtist> {
    // Check if artist exists in our database
    let supabaseArtist = await this.findOrCreateArtist(artist)
    
    return {
      id: supabaseArtist.id,
      name: artist.name,
      image: artist.images[0]?.url || '',
      followers: artist.followers?.total || 0,
      isFollowed: false, // Will be updated by user follows
      genres: artist.genres || [],
      bio: undefined, // Spotify doesn't provide bio in basic artist object
      serviceId: 'spotify',
      originalId: artist.id,
      availableServices: ['spotify'],
    }
  }

  // Map Spotify album to unified format
  private async mapSpotifyAlbum(album: SpotifyApi.AlbumObjectFull): Promise<SpotifyAlbum> {
    // Check if album exists in our database
    let supabaseAlbum = await this.findOrCreateAlbum(album)
    
    return {
      id: supabaseAlbum.id,
      title: album.name,
      artist: await this.mapSpotifyArtist(album.artists[0]),
      artwork: album.images[0]?.url || '',
      releaseDate: album.release_date,
      tracks: [], // Will be populated separately
      totalTracks: album.total_tracks,
      duration: 0, // Will be calculated from tracks
      genres: album.genres || [],
      type: album.album_type as 'album' | 'single' | 'ep',
      serviceId: 'spotify',
      originalId: album.id,
      availableServices: ['spotify'],
    }
  }

  // Map Spotify playlist to unified format
  private async mapSpotifyPlaylist(playlist: SpotifyApi.PlaylistObjectSimplified): Promise<SpotifyPlaylist> {
    return {
      id: playlist.id,
      title: playlist.name,
      description: playlist.description || undefined,
      creator: {
        id: playlist.owner.id,
        name: playlist.owner.display_name || playlist.owner.id,
        image: undefined, // Will be fetched separately if needed
      },
      tracks: [], // Will be populated separately
      artwork: playlist.images[0]?.url || '',
      isPublic: playlist.public,
      isLiked: false, // Will be updated by user library
      followers: playlist.followers?.total || 0,
      createdAt: playlist.created_at,
      updatedAt: new Date().toISOString(), // Spotify doesn't provide this
      serviceId: 'spotify',
      originalId: playlist.id,
      availableServices: ['spotify'],
    }
  }

  // Find or create track in database
  private async findOrCreateTrack(track: SpotifyApi.TrackObjectFull): Promise<SupabaseTrack> {
    try {
      // First try to find by ISRC
      if (track.external_ids?.isrc) {
        const existingTrack = await supabaseService.searchTracks(track.external_ids.isrc, 1)
        if (existingTrack.length > 0) {
          return existingTrack[0]
        }
      }

      // Create new track
      const artist = await this.findOrCreateArtist(track.artists[0])
      const album = await this.findOrCreateAlbum(track.album)

      const newTrack = await supabaseService.createTrack({
        title: track.name,
        artist_id: artist.id,
        album_id: album.id,
        duration: Math.floor(track.duration_ms / 1000),
        track_number: track.track_number,
        disc_number: track.disc_number,
        isrc: track.external_ids?.isrc || null,
        external_url: track.external_urls?.spotify || null,
      })

      // Add Spotify service mapping
      await supabaseService.addTrackService({
        track_id: newTrack.id,
        service_id: 'spotify',
        service_track_id: track.id,
        stream_url: `spotify:track:${track.id}`,
        preview_url: track.preview_url || null,
        quality: 'high',
        is_available: true,
      })

      return newTrack
    } catch (error) {
      console.error('Error creating track:', error)
      
      // Return a mock track object if database creation fails
      return {
        id: `mock-track-${track.id}`,
        title: track.name,
        artist_id: `mock-${track.artists[0].id}`,
        album_id: `mock-album-${track.album.id}`,
        duration: Math.floor(track.duration_ms / 1000),
        track_number: track.track_number,
        disc_number: track.disc_number,
        isrc: track.external_ids?.isrc || null,
        external_url: track.external_urls?.spotify || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    }
  }

  // Find or create artist in database
  private async findOrCreateArtist(artist: SpotifyApi.ArtistObjectFull): Promise<SupabaseArtist> {
    try {
      const existingArtists = await supabaseService.searchArtists(artist.name, 1)
      if (existingArtists.length > 0) {
        return existingArtists[0]
      }

      return await supabaseService.createArtist({
        name: artist.name,
        image_url: artist.images && artist.images.length > 0 ? artist.images[0].url : null,
        bio: null, // Spotify doesn't provide bio in basic artist object
        genres: artist.genres || [],
        external_url: artist.external_urls?.spotify || null,
      })
    } catch (error) {
      console.error('Error mapping Spotify track:', error)
      
      // Return a mock artist object if database creation fails
      return {
        id: `mock-${artist.id}`,
        name: artist.name,
        image_url: artist.images && artist.images.length > 0 ? artist.images[0].url : null,
        bio: null,
        genres: artist.genres || [],
        external_url: artist.external_urls?.spotify || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    }
  }

  // Find or create album in database
  private async findOrCreateAlbum(album: SpotifyApi.AlbumObjectFull): Promise<SupabaseAlbum> {
    try {
      const existingAlbums = await supabaseService.searchAlbums(album.name, 1)
      if (existingAlbums.length > 0) {
        return existingAlbums[0]
      }

      const artist = await this.findOrCreateArtist(album.artists[0])

      return await supabaseService.createAlbum({
        title: album.name,
        artist_id: artist.id,
        artwork_url: album.images && album.images.length > 0 ? album.images[0].url : null,
        release_date: album.release_date,
        total_tracks: album.total_tracks,
        duration: 0, // Will be calculated from tracks
        genres: album.genres || [],
        album_type: album.album_type as 'album' | 'single' | 'ep',
        external_url: album.external_urls?.spotify || null,
      })
    } catch (error) {
      console.error('Error creating album:', error)
      
      // Return a mock album object if database creation fails
      return {
        id: `mock-album-${album.id}`,
        title: album.name,
        artist_id: `mock-${album.artists[0].id}`,
        artwork_url: album.images && album.images.length > 0 ? album.images[0].url : null,
        release_date: album.release_date,
        total_tracks: album.total_tracks,
        duration: 0,
        genres: album.genres || [],
        album_type: album.album_type as 'album' | 'single' | 'ep',
        external_url: album.external_urls?.spotify || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    }
  }

  // Add track service mapping (helper method)
  private async addTrackService(trackService: {
    track_id: string
    service_id: MusicService
    service_track_id: string
    stream_url?: string | null
    preview_url?: string | null
    quality?: 'low' | 'medium' | 'high' | 'lossless'
    is_available?: boolean
  }): Promise<void> {
    // This would be implemented in the SupabaseService
    // For now, we'll use the direct Supabase client
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    
    await supabase
      .from('track_services')
      .insert(trackService)
  }

  // Helper methods for SupabaseService (these would be added to the service)
  private async createTrack(trackData: any): Promise<SupabaseTrack> {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('tracks')
      .insert(trackData)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  private async createArtist(artistData: any): Promise<SupabaseArtist> {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('artists')
      .insert(artistData)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  private async createAlbum(albumData: any): Promise<SupabaseAlbum> {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('albums')
      .insert(albumData)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

// Export singleton instance
export const spotifyService = new SpotifyService()
