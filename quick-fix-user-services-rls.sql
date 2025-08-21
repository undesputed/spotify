-- Quick fix for Spotify OAuth RLS issue
-- This temporarily disables RLS for user_services table to allow OAuth callbacks to work

-- Disable RLS for user_services table
ALTER TABLE public.user_services DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT 
    schemaname, 
    tablename, 
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'user_services';

-- Success message
SELECT 'RLS disabled for user_services table. Spotify OAuth should now work!' as status;

-- Note: This is a temporary fix. For production, you should use proper RLS policies
-- instead of disabling RLS entirely.
