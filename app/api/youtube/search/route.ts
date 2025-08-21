import { NextRequest, NextResponse } from 'next/server'
import { youtubeMusicService } from '@/lib/services/youtube-music-service'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const query = url.searchParams.get('q')
    
    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      )
    }

    // Try to get authenticated user first
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let tracks = []

    if (user) {
      // Try to use OAuth if user is connected
      const isInitialized = await youtubeMusicService.initialize(user.id)
      
      if (isInitialized) {
        // Use OAuth search
        tracks = await youtubeMusicService.searchTracks(query, 20)
      } else {
        // Fall back to API key search
        tracks = await youtubeMusicService.searchTracksPublic(query, 20)
      }
    } else {
      // Use API key search for unauthenticated users
      tracks = await youtubeMusicService.searchTracksPublic(query, 20)
    }

    return NextResponse.json({
      success: true,
      tracks,
      query
    })
  } catch (error) {
    console.error('YouTube search error:', error)
    return NextResponse.json(
      { error: 'Failed to search YouTube Music' },
      { status: 500 }
    )
  }
}
