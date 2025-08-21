import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createClient()

    // Test database connection
    const { data: artists, error: artistsError } = await supabase
      .from('artists')
      .select('count')
      .limit(1)

    if (artistsError) {
      return NextResponse.json(
        { 
          status: 'error', 
          message: 'Database connection failed', 
          error: artistsError.message 
        },
        { status: 500 }
      )
    }

    // Test authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    return NextResponse.json({
      status: 'success',
      message: 'Supabase connection working',
      database: 'connected',
      authentication: authError ? 'error' : 'working',
      user: user ? { id: user.id, email: user.email } : null,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Supabase test failed', 
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
