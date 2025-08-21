import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { AuthDebug } from '@/components/debug/AuthDebug'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Music Central - Your Music, Everywhere',
  description: 'Stream millions of songs with high quality audio, personalized recommendations, and seamless playback across all your devices.',
  keywords: 'music, streaming, songs, artists, albums, playlists, audio',
  authors: [{ name: 'Music Central' }],
  creator: 'Music Central',
  publisher: 'Music Central',
  robots: 'index,follow',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    title: 'Music Central - Your Music, Everywhere',
    description: 'Stream millions of songs with high quality audio, personalized recommendations, and seamless playback across all your devices.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Music Central',
    images: [
      {
        url: '/logo.png',
        width: 512,
        height: 512,
        alt: 'Music Central Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Music Central - Your Music, Everywhere',
    description: 'Stream millions of songs with high quality audio, personalized recommendations, and seamless playback across all your devices.',
    images: ['/logo.png'],
  },
  manifest: '/manifest.json',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#7c3aed',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/logo.png" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <Providers>
          {children}
          <AuthDebug />
        </Providers>
      </body>
    </html>
  )
}