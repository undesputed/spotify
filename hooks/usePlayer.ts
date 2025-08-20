import { create } from 'zustand'
import { Track, PlayerState } from '@/lib/types'

interface PlayerStore extends PlayerState {
  // Actions
  setCurrentTrack: (track: Track) => void
  play: () => void
  pause: () => void
  toggle: () => void
  setVolume: (volume: number) => void
  setMuted: (muted: boolean) => void
  setCurrentTime: (time: number) => void
  setDuration: (duration: number) => void
  next: () => void
  previous: () => void
  setRepeat: (repeat: 'off' | 'one' | 'all') => void
  setShuffle: (shuffle: boolean) => void
  addToQueue: (tracks: Track[]) => void
  removeFromQueue: (index: number) => void
  clearQueue: () => void
  setQueue: (tracks: Track[]) => void
}

export const usePlayer = create<PlayerStore>((set, get) => ({
  // State
  currentTrack: null,
  queue: [],
  isPlaying: false,
  isPaused: false,
  currentTime: 0,
  duration: 0,
  volume: 0.8,
  isMuted: false,
  repeat: 'off',
  shuffle: false,
  isLoading: false,

  // Actions
  setCurrentTrack: (track) => set({ currentTrack: track }),
  
  play: () => {
    set({ isPlaying: true, isPaused: false })
    // Trigger actual audio play
    const audio = document.querySelector('audio') as HTMLAudioElement
    if (audio) audio.play()
  },
  
  pause: () => {
    set({ isPlaying: false, isPaused: true })
    // Trigger actual audio pause
    const audio = document.querySelector('audio') as HTMLAudioElement
    if (audio) audio.pause()
  },
  
  toggle: () => {
    const { isPlaying } = get()
    if (isPlaying) {
      get().pause()
    } else {
      get().play()
    }
  },
  
  setVolume: (volume) => {
    set({ volume, isMuted: volume === 0 })
    // Update actual audio volume
    const audio = document.querySelector('audio') as HTMLAudioElement
    if (audio) audio.volume = volume
  },
  
  setMuted: (muted) => {
    set({ isMuted: muted })
    // Update actual audio muted state
    const audio = document.querySelector('audio') as HTMLAudioElement
    if (audio) audio.muted = muted
  },
  
  setCurrentTime: (time) => set({ currentTime: time }),
  
  setDuration: (duration) => set({ duration }),
  
  next: () => {
    const { queue, currentTrack } = get()
    if (!currentTrack || queue.length === 0) return
    
    const currentIndex = queue.findIndex(track => track.id === currentTrack.id)
    const nextIndex = (currentIndex + 1) % queue.length
    
    set({ currentTrack: queue[nextIndex] })
  },
  
  previous: () => {
    const { queue, currentTrack } = get()
    if (!currentTrack || queue.length === 0) return
    
    const currentIndex = queue.findIndex(track => track.id === currentTrack.id)
    const prevIndex = currentIndex === 0 ? queue.length - 1 : currentIndex - 1
    
    set({ currentTrack: queue[prevIndex] })
  },
  
  setRepeat: (repeat) => set({ repeat }),
  
  setShuffle: (shuffle) => set({ shuffle }),
  
  addToQueue: (tracks) => {
    const { queue } = get()
    set({ queue: [...queue, ...tracks] })
  },
  
  removeFromQueue: (index) => {
    const { queue } = get()
    const newQueue = queue.filter((_, i) => i !== index)
    set({ queue: newQueue })
  },
  
  clearQueue: () => set({ queue: [] }),
  
  setQueue: (tracks) => set({ queue: tracks }),
}))

// Keyboard shortcuts hook
export function useKeyboardShortcuts() {
  const player = usePlayer()

  React.useEffect(() => {
    function handleKeydown(event: KeyboardEvent) {
      // Don't trigger shortcuts when typing in inputs
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return
      }

      switch (event.code) {
        case 'Space':
          event.preventDefault()
          player.toggle()
          break
        case 'KeyJ':
          event.preventDefault()
          player.previous()
          break
        case 'KeyK':
          event.preventDefault()
          player.next()
          break
        case 'KeyM':
          event.preventDefault()
          player.setMuted(!player.isMuted)
          break
        case 'KeyL':
          // Like current track
          event.preventDefault()
          if (player.currentTrack) {
            // Implement like functionality
            console.log('Like track:', player.currentTrack.title)
          }
          break
        case 'ArrowLeft':
          if (event.metaKey || event.ctrlKey) {
            event.preventDefault()
            player.setCurrentTime(Math.max(0, player.currentTime - 10))
          }
          break
        case 'ArrowRight':
          if (event.metaKey || event.ctrlKey) {
            event.preventDefault()
            player.setCurrentTime(Math.min(player.duration, player.currentTime + 10))
          }
          break
      }
    }

    document.addEventListener('keydown', handleKeydown)
    return () => document.removeEventListener('keydown', handleKeydown)
  }, [player])
}

// Import React for useEffect
import React from 'react'