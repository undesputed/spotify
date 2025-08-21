import { NextRequest, NextResponse } from 'next/server'
import { youtubeMusicService } from '@/lib/services/youtube-music-service'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Initialize YouTube service
    const isInitialized = await youtubeMusicService.initialize(user.id)
    
    if (!isInitialized) {
      return NextResponse.json(
        { error: 'YouTube Music not connected. Please connect your account first.' },
        { status: 400 }
      )
    }

    // Get liked tracks
    const tracks = await youtubeMusicService.getLikedTracks(50)

    return NextResponse.json({
      success: true,
      tracks
    })
  } catch (error) {
    console.error('YouTube liked tracks error:', error)
    return NextResponse.json(
      { error: 'Failed to get liked tracks' },
      { status: 500 }
    )
  }
}
