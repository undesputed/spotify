import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '@/lib/types'
import { api } from '@/lib/api'

interface AuthState {
  user: User | null
  isLoading: boolean
  error: string | null
  
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string) => Promise<void>
  signOut: () => void
  clearError: () => void
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      error: null,

      signIn: async (email: string, password: string) => {
        set({ isLoading: true, error: null })
        try {
          const response = await api.signIn(email, password)
          set({ user: response.user, isLoading: false })
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
          const response = await api.signUp(email, password, name)
          set({ user: response.user, isLoading: false })
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