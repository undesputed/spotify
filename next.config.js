/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['images.pexels.com', 'i.scdn.co', 'mosaic.scdn.co'],
  },
  env: {
    NEXTAUTH_URL: process.env.NODE_ENV === 'production' ? 'https://your-domain.com' : 'http://localhost:3000',
  }
}

module.exports = nextConfig