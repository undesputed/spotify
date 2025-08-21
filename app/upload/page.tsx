'use client'

import { useState, useRef } from 'react'
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth'
import { uploadService, UploadMetadata } from '@/lib/services/upload-service'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent } from '@/components/ui/Card'
import { Upload, Music, User, Album, Calendar, FileAudio, CheckCircle, AlertCircle } from 'lucide-react'

export default function UploadPage() {
  const { user, appUser } = useSupabaseAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState<string>('')
  const [uploadId, setUploadId] = useState<number | null>(null)
  const [errors, setErrors] = useState<string[]>([])

  // Form state
  const [metadata, setMetadata] = useState<UploadMetadata>({
    title: '',
    artists: [''],
    album: '',
    genre: '',
    language: 'en',
    explicit: false,
    isrc: '',
    release_date: '',
    license: 'commercial',
    license_type: 'commercial',
    attribution: '',
    commercial_use: true
  })

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setSelectedFile(file)
    setErrors([])

    // Extract basic metadata from filename
    const extractedMetadata = await uploadService.extractMetadata(file)
    setMetadata(prev => ({
      ...prev,
      ...extractedMetadata
    }))
  }

  const handleArtistChange = (index: number, value: string) => {
    const newArtists = [...metadata.artists]
    newArtists[index] = value
    setMetadata(prev => ({ ...prev, artists: newArtists }))
  }

  const addArtist = () => {
    setMetadata(prev => ({
      ...prev,
      artists: [...prev.artists, '']
    }))
  }

  const removeArtist = (index: number) => {
    if (metadata.artists.length > 1) {
      const newArtists = metadata.artists.filter((_, i) => i !== index)
      setMetadata(prev => ({ ...prev, artists: newArtists }))
    }
  }

  const handleUpload = async () => {
    if (!user || !selectedFile) return

    // Validate upload
    const validation = uploadService.validateUpload(selectedFile, metadata)
    if (!validation.valid) {
      setErrors(validation.errors)
      return
    }

    setUploading(true)
    setErrors([])

    try {
      // 1. Start upload
      const { uploadId: id, uploadUrl } = await uploadService.startUpload(
        selectedFile,
        metadata,
        user.id
      )

      setUploadId(id)
      setUploadStatus('Uploading file...')
      setUploadProgress(25)

      // 2. Upload file to Supabase Storage
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: selectedFile,
        headers: {
          'Content-Type': selectedFile.type
        }
      })

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file')
      }

      setUploadStatus('Processing audio...')
      setUploadProgress(50)

      // 3. Complete upload and start processing
      await uploadService.completeUpload(id)

      setUploadStatus('Processing completed!')
      setUploadProgress(100)

      // 4. Monitor progress
      const progressInterval = setInterval(async () => {
        try {
          const progress = await uploadService.getUploadProgress(id)
          setUploadProgress(progress.progress)
          setUploadStatus(progress.status)

          if (progress.status === 'completed') {
            clearInterval(progressInterval)
            setUploadStatus('Upload completed successfully!')
          } else if (progress.status === 'failed') {
            clearInterval(progressInterval)
            setErrors([progress.error || 'Upload failed'])
          }
        } catch (error) {
          console.error('Error checking progress:', error)
        }
      }, 2000)

    } catch (error) {
      console.error('Upload error:', error)
      setErrors([error instanceof Error ? error.message : 'Upload failed'])
    } finally {
      setUploading(false)
    }
  }

  const resetForm = () => {
    setSelectedFile(null)
    setUploadId(null)
    setUploadProgress(0)
    setUploadStatus('')
    setErrors([])
    setMetadata({
      title: '',
      artists: [''],
      album: '',
      genre: '',
      language: 'en',
      explicit: false,
      isrc: '',
      release_date: '',
      license: 'commercial',
      license_type: 'commercial',
      attribution: '',
      commercial_use: true
    })
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background-secondary p-6">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Sign In Required</h2>
              <p className="text-gray-400 mb-6">
                You need to sign in to upload your music
              </p>
              <Button onClick={() => window.location.href = '/auth'}>
                Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background-secondary p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex flex-col items-center gap-4 mb-6">
            <img 
              src="/logo.png" 
              alt="Music Central Logo" 
              className="w-20 h-20 rounded-lg object-cover"
            />
            <div>
              <h1 className="text-4xl font-bold text-white mb-4">Upload Your Music</h1>
              <p className="text-gray-300">
                Share your music with the world. Upload your tracks and reach new listeners.
              </p>
            </div>
          </div>
        </div>

        {/* Upload Form */}
        <Card>
          <CardContent className="p-8">
            <div className="space-y-8">
              {/* File Upload */}
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <FileAudio className="w-5 h-5" />
                  Audio File
                </h3>
                
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-gray-500 transition-colors">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  
                  {!selectedFile ? (
                    <div>
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-300 mb-2">
                        Drag and drop your audio file here, or click to browse
                      </p>
                      <p className="text-sm text-gray-500">
                        Supports MP3, WAV, FLAC (max 100MB)
                      </p>
                      <Button
                        variant="ghost"
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-4"
                      >
                        Choose File
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                      <p className="text-white font-medium">{selectedFile.name}</p>
                      <p className="text-sm text-gray-400">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <Button
                        variant="ghost"
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-2"
                      >
                        Change File
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Metadata Form */}
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Music className="w-5 h-5" />
                  Track Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Title */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Title *</label>
                    <Input
                      value={metadata.title}
                      onChange={(e) => setMetadata(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Track title"
                    />
                  </div>

                  {/* Artists */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Artists *</label>
                    {metadata.artists.map((artist, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <Input
                          value={artist}
                          onChange={(e) => handleArtistChange(index, e.target.value)}
                          placeholder={`Artist ${index + 1}`}
                        />
                        {metadata.artists.length > 1 && (
                          <Button
                            variant="ghost"
                            onClick={() => removeArtist(index)}
                            className="text-red-400 hover:text-red-300"
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      variant="ghost"
                      onClick={addArtist}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      + Add Artist
                    </Button>
                  </div>

                  {/* Album */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Album</label>
                    <Input
                      value={metadata.album}
                      onChange={(e) => setMetadata(prev => ({ ...prev, album: e.target.value }))}
                      placeholder="Album name"
                    />
                  </div>

                  {/* Genre */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Genre</label>
                    <Input
                      value={metadata.genre}
                      onChange={(e) => setMetadata(prev => ({ ...prev, genre: e.target.value }))}
                      placeholder="Genre"
                    />
                  </div>

                  {/* ISRC */}
                  <div>
                    <label className="block text-sm font-medium mb-2">ISRC</label>
                    <Input
                      value={metadata.isrc}
                      onChange={(e) => setMetadata(prev => ({ ...prev, isrc: e.target.value }))}
                      placeholder="ISRC code"
                    />
                  </div>

                  {/* Release Date */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Release Date</label>
                    <Input
                      type="date"
                      value={metadata.release_date}
                      onChange={(e) => setMetadata(prev => ({ ...prev, release_date: e.target.value }))}
                    />
                  </div>

                  {/* Explicit */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="explicit"
                      checked={metadata.explicit}
                      onChange={(e) => setMetadata(prev => ({ ...prev, explicit: e.target.checked }))}
                      className="rounded"
                    />
                    <label htmlFor="explicit" className="text-sm font-medium">
                      Explicit content
                    </label>
                  </div>
                </div>
              </div>

              {/* Licensing */}
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Licensing
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">License Type *</label>
                    <select
                      value={metadata.license_type}
                      onChange={(e) => setMetadata(prev => ({ 
                        ...prev, 
                        license_type: e.target.value as any,
                        license: e.target.value
                      }))}
                      className="w-full p-3 bg-background-secondary border border-gray-600 rounded-lg text-white"
                    >
                      <option value="commercial">Commercial License</option>
                      <option value="cc-by">Creative Commons Attribution</option>
                      <option value="cc-by-sa">Creative Commons Attribution-ShareAlike</option>
                      <option value="public_domain">Public Domain</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Attribution (if required)</label>
                    <Input
                      value={metadata.attribution}
                      onChange={(e) => setMetadata(prev => ({ ...prev, attribution: e.target.value }))}
                      placeholder="How you want to be credited"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="commercial_use"
                      checked={metadata.commercial_use}
                      onChange={(e) => setMetadata(prev => ({ ...prev, commercial_use: e.target.checked }))}
                      className="rounded"
                    />
                    <label htmlFor="commercial_use" className="text-sm font-medium">
                      Allow commercial use
                    </label>
                  </div>
                </div>
              </div>

              {/* Errors */}
              {errors.length > 0 && (
                <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
                  <h4 className="text-red-400 font-medium mb-2">Please fix the following errors:</h4>
                  <ul className="text-red-300 text-sm space-y-1">
                    {errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Upload Progress */}
              {uploading && (
                <div className="bg-blue-900/20 border border-blue-500/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
                    <span className="text-blue-400 font-medium">{uploadStatus}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Success Message */}
              {uploadStatus === 'Upload completed successfully!' && (
                <div className="bg-green-900/20 border border-green-500/50 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-green-400 font-medium">Upload completed successfully!</span>
                  </div>
                  <p className="text-green-300 text-sm mt-2">
                    Your track is now being reviewed. You'll be notified once it's approved.
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button
                  onClick={handleUpload}
                  disabled={!selectedFile || uploading}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {uploading ? 'Uploading...' : 'Upload Track'}
                </Button>
                
                {uploadStatus === 'Upload completed successfully!' && (
                  <Button
                    onClick={resetForm}
                    variant="ghost"
                    className="border border-gray-600"
                  >
                    Upload Another
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
