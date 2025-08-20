'use client'

import React, { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search as SearchIcon } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { MediaCard } from '@/components/media/MediaCard'
import { api } from '@/lib/api'
import { debounce } from '@/lib/utils'

const tabs = [
  { id: 'all', label: 'All' },
  { id: 'tracks', label: 'Tracks' },
  { id: 'artists', label: 'Artists' },
  { id: 'albums', label: 'Albums' },
  { id: 'playlists', label: 'Playlists' },
]

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [debouncedQuery, setDebouncedQuery] = useState('')

  const debouncedSearch = React.useMemo(
    () => debounce((value: string) => setDebouncedQuery(value), 300),
    []
  )

  useEffect(() => {
    debouncedSearch(query)
  }, [query, debouncedSearch])

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () => api.search(debouncedQuery),
    enabled: debouncedQuery.length > 0,
  })

  const getFilteredResults = () => {
    if (!searchResults) return []

    switch (activeTab) {
      case 'tracks':
        return searchResults.tracks.map(item => ({ item, type: 'track' as const }))
      case 'artists':
        return searchResults.artists.map(item => ({ item, type: 'artist' as const }))
      case 'albums':
        return searchResults.albums.map(item => ({ item, type: 'album' as const }))
      case 'playlists':
        return searchResults.playlists.map(item => ({ item, type: 'playlist' as const }))
      default:
        return [
          ...searchResults.tracks.slice(0, 6).map(item => ({ item, type: 'track' as const })),
          ...searchResults.artists.slice(0, 4).map(item => ({ item, type: 'artist' as const })),
          ...searchResults.albums.slice(0, 4).map(item => ({ item, type: 'album' as const })),
          ...searchResults.playlists.slice(0, 4).map(item => ({ item, type: 'playlist' as const })),
        ]
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Search Header */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-foreground">Search</h1>
        <div className="relative max-w-md">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-foreground-muted" />
          <Input
            placeholder="What do you want to play?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 h-12 text-lg"
          />
        </div>
      </div>

      {query.length === 0 ? (
        /* Browse Categories */
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-foreground">Browse all</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[
              { name: 'Pop', color: 'from-pink-500 to-red-500' },
              { name: 'Hip-Hop', color: 'from-green-500 to-teal-500' },
              { name: 'Rock', color: 'from-purple-500 to-indigo-500' },
              { name: 'Electronic', color: 'from-blue-500 to-cyan-500' },
              { name: 'Jazz', color: 'from-yellow-500 to-orange-500' },
              { name: 'Classical', color: 'from-gray-500 to-gray-700' },
              { name: 'R&B', color: 'from-red-500 to-pink-500' },
              { name: 'Country', color: 'from-amber-500 to-yellow-500' },
            ].map((genre) => (
              <div
                key={genre.name}
                className={`relative h-32 rounded-lg bg-gradient-to-br ${genre.color} p-4 cursor-pointer hover:scale-105 transition-transform`}
              >
                <h3 className="text-white font-bold text-lg">{genre.name}</h3>
                <div className="absolute bottom-4 right-4 w-16 h-16 bg-black/20 rounded-full transform rotate-12" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Search Results */
        <div className="space-y-6">
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

          {/* Results */}
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <div className="aspect-square bg-white/10 rounded-lg animate-pulse" />
                  <div className="h-4 bg-white/10 rounded animate-pulse" />
                  <div className="h-3 w-2/3 bg-white/10 rounded animate-pulse" />
                </div>
              ))}
            </div>
          ) : searchResults && searchResults.total > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {getFilteredResults().map(({ item, type }, index) => (
                <MediaCard key={`${type}-${item.id}-${index}`} item={item} type={type} />
              ))}
            </div>
          ) : debouncedQuery.length > 0 ? (
            <div className="text-center py-12">
              <SearchIcon className="w-12 h-12 text-foreground-muted mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No results found</h3>
              <p className="text-foreground-muted">
                Try searching for something else or check your spelling
              </p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}