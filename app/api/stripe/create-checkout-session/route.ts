import { NextRequest, NextResponse } from 'next/server'
import { stripeService } from '@/lib/services/stripe-service'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { tierId, billingCycle } = await request.json()

    // Get user from session
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Validate input
    if (!tierId || !billingCycle) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!['monthly', 'yearly'].includes(billingCycle)) {
      return NextResponse.json(
        { error: 'Invalid billing cycle' },
        { status: 400 }
      )
    }

    if (!['premium', 'pro'].includes(tierId)) {
      return NextResponse.json(
        { error: 'Invalid tier' },
        { status: 400 }
      )
    }

    // Create checkout session
    const session = await stripeService.createCheckoutSession({
      userId: user.id,
      tierId,
      billingCycle,
      successUrl: `${request.nextUrl.origin}/checkout?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${request.nextUrl.origin}/checkout?canceled=true`,
    })

    return NextResponse.json({ sessionId: session.id })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message === 'User not authenticated') {
        return NextResponse.json(
          { error: 'Please log in to continue with your subscription' },
          { status: 401 }
        )
      }
      if (error.message === 'User not found') {
        return NextResponse.json(
          { error: 'User account not found. Please try logging in again' },
          { status: 404 }
        )
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to create checkout session. Please try again.' },
      { status: 500 }
    )
  }
}
