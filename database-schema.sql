-- =====================================================
-- Multi-Service Music Hub Database Schema
-- Supabase PostgreSQL with Row Level Security (RLS)
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search

-- =====================================================
-- ENUM TYPES
-- =====================================================

-- Music service providers
CREATE TYPE music_service AS ENUM ('spotify', 'youtube', 'apple', 'local');

-- Track quality levels
CREATE TYPE track_quality AS ENUM ('low', 'medium', 'high', 'lossless');

-- Album types
CREATE TYPE album_type AS ENUM ('album', 'single', 'ep');

-- Playlist visibility
CREATE TYPE playlist_visibility AS ENUM ('public', 'private', 'unlisted');

-- User subscription tiers
CREATE TYPE subscription_tier AS ENUM ('free', 'premium', 'family');

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    image_url TEXT,
    is_premium BOOLEAN DEFAULT false,
    subscription_tier subscription_tier DEFAULT 'free',
    subscription_expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User service connections
CREATE TABLE user_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    service_id music_service NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    service_user_id TEXT, -- External service user ID
    service_username TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, service_id)
);

-- Artists table
CREATE TABLE artists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    image_url TEXT,
    bio TEXT,
    genres TEXT[], -- Array of genres
    external_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Albums table
CREATE TABLE albums (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
    artwork_url TEXT,
    release_date DATE,
    total_tracks INTEGER DEFAULT 0,
    duration INTEGER DEFAULT 0, -- Total duration in seconds
    genres TEXT[],
    album_type album_type DEFAULT 'album',
    external_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tracks table (unified across all services)
CREATE TABLE tracks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
    album_id UUID REFERENCES albums(id) ON DELETE SET NULL,
    duration INTEGER NOT NULL, -- Duration in seconds
    track_number INTEGER,
    disc_number INTEGER DEFAULT 1,
    isrc TEXT, -- International Standard Recording Code
    external_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Track service mappings (links tracks to specific services)
CREATE TABLE track_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    track_id UUID NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
    service_id music_service NOT NULL,
    service_track_id TEXT NOT NULL, -- External service track ID
    stream_url TEXT,
    preview_url TEXT,
    quality track_quality DEFAULT 'medium',
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(track_id, service_id)
);

-- Playlists table
CREATE TABLE playlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    artwork_url TEXT,
    visibility playlist_visibility DEFAULT 'private',
    is_collaborative BOOLEAN DEFAULT false,
    follower_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Playlist tracks (many-to-many relationship)
CREATE TABLE playlist_tracks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    playlist_id UUID NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
    track_id UUID NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    added_by UUID REFERENCES users(id) ON DELETE SET NULL,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(playlist_id, track_id, position)
);

-- =====================================================
-- USER INTERACTION TABLES
-- =====================================================

-- User library (liked songs, albums, artists)
CREATE TABLE user_library (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
    album_id UUID REFERENCES albums(id) ON DELETE CASCADE,
    artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
    playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Ensure only one type is set
    CONSTRAINT one_library_item CHECK (
        (track_id IS NOT NULL)::int + 
        (album_id IS NOT NULL)::int + 
        (artist_id IS NOT NULL)::int + 
        (playlist_id IS NOT NULL)::int = 1
    )
);

-- User play history
CREATE TABLE user_play_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    track_id UUID NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
    played_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    play_duration INTEGER, -- How long the track was played (seconds)
    service_id music_service -- Which service was used
);

-- User follows (artists and other users)
CREATE TABLE user_follows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    following_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    following_artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
    followed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Ensure only one type is followed
    CONSTRAINT one_follow_target CHECK (
        (following_user_id IS NOT NULL)::int + 
        (following_artist_id IS NOT NULL)::int = 1
    ),
    UNIQUE(follower_id, following_user_id, following_artist_id)
);

-- User playlists (user's own playlists)
CREATE TABLE user_playlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    playlist_id UUID NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
    is_owner BOOLEAN DEFAULT false,
    can_edit BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, playlist_id)
);

-- =====================================================
-- ANALYTICS & METADATA TABLES
-- =====================================================

-- Track analytics
CREATE TABLE track_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    track_id UUID NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
    play_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    share_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User preferences
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    preferred_quality track_quality DEFAULT 'medium',
    auto_play BOOLEAN DEFAULT true,
    crossfade_duration INTEGER DEFAULT 0, -- seconds
    gapless_playback BOOLEAN DEFAULT true,
    normalize_volume BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_premium ON users(is_premium);

-- User services
CREATE INDEX idx_user_services_user_id ON user_services(user_id);
CREATE INDEX idx_user_services_service_id ON user_services(service_id);

-- Artists
CREATE INDEX idx_artists_name ON artists USING gin(name gin_trgm_ops);
CREATE INDEX idx_artists_genres ON artists USING gin(genres);

-- Albums
CREATE INDEX idx_albums_title ON albums USING gin(title gin_trgm_ops);
CREATE INDEX idx_albums_artist_id ON albums(artist_id);
CREATE INDEX idx_albums_release_date ON albums(release_date);

-- Tracks
CREATE INDEX idx_tracks_title ON tracks USING gin(title gin_trgm_ops);
CREATE INDEX idx_tracks_artist_id ON tracks(artist_id);
CREATE INDEX idx_tracks_album_id ON tracks(album_id);
CREATE INDEX idx_tracks_isrc ON tracks(isrc);

-- Track services
CREATE INDEX idx_track_services_track_id ON track_services(track_id);
CREATE INDEX idx_track_services_service_id ON track_services(service_id);
CREATE INDEX idx_track_services_service_track_id ON track_services(service_track_id);

-- Playlists
CREATE INDEX idx_playlists_creator_id ON playlists(creator_id);
CREATE INDEX idx_playlists_visibility ON playlists(visibility);
CREATE INDEX idx_playlists_title ON playlists USING gin(title gin_trgm_ops);

-- Playlist tracks
CREATE INDEX idx_playlist_tracks_playlist_id ON playlist_tracks(playlist_id);
CREATE INDEX idx_playlist_tracks_track_id ON playlist_tracks(track_id);
CREATE INDEX idx_playlist_tracks_position ON playlist_tracks(playlist_id, position);

-- User library
CREATE INDEX idx_user_library_user_id ON user_library(user_id);
CREATE INDEX idx_user_library_track_id ON user_library(track_id);
CREATE INDEX idx_user_library_album_id ON user_library(album_id);
CREATE INDEX idx_user_library_artist_id ON user_library(artist_id);

-- User play history
CREATE INDEX idx_user_play_history_user_id ON user_play_history(user_id);
CREATE INDEX idx_user_play_history_track_id ON user_play_history(track_id);
CREATE INDEX idx_user_play_history_played_at ON user_play_history(played_at);

-- User follows
CREATE INDEX idx_user_follows_follower_id ON user_follows(follower_id);
CREATE INDEX idx_user_follows_following_user_id ON user_follows(following_user_id);
CREATE INDEX idx_user_follows_following_artist_id ON user_follows(following_artist_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE track_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_play_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE track_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- USERS TABLE POLICIES
-- =====================================================

-- Users can read their own profile
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile (during registration)
CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- =====================================================
-- USER_SERVICES TABLE POLICIES
-- =====================================================

-- Users can view their own service connections
CREATE POLICY "Users can view own service connections" ON user_services
    FOR SELECT USING (auth.uid() = user_id);

-- Users can manage their own service connections
CREATE POLICY "Users can manage own service connections" ON user_services
    FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- ARTISTS TABLE POLICIES
-- =====================================================

-- Anyone can view artists (public data)
CREATE POLICY "Anyone can view artists" ON artists
    FOR SELECT USING (true);

-- Only authenticated users can create artists (for admin purposes)
CREATE POLICY "Authenticated users can create artists" ON artists
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Only authenticated users can update artists
CREATE POLICY "Authenticated users can update artists" ON artists
    FOR UPDATE USING (auth.role() = 'authenticated');

-- =====================================================
-- ALBUMS TABLE POLICIES
-- =====================================================

-- Anyone can view albums (public data)
CREATE POLICY "Anyone can view albums" ON albums
    FOR SELECT USING (true);

-- Only authenticated users can create/update albums
CREATE POLICY "Authenticated users can manage albums" ON albums
    FOR ALL USING (auth.role() = 'authenticated');

-- =====================================================
-- TRACKS TABLE POLICIES
-- =====================================================

-- Anyone can view tracks (public data)
CREATE POLICY "Anyone can view tracks" ON tracks
    FOR SELECT USING (true);

-- Only authenticated users can create/update tracks
CREATE POLICY "Authenticated users can manage tracks" ON tracks
    FOR ALL USING (auth.role() = 'authenticated');

-- =====================================================
-- TRACK_SERVICES TABLE POLICIES
-- =====================================================

-- Anyone can view track services (public data)
CREATE POLICY "Anyone can view track services" ON track_services
    FOR SELECT USING (true);

-- Only authenticated users can manage track services
CREATE POLICY "Authenticated users can manage track services" ON track_services
    FOR ALL USING (auth.role() = 'authenticated');

-- =====================================================
-- PLAYLISTS TABLE POLICIES
-- =====================================================

-- Users can view public playlists
CREATE POLICY "Users can view public playlists" ON playlists
    FOR SELECT USING (visibility = 'public');

-- Users can view their own playlists
CREATE POLICY "Users can view own playlists" ON playlists
    FOR SELECT USING (auth.uid() = creator_id);

-- Users can view playlists they have access to
CREATE POLICY "Users can view accessible playlists" ON playlists
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_playlists 
            WHERE user_playlists.playlist_id = playlists.id 
            AND user_playlists.user_id = auth.uid()
        )
    );

-- Users can create their own playlists
CREATE POLICY "Users can create own playlists" ON playlists
    FOR INSERT WITH CHECK (auth.uid() = creator_id);

-- Users can update their own playlists
CREATE POLICY "Users can update own playlists" ON playlists
    FOR UPDATE USING (auth.uid() = creator_id);

-- Users can delete their own playlists
CREATE POLICY "Users can delete own playlists" ON playlists
    FOR DELETE USING (auth.uid() = creator_id);

-- =====================================================
-- PLAYLIST_TRACKS TABLE POLICIES
-- =====================================================

-- Users can view tracks in playlists they have access to
CREATE POLICY "Users can view accessible playlist tracks" ON playlist_tracks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM playlists 
            WHERE playlists.id = playlist_tracks.playlist_id 
            AND (
                playlists.visibility = 'public' 
                OR playlists.creator_id = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM user_playlists 
                    WHERE user_playlists.playlist_id = playlists.id 
                    AND user_playlists.user_id = auth.uid()
                )
            )
        )
    );

-- Users can manage tracks in their own playlists
CREATE POLICY "Users can manage own playlist tracks" ON playlist_tracks
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM playlists 
            WHERE playlists.id = playlist_tracks.playlist_id 
            AND playlists.creator_id = auth.uid()
        )
    );

-- =====================================================
-- USER_LIBRARY TABLE POLICIES
-- =====================================================

-- Users can view their own library
CREATE POLICY "Users can view own library" ON user_library
    FOR SELECT USING (auth.uid() = user_id);

-- Users can manage their own library
CREATE POLICY "Users can manage own library" ON user_library
    FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- USER_PLAY_HISTORY TABLE POLICIES
-- =====================================================

-- Users can view their own play history
CREATE POLICY "Users can view own play history" ON user_play_history
    FOR SELECT USING (auth.uid() = user_id);

-- Users can manage their own play history
CREATE POLICY "Users can manage own play history" ON user_play_history
    FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- USER_FOLLOWS TABLE POLICIES
-- =====================================================

-- Users can view their own follows
CREATE POLICY "Users can view own follows" ON user_follows
    FOR SELECT USING (auth.uid() = follower_id);

-- Users can manage their own follows
CREATE POLICY "Users can manage own follows" ON user_follows
    FOR ALL USING (auth.uid() = follower_id);

-- Users can view who follows them (for public profiles)
CREATE POLICY "Users can view followers" ON user_follows
    FOR SELECT USING (auth.uid() = following_user_id);

-- =====================================================
-- USER_PLAYLISTS TABLE POLICIES
-- =====================================================

-- Users can view their own playlist access
CREATE POLICY "Users can view own playlist access" ON user_playlists
    FOR SELECT USING (auth.uid() = user_id);

