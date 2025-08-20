'use client'

import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Grid, List, Filter, Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { MediaCard } from '@/components/media/MediaCard'
import { api } from '@/lib/api'
import { ViewType, SortOption, FilterOption } from '@/lib/types'

const tabs = [
  { id: 'playlists', label: 'Playlists' },
  { id: 'liked', label: 'Liked Songs' },
  { id: 'albums', label: 'Albums' },
  { id: 'artists', label: 'Artists' },
  { id: 'history', label: 'Recently Played' },
]

const sortOptions = [
  { id: 'recent', label: 'Recently Added' },
  { id: 'alphabetical', label: 'Alphabetical' },
  { id: 'artist', label: 'Artist' },
]

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState('playlists')
  const [viewType, setViewType] = useState<ViewType>('grid')
  const [sortBy, setSortBy] = useState<SortOption>('recent')
  const [showFilters, setShowFilters] = useState(false)

  const { data: libraryData, isLoading } = useQuery({
    queryKey: ['library'],
    queryFn: api.getLibrary,
  })

  const getCurrentItems = () => {
    if (!libraryData) return []
    
    switch (activeTab) {
      case 'playlists':
        return libraryData.playlists.map(item => ({ item, type: 'playlist' as const }))
      case 'liked':
        return libraryData.likedSongs.map(item => ({ item, type: 'track' as const }))
      case 'albums':
        return libraryData.albums.map(item => ({ item, type: 'album' as const }))
      case 'artists':
        return libraryData.artists.map(item => ({ item, type: 'artist' as const }))
      case 'history':
        return libraryData.history.map(item => ({ item, type: 'track' as const }))
      default:
        return []
    }
  }

  const getTabLabel = () => {
    return tabs.find(tab => tab.id === activeTab)?.label || 'Library'
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-32 bg-white/10 rounded animate-pulse" />
          <div className="flex gap-2">
            <div className="h-10 w-20 bg-white/10 rounded animate-pulse" />
            <div className="h-10 w-10 bg-white/10 rounded animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="aspect-square bg-white/10 rounded-lg animate-pulse" />
              <div className="h-4 bg-white/10 rounded animate-pulse" />
              <div className="h-3 w-2/3 bg-white/10 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Your Library</h1>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setViewType(viewType === 'grid' ? 'list' : 'grid')}
          >
            {viewType === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-white/5 rounded-lg p-1 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-background shadow-sm'
                : 'text-foreground-secondary hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-sm text-foreground-secondary">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-sm focus-ring"
            >
              {sortOptions.map((option) => (
                <option key={option.id} value={option.id} className="bg-background">
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">{getTabLabel()}</h2>
          {activeTab === 'playlists' && (
            <Button variant="primary" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Create Playlist
            </Button>
          )}
        </div>

        {getCurrentItems().length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl opacity-50">🎵</span>
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              Nothing here yet
            </h3>
            <p className="text-foreground-muted mb-4">
              Start exploring music to build your library
            </p>
            <Button variant="primary">
              Browse Music
            </Button>
          </div>
        ) : (
          <div className={`grid gap-4 ${
            viewType === 'grid' 
              ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6' 
              : 'grid-cols-1'
          }`}>
            {getCurrentItems().map(({ item, type }, index) => (
              <MediaCard 
                key={`${type}-${item.id}-${index}`} 
                item={item} 
                type={type}
                size={viewType === 'grid' ? 'md' : 'sm'}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}