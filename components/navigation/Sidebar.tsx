'use client'

import React, { useState, useEffect } from 'react'
import { Home, Search, Library, Download, Crown, Upload, Menu, X, Disc3, ListMusic } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { useRouter, usePathname } from 'next/navigation'

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Search', href: '/search', icon: Search },
  { name: 'Platforms', href: '/platforms', icon: Disc3 },
  { name: 'Upload Music', href: '/upload', icon: Upload },
  { name: 'Playlists', href: '/playlists', icon: ListMusic },
  { name: 'Albums', href: '/albums', icon: Disc3 },
  { name: 'Library', href: '/library', icon: Library },
  { name: 'Downloads', href: '/downloads', icon: Download },
]

export function Sidebar() {
  const { user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Load collapsed state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('sidebar-collapsed')
    if (savedState) {
      setIsCollapsed(JSON.parse(savedState))
    }
  }, [])

  // Save collapsed state to localStorage
  const toggleSidebar = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem('sidebar-collapsed', JSON.stringify(newState))
  }

  const handleNavigation = (href: string) => {
    router.push(href)
  }

  return (
    <>
      {/* Mobile Overlay */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed left-0 top-0 z-40 h-full bg-background/95 backdrop-blur-xl border-r border-white/10 transition-all duration-300",
        isCollapsed ? "w-16" : "w-64",
        "lg:relative lg:translate-x-0",
        !isCollapsed ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex flex-col h-full p-4">
          {/* Header with Toggle */}
          <div className="flex items-center justify-between mb-8">
            <div className={cn(
              "flex items-center gap-3 transition-all duration-300",
              isCollapsed ? "justify-center" : "flex-1"
            )}>
              <img 
                src="/logo.png" 
                alt="Music Central Logo" 
                className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
              />
              {!isCollapsed && (
                <span className="text-xl font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                  Music Central
                </span>
              )}
            </div>
            
            {/* Toggle Button */}
            <button
              onClick={toggleSidebar}
              className={cn(
                "p-2 rounded-lg hover:bg-white/10 transition-colors",
                isCollapsed ? "absolute -right-12 top-4" : "lg:block"
              )}
            >
              {isCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5 lg:hidden" />}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1">
            <ul className="space-y-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <li key={item.name}>
                    <button
                      onClick={() => handleNavigation(item.href)}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors focus-ring w-full text-left',
                        isActive
                          ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/25'
                          : 'text-foreground-secondary hover:text-foreground hover:bg-white/10'
                      )}
                      title={isCollapsed ? item.name : undefined}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {!isCollapsed && <span>{item.name}</span>}
                    </button>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* Premium Upgrade */}
          {user && !user.isPremium && !isCollapsed && (
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
    </>
  )
}