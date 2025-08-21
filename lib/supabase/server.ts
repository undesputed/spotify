import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

type Tables = Database['public']['Tables']
type Enums = Database['public']['Enums']

// Type aliases for better readability
export type User = Tables['users']['Row']
export type UserInsert = Tables['users']['Insert']
export type UserUpdate = Tables['users']['Update']

export type UserService = Tables['user_services']['Row']
export type UserServiceInsert = Tables['user_services']['Insert']
export type UserServiceUpdate = Tables['user_services']['Update']

export type MusicService = Enums['music_service']

export class SupabaseServerService {
  private supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    // Use anon key as fallback if service role key is invalid
    process.env.SUPABASE_SERVICE_ROLE_KEY?.includes('0000000000000000000000000000000000000000') 
      ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      : process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // =====================================================
  // USER OPERATIONS
  // =====================================================

  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) return null

      const { data, error } = await this.supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Error getting user from database:', error)
        return null
      }
      return data
    } catch (error) {
      console.error('Error getting current user:', error)
      return null
    }
  }

  async createUser(userData: UserInsert): Promise<User> {
    const { data, error } = await this.supabase
      .from('users')
      .insert(userData)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async updateUser(userId: string, updates: UserUpdate): Promise<User> {
    const { data, error } = await this.supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // =====================================================
  // SERVICE CONNECTION OPERATIONS (Server-side)
  // =====================================================

  async getUserServices(userId: string): Promise<UserService[]> {
    const { data, error } = await this.supabase
      .from('user_services')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)

    if (error) throw error
    return data
  }

  async connectService(serviceData: UserServiceInsert): Promise<UserService> {
    try {
      const { data, error } = await this.supabase
        .from('user_services')
        .upsert(serviceData, { onConflict: 'user_id,service_id' })
        .select()
        .single()

      if (error) {
        console.error('Error connecting service:', error)
        
        // If it's an RLS error and we're using anon key, provide helpful message
        if (error.message?.includes('row-level security') && 
            process.env.SUPABASE_SERVICE_ROLE_KEY?.includes('0000000000000000000000000000000000000000')) {
          throw new Error('Service role key not configured. Please update SUPABASE_SERVICE_ROLE_KEY in your .env file with the real key from Supabase Dashboard.')
        }
        
        throw error
      }
      return data
    } catch (error) {
      console.error('Error in connectService:', error)
      throw error
    }
  }

  async disconnectService(userId: string, serviceId: MusicService): Promise<void> {
    const { error } = await this.supabase
      .from('user_services')
      .update({ is_active: false })
      .eq('user_id', userId)
      .eq('service_id', serviceId)

    if (error) throw error
  }

  async updateService(userId: string, serviceId: MusicService, updates: UserServiceUpdate): Promise<UserService> {
    const { data, error } = await this.supabase
      .from('user_services')
      .update(updates)
      .eq('user_id', userId)
      .eq('service_id', serviceId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // =====================================================
  // UTILITY OPERATIONS
  // =====================================================

  async ensureUserExists(userId: string, email?: string, name?: string): Promise<User> {
    // Try to get existing user
    const { data: existingUser, error: getError } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (existingUser) {
      return existingUser
    }

    // Create user if doesn't exist
    if (email && name) {
      const { data: newUser, error: createError } = await this.supabase
        .from('users')
        .insert({
          id: userId,
          email,
          name,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (createError) {
        console.error('Error creating user:', createError)
        throw createError
      }

      return newUser
    }

    throw new Error('User not found and insufficient data to create user')
  }
}

// Export a singleton instance
export const supabaseServerService = new SupabaseServerService()
