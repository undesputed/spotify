'use client'

import React, { useState } from 'react'
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth'
import { useStripe } from '@/hooks/useStripe'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { User, Mail, Calendar, Crown, Edit, Save, X, CreditCard, Settings } from 'lucide-react'

export default function ProfilePage() {
  const { user, appUser, updateProfile } = useSupabaseAuth()
  const { createPortalSession, isLoading: isStripeLoading } = useStripe()
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(appUser?.name || '')
  const [imageUrl, setImageUrl] = useState(appUser?.image_url || '')
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      await updateProfile({
        name: name.trim() || undefined,
        image_url: imageUrl.trim() || undefined,
      })
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setName(appUser?.name || '')
    setImageUrl(appUser?.image_url || '')
    setIsEditing(false)
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in to view your profile</h1>
          <Button onClick={() => window.location.href = '/auth'}>
            Sign In
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Profile</h1>
        {!isEditing && (
          <Button
            variant="ghost"
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            Edit Profile
          </Button>
        )}
      </div>

      {/* Profile Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {appUser?.image_url ? (
                <img
                  src={appUser.image_url}
                  alt={appUser.name}
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <div className="w-24 h-24 bg-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {appUser?.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 space-y-4">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Profile Image URL</label>
                    <Input
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="Enter image URL"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Name</label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSave}
                      disabled={loading}
                      className="flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={handleCancel}
                      disabled={loading}
                      className="flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-2xl font-semibold">
                      {appUser?.name || 'User'}
                    </h2>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-foreground-secondary">
                      <Mail className="w-4 h-4" />
                      <span>{user.email}</span>
                    </div>
                    
                    <div className="flex items-center gap-3 text-foreground-secondary">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Member since {new Date(user.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-3 text-foreground-secondary">
                      <Crown className="w-4 h-4" />
                      <span>
                        {appUser?.is_premium ? 'Premium Member' : 'Free Member'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Management */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">Subscription Management</h3>
            <Button
              onClick={createPortalSession}
              disabled={isStripeLoading}
              className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700"
            >
              <CreditCard className="w-4 h-4" />
              {isStripeLoading ? 'Loading...' : 'Manage Billing'}
            </Button>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-white/10">
              <span className="text-foreground-secondary">Current Plan</span>
              <span className="font-semibold">
                {appUser?.is_premium ? 'Premium' : 'Free'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-white/10">
              <span className="text-foreground-secondary">Platform Limit</span>
              <span>
                {appUser?.is_premium ? '3 platforms' : '1 platform'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-foreground-secondary">Status</span>
              <span className={appUser?.is_premium ? 'text-green-400' : 'text-gray-400'}>
                {appUser?.is_premium ? 'Active' : 'Free Tier'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Info */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold mb-4">Account Information</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-white/10">
              <span className="text-foreground-secondary">User ID</span>
              <span className="font-mono text-sm">{user.id}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-white/10">
              <span className="text-foreground-secondary">Email Verified</span>
              <span className={user.email_confirmed_at ? 'text-green-400' : 'text-red-400'}>
                {user.email_confirmed_at ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-white/10">
              <span className="text-foreground-secondary">Last Sign In</span>
              <span>
                {user.last_sign_in_at 
                  ? new Date(user.last_sign_in_at).toLocaleString()
                  : 'Never'
                }
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-foreground-secondary">Account Created</span>
              <span>{new Date(user.created_at).toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
