import React from 'react'
import { Home, Search, Library, Download, Crown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Search', href: '/search', icon: Search },
  { name: 'Library', href: '/library', icon: Library },
  { name: 'Downloads', href: '/downloads', icon: Download },
]

export function Sidebar() {
  const { user } = useAuth()

  return (
    <div className="fixed left-0 top-0 z-40 h-full w-64 bg-background/95 backdrop-blur-xl border-r border-white/10 p-6">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">M</span>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
            MusicStream
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1">
          <ul className="space-y-2">
            {navigation.map((item) => {
              return (
                <li key={item.name}>
                  <div
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors focus-ring cursor-pointer',
                      item.href === '/' 
                        ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/25'
                        : 'text-foreground-secondary hover:text-foreground hover:bg-white/10'
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.name}
                  </div>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Premium Upgrade */}
        {user && !user.isPremium && (
          <div className="mt-auto">
            <div
              className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-accent-600 to-accent-500 rounded-lg text-white font-medium hover:from-accent-700 hover:to-accent-600 transition-all shadow-lg shadow-accent-600/25 cursor-pointer"
            >
              <Crown className="w-5 h-5" />
              Upgrade to Premium
            </div>
          </div>
        )}
      </div>
    </div>
  )
}