import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
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

    // Deactivate YouTube Music connection
    const { error } = await supabase
      .from('user_services')
      .update({ is_active: false })
      .eq('user_id', user.id)
      .eq('service_id', 'youtube_music')

    if (error) {
      console.error('Failed to disconnect YouTube Music:', error)
      return NextResponse.json(
        { error: 'Failed to disconnect YouTube Music' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'YouTube Music disconnected successfully'
    })
  } catch (error) {
    console.error('YouTube disconnect error:', error)
    return NextResponse.json(
      { error: 'Failed to disconnect YouTube Music' },
      { status: 500 }
    )
  }
}
