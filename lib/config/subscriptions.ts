import { SubscriptionTier, Platform } from '@/lib/types/subscription'

export const SUBSCRIPTION_TIERS: SubscriptionTier[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    billingCycle: 'monthly',
    platformLimit: 1,
    features: [
      'Access to 1 music platform',
      'Basic music discovery',
      'Standard audio quality',
      'Ad-supported experience'
    ]
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 9.99,
    billingCycle: 'monthly',
    platformLimit: 3,
    features: [
      'Access to 3 music platforms',
      'Advanced music discovery',
      'High-quality audio',
      'Ad-free experience',
      'Offline downloads',
      'Priority support'
    ],
    popular: true
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 19.99,
    billingCycle: 'monthly',
    platformLimit: 5,
    features: [
      'Access to 5 music platforms',
      'Unlimited music discovery',
      'Lossless audio quality',
      'Ad-free experience',
      'Unlimited offline downloads',
      'Priority support',
      'Early access to features',
      'Custom playlists'
    ]
  }
]

export const AVAILABLE_PLATFORMS: Platform[] = [
  {
    id: 'spotify',
    name: 'Spotify',
    description: 'Access millions of songs, podcasts, and playlists from Spotify',
    icon: '🎵',
    color: '#1DB954',
    features: [
      'Access to Spotify library',
      'Create and sync playlists',
      'Discover new music',
      'Follow artists and friends'
    ],
    isAvailable: true,
    requiresAuth: true
  },
  {
    id: 'youtube_music',
    name: 'YouTube Music',
    description: 'Stream music videos and audio from YouTube Music',
    icon: '📺',
    color: '#FF0000',
    features: [
      'Access to YouTube Music library',
      'Music video streaming',
      'Background audio playback',
      'Personalized recommendations'
    ],
    isAvailable: true,
    requiresAuth: true
  },
  {
    id: 'apple_music',
    name: 'Apple Music',
    description: 'Stream over 100 million songs with Apple Music',
    icon: '🍎',
    color: '#FA243C',
    features: [
      'Access to Apple Music library',
      'Spatial audio support',
      'Lyrics and music videos',
      'Radio stations'
    ],
    isAvailable: false, // Coming soon
    requiresAuth: true
  },
  {
    id: 'tidal',
    name: 'Tidal',
    description: 'High-fidelity music streaming with Tidal',
    icon: '🌊',
    color: '#000000',
    features: [
      'Lossless audio quality',
      'Exclusive content',
      'Music videos',
      'Artist interviews'
    ],
    isAvailable: false, // Coming soon
    requiresAuth: true
  },
  {
    id: 'deezer',
    name: 'Deezer',
    description: 'Discover and stream music with Deezer',
    icon: '🎧',
    color: '#00C7F2',
    features: [
      'Access to Deezer library',
      'Flow personalized music',
      'Podcasts and radio',
      'Offline listening'
    ],
    isAvailable: false, // Coming soon
    requiresAuth: true
  }
]

export const getPlatformById = (id: string): Platform | undefined => {
  return AVAILABLE_PLATFORMS.find(platform => platform.id === id)
}

export const getAvailablePlatforms = (): Platform[] => {
  return AVAILABLE_PLATFORMS.filter(platform => platform.isAvailable)
}

export const getSubscriptionTierById = (id: string): SubscriptionTier | undefined => {
  return SUBSCRIPTION_TIERS.find(tier => tier.id === id)
}
