export interface User {
  id: string
  email: string
  name: string
  image?: string
  isPremium: boolean
  createdAt: string
}

export interface Track {
  id: string
  title: string
  artist: Artist
  album: Album
  duration: number
  streamUrl?: string
  previewUrl?: string
  isLiked: boolean
  playCount: number
  artwork: string
  genres: string[]
  releaseDate: string
}

export interface Artist {
  id: string
  name: string
  image: string
  followers: number
  isFollowed: boolean
  genres: string[]
  bio?: string
}

export interface Album {
  id: string
  title: string
  artist: Artist
  artwork: string
  releaseDate: string
  tracks: Track[]
  totalTracks: number
  duration: number
  genres: string[]
  type: 'album' | 'single' | 'ep'
}

export interface Playlist {
  id: string
  title: string
  description?: string
  creator: User
  tracks: Track[]
  artwork: string
  isPublic: boolean
  isLiked: boolean
  followers: number
  createdAt: string
  updatedAt: string
}

export interface PlayerState {
  currentTrack: Track | null
  queue: Track[]
  isPlaying: boolean
  isPaused: boolean
  currentTime: number
  duration: number
  volume: number
  isMuted: boolean
  repeat: 'off' | 'one' | 'all'
  shuffle: boolean
  isLoading: boolean
}

export interface SearchResults {
  tracks: Track[]
  artists: Artist[]
  albums: Album[]
  playlists: Playlist[]
  query: string
  total: number
}

export interface HomeData {
  continueListening: Track[]
  forYou: Playlist[]
  newReleases: Album[]
  trending: Track[]
  madeForYou: Playlist[]
  charts: Track[]
}

export interface LibraryData {
  playlists: Playlist[]
  likedSongs: Track[]
  albums: Album[]
  artists: Artist[]
  history: Track[]
}

export type ViewType = 'grid' | 'list'
export type SortOption = 'recent' | 'alphabetical' | 'artist' | 'dateAdded'
export type FilterOption = 'all' | 'playlists' | 'albums' | 'artists'