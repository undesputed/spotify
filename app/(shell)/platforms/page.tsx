'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Check, Lock, ArrowRight, Crown, Star } from 'lucide-react'
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth'
import { AVAILABLE_PLATFORMS, SUBSCRIPTION_TIERS } from '@/lib/config/subscriptions'
import { Platform, SubscriptionTier } from '@/lib/types/subscription'

export default function PlatformsPage() {
  const router = useRouter()
  const { user, appUser } = useSupabaseAuth()
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [currentTier, setCurrentTier] = useState<SubscriptionTier>(SUBSCRIPTION_TIERS[0])
  const [isConnecting, setIsConnecting] = useState(false)

  // Check if user has already selected platforms
  useEffect(() => {
    if (appUser?.platforms) {
      setSelectedPlatforms(appUser.platforms)
    }
  }, [appUser])

  const handlePlatformToggle = (platformId: string) => {
    setSelectedPlatforms(prev => {
      if (prev.includes(platformId)) {
        return prev.filter(id => id !== platformId)
      } else {
        // Check if user can add more platforms
        if (prev.length >= currentTier.platformLimit) {
          // Show upgrade modal or redirect to subscription page
          router.push('/subscription?upgrade=true')
          return prev
        }
        return [...prev, platformId]
      }
    })
  }

  const handleContinue = async () => {
    if (selectedPlatforms.length === 0) {
      alert('Please select at least one platform to continue.')
      return
    }

    setIsConnecting(true)
    
    try {
      // Save selected platforms to user profile
      // This would typically be an API call
      console.log('Selected platforms:', selectedPlatforms)
      
      // Redirect to platform connection flow
      router.push(`/platforms/connect?platforms=${selectedPlatforms.join(',')}`)
    } catch (error) {
      console.error('Error saving platform selection:', error)
      alert('Failed to save platform selection. Please try again.')
    } finally {
      setIsConnecting(false)
    }
  }

  const getPlatformById = (id: string): Platform | undefined => {
    return AVAILABLE_PLATFORMS.find(p => p.id === id)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-white">Choose Your Music Platforms</h1>
        <p className="text-gray-300 text-lg max-w-2xl mx-auto">
          Select the music platforms you'd like to connect to Music Central. 
          Your subscription tier determines how many platforms you can use.
        </p>
      </div>

      {/* Current Subscription Info */}
      <Card className="bg-gradient-to-r from-primary-600/20 to-accent-600/20 border-primary-500/30">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-500/30 rounded-lg flex items-center justify-center">
                <Crown className="w-6 h-6 text-primary-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">{currentTier.name} Plan</h3>
                <p className="text-gray-300">
                  {currentTier.platformLimit} platform{currentTier.platformLimit > 1 ? 's' : ''} allowed
                </p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              onClick={() => router.push('/subscription')}
              className="text-primary-400 hover:text-primary-300"
            >
              Upgrade Plan
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Platform Selection */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-white">Available Platforms</h2>
          <div className="text-sm text-gray-400">
            {selectedPlatforms.length} of {currentTier.platformLimit} selected
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {AVAILABLE_PLATFORMS.map((platform) => {
            const isSelected = selectedPlatforms.includes(platform.id)
            const isDisabled = !platform.isAvailable
            const isAtLimit = selectedPlatforms.length >= currentTier.platformLimit && !isSelected

            return (
              <Card 
                key={platform.id}
                className={`relative transition-all duration-300 cursor-pointer ${
                  isSelected 
                    ? 'bg-gradient-to-br from-primary-500/20 to-accent-500/20 border-primary-500/50' 
                    : 'bg-background-secondary/50 border-white/10 hover:bg-background-secondary/70'
                } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => !isDisabled && handlePlatformToggle(platform.id)}
              >
                <CardContent className="p-6">
                  {/* Platform Icon and Status */}
                  <div className="flex items-center justify-between mb-4">
                    <div 
                      className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl"
                      style={{ backgroundColor: `${platform.color}20` }}
                    >
                      {platform.icon}
                    </div>
                    <div className="flex items-center gap-2">
                      {isSelected && (
                        <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                      {isDisabled && (
                        <Lock className="w-5 h-5 text-gray-500" />
                      )}
                      {isAtLimit && (
                        <Crown className="w-5 h-5 text-accent-400" />
                      )}
                    </div>
                  </div>

                  {/* Platform Info */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-white">{platform.name}</h3>
                    <p className="text-gray-400 text-sm">{platform.description}</p>
                  </div>

                  {/* Features */}
                  <div className="mt-4 space-y-1">
                    {platform.features.slice(0, 2).map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-xs text-gray-300">
                        <div className="w-1 h-1 bg-gray-400 rounded-full" />
                        {feature}
                      </div>
                    ))}
                    {platform.features.length > 2 && (
                      <div className="text-xs text-gray-500">
                        +{platform.features.length - 2} more features
                      </div>
                    )}
                  </div>

                  {/* Status Badge */}
                  {isDisabled && (
                    <div className="absolute top-4 right-4">
                      <span className="px-2 py-1 bg-gray-600 text-white text-xs rounded-full">
                        Coming Soon
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-8 border-t border-white/10">
        <Button 
          variant="ghost" 
          onClick={() => router.push('/')}
          className="text-gray-400 hover:text-white"
        >
          Skip for now
        </Button>
        
        <Button 
          onClick={handleContinue}
          disabled={selectedPlatforms.length === 0 || isConnecting}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700"
        >
          {isConnecting ? 'Connecting...' : 'Continue'}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Upgrade Prompt */}
      {selectedPlatforms.length >= currentTier.platformLimit && (
        <Card className="bg-gradient-to-r from-accent-600/20 to-purple-600/20 border-accent-500/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-accent-500/30 rounded-lg flex items-center justify-center">
                <Star className="w-6 h-6 text-accent-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white">Want to connect more platforms?</h3>
                <p className="text-gray-300">
                  Upgrade to Premium or Pro to connect more music platforms and unlock additional features.
                </p>
              </div>
              <Button 
                onClick={() => router.push('/subscription')}
                className="bg-accent-600 hover:bg-accent-700"
              >
                View Plans
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
