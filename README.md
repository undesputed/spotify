# Spotify Clone - Next.js

A modern Spotify clone built with Next.js 15, featuring server-side rendering (SSR), static site generation (SSG), and a beautiful, responsive UI.

## Features

- 🎵 **Music Streaming Interface** - Beautiful UI inspired by Spotify
- ⚡ **Next.js 15** - Latest features including App Router, Server Components, and more
- 🔄 **SSR & SSG** - Server-side rendering and static site generation for optimal performance
- 🎨 **Modern UI** - Built with Tailwind CSS and Framer Motion
- 🔐 **Authentication** - NextAuth.js integration
- 🎧 **Audio Player** - Custom audio player with keyboard shortcuts
- 📱 **Responsive Design** - Works perfectly on all devices
- 🎯 **TypeScript** - Full type safety throughout the application
- 🔍 **React Query** - Efficient data fetching and caching

## Tech Stack

- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Authentication**: NextAuth.js
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd spotify
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── (shell)/           # Shell layout group
│   │   ├── downloads/     # Downloads page
│   │   ├── library/       # Library page
│   │   ├── premium/       # Premium page
│   │   ├── search/        # Search page
│   │   ├── layout.tsx     # Shell layout
│   │   └── page.tsx       # Home page
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── providers.tsx      # App providers
├── components/            # Reusable components
│   ├── media/            # Media components
│   ├── navigation/       # Navigation components
│   ├── player/           # Audio player components
│   ├── sections/         # Section components
│   └── ui/               # UI components
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
└── public/               # Static assets
```

## Next.js Features Used

- **App Router** - File-based routing with layouts
- **Server Components** - Default server-side rendering
- **Client Components** - Interactive components with 'use client'
- **Metadata API** - SEO optimization
- **Image Optimization** - Next.js Image component
- **API Routes** - Backend API endpoints
- **Middleware** - Request/response processing

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
