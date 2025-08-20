import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'MusicStream - Your Music, Everywhere',
  description: 'Stream millions of songs with high quality audio, personalized recommendations, and seamless playback across all your devices.',
  keywords: 'music, streaming, songs, artists, albums, playlists, audio',
  authors: [{ name: 'MusicStream' }],
  creator: 'MusicStream',
  publisher: 'MusicStream',
  robots: 'index,follow',
  openGraph: {
    title: 'MusicStream - Your Music, Everywhere',
    description: 'Stream millions of songs with high quality audio, personalized recommendations, and seamless playback across all your devices.',
    type: 'website',
    locale: 'en_US',
    siteName: 'MusicStream',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MusicStream - Your Music, Everywhere',
    description: 'Stream millions of songs with high quality audio, personalized recommendations, and seamless playback across all your devices.',
  },
  manifest: '/manifest.json',
  themeColor: '#7c3aed',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}