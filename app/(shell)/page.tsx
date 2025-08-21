'use client'

import React, { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams, useRouter } from 'next/navigation'
import { PlatformSection } from '@/components/sections/PlatformSection'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Headphones, Download, Shield, Play, Heart } from 'lucide-react'
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth'
import { clientHomeDataService } from '@/lib/services/client-home-data-service'

// Sample music data to show when no services are connected
const getSampleMusicData = () => ({
  spotify: {
    topTracks: [
      {
        id: 'sample-1',
        title: 'Blinding Lights',
        artist: 'The Weeknd',
        album: 'After Hours',
        artwork: 'https://picsum.photos/300/300?random=1',
        duration: 200,
        serviceId: 'spotify'
      },
      {
        id: 'sample-2',
        title: 'Dance Monkey',
        artist: 'Tones and I',
        album: 'The Kids Are Coming',
        artwork: 'https://picsum.photos/300/300?random=2',
        duration: 210,
        serviceId: 'spotify'
      },
      {
        id: 'sample-3',
        title: 'Shape of You',
        artist: 'Ed Sheeran',
        album: '÷ (Divide)',
        artwork: 'https://picsum.photos/300/300?random=3',
        duration: 233,
        serviceId: 'spotify'
      }
    ],
    newReleases: [],
    featuredPlaylists: [],
    trending: [],
    recentlyPlayed: []
  },
  youtube: {
    trendingVideos: [
      {
        id: 'yt-sample-1',
        title: 'As It Was',
        artist: 'Harry Styles',
        artwork: 'https://picsum.photos/300/300?random=4',
        duration: 167,
        serviceId: 'youtube_music'
      },
      {
        id: 'yt-sample-2',
        title: 'Bad Guy',
        artist: 'Billie Eilish',
        artwork: 'https://picsum.photos/300/300?random=5',
        duration: 194,
        serviceId: 'youtube_music'
      },
      {
        id: 'yt-sample-3',
        title: 'Levitating',
        artist: 'Dua Lipa',
        artwork: 'https://picsum.photos/300/300?random=6',
        duration: 203,
        serviceId: 'youtube_music'
      }
    ],
    popularMusic: [],
    newReleases: [],
    topCharts: []
  },
  continueListening: [
    {
      id: 'sample-1',
      title: 'Blinding Lights',
      artist: 'The Weeknd',
      album: 'After Hours',
      artwork: 'https://picsum.photos/300/300?random=1',
      duration: 200,
      serviceId: 'spotify'
    },
    {
      id: 'yt-sample-1',
      title: 'As It Was',
      artist: 'Harry Styles',
      artwork: 'https://i.ytimg.com/vi/H5v3kku4y6Q/maxresdefault.jpg',
      duration: 167,
      serviceId: 'youtube_music'
    }
  ],
  madeForYou: [
    {
      id: 'sample-2',
      title: 'Dance Monkey',
      artist: 'Tones and I',
      album: 'The Kids Are Coming',
      artwork: 'https://picsum.photos/300/300?random=2',
      duration: 210,
      serviceId: 'spotify'
    },
    {
      id: 'yt-sample-2',
      title: 'Bad Guy',
      artist: 'Billie Eilish',
      artwork: 'https://i.ytimg.com/vi/DyDfgMOUjCI/maxresdefault.jpg',
      duration: 194,
      serviceId: 'youtube_music'
    }
  ]
})

