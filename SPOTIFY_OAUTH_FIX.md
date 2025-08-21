# Spotify OAuth Fix & Connection Model Explanation

## 🔍 Current Issues

### 1. **Spotify API 403 Error**
The error `[WebapiError: [object Object]] { statusCode: 403 }` indicates that the redirect URI in your Spotify Developer Dashboard doesn't match the current ngrok URL.

### 2. **Service Role Key Still Invalid**
Your `SUPABASE_SERVICE_ROLE_KEY` is still set to a placeholder value.

## 🎯 Connection Model Explanation

### **Current Design: 1 Account Per Service Per User**

```sql
-- Each user can have ONE connection per service
UNIQUE(user_id, service_id)
```

**What this means:**
- ✅ **User A** can connect to **Spotify**
- ✅ **User A** can connect to **YouTube Music** 
- ✅ **User A** can connect to **Apple Music**
- ✅ **User A** can connect to **Local Storage**
- ❌ **User A** cannot connect to **Spotify** twice
- ❌ **User A** cannot connect to **YouTube Music** twice

**Example:**
```
User ID: 123
├── Spotify: Connected (1 connection)
├── YouTube Music: Connected (1 connection)  
├── Apple Music: Not connected
└── Local: Not connected
```

## 🔧 Fix Steps

### Step 1: Update Spotify Developer Dashboard

1. **Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)**
2. **Select your app**: `22857f53cb68471ea1e22801fc123613`
3. **Go to Settings**
4. **Add/Update Redirect URIs**:
   ```
   https://3d686033c4c8.ngrok-free.app/api/auth/spotify/callback
   ```
5. **Save changes**

### Step 2: Fix Service Role Key

1. **Go to [Supabase Dashboard](https://supabase.com/dashboard)**
2. **Select your project**: `nvwrmmuyzxanjvsadtfh`
3. **Go to Settings → API**
4. **Copy the real service_role key**
5. **Update your `.env` file**:

```env
# Replace this placeholder:
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52d3JtbXV5enhhbmp2c2FkdGZoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTcyODM2NCwiZXhwIjoyMDcxMzA0MzY0fQ.0000000000000000000000000000000000000000

# With your real service role key from Supabase Dashboard
SUPABASE_SERVICE_ROLE_KEY=your_real_service_role_key_here
```

### Step 3: Restart Development Server

```bash
# Stop server (Ctrl+C)
npm run dev
```

## 🧪 Test the Fix

### Test 1: Spotify Auth URL
```bash
curl "http://localhost:3000/api/auth/spotify?userId=test-user"
```
Should return a valid auth URL.

### Test 2: Complete OAuth Flow
1. Go to `/platforms/connect?platforms=spotify`
2. Click "Connect Spotify"
3. Complete OAuth flow
4. Should redirect back successfully

## 🔄 Alternative: Multiple Accounts Per Service

If you want to allow **multiple accounts per service** (e.g., multiple Spotify accounts), you would need to modify the database schema:

### Option A: Remove Unique Constraint
```sql
-- Remove this line from user_services table:
-- UNIQUE(user_id, service_id)

-- Add a new field for account name:
ALTER TABLE user_services ADD COLUMN account_name TEXT;
```

### Option B: Create Account Groups
```sql
-- Create a new table for multiple accounts
CREATE TABLE user_service_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    service_id music_service NOT NULL,
    account_name TEXT NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    -- ... other fields
    UNIQUE(user_id, service_id, account_name)
);
```

## 🎯 Current Status

- ✅ **Connection Model**: 1 account per service per user
- ✅ **Database Schema**: Properly designed for single connections
- ⚠️ **Spotify OAuth**: Needs redirect URI update
- ⚠️ **Service Role Key**: Needs real key from Supabase

## 🚀 Expected Results After Fix

1. **✅ Spotify OAuth** will complete without 403 errors
2. **✅ User services** will be saved to database
3. **✅ Platform connections** will work end-to-end
4. **✅ Each user can connect to multiple services** (but only 1 per service)

---

**🎵 Status**: Ready for Spotify redirect URI and service role key fixes
**🎯 Priority**: Update both Spotify Dashboard and Supabase service role key
