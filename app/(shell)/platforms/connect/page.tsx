'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Check, ArrowRight, ExternalLink, Loader2, CheckCircle } from 'lucide-react'
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth'
import { getPlatformById, AVAILABLE_PLATFORMS } from '@/lib/config/subscriptions'
import { Platform } from '@/lib/types/subscription'

interface ConnectionStatus {
  platformId: string
  status: 'pending' | 'connecting' | 'connected' | 'failed'
  error?: string
}

export default function PlatformConnectPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useSupabaseAuth()
  const [connectionStatuses, setConnectionStatuses] = useState<ConnectionStatus[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)

  const selectedPlatforms = useMemo(() => {
    return searchParams.get('platforms')?.split(',') || []
  }, [searchParams])

  useEffect(() => {
    // Initialize connection statuses only if we have platforms and statuses haven't been set yet
    if (selectedPlatforms.length > 0 && connectionStatuses.length === 0) {
      const initialStatuses = selectedPlatforms.map(platformId => ({
        platformId,
        status: 'pending' as const
      }))
      setConnectionStatuses(initialStatuses)
    }
  }, [selectedPlatforms, connectionStatuses.length])

  // Handle OAuth success redirects
  useEffect(() => {
    const success = searchParams.get('success')
    if (success === 'spotify_connected') {
      setConnectionStatuses(prev => 
        prev.map(status => 
          status.platformId === 'spotify' 
            ? { ...status, status: 'connected' }
            : status
        )
      )
      // Remove success parameter from URL
      const url = new URL(window.location.href)
      url.searchParams.delete('success')
      window.history.replaceState({}, '', url.toString())
    } else if (success === 'youtube_connected') {
      setConnectionStatuses(prev => 
        prev.map(status => 
          status.platformId === 'youtube_music' 
            ? { ...status, status: 'connected' }
            : status
        )
      )
      // Remove success parameter from URL
      const url = new URL(window.location.href)
      url.searchParams.delete('success')
      window.history.replaceState({}, '', url.toString())
    }
  }, [searchParams])

  const handleConnectPlatform = async (platformId: string) => {
    if (!user?.id) {
      alert('Please log in to connect platforms')
      return
    }

    setConnectionStatuses(prev => 
      prev.map(status => 
        status.platformId === platformId 
          ? { ...status, status: 'connecting' }
          : status
      )
    )

    try {
      if (platformId === 'spotify') {
        // Redirect to Spotify OAuth
        const response = await fetch(`/api/auth/spotify?userId=${user.id}`)
        const data = await response.json()
        
        if (data.authUrl) {
          window.location.href = data.authUrl
        } else {
          throw new Error('Failed to get Spotify auth URL')
        }
      } else if (platformId === 'youtube_music') {
        // Redirect to YouTube OAuth
        const response = await fetch(`/api/auth/youtube?userId=${user.id}`)
        const data = await response.json()
        
        if (data.authUrl) {
          window.location.href = data.authUrl
        } else {
          throw new Error('Failed to get YouTube auth URL')
        }
      } else {
        // For other platforms, simulate connection
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // Update status to connected
        setConnectionStatuses(prev => 
          prev.map(status => 
            status.platformId === platformId 
              ? { ...status, status: 'connected' }
              : status
          )
        )

        // Move to next platform
        const currentIndex = connectionStatuses.findIndex(s => s.platformId === platformId)
        if (currentIndex < connectionStatuses.length - 1) {
          setCurrentStep(currentIndex + 1)
        }
      }
    } catch (error) {
      console.error('Platform connection error:', error)
      setConnectionStatuses(prev => 
        prev.map(status => 
          status.platformId === platformId 
            ? { ...status, status: 'failed', error: 'Connection failed' }
            : status
        )
      )
    }
  }

  const handleSkipPlatform = (platformId: string) => {
    setConnectionStatuses(prev => 
      prev.map(status => 
        status.platformId === platformId 
          ? { ...status, status: 'connected' }
          : status
      )
    )

    const currentIndex = connectionStatuses.findIndex(s => s.platformId === platformId)
    if (currentIndex < connectionStatuses.length - 1) {
      setCurrentStep(currentIndex + 1)
    }
  }

  const handleFinish = async () => {
    setIsProcessing(true)
    
    try {
      // Save all connections to database
      const connectedPlatforms = connectionStatuses
        .filter(status => status.status === 'connected')
        .map(status => status.platformId)

      console.log('Connected platforms:', connectedPlatforms)
      
      // Redirect to home page
      router.push('/?platforms_connected=true')
    } catch (error) {
      console.error('Error saving connections:', error)
      alert('Failed to save platform connections. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const currentPlatform = connectionStatuses[currentStep]
  const platformData = currentPlatform ? getPlatformById(currentPlatform.platformId) : null
  const allConnected = connectionStatuses.every(status => status.status === 'connected')
  const hasFailures = connectionStatuses.some(status => status.status === 'failed')

  if (!platformData) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">No Platforms Selected</h1>
          <p className="text-gray-300 mb-6">Please go back and select platforms to connect.</p>
          <Button onClick={() => router.push('/platforms')}>
            Back to Platform Selection
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-white">Connect Your Platforms</h1>
        <p className="text-gray-300 text-lg">
          Let's connect your selected music platforms to Music Central
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center justify-center space-x-4">
        {connectionStatuses.map((status, index) => {
          const platform = getPlatformById(status.platformId)
          const isActive = index === currentStep
          const isCompleted = status.status === 'connected'
          const isFailed = status.status === 'failed'

          return (
            <div key={status.platformId} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                isCompleted 
                  ? 'bg-green-500 text-white' 
                  : isFailed
                  ? 'bg-red-500 text-white'
                  : isActive
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-600 text-gray-300'
              }`}>
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : isFailed ? (
                  <span>!</span>
                ) : (
                  index + 1
                )}
              </div>
              {index < connectionStatuses.length - 1 && (
                <div className={`w-16 h-1 mx-2 ${
                  isCompleted ? 'bg-green-500' : 'bg-gray-600'
                }`} />
              )}
            </div>
          )
        })}
      </div>

      {/* Current Platform Connection */}
      <Card className="bg-gradient-to-br from-primary-500/20 to-accent-500/20 border-primary-500/30">
        <CardContent className="p-8">
          <div className="text-center space-y-6">
            {/* Platform Icon */}
            <div 
              className="w-24 h-24 rounded-2xl flex items-center justify-center text-4xl mx-auto"
              style={{ backgroundColor: `${platformData.color}20` }}
            >
              {platformData.icon}
            </div>

            {/* Platform Info */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">{platformData.name}</h2>
              <p className="text-gray-300">{platformData.description}</p>
            </div>

            {/* Connection Status */}
            <div className="space-y-4">
              {currentPlatform.status === 'pending' && (
                <div className="space-y-4">
                  <p className="text-gray-300">
                    Click the button below to connect your {platformData.name} account
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Button 
                      onClick={() => handleConnectPlatform(currentPlatform.platformId)}
                      className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700"
                    >
                      Connect {platformData.name}
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost"
                      onClick={() => handleSkipPlatform(currentPlatform.platformId)}
                      className="text-gray-400 hover:text-white"
                    >
                      Skip for now
                    </Button>
                  </div>
                </div>
              )}

              {currentPlatform.status === 'connecting' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-primary-400" />
                    <span className="text-gray-300">Connecting to {platformData.name}...</span>
                  </div>
                  <p className="text-sm text-gray-400">
                    You may be redirected to {platformData.name} to authorize the connection
                  </p>
                </div>
              )}

              {currentPlatform.status === 'connected' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-2 text-green-400">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Connected successfully!</span>
                  </div>
                  {currentStep < connectionStatuses.length - 1 && (
                    <Button 
                      onClick={() => setCurrentStep(currentStep + 1)}
                      className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700"
                    >
                      Next Platform
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              )}

              {currentPlatform.status === 'failed' && (
                <div className="space-y-4">
                  <div className="text-red-400">
                    <p className="font-medium">Connection failed</p>
                    <p className="text-sm text-gray-400">{currentPlatform.error}</p>
                  </div>
                  <div className="flex gap-4 justify-center">
                    <Button 
                      onClick={() => handleConnectPlatform(currentPlatform.platformId)}
                      className="bg-primary-600 hover:bg-primary-700"
                    >
                      Try Again
                    </Button>
                    <Button 
                      variant="ghost"
                      onClick={() => handleSkipPlatform(currentPlatform.platformId)}
                      className="text-gray-400 hover:text-white"
                    >
                      Skip
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Platform List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Selected Platforms</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {connectionStatuses.map((status) => {
            const platform = getPlatformById(status.platformId)
            if (!platform) return null

            return (
              <Card 
                key={status.platformId}
                className={`transition-all duration-300 ${
                  status.status === 'connected' 
                    ? 'bg-green-500/20 border-green-500/30' 
                    : status.status === 'failed'
                    ? 'bg-red-500/20 border-red-500/30'
                    : 'bg-background-secondary/50 border-white/10'
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                      style={{ backgroundColor: `${platform.color}20` }}
                    >
                      {platform.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-white">{platform.name}</h4>
                      <p className="text-sm text-gray-400">
                        {status.status === 'connected' && 'Connected'}
                        {status.status === 'connecting' && 'Connecting...'}
                        {status.status === 'failed' && 'Connection failed'}
                        {status.status === 'pending' && 'Pending connection'}
                      </p>
                    </div>
                    <div>
                      {status.status === 'connected' && (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      )}
                      {status.status === 'connecting' && (
                        <Loader2 className="w-5 h-5 animate-spin text-primary-400" />
                      )}
                      {status.status === 'failed' && (
                        <span className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">
                          !
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Finish Button */}
      {allConnected && (
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-green-400">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">All platforms connected successfully!</span>
          </div>
          <Button 
            onClick={handleFinish}
            disabled={isProcessing}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700"
          >
            {isProcessing ? 'Setting up...' : 'Finish Setup'}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Error Summary */}
      {hasFailures && (
        <Card className="bg-red-500/20 border-red-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold">
                !
              </span>
              <div>
                <h3 className="font-semibold text-white">Some connections failed</h3>
                <p className="text-sm text-gray-300">
                  You can still continue with the platforms that connected successfully, 
                  or try connecting the failed platforms again.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
