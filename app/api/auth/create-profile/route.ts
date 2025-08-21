import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email, name } = await request.json()
    
    if (!email || !name) {
      return NextResponse.json({
        error: 'Email and name are required'
      }, { status: 400 })
    }

    const supabase = await createClient()
    
    // Try to create a test user profile
    const { data, error } = await supabase
      .from('users')
      .insert({
        id: `test-${Date.now()}`, // Generate a test ID
        email,
        name,
      })
      .select()
      .single()
    
    if (error) {
      return NextResponse.json({
        error: 'Failed to create user profile',
        details: error.message,
        code: error.code
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      user: data
    })
  } catch (error) {
    console.error('Create profile error:', error)
    return NextResponse.json({
      error: 'Server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
