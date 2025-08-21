import { NextRequest, NextResponse } from 'next/server'
import { spotifyService } from '@/lib/services/spotify-service'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const userId = url.searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Store userId in session or state for callback
    const state = Buffer.from(JSON.stringify({ userId })).toString('base64')
    
    // Get Spotify authorization URL with state
    const authUrl = spotifyService.getAuthorizationUrl(state)
    
    return NextResponse.json({ 
      authUrl,
      state 
    })
  } catch (error) {
    console.error('Spotify auth error:', error)
    return NextResponse.json(
      { error: 'Failed to generate authorization URL' },
      { status: 500 }
    )
  }
}
