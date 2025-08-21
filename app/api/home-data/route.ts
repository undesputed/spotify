import { NextRequest, NextResponse } from 'next/server'
import { supabaseServerService } from '@/lib/supabase/server'
import { homeDataService } from '@/lib/services/home-data-service'

export async function GET(request: NextRequest) {
  try {
    // For now, return sample data without authentication
    // This allows the homepage to load even without user login
    const sampleData = {
      spotify: {
        topTracks: [],
        newReleases: [],
        featuredPlaylists: [],
        trending: [],
        recentlyPlayed: []
      },
      youtube: {
        trendingVideos: [],
        popularMusic: [],
        newReleases: [],
        topCharts: []
      },
      continueListening: [],
      madeForYou: []
    }

    return NextResponse.json(sampleData)
  } catch (error) {
    console.error('Error fetching home data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch home data' },
      { status: 500 }
    )
  }
}
