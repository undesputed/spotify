# YouTube Music Integration Setup

## Prerequisites

1. **Google Cloud Console Account**
2. **YouTube Data API v3 enabled**
3. **API Key and OAuth 2.0 credentials**

## Step 1: Google Cloud Console Setup

1. **Go to [Google Cloud Console](https://console.cloud.google.com/)**
2. **Create a new project or select existing one**
3. **Enable YouTube Data API v3:**
   - Go to "APIs & Services" > "Library"
   - Search for "YouTube Data API v3"
   - Click "Enable"

## Step 2: Create API Credentials

1. **Go to "APIs & Services" > "Credentials"**
2. **Click "Create Credentials" > "API Key"**
3. **Copy the API Key** (we'll need this for basic searches)
4. **Click "Create Credentials" > "OAuth 2.0 Client IDs"**
5. **Configure OAuth consent screen:**
   - User Type: External
   - App name: Your Spotify Clone App
   - User support email: Your email
   - Developer contact information: Your email
   - Scopes: Add `https://www.googleapis.com/auth/youtube.readonly`
6. **Create OAuth 2.0 Client ID:**
   - Application type: Web application
   - Name: Spotify Clone YouTube Music
   - Authorized redirect URIs: 
     - `https://887e2c478073.ngrok-free.app/auth/youtube/callback`
     - `http://localhost:3000/auth/youtube/callback` (for local testing)
7. **Copy Client ID and Client Secret**

## Step 3: Environment Variables

Add these to your `.env` file:

```env
# YouTube Music API
YOUTUBE_API_KEY=your_api_key_here
YOUTUBE_CLIENT_ID=your_client_id_here
YOUTUBE_CLIENT_SECRET=your_client_secret_here
```

## Step 4: Update Spotify Dashboard

Add this redirect URI to your Spotify Developer Dashboard:
```
https://887e2c478073.ngrok-free.app/auth/youtube/callback
```

## Limitations

- **No official YouTube Music API** - We'll use YouTube Data API v3
- **Limited to public videos** - Can't access private playlists
- **Rate limits** - 10,000 units per day (1 search = 100 units)
- **No direct music streaming** - Can only get metadata and video IDs

## Alternative: YouTube Music Unofficial APIs

For better music-specific functionality, we could also explore:
- `youtube-music-api` npm package
- `ytmusicapi` (Python, but we could create a wrapper)
- Custom scraping solutions (not recommended for production)

## Next Steps

1. Set up Google Cloud credentials
2. Install YouTube API packages
3. Create YouTube Music service
4. Implement OAuth flow
5. Create search and playlist functionality
