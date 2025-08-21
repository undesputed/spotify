'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Search, User, Settings, LogOut } from 'lucide-react'
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useRouter } from 'next/navigation'

export function TopBar() {
  const { user, appUser, signOut } = useSupabaseAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const router = useRouter()
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleSignIn = () => {
    router.push('/auth')
  }

  const handleSignUp = () => {
    router.push('/auth?mode=signup')
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      setShowUserMenu(false)
      // Clear any cached data
      localStorage.removeItem('music-central-cache')
      sessionStorage.clear()
      // Redirect to home page
      router.push('/')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-30 h-16 bg-background/80 backdrop-blur-xl border-b border-white/10 lg:left-64">
      <div className="flex items-center justify-between h-full px-6">
        {/* Logo */}
        <div className="flex items-center gap-3 mr-6">
          <img 
            src="/logo.png" 
            alt="Music Central Logo" 
            className="w-8 h-8 rounded-lg object-cover"
          />
          <span className="text-lg font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent hidden sm:block">
            Music Central
          </span>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-foreground-muted" />
            <Input
              placeholder="Search for music, artists, albums..."
              className="pl-10 bg-white/10 border-white/20"
            />
          </div>
        </div>

        {/* User Menu */}
        <div className="relative" ref={menuRef}>
          {user ? (
            <div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2"
              >
                {appUser?.image_url ? (
                  <img
                    src={appUser.image_url}
                    alt={appUser.name}
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-white">
                      {appUser?.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
                <span className="hidden sm:inline">{appUser?.name || user.email}</span>
              </Button>

              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-background-secondary rounded-lg border border-white/10 shadow-xl backdrop-blur-xl">
                  <div className="py-2">
                    <button 
                      onClick={() => router.push('/profile')}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-foreground-secondary hover:text-foreground hover:bg-white/10 w-full text-left"
                    >
                      <User className="w-4 h-4" />
                      Profile
                    </button>
                    <button className="flex items-center gap-3 px-4 py-2 text-sm text-foreground-secondary hover:text-foreground hover:bg-white/10 w-full text-left">
                      <Settings className="w-4 h-4" />
                      Settings
                    </button>
                    <hr className="border-white/10 my-2" />
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-error-400 hover:text-error-300 hover:bg-white/10 w-full text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleSignIn}
              >
                Sign In
              </Button>
              <Button 
                variant="primary" 
                size="sm"
                onClick={handleSignUp}
              >
                Sign Up
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}