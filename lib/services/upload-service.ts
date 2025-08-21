import { supabaseService } from '@/lib/supabase/service'
import { createClient } from '@/lib/supabase/client'

// Types for upload system
export interface UploadMetadata {
  title: string
  artists: string[]
  album?: string
  genre?: string
  language?: string
  explicit: boolean
  isrc?: string
  release_date?: string
  license: string
  license_type: 'cc-by' | 'cc-by-sa' | 'public_domain' | 'commercial'
  attribution?: string
  commercial_use: boolean
}

export interface UploadProgress {
  uploadId: number
  status: 'uploading' | 'processing' | 'completed' | 'failed' | 'rejected'
  progress: number // 0-100
  error?: string
}

export class UploadService {
  private supabase = createClient()

  // Start upload process
  async startUpload(
    file: File, 
    metadata: UploadMetadata, 
    userId: string
  ): Promise<{ uploadId: number; uploadUrl: string }> {
    try {
      // 1. Create upload record
      const { data: upload, error: uploadError } = await this.supabase
        .from('uploads')
        .insert({
          user_id: userId,
          original_filename: file.name,
          file_size: file.size,
          status: 'uploading'
        })
        .select()
        .single()

      if (uploadError) throw uploadError

      // 2. Generate signed upload URL
      const fileName = `${userId}/${upload.id}/${file.name}`
      const { data: uploadUrl, error: urlError } = await this.supabase.storage
        .from('audio-uploads')
        .createSignedUploadUrl(fileName)

      if (urlError) throw urlError

      return {
        uploadId: upload.id,
        uploadUrl: uploadUrl.signedUrl
      }
    } catch (error) {
      console.error('Error starting upload:', error)
      throw error
    }
  }

  // Complete upload and start processing
  async completeUpload(uploadId: number): Promise<void> {
    try {
      // 1. Update upload status
      await this.supabase
        .from('uploads')
        .update({ status: 'processing' })
        .eq('id', uploadId)

      // 2. Create processing job
      await this.supabase
        .from('processing_jobs')
        .insert({
          upload_id: uploadId,
          job_type: 'transcode',
          status: 'pending'
        })

      // 3. Trigger processing (in a real app, this would be a background job)
      // For now, we'll simulate processing
      setTimeout(() => this.processUpload(uploadId), 2000)
    } catch (error) {
      console.error('Error completing upload:', error)
      throw error
    }
  }

  // Process uploaded audio file
  private async processUpload(uploadId: number): Promise<void> {
    try {
      // 1. Get upload details
      const { data: upload } = await this.supabase
        .from('uploads')
        .select('*')
        .eq('id', uploadId)
        .single()

      if (!upload) throw new Error('Upload not found')

      // 2. Update job status
      await this.supabase
        .from('processing_jobs')
        .update({ 
          status: 'processing',
          started_at: new Date().toISOString()
        })
        .eq('upload_id', uploadId)
        .eq('job_type', 'transcode')

      // 3. Simulate audio processing (in real app, this would use FFmpeg)
      // - Extract metadata
      // - Transcode to MP3
      // - Generate waveforms
      // - Create HLS manifest
      
      // For now, we'll simulate successful processing
      await new Promise(resolve => setTimeout(resolve, 3000))

      // 4. Create content item and source
      await this.createContentFromUpload(uploadId)

      // 5. Update job status
      await this.supabase
        .from('processing_jobs')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('upload_id', uploadId)
        .eq('job_type', 'transcode')

      // 6. Update upload status
      await this.supabase
        .from('uploads')
        .update({ status: 'completed' })
        .eq('id', uploadId)

    } catch (error) {
      console.error('Error processing upload:', error)
      
      // Update status to failed
      await this.supabase
        .from('uploads')
        .update({ 
          status: 'failed',
          error: error instanceof Error ? error.message : 'Processing failed'
        })
        .eq('id', uploadId)

      await this.supabase
        .from('processing_jobs')
        .update({ 
          status: 'failed',
          error: error instanceof Error ? error.message : 'Processing failed'
        })
        .eq('upload_id', uploadId)
        .eq('job_type', 'transcode')
    }
  }

  // Create content item and source from upload
  private async createContentFromUpload(uploadId: number): Promise<void> {
    try {
      // 1. Get upload with metadata
      const { data: upload } = await this.supabase
        .from('uploads')
        .select('*')
        .eq('id', uploadId)
        .single()

      if (!upload) throw new Error('Upload not found')

      // 2. Create content item
      const { data: contentItem, error: contentError } = await this.supabase
        .from('content_items')
        .insert({
          title: upload.metadata?.title || 'Untitled',
          artists: upload.metadata?.artists || ['Unknown Artist'],
          album: upload.metadata?.album,
          duration_ms: upload.duration_ms,
          genre: upload.metadata?.genre,
          language: upload.metadata?.language,
          explicit: upload.metadata?.explicit || false,
          isrc: upload.metadata?.isrc,
          release_date: upload.metadata?.release_date,
          thumbnails: {
            small: '', // Will be generated from audio waveform
            medium: '',
            large: ''
          }
        })
        .select()
        .single()

      if (contentError) throw contentError

      // 3. Create source
      const storageKey = `${upload.user_id}/${upload.id}/${upload.original_filename}`
      const { data: source, error: sourceError } = await this.supabase
        .from('sources')
        .insert({
          content_item_id: contentItem.id,
          kind: 'artist_uploaded',
          storage_key: storageKey,
          license: upload.metadata?.license || 'commercial',
          bitrate: 192000, // 192 kbps
          format: 'mp3',
          status: 'pending_review',
          uploaded_by: upload.user_id
        })
        .select()
        .single()

      if (sourceError) throw sourceError

      // 4. Create license record
      if (upload.metadata?.license_type) {
        await this.supabase
          .from('licenses')
          .insert({
            source_id: source.id,
            license_type: upload.metadata.license_type,
            attribution: upload.metadata.attribution,
            commercial_use: upload.metadata.commercial_use || false
          })
      }

    } catch (error) {
      console.error('Error creating content from upload:', error)
      throw error
    }
  }

  // Get upload progress
  async getUploadProgress(uploadId: number): Promise<UploadProgress> {
    try {
      const { data: upload } = await this.supabase
        .from('uploads')
        .select('*')
        .eq('id', uploadId)
        .single()

      if (!upload) throw new Error('Upload not found')

      let progress = 0
      switch (upload.status) {
        case 'uploading':
          progress = 25
          break
        case 'processing':
          progress = 75
          break
        case 'completed':
          progress = 100
          break
        case 'failed':
        case 'rejected':
          progress = 0
          break
      }

      return {
        uploadId: upload.id,
        status: upload.status,
        progress,
        error: upload.error
      }
    } catch (error) {
      console.error('Error getting upload progress:', error)
      throw error
    }
  }

  // Get user's uploads
  async getUserUploads(userId: string): Promise<any[]> {
    try {
      const { data: uploads } = await this.supabase
        .from('uploads')
        .select(`
          *,
          content_items(*),
          sources(*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      return uploads || []
    } catch (error) {
      console.error('Error getting user uploads:', error)
      return []
    }
  }

  // Approve upload (admin function)
  async approveUpload(sourceId: number, adminUserId: string): Promise<void> {
    try {
      // Check if user is admin
      const { data: user } = await this.supabase
        .from('users')
        .select('role')
        .eq('id', adminUserId)
        .single()

      if (user?.role !== 'admin') {
        throw new Error('Unauthorized: Admin access required')
      }

      // Update source status
      await this.supabase
        .from('sources')
        .update({ status: 'active' })
        .eq('id', sourceId)

    } catch (error) {
      console.error('Error approving upload:', error)
      throw error
    }
  }

  // Reject upload (admin function)
  async rejectUpload(sourceId: number, adminUserId: string, reason: string): Promise<void> {
    try {
      // Check if user is admin
      const { data: user } = await this.supabase
        .from('users')
        .select('role')
        .eq('id', adminUserId)
        .single()

      if (user?.role !== 'admin') {
        throw new Error('Unauthorized: Admin access required')
      }

      // Update source status
      await this.supabase
        .from('sources')
        .update({ status: 'blocked' })
        .eq('id', sourceId)

      // Create report
      await this.supabase
        .from('reports')
        .insert({
          source_id: sourceId,
          reason: 'Admin rejection',
          description: reason,
          status: 'resolved',
          reviewed_by: adminUserId,
          reviewed_at: new Date().toISOString()
        })

    } catch (error) {
      console.error('Error rejecting upload:', error)
      throw error
    }
  }

  // Get signed URL for audio playback
  async getAudioUrl(storageKey: string): Promise<string> {
    try {
      const { data } = await this.supabase.storage
        .from('audio-uploads')
        .createSignedUrl(storageKey, 3600) // 1 hour expiry

      return data?.signedUrl || ''
    } catch (error) {
      console.error('Error getting audio URL:', error)
      throw error
    }
  }

  // Extract metadata from audio file (simplified)
  async extractMetadata(file: File): Promise<Partial<UploadMetadata>> {
    // In a real implementation, you would use a library like music-metadata
    // For now, we'll return basic info
    return {
      title: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
      artists: ['Unknown Artist'],
      explicit: false,
      license: 'commercial',
      license_type: 'commercial',
      commercial_use: true
    }
  }

  // Validate upload
  validateUpload(file: File, metadata: UploadMetadata): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    // File validation
    const maxSize = 100 * 1024 * 1024 // 100MB
    if (file.size > maxSize) {
      errors.push('File size must be less than 100MB')
    }

    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/mp3']
    if (!allowedTypes.includes(file.type)) {
      errors.push('File must be MP3, WAV, or FLAC')
    }

    // Metadata validation
    if (!metadata.title?.trim()) {
      errors.push('Title is required')
    }

    if (!metadata.artists?.length || !metadata.artists[0]?.trim()) {
      errors.push('At least one artist is required')
    }

    if (!metadata.license) {
      errors.push('License is required')
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }
}

// Export singleton instance
export const uploadService = new UploadService()
