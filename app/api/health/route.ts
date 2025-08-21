import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    message: 'Spotify Clone API is running',
    timestamp: new Date().toISOString(),
    framework: 'Next.js 15',
    features: ['SSR', 'SSG', 'API Routes', 'App Router']
  })
}
