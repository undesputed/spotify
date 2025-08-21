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
        process.env.NODE_ENV === 'production'
          ? `${process.env.NEXT_PUBLIC_APP_URL}/auth?error=spotify_auth_failed`
          : 'https://887e2c478073.ngrok-free.app/auth?error=spotify_auth_failed'
      )
    }

    if (!code || !state) {
      return NextResponse.redirect(
        process.env.NODE_ENV === 'production'
          ? `${process.env.NEXT_PUBLIC_APP_URL}/auth?error=missing_params`
          : 'https://887e2c478073.ngrok-free.app/auth?error=missing_params'
      )
    }

    // Decode state to get userId
    const stateData = JSON.parse(Buffer.from(state, 'base64').toString())
    const { userId } = stateData

    if (!userId) {
      return NextResponse.redirect(
        process.env.NODE_ENV === 'production'
          ? `${process.env.NEXT_PUBLIC_APP_URL}/auth?error=invalid_state`
          : 'https://887e2c478073.ngrok-free.app/auth?error=invalid_state'
      )
    }

    // Handle the OAuth callback
    await spotifyService.handleCallback(code, userId)

    // Redirect to success page
    return NextResponse.redirect(
      process.env.NODE_ENV === 'production'
        ? `${process.env.NEXT_PUBLIC_APP_URL}/spotify-test?success=spotify_connected`
        : 'https://887e2c478073.ngrok-free.app/spotify-test?success=spotify_connected'
    )
  } catch (error) {
    console.error('Spotify callback error:', error)
    return NextResponse.redirect(
      process.env.NODE_ENV === 'production'
        ? `${process.env.NEXT_PUBLIC_APP_URL}/auth?error=callback_failed`
        : 'https://887e2c478073.ngrok-free.app/auth?error=callback_failed'
    )
  }
}
