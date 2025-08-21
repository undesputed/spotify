'use client'

import { useSupabaseAuth } from '@/hooks/useSupabaseAuth'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export default function AuthTestPage() {
  const { user, appUser, loading } = useSupabaseAuth()
  const [session, setSession] = useState<any>(null)
  const [sessionLoading, setSessionLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      setSessionLoading(false)
    }
    checkSession()
  }, [supabase.auth])

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Authentication Test</h1>
        
        <div className="space-y-4">
          <div className="bg-card p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Auth Hook State</h2>
            <div className="space-y-2 text-sm">
              <div>Loading: {loading ? 'Yes' : 'No'}</div>
              <div>User: {user ? 'Yes' : 'No'}</div>
              <div>App User: {appUser ? 'Yes' : 'No'}</div>
              {user && (
                <div className="mt-2 p-2 bg-gray-100 rounded">
                  <div>Email: {user.email}</div>
                  <div>ID: {user.id}</div>
                  <div>Email Verified: {user.email_confirmed_at ? 'Yes' : 'No'}</div>
                </div>
              )}
              {appUser && (
                <div className="mt-2 p-2 bg-gray-100 rounded">
                  <div>Name: {appUser.name}</div>
                  <div>Premium: {appUser.is_premium ? 'Yes' : 'No'}</div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-card p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Direct Session Check</h2>
            <div className="space-y-2 text-sm">
              <div>Session Loading: {sessionLoading ? 'Yes' : 'No'}</div>
              <div>Session: {session ? 'Yes' : 'No'}</div>
              {session && (
                <div className="mt-2 p-2 bg-gray-100 rounded">
                  <div>Access Token: {session.access_token ? 'Present' : 'Missing'}</div>
                  <div>Refresh Token: {session.refresh_token ? 'Present' : 'Missing'}</div>
                  <div>Expires At: {new Date(session.expires_at * 1000).toLocaleString()}</div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-card p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Actions</h2>
            <div className="space-y-2">
              <button
                onClick={() => window.location.href = '/auth'}
                className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
              >
                Go to Auth Page
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="px-4 py-2 bg-secondary text-white rounded hover:bg-secondary/90 ml-2"
              >
                Go to Home
              </button>
              <button
                onClick={async () => {
                  try {
                    const response = await fetch('/api/user/profile')
                    const data = await response.json()
                    console.log('Profile check result:', data)
                    alert(data.created ? 'Profile created!' : 'Profile already exists')
                    window.location.reload()
                  } catch (error) {
                    console.error('Profile check failed:', error)
                    alert('Profile check failed')
                  }
                }}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 ml-2"
              >
                Check/Create Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
