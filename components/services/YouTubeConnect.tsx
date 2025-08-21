'use client'

import { useState, useEffect } from 'react'
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Youtube, CheckCircle, XCircle } from 'lucide-react'

export function YouTubeConnect() {
  const [connecting, setConnecting] = useState(false)
  const [connected, setConnected] = useState(false)
  const { user, appUser } = useSupabaseAuth()

  useEffect(() => {
    // Check if user is already connected to YouTube
    if (user) {
      checkYouTubeConnection()
    }
  }, [user])

  const checkYouTubeConnection = async () => {
    try {
      const response = await fetch('/api/youtube/status')
      const data = await response.json()
      setConnected(data.connected)
    } catch (error) {
      console.error('Failed to check YouTube connection:', error)
      setConnected(false)
    }
  }

  const handleConnect = async () => {
    if (!user) {
      alert('Please sign in first')
      return
    }

    setConnecting(true)
    try {
      const response = await fetch(`/api/auth/youtube?userId=${user.id}`)
      const data = await response.json()
      
      if (data.authUrl) {
        window.location.href = data.authUrl
      } else {
        throw new Error('Failed to get authorization URL')
      }
    } catch (error) {
      console.error('Failed to connect YouTube:', error)
      alert('Failed to connect YouTube Music. Please try again.')
    } finally {
      setConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    if (!user) return

    try {
      const response = await fetch('/api/youtube/disconnect', {
        method: 'POST'
      })
      
      if (response.ok) {
        setConnected(false)
        alert('YouTube Music disconnected successfully')
      } else {
        throw new Error('Failed to disconnect')
      }
    } catch (error) {
      console.error('Failed to disconnect YouTube:', error)
      alert('Failed to disconnect YouTube Music. Please try again.')
    }
  }

  return (
    <Card className="w-full max-w-md">
      <div className="p-6 border-b border-white/10">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Youtube className="w-6 h-6 text-red-500" />
          YouTube Music
        </h2>
      </div>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            {connected ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-green-400">Connected</span>
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5 text-gray-400" />
                <span className="text-gray-400">Not Connected</span>
              </>
            )}
          </div>

          {connected ? (
            <Button 
              onClick={handleDisconnect} 
              variant="ghost" 
              className="w-full border border-red-500/50 text-red-400 hover:bg-red-500/10"
            >
              Disconnect YouTube Music
            </Button>
          ) : (
            <Button 
              onClick={handleConnect} 
              disabled={connecting || !user} 
              className="w-full bg-red-600 hover:bg-red-700"
            >
              {connecting ? 'Connecting...' : 'Connect YouTube Music'}
            </Button>
          )}

          {!user && (
            <p className="text-sm text-gray-500 text-center">
              Please sign in to connect your YouTube Music account
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
