'use client'

import React from 'react'
import { Check, Crown, Music, Download, Volume2, Zap } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'

const plans = [
  {
    id: 'individual',
    name: 'Premium Individual',
    price: 9.99,
    period: 'month',
    description: 'Perfect for one person',
    features: [
      'Ad-free music',
      'Unlimited skips',
      'High-quality audio (320 kbps)',
      'Offline downloads',
      'Play any song',
      'Background play',
    ],
    popular: true,
  },
  {
    id: 'family',
    name: 'Premium Family',
    price: 15.99,
    period: 'month',
    description: 'Up to 6 accounts',
    features: [
      'All Individual features',
      '6 Premium accounts',
      'Family-friendly playlists',
      'Individual libraries',
      'Parental controls',
      'Block explicit content',
    ],
    popular: false,
  },
  {
    id: 'student',
    name: 'Premium Student',
    price: 4.99,
    period: 'month',
    description: 'Special price for students',
    features: [
      'All Individual features',
      'Student discount',
      'Hulu included (US only)',
      'Valid student ID required',
      'Annual verification',
    ],
    popular: false,
  },
]

const benefits = [
  {
    icon: Music,
    title: 'Ad-Free Music',
    description: 'Enjoy uninterrupted listening with no ads between songs',
  },
  {
    icon: Download,
    title: 'Offline Listening',
    description: 'Download your favorite music and listen anywhere, anytime',
  },
  {
    icon: Volume2,
    title: 'High-Quality Audio',
    description: 'Experience crystal-clear sound with 320 kbps audio quality',
  },
  {
    icon: Zap,
    title: 'Unlimited Skips',
    description: 'Skip any song, any time. No limits on your listening experience',
  },
]

export default function PremiumPage() {
  const [selectedPlan, setSelectedPlan] = React.useState('individual')

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Crown className="w-8 h-8 text-accent-400" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
            MusicStream Premium
          </h1>
        </div>
        <p className="text-xl text-foreground-secondary max-w-2xl mx-auto">
          Unlock the full potential of your music experience. No ads, unlimited skips, and high-quality audio.
        </p>
      </div>

      {/* Benefits */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {benefits.map((benefit) => (
          <Card key={benefit.title} className="text-center">
            <CardContent>
              <div className="w-12 h-12 bg-primary-600/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <benefit.icon className="w-6 h-6 text-primary-400" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{benefit.title}</h3>
              <p className="text-sm text-foreground-muted">{benefit.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Plans */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground text-center">Choose Your Plan</h2>
        
        <div className="grid lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative ${plan.popular ? 'border-primary-500 shadow-lg shadow-primary-500/25' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </div>
                </div>
              )}
              
              <CardContent>
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-foreground mb-2">{plan.name}</h3>
                  <p className="text-foreground-muted mb-4">{plan.description}</p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-3xl font-bold text-foreground">${plan.price}</span>
                    <span className="text-foreground-muted">/{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-success-400 flex-shrink-0" />
                      <span className="text-sm text-foreground-secondary">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={plan.popular ? 'primary' : 'outline'}
                  className="w-full"
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  Get {plan.name}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Free Trial CTA */}
      <Card className="bg-gradient-to-r from-primary-600/20 to-accent-600/20 border-primary-500/30">
        <CardContent className="text-center">
          <h3 className="text-2xl font-bold text-foreground mb-2">
            Try Premium Free for 30 Days
          </h3>
          <p className="text-foreground-secondary mb-6">
            Cancel anytime. No ads, unlimited skips, and offline listening included.
          </p>
          <Button variant="primary" size="lg" className="shadow-lg">
            Start Free Trial
          </Button>
          <p className="text-xs text-foreground-muted mt-4">
            Free trial available for new users only. $9.99/month after trial.
          </p>
        </CardContent>
      </Card>

      {/* FAQ */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground text-center">Frequently Asked Questions</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          {[
            {
              question: 'Can I cancel anytime?',
              answer: 'Yes, you can cancel your subscription at any time. Your Premium benefits will continue until your next billing date.',
            },
            {
              question: 'What payment methods do you accept?',
              answer: 'We accept all major credit cards, PayPal, and other local payment methods depending on your country.',
            },
            {
              question: 'How many devices can I use?',
              answer: 'You can listen on any device, but you can only stream on one device at a time with an Individual plan.',
            },
            {
              question: 'Do you offer student discounts?',
              answer: 'Yes! Students with a valid .edu email or student verification can get Premium for $4.99/month.',
            },
          ].map((faq, index) => (
            <Card key={index}>
              <CardContent>
                <h4 className="font-semibold text-foreground mb-2">{faq.question}</h4>
                <p className="text-foreground-secondary text-sm">{faq.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}