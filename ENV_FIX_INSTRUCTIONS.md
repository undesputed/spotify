# Environment Variables Fix Instructions

## 🚨 Critical Issue Found

The `SUPABASE_SERVICE_ROLE_KEY` in your `.env` file is set to a placeholder value:
```
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52d3JtbXV5enhhbmp2c2FkdGZoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTcyODM2NCwiZXhwIjoyMDcxMzA0MzY0fQ.0000000000000000000000000000000000000000
```

This is causing the "Invalid API key" error during Spotify OAuth callbacks.

## 🔧 How to Fix

### Step 1: Get Your Real Service Role Key

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `nvwrmmuyzxanjvsadtfh`
3. Go to **Settings** → **API**
4. Copy the **service_role** key (not the anon key)

### Step 2: Update Your .env File

Replace the placeholder service role key with your real one:

```env
# Current (WRONG):
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52d3JtbXV5enhhbmp2c2FkdGZoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTcyODM2NCwiZXhwIjoyMDcxMzA0MzY0fQ.0000000000000000000000000000000000000000

# Replace with your REAL service role key from Supabase Dashboard
SUPABASE_SERVICE_ROLE_KEY=your_real_service_role_key_here
```

### Step 3: Restart Your Development Server

After updating the `.env` file:

```bash
# Stop the current server (Ctrl+C)
# Then restart it
npm run dev
```

## 🔍 Verification

After fixing the environment variable:

1. **Test Spotify Auth Endpoint**:
   ```bash
   curl "http://localhost:3000/api/auth/spotify?userId=test-user"
   ```
   Should return a valid auth URL without errors.

2. **Test Spotify OAuth Callback**:
   - Go to `/platforms/connect?platforms=spotify`
   - Click "Connect Spotify"
   - Complete OAuth flow
   - Should redirect back successfully without "Invalid API key" error

## 🚨 Important Notes

- **Never commit your real service role key** to version control
- The service role key has elevated permissions and should be kept secure
- The anon key is safe to expose (it's already in your `NEXT_PUBLIC_` variables)

## 🔧 Alternative Quick Fix

If you want to test without the service role key temporarily, you can modify the server service to use the anon key:

```typescript
// In lib/supabase/server.ts, change line 19-22 to:
private supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! // Use anon key instead
)
```

However, this is **NOT recommended** for production as it won't bypass RLS policies.

## ✅ Expected Result

After fixing the service role key:
- ✅ Spotify OAuth callbacks will work
- ✅ User services will be saved to database
- ✅ No more "Invalid API key" errors
- ✅ Platform connections will complete successfully

---

**Status**: Waiting for environment variable fix
**Priority**: High - Required for OAuth to work
