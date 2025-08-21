export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          image_url: string | null
          is_premium: boolean
          subscription_tier: 'free' | 'premium' | 'family'
          subscription_expires_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          image_url?: string | null
          is_premium?: boolean
          subscription_tier?: 'free' | 'premium' | 'family'
          subscription_expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          image_url?: string | null
          is_premium?: boolean
          subscription_tier?: 'free' | 'premium' | 'family'
          subscription_expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_services: {
        Row: {
          id: string
          user_id: string
          service_id: 'spotify' | 'youtube' | 'apple' | 'local'
          access_token: string | null
          refresh_token: string | null
          expires_at: string | null
          is_active: boolean
          service_user_id: string | null
          service_username: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          service_id: 'spotify' | 'youtube' | 'apple' | 'local'
          access_token?: string | null
          refresh_token?: string | null
          expires_at?: string | null
          is_active?: boolean
          service_user_id?: string | null
          service_username?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          service_id?: 'spotify' | 'youtube' | 'apple' | 'local'
          access_token?: string | null
          refresh_token?: string | null
          expires_at?: string | null
          is_active?: boolean
          service_user_id?: string | null
          service_username?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      artists: {
        Row: {
          id: string
          name: string
          image_url: string | null
          bio: string | null
          genres: string[]
          external_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          image_url?: string | null
          bio?: string | null
          genres?: string[]
          external_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          image_url?: string | null
          bio?: string | null
          genres?: string[]
          external_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      albums: {
        Row: {
          id: string
          title: string
          artist_id: string
          artwork_url: string | null
          release_date: string | null
          total_tracks: number
          duration: number
          genres: string[]
          album_type: 'album' | 'single' | 'ep'
          external_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          artist_id: string
          artwork_url?: string | null
          release_date?: string | null
          total_tracks?: number
          duration?: number
          genres?: string[]
          album_type?: 'album' | 'single' | 'ep'
          external_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          artist_id?: string
          artwork_url?: string | null
          release_date?: string | null
          total_tracks?: number
          duration?: number
          genres?: string[]
          album_type?: 'album' | 'single' | 'ep'
          external_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tracks: {
        Row: {
          id: string
          title: string
          artist_id: string
          album_id: string | null
          duration: number
          track_number: number | null
          disc_number: number
          isrc: string | null
          external_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          artist_id: string
          album_id?: string | null
          duration: number
          track_number?: number | null
          disc_number?: number
          isrc?: string | null
          external_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          artist_id?: string
          album_id?: string | null
          duration?: number
          track_number?: number | null
          disc_number?: number
          isrc?: string | null
          external_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      track_services: {
        Row: {
          id: string
          track_id: string
          service_id: 'spotify' | 'youtube' | 'apple' | 'local'
          service_track_id: string
          stream_url: string | null
          preview_url: string | null
          quality: 'low' | 'medium' | 'high' | 'lossless'
          is_available: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          track_id: string
          service_id: 'spotify' | 'youtube' | 'apple' | 'local'
          service_track_id: string
          stream_url?: string | null
          preview_url?: string | null
          quality?: 'low' | 'medium' | 'high' | 'lossless'
          is_available?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          track_id?: string
          service_id?: 'spotify' | 'youtube' | 'apple' | 'local'
          service_track_id?: string
          stream_url?: string | null
          preview_url?: string | null
          quality?: 'low' | 'medium' | 'high' | 'lossless'
          is_available?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      playlists: {
        Row: {
          id: string
          title: string
          description: string | null
          creator_id: string
          artwork_url: string | null
          visibility: 'public' | 'private' | 'unlisted'
          is_collaborative: boolean
          follower_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          creator_id: string
          artwork_url?: string | null
          visibility?: 'public' | 'private' | 'unlisted'
          is_collaborative?: boolean
          follower_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          creator_id?: string
          artwork_url?: string | null
          visibility?: 'public' | 'private' | 'unlisted'
          is_collaborative?: boolean
          follower_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      playlist_tracks: {
        Row: {
          id: string
          playlist_id: string
          track_id: string
          position: number
          added_by: string | null
          added_at: string
        }
        Insert: {
          id?: string
          playlist_id: string
          track_id: string
          position: number
          added_by?: string | null
          added_at?: string
        }
        Update: {
          id?: string
          playlist_id?: string
          track_id?: string
          position?: number
          added_by?: string | null
          added_at?: string
        }
      }
      user_library: {
        Row: {
          id: string
          user_id: string
          track_id: string | null
          album_id: string | null
          artist_id: string | null
          playlist_id: string | null
          added_at: string
        }
        Insert: {
          id?: string
          user_id: string
          track_id?: string | null
          album_id?: string | null
          artist_id?: string | null
          playlist_id?: string | null
          added_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          track_id?: string | null
          album_id?: string | null
          artist_id?: string | null
          playlist_id?: string | null
          added_at?: string
        }
      }
      user_play_history: {
        Row: {
          id: string
          user_id: string
          track_id: string
          played_at: string
          play_duration: number | null
          service_id: 'spotify' | 'youtube' | 'apple' | 'local' | null
        }
        Insert: {
          id?: string
          user_id: string
          track_id: string
          played_at?: string
          play_duration?: number | null
          service_id?: 'spotify' | 'youtube' | 'apple' | 'local' | null
        }
        Update: {
          id?: string
          user_id?: string
          track_id?: string
          played_at?: string
          play_duration?: number | null
          service_id?: 'spotify' | 'youtube' | 'apple' | 'local' | null
        }
      }
      user_follows: {
        Row: {
          id: string
          follower_id: string
          following_user_id: string | null
          following_artist_id: string | null
          followed_at: string
        }
        Insert: {
          id?: string
          follower_id: string
          following_user_id?: string | null
          following_artist_id?: string | null
          followed_at?: string
        }
        Update: {
          id?: string
          follower_id?: string
          following_user_id?: string | null
          following_artist_id?: string | null
          followed_at?: string
        }
      }
      user_playlists: {
        Row: {
          id: string
          user_id: string
          playlist_id: string
          is_owner: boolean
          can_edit: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          playlist_id: string
          is_owner?: boolean
          can_edit?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          playlist_id?: string
          is_owner?: boolean
          can_edit?: boolean
          created_at?: string
        }
      }
      track_analytics: {
        Row: {
          id: string
          track_id: string
          play_count: number
          like_count: number
          share_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          track_id: string
          play_count?: number
          like_count?: number
          share_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          track_id?: string
          play_count?: number
          like_count?: number
          share_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      user_preferences: {
        Row: {
          id: string
          user_id: string
          preferred_quality: 'low' | 'medium' | 'high' | 'lossless'
          auto_play: boolean
          crossfade_duration: number
          gapless_playback: boolean
          normalize_volume: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          preferred_quality?: 'low' | 'medium' | 'high' | 'lossless'
          auto_play?: boolean
          crossfade_duration?: number
          gapless_playback?: boolean
          normalize_volume?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          preferred_quality?: 'low' | 'medium' | 'high' | 'lossless'
          auto_play?: boolean
          crossfade_duration?: number
          gapless_playback?: boolean
          normalize_volume?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      music_service: 'spotify' | 'youtube' | 'apple' | 'local'
      track_quality: 'low' | 'medium' | 'high' | 'lossless'
      album_type: 'album' | 'single' | 'ep'
      playlist_visibility: 'public' | 'private' | 'unlisted'
      subscription_tier: 'free' | 'premium' | 'family'
    }
  }
}
