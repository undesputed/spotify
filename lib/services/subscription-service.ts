import { supabaseService } from '@/lib/supabase/service'
import { UserSubscription, PlatformConnection } from '@/lib/types/subscription'
import { getSubscriptionTierById, SUBSCRIPTION_TIERS } from '@/lib/config/subscriptions'

class SubscriptionService {
  // Get user's current subscription
  async getUserSubscription(userId: string): Promise<UserSubscription | null> {
    try {
      const { data, error } = await supabaseService.supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single()

      if (error) {
        console.error('Error fetching user subscription:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in getUserSubscription:', error)
      return null
    }
  }

  // Create or update user subscription
  async createSubscription(userId: string, tierId: string): Promise<UserSubscription | null> {
    try {
      const tier = getSubscriptionTierById(tierId)
      if (!tier) {
        throw new Error('Invalid subscription tier')
      }

      const subscription: Partial<UserSubscription> = {
        user_id: userId,
        tier_id: tierId,
        status: 'active',
        start_date: new Date().toISOString(),
        platform_limit: tier.platformLimit,
        connected_platforms: []
      }

      const { data, error } = await supabaseService.supabase
        .from('user_subscriptions')
        .upsert(subscription, { onConflict: 'user_id' })
        .select()
        .single()

      if (error) {
        console.error('Error creating subscription:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in createSubscription:', error)
      return null
    }
  }

  // Get user's platform connections
  async getUserPlatformConnections(userId: string): Promise<PlatformConnection[]> {
    try {
      const { data, error } = await supabaseService.supabase
        .from('platform_connections')
        .select('*')
        .eq('user_id', userId)

      if (error) {
        console.error('Error fetching platform connections:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getUserPlatformConnections:', error)
      return []
    }
  }

  // Connect a platform for a user
  async connectPlatform(userId: string, platformId: string, metadata?: Record<string, any>): Promise<PlatformConnection | null> {
    try {
      const connection: Partial<PlatformConnection> = {
        user_id: userId,
        platform_id: platformId,
        status: 'connected',
        connected_at: new Date().toISOString(),
        metadata
      }

      const { data, error } = await supabaseService.supabase
        .from('platform_connections')
        .upsert(connection, { onConflict: 'user_id,platform_id' })
        .select()
        .single()

      if (error) {
        console.error('Error connecting platform:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in connectPlatform:', error)
      return null
    }
  }

  // Disconnect a platform for a user
  async disconnectPlatform(userId: string, platformId: string): Promise<boolean> {
    try {
      const { error } = await supabaseService.supabase
        .from('platform_connections')
        .update({
          status: 'disconnected',
          disconnected_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('platform_id', platformId)

      if (error) {
        console.error('Error disconnecting platform:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in disconnectPlatform:', error)
      return false
    }
  }

  // Check if user can connect more platforms
  async canConnectPlatform(userId: string): Promise<{ canConnect: boolean; currentCount: number; limit: number }> {
    try {
      const subscription = await this.getUserSubscription(userId)
      const connections = await this.getUserPlatformConnections(userId)
      
      const connectedCount = connections.filter(c => c.status === 'connected').length
      const limit = subscription?.platform_limit || SUBSCRIPTION_TIERS[0].platformLimit

      return {
        canConnect: connectedCount < limit,
        currentCount: connectedCount,
        limit
      }
    } catch (error) {
      console.error('Error in canConnectPlatform:', error)
      return {
        canConnect: false,
        currentCount: 0,
        limit: 1
      }
    }
  }

  // Get user's subscription tier info
  async getUserTierInfo(userId: string): Promise<{ tier: any; connections: PlatformConnection[] } | null> {
    try {
      const subscription = await this.getUserSubscription(userId)
      const connections = await this.getUserPlatformConnections(userId)

      if (!subscription) {
        return {
          tier: SUBSCRIPTION_TIERS[0], // Free tier
          connections: []
        }
      }

      const tier = getSubscriptionTierById(subscription.tier_id)
      if (!tier) {
        return null
      }

      return {
        tier,
        connections
      }
    } catch (error) {
      console.error('Error in getUserTierInfo:', error)
      return null
    }
  }

  // Update user's platform selection
  async updateUserPlatforms(userId: string, platformIds: string[]): Promise<boolean> {
    try {
      const { error } = await supabaseService.supabase
        .from('users')
        .update({ platforms: platformIds })
        .eq('id', userId)

      if (error) {
        console.error('Error updating user platforms:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in updateUserPlatforms:', error)
      return false
    }
  }
}

export const subscriptionService = new SubscriptionService()
