// Client-side Stripe configuration (only exports client-safe values)

// Stripe publishable key for client-side
export const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!

// Product and price IDs for different subscription tiers
export const STRIPE_PRODUCTS = {
  premium: {
    monthly: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_MONTHLY_PRICE_ID!,
    yearly: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_YEARLY_PRICE_ID!,
  },
  pro: {
    monthly: process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID!,
    yearly: process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID!,
  },
} as const

// Subscription status mapping
export const SUBSCRIPTION_STATUS_MAP = {
  active: 'active',
  canceled: 'cancelled',
  incomplete: 'pending',
  incomplete_expired: 'expired',
  past_due: 'past_due',
  trialing: 'trial',
  unpaid: 'expired',
} as const
