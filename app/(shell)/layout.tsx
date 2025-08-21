import React from 'react'
import { Sidebar } from '@/components/navigation/Sidebar'
import { TopBar } from '@/components/navigation/TopBar'
import { MiniPlayer } from '@/components/player/MiniPlayer'
import { AudioPlayer } from '@/components/player/AudioPlayer'
import { ShellLayoutClient } from './ShellLayoutClient'

export default function ShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Sidebar />
      <TopBar />
      <main className="lg:ml-64 pt-16 pb-20 min-h-screen bg-gradient-to-br from-background to-background-secondary">
        <div className="p-4 lg:p-4">
          {children}
        </div>
      </main>
      <MiniPlayer />
      <AudioPlayer />
      <ShellLayoutClient />
    </>
  )
}