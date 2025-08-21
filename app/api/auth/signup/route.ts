import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json()
    const supabase = await createClient()

    // Create the auth user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (data.user) {
      // Create user profile in public.users table
      try {
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email!,
            name,
          })
          .select()
          .single()

        if (profileError) {
          console.error('Failed to create user profile:', profileError)
          // Don't fail the sign-up, but log the error
          return NextResponse.json({ 
            success: true, 
            user: data.user,
            profileCreated: false,
            message: 'Account created but profile setup failed. Please contact support.'
          })
        }

        return NextResponse.json({ 
          success: true, 
          user: data.user,
          profile: profile,
          profileCreated: true
        })
      } catch (profileError) {
        console.error('Error creating user profile:', profileError)
        return NextResponse.json({ 
          success: true, 
          user: data.user,
          profileCreated: false,
          message: 'Account created but profile setup failed. Please contact support.'
        })
      }
    }

    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  } catch (error) {
    console.error('Sign-up API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
