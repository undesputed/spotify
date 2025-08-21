export interface SubscriptionTier {
  id: string
  name: string
  price: number
  billingCycle: 'monthly' | 'yearly'
  platformLimit: number
  features: string[]
  popular?: boolean
}

export interface Platform {
  id: string
  name: string
  description: string
  icon: string
  color: string
  features: string[]
  isAvailable: boolean
  requiresAuth: boolean
}

export interface UserSubscription {
  id: string
  userId: string
  tierId: string
  status: 'active' | 'cancelled' | 'expired' | 'trial' | 'past_due' | 'pending'
  startDate: string
  endDate?: string
  platformLimit: number
  connectedPlatforms: string[]
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  stripePriceId?: string
  billingCycle: 'monthly' | 'yearly'
  nextBillingDate?: string
  cancelAtPeriodEnd?: boolean
}

export interface PlatformConnection {
  id: string
  userId: string
  platformId: string
  status: 'connected' | 'disconnected' | 'pending'
  connectedAt?: string
  disconnectedAt?: string
  metadata?: Record<string, any>
}
