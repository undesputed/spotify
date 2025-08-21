'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Plus, Music, Heart, Clock } from 'lucide-react'

export default function PlaylistsPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Your Playlists</h1>
          <p className="text-gray-300">Create and manage your music collections</p>
        </div>
        <Button className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700">
          <Plus className="w-4 h-4" />
          Create Playlist
        </Button>
      </div>

      {/* Featured Playlists */}
      <div>
        <h2 className="text-2xl font-semibold text-white mb-4">Featured Playlists</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* Liked Songs */}
          <Card className="bg-gradient-to-br from-red-500/20 to-pink-500/20 border-red-500/30 hover:from-red-500/30 hover:to-pink-500/30 transition-all duration-300 cursor-pointer group">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white mb-1">Liked Songs</h3>
                  <p className="text-gray-300 text-sm">Your favorite tracks</p>
                  <p className="text-gray-400 text-xs mt-1">0 songs</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recently Added */}
          <Card className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-blue-500/30 hover:from-blue-500/30 hover:to-purple-500/30 transition-all duration-300 cursor-pointer group">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white mb-1">Recently Added</h3>
                  <p className="text-gray-300 text-sm">Recently added tracks</p>
                  <p className="text-gray-400 text-xs mt-1">0 songs</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Create New Playlist */}
          <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30 hover:from-green-500/30 hover:to-emerald-500/30 transition-all duration-300 cursor-pointer group border-dashed">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Plus className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white mb-1">Create Playlist</h3>
                  <p className="text-gray-300 text-sm">Start a new collection</p>
                  <p className="text-gray-400 text-xs mt-1">Click to create</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Your Playlists */}
      <div>
        <h2 className="text-2xl font-semibold text-white mb-4">Your Playlists</h2>
        <div className="text-center py-12">
          <Music className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No playlists yet</h3>
          <p className="text-gray-500 mb-6">Create your first playlist to get started</p>
          <Button className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700">
            <Plus className="w-4 h-4" />
            Create Your First Playlist
          </Button>
        </div>
      </div>
    </div>
  )
}
