'use client'

import React from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Crown } from 'lucide-react'

export default function CheckoutTestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background-primary to-background-secondary flex items-center justify-center p-4">
      <Card className="bg-background-secondary/50 border-white/10 max-w-md w-full">
        <CardContent className="p-8 text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
              <Crown className="w-6 h-6 text-white" />
            </div>
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Test Checkout Flow</h2>
            <p className="text-gray-300 mb-6">
              Test the Stripe checkout integration with different plans and billing cycles.
            </p>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={() => window.location.href = '/checkout?tier=premium&cycle=monthly'}
              className="w-full bg-primary-600 hover:bg-primary-700"
            >
              Test Premium Monthly
            </Button>
            
            <Button 
              onClick={() => window.location.href = '/checkout?tier=premium&cycle=yearly'}
              className="w-full bg-primary-600 hover:bg-primary-700"
            >
              Test Premium Yearly
            </Button>
            
            <Button 
              onClick={() => window.location.href = '/checkout?tier=pro&cycle=monthly'}
              className="w-full bg-accent-600 hover:bg-accent-700"
            >
              Test Pro Monthly
            </Button>
            
            <Button 
              onClick={() => window.location.href = '/checkout?tier=pro&cycle=yearly'}
              className="w-full bg-accent-600 hover:bg-accent-700"
            >
              Test Pro Yearly
            </Button>
          </div>

          <div className="pt-4 border-t border-white/10">
            <Button 
              onClick={() => window.location.href = '/subscription'}
              variant="outline"
              className="w-full border-white/20 text-white hover:bg-white/10"
            >
              Back to Subscription Page
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
