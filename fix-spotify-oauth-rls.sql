-- Fix Spotify OAuth RLS Policies
-- This script fixes the "new row violates row-level security policy for table user_services" error
-- Run this in your Supabase SQL Editor

-- =====================================================
-- STEP 1: Check current state
-- =====================================================

-- Check if RLS is enabled on user_services
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'user_services';

-- Check existing policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'user_services';

-- =====================================================
-- STEP 2: Enable RLS and drop existing policies
-- =====================================================

-- Enable RLS on user_services table
ALTER TABLE public.user_services ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies on user_services
DROP POLICY IF EXISTS "Users can view own services" ON public.user_services;
DROP POLICY IF EXISTS "Users can insert own services" ON public.user_services;
DROP POLICY IF EXISTS "Users can update own services" ON public.user_services;
DROP POLICY IF EXISTS "Users can delete own services" ON public.user_services;
DROP POLICY IF EXISTS "Allow authenticated users to manage services" ON public.user_services;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.user_services;
DROP POLICY IF EXISTS "Enable select for users based on user_id" ON public.user_services;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.user_services;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.user_services;

-- =====================================================
-- STEP 3: Create comprehensive RLS policies
-- =====================================================

-- Policy 1: Allow authenticated users to view their own services
CREATE POLICY "Users can view own services" ON public.user_services
    FOR SELECT 
    USING (
        auth.uid()::text = user_id::text
    );

-- Policy 2: Allow authenticated users to insert their own services
CREATE POLICY "Users can insert own services" ON public.user_services
    FOR INSERT 
    WITH CHECK (
        auth.uid()::text = user_id::text
    );

-- Policy 3: Allow authenticated users to update their own services
CREATE POLICY "Users can update own services" ON public.user_services
    FOR UPDATE 
    USING (
        auth.uid()::text = user_id::text
    )
    WITH CHECK (
        auth.uid()::text = user_id::text
    );

-- Policy 4: Allow authenticated users to delete their own services
CREATE POLICY "Users can delete own services" ON public.user_services
    FOR DELETE 
    USING (
        auth.uid()::text = user_id::text
    );

-- Policy 5: Allow service role to manage all services (for server-side operations)
CREATE POLICY "Service role can manage all services" ON public.user_services
    FOR ALL 
    USING (
        auth.role() = 'service_role'
    )
    WITH CHECK (
        auth.role() = 'service_role'
    );

-- Policy 6: Allow authenticated users to manage services (fallback)
CREATE POLICY "Authenticated users can manage services" ON public.user_services
    FOR ALL 
    USING (
        auth.role() = 'authenticated'
    )
    WITH CHECK (
        auth.role() = 'authenticated'
    );

-- =====================================================
-- STEP 4: Ensure proper table structure
-- =====================================================

-- Make sure the user_services table has the correct structure
DO $$
BEGIN
    -- Add columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_services' AND column_name = 'service_id') THEN
        ALTER TABLE public.user_services ADD COLUMN service_id text NOT NULL DEFAULT 'spotify';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_services' AND column_name = 'access_token') THEN
        ALTER TABLE public.user_services ADD COLUMN access_token text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_services' AND column_name = 'refresh_token') THEN
        ALTER TABLE public.user_services ADD COLUMN refresh_token text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_services' AND column_name = 'expires_at') THEN
        ALTER TABLE public.user_services ADD COLUMN expires_at timestamp with time zone;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_services' AND column_name = 'is_active') THEN
        ALTER TABLE public.user_services ADD COLUMN is_active boolean DEFAULT true;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_services' AND column_name = 'service_user_id') THEN
        ALTER TABLE public.user_services ADD COLUMN service_user_id text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_services' AND column_name = 'service_username') THEN
        ALTER TABLE public.user_services ADD COLUMN service_username text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_services' AND column_name = 'created_at') THEN
        ALTER TABLE public.user_services ADD COLUMN created_at timestamp with time zone DEFAULT now();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_services' AND column_name = 'updated_at') THEN
        ALTER TABLE public.user_services ADD COLUMN updated_at timestamp with time zone DEFAULT now();
    END IF;
END $$;

-- =====================================================
-- STEP 5: Create indexes for performance
-- =====================================================

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_user_services_user_id ON public.user_services(user_id);
CREATE INDEX IF NOT EXISTS idx_user_services_service_id ON public.user_services(service_id);
CREATE INDEX IF NOT EXISTS idx_user_services_user_service ON public.user_services(user_id, service_id);

-- =====================================================
-- STEP 6: Grant necessary permissions
-- =====================================================

-- Grant permissions to authenticated users
GRANT ALL ON public.user_services TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Grant permissions to service role
GRANT ALL ON public.user_services TO service_role;
GRANT USAGE ON SCHEMA public TO service_role;

-- =====================================================
-- STEP 7: Test the policies
-- =====================================================

-- Test function to verify policies work
CREATE OR REPLACE FUNCTION test_user_services_policies()
RETURNS text AS $$
DECLARE
    test_user_id uuid;
    result text;
BEGIN
    -- Get a test user ID
    SELECT id INTO test_user_id FROM auth.users LIMIT 1;
    
    IF test_user_id IS NULL THEN
        RETURN 'No users found in auth.users table';
    END IF;
    
    -- Test insert
    BEGIN
        INSERT INTO public.user_services (user_id, service_id, access_token, refresh_token)
        VALUES (test_user_id, 'spotify', 'test_access_token', 'test_refresh_token')
        ON CONFLICT (user_id, service_id) DO UPDATE SET
            access_token = EXCLUDED.access_token,
            refresh_token = EXCLUDED.refresh_token,
            updated_at = now();
        
        result := 'Test insert successful for user: ' || test_user_id;
    EXCEPTION
        WHEN OTHERS THEN
            result := 'Test insert failed: ' || SQLERRM;
    END;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Run the test
SELECT test_user_services_policies();

-- =====================================================
-- STEP 8: Verification queries
-- =====================================================

-- Verify RLS is enabled
SELECT 
    schemaname, 
    tablename, 
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'user_services';

-- Verify policies are created
SELECT 
    policyname,
    cmd,
    permissive,
    roles
FROM pg_policies 
WHERE tablename = 'user_services'
ORDER BY policyname;

-- Count existing user services
SELECT 
    service_id,
    COUNT(*) as count
FROM public.user_services 
GROUP BY service_id;

-- =====================================================
-- STEP 9: Cleanup
-- =====================================================

-- Drop the test function
DROP FUNCTION IF EXISTS test_user_services_policies();

-- Success message
SELECT 'RLS policies for user_services table have been successfully configured!' as status;
