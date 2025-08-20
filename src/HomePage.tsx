import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { HorizontalRow } from '../components/sections/HorizontalRow';
import { api } from '../lib/api';
import { Card, CardContent } from '../components/ui/Card';

export function HomePage() {
  const { data: homeData, isLoading } = useQuery({
    queryKey: ['home'],
    queryFn: api.getHomeData,
  });

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="h-64 bg-gradient-to-r from-primary-600/20 to-accent-600/20 rounded-2xl animate-pulse" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-4">
            <div className="h-8 w-48 bg-white/10 rounded animate-pulse" />
            <div className="flex gap-4">
              {Array.from({ length: 6 }).map((_, j) => (
                <div key={j} className="w-40 h-56 bg-white/10 rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!homeData) return null;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Section */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/80 to-accent-600/80" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC4xIi8+Cjwvc3ZnPgo=')] opacity-20" />
        <CardContent className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Good evening
              </h1>
              <p className="text-white/80 text-lg">
                Ready to discover your next favorite song?
              </p>
            </div>
            <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                <span className="text-2xl">🎵</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Continue Listening */}
      {homeData.continueListening.length > 0 && (
        <HorizontalRow
          title="Continue Listening"
          items={homeData.continueListening}
          type="track"
        />
      )}

      {/* Made For You */}
      <HorizontalRow
        title="Made For You"
        items={homeData.madeForYou}
        type="playlist"
        showAll
      />

      {/* New Releases */}
      <HorizontalRow
        title="New Releases"
        items={homeData.newReleases}
        type="album"
        showAll
      />

      {/* Trending Now */}
      <HorizontalRow
        title="Trending Now"
        items={homeData.trending}
        type="track"
        showAll
      />

      {/* For You */}
      <HorizontalRow
        title="Discover Weekly"
        items={homeData.forYou}
        type="playlist"
      />

      {/* Charts */}
      <HorizontalRow
        title="Top Charts"
        items={homeData.charts}
        type="track"
        showAll
      />
    </div>
  );
}
