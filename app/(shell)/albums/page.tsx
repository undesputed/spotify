'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Search, Disc3, Music } from 'lucide-react'

export default function AlbumsPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Albums</h1>
          <p className="text-gray-300">Discover and explore music albums</p>
        </div>
        <Button className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700">
          <Search className="w-4 h-4" />
          Browse Albums
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="bg-background-secondary/50 border-white/10">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search albums, artists, or genres..."
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-primary-500 focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" className="border border-white/20">
                All Genres
              </Button>
              <Button variant="ghost" className="border border-white/20">
                All Years
              </Button>
              <Button variant="ghost" className="border border-white/20">
                Sort by: Popularity
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Featured Albums */}
      <div>
        <h2 className="text-2xl font-semibold text-white mb-4">Featured Albums</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {/* Sample Album Cards */}
          {Array.from({ length: 10 }).map((_, i) => (
            <Card key={i} className="bg-background-secondary/50 border-white/10 hover:bg-background-secondary/70 transition-all duration-300 cursor-pointer group">
              <CardContent className="p-4">
                <div className="aspect-square bg-gradient-to-br from-primary-500/20 to-accent-500/20 rounded-lg mb-3 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                  <Disc3 className="w-12 h-12 text-primary-400" />
                </div>
                <h3 className="font-semibold text-white text-sm mb-1 truncate">Album Title {i + 1}</h3>
                <p className="text-gray-400 text-xs truncate">Artist Name</p>
                <p className="text-gray-500 text-xs mt-1">2024 • Pop</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* New Releases */}
      <div>
        <h2 className="text-2xl font-semibold text-white mb-4">New Releases</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="bg-background-secondary/50 border-white/10 hover:bg-background-secondary/70 transition-all duration-300 cursor-pointer group">
              <CardContent className="p-4">
                <div className="aspect-square bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg mb-3 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                  <Music className="w-12 h-12 text-green-400" />
                </div>
                <h3 className="font-semibold text-white text-sm mb-1 truncate">New Album {i + 1}</h3>
                <p className="text-gray-400 text-xs truncate">New Artist</p>
                <p className="text-gray-500 text-xs mt-1">2024 • Various</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Popular Genres */}
      <div>
        <h2 className="text-2xl font-semibold text-white mb-4">Browse by Genre</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {['Pop', 'Rock', 'Hip Hop', 'Electronic', 'Jazz', 'Classical', 'Country', 'R&B'].map((genre, i) => (
            <Card key={genre} className="bg-gradient-to-br from-primary-500/20 to-accent-500/20 border-primary-500/30 hover:from-primary-500/30 hover:to-accent-500/30 transition-all duration-300 cursor-pointer group">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary-500/30 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                  <Music className="w-6 h-6 text-primary-400" />
                </div>
                <h3 className="font-semibold text-white">{genre}</h3>
                <p className="text-gray-400 text-sm mt-1">Explore {genre}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