-- Users can manage their own playlist access
CREATE POLICY "Users can manage own playlist access" ON user_playlists
    FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- TRACK_ANALYTICS TABLE POLICIES
-- =====================================================

-- Anyone can view track analytics (public data)
CREATE POLICY "Anyone can view track analytics" ON track_analytics
    FOR SELECT USING (true);

-- Only authenticated users can update analytics
CREATE POLICY "Authenticated users can update analytics" ON track_analytics
    FOR UPDATE USING (auth.role() = 'authenticated');

-- =====================================================
-- USER_PREFERENCES TABLE POLICIES
-- =====================================================

-- Users can view their own preferences
CREATE POLICY "Users can view own preferences" ON user_preferences
    FOR SELECT USING (auth.uid() = user_id);

-- Users can manage their own preferences
CREATE POLICY "Users can manage own preferences" ON user_preferences
    FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_services_updated_at BEFORE UPDATE ON user_services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_artists_updated_at BEFORE UPDATE ON artists
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_albums_updated_at BEFORE UPDATE ON albums
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tracks_updated_at BEFORE UPDATE ON tracks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_track_services_updated_at BEFORE UPDATE ON track_services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_playlists_updated_at BEFORE UPDATE ON playlists
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_track_analytics_updated_at BEFORE UPDATE ON track_analytics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update album track count and duration
CREATE OR REPLACE FUNCTION update_album_metadata()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE albums 
    SET 
        total_tracks = (
            SELECT COUNT(*) 
            FROM tracks 
            WHERE album_id = COALESCE(NEW.album_id, OLD.album_id)
        ),
        duration = (
            SELECT COALESCE(SUM(duration), 0) 
            FROM tracks 
            WHERE album_id = COALESCE(NEW.album_id, OLD.album_id)
        )
    WHERE id = COALESCE(NEW.album_id, OLD.album_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Trigger to update album metadata when tracks change
CREATE TRIGGER update_album_metadata_trigger 
    AFTER INSERT OR UPDATE OR DELETE ON tracks
    FOR EACH ROW EXECUTE FUNCTION update_album_metadata();

-- Function to update playlist follower count
CREATE OR REPLACE FUNCTION update_playlist_follower_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE playlists 
    SET follower_count = (
        SELECT COUNT(*) 
        FROM user_library 
        WHERE playlist_id = COALESCE(NEW.playlist_id, OLD.playlist_id)
    )
    WHERE id = COALESCE(NEW.playlist_id, OLD.playlist_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Trigger to update playlist follower count
CREATE TRIGGER update_playlist_follower_count_trigger 
    AFTER INSERT OR DELETE ON user_library
    FOR EACH ROW EXECUTE FUNCTION update_playlist_follower_count();

-- =====================================================
-- SAMPLE DATA (Optional)
-- =====================================================

-- Insert sample artist
INSERT INTO artists (id, name, image_url, bio, genres) VALUES 
(
    '550e8400-e29b-41d4-a716-446655440000',
    'The Midnight',
    'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg',
    'American synthwave band from Los Angeles',
    ARRAY['Synthwave', 'Electronic', 'Retrowave']
);

-- Insert sample album
INSERT INTO albums (id, title, artist_id, artwork_url, release_date, album_type, genres) VALUES 
(
    '550e8400-e29b-41d4-a716-446655440001',
    'Endless Summer',
    '550e8400-e29b-41d4-a716-446655440000',
    'https://images.pexels.com/photos/167092/pexels-photo-167092.jpeg',
    '2016-08-05',
    'album',
    ARRAY['Synthwave', 'Electronic']
);

-- Insert sample track
INSERT INTO tracks (id, title, artist_id, album_id, duration, track_number, isrc) VALUES 
(
    '550e8400-e29b-41d4-a716-446655440002',
    'Sunset',
    '550e8400-e29b-41d4-a716-446655440000',
    '550e8400-e29b-41d4-a716-446655440001',
    240,
    1,
    'USRC12345678'
);

-- Insert sample track service mapping
INSERT INTO track_services (track_id, service_id, service_track_id, stream_url, quality) VALUES 
(
    '550e8400-e29b-41d4-a716-446655440002',
    'spotify',
    'spotify:track:1234567890',
    'https://api.spotify.com/v1/tracks/1234567890',
    'high'
);