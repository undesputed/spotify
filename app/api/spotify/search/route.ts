import { NextRequest, NextResponse } from 'next/server'
import { spotifyService } from '@/lib/services/spotify-service'
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

    // Get current user
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Initialize Spotify service for the user
    const initialized = await spotifyService.initialize(user.id)
    
    if (!initialized) {
      return NextResponse.json(
        { error: 'Spotify not connected. Please connect your Spotify account first.' },
        { status: 400 }
      )
    }

    // Search tracks
    const tracks = await spotifyService.searchTracks(query, limit)

    return NextResponse.json({
      tracks,
      query,
      total: tracks.length,
      service: 'spotify'
    })
  } catch (error) {
    console.error('Spotify search error:', error)
    return NextResponse.json(
      { error: 'Failed to search Spotify' },
      { status: 500 }
    )
  }
}
