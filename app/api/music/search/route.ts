import { NextRequest, NextResponse } from 'next/server'
import { centralizedMusicService } from '@/lib/services/centralized-music-service'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const query = url.searchParams.get('q')
    const limit = parseInt(url.searchParams.get('limit') || '20')
    
    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      )
    }

    // Get authenticated user for analytics
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Search across all platforms
    const tracks = await centralizedMusicService.searchTracks(query, limit)

    // Record search analytics (optional)
    if (user) {
      // You could log search queries for analytics
      console.log(`User ${user.id} searched for: ${query}`)
    }

    return NextResponse.json({
      success: true,
      tracks,
      query,
      total: tracks.length
    })
  } catch (error) {
    console.error('Unified search error:', error)
    return NextResponse.json(
      { error: 'Failed to search music' },
      { status: 500 }
    )
  }
}
