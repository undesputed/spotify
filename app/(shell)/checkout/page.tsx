'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Check, Crown, Star, ArrowRight, Zap, Shield, Download, Headphones } from 'lucide-react'
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth'
import { useStripe } from '@/hooks/useStripe'
import { SUBSCRIPTION_TIERS } from '@/lib/config/subscriptions'
import { SubscriptionTier } from '@/lib/types/subscription'

// Logo Component
const Logo = () => (
  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
    <Crown className="w-6 h-6 text-white" />
  </div>
)

// Product Display Component
const ProductDisplay = ({ 
  selectedTier, 
  billingCycle, 
  onSubscribe, 
  isLoading 
}: {
  selectedTier: string
  billingCycle: 'monthly' | 'yearly'
  onSubscribe: () => void
  isLoading: boolean
}) => {
  const getTierById = (id: string): SubscriptionTier | undefined => {
    return SUBSCRIPTION_TIERS.find(tier => tier.id === id)
  }

  const tier = getTierById(selectedTier)
  if (!tier) return null

  const getYearlyPrice = (monthlyPrice: number): number => {
    return Math.round(monthlyPrice * 12 * 0.8) // 20% discount for yearly
  }

  const price = billingCycle === 'yearly' ? getYearlyPrice(tier.price) : tier.price
  const originalPrice = billingCycle === 'yearly' ? tier.price * 12 : tier.price

  return (
    <section className="max-w-md mx-auto">
      <Card className="bg-gradient-to-br from-primary-500/20 to-accent-500/20 border-primary-500/50">
        <CardContent className="p-8">
          <div className="product text-center">
            <div className="flex justify-center mb-6">
              <Logo />
            </div>
            <div className="description space-y-4">
              <h3 className="text-2xl font-bold text-white">{tier.name} Plan</h3>
              <div className="space-y-2">
                <h5 className="text-3xl font-bold text-white">
                  ${price}
                  <span className="text-lg text-gray-400">
                    /{billingCycle === 'yearly' ? 'year' : 'month'}
                  </span>
                </h5>
                {billingCycle === 'yearly' && (
                  <div className="text-sm text-gray-400 line-through">
                    ${originalPrice}/year
                  </div>
                )}
              </div>
              
              {/* Features */}
              <div className="space-y-2 text-left">
                {tier.features.slice(0, 3).map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary-400" />
                    <span className="text-sm text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <form onSubmit={(e) => {
            e.preventDefault()
            onSubscribe()
          }} className="mt-6">
            <Button 
              id="checkout-and-portal-button" 
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white"
            >
              {isLoading ? 'Processing...' : 'Checkout'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  )
}

// Success Display Component
const SuccessDisplay = ({ sessionId }: { sessionId: string }) => {
  const { createPortalSession, isLoading } = useStripe()

  const handleManageBilling = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createPortalSession()
    } catch (error) {
      console.error('Error creating portal session:', error)
      alert('Failed to open billing portal. Please try again.')
    }
  }

  return (
    <section className="max-w-md mx-auto">
      <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/50">
        <CardContent className="p-8">
          <div className="product text-center">
            <div className="flex justify-center mb-6">
              <Logo />
            </div>
            <div className="description">
              <h3 className="text-2xl font-bold text-white mb-4">
                Subscription successful! 🎉
              </h3>
              <p className="text-gray-300 mb-6">
                Welcome to your new plan! You now have access to all premium features.
              </p>
            </div>
          </div>
          
          <form onSubmit={handleManageBilling}>
            <input
              type="hidden"
              id="session-id"
              name="session_id"
              value={sessionId}
            />
            <Button 
              id="checkout-and-portal-button" 
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              {isLoading ? 'Loading...' : 'Manage your billing information'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  )
}

// Message Component
const Message = ({ message }: { message: string }) => (
  <section className="max-w-md mx-auto">
    <Card className="bg-background-secondary/50 border-white/10">
      <CardContent className="p-8 text-center">
        <p className="text-gray-300">{message}</p>
      </CardContent>
    </Card>
  </section>
)

// Main Checkout Page Component
export default function CheckoutPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useSupabaseAuth()
  const { createCheckoutSession, isLoading } = useStripe()
  
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState(false)
  const [sessionId, setSessionId] = useState('')
  
  // Get tier and billing cycle from URL params
  const selectedTier = searchParams.get('tier') || 'premium'
  const billingCycle = (searchParams.get('cycle') as 'monthly' | 'yearly') || 'monthly'

  useEffect(() => {
    // Check to see if this is a redirect back from Checkout
    const query = new URLSearchParams(window.location.search)

    if (query.get('success')) {
      setSuccess(true)
      setSessionId(query.get('session_id') || '')
    }

    if (query.get('canceled')) {
      setSuccess(false)
      setMessage(
        "Order canceled -- continue to shop around and checkout when you're ready."
      )
    }
  }, [sessionId])

  const handleSubscribe = async () => {
    if (!user) {
      setMessage('Please log in to continue with your subscription.')
      // Redirect to login after a short delay
      setTimeout(() => {
        router.push('/auth')
      }, 2000)
      return
    }

    try {
      await createCheckoutSession(selectedTier, billingCycle)
    } catch (error) {
      console.error('Subscription error:', error)
      if (error instanceof Error && error.message.includes('Unauthorized')) {
        setMessage('Please log in to continue with your subscription.')
        setTimeout(() => {
          router.push('/auth')
        }, 2000)
      } else {
        setMessage('Failed to process subscription. Please try again.')
      }
    }
  }

  // Render appropriate component based on state
  if (!success && message === '') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background-primary to-background-secondary flex items-center justify-center p-4">
        <ProductDisplay 
          selectedTier={selectedTier}
          billingCycle={billingCycle}
          onSubscribe={handleSubscribe}
          isLoading={isLoading}
        />
      </div>
    )
  } else if (success && sessionId !== '') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background-primary to-background-secondary flex items-center justify-center p-4">
        <SuccessDisplay sessionId={sessionId} />
      </div>
    )
  } else {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background-primary to-background-secondary flex items-center justify-center p-4">
        <Message message={message} />
      </div>
    )
  }
}
