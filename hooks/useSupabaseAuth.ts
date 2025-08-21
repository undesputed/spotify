'use client'

import { useSupabase } from '@/components/providers/SupabaseProvider'
import type { User } from '@supabase/supabase-js'
import type { User as AppUser } from '@/lib/supabase/service'

export function useSupabaseAuth() {
  const { user, appUser, loading, supabase } = useSupabase()

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) {
      console.error('Sign in error:', error)
      throw error
    }
    
    if (data.user) {
      console.log('User signed in successfully:', data.user.email)
      
      // Try to get or create user profile
      try {
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single()
        
        if (profileError && profileError.code === 'PGRST116') {
          // Profile doesn't exist, create it
          console.log('Creating user profile for:', data.user.email)
          const { error: createError } = await supabase
            .from('users')
            .insert({
              id: data.user.id,
              email: data.user.email!,
              name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User',
            })
          
          if (createError) {
            console.error('Failed to create user profile:', createError)
          }
        } else if (profileError) {
          console.error('Error fetching user profile:', profileError)
        }
      } catch (profileError) {
        console.error('Error handling user profile:', profileError)
      }
    }
  }

  const signUp = async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    })
    if (error) throw error

    // Create user profile in our users table
    if (data.user) {
      try {
        console.log('Creating user profile for sign-up:', data.user.email)
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
          console.error('Failed to create user profile during sign-up:', profileError)
          // Try again after a short delay
          setTimeout(async () => {
            try {
              const { error: retryError } = await supabase
                .from('users')
                .insert({
                  id: data.user!.id,
                  email: data.user!.email!,
                  name,
                })
              if (retryError) {
                console.error('Retry failed to create user profile:', retryError)
              }
            } catch (retryError) {
              console.error('Retry error creating user profile:', retryError)
            }
          }, 1000)
        } else {
          console.log('User profile created successfully:', profile)
        }
      } catch (profileError) {
        console.error('Error creating user profile during sign-up:', profileError)
        // Don't throw error here as the auth user was created successfully
        // The profile can be created later if needed
      }
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    if (error) throw error
  }

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({
      password,
    })
    if (error) throw error
  }

  const updateProfile = async (updates: { name?: string; image_url?: string }) => {
    if (!user) throw new Error('No user logged in')

    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id)

    if (error) throw error
  }

  return {
    user,
    appUser,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
  }
}
