'use client'

import React from 'react'
import { Play, Heart, MoreHorizontal } from 'lucide-react'
import { Track, Album, Artist, Playlist } from '@/lib/types'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { usePlayer } from '@/hooks/usePlayer'
import { formatNumber } from '@/lib/utils'

interface MediaCardProps {
  item: Track | Album | Artist | Playlist
  type: 'track' | 'album' | 'artist' | 'playlist'
  size?: 'sm' | 'md' | 'lg'
}

export function MediaCard({ item, type, size = 'md' }: MediaCardProps) {
  const { setCurrentTrack, setQueue, play } = usePlayer()

  const sizeClasses = {
    sm: 'w-32',
    md: 'w-40',
    lg: 'w-48'
  }

  const handlePlay = () => {
    if (type === 'track') {
      const track = item as Track
      setCurrentTrack(track)
      setQueue([track])
      play()
    }
    // Handle other types - albums, playlists would need to load their tracks
  }

  const getImageSrc = () => {
    switch (type) {
      case 'track':
        return (item as Track).artwork
      case 'album':
        return (item as Album).artwork
      case 'artist':
        return (item as Artist).image
      case 'playlist':
        return (item as Playlist).artwork
      default:
        return ''
    }
  }

  const getTitle = () => {
    switch (type) {
      case 'track':
        return (item as Track).title
      case 'album':
        return (item as Album).title
      case 'artist':
        return (item as Artist).name
      case 'playlist':
        return (item as Playlist).title
      default:
        return ''
    }
  }

  const getSubtitle = () => {
    switch (type) {
      case 'track':
        return (item as Track).artist.name
      case 'album':
        return (item as Album).artist.name
      case 'artist':
        return `${formatNumber((item as Artist).followers)} followers`
      case 'playlist':
        return `${(item as Playlist).tracks.length} tracks`
      default:
        return ''
    }
  }

  return (
    <Card className={`${sizeClasses[size]} group relative`} hover>
      <div className="relative">
        {/* Image */}
        <div className="aspect-square relative overflow-hidden rounded-lg bg-white/5">
          <img
            src={getImageSrc()}
            alt={getTitle()}
            width={200}
            height={200}
            className={`w-full h-full object-cover transition-transform group-hover:scale-105 ${
              type === 'artist' ? 'rounded-full' : ''
            }`}
          />
          
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button
              variant="primary"
              size="icon"
              onClick={handlePlay}
              className="shadow-xl"
            >
              <Play className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Actions */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="secondary" size="icon" className="w-8 h-8">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>

        {type === 'track' && (
          <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="secondary" size="icon" className="w-8 h-8">
              <Heart className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="font-medium text-foreground truncate mb-1">
          {getTitle()}
        </h3>
        <p className="text-sm text-foreground-muted truncate">
          {getSubtitle()}
        </p>
      </div>
    </Card>
  )
}