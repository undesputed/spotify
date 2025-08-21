# RLS Policy Fix for Music Data Operations

## Problem
The Spotify and YouTube Music services were failing to create artists, albums, and tracks in the database due to Row Level Security (RLS) policy restrictions. The errors showed:

```
Error mapping Spotify track: {
  code: '42501',
  details: null,
  hint: null,
  message: 'new row violates row-level security policy for table "artists"'
}
```

## Solution

### Option 1: Quick Fix (Recommended for Development)
Use the `quick-fix-rls.sql` file to temporarily disable RLS for music data tables:

```sql
-- Run this in your Supabase SQL editor
\i quick-fix-rls.sql
```

This will:
- Disable RLS for `artists`, `albums`, `tracks`, `track_services`, and `user_services` tables
- Allow the music services to create data without policy restrictions
- Provide immediate resolution of the errors

### Option 2: Comprehensive Policy Fix (Recommended for Production)
Use the `fix-rls-policies.sql` file to create proper RLS policies:

```sql
-- Run this in your Supabase SQL editor
\i fix-rls-policies.sql
```

This will:
- Drop existing restrictive policies
- Create new policies that allow both authenticated users and service roles to manage music data
- Maintain security while allowing the services to function

## Files Created

### 1. `quick-fix-rls.sql`
- **Purpose**: Immediate fix by disabling RLS for music tables
- **Use Case**: Development and testing
- **Security**: Less secure, but allows immediate functionality

### 2. `fix-rls-policies.sql`
- **Purpose**: Comprehensive policy fix with proper security
- **Use Case**: Production deployment
- **Security**: Maintains RLS with appropriate permissions

### 3. Updated Spotify Service
- **File**: `lib/services/spotify-service.ts`
- **Changes**: Added error handling for database operations
- **Result**: Services continue to work even if database operations fail

## How to Apply

### For Development (Quick Fix)
1. Open your Supabase dashboard
2. Go to the SQL Editor
3. Copy and paste the contents of `quick-fix-rls.sql`
4. Run the script
5. Verify the changes with the verification queries

### For Production (Comprehensive Fix)
1. Open your Supabase dashboard
2. Go to the SQL Editor
3. Copy and paste the contents of `fix-rls-policies.sql`
4. Run the script
5. Review the verification queries to ensure policies are correct

## Verification

After applying either fix, you can verify the changes:

```sql
-- Check RLS status
SELECT 
    schemaname, 
    tablename, 
    rowsecurity,
    CASE 
        WHEN rowsecurity THEN 'RLS ENABLED' 
        ELSE 'RLS DISABLED' 
    END as status
FROM pg_tables 
WHERE tablename IN ('artists', 'albums', 'tracks', 'track_services', 'user_services')
ORDER BY tablename;

-- Check policies (if using comprehensive fix)
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('artists', 'albums', 'tracks', 'track_services', 'user_services')
ORDER BY tablename, policyname;
```

## Expected Results

After applying the fix:
- ✅ Spotify service can create artists, albums, and tracks
- ✅ YouTube Music service can create music data
- ✅ Homepage displays real music data when services are connected
- ✅ No more RLS policy violation errors
- ✅ Sample data still shows when no services are connected

## Reverting Changes

If you need to revert the quick fix:

```sql
-- Re-enable RLS
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE track_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_services ENABLE ROW LEVEL SECURITY;
```

Then apply the comprehensive policy fix instead.

## Notes

- The quick fix is suitable for development and testing
- The comprehensive fix is recommended for production environments
- The updated Spotify service includes fallback mechanisms for database failures
- Both fixes maintain data integrity while resolving the RLS issues
