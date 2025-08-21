'use client'

import React from 'react'
import { Play, Pause, SkipBack, SkipForward, Volume2, Heart, MoreHorizontal } from 'lucide-react'
import { usePlayer } from '@/hooks/usePlayer'
import { Button } from '@/components/ui/Button'
import { formatDuration } from '@/lib/utils'

export function MiniPlayer() {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    toggle,
    next,
    previous,
    setCurrentTime,
    setVolume
  } = usePlayer()

  if (!currentTrack) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-white/10">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Track Info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
            <img
              src={currentTrack.artwork}
              alt={currentTrack.title}
              width={48}
              height={48}
              className="object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground truncate">
              {currentTrack.title}
            </p>
            <p className="text-xs text-foreground-muted truncate">
              {currentTrack.artist.name}
            </p>
          </div>
          <Button variant="ghost" size="icon" className="flex-shrink-0">
            <Heart className="w-4 h-4" />
          </Button>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 px-8">
          <Button variant="ghost" size="icon" onClick={previous}>
            <SkipBack className="w-4 h-4" />
          </Button>
          <Button 
            variant="primary" 
            size="icon" 
            onClick={toggle}
            className="w-8 h-8"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </Button>
          <Button variant="ghost" size="icon" onClick={next}>
            <SkipForward className="w-4 h-4" />
          </Button>
        </div>

        {/* Progress & Volume */}
        <div className="flex items-center gap-4 flex-1 justify-end">
          <span className="text-xs text-foreground-muted">
            {formatDuration(currentTime)}
          </span>
          
          {/* Progress Bar */}
          <div 
            className="w-24 h-1 bg-white/20 rounded-full cursor-pointer"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              const percent = (e.clientX - rect.left) / rect.width
              setCurrentTime(percent * duration)
            }}
          >
            <div 
              className="h-full bg-primary-500 rounded-full transition-all"
              style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
            />
          </div>

          <span className="text-xs text-foreground-muted">
            {formatDuration(duration)}
          </span>

          {/* Volume */}
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-foreground-muted" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-16 h-1 bg-white/20 rounded-full appearance-none cursor-pointer"
            />
          </div>

          <Button variant="ghost" size="icon">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}