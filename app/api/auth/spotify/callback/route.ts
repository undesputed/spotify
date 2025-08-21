import { NextRequest, NextResponse } from 'next/server'
import { spotifyService } from '@/lib/services/spotify-service'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const code = url.searchParams.get('code')
    const state = url.searchParams.get('state')
    const error = url.searchParams.get('error')

    if (error) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/auth?error=spotify_auth_failed`
      )
    }

    if (!code || !state) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/auth?error=missing_params`
      )
    }

    // Decode state to get userId
    const stateData = JSON.parse(Buffer.from(state, 'base64').toString())
    const { userId } = stateData

    if (!userId) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/auth?error=invalid_state`
      )
    }

    // Handle the OAuth callback
    await spotifyService.handleCallback(code, userId)

    // Redirect back to platform connect page with success
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/platforms/connect?platforms=spotify&success=spotify_connected`
    )
  } catch (error) {
    console.error('Spotify callback error:', error)
    
    // Check if it's a service role key issue
    if (error instanceof Error && error.message.includes('Service role key not configured')) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/auth?error=service_role_key_missing`
      )
    }
    
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/auth?error=callback_failed`
    )
  }
}
