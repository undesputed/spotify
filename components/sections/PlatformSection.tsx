'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ChevronRight, Play, Heart, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PlatformSectionProps {
  title: string
  platform: 'spotify' | 'youtube' | 'combined'
  items: any[]
  type: 'track' | 'playlist' | 'album'
  showAll?: boolean
  className?: string
}

const platformConfig = {
  spotify: {
    icon: '🎵',
    color: 'from-green-500/20 to-emerald-500/20',
    borderColor: 'border-green-500/30',
    hoverColor: 'hover:from-green-500/30 hover:to-emerald-500/30',
    textColor: 'text-green-400'
  },
  youtube: {
    icon: '📺',
    color: 'from-red-500/20 to-pink-500/20',
    borderColor: 'border-red-500/30',
    hoverColor: 'hover:from-red-500/30 hover:to-pink-500/30',
    textColor: 'text-red-400'
  },
  combined: {
    icon: '🎼',
    color: 'from-primary-500/20 to-accent-500/20',
    borderColor: 'border-primary-500/30',
    hoverColor: 'hover:from-primary-500/30 hover:to-accent-500/30',
    textColor: 'text-primary-400'
  }
}

export function PlatformSection({ 
  title, 
  platform, 
  items, 
  type, 
  showAll = false,
  className 
}: PlatformSectionProps) {
  const config = platformConfig[platform]

  if (!items || items.length === 0) {
    return null
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center text-lg",
            config.color,
            config.borderColor
          )}>
            {config.icon}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">{title}</h2>
            <p className={cn("text-sm", config.textColor)}>
              Powered by {platform.charAt(0).toUpperCase() + platform.slice(1)}
            </p>
          </div>
        </div>
        
        {showAll && (
          <Button 
            variant="ghost" 
            className="flex items-center gap-2 text-foreground-secondary hover:text-foreground"
          >
            View All
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
        {items.slice(0, 12).map((item, index) => (
          <Card 
            key={item.id || index} 
            className={cn(
              "bg-background-secondary/50 border-white/10 hover:bg-background-secondary/70 transition-all duration-300 cursor-pointer group",
              config.borderColor
            )}
          >
            <CardContent className="p-4">
              {/* Item Image */}
              <div className="aspect-square bg-gradient-to-br rounded-lg mb-3 relative overflow-hidden group-hover:scale-105 transition-transform duration-300">
                {item.artwork ? (
                  <img 
                    src={item.artwork} 
                    alt={item.title || item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className={cn(
                    "w-full h-full flex items-center justify-center",
                    config.color
                  )}>
                    <span className="text-2xl">{config.icon}</span>
                  </div>
                )}
                
                {/* Play Button Overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-200">
                    <Play className="w-5 h-5 text-black ml-1" />
                  </button>
                </div>
              </div>

              {/* Item Info */}
              <div className="space-y-1">
                <h3 className="font-semibold text-white text-sm truncate">
                  {item.title || item.name}
                </h3>
                <p className="text-gray-400 text-xs truncate">
                  {item.artist || item.artist_name || item.creator}
                </p>
                {item.album && (
                  <p className="text-gray-500 text-xs truncate">
                    {item.album}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button className="p-1 hover:bg-white/10 rounded transition-colors">
                  <Heart className="w-4 h-4 text-gray-400 hover:text-red-400" />
                </button>
                <button className="p-1 hover:bg-white/10 rounded transition-colors">
                  <MoreHorizontal className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
