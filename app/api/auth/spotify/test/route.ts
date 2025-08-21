import { NextResponse } from 'next/server'
import { spotifyService } from '@/lib/services/spotify-service'

export async function GET() {
  try {
    // Test the authorization URL generation
    const authUrl = spotifyService.getAuthorizationUrl('test-state')
    
    const redirectUri = process.env.NODE_ENV === 'production' 
      ? `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/spotify/callback`
      : 'https://887e2c478073.ngrok-free.app/auth/spotify/callback'

    return NextResponse.json({
      success: true,
      authUrl,
      redirectUri,
      clientId: process.env.SPOTIFY_CLIENT_ID ? 'Set' : 'Missing',
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET ? 'Set' : 'Missing',
      appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      environment: process.env.NODE_ENV
    })
  } catch (error) {
    console.error('Spotify test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
