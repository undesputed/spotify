import { NextRequest, NextResponse } from 'next/server'
import { spotifyService } from '@/lib/services/spotify-service'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const limit = parseInt(url.searchParams.get('limit') || '50')
    const offset = parseInt(url.searchParams.get('offset') || '0')

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

    // Get liked tracks
    const tracks = await spotifyService.getLikedTracks(limit, offset)

    return NextResponse.json({
      tracks,
      total: tracks.length,
      limit,
      offset,
      service: 'spotify'
    })
  } catch (error) {
    console.error('Spotify liked tracks error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch liked tracks' },
      { status: 500 }
    )
  }
}
