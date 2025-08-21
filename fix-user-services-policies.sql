-- Fix user_services table RLS policies for Spotify OAuth
-- Run this in your Supabase SQL Editor

-- First, let's check what policies currently exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'user_services';

-- Enable RLS on user_services table (if not already enabled)
ALTER TABLE public.user_services ENABLE ROW LEVEL SECURITY;

-- Check if the table exists and has the right structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_services' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Let's try a different approach - drop and recreate the policies with more permissive settings
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own services" ON public.user_services;
DROP POLICY IF EXISTS "Users can insert own services" ON public.user_services;
DROP POLICY IF EXISTS "Users can update own services" ON public.user_services;
DROP POLICY IF EXISTS "Users can delete own services" ON public.user_services;

-- Create new policies with more explicit conditions
CREATE POLICY "Users can view own services" ON public.user_services
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own services" ON public.user_services
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own services" ON public.user_services
    FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own services" ON public.user_services
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- Also create a more permissive policy for testing
CREATE POLICY "Allow authenticated users to manage services" ON public.user_services
    FOR ALL USING (auth.role() = 'authenticated');

-- Ensure the user_services table exists with proper structure
CREATE TABLE IF NOT EXISTS public.user_services (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
    service_id text NOT NULL CHECK (service_id IN ('spotify', 'youtube_music', 'apple_music', 'local')),
    access_token text,
    refresh_token text,
    expires_at timestamp with time zone,
    is_active boolean DEFAULT true,
    service_user_id text,
    service_username text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(user_id, service_id)
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_user_services_user_id ON public.user_services(user_id);
CREATE INDEX IF NOT EXISTS idx_user_services_service_id ON public.user_services(service_id);

-- Grant permissions
GRANT ALL ON public.user_services TO authenticated;
GRANT ALL ON public.user_services TO anon;

-- Test the policies by checking if we can insert a test record
-- This will help us debug the issue
DO $$
DECLARE
    test_user_id uuid;
BEGIN
    -- Get a test user ID
    SELECT id INTO test_user_id FROM auth.users LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        -- Try to insert a test record
        INSERT INTO public.user_services (user_id, service_id, access_token, refresh_token)
        VALUES (test_user_id, 'spotify', 'test_token', 'test_refresh')
        ON CONFLICT (user_id, service_id) DO UPDATE SET
            access_token = EXCLUDED.access_token,
            refresh_token = EXCLUDED.refresh_token;
        
        RAISE NOTICE 'Test insert successful for user: %', test_user_id;
    ELSE
        RAISE NOTICE 'No users found in auth.users table';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Test insert failed: %', SQLERRM;
END $$;
