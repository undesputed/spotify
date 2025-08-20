import React from 'react'
import { Sidebar } from '@/components/navigation/Sidebar'
import { TopBar } from '@/components/navigation/TopBar'
import { MiniPlayer } from '@/components/player/MiniPlayer'
import { AudioPlayer } from '@/components/player/AudioPlayer'
import { useKeyboardShortcuts } from '@/hooks/usePlayer'

function ShellLayoutClient({ children }: { children: React.ReactNode }) {
  useKeyboardShortcuts()
  
  return (
    <>
      <Sidebar />
      <TopBar />
      <main className="ml-64 pt-16 pb-20 min-h-screen bg-gradient-to-br from-background to-background-secondary">
        <div className="p-6">
          {children}
        </div>
      </main>
      <MiniPlayer />
      <AudioPlayer />
    </>
  )
}

export default function ShellLayout({ children }: { children: React.ReactNode }) {
  return <ShellLayoutClient>{children}</ShellLayoutClient>
}