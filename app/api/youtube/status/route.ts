import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { connected: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Check if user has YouTube Music connected
    const { data: userServices, error } = await supabase
      .from('user_services')
      .select('*')
      .eq('user_id', user.id)
      .eq('service_id', 'youtube_music')
      .eq('is_active', true)
      .single()

    if (error || !userServices) {
      return NextResponse.json({
        connected: false,
        message: 'YouTube Music not connected'
      })
    }

    return NextResponse.json({
      connected: true,
      service: userServices
    })
  } catch (error) {
    console.error('YouTube status check error:', error)
    return NextResponse.json(
      { connected: false, error: 'Failed to check status' },
      { status: 500 }
    )
  }
}
