'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth'
import { useAudioPlayer } from '@/hooks/useAudioPlayer'
import { YouTubeConnect } from '@/components/services/YouTubeConnect'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent } from '@/components/ui/Card'
import { Search, Play, Heart, Pause, Youtube } from 'lucide-react'

export default function YouTubeTestPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [likedTracks, setLikedTracks] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const { user, appUser } = useSupabaseAuth()
  const { play, pause, stop, isPlaying, currentTrack } = useAudioPlayer()
  const searchParams = useSearchParams()
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    const success = searchParams.get('success')
    if (success === 'youtube_connected') {
      setShowSuccess(true)
      const url = new URL(window.location.href)
      url.searchParams.delete('success')
      window.history.replaceState({}, '', url.toString())
    }
  }, [searchParams])

  const handlePlayPreview = (track: any) => {
    if (currentTrack?.id === track.id && isPlaying) {
      pause()
    } else {
      // For YouTube, we'll use the video ID to create a preview URL
      const previewUrl = `https://www.youtube.com/watch?v=${track.videoId}`
      play({
        id: track.id,
        title: track.title,
        artist: track.artist,
        url: previewUrl,
        artwork: track.artwork
      })
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    
    setSearchLoading(true)
    try {
      const response = await fetch(`/api/youtube/search?q=${encodeURIComponent(searchQuery)}`)
      const data = await response.json()
      
      if (data.success) {
        setSearchResults(data.tracks)
      } else {
        console.error('Search failed:', data.error)
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setSearchLoading(false)
    }
  }

  const handleGetLikedTracks = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/youtube/liked-tracks')
      const data = await response.json()
      
      if (data.success) {
        setLikedTracks(data.tracks)
      } else {
        console.error('Failed to get liked tracks:', data.error)
      }
    } catch (error) {
      console.error('Error getting liked tracks:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const renderTrackCard = (track: any, index: number) => (
    <div key={track.id} className="bg-background-secondary rounded-lg p-4 hover:bg-background-secondary/80 transition-colors">
      <div className="flex items-center gap-4">
        <div className="relative">
          <img
            src={track.artwork}
            alt={track.title}
            className="w-16 h-16 rounded object-cover"
          />
          <button
            onClick={() => handlePlayPreview(track)}
            className="absolute inset-0 flex items-center justify-center bg-black/50 rounded opacity-0 hover:opacity-100 transition-opacity"
          >
            {currentTrack?.id === track.id && isPlaying ? (
              <Pause className="w-6 h-6 text-white" />
            ) : (
              <Play className="w-6 h-6 text-white" />
            )}
          </button>
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white truncate">{track.title}</h3>
          <p className="text-gray-400 text-sm truncate">{track.artist}</p>
          <div className="flex items-center gap-4 mt-1">
            <span className="text-xs text-gray-500">{formatDuration(track.duration)}</span>
            <span className="text-xs text-gray-500">{track.viewCount.toLocaleString()} views</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-gray-400 hover:text-red-500 cursor-pointer" />
          <a
            href={`https://www.youtube.com/watch?v=${track.videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-red-500"
          >
            <Youtube className="w-5 h-5" />
          </a>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background-secondary p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Success Message */}
        {showSuccess && (
          <Card className="bg-green-600/20 border-green-500/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-green-400">YouTube Music Connected!</h3>
                  <p className="text-green-300 text-sm">Your YouTube Music account has been successfully connected.</p>
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
              <h1 className="text-4xl font-bold text-white mb-4">YouTube Music Integration Test</h1>
              <p className="text-gray-300">Test the YouTube Music API integration with real music data</p>
            </div>
          </div>
        </div>

        {/* YouTube Connection */}
        <div className="flex justify-center">
          <YouTubeConnect />
        </div>

        {user && (
          <>
            {/* Search Section */}
            <Card>
              <div className="p-6 border-b border-white/10">
                <h2 className="text-xl font-semibold">Search YouTube Music</h2>
              </div>
              <CardContent className="p-6">
                <div className="flex gap-4 mb-6">
                  <Input
                    placeholder="Search for music, artists, songs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSearch}
                    disabled={searchLoading || !searchQuery.trim()}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {searchLoading ? 'Searching...' : 'Search'}
                  </Button>
                </div>

                {searchResults.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Search Results</h3>
                    {searchResults.map(renderTrackCard)}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Liked Tracks Section */}
            <Card>
              <div className="p-6 border-b border-white/10">
                <h2 className="text-xl font-semibold">Your Liked Videos</h2>
              </div>
              <CardContent className="p-6">
                <Button
                  onClick={handleGetLikedTracks}
                  disabled={loading}
                  className="mb-6 bg-red-600 hover:bg-red-700"
                >
                  {loading ? 'Loading...' : 'Get Liked Videos'}
                </Button>

                {likedTracks.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Liked Videos</h3>
                    {likedTracks.map(renderTrackCard)}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {!user && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-400">Please sign in to test the YouTube Music integration</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
