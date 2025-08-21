'use client'

import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Check, Crown, Star, ArrowRight, Zap, Shield, Download, Headphones } from 'lucide-react'
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth'
import { useStripe } from '@/hooks/useStripe'
import { SUBSCRIPTION_TIERS } from '@/lib/config/subscriptions'
import { SubscriptionTier } from '@/lib/types/subscription'

export default function SubscriptionPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, appUser } = useSupabaseAuth()
  const { createCheckoutSession, isLoading } = useStripe()
  const [selectedTier, setSelectedTier] = useState<string>('premium')
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')

  const isUpgrade = searchParams.get('upgrade') === 'true'

  const handleSubscribe = async () => {
    // Redirect to checkout page with selected tier and billing cycle
    router.push(`/checkout?tier=${selectedTier}&cycle=${billingCycle}`)
  }

  const getTierById = (id: string): SubscriptionTier | undefined => {
    return SUBSCRIPTION_TIERS.find(tier => tier.id === id)
  }

  const selectedTierData = getTierById(selectedTier)

  const getYearlyPrice = (monthlyPrice: number): number => {
    return Math.round(monthlyPrice * 12 * 0.8) // 20% discount for yearly
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-white">
          {isUpgrade ? 'Upgrade Your Plan' : 'Choose Your Plan'}
        </h1>
        <p className="text-gray-300 text-lg max-w-2xl mx-auto">
          {isUpgrade 
            ? 'Unlock more platforms and features to enhance your music experience.'
            : 'Select the perfect plan for your music streaming needs.'
          }
        </p>
      </div>

      {/* Billing Cycle Toggle */}
      <div className="flex justify-center">
        <Card className="bg-background-secondary/50 border-white/10">
          <CardContent className="p-2">
            <div className="flex gap-2">
              <Button
                variant={billingCycle === 'monthly' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setBillingCycle('monthly')}
                className={billingCycle === 'monthly' ? 'bg-primary-600' : ''}
              >
                Monthly
              </Button>
              <Button
                variant={billingCycle === 'yearly' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setBillingCycle('yearly')}
                className={billingCycle === 'yearly' ? 'bg-primary-600' : ''}
              >
                Yearly
                <span className="ml-1 px-2 py-0.5 bg-green-600 text-white text-xs rounded-full">
                  Save 20%
                </span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subscription Tiers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {SUBSCRIPTION_TIERS.map((tier) => {
          const isSelected = selectedTier === tier.id
          const isPopular = tier.popular
          const price = billingCycle === 'yearly' ? getYearlyPrice(tier.price) : tier.price
          const originalPrice = billingCycle === 'yearly' ? tier.price * 12 : tier.price

          return (
            <Card 
              key={tier.id}
              className={`relative transition-all duration-300 ${
                isSelected 
                  ? 'bg-gradient-to-br from-primary-500/20 to-accent-500/20 border-primary-500/50 scale-105' 
                  : 'bg-background-secondary/50 border-white/10 hover:bg-background-secondary/70'
              } ${isPopular ? 'ring-2 ring-accent-500/50' : ''}`}
            >
              {/* Popular Badge */}
              {isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-accent-600 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    Most Popular
                  </div>
                </div>
              )}

              <CardContent className="p-6">
                {/* Tier Header */}
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    {tier.id === 'free' ? (
                      <div className="w-8 h-8 bg-gray-500/30 rounded-lg flex items-center justify-center">
                        <Crown className="w-4 h-4 text-gray-400" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 bg-primary-500/30 rounded-lg flex items-center justify-center">
                        <Zap className="w-4 h-4 text-primary-400" />
                      </div>
                    )}
                    <h3 className="text-xl font-bold text-white">{tier.name}</h3>
                  </div>
                  
                  {/* Pricing */}
                  <div className="mb-4">
                    {tier.price === 0 ? (
                      <div className="text-3xl font-bold text-white">Free</div>
                    ) : (
                      <div>
                        <div className="text-3xl font-bold text-white">
                          ${price}
                          <span className="text-lg text-gray-400">
                            /{billingCycle === 'yearly' ? 'year' : 'month'}
                          </span>
                        </div>
                        {billingCycle === 'yearly' && (
                          <div className="text-sm text-gray-400 line-through">
                            ${originalPrice}/year
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Platform Limit */}
                  <div className="text-sm text-gray-300 mb-4">
                    {tier.platformLimit} platform{tier.platformLimit > 1 ? 's' : ''} allowed
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-3 mb-6">
                  {tier.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-primary-500/30 rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-primary-400" />
                      </div>
                      <span className="text-sm text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Action Button */}
                {tier.id === 'free' ? (
                  <Button 
                    variant="outline" 
                    className="w-full border-white/20 text-white hover:bg-white/10"
                    disabled
                  >
                    Current Plan
                  </Button>
                ) : (
                  <Button 
                    onClick={() => router.push(`/checkout?tier=${tier.id}&cycle=${billingCycle}`)}
                    className={`w-full ${
                      isSelected 
                        ? 'bg-primary-600 hover:bg-primary-700' 
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                  >
                    Choose Plan
                  </Button>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Selected Plan Summary */}
      {selectedTierData && selectedTierData.id !== 'free' && (
        <Card className="bg-gradient-to-r from-primary-600/20 to-accent-600/20 border-primary-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-500/30 rounded-lg flex items-center justify-center">
                  <Crown className="w-6 h-6 text-primary-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {selectedTierData.name} Plan Selected
                  </h3>
                  <p className="text-gray-300">
                    ${billingCycle === 'yearly' ? getYearlyPrice(selectedTierData.price) : selectedTierData.price}
                    /{billingCycle === 'yearly' ? 'year' : 'month'}
                  </p>
                </div>
              </div>
              <Button 
                onClick={handleSubscribe}
                className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700"
              >
                Continue to Checkout
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Features Comparison */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-white text-center">All Plans Include</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-blue-500/30 rounded-lg flex items-center justify-center mx-auto">
              <Headphones className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="font-semibold text-white">High Quality Audio</h3>
            <p className="text-sm text-gray-400">Crystal clear sound quality</p>
          </div>
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-green-500/30 rounded-lg flex items-center justify-center mx-auto">
              <Download className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="font-semibold text-white">Offline Downloads</h3>
            <p className="text-sm text-gray-400">Listen without internet</p>
          </div>
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-purple-500/30 rounded-lg flex items-center justify-center mx-auto">
              <Shield className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="font-semibold text-white">Secure & Private</h3>
            <p className="text-sm text-gray-400">Your data is protected</p>
          </div>
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-orange-500/30 rounded-lg flex items-center justify-center mx-auto">
              <Zap className="w-6 h-6 text-orange-400" />
            </div>
            <h3 className="font-semibold text-white">Cross-Platform</h3>
            <p className="text-sm text-gray-400">Sync across all devices</p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-white text-center">Frequently Asked Questions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-background-secondary/50 border-white/10">
            <CardContent className="p-4">
              <h3 className="font-semibold text-white mb-2">Can I change my plan later?</h3>
              <p className="text-sm text-gray-400">
                Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-background-secondary/50 border-white/10">
            <CardContent className="p-4">
              <h3 className="font-semibold text-white mb-2">What payment methods do you accept?</h3>
              <p className="text-sm text-gray-400">
                We accept all major credit cards, PayPal, and Apple Pay. All payments are processed securely.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-background-secondary/50 border-white/10">
            <CardContent className="p-4">
              <h3 className="font-semibold text-white mb-2">Is there a free trial?</h3>
              <p className="text-sm text-gray-400">
                Yes, all paid plans come with a 7-day free trial. You can cancel anytime during the trial period.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-background-secondary/50 border-white/10">
            <CardContent className="p-4">
              <h3 className="font-semibold text-white mb-2">Can I cancel anytime?</h3>
              <p className="text-sm text-gray-400">
                Absolutely. You can cancel your subscription at any time and continue using the service until the end of your billing period.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
