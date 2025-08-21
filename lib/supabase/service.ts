import { createClient } from './client'
import type { Database } from './types'

type Tables = Database['public']['Tables']
type Enums = Database['public']['Enums']

// Type aliases for better readability
export type User = Tables['users']['Row']
export type UserInsert = Tables['users']['Insert']
export type UserUpdate = Tables['users']['Update']

export type Artist = Tables['artists']['Row']
export type ArtistInsert = Tables['artists']['Insert']
export type ArtistUpdate = Tables['artists']['Update']

export type Album = Tables['albums']['Row']
export type AlbumInsert = Tables['albums']['Insert']
export type AlbumUpdate = Tables['albums']['Update']

export type Track = Tables['tracks']['Row']
export type TrackInsert = Tables['tracks']['Insert']
export type TrackUpdate = Tables['tracks']['Update']

export type TrackService = Tables['track_services']['Row']
export type TrackServiceInsert = Tables['track_services']['Insert']

export type Playlist = Tables['playlists']['Row']
export type PlaylistInsert = Tables['playlists']['Insert']
export type PlaylistUpdate = Tables['playlists']['Update']

export type PlaylistTrack = Tables['playlist_tracks']['Row']
export type PlaylistTrackInsert = Tables['playlist_tracks']['Insert']

export type UserLibrary = Tables['user_library']['Row']
export type UserLibraryInsert = Tables['user_library']['Insert']

export type UserPlayHistory = Tables['user_play_history']['Row']
export type UserPlayHistoryInsert = Tables['user_play_history']['Insert']

export type UserService = Tables['user_services']['Row']
export type UserServiceInsert = Tables['user_services']['Insert']
export type UserServiceUpdate = Tables['user_services']['Update']

export type MusicService = Enums['music_service']
export type TrackQuality = Enums['track_quality']
export type AlbumType = Enums['album_type']
export type PlaylistVisibility = Enums['playlist_visibility']
export type SubscriptionTier = Enums['subscription_tier']

export class SupabaseService {
  private supabase = createClient()

