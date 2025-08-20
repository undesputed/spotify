import React, { useState } from 'react'
import { Search, User, Settings, LogOut } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export function TopBar() {
  const { user, signOut } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)

  return (
    <div className="fixed top-0 left-64 right-0 z-30 h-16 bg-background/80 backdrop-blur-xl border-b border-white/10">
      <div className="flex items-center justify-between h-full px-6">
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
        <div className="relative">
          {user ? (
            <div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2"
              >
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.name}
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-white">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <span className="hidden sm:inline">{user.name}</span>
              </Button>

              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-background-secondary rounded-lg border border-white/10 shadow-xl backdrop-blur-xl">
                  <div className="py-2">
                    <button className="flex items-center gap-3 px-4 py-2 text-sm text-foreground-secondary hover:text-foreground hover:bg-white/10 w-full text-left">
                      <User className="w-4 h-4" />
                      Profile
                    </button>
                    <button className="flex items-center gap-3 px-4 py-2 text-sm text-foreground-secondary hover:text-foreground hover:bg-white/10 w-full text-left">
                      <Settings className="w-4 h-4" />
                      Settings
                    </button>
                    <hr className="border-white/10 my-2" />
                    <button
                      onClick={signOut}
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
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
              <Button variant="primary" size="sm">
                Sign Up
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}