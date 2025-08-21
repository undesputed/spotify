'use client'

import { useState, useEffect, useRef } from 'react'
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth'
import { centralizedMusicService, PlayableTrack } from '@/lib/services/centralized-music-service'
import { uploadService } from '@/lib/services/upload-service'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX,
  ExternalLink,
  Music,
  Spotify,
  Youtube,
  Heart,
  Share2
} from 'lucide-react'

interface UnifiedMusicPlayerProps {
  track: PlayableTrack
  onPlay?: () => void
  onPause?: () => void
  onEnded?: () => void
  className?: string
}

export function UnifiedMusicPlayer({ 
  track, 
  onPlay, 
  onPause, 
  onEnded,
  className = '' 
}: UnifiedMusicPlayerProps) {
  const { user } = useSupabaseAuth()
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')

  // Format time in MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Handle play/pause
  const togglePlay = async () => {
    if (!track) return

    if (isPlaying) {
      pause()
    } else {
      await play()
    }
  }

  // Play track
  const play = async () => {
    if (!track) return

    setIsLoading(true)
    setError('')

    try {
      // Determine audio source
      let url = ''

      if (track.playable_source) {
        // Play from our own catalog
        url = await uploadService.getAudioUrl(track.playable_source.storage_key || '')
      } else if (track.spotify_url) {
        // Redirect to Spotify
        window.open(track.spotify_url, '_blank')
        return
      } else if (track.youtube_url) {
        // Redirect to YouTube
        window.open(track.youtube_url, '_blank')
        return
      } else {
        throw new Error('No playable source available')
      }

      if (!url) {
        throw new Error('Failed to get audio URL')
      }

      setAudioUrl(url)

      // Wait for audio to load
      if (audioRef.current) {
        audioRef.current.src = url
        await audioRef.current.play()
        setIsPlaying(true)
        onPlay?.()
      }

    } catch (error) {
      console.error('Play error:', error)
      setError(error instanceof Error ? error.message : 'Failed to play track')
    } finally {
      setIsLoading(false)
    }
  }

  // Pause track
  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
      onPause?.()
    }
  }

  // Handle audio events
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime)
    const handleLoadedMetadata = () => setDuration(audio.duration)
    const handleEnded = () => {
      setIsPlaying(false)
      onEnded?.()
    }
    const handleError = () => {
      setError('Failed to load audio')
      setIsPlaying(false)
    }

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('error', handleError)

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('error', handleError)
    }
  }, [onEnded])

  // Handle volume changes
  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
  }

  // Handle mute toggle
  const toggleMute = () => {
    const newMuted = !isMuted
    setIsMuted(newMuted)
    if (audioRef.current) {
      audioRef.current.muted = newMuted
    }
  }

  // Handle seek
  const handleSeek = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(event.target.value)
    setCurrentTime(newTime)
    if (audioRef.current) {
      audioRef.current.currentTime = newTime
    }
  }

  // Record play analytics
  const recordPlay = async () => {
    if (!user || !track.playable_source) return

    try {
      await centralizedMusicService.recordPlay(
        user.id,
        track.playable_source.id,
        parseInt(track.id.replace('own_', '')),
        Math.floor(currentTime * 1000)
      )
    } catch (error) {
      console.error('Error recording play:', error)
    }
  }

  // Record play when track ends
  useEffect(() => {
    if (!isPlaying && currentTime > 0 && duration > 0) {
      recordPlay()
    }
  }, [isPlaying, currentTime, duration])

  // Get platform icon
  const getPlatformIcon = () => {
    if (track.playable_source) {
      return <Music className="w-4 h-4 text-green-500" />
    } else if (track.spotify_url) {
      return <Spotify className="w-4 h-4 text-green-500" />
    } else if (track.youtube_url) {
      return <Youtube className="w-4 h-4 text-red-500" />
    }
    return <Music className="w-4 h-4 text-gray-400" />
  }

  // Get play button text
  const getPlayButtonText = () => {
    if (isLoading) return 'Loading...'
    if (track.playable_source) return isPlaying ? 'Pause' : 'Play'
    if (track.spotify_url) return 'Open in Spotify'
    if (track.youtube_url) return 'Open in YouTube'
    return 'Not Available'
  }

  // Get play button action
  const getPlayButtonAction = () => {
    if (track.playable_source) {
      return togglePlay
    } else if (track.spotify_url) {
      return () => window.open(track.spotify_url, '_blank')
    } else if (track.youtube_url) {
      return () => window.open(track.youtube_url, '_blank')
    }
    return () => {}
  }

  if (!track) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <p className="text-gray-400">No track selected</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardContent className="p-6">
        {/* Track Info */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            <img
              src={track.artwork || '/default-album-art.jpg'}
              alt={track.title}
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              {getPlatformIcon()}
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white truncate">{track.title}</h3>
            <p className="text-gray-400 text-sm truncate">
              {track.artists.join(', ')}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-500">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
              {track.explicit && (
                <span className="text-xs bg-gray-700 text-gray-300 px-1 rounded">E</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Heart className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Audio Element */}
        <audio ref={audioRef} preload="metadata" />

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-3 mb-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Progress Bar */}
        {track.playable_source && (
          <div className="mb-4">
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <SkipBack className="w-4 h-4" />
            </Button>
            
            <Button
              onClick={getPlayButtonAction()}
              disabled={isLoading || (!track.playable_source && !track.spotify_url && !track.youtube_url)}
              className={`px-6 ${
                track.playable_source 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : track.playable_source ? (
                isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />
              ) : (
                <ExternalLink className="w-4 h-4" />
              )}
            </Button>
            
            <Button variant="ghost" size="sm">
              <SkipForward className="w-4 h-4" />
            </Button>
          </div>

          {/* Volume Control */}
          {track.playable_source && (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={toggleMute}>
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-20 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
          )}
        </div>

        {/* Platform Info */}
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="flex items-center justify-between text-sm text-gray-400">
            <div className="flex items-center gap-2">
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
            
            <div className="flex items-center gap-1">
              <span>Primary:</span>
              {getPlatformIcon()}
              <span className="capitalize">{track.primary_platform}</span>
            </div>
          </div>
        </div>
      </CardContent>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #10b981;
          cursor: pointer;
        }
        
        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #10b981;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </Card>
  )
}
