import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useSupabaseAuth } from './useSupabaseAuth'

// This hook now uses Supabase authentication
// The old Zustand store is kept for backward compatibility
// but the actual authentication is handled by useSupabaseAuth

export const useAuth = () => {
  const supabaseAuth = useSupabaseAuth()
  
  return {
    user: supabaseAuth.appUser,
    isLoading: supabaseAuth.loading,
    error: null, // Errors are handled in the auth form
    
    signIn: supabaseAuth.signIn,
    signUp: supabaseAuth.signUp,
    signOut: supabaseAuth.signOut,
    clearError: () => {}, // No longer needed with Supabase
  }
}

// Keep the old Zustand store for backward compatibility
// This can be removed once all components are updated
export const useAuthStore = create<{
  user: any
  isLoading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string) => Promise<void>
  signOut: () => void
  clearError: () => void
}>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      error: null,

      signIn: async (email: string, password: string) => {
        set({ isLoading: true, error: null })
        try {
          // This is now handled by Supabase
          set({ isLoading: false })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Sign in failed',
            isLoading: false 
          })
        }
      },

      signUp: async (email: string, password: string, name: string) => {
        set({ isLoading: true, error: null })
        try {
          // This is now handled by Supabase
          set({ isLoading: false })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Sign up failed',
            isLoading: false 
          })
        }
      },

      signOut: () => {
        set({ user: null, error: null })
      },

      clearError: () => {
        set({ error: null })
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user })
    }
  )
)