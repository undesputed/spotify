-- Missing Database Schema Components for Spotify Clone
-- Run this in your Supabase SQL Editor to add missing components
-- This script only adds what's missing from your existing database

-- Enable necessary extensions (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types (if they don't exist)
DO $$ BEGIN
    CREATE TYPE music_service AS ENUM ('spotify', 'youtube_music', 'apple_music', 'local');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE track_quality AS ENUM ('low', 'medium', 'high', 'lossless');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE album_type AS ENUM ('album', 'single', 'ep');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE playlist_visibility AS ENUM ('public', 'private', 'unlisted');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE subscription_tier AS ENUM ('free', 'premium', 'family', 'student');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create missing tables (if they don't exist)
-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id uuid NOT NULL,
    email text NOT NULL UNIQUE,
    name text NOT NULL,
    image_url text,
    is_premium boolean DEFAULT false,
    subscription_tier subscription_tier DEFAULT 'free'::subscription_tier,
    subscription_expires_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT users_pkey PRIMARY KEY (id),
    CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);

-- Artists table
CREATE TABLE IF NOT EXISTS public.artists (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    image_url text,
    bio text,
    genres text[],
    external_url text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT artists_pkey PRIMARY KEY (id)
);

-- Albums table
CREATE TABLE IF NOT EXISTS public.albums (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    title text NOT NULL,
    artist_id uuid NOT NULL,
    artwork_url text,
    release_date date,
    total_tracks integer DEFAULT 0,
    duration integer DEFAULT 0,
    genres text[],
    album_type album_type DEFAULT 'album'::album_type,
    external_url text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT albums_pkey PRIMARY KEY (id),
    CONSTRAINT albums_artist_id_fkey FOREIGN KEY (artist_id) REFERENCES public.artists(id)
);

-- Tracks table
CREATE TABLE IF NOT EXISTS public.tracks (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    title text NOT NULL,
    artist_id uuid NOT NULL,
    album_id uuid,
    duration integer NOT NULL,
    track_number integer,
    disc_number integer DEFAULT 1,
    isrc text,
    external_url text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT tracks_pkey PRIMARY KEY (id),
    CONSTRAINT tracks_album_id_fkey FOREIGN KEY (album_id) REFERENCES public.albums(id),
    CONSTRAINT tracks_artist_id_fkey FOREIGN KEY (artist_id) REFERENCES public.artists(id)
);

-- Track services table (links tracks to external services)
CREATE TABLE IF NOT EXISTS public.track_services (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    track_id uuid NOT NULL,
    service_id music_service NOT NULL,
    service_track_id text NOT NULL,
    stream_url text,
    preview_url text,
    quality track_quality DEFAULT 'medium'::track_quality,
    is_available boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT track_services_pkey PRIMARY KEY (id),
    CONSTRAINT track_services_track_id_fkey FOREIGN KEY (track_id) REFERENCES public.tracks(id)
);

-- Playlists table
CREATE TABLE IF NOT EXISTS public.playlists (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    title text NOT NULL,
    description text,
    creator_id uuid NOT NULL,
    artwork_url text,
    visibility playlist_visibility DEFAULT 'private'::playlist_visibility,
    is_collaborative boolean DEFAULT false,
    follower_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT playlists_pkey PRIMARY KEY (id),
    CONSTRAINT playlists_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.users(id)
);

-- Playlist tracks table
CREATE TABLE IF NOT EXISTS public.playlist_tracks (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    playlist_id uuid NOT NULL,
    track_id uuid NOT NULL,
    position integer NOT NULL,
    added_by uuid,
    added_at timestamp with time zone DEFAULT now(),
    CONSTRAINT playlist_tracks_pkey PRIMARY KEY (id),
    CONSTRAINT playlist_tracks_playlist_id_fkey FOREIGN KEY (playlist_id) REFERENCES public.playlists(id),
    CONSTRAINT playlist_tracks_added_by_fkey FOREIGN KEY (added_by) REFERENCES public.users(id),
    CONSTRAINT playlist_tracks_track_id_fkey FOREIGN KEY (track_id) REFERENCES public.tracks(id)
);

-- User library table
CREATE TABLE IF NOT EXISTS public.user_library (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL,
    track_id uuid,
    album_id uuid,
    artist_id uuid,
    playlist_id uuid,
    added_at timestamp with time zone DEFAULT now(),
    CONSTRAINT user_library_pkey PRIMARY KEY (id),
    CONSTRAINT user_library_album_id_fkey FOREIGN KEY (album_id) REFERENCES public.albums(id),
    CONSTRAINT user_library_artist_id_fkey FOREIGN KEY (artist_id) REFERENCES public.artists(id),
    CONSTRAINT user_library_playlist_id_fkey FOREIGN KEY (playlist_id) REFERENCES public.playlists(id),
    CONSTRAINT user_library_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
    CONSTRAINT user_library_track_id_fkey FOREIGN KEY (track_id) REFERENCES public.tracks(id)
);

-- User play history table
CREATE TABLE IF NOT EXISTS public.user_play_history (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL,
    track_id uuid NOT NULL,
    played_at timestamp with time zone DEFAULT now(),
    play_duration integer,
    service_id music_service,
    CONSTRAINT user_play_history_pkey PRIMARY KEY (id),
    CONSTRAINT user_play_history_track_id_fkey FOREIGN KEY (track_id) REFERENCES public.tracks(id),
    CONSTRAINT user_play_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);

-- User services table (OAuth connections)
CREATE TABLE IF NOT EXISTS public.user_services (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL,
    service_id music_service NOT NULL,
    access_token text,
    refresh_token text,
    expires_at timestamp with time zone,
    is_active boolean DEFAULT true,
    service_user_id text,
    service_username text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT user_services_pkey PRIMARY KEY (id),
    CONSTRAINT user_services_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);

-- User follows table
CREATE TABLE IF NOT EXISTS public.user_follows (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    follower_id uuid NOT NULL,
    following_user_id uuid,
    following_artist_id uuid,
    followed_at timestamp with time zone DEFAULT now(),
    CONSTRAINT user_follows_pkey PRIMARY KEY (id),
    CONSTRAINT user_follows_following_artist_id_fkey FOREIGN KEY (following_artist_id) REFERENCES public.artists(id),
    CONSTRAINT user_follows_following_user_id_fkey FOREIGN KEY (following_user_id) REFERENCES public.users(id),
    CONSTRAINT user_follows_follower_id_fkey FOREIGN KEY (follower_id) REFERENCES public.users(id)
);

-- User playlists table (junction table for playlist access)
CREATE TABLE IF NOT EXISTS public.user_playlists (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL,
    playlist_id uuid NOT NULL,
    is_owner boolean DEFAULT false,
    can_edit boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT user_playlists_pkey PRIMARY KEY (id),
    CONSTRAINT user_playlists_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
    CONSTRAINT user_playlists_playlist_id_fkey FOREIGN KEY (playlist_id) REFERENCES public.playlists(id)
);

-- User preferences table
CREATE TABLE IF NOT EXISTS public.user_preferences (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL UNIQUE,
    preferred_quality track_quality DEFAULT 'medium'::track_quality,
    auto_play boolean DEFAULT true,
    crossfade_duration integer DEFAULT 0,
    gapless_playback boolean DEFAULT true,
    normalize_volume boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT user_preferences_pkey PRIMARY KEY (id),
    CONSTRAINT user_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);

-- Track analytics table
CREATE TABLE IF NOT EXISTS public.track_analytics (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    track_id uuid NOT NULL,
    play_count integer DEFAULT 0,
    like_count integer DEFAULT 0,
    share_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT track_analytics_pkey PRIMARY KEY (id),
    CONSTRAINT track_analytics_track_id_fkey FOREIGN KEY (track_id) REFERENCES public.tracks(id)
);

-- Create missing indexes (if they don't exist)
CREATE INDEX IF NOT EXISTS idx_tracks_artist_id ON public.tracks(artist_id);
CREATE INDEX IF NOT EXISTS idx_tracks_album_id ON public.tracks(album_id);
CREATE INDEX IF NOT EXISTS idx_albums_artist_id ON public.albums(artist_id);
CREATE INDEX IF NOT EXISTS idx_playlist_tracks_playlist_id ON public.playlist_tracks(playlist_id);
CREATE INDEX IF NOT EXISTS idx_playlist_tracks_position ON public.playlist_tracks(position);
CREATE INDEX IF NOT EXISTS idx_user_library_user_id ON public.user_library(user_id);
CREATE INDEX IF NOT EXISTS idx_user_play_history_user_id ON public.user_play_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_play_history_played_at ON public.user_play_history(played_at);
CREATE INDEX IF NOT EXISTS idx_user_services_user_id ON public.user_services(user_id);
CREATE INDEX IF NOT EXISTS idx_track_services_track_id ON public.track_services(track_id);
CREATE INDEX IF NOT EXISTS idx_track_services_service_id ON public.track_services(service_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_follower_id ON public.user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following_user_id ON public.user_follows(following_user_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following_artist_id ON public.user_follows(following_artist_id);
CREATE INDEX IF NOT EXISTS idx_user_playlists_user_id ON public.user_playlists(user_id);
CREATE INDEX IF NOT EXISTS idx_user_playlists_playlist_id ON public.user_playlists(playlist_id);

-- Enable Row Level Security (RLS) on tables that might not have it enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.track_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_play_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.track_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_playlists ENABLE ROW LEVEL SECURITY;

-- Create missing policies (only if they don't exist)
-- Users policies
DO $$ BEGIN
    CREATE POLICY "Users can view own profile" ON public.users
        FOR SELECT USING (auth.uid() = id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can update own profile" ON public.users
        FOR UPDATE USING (auth.uid() = id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can insert own profile" ON public.users
        FOR INSERT WITH CHECK (auth.uid() = id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Public read access policies
DO $$ BEGIN
    CREATE POLICY "Public read access for artists" ON public.artists
        FOR SELECT USING (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Public read access for albums" ON public.albums
        FOR SELECT USING (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Public read access for tracks" ON public.tracks
        FOR SELECT USING (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Public read access for track services" ON public.track_services
        FOR SELECT USING (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Playlist policies
DO $$ BEGIN
    CREATE POLICY "Users can view public playlists" ON public.playlists
        FOR SELECT USING (visibility = 'public' OR creator_id = auth.uid());
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can create playlists" ON public.playlists
        FOR INSERT WITH CHECK (creator_id = auth.uid());
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can update own playlists" ON public.playlists
        FOR UPDATE USING (creator_id = auth.uid());
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can delete own playlists" ON public.playlists
        FOR DELETE USING (creator_id = auth.uid());
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Playlist tracks policies
DO $$ BEGIN
    CREATE POLICY "Users can view playlist tracks" ON public.playlist_tracks
        FOR SELECT USING (
            EXISTS (
                SELECT 1 FROM public.playlists 
                WHERE id = playlist_id 
                AND (visibility = 'public' OR creator_id = auth.uid())
            )
        );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can add tracks to own playlists" ON public.playlist_tracks
        FOR INSERT WITH CHECK (
            EXISTS (
                SELECT 1 FROM public.playlists 
                WHERE id = playlist_id 
                AND creator_id = auth.uid()
            )
        );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can remove tracks from own playlists" ON public.playlist_tracks
        FOR DELETE USING (
            EXISTS (
                SELECT 1 FROM public.playlists 
                WHERE id = playlist_id 
                AND creator_id = auth.uid()
            )
        );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- User library policies
DO $$ BEGIN
    CREATE POLICY "Users can view own library" ON public.user_library
        FOR SELECT USING (user_id = auth.uid());
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can add to own library" ON public.user_library
        FOR INSERT WITH CHECK (user_id = auth.uid());
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can remove from own library" ON public.user_library
        FOR DELETE USING (user_id = auth.uid());
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- User play history policies
DO $$ BEGIN
    CREATE POLICY "Users can view own play history" ON public.user_play_history
        FOR SELECT USING (user_id = auth.uid());
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can add to own play history" ON public.user_play_history
        FOR INSERT WITH CHECK (user_id = auth.uid());
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- User services policies
DO $$ BEGIN
    CREATE POLICY "Users can view own services" ON public.user_services
        FOR SELECT USING (user_id = auth.uid());
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can manage own services" ON public.user_services
        FOR ALL USING (user_id = auth.uid());
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- User preferences policies
DO $$ BEGIN
    CREATE POLICY "Users can view own preferences" ON public.user_preferences
        FOR SELECT USING (user_id = auth.uid());
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can manage own preferences" ON public.user_preferences
        FOR ALL USING (user_id = auth.uid());
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- User follows policies
DO $$ BEGIN
    CREATE POLICY "Users can view follows" ON public.user_follows
        FOR SELECT USING (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can manage own follows" ON public.user_follows
        FOR ALL USING (follower_id = auth.uid());
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- User playlists policies
DO $$ BEGIN
    CREATE POLICY "Users can view own playlist access" ON public.user_playlists
        FOR SELECT USING (user_id = auth.uid());
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can manage own playlist access" ON public.user_playlists
        FOR ALL USING (user_id = auth.uid());
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Track analytics policies
DO $$ BEGIN
    CREATE POLICY "Public read access for track analytics" ON public.track_analytics
        FOR SELECT USING (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Authenticated users can update analytics" ON public.track_analytics
        FOR UPDATE USING (auth.role() = 'authenticated');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create function to update updated_at timestamp (if it doesn't exist)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at (if they don't exist)
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_artists_updated_at ON public.artists;
CREATE TRIGGER update_artists_updated_at BEFORE UPDATE ON public.artists
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_albums_updated_at ON public.albums;
CREATE TRIGGER update_albums_updated_at BEFORE UPDATE ON public.albums
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tracks_updated_at ON public.tracks;
CREATE TRIGGER update_tracks_updated_at BEFORE UPDATE ON public.tracks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_track_services_updated_at ON public.track_services;
CREATE TRIGGER update_track_services_updated_at BEFORE UPDATE ON public.track_services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_playlists_updated_at ON public.playlists;
CREATE TRIGGER update_playlists_updated_at BEFORE UPDATE ON public.playlists
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_services_updated_at ON public.user_services;
CREATE TRIGGER update_user_services_updated_at BEFORE UPDATE ON public.user_services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON public.user_preferences;
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON public.user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_track_analytics_updated_at ON public.track_analytics;
CREATE TRIGGER update_track_analytics_updated_at BEFORE UPDATE ON public.track_analytics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically create user profiles (if it doesn't exist)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1), 'User')
    );
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Create trigger to automatically create user profiles (if it doesn't exist)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Grant necessary permissions (if not already granted)
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
