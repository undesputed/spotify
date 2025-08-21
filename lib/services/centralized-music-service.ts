import { supabaseService } from '@/lib/supabase/service'
import { spotifyService } from '@/lib/services/spotify-service'
import { youtubeMusicService } from '@/lib/services/youtube-music-service'

// Types for the centralized music platform
export interface ContentItem {
  id: number
  title: string
  artists: string[]
  album?: string
  duration_ms?: number
  isrc?: string
  release_date?: string
  genre?: string
  language?: string
  explicit: boolean
  thumbnails?: any
  external?: any
  created_at: string
  updated_at: string
}

export interface AudioSource {
  id: number
  content_item_id: number
  kind: 'artist_uploaded' | 'open_cc' | 'public_domain' | 'licensed'
  url?: string
  storage_key?: string
  license: string
  bitrate?: number
  format?: string
  hls_manifest_url?: string
  status: 'active' | 'blocked' | 'pending_review' | 'processing'
  uploaded_by?: string
  created_at: string
  updated_at: string
}

export interface PlayableTrack {
  id: string
  title: string
  artists: string[]
  album?: string
  duration: number
  artwork: string
  // Playback sources
  playable_source?: AudioSource
  spotify_id?: string
  youtube_video_id?: string
  // External links
  spotify_url?: string
  youtube_url?: string
  // Metadata
  genre?: string
  explicit: boolean
  // Platform info
  available_platforms: string[]
  primary_platform: string
}

export interface ContentMatch {
  id: number
  external_id: string
  external_platform: string
  content_item_id: number
  source_id?: number
  match_confidence: number
  match_method: string
  created_at: string
}

export class CentralizedMusicService {
  // Search across all platforms and resolve playable sources
  async searchTracks(query: string, limit = 20): Promise<PlayableTrack[]> {
    try {
      // 1. Search Spotify (for metadata)
      const spotifyTracks = await spotifyService.searchTracks(query, limit)
      
      // 2. Search YouTube (for metadata)
      const youtubeTracks = await youtubeMusicService.searchTracksPublic(query, limit)
      
      // 3. Search our own catalog
      const ownTracks = await this.searchOwnCatalog(query, limit)
      
      // 4. Merge and resolve playable sources
      const mergedTracks = await this.mergeAndResolveTracks([
        ...spotifyTracks.map(t => ({ ...t, platform: 'spotify' })),
        ...youtubeTracks.map(t => ({ ...t, platform: 'youtube' })),
        ...ownTracks.map(t => ({ ...t, platform: 'own' }))
      ])
      
      return mergedTracks.slice(0, limit)
    } catch (error) {
      console.error('Centralized search error:', error)
      return []
    }
  }

  // Search our own catalog
  private async searchOwnCatalog(query: string, limit: number): Promise<any[]> {
    try {
      const { data: contentItems, error } = await supabaseService.supabase
        .from('content_items')
        .select(`
          *,
          sources!inner(*)
        `)
        .textSearch('title', query)
        .eq('sources.status', 'active')
        .limit(limit)

      if (error) throw error

      return contentItems?.map(item => ({
        id: `own_${item.id}`,
        title: item.title,
        artists: item.artists,
        album: item.album,
        duration: item.duration_ms ? Math.floor(item.duration_ms / 1000) : 0,
        artwork: item.thumbnails?.medium || '',
        playable_source: item.sources?.[0],
        genre: item.genre,
        explicit: item.explicit
      })) || []
    } catch (error) {
      console.error('Own catalog search error:', error)
      return []
    }
  }

  // Merge tracks from different platforms and resolve playable sources
  private async mergeAndResolveTracks(tracks: any[]): Promise<PlayableTrack[]> {
    const resolvedTracks: PlayableTrack[] = []

    for (const track of tracks) {
      try {
        // Try to find a playable source for this track
        const playableSource = await this.resolvePlayableSource(track)
        
        const resolvedTrack: PlayableTrack = {
          id: track.id,
          title: track.title,
          artists: track.artists,
          album: track.album,
          duration: track.duration,
          artwork: track.artwork,
          playable_source: playableSource,
          spotify_id: track.spotify_id,
          youtube_video_id: track.videoId,
          spotify_url: track.spotify_id ? `https://open.spotify.com/track/${track.spotify_id}` : undefined,
          youtube_url: track.videoId ? `https://www.youtube.com/watch?v=${track.videoId}` : undefined,
          genre: track.genre,
          explicit: track.explicit || false,
          available_platforms: this.getAvailablePlatforms(track, playableSource),
          primary_platform: playableSource ? 'own' : track.platform
        }

        resolvedTracks.push(resolvedTrack)
      } catch (error) {
        console.error('Error resolving track:', error)
      }
    }

    return resolvedTracks
  }

  // Resolve a playable source for a track
  private async resolvePlayableSource(track: any): Promise<AudioSource | undefined> {
    try {
      // 1. Try to find existing content match
      const match = await this.findContentMatch(track)
      
      if (match?.source_id) {
        // Get the playable source
        const { data: source } = await supabaseService.supabase
          .from('sources')
          .select('*')
          .eq('id', match.source_id)
          .eq('status', 'active')
          .single()

        return source || undefined
      }

      // 2. Try to match by ISRC if available
      if (track.isrc) {
        const { data: contentItem } = await supabaseService.supabase
          .from('content_items')
          .select(`
            *,
            sources!inner(*)
          `)
          .eq('isrc', track.isrc)
          .eq('sources.status', 'active')
          .single()

        if (contentItem?.sources?.[0]) {
          return contentItem.sources[0]
        }
      }

      // 3. Try fuzzy matching by title and artist
      const fuzzyMatch = await this.fuzzyMatchTrack(track)
      return fuzzyMatch

    } catch (error) {
      console.error('Error resolving playable source:', error)
      return undefined
    }
  }

  // Find existing content match
  private async findContentMatch(track: any): Promise<ContentMatch | undefined> {
    try {
      let externalId = ''
      let platform = ''

      if (track.spotify_id) {
        externalId = track.spotify_id
        platform = 'spotify'
      } else if (track.videoId) {
        externalId = track.videoId
        platform = 'youtube'
      } else {
        return undefined
      }

      const { data: match } = await supabaseService.supabase
        .from('content_matches')
        .select('*')
        .eq('external_id', externalId)
        .eq('external_platform', platform)
        .single()

      return match || undefined
    } catch (error) {
      return undefined
    }
  }

  // Fuzzy match track by title and artist
  private async fuzzyMatchTrack(track: any): Promise<AudioSource | undefined> {
    try {
      // Normalize title and artist for matching
      const normalizedTitle = this.normalizeText(track.title)
      const normalizedArtists = track.artists.map((artist: string) => this.normalizeText(artist))

      // Search for similar content items
      const { data: contentItems } = await supabaseService.supabase
        .from('content_items')
        .select(`
          *,
          sources!inner(*)
        `)
        .textSearch('title', normalizedTitle)
        .eq('sources.status', 'active')

      if (!contentItems) return undefined

      // Find best match by title similarity and artist overlap
      let bestMatch: any = null
      let bestScore = 0

      for (const item of contentItems) {
        const titleSimilarity = this.calculateSimilarity(normalizedTitle, this.normalizeText(item.title))
        const artistOverlap = this.calculateArtistOverlap(normalizedArtists, item.artists)
        const durationMatch = track.duration && item.duration_ms 
          ? Math.abs(track.duration - Math.floor(item.duration_ms / 1000)) <= 3 
          : false

        const score = (titleSimilarity * 0.6) + (artistOverlap * 0.3) + (durationMatch ? 0.1 : 0)

        if (score > bestScore && score > 0.7) { // Minimum threshold
          bestScore = score
          bestMatch = item
        }
      }

      return bestMatch?.sources?.[0] || undefined
    } catch (error) {
      console.error('Fuzzy match error:', error)
      return undefined
    }
  }

  // Get available platforms for a track
  private getAvailablePlatforms(track: any, playableSource?: AudioSource): string[] {
    const platforms: string[] = []

    if (playableSource) {
      platforms.push('own')
    }
    if (track.spotify_id) {
      platforms.push('spotify')
    }
    if (track.videoId) {
      platforms.push('youtube')
    }

    return platforms
  }

  // Utility functions for text matching
  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove punctuation
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()
  }

  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2
    const shorter = str1.length > str2.length ? str2 : str1

    if (longer.length === 0) return 1.0

    const editDistance = this.levenshteinDistance(longer, shorter)
    return (longer.length - editDistance) / longer.length
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null))

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // deletion
          matrix[j - 1][i] + 1, // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        )
      }
    }

    return matrix[str2.length][str1.length]
  }

  private calculateArtistOverlap(artists1: string[], artists2: string[]): number {
    const set1 = new Set(artists1)
    const set2 = new Set(artists2)
    const intersection = new Set([...set1].filter(x => set2.has(x)))
    const union = new Set([...set1, ...set2])
    
    return union.size > 0 ? intersection.size / union.size : 0
  }

  // Create content match for external track
  async createContentMatch(externalId: string, platform: string, contentItemId: number, sourceId?: number): Promise<void> {
    try {
      await supabaseService.supabase
        .from('content_matches')
        .upsert({
          external_id: externalId,
          external_platform: platform,
          content_item_id: contentItemId,
          source_id: sourceId,
          match_confidence: sourceId ? 1.0 : 0.0,
          match_method: sourceId ? 'manual_match' : 'metadata_only'
        })
    } catch (error) {
      console.error('Error creating content match:', error)
    }
  }

  // Get track details with all available sources
  async getTrackDetails(trackId: string): Promise<PlayableTrack | null> {
    try {
      // Parse track ID to determine source
      const [platform, id] = trackId.split('_', 2)

      let track: any = null

      switch (platform) {
        case 'spotify':
          // Get from Spotify API
          break
        case 'youtube':
          // Get from YouTube API
          break
        case 'own':
          // Get from our database
          const { data: contentItem } = await supabaseService.supabase
            .from('content_items')
            .select(`
              *,
              sources(*)
            `)
            .eq('id', id)
            .single()

          if (contentItem) {
            track = {
              id: `own_${contentItem.id}`,
              title: contentItem.title,
              artists: contentItem.artists,
              album: contentItem.album,
              duration: contentItem.duration_ms ? Math.floor(contentItem.duration_ms / 1000) : 0,
              artwork: contentItem.thumbnails?.medium || '',
              playable_source: contentItem.sources?.find((s: any) => s.status === 'active'),
              genre: contentItem.genre,
              explicit: contentItem.explicit
            }
          }
          break
      }

      if (!track) return null

      // Resolve playable source
      const playableSource = await this.resolvePlayableSource(track)

      return {
        ...track,
        playable_source: playableSource,
        available_platforms: this.getAvailablePlatforms(track, playableSource),
        primary_platform: playableSource ? 'own' : platform
      }
    } catch (error) {
      console.error('Error getting track details:', error)
      return null
    }
  }

  // Record play analytics
  async recordPlay(userId: string, sourceId: number, contentItemId: number, msListened: number = 0): Promise<void> {
    try {
      await supabaseService.supabase
        .from('plays')
        .insert({
          user_id: userId,
          source_id: sourceId,
          content_item_id: contentItemId,
          ms_listened: msListened,
          completed: msListened > 0,
          platform: 'web'
        })
    } catch (error) {
      console.error('Error recording play:', error)
    }
  }

  // Get user's listening history
  async getListeningHistory(userId: string, limit = 50): Promise<PlayableTrack[]> {
    try {
      const { data: plays } = await supabaseService.supabase
        .from('plays')
        .select(`
          *,
          content_items(*),
          sources(*)
        `)
        .eq('user_id', userId)
        .order('started_at', { ascending: false })
        .limit(limit)

      if (!plays) return []

      return plays.map(play => ({
        id: `own_${play.content_items.id}`,
        title: play.content_items.title,
        artists: play.content_items.artists,
        album: play.content_items.album,
        duration: play.content_items.duration_ms ? Math.floor(play.content_items.duration_ms / 1000) : 0,
        artwork: play.content_items.thumbnails?.medium || '',
        playable_source: play.sources,
        genre: play.content_items.genre,
        explicit: play.content_items.explicit,
        available_platforms: play.sources ? ['own'] : [],
        primary_platform: 'own'
      }))
    } catch (error) {
      console.error('Error getting listening history:', error)
      return []
    }
  }
}

// Export singleton instance
export const centralizedMusicService = new CentralizedMusicService()
