// Mock API functions - replace with actual API calls
export const api = {
  // Authentication
  async signIn(email: string, password: string) {
    // Mock implementation
    return {
      user: {
        id: '1',
        email,
        name: 'John Doe',
        isPremium: false,
        createdAt: new Date().toISOString(),
      },
      token: 'mock-jwt-token'
    }
  },

  async signUp(email: string, password: string, name: string) {
    // Mock implementation
    return {
      user: {
        id: '1',
        email,
        name,
        isPremium: false,
        createdAt: new Date().toISOString(),
      },
      token: 'mock-jwt-token'
    }
  },

  // Home data
  async getHomeData() {
    return {
      continueListening: mockTracks.slice(0, 5),
      forYou: mockPlaylists.slice(0, 6),
      newReleases: mockAlbums.slice(0, 6),
      trending: mockTracks.slice(5, 11),
      madeForYou: mockPlaylists.slice(6, 12),
      charts: mockTracks.slice(11, 17),
    }
  },

  // Search
  async search(query: string, types: string[] = ['tracks', 'artists', 'albums', 'playlists']) {
    const results = {
      tracks: mockTracks.filter(track => 
        track.title.toLowerCase().includes(query.toLowerCase()) ||
        track.artist.name.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 20),
      artists: mockArtists.filter(artist =>
        artist.name.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 10),
      albums: mockAlbums.filter(album =>
        album.title.toLowerCase().includes(query.toLowerCase()) ||
        album.artist.name.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 10),
      playlists: mockPlaylists.filter(playlist =>
        playlist.title.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 10),
      query,
      total: 0
    }
    results.total = results.tracks.length + results.artists.length + results.albums.length + results.playlists.length
    return results
  },

  // Library
  async getLibrary() {
    return {
      playlists: mockPlaylists,
      likedSongs: mockTracks.filter(track => track.isLiked),
      albums: mockAlbums,
      artists: mockArtists.filter(artist => artist.isFollowed),
      history: mockTracks.slice(0, 10),
    }
  },

  // Track actions
  async likeTrack(trackId: string) {
    // Mock implementation
    return { success: true }
  },

  async unlikeTrack(trackId: string) {
    // Mock implementation
    return { success: true }
  },

  async addToPlaylist(playlistId: string, trackId: string) {
    // Mock implementation
    return { success: true }
  },

  // Streaming
  async getStreamUrl(trackId: string) {
    // Mock implementation - return a preview URL or sample audio
    return {
      manifestUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      licenseUrl: null,
      drmScheme: null,
      expiresAt: new Date(Date.now() + 3600000).toISOString()
    }
  }
}

// Mock data
const mockArtists = [
  { id: '1', name: 'The Midnight', image: 'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=300', followers: 150000, isFollowed: true, genres: ['Synthwave', 'Electronic'] },
  { id: '2', name: 'Daft Punk', image: 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=300', followers: 2500000, isFollowed: false, genres: ['Electronic', 'House'] },
  { id: '3', name: 'Billie Eilish', image: 'https://images.pexels.com/photos/1699161/pexels-photo-1699161.jpeg?auto=compress&cs=tinysrgb&w=300', followers: 95000000, isFollowed: true, genres: ['Pop', 'Alternative'] },
  { id: '4', name: 'The Weeknd', image: 'https://images.pexels.com/photos/1587927/pexels-photo-1587927.jpeg?auto=compress&cs=tinysrgb&w=300', followers: 85000000, isFollowed: false, genres: ['R&B', 'Pop'] },
]

const mockAlbums = [
  { id: '1', title: 'Endless Summer', artist: mockArtists[0], artwork: 'https://images.pexels.com/photos/167092/pexels-photo-167092.jpeg?auto=compress&cs=tinysrgb&w=400', releaseDate: '2016-08-05', tracks: [], totalTracks: 12, duration: 2880, genres: ['Synthwave'], type: 'album' as const },
  { id: '2', title: 'Random Access Memories', artist: mockArtists[1], artwork: 'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=400', releaseDate: '2013-05-17', tracks: [], totalTracks: 13, duration: 4578, genres: ['Electronic', 'Funk'], type: 'album' as const },
  { id: '3', title: 'When We All Fall Asleep', artist: mockArtists[2], artwork: 'https://images.pexels.com/photos/1699161/pexels-photo-1699161.jpeg?auto=compress&cs=tinysrgb&w=400', releaseDate: '2019-03-29', tracks: [], totalTracks: 14, duration: 2516, genres: ['Pop', 'Alternative'], type: 'album' as const },
]

const mockTracks = [
  { id: '1', title: 'Sunset', artist: mockArtists[0], album: mockAlbums[0], duration: 240, isLiked: true, playCount: 1250000, artwork: 'https://images.pexels.com/photos/167092/pexels-photo-167092.jpeg?auto=compress&cs=tinysrgb&w=400', genres: ['Synthwave'], releaseDate: '2016-08-05' },
  { id: '2', title: 'Vampires', artist: mockArtists[0], album: mockAlbums[0], duration: 195, isLiked: false, playCount: 980000, artwork: 'https://images.pexels.com/photos/167092/pexels-photo-167092.jpeg?auto=compress&cs=tinysrgb&w=400', genres: ['Synthwave'], releaseDate: '2016-08-05' },
  { id: '3', title: 'Get Lucky', artist: mockArtists[1], album: mockAlbums[1], duration: 367, isLiked: true, playCount: 45000000, artwork: 'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=400', genres: ['Electronic', 'Funk'], releaseDate: '2013-04-19' },
  { id: '4', title: 'bad guy', artist: mockArtists[2], album: mockAlbums[2], duration: 194, isLiked: true, playCount: 2200000000, artwork: 'https://images.pexels.com/photos/1699161/pexels-photo-1699161.jpeg?auto=compress&cs=tinysrgb&w=400', genres: ['Pop'], releaseDate: '2019-03-29' },
  { id: '5', title: 'Blinding Lights', artist: mockArtists[3], album: mockAlbums[0], duration: 200, isLiked: false, playCount: 3500000000, artwork: 'https://images.pexels.com/photos/1587927/pexels-photo-1587927.jpeg?auto=compress&cs=tinysrgb&w=400', genres: ['Pop', 'Synthpop'], releaseDate: '2019-11-29' },
  { id: '6', title: 'Starboy', artist: mockArtists[3], album: mockAlbums[0], duration: 230, isLiked: true, playCount: 2800000000, artwork: 'https://images.pexels.com/photos/1587927/pexels-photo-1587927.jpeg?auto=compress&cs=tinysrgb&w=400', genres: ['Pop', 'R&B'], releaseDate: '2016-09-22' },
]

const mockUser = { id: '1', email: 'user@example.com', name: 'Music Lover', isPremium: false, createdAt: '2024-01-01T00:00:00Z' }

const mockPlaylists = [
  { id: '1', title: 'Chill Synthwave', description: 'Relaxing synthwave vibes', creator: mockUser, tracks: mockTracks.slice(0, 3), artwork: 'https://images.pexels.com/photos/167092/pexels-photo-167092.jpeg?auto=compress&cs=tinysrgb&w=400', isPublic: true, isLiked: false, followers: 1250, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-15T00:00:00Z' },
  { id: '2', title: 'My Liked Songs', description: 'All your favorite tracks', creator: mockUser, tracks: mockTracks.filter(t => t.isLiked), artwork: 'https://images.pexels.com/photos/1699161/pexels-photo-1699161.jpeg?auto=compress&cs=tinysrgb&w=400', isPublic: false, isLiked: true, followers: 0, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-20T00:00:00Z' },
]