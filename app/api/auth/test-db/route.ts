import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Test if we can connect to the database
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    if (testError) {
      return NextResponse.json({
        error: 'Database connection error',
        details: testError.message,
        code: testError.code
      }, { status: 500 })
    }

    // Try to get the table structure (this might not work with RLS)
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1)
    
    return NextResponse.json({
      success: true,
      databaseConnected: true,
      usersTableExists: !testError,
      testData,
      usersError: usersError ? usersError.message : null,
      usersCount: users ? users.length : 0
    })
  } catch (error) {
    console.error('Database test error:', error)
    return NextResponse.json({
      error: 'Server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
