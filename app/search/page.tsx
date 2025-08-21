'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth'
import { UnifiedMusicPlayer } from '@/components/player/UnifiedMusicPlayer'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent } from '@/components/ui/Card'
import { 
  Search, 
  Music, 
  Spotify, 
  Youtube, 
  Play, 
  Heart, 
  Share2,
  Filter,
  Grid,
  List
} from 'lucide-react'

export default function SearchPage() {
  const { user } = useSupabaseAuth()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedTrack, setSelectedTrack] = useState<any>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filters, setFilters] = useState({
    platform: 'all',
    hasPlayable: false
  })

  // Get initial search query from URL
  useEffect(() => {
    const query = searchParams.get('q')
    if (query) {
      setSearchQuery(query)
      handleSearch(query)
    }
  }, [searchParams])

  const handleSearch = async (query?: string) => {
    const searchTerm = query || searchQuery
    if (!searchTerm.trim()) return

    setLoading(true)
    try {
      const response = await fetch(`/api/music/search?q=${encodeURIComponent(searchTerm)}`)
      const data = await response.json()
      
      if (data.success) {
        setSearchResults(data.tracks)
      } else {
        console.error('Search failed:', data.error)
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTrackSelect = (track: any) => {
    setSelectedTrack(track)
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'own':
        return <Music className="w-4 h-4 text-green-500" />
      case 'spotify':
        return <Spotify className="w-4 h-4 text-green-500" />
      case 'youtube':
        return <Youtube className="w-4 h-4 text-red-500" />
      default:
        return <Music className="w-4 h-4 text-gray-400" />
    }
  }

  const getPlatformName = (platform: string) => {
    switch (platform) {
      case 'own':
        return 'Own Catalog'
      case 'spotify':
        return 'Spotify'
      case 'youtube':
        return 'YouTube'
      default:
        return platform
    }
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const filteredResults = searchResults.filter(track => {
    if (filters.platform !== 'all' && track.primary_platform !== filters.platform) {
      return false
    }
    if (filters.hasPlayable && !track.playable_source) {
      return false
    }
    return true
  })

  const renderTrackCard = (track: any) => (
    <Card 
      key={track.id} 
      className="hover:bg-background-secondary/50 transition-colors cursor-pointer"
      onClick={() => handleTrackSelect(track)}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={track.artwork || '/default-album-art.jpg'}
              alt={track.title}
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg opacity-0 hover:opacity-100 transition-opacity">
              <Play className="w-6 h-6 text-white" />
            </div>
            <div className="absolute top-1 right-1">
              {getPlatformIcon(track.primary_platform)}
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white truncate">{track.title}</h3>
            <p className="text-gray-400 text-sm truncate">
              {track.artists.join(', ')}
            </p>
            {track.album && (
              <p className="text-gray-500 text-xs truncate">{track.album}</p>
            )}
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-500">
                {formatDuration(track.duration)}
              </span>
              {track.explicit && (
                <span className="text-xs bg-gray-700 text-gray-300 px-1 rounded">E</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm">
              <Heart className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Platform Availability */}
        <div className="mt-3 pt-3 border-t border-gray-700">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>Available on:</span>
            <div className="flex items-center gap-1">
              {track.available_platforms.includes('own') && (
                <span className="flex items-center gap-1">
                  <Music className="w-3 h-3" />
                  Own
                </span>
              )}
              {track.available_platforms.includes('spotify') && (
                <span className="flex items-center gap-1">
                  <Spotify className="w-3 h-3" />
                  Spotify
                </span>
              )}
              {track.available_platforms.includes('youtube') && (
                <span className="flex items-center gap-1">
                  <Youtube className="w-3 h-3" />
                  YouTube
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderTrackList = (track: any) => (
    <div 
      key={track.id} 
      className="flex items-center gap-4 p-4 hover:bg-background-secondary/50 transition-colors cursor-pointer rounded-lg"
      onClick={() => handleTrackSelect(track)}
    >
      <div className="relative">
        <img
          src={track.artwork || '/default-album-art.jpg'}
          alt={track.title}
          className="w-12 h-12 rounded object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded opacity-0 hover:opacity-100 transition-opacity">
          <Play className="w-4 h-4 text-white" />
        </div>
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-white truncate">{track.title}</h3>
        <p className="text-gray-400 text-sm truncate">
          {track.artists.join(', ')}
        </p>
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-400">
        <span>{formatDuration(track.duration)}</span>
        <div className="flex items-center gap-1">
          {getPlatformIcon(track.primary_platform)}
          <span>{getPlatformName(track.primary_platform)}</span>
        </div>
        {track.explicit && (
          <span className="text-xs bg-gray-700 text-gray-300 px-1 rounded">E</span>
        )}
      </div>

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm">
          <Heart className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm">
          <Share2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background-secondary p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex flex-col items-center gap-4 mb-6">
            <img 
              src="/logo.png" 
              alt="Music Central Logo" 
              className="w-20 h-20 rounded-lg object-cover"
            />
            <div>
              <h1 className="text-4xl font-bold text-white mb-4">Search Music</h1>
              <p className="text-gray-300">
                Search across Spotify, YouTube, and our own catalog. Find your favorite tracks and discover new music.
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto">
          <div className="flex gap-4">
            <Input
              placeholder="Search for songs, artists, albums..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
            />
            <Button
              onClick={() => handleSearch()}
              disabled={loading || !searchQuery.trim()}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </div>
        </div>

        {/* Filters and View Toggle */}
        {searchResults.length > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-400">Filter:</span>
              </div>
              
              <select
                value={filters.platform}
                onChange={(e) => setFilters(prev => ({ ...prev, platform: e.target.value }))}
                className="bg-background-secondary border border-gray-600 rounded px-3 py-1 text-sm text-white"
              >
                <option value="all">All Platforms</option>
                <option value="own">Own Catalog</option>
                <option value="spotify">Spotify</option>
                <option value="youtube">YouTube</option>
              </select>

              <label className="flex items-center gap-2 text-sm text-gray-400">
                <input
                  type="checkbox"
                  checked={filters.hasPlayable}
                  onChange={(e) => setFilters(prev => ({ ...prev, hasPlayable: e.target.checked }))}
                  className="rounded"
                />
                Playable only
              </label>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Results */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Searching...</p>
          </div>
        )}

        {!loading && searchResults.length === 0 && searchQuery && (
          <div className="text-center py-12">
            <Music className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No results found</h3>
            <p className="text-gray-400">
              Try searching for something else or check your spelling.
            </p>
          </div>
        )}

        {!loading && filteredResults.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-gray-400">
                Found {filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''}
              </p>
            </div>

            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredResults.map(renderTrackCard)}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredResults.map(renderTrackList)}
              </div>
            )}
          </div>
        )}

        {/* Selected Track Player */}
        {selectedTrack && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-gray-700">
            <div className="max-w-4xl mx-auto">
              <UnifiedMusicPlayer track={selectedTrack} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
