'use client'

import { useSupabaseAuth } from '@/hooks/useSupabaseAuth'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export function AuthDebug() {
  const { user, appUser, loading } = useSupabaseAuth()
  const [session, setSession] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
    }
    checkSession()
  }, [supabase.auth])

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs max-w-sm">
      <h3 className="font-bold mb-2">Auth Debug</h3>
      <div className="space-y-1">
        <div>Loading: {loading ? 'Yes' : 'No'}</div>
        <div>User: {user ? 'Yes' : 'No'}</div>
        <div>App User: {appUser ? 'Yes' : 'No'}</div>
        <div>Session: {session ? 'Yes' : 'No'}</div>
        {user && (
          <div className="mt-2">
            <div>Email: {user.email}</div>
            <div>ID: {user.id}</div>
          </div>
        )}
        {appUser && (
          <div className="mt-2">
            <div>Name: {appUser.name}</div>
            <div>Premium: {appUser.is_premium ? 'Yes' : 'No'}</div>
          </div>
        )}
      </div>
    </div>
  )
}
