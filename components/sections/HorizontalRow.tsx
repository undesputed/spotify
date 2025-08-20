import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { MediaCard } from '@/components/media/MediaCard'
import { Button } from '@/components/ui/Button'
import { Track, Album, Artist, Playlist } from '@/lib/types'

interface HorizontalRowProps {
  title: string
  items: (Track | Album | Artist | Playlist)[]
  type: 'track' | 'album' | 'artist' | 'playlist'
  showAll?: boolean
}

export function HorizontalRow({ title, items, type, showAll = false }: HorizontalRowProps) {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320 // Width of cards + gap
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  if (items.length === 0) return null

  return (
    <div className="mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-foreground">{title}</h2>
        <div className="flex items-center gap-2">
          {showAll && (
            <Button variant="ghost" size="sm">
              Show all
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => scroll('left')}
            className="w-8 h-8"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => scroll('right')}
            className="w-8 h-8"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Cards */}
      <div 
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {items.map((item, index) => (
          <div key={`${type}-${item.id}-${index}`} className="flex-shrink-0">
            <MediaCard item={item} type={type} />
          </div>
        ))}
      </div>
    </div>
  )
}