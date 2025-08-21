'use client'

import React, { useEffect, useRef } from 'react'
import { usePlayer } from '@/hooks/usePlayer'
import { api } from '@/lib/api'

export function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const {
    currentTrack,
    isPlaying,
    volume,
    isMuted,
    setCurrentTime,
    setDuration,
    next
  } = usePlayer()

  // Update audio source when track changes
  useEffect(() => {
    if (currentTrack && audioRef.current) {
      api.getStreamUrl(currentTrack.id).then(({ manifestUrl }) => {
        if (audioRef.current) {
          audioRef.current.src = manifestUrl
        }
      })
    }
  }, [currentTrack])

  // Handle play/pause state
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play()
      } else {
        audioRef.current.pause()
      }
    }
  }, [isPlaying])

  // Handle volume changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume
    }
  }, [volume, isMuted])

  // Time update handler
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  // Duration loaded handler
  const handleLoadedData = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration)
    }
  }

  // Track ended handler
  const handleEnded = () => {
    next()
  }

  // Media Session API setup
  useEffect(() => {
    if ('mediaSession' in navigator && currentTrack) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.title,
        artist: currentTrack.artist.name,
        album: currentTrack.album.title,
        artwork: [
          { src: currentTrack.artwork, sizes: '96x96', type: 'image/jpeg' },
          { src: currentTrack.artwork, sizes: '128x128', type: 'image/jpeg' },
          { src: currentTrack.artwork, sizes: '192x192', type: 'image/jpeg' },
          { src: currentTrack.artwork, sizes: '256x256', type: 'image/jpeg' },
          { src: currentTrack.artwork, sizes: '384x384', type: 'image/jpeg' },
          { src: currentTrack.artwork, sizes: '512x512', type: 'image/jpeg' },
        ]
      })

      navigator.mediaSession.setActionHandler('play', () => {
        if (audioRef.current) {
          audioRef.current.play()
        }
      })

      navigator.mediaSession.setActionHandler('pause', () => {
        if (audioRef.current) {
          audioRef.current.pause()
        }
      })

      navigator.mediaSession.setActionHandler('previoustrack', () => {
        // This would be handled by the player store
      })

      navigator.mediaSession.setActionHandler('nexttrack', () => {
        next()
      })
    }
  }, [currentTrack, next])

  return (
    <audio
      ref={audioRef}
      onTimeUpdate={handleTimeUpdate}
      onLoadedData={handleLoadedData}
      onEnded={handleEnded}
      preload="metadata"
    />
  )
}