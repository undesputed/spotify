# 🎵 Centralized Music Platform

A **centralized music streaming platform** that uses external APIs (Spotify, YouTube) for discovery while building your own legal audio catalog. This approach avoids copyright issues while creating real value for users and artists.

## 🎯 **Strategy Overview**

**One-liner strategy:** Build a centralized music player that uses Spotify/YouTube for **discovery metadata**, but plays actual audio from **policy-safe sources** you host (open-licensed/artist-uploaded). Over time, grow that owned catalog until you're no longer dependent on external platforms.

## 🏗️ **Architecture**

### **Frontend (Next.js 15 - App Router)**
- **Discovery UI** powered by Spotify/YouTube metadata
- **Unified track pages** that resolve playable sources from your catalog
- **Artist upload system** for content creation
- **Unified search** across all platforms
- **Smart playlist builder** (premium feature)

### **Backend (Supabase)**
- **PostgreSQL** database with Row Level Security (RLS)
- **Supabase Auth** for user management
- **Supabase Storage** for audio files
- **Real-time subscriptions** for live updates
- **Edge Functions** for processing

### **External Integrations**
- **Spotify Web API** - Search, metadata, OAuth
- **YouTube Data API v3** - Search, metadata, OAuth
- **Stripe** - Subscription management
- **FFmpeg** - Audio processing (planned)

## 📊 **Database Schema**

### **Core Tables**
- `users` - Enhanced with artist roles
- `content_items` - Unified metadata from all sources
- `sources` - Playable audio files (your owned content)
- `licenses` - License information for each source
- `uploads` - Artist upload tracking
- `plays` - Analytics and play tracking
- `feature_flags` - Premium feature toggles

### **Key Features**
- **Content matching** between external IDs and your sources
- **Fuzzy matching** by title/artist/duration
- **License tracking** for compliance
- **Analytics** for insights and recommendations

## 🚀 **Features Implemented**

### ✅ **Core Infrastructure**
- [x] Database schema with RLS policies
- [x] Centralized music service
- [x] Upload service for artist content
- [x] Unified search API
- [x] Content matching system

### ✅ **User Experience**
- [x] Unified search page (`/search`)
- [x] Artist upload page (`/upload`)
- [x] Unified music player component
- [x] Platform-aware track display
- [x] Source resolution and fallbacks

### ✅ **External Integrations**
- [x] Spotify OAuth and API integration
- [x] YouTube Music OAuth and API integration
- [x] Cross-platform metadata aggregation
- [x] External link generation

### ✅ **Content Management**
- [x] Artist upload workflow
- [x] Metadata extraction and validation
- [x] License management
- [x] Upload progress tracking

## 🎵 **How It Works**

### **1. Search & Discovery**
1. User searches for music
2. System queries Spotify, YouTube, and your catalog
3. Results are merged and deduplicated
4. Content matching tries to find playable sources
5. UI shows availability across platforms

### **2. Playback Resolution**
1. **Own catalog** → Direct audio playback
2. **Spotify/YouTube** → External link redirect
3. **No source** → "Request upload" CTA

### **3. Artist Uploads**
1. Artist uploads audio file
2. System extracts metadata
3. File is processed (transcoding planned)
4. Content item and source are created
5. Admin review and approval
6. Track becomes playable

### **4. Content Matching**
1. **ISRC matching** (strongest)
2. **Exact title/artist** matching
3. **Fuzzy matching** with confidence scores
4. **Manual matching** for admin curation

## 🔧 **Technical Implementation**

### **Services**
- `CentralizedMusicService` - Core orchestration
- `UploadService` - Artist upload management
- `SpotifyService` - Spotify API integration
- `YouTubeMusicService` - YouTube API integration

### **Components**
- `UnifiedMusicPlayer` - Cross-platform playback
- `UploadPage` - Artist upload interface
- `SearchPage` - Unified search experience

### **API Routes**
- `/api/music/search` - Unified search
- `/api/auth/spotify/*` - Spotify OAuth
- `/api/auth/youtube/*` - YouTube OAuth
- `/api/upload/*` - Upload management

## 🎨 **User Interface**

### **Search Page (`/search`)**
- Unified search across all platforms
- Grid and list view modes
- Platform filtering
- Playable source indicators
- Integrated music player

### **Upload Page (`/upload`)**
- Drag-and-drop file upload
- Metadata form with validation
- License selection
- Upload progress tracking
- Processing status updates

### **Music Player**
- Cross-platform playback
- Source-aware controls
- External link handling
- Analytics tracking
- Platform indicators

## 🔒 **Security & Compliance**