  // =====================================================
  // USER OPERATIONS
  // =====================================================

  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await this.supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) throw error
    return data
  }

  async createUser(userData: UserInsert): Promise<User> {
    const { data, error } = await this.supabase
      .from('users')
      .insert(userData)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async updateUser(userId: string, updates: UserUpdate): Promise<User> {
    const { data, error } = await this.supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // =====================================================
  // ARTIST OPERATIONS
  // =====================================================

  async getArtists(limit = 50, offset = 0): Promise<Artist[]> {
    const { data, error } = await this.supabase
      .from('artists')
      .select('*')
      .order('name')
      .range(offset, offset + limit - 1)

    if (error) throw error
    return data
  }

  async getArtist(id: string): Promise<Artist | null> {
    const { data, error } = await this.supabase
      .from('artists')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }

  async searchArtists(query: string, limit = 20): Promise<Artist[]> {
    const { data, error } = await this.supabase
      .from('artists')
      .select('*')
      .ilike('name', `%${query}%`)
      .limit(limit)

    if (error) throw error
    return data
  }

  async createArtist(artistData: ArtistInsert): Promise<Artist> {
    const { data, error } = await this.supabase
      .from('artists')
      .insert(artistData)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // =====================================================
  // ALBUM OPERATIONS
  // =====================================================

  async getAlbums(limit = 50, offset = 0): Promise<Album[]> {
    const { data, error } = await this.supabase
      .from('albums')
      .select(`
        *,
        artist:artists(*)
      `)
      .order('release_date', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error
    return data
  }

  async getAlbum(id: string): Promise<Album | null> {
    const { data, error } = await this.supabase
      .from('albums')
      .select(`
        *,
        artist:artists(*),
        tracks:tracks(*)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }

  async getAlbumsByArtist(artistId: string): Promise<Album[]> {
    const { data, error } = await this.supabase
      .from('albums')
      .select('*')
      .eq('artist_id', artistId)
      .order('release_date', { ascending: false })

    if (error) throw error
    return data
  }

  async searchAlbums(query: string, limit = 20): Promise<Album[]> {
    const { data, error } = await this.supabase
      .from('albums')
      .select(`
        *,
        artist:artists(*)
      `)
      .ilike('title', `%${query}%`)
      .limit(limit)

    if (error) throw error
    return data
  }

  // =====================================================
  // TRACK OPERATIONS
  // =====================================================

  async getTracks(limit = 50, offset = 0): Promise<Track[]> {
    const { data, error } = await this.supabase
      .from('tracks')
      .select(`
        *,
        artist:artists(*),
        album:albums(*)
      `)
      .order('title')
      .range(offset, offset + limit - 1)

    if (error) throw error
    return data
  }

  async getTrack(id: string): Promise<Track | null> {
    const { data, error } = await this.supabase
      .from('tracks')
      .select(`
        *,
        artist:artists(*),
        album:albums(*),
        track_services(*)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }

  async getTracksByAlbum(albumId: string): Promise<Track[]> {
    const { data, error } = await this.supabase
      .from('tracks')
      .select(`
        *,
        artist:artists(*)
      `)
      .eq('album_id', albumId)
      .order('track_number')

    if (error) throw error
    return data
  }

  async searchTracks(query: string, limit = 20): Promise<Track[]> {
    const { data, error } = await this.supabase
      .from('tracks')
      .select(`
        *,
        artist:artists(*),
        album:albums(*)
      `)
      .ilike('title', `%${query}%`)
      .limit(limit)

    if (error) throw error
    return data
  }

  async createTrack(trackData: TrackInsert): Promise<Track> {
    const { data, error } = await this.supabase
      .from('tracks')
      .insert(trackData)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getTrackServices(trackId: string): Promise<TrackService[]> {
    const { data, error } = await this.supabase
      .from('track_services')
      .select('*')
      .eq('track_id', trackId)
      .eq('is_available', true)

    if (error) throw error
    return data
  }

  async addTrackService(trackServiceData: TrackServiceInsert): Promise<TrackService> {
    const { data, error } = await this.supabase
      .from('track_services')
      .insert(trackServiceData)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getBestStreamUrl(trackId: string, preferredQuality: TrackQuality = 'high'): Promise<string | null> {
    const { data, error } = await this.supabase
      .from('track_services')
      .select('stream_url, quality')
      .eq('track_id', trackId)
      .eq('is_available', true)
      .order('quality', { ascending: false })
      .limit(1)
      .single()

    if (error) throw error
    return data?.stream_url || null
  }

  // =====================================================
  // PLAYLIST OPERATIONS
  // =====================================================

  async getPlaylists(limit = 50, offset = 0): Promise<Playlist[]> {
    const { data, error } = await this.supabase
      .from('playlists')
      .select(`
        *,
        creator:users!creator_id(*)
      `)
      .eq('visibility', 'public')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error
    return data
  }

  async getUserPlaylists(userId: string): Promise<Playlist[]> {
    const { data, error } = await this.supabase
      .from('playlists')
      .select(`
        *,
        creator:users!creator_id(*)
      `)
      .eq('creator_id', userId)
      .order('updated_at', { ascending: false })

    if (error) throw error
    return data
  }

  async getPlaylist(id: string): Promise<Playlist | null> {
    const { data, error } = await this.supabase
      .from('playlists')
      .select(`
        *,
        creator:users!creator_id(*),
        playlist_tracks(
          position,
          track:tracks(
            *,
            artist:artists(*),
            album:albums(*)
          )
        )
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }

  async createPlaylist(playlistData: PlaylistInsert): Promise<Playlist> {
    const { data, error } = await this.supabase
      .from('playlists')
      .insert(playlistData)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async addTrackToPlaylist(playlistId: string, trackId: string, position?: number): Promise<void> {
    // Get the next position if not provided
    if (!position) {
      const { data: maxPosition } = await this.supabase
        .from('playlist_tracks')
        .select('position')
        .eq('playlist_id', playlistId)
        .order('position', { ascending: false })
        .limit(1)
        .single()

      position = (maxPosition?.position || 0) + 1
    }

    const { error } = await this.supabase
      .from('playlist_tracks')
      .insert({
        playlist_id: playlistId,
        track_id: trackId,
        position,
        added_by: (await this.getCurrentUser())?.id || null
      })

    if (error) throw error
  }

  // =====================================================
  // USER LIBRARY OPERATIONS
  // =====================================================

  async getUserLibrary(userId: string): Promise<UserLibrary[]> {
    const { data, error } = await this.supabase
      .from('user_library')
      .select(`
        *,
        track:tracks(
          *,
          artist:artists(*),
          album:albums(*)
        ),
        album:albums(
          *,
          artist:artists(*)
        ),
        artist:artists(*),
        playlist:playlists(
          *,
          creator:users!creator_id(*)
        )
      `)
      .eq('user_id', userId)
      .order('added_at', { ascending: false })

    if (error) throw error
    return data
  }

  async addToLibrary(libraryItem: UserLibraryInsert): Promise<UserLibrary> {
    const { data, error } = await this.supabase
      .from('user_library')
      .insert(libraryItem)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async removeFromLibrary(userId: string, itemId: string, itemType: 'track' | 'album' | 'artist' | 'playlist'): Promise<void> {
    const { error } = await this.supabase
      .from('user_library')
      .delete()
      .eq('user_id', userId)
      .eq(`${itemType}_id`, itemId)

    if (error) throw error
  }

  // =====================================================
  // PLAY HISTORY OPERATIONS
  // =====================================================

  async addPlayHistory(historyItem: UserPlayHistoryInsert): Promise<UserPlayHistory> {
    const { data, error } = await this.supabase
      .from('user_play_history')
      .insert(historyItem)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getUserPlayHistory(userId: string, limit = 50): Promise<UserPlayHistory[]> {
    const { data, error } = await this.supabase
      .from('user_play_history')
      .select(`
        *,
        track:tracks(
          *,
          artist:artists(*),
          album:albums(*)
        )
      `)
      .eq('user_id', userId)
      .order('played_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data
  }

  // =====================================================
  // SERVICE CONNECTION OPERATIONS
  // =====================================================

  async getUserServices(userId: string): Promise<UserService[]> {
    const { data, error } = await this.supabase
      .from('user_services')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)

    if (error) throw error
    return data
  }

  async connectService(serviceData: UserServiceInsert): Promise<UserService> {
    const { data, error } = await this.supabase
      .from('user_services')
      .upsert(serviceData, { onConflict: 'user_id,service_id' })
      .select()
      .single()

    if (error) throw error
    return data
  }

  async disconnectService(userId: string, serviceId: MusicService): Promise<void> {
    const { error } = await this.supabase
      .from('user_services')
      .update({ is_active: false })
      .eq('user_id', userId)
      .eq('service_id', serviceId)

    if (error) throw error
  }

  // =====================================================
  // SEARCH OPERATIONS
  // =====================================================

  async searchAll(query: string, limit = 20) {
    const [tracks, albums, artists, playlists] = await Promise.all([
      this.searchTracks(query, limit),
      this.searchAlbums(query, limit),
      this.searchArtists(query, limit),
      this.searchPlaylists(query, limit)
    ])

    return {
      tracks,
      albums,
      artists,
      playlists,
      query,
      total: tracks.length + albums.length + artists.length + playlists.length
    }
  }

  async searchPlaylists(query: string, limit = 20): Promise<Playlist[]> {
    const { data, error } = await this.supabase
      .from('playlists')
      .select(`
        *,
        creator:users!creator_id(*)
      `)
      .ilike('title', `%${query}%`)
      .eq('visibility', 'public')
      .limit(limit)

    if (error) throw error
    return data
  }
}

// Export a singleton instance
export const supabaseService = new SupabaseService()
