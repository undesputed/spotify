'use client'

import { useState } from 'react'
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Music, CheckCircle, XCircle, ExternalLink } from 'lucide-react'

export function SpotifyConnect() {
  const [connecting, setConnecting] = useState(false)
  const [connected, setConnected] = useState(false)
  const { user, appUser } = useSupabaseAuth()

  const handleConnect = async () => {
    if (!user) {
      alert('Please sign in first')
      return
    }

    setConnecting(true)
    try {
      // Get authorization URL
      const response = await fetch(`/api/auth/spotify?userId=${user.id}`)
      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      // Redirect to Spotify authorization
      window.location.href = data.authUrl
    } catch (error) {
      console.error('Failed to connect Spotify:', error)
      alert('Failed to connect Spotify. Please try again.')
    } finally {
      setConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    if (!user) return

    try {
      // This would disconnect the service
      // For now, we'll just update the UI
      setConnected(false)
    } catch (error) {
      console.error('Failed to disconnect Spotify:', error)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <div className="p-6 border-b border-white/10">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Music className="w-5 h-5 text-green-500" />
          Spotify
        </h2>
      </div>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Connect your Spotify account</p>
            <p className="text-sm text-gray-600">
              Access your playlists, liked songs, and recommendations
            </p>
          </div>
          {connected ? (
            <CheckCircle className="w-6 h-6 text-green-500" />
          ) : (
            <XCircle className="w-6 h-6 text-gray-400" />
          )}
        </div>

        {connected ? (
          <div className="space-y-2">
            <Button
              onClick={handleDisconnect}
              variant="outline"
              className="w-full"
            >
              Disconnect Spotify
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.open('https://open.spotify.com', '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open Spotify
            </Button>
          </div>
        ) : (
          <Button
            onClick={handleConnect}
            disabled={connecting || !user}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {connecting ? 'Connecting...' : 'Connect Spotify'}
          </Button>
        )}

        {!user && (
          <p className="text-sm text-gray-500 text-center">
            Please sign in to connect your Spotify account
          </p>
        )}
      </CardContent>
    </Card>
  )
}