export default function HomePage() {
  const router = useRouter()
  const { user, appUser } = useSupabaseAuth()
  const searchParams = useSearchParams()
  const [showWelcome, setShowWelcome] = useState(false)
  
  const { data: homeData, isLoading, error } = useQuery({
    queryKey: ['home-data', user?.id],
    queryFn: () => clientHomeDataService.getHomeData(),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
  
  useEffect(() => {
    const welcome = searchParams.get('welcome')
    if (welcome === 'true') {
      setShowWelcome(true)
      // Remove the welcome parameter from URL
      const url = new URL(window.location.href)
      url.searchParams.delete('welcome')
      window.history.replaceState({}, '', url.toString())
    }
  }, [searchParams])

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="h-64 bg-gradient-to-r from-primary-600/20 to-accent-600/20 rounded-2xl animate-pulse" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-4">
            <div className="h-8 w-48 bg-white/10 rounded animate-pulse" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, j) => (
                <div key={j} className="aspect-square bg-white/10 rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    console.error('Home data error:', error)
  }

  // Use sample data if no real data is available
  const displayData = homeData && (
    homeData.continueListening?.length > 0 ||
    homeData.madeForYou?.length > 0 ||
    homeData.spotify?.topTracks?.length > 0 ||
    homeData.spotify?.newReleases?.length > 0 ||
    homeData.spotify?.featuredPlaylists?.length > 0 ||
    homeData.spotify?.trending?.length > 0 ||
    homeData.youtube?.trendingVideos?.length > 0 ||
    homeData.youtube?.popularMusic?.length > 0 ||
    homeData.youtube?.newReleases?.length > 0 ||
    homeData.youtube?.topCharts?.length > 0
  ) ? homeData : getSampleMusicData()

  // Check if we have any real data to display (not sample data)
  const hasRealData = homeData && (
    homeData.continueListening?.length > 0 ||
    homeData.madeForYou?.length > 0 ||
    homeData.spotify?.topTracks?.length > 0 ||
    homeData.spotify?.newReleases?.length > 0 ||
    homeData.spotify?.featuredPlaylists?.length > 0 ||
    homeData.spotify?.trending?.length > 0 ||
    homeData.youtube?.trendingVideos?.length > 0 ||
    homeData.youtube?.popularMusic?.length > 0 ||
    homeData.youtube?.newReleases?.length > 0 ||
    homeData.youtube?.topCharts?.length > 0
  )

  return (
    <div className="space-y-4 animate-fade-in pt-2">
      {/* Welcome Message */}
      {showWelcome && (
        <Card className="bg-green-600/20 border-green-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">✓</span>
              </div>
              <div>
                <h3 className="font-semibold text-green-100">Welcome to Music Central!</h3>
                <p className="text-green-200 text-sm">Your account has been created successfully.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hero Section */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/80 to-accent-600/80" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC4xIi8+Cjwvc3ZnPgo=')] opacity-20" />
        <CardContent className="relative z-10 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">
                Good evening{appUser?.name ? `, ${appUser.name}` : ''}
              </h1>
              <p className="text-white/80 text-base">
                Ready to discover your next favorite song?
              </p>
            </div>
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <img 
                src="/logo.png" 
                alt="Music Central Logo" 
                className="w-12 h-12 rounded-full object-cover"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sample Data Notice */}
      {!hasRealData && !isLoading && (
        <Card className="bg-blue-600/20 border-blue-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <Headphones className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-100">Sample Music Data</h3>
                <p className="text-blue-200 text-sm">Connect your music services to see your real music data.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Data Placeholder */}
      {!hasRealData && !isLoading && (
        <div className="space-y-4">
                      <Card className="bg-background-secondary/50 border-white/10">
              <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-primary-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Headphones className="w-8 h-8 text-primary-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Connect Your Music Services</h2>
              <p className="text-gray-300 mb-6 max-w-md mx-auto">
                Connect your Spotify and YouTube Music accounts to start discovering and enjoying your favorite music in one place.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => router.push('/platforms')}
                  className="bg-primary-600 hover:bg-primary-700"
                >
                  Connect Services
                </Button>
                <Button 
                  onClick={() => router.push('/subscription')}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  View Plans
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-background-secondary/50 border-white/10 hover:bg-background-secondary/70 transition-colors">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-blue-500/30 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Headphones className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="font-semibold text-white mb-1">Discover Music</h3>
                <p className="text-sm text-gray-400">Find new tracks and artists from multiple platforms</p>
              </CardContent>
            </Card>
            
            <Card className="bg-background-secondary/50 border-white/10 hover:bg-background-secondary/70 transition-colors">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-green-500/30 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Download className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="font-semibold text-white mb-1">Download & Listen</h3>
                <p className="text-sm text-gray-400">Download tracks for offline listening</p>
              </CardContent>
            </Card>
            
            <Card className="bg-background-secondary/50 border-white/10 hover:bg-background-secondary/70 transition-colors">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-purple-500/30 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="font-semibold text-white mb-1">Premium Features</h3>
                <p className="text-sm text-gray-400">Unlock advanced features with premium plans</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Continue Listening */}
      {displayData?.continueListening && displayData.continueListening.length > 0 && (
        <PlatformSection
          title="Continue Listening"
          platform="combined"
          items={displayData.continueListening}
          type="track"
        />
      )}

      {/* Spotify Sections */}
      {displayData?.spotify && (
        <>
          {/* Spotify Top Tracks */}
          {displayData.spotify.topTracks && displayData.spotify.topTracks.length > 0 && (
            <PlatformSection
              title="Spotify Top Tracks"
              platform="spotify"
              items={displayData.spotify.topTracks}
              type="track"
              showAll
            />
          )}

          {/* Spotify New Releases */}
          {displayData.spotify.newReleases && displayData.spotify.newReleases.length > 0 && (
            <PlatformSection
              title="Spotify New Releases"
              platform="spotify"
              items={displayData.spotify.newReleases}
              type="album"
              showAll
            />
          )}

          {/* Spotify Featured Playlists */}
          {displayData.spotify.featuredPlaylists && displayData.spotify.featuredPlaylists.length > 0 && (
            <PlatformSection
              title="Spotify Featured Playlists"
              platform="spotify"
              items={displayData.spotify.featuredPlaylists}
              type="playlist"
              showAll
            />
          )}

          {/* Spotify Trending */}
          {displayData.spotify.trending && displayData.spotify.trending.length > 0 && (
            <PlatformSection
              title="Spotify Trending"
              platform="spotify"
              items={displayData.spotify.trending}
              type="track"
              showAll
            />
          )}
        </>
      )}

      {/* YouTube Sections */}
      {displayData?.youtube && (
        <>
          {/* YouTube Trending Videos */}
          {displayData.youtube.trendingVideos && displayData.youtube.trendingVideos.length > 0 && (
            <PlatformSection
              title="YouTube Trending Music"
              platform="youtube"
              items={displayData.youtube.trendingVideos}
              type="track"
              showAll
            />
          )}

          {/* YouTube Popular Music */}
          {displayData.youtube.popularMusic && displayData.youtube.popularMusic.length > 0 && (
            <PlatformSection
              title="YouTube Popular Music"
              platform="youtube"
              items={displayData.youtube.popularMusic}
              type="track"
              showAll
            />
          )}

          {/* YouTube New Releases */}
          {displayData.youtube.newReleases && displayData.youtube.newReleases.length > 0 && (
            <PlatformSection
              title="YouTube New Releases"
              platform="youtube"
              items={displayData.youtube.newReleases}
              type="track"
              showAll
            />
          )}

          {/* YouTube Top Charts */}
          {displayData.youtube.topCharts && displayData.youtube.topCharts.length > 0 && (
            <PlatformSection
              title="YouTube Top Charts"
              platform="youtube"
              items={displayData.youtube.topCharts}
              type="track"
              showAll
            />
          )}
        </>
      )}

      {/* Made For You */}
      {displayData?.madeForYou && displayData.madeForYou.length > 0 && (
        <PlatformSection
          title="Made For You"
          platform="combined"
          items={displayData.madeForYou}
          type="playlist"
          showAll
        />
      )}


    </div>
  )
}