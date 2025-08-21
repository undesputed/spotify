import { stripe, STRIPE_PRODUCTS } from '@/lib/stripe/config'
import { subscriptionService } from './subscription-service'
import { supabaseService } from '@/lib/supabase/service'

export interface CreateCheckoutSessionParams {
  userId: string
  tierId: string
  billingCycle: 'monthly' | 'yearly'
  successUrl: string
  cancelUrl: string
}

export interface CreatePortalSessionParams {
  userId: string
  returnUrl: string
}

class StripeService {
  // Create a Stripe checkout session for subscription
  async createCheckoutSession({
    userId,
    tierId,
    billingCycle,
    successUrl,
    cancelUrl
  }: CreateCheckoutSessionParams) {
    try {
      // Get or create Stripe customer
      const customer = await this.getOrCreateCustomer(userId)
      
      // Get the appropriate price ID
      const priceId = this.getPriceId(tierId, billingCycle)
      if (!priceId) {
        throw new Error('Invalid tier or billing cycle')
      }

      // Create checkout session
      const session = await stripe.checkout.sessions.create({
        customer: customer.id,
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          userId,
          tierId,
          billingCycle,
        },
        subscription_data: {
          metadata: {
            userId,
            tierId,
            billingCycle,
          },
        },
      })

      return session
    } catch (error) {
      console.error('Error creating checkout session:', error)
      throw error
    }
  }

  // Create a customer portal session for subscription management
  async createPortalSession({ userId, returnUrl }: CreatePortalSessionParams) {
    try {
      const customer = await this.getOrCreateCustomer(userId)
      
      const session = await stripe.billingPortal.sessions.create({
        customer: customer.id,
        return_url: returnUrl,
      })

      return session
    } catch (error) {
      console.error('Error creating portal session:', error)
      throw error
    }
  }

  // Get or create a Stripe customer
  async getOrCreateCustomer(userId: string) {
    try {
      // Check if customer already exists in our database
      const { data: existingCustomer } = await supabaseService.supabase
        .from('stripe_customers')
        .select('stripe_customer_id')
        .eq('user_id', userId)
        .single()

      if (existingCustomer?.stripe_customer_id) {
        // Return existing customer
        return await stripe.customers.retrieve(existingCustomer.stripe_customer_id)
      }

      // Get user data from Supabase auth first
      const { data: { user: authUser } } = await supabaseService.supabase.auth.getUser()
      
      if (!authUser) {
        throw new Error('User not authenticated')
      }

      // Try to get user data from users table, create if doesn't exist
      let { data: user } = await supabaseService.supabase
        .from('users')
        .select('email, name')
        .eq('id', userId)
        .single()

      if (!user) {
        // Create user in users table
        const { data: newUser, error: createError } = await supabaseService.supabase
          .from('users')
          .insert({
            id: userId,
            email: authUser.email,
            name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select('email, name')
          .single()

        if (createError) {
          console.error('Error creating user:', createError)
          // Use auth user data as fallback
          user = {
            email: authUser.email || '',
            name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User'
          }
        } else {
          user = newUser
        }
      }

      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId,
        },
      })

      // Save customer ID to our database
      await supabaseService.supabase
        .from('stripe_customers')
        .insert({
          user_id: userId,
          stripe_customer_id: customer.id,
          email: user.email,
        })

      return customer
    } catch (error) {
      console.error('Error getting or creating customer:', error)
      throw error
    }
  }

  // Get price ID for tier and billing cycle
  getPriceId(tierId: string, billingCycle: 'monthly' | 'yearly'): string | null {
    if (tierId === 'free') return null
    
    const tier = STRIPE_PRODUCTS[tierId as keyof typeof STRIPE_PRODUCTS]
    if (!tier) return null

    return tier[billingCycle]
  }

  // Handle webhook events
  async handleWebhookEvent(event: any) {
    try {
      switch (event.type) {
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          await this.handleSubscriptionChange(event.data.object)
          break
        case 'customer.subscription.deleted':
          await this.handleSubscriptionCancellation(event.data.object)
          break
        case 'invoice.payment_succeeded':
          await this.handlePaymentSucceeded(event.data.object)
          break
        case 'invoice.payment_failed':
          await this.handlePaymentFailed(event.data.object)
          break
        default:
          console.log(`Unhandled event type: ${event.type}`)
      }
    } catch (error) {
      console.error('Error handling webhook event:', error)
      throw error
    }
  }

  // Handle subscription creation/update
  async handleSubscriptionChange(subscription: any) {
    const userId = subscription.metadata?.userId
    const tierId = subscription.metadata?.tierId
    const billingCycle = subscription.metadata?.billingCycle

    if (!userId || !tierId) {
      console.error('Missing metadata in subscription:', subscription)
      return
    }

    // Update or create subscription in our database
    await subscriptionService.createSubscription(userId, tierId)
    
    // Update subscription with Stripe data
    await supabaseService.supabase
      .from('user_subscriptions')
      .update({
        stripe_subscription_id: subscription.id,
        stripe_price_id: subscription.items.data[0]?.price.id,
        billing_cycle: billingCycle,
        next_billing_date: new Date(subscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
      })
      .eq('user_id', userId)
  }

  // Handle subscription cancellation
  async handleSubscriptionCancellation(subscription: any) {
    const userId = subscription.metadata?.userId
    
    if (!userId) {
      console.error('Missing userId in subscription cancellation:', subscription)
      return
    }

    // Update subscription status in our database
    await supabaseService.supabase
      .from('user_subscriptions')
      .update({
        status: 'cancelled',
        end_date: new Date(subscription.canceled_at * 1000).toISOString(),
      })
      .eq('user_id', userId)
  }

  // Handle successful payment
  async handlePaymentSucceeded(invoice: any) {
    const subscription = invoice.subscription
    if (!subscription) return

    const userId = subscription.metadata?.userId
    if (!userId) return

    // Update subscription status if needed
    await supabaseService.supabase
      .from('user_subscriptions')
      .update({
        status: 'active',
        next_billing_date: new Date(subscription.current_period_end * 1000).toISOString(),
      })
      .eq('user_id', userId)
  }

  // Handle failed payment
  async handlePaymentFailed(invoice: any) {
    const subscription = invoice.subscription
    if (!subscription) return

    const userId = subscription.metadata?.userId
    if (!userId) return

    // Update subscription status
    await supabaseService.supabase
      .from('user_subscriptions')
      .update({
        status: 'past_due',
      })
      .eq('user_id', userId)
  }

  // Cancel subscription at period end
  async cancelSubscription(userId: string) {
    try {
      const { data: subscription } = await supabaseService.supabase
        .from('user_subscriptions')
        .select('stripe_subscription_id')
        .eq('user_id', userId)
        .single()

      if (!subscription?.stripe_subscription_id) {
        throw new Error('No active subscription found')
      }

      await stripe.subscriptions.update(subscription.stripe_subscription_id, {
        cancel_at_period_end: true,
      })

      // Update our database
      await supabaseService.supabase
        .from('user_subscriptions')
        .update({
          cancel_at_period_end: true,
        })
        .eq('user_id', userId)

      return true
    } catch (error) {
      console.error('Error canceling subscription:', error)
      throw error
    }
  }

  // Reactivate subscription
  async reactivateSubscription(userId: string) {
    try {
      const { data: subscription } = await supabaseService.supabase
        .from('user_subscriptions')
        .select('stripe_subscription_id')
        .eq('user_id', userId)
        .single()

      if (!subscription?.stripe_subscription_id) {
        throw new Error('No subscription found')
      }

      await stripe.subscriptions.update(subscription.stripe_subscription_id, {
        cancel_at_period_end: false,
      })

      // Update our database
      await supabaseService.supabase
        .from('user_subscriptions')
        .update({
          cancel_at_period_end: false,
        })
        .eq('user_id', userId)

      return true
    } catch (error) {
      console.error('Error reactivating subscription:', error)
      throw error
    }
  }
}

export const stripeService = new StripeService()
