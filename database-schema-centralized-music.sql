-- Centralized Music Platform Database Schema
-- This extends the existing schema to support artist uploads, open-licensed content, and monetization

-- ========================================
-- CORE USER & AUTHENTICATION
-- ========================================

-- Enhanced user profiles with roles
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role text DEFAULT 'user' CHECK (role IN ('user', 'artist', 'admin'));
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS artist_name text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS artist_bio text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS artist_website text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS artist_verified boolean DEFAULT false;

-- Feature flags for premium features
CREATE TABLE IF NOT EXISTS public.feature_flags (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
    flags jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(user_id)
);

-- ========================================
-- CONTENT CATALOG (Unified Metadata)
-- ========================================

-- Main content items (unified metadata from all sources)
CREATE TABLE IF NOT EXISTS public.content_items (
    id bigserial PRIMARY KEY,
    title text NOT NULL,
    artists text[] NOT NULL,
    album text,
    duration_ms integer,
    isrc text, -- International Standard Recording Code
    release_date date,
    genre text,
    language text,
    explicit boolean DEFAULT false,
    thumbnails jsonb, -- Multiple thumbnail sizes
    external jsonb, -- External platform IDs: {spotify_id, youtube_video_id, apple_music_id, etc.}
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Playable audio sources (your owned content)
CREATE TABLE IF NOT EXISTS public.sources (
    id bigserial PRIMARY KEY,
    content_item_id bigint REFERENCES public.content_items(id) ON DELETE CASCADE,
    kind text NOT NULL CHECK (kind IN ('artist_uploaded', 'open_cc', 'public_domain', 'licensed')),
    url text, -- Direct URL to audio file
    storage_key text, -- Supabase Storage key
    license text NOT NULL,
    bitrate integer,
    format text, -- mp3, flac, wav, etc.
    hls_manifest_url text, -- For HLS streaming
    status text DEFAULT 'pending_review' CHECK (status IN ('active', 'blocked', 'pending_review', 'processing')),
    uploaded_by uuid REFERENCES public.users(id),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- License information for each source
CREATE TABLE IF NOT EXISTS public.licenses (
    id bigserial PRIMARY KEY,
    source_id bigint REFERENCES public.sources(id) ON DELETE CASCADE,
    license_type text NOT NULL, -- 'cc-by', 'cc-by-sa', 'public_domain', 'commercial', etc.
    attribution text, -- Required attribution text
    commercial_use boolean DEFAULT false,
    proof_url text, -- URL to license proof
    created_at timestamp with time zone DEFAULT now()
);

-- ========================================
-- UPLOAD & PROCESSING
-- ========================================

-- Artist uploads tracking
CREATE TABLE IF NOT EXISTS public.uploads (
    id bigserial PRIMARY KEY,
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
    storage_key text NOT NULL,
    original_filename text NOT NULL,
    file_size bigint,
    duration_ms integer,
    status text DEFAULT 'uploading' CHECK (status IN ('uploading', 'processing', 'completed', 'failed', 'rejected')),
    error text,
    metadata jsonb, -- Extracted metadata from audio file
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Processing jobs for audio transcoding
CREATE TABLE IF NOT EXISTS public.processing_jobs (
    id bigserial PRIMARY KEY,
    upload_id bigint REFERENCES public.uploads(id) ON DELETE CASCADE,
    job_type text NOT NULL, -- 'transcode', 'waveform', 'fingerprint'
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    input_path text,
    output_path text,
    error text,
    started_at timestamp with time zone,
    completed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);

-- ========================================
-- MATCHING & RESOLUTION
-- ========================================

-- Cache for matching external IDs to our content
CREATE TABLE IF NOT EXISTS public.content_matches (
    id bigserial PRIMARY KEY,
    external_id text NOT NULL, -- Spotify ID, YouTube ID, etc.
    external_platform text NOT NULL, -- 'spotify', 'youtube', 'apple_music'
    content_item_id bigint REFERENCES public.content_items(id) ON DELETE CASCADE,
    source_id bigint REFERENCES public.sources(id) ON DELETE SET NULL,
    match_confidence numeric(3,2) DEFAULT 0.0, -- 0.0 to 1.0
    match_method text, -- 'isrc', 'exact_title_artist', 'fuzzy_match', 'fingerprint'
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(external_id, external_platform)
);

-- ========================================
-- PLAYLISTS (Enhanced)
-- ========================================

-- Enhanced playlists with smart playlist support
ALTER TABLE public.playlists ADD COLUMN IF NOT EXISTS is_smart boolean DEFAULT false;
ALTER TABLE public.playlists ADD COLUMN IF NOT EXISTS smart_rules jsonb; -- Rules for smart playlists
ALTER TABLE public.playlists ADD COLUMN IF NOT EXISTS last_refreshed timestamp with time zone;

-- ========================================
-- ANALYTICS & ENGAGEMENT
-- ========================================

-- Play tracking
CREATE TABLE IF NOT EXISTS public.plays (
    id bigserial PRIMARY KEY,
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
    source_id bigint REFERENCES public.sources(id) ON DELETE CASCADE,
    content_item_id bigint REFERENCES public.content_items(id) ON DELETE CASCADE,
    started_at timestamp with time zone DEFAULT now(),
    completed boolean DEFAULT false,
    ms_listened integer DEFAULT 0,
    session_id text,
    platform text, -- 'web', 'mobile', 'desktop'
    created_at timestamp with time zone DEFAULT now()
);

-- User engagement (hearts, follows, etc.)
CREATE TABLE IF NOT EXISTS public.user_engagement (
    id bigserial PRIMARY KEY,
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
    content_item_id bigint REFERENCES public.content_items(id) ON DELETE CASCADE,
    engagement_type text NOT NULL CHECK (engagement_type IN ('heart', 'follow', 'repost', 'share')),
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(user_id, content_item_id, engagement_type)
);

-- ========================================
-- MODERATION & COMPLIANCE
-- ========================================

-- Reports for takedowns
CREATE TABLE IF NOT EXISTS public.reports (
    id bigserial PRIMARY KEY,
    reporter_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
    source_id bigint REFERENCES public.sources(id) ON DELETE CASCADE,
    reason text NOT NULL,
    description text,
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
    admin_notes text,
    reviewed_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
    reviewed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);

-- Blocklist for banned content
CREATE TABLE IF NOT EXISTS public.blocklist (
    id bigserial PRIMARY KEY,
    content_item_id bigint REFERENCES public.content_items(id) ON DELETE CASCADE,
    source_id bigint REFERENCES public.sources(id) ON DELETE CASCADE,
    reason text NOT NULL,
    blocked_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
    blocked_at timestamp with time zone DEFAULT now()
);

-- ========================================
-- MONETIZATION
-- ========================================

-- Stripe customer mapping
CREATE TABLE IF NOT EXISTS public.stripe_customers (
    id bigserial PRIMARY KEY,
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
    stripe_customer_id text UNIQUE NOT NULL,
    subscription_id text,
    subscription_status text,
    current_period_end timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(user_id)
);

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================

-- Content items indexes
CREATE INDEX IF NOT EXISTS idx_content_items_title ON public.content_items USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_content_items_artists ON public.content_items USING gin(artists);
CREATE INDEX IF NOT EXISTS idx_content_items_isrc ON public.content_items(isrc);
CREATE INDEX IF NOT EXISTS idx_content_items_external ON public.content_items USING gin(external);

-- Sources indexes
CREATE INDEX IF NOT EXISTS idx_sources_content_item_id ON public.sources(content_item_id);
CREATE INDEX IF NOT EXISTS idx_sources_status ON public.sources(status);
CREATE INDEX IF NOT EXISTS idx_sources_kind ON public.sources(kind);

-- Matching indexes
CREATE INDEX IF NOT EXISTS idx_content_matches_external ON public.content_matches(external_id, external_platform);
CREATE INDEX IF NOT EXISTS idx_content_matches_content_item ON public.content_matches(content_item_id);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_plays_user_id ON public.plays(user_id);
CREATE INDEX IF NOT EXISTS idx_plays_source_id ON public.plays(source_id);
CREATE INDEX IF NOT EXISTS idx_plays_started_at ON public.plays(started_at);

-- Uploads indexes
CREATE INDEX IF NOT EXISTS idx_uploads_user_id ON public.uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_uploads_status ON public.uploads(status);

-- ========================================
-- ROW LEVEL SECURITY (RLS)
-- ========================================

-- Enable RLS on new tables
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processing_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_engagement ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_customers ENABLE ROW LEVEL SECURITY;

-- ========================================
-- RLS POLICIES
-- ========================================

-- Feature flags: Users can view their own flags
DO $$ BEGIN
    CREATE POLICY "Users can view own feature flags" ON public.feature_flags
        FOR SELECT USING (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Content items: Public read access
DO $$ BEGIN
    CREATE POLICY "Anyone can view content items" ON public.content_items
        FOR SELECT USING (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Sources: Public read access for active sources only
DO $$ BEGIN
    CREATE POLICY "Users can view active sources" ON public.sources
        FOR SELECT USING (status = 'active');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Artists can manage their own sources
DO $$ BEGIN
    CREATE POLICY "Artists can manage own sources" ON public.sources
        FOR ALL USING (
            uploaded_by = auth.uid() AND 
            EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'artist')
        );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Uploads: Users can view their own uploads
DO $$ BEGIN
    CREATE POLICY "Users can view own uploads" ON public.uploads
        FOR SELECT USING (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Users can create their own uploads
DO $$ BEGIN
    CREATE POLICY "Users can create own uploads" ON public.uploads
        FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Plays: Users can view their own plays
DO $$ BEGIN
    CREATE POLICY "Users can view own plays" ON public.plays
        FOR SELECT USING (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Users can create their own plays
DO $$ BEGIN
    CREATE POLICY "Users can create own plays" ON public.plays
        FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- User engagement: Users can manage their own engagement
DO $$ BEGIN
    CREATE POLICY "Users can manage own engagement" ON public.user_engagement
        FOR ALL USING (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Stripe customers: Users can view their own customer data
DO $$ BEGIN
    CREATE POLICY "Users can view own stripe data" ON public.stripe_customers
        FOR SELECT USING (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ========================================
-- FUNCTIONS & TRIGGERS
-- ========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_feature_flags_updated_at ON public.feature_flags;
CREATE TRIGGER update_feature_flags_updated_at BEFORE UPDATE ON public.feature_flags
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_content_items_updated_at ON public.content_items;
CREATE TRIGGER update_content_items_updated_at BEFORE UPDATE ON public.content_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sources_updated_at ON public.sources;
CREATE TRIGGER update_sources_updated_at BEFORE UPDATE ON public.sources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_uploads_updated_at ON public.uploads;
CREATE TRIGGER update_uploads_updated_at BEFORE UPDATE ON public.uploads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_stripe_customers_updated_at ON public.stripe_customers;
CREATE TRIGGER update_stripe_customers_updated_at BEFORE UPDATE ON public.stripe_customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create content matches
CREATE OR REPLACE FUNCTION create_content_match()
RETURNS TRIGGER AS $$
BEGIN
    -- When a new source is created, try to match it to existing content items
    -- This is a simplified version - you'll want more sophisticated matching logic
    INSERT INTO public.content_matches (external_id, external_platform, content_item_id, source_id, match_confidence, match_method)
    SELECT 
        NEW.id::text,
        'internal',
        ci.id,
        NEW.id,
        1.0,
        'direct_match'
    FROM public.content_items ci
    WHERE ci.id = NEW.content_item_id
    ON CONFLICT DO NOTHING;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to create content matches when sources are created
DROP TRIGGER IF EXISTS trigger_create_content_match ON public.sources;
CREATE TRIGGER trigger_create_content_match
    AFTER INSERT ON public.sources
    FOR EACH ROW EXECUTE FUNCTION create_content_match();

-- ========================================
-- GRANT PERMISSIONS
-- ========================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
