'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth'
import { useAudioPlayer } from '@/hooks/useAudioPlayer'
import { SpotifyConnect } from '@/components/services/SpotifyConnect'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent } from '@/components/ui/Card'
import { Search, Play, Heart, Pause } from 'lucide-react'

interface SpotifyTrack {
  id: string
  title: string
  artist: {
    name: string
  }
  album: {
    title: string
  }
  duration: number
  artwork: string
  previewUrl?: string
}

export default function SpotifyTestPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SpotifyTrack[]>([])
  const [searching, setSearching] = useState(false)
  const [likedTracks, setLikedTracks] = useState<SpotifyTrack[]>([])
  const [loadingLiked, setLoadingLiked] = useState(false)
  const { user, appUser } = useSupabaseAuth()
  const searchParams = useSearchParams()
  const [showSuccess, setShowSuccess] = useState(false)
  
  useEffect(() => {
    const success = searchParams.get('success')
    if (success === 'spotify_connected') {
      setShowSuccess(true)
      // Remove the success parameter from URL
      const url = new URL(window.location.href)
      url.searchParams.delete('success')
      window.history.replaceState({}, '', url.toString())
    }
  }, [searchParams])
  
  // Use the global audio player
  const {
    isPlaying,
    currentTrackId,
    play,
    pause,
    stop,
  } = useAudioPlayer()

  const handlePlayPreview = async (track: SpotifyTrack) => {
    if (!track.previewUrl) {
      alert('No preview available for this track')
      return
    }

    const success = await play(track.previewUrl, track.id)
    if (!success) {
      alert('Failed to play preview. Please try again.')
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setSearching(true)
    try {
      const response = await fetch(`/api/spotify/search?q=${encodeURIComponent(searchQuery)}&limit=20`)
      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      setSearchResults(data.tracks || [])
    } catch (error) {
      console.error('Search failed:', error)
      alert('Search failed. Please make sure you have connected your Spotify account.')
    } finally {
      setSearching(false)
    }
  }

  const handleGetLikedTracks = async () => {
    setLoadingLiked(true)
    try {
      const response = await fetch('/api/spotify/liked-tracks?limit=20')
      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      setLikedTracks(data.tracks || [])
    } catch (error) {
      console.error('Failed to get liked tracks:', error)
      alert('Failed to get liked tracks. Please make sure you have connected your Spotify account.')
    } finally {
      setLoadingLiked(false)
    }
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const renderTrackCard = (track: SpotifyTrack, isLikedTrack = false) => (
    <Card key={track.id} className="overflow-hidden">
      <div className="aspect-square bg-gray-800 relative">
        {track.artwork && (
          <img
            src={track.artwork}
            alt={track.title}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all flex items-center justify-center">
          {track.previewUrl ? (
            <Button
              size="sm"
              className="opacity-0 hover:opacity-100 transition-opacity"
              onClick={() => handlePlayPreview(track)}
            >
              {currentTrackId === track.id && isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </Button>
          ) : (
            <div className="opacity-0 hover:opacity-100 transition-opacity text-white text-xs bg-black bg-opacity-50 px-2 py-1 rounded">
              No Preview
            </div>
          )}
        </div>
      </div>
      <CardContent className="p-4">
        <h4 className="font-semibold truncate">{track.title}</h4>
        <p className="text-sm text-gray-400 truncate">{track.artist.name}</p>
        <p className="text-xs text-gray-500 truncate">{track.album.title}</p>
        <p className="text-xs text-gray-500 mt-1">
          {formatDuration(track.duration)}
        </p>
        {currentTrackId === track.id && isPlaying && (
          <div className="mt-2 text-xs text-green-500 flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            Playing preview...
          </div>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background-secondary p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Success Message */}
        {showSuccess && (
          <Card className="bg-green-600/20 border-green-500/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">✓</span>
                </div>
                <div>
                  <h3 className="font-semibold text-green-100">Spotify Connected Successfully!</h3>
                  <p className="text-green-200 text-sm">You can now search and access your Spotify data.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="text-center">
          <div className="flex flex-col items-center gap-4 mb-6">
            <img 
              src="/logo.png" 
              alt="Music Central Logo" 
              className="w-20 h-20 rounded-lg object-cover"
            />
            <div>
              <h1 className="text-4xl font-bold text-white mb-4">Spotify Integration Test</h1>
              <p className="text-gray-300">Test the Spotify API integration with real music data</p>
            </div>
          </div>
        </div>

        {/* Spotify Connection */}
        <div className="flex justify-center">
          <SpotifyConnect />
        </div>

        {/* Debug Section */}
        <Card>
          <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-semibold">Debug Spotify Configuration</h2>
          </div>
          <CardContent>
            <Button
              onClick={async () => {
                try {
                  const response = await fetch('/api/auth/spotify/test')
                  const data = await response.json()
                  console.log('Spotify config:', data)
                  alert(`Redirect URI: ${data.redirectUri}\nClient ID: ${data.clientId}\nApp URL: ${data.appUrl}`)
                } catch (error) {
                  console.error('Spotify config check failed:', error)
                  alert('Failed to check Spotify configuration')
                }
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Check Spotify Config
            </Button>
          </CardContent>
        </Card>

        {user && (
          <>
            {/* Search Section */}
            <Card>
              <div className="p-6 border-b border-white/10">
                <h2 className="text-xl font-semibold">Search Spotify</h2>
              </div>
              <CardContent>
                <div className="flex gap-4">
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for songs, artists, or albums..."
                    className="flex-1"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <Button
                    onClick={handleSearch}
                    disabled={searching || !searchQuery.trim()}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    {searching ? 'Searching...' : 'Search'}
                  </Button>
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-4">Search Results</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {searchResults.map((track) => renderTrackCard(track))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Liked Tracks Section */}
            <Card>
              <div className="p-6 border-b border-white/10">
                <h2 className="text-xl font-semibold">Your Liked Tracks</h2>
              </div>
              <CardContent>
                <Button
                  onClick={handleGetLikedTracks}
                  disabled={loadingLiked}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  {loadingLiked ? 'Loading...' : 'Load Liked Tracks'}
                </Button>

                {/* Liked Tracks Results */}
                {likedTracks.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-4">Your Liked Tracks</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {likedTracks.map((track) => renderTrackCard(track, true))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {!user && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-400">Please sign in to test the Spotify integration</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
