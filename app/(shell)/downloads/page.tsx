'use client'

import React from 'react'
import { Download, HardDrive, Wifi, WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'

export default function DownloadsPage() {
  const [isOnline, setIsOnline] = React.useState(true)

  React.useEffect(() => {
    setIsOnline(navigator.onLine)
    
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Downloads</h1>
        <div className="flex items-center gap-2">
          {isOnline ? (
            <div className="flex items-center gap-2 text-success-400">
              <Wifi className="w-4 h-4" />
              <span className="text-sm">Online</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-warning-400">
              <WifiOff className="w-4 h-4" />
              <span className="text-sm">Offline</span>
            </div>
          )}
        </div>
      </div>

      {/* Storage Info */}
      <Card>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary-600/20 rounded-lg flex items-center justify-center">
                <HardDrive className="w-6 h-6 text-primary-400" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">Storage Used</h3>
                <p className="text-sm text-foreground-muted">2.4 GB of 50 GB available</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Manage Storage
            </Button>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-white/10 rounded-full h-2">
            <div 
              className="bg-primary-500 h-2 rounded-full transition-all"
              style={{ width: '4.8%' }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Download Quality Settings */}
      <Card>
        <CardContent>
          <h3 className="font-medium text-foreground mb-4">Download Quality</h3>
          <div className="space-y-3">
            {[
              { id: 'low', label: 'Low (96 kbps)', description: 'Uses less storage' },
              { id: 'medium', label: 'Medium (160 kbps)', description: 'Balanced quality and storage' },
              { id: 'high', label: 'High (320 kbps)', description: 'Best quality, uses more storage', premium: true },
            ].map((quality) => (
              <label key={quality.id} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="quality"
                  value={quality.id}
                  defaultChecked={quality.id === 'medium'}
                  className="w-4 h-4 text-primary-600 border-white/20 bg-white/5 focus:ring-primary-500"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-foreground">{quality.label}</span>
                    {quality.premium && (
                      <span className="px-2 py-1 bg-accent-500 text-white text-xs rounded-full">Premium</span>
                    )}
                  </div>
                  <p className="text-sm text-foreground-muted">{quality.description}</p>
                </div>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Downloaded Content */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Downloaded Music</h2>
        
        {/* Empty state */}
        <Card>
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Download className="w-8 h-8 text-foreground-muted" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              No downloads yet
            </h3>
            <p className="text-foreground-muted mb-4">
              Download music to listen offline. Premium required for high-quality downloads.
            </p>
            <Button variant="primary">
              Browse Music
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Tips */}
      <Card>
        <CardContent>
          <h3 className="font-medium text-foreground mb-4">Download Tips</h3>
          <ul className="space-y-2 text-sm text-foreground-muted">
            <li>• Downloads are only available on this device</li>
            <li>• Downloaded music will be removed if you don't go online for 30 days</li>
            <li>• Premium users get unlimited downloads and higher quality options</li>
            <li>• Downloads count towards your device storage limit</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}