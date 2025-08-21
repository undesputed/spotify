'use client'

import { useRef, useState, useEffect, useCallback } from 'react'

interface AudioPlayerState {
  isPlaying: boolean
  currentTrackId: string | null
  currentSrc: string | null
  duration: number
  currentTime: number
  volume: number
}

export function useAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [state, setState] = useState<AudioPlayerState>({
    isPlaying: false,
    currentTrackId: null,
    currentSrc: null,
    duration: 0,
    currentTime: 0,
    volume: 1,
  })

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio()
    const audio = audioRef.current

    // Set initial volume
    audio.volume = 1

    // Add event listeners
    const handleLoadedMetadata = () => {
      setState(prev => ({ ...prev, duration: audio.duration }))
    }

    const handleTimeUpdate = () => {
      setState(prev => ({ ...prev, currentTime: audio.currentTime }))
    }

    const handleEnded = () => {
      setState(prev => ({
        ...prev,
        isPlaying: false,
        currentTrackId: null,
        currentSrc: null,
        currentTime: 0,
      }))
    }

    const handleError = () => {
      setState(prev => ({
        ...prev,
        isPlaying: false,
        currentTrackId: null,
        currentSrc: null,
        currentTime: 0,
      }))
    }

    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('error', handleError)

    // Cleanup function
    return () => {
      if (audio) {
        audio.pause()
        audio.src = ''
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
        audio.removeEventListener('timeupdate', handleTimeUpdate)
        audio.removeEventListener('ended', handleEnded)
        audio.removeEventListener('error', handleError)
      }
    }
  }, [])

  const play = useCallback(async (src: string, trackId: string) => {
    const audio = audioRef.current
    if (!audio) return false

    try {
      // If it's the same track, toggle play/pause
      if (state.currentTrackId === trackId) {
        if (state.isPlaying) {
          audio.pause()
          setState(prev => ({ ...prev, isPlaying: false }))
          return true
        } else {
          await audio.play()
          setState(prev => ({ ...prev, isPlaying: true }))
          return true
        }
      }

      // Stop current audio and load new track
      audio.pause()
      audio.src = src
      
      await audio.play()
      
      setState(prev => ({
        ...prev,
        isPlaying: true,
        currentTrackId: trackId,
        currentSrc: src,
        currentTime: 0,
      }))

      return true
    } catch (error) {
      console.error('Failed to play audio:', error)
      setState(prev => ({
        ...prev,
        isPlaying: false,
        currentTrackId: null,
        currentSrc: null,
      }))
      return false
    }
  }, [state.currentTrackId, state.isPlaying])

  const pause = useCallback(() => {
    const audio = audioRef.current
    if (audio && state.isPlaying) {
      audio.pause()
      setState(prev => ({ ...prev, isPlaying: false }))
    }
  }, [state.isPlaying])

  const stop = useCallback(() => {
    const audio = audioRef.current
    if (audio) {
      audio.pause()
      audio.currentTime = 0
      setState(prev => ({
        ...prev,
        isPlaying: false,
        currentTrackId: null,
        currentSrc: null,
        currentTime: 0,
      }))
    }
  }, [])

  const seek = useCallback((time: number) => {
    const audio = audioRef.current
    if (audio) {
      audio.currentTime = time
      setState(prev => ({ ...prev, currentTime: time }))
    }
  }, [])

  const setVolume = useCallback((volume: number) => {
    const audio = audioRef.current
    if (audio) {
      audio.volume = Math.max(0, Math.min(1, volume))
      setState(prev => ({ ...prev, volume }))
    }
  }, [])

  const formatTime = useCallback((time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }, [])

  return {
    ...state,
    play,
    pause,
    stop,
    seek,
    setVolume,
    formatTime,
    audioRef,
  }
}
