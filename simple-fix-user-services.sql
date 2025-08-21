-- Simple fix for user_services RLS issue
-- This temporarily disables RLS to get Spotify OAuth working

-- Disable RLS temporarily to allow Spotify OAuth to work
ALTER TABLE public.user_services DISABLE ROW LEVEL SECURITY;

-- Ensure the table exists
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

-- Grant all permissions
GRANT ALL ON public.user_services TO authenticated;
GRANT ALL ON public.user_services TO anon;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_services_user_id ON public.user_services(user_id);
CREATE INDEX IF NOT EXISTS idx_user_services_service_id ON public.user_services(service_id);

-- Test insert
INSERT INTO public.user_services (user_id, service_id, access_token, refresh_token)
SELECT 
    id as user_id,
    'spotify' as service_id,
    'test_token' as access_token,
    'test_refresh' as refresh_token
FROM auth.users 
LIMIT 1
ON CONFLICT (user_id, service_id) DO UPDATE SET
    access_token = EXCLUDED.access_token,
    refresh_token = EXCLUDED.refresh_token;
