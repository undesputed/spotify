-- Fix RLS Policies for Music Data Operations
-- This file fixes the Row Level Security policies that are preventing
-- the Spotify service from creating artists and other music data

-- =====================================================
-- ARTISTS TABLE POLICIES - FIXED
-- =====================================================

-- Drop existing policies for artists table
DROP POLICY IF EXISTS "Anyone can view artists" ON artists;
DROP POLICY IF EXISTS "Authenticated users can create artists" ON artists;
DROP POLICY IF EXISTS "Authenticated users can update artists" ON artists;

-- Create new, more permissive policies for artists
-- Anyone can view artists (public data)
CREATE POLICY "Anyone can view artists" ON artists
    FOR SELECT USING (true);

-- Allow authenticated users and service role to create artists
CREATE POLICY "Allow artist creation" ON artists
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' OR 
        auth.role() = 'service_role' OR
        current_setting('role') = 'service_role'
    );

-- Allow authenticated users and service role to update artists
CREATE POLICY "Allow artist updates" ON artists
    FOR UPDATE USING (
        auth.role() = 'authenticated' OR 
        auth.role() = 'service_role' OR
        current_setting('role') = 'service_role'
    );

-- =====================================================
-- ALBUMS TABLE POLICIES - FIXED
-- =====================================================

-- Drop existing policies for albums table
DROP POLICY IF EXISTS "Anyone can view albums" ON albums;
DROP POLICY IF EXISTS "Authenticated users can manage albums" ON albums;

-- Create new policies for albums
CREATE POLICY "Anyone can view albums" ON albums
    FOR SELECT USING (true);

-- Allow authenticated users and service role to manage albums
CREATE POLICY "Allow album management" ON albums
    FOR ALL USING (
        auth.role() = 'authenticated' OR 
        auth.role() = 'service_role' OR
        current_setting('role') = 'service_role'
    );

-- =====================================================
-- TRACKS TABLE POLICIES - FIXED
-- =====================================================

-- Drop existing policies for tracks table
DROP POLICY IF EXISTS "Anyone can view tracks" ON tracks;
DROP POLICY IF EXISTS "Authenticated users can manage tracks" ON tracks;

-- Create new policies for tracks
CREATE POLICY "Anyone can view tracks" ON tracks
    FOR SELECT USING (true);

-- Allow authenticated users and service role to manage tracks
CREATE POLICY "Allow track management" ON tracks
    FOR ALL USING (
        auth.role() = 'authenticated' OR 
        auth.role() = 'service_role' OR
        current_setting('role') = 'service_role'
    );

-- =====================================================
-- TRACK_SERVICES TABLE POLICIES - FIXED
-- =====================================================

-- Drop existing policies for track_services table
DROP POLICY IF EXISTS "Anyone can view track services" ON track_services;
DROP POLICY IF EXISTS "Authenticated users can manage track services" ON track_services;

-- Create new policies for track_services
CREATE POLICY "Anyone can view track services" ON track_services
    FOR SELECT USING (true);

-- Allow authenticated users and service role to manage track services
CREATE POLICY "Allow track service management" ON track_services
    FOR ALL USING (
        auth.role() = 'authenticated' OR 
        auth.role() = 'service_role' OR
        current_setting('role') = 'service_role'
    );

-- =====================================================
-- USER_SERVICES TABLE POLICIES - FIXED
-- =====================================================

-- Drop existing policies for user_services table
DROP POLICY IF EXISTS "Users can view own service connections" ON user_services;
DROP POLICY IF EXISTS "Users can manage own service connections" ON user_services;

-- Create new policies for user_services
CREATE POLICY "Users can view own service connections" ON user_services
    FOR SELECT USING (user_id = auth.uid());

-- Allow authenticated users and service role to manage user services
CREATE POLICY "Allow user service management" ON user_services
    FOR ALL USING (
        user_id = auth.uid() OR
        auth.role() = 'service_role' OR
        current_setting('role') = 'service_role'
    );

-- =====================================================
-- ALTERNATIVE: TEMPORARILY DISABLE RLS FOR MUSIC DATA
-- =====================================================
-- Uncomment the following lines if you want to temporarily disable RLS
-- for music data tables to allow the services to work properly

/*
-- Temporarily disable RLS for music data tables
ALTER TABLE artists DISABLE ROW LEVEL SECURITY;
ALTER TABLE albums DISABLE ROW LEVEL SECURITY;
ALTER TABLE tracks DISABLE ROW LEVEL SECURITY;
ALTER TABLE track_services DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_services DISABLE ROW LEVEL SECURITY;

-- Note: Re-enable RLS after testing by running:
-- ALTER TABLE artists ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE albums ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE track_services ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_services ENABLE ROW LEVEL SECURITY;
*/

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check if policies are created correctly
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('artists', 'albums', 'tracks', 'track_services', 'user_services')
ORDER BY tablename, policyname;

-- Check RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('artists', 'albums', 'tracks', 'track_services', 'user_services')
ORDER BY tablename;