### **Row Level Security (RLS)**
- Users can only access their own data
- Artists can manage their own uploads
- Admins have moderation capabilities
- Public read access for content items

### **License Management**
- Per-source license tracking
- Attribution requirements
- Commercial use permissions
- Takedown procedures

### **Content Moderation**
- Admin review for uploads
- Report system for violations
- Blocklist for banned content
- Automated content checks (planned)

## 📈 **Analytics & Insights**

### **Play Tracking**
- User listening history
- Play completion rates
- Platform preferences
- Content performance

### **Content Insights**
- Most popular tracks
- Upload success rates
- Matching accuracy
- User engagement

## 🚀 **Deployment**

### **Environment Variables**
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Spotify
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret

# YouTube
YOUTUBE_API_KEY=your_youtube_api_key
YOUTUBE_CLIENT_ID=your_youtube_client_id
YOUTUBE_CLIENT_SECRET=your_youtube_client_secret

# App
NEXT_PUBLIC_APP_URL=your_app_url
```

### **Database Setup**
1. Run `database-schema-centralized-music.sql` in Supabase
2. Create `audio-uploads` storage bucket
3. Configure RLS policies
4. Set up OAuth redirect URIs

## 🎯 **Next Steps (90-Day Plan)**

### **Weeks 1-2: Core Infrastructure**
- [ ] FFmpeg integration for audio processing
- [ ] HLS streaming implementation
- [ ] Waveform generation
- [ ] Audio fingerprinting

### **Weeks 3-4: Enhanced Features**
- [ ] Smart playlist builder
- [ ] Advanced search filters
- [ ] User recommendations
- [ ] Social features (likes, shares)

### **Weeks 5-6: Monetization**
- [ ] Stripe integration
- [ ] Premium tier features
- [ ] Subscription management
- [ ] Payment analytics

### **Weeks 7-8: Content Growth**
- [ ] Open-licensed catalog ingestion
- [ ] Artist onboarding tools
- [ ] Content curation features
- [ ] Discovery algorithms

### **Weeks 9-10: Advanced Features**
- [ ] Mobile app (React Native)
- [ ] Offline playback
- [ ] Collaborative playlists
- [ ] Live streaming

### **Weeks 11-12: Launch Preparation**
- [ ] Performance optimization
- [ ] SEO and marketing
- [ ] User testing
- [ ] Public launch

## 🎵 **Content Strategy**

### **Phase 1: Artist Uploads**
- Focus on independent artists
- Provide upload incentives
- Build community features
- Offer analytics and insights

### **Phase 2: Open-Licensed Content**
- Ingest Creative Commons catalogs
- Partner with open music platforms
- Curate high-quality content
- Build discovery features

### **Phase 3: Licensed Content**
- Partner with labels and distributors
- Implement revenue sharing
- Build licensing infrastructure
- Expand catalog diversity

## 🔮 **Future Vision**

### **Short Term (6 months)**
- 10,000+ tracks in catalog
- 1,000+ active artists
- 100,000+ monthly listeners
- Premium subscription launch

### **Medium Term (1 year)**
- 100,000+ tracks in catalog
- 10,000+ active artists
- 1M+ monthly listeners
- Mobile app launch
- International expansion

### **Long Term (2+ years)**
- Major label partnerships
- AI-powered recommendations
- Live streaming platform
- Music industry disruption

## 🛠️ **Development Commands**

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run with HTTPS (for OAuth)
npm run dev:https

# Build for production
npm run build

# Start production server
npm start

# Run database migrations
# Execute database-schema-centralized-music.sql in Supabase
```

## 📚 **Resources**

### **Documentation**
- [Next.js 15 Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Spotify Web API](https://developer.spotify.com/documentation/web-api)
- [YouTube Data API](https://developers.google.com/youtube/v3)

### **Libraries Used**
- `next` - React framework
- `supabase` - Backend as a service
- `spotify-web-api-node` - Spotify integration
- `googleapis` - YouTube integration
- `lucide-react` - Icons
- `tailwindcss` - Styling

## 🤝 **Contributing**

This is a strategic music platform implementation. Key areas for contribution:

1. **Audio Processing** - FFmpeg integration, HLS streaming
2. **Content Matching** - Improved algorithms, acoustic fingerprinting
3. **User Experience** - Mobile app, advanced features
4. **Content Growth** - Artist tools, discovery features
5. **Monetization** - Subscription features, revenue sharing

## 📄 **License**

This project is licensed under the MIT License - see the LICENSE file for details.

---

**🎵 Built for the future of music streaming - where artists and listeners connect directly through legal, sustainable content.**
