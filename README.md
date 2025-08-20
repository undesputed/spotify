# MusicStream - Music Streaming Application

A modern, responsive music streaming application built with React, TypeScript, and Vite. This application features a beautiful dark-themed UI with a complete music streaming experience.

## 🎵 Features

### Core Features
- **Modern Dark UI**: Beautiful gradient-based design with glassmorphism effects
- **Music Player**: Full-featured audio player with play/pause, skip, volume control
- **Mini Player**: Compact player bar at the bottom of the screen
- **Home Dashboard**: Curated music recommendations and trending content
- **Responsive Design**: Works seamlessly on desktop and mobile devices

### Music Discovery
- **Continue Listening**: Resume where you left off
- **Made For You**: Personalized playlists and recommendations
- **New Releases**: Latest album releases
- **Trending Now**: Popular tracks and artists
- **Discover Weekly**: Weekly curated playlists
- **Top Charts**: Current chart-topping music

### Player Features
- **Keyboard Shortcuts**: 
  - Space: Play/Pause
  - J: Previous track
  - K: Next track
  - M: Mute/Unmute
  - L: Like current track
  - Ctrl/Cmd + Arrow Keys: Seek 10 seconds
- **Media Session API**: Integration with system media controls
- **Queue Management**: Add, remove, and manage track queue
- **Volume Control**: Precise volume adjustment with visual feedback

## 🛠️ Technology Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom dark theme
- **State Management**: Zustand for global state
- **Data Fetching**: TanStack Query (React Query)
- **Icons**: Lucide React
- **UI Components**: Custom component library with class-variance-authority

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd project
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

## 📁 Project Structure

```
project/
├── src/
│   ├── App.tsx              # Main application component
│   ├── HomePage.tsx         # Home dashboard component
│   ├── App.css             # Application-specific styles
│   └── index.css           # Global styles
├── components/
│   ├── navigation/
│   │   ├── Sidebar.tsx     # Main navigation sidebar
│   │   └── TopBar.tsx      # Top navigation bar
│   ├── player/
│   │   ├── AudioPlayer.tsx # HTML5 audio element wrapper
│   │   └── MiniPlayer.tsx  # Compact player controls
│   ├── media/
│   │   └── MediaCard.tsx   # Music item display cards
│   ├── sections/
│   │   └── HorizontalRow.tsx # Horizontal scrolling sections
│   └── ui/
│       ├── Button.tsx      # Reusable button component
│       ├── Card.tsx        # Card container component
│       └── Input.tsx       # Input field component
├── hooks/
│   ├── useAuth.ts          # Authentication state management
│   └── usePlayer.ts        # Music player state management
├── lib/
│   ├── api.ts              # Mock API functions
│   ├── types.ts            # TypeScript type definitions
│   └── utils.ts            # Utility functions
└── package.json
```

## 🎨 Design System

### Color Palette
- **Primary**: Purple gradient (#7c3aed to #8b5cf6)
- **Accent**: Pink gradient (#ec4899 to #db2777)
- **Background**: Dark theme (#0a0a0a to #1a1a1a)
- **Text**: White with various opacity levels for hierarchy

### Components
- **Glassmorphism**: Semi-transparent backgrounds with backdrop blur
- **Gradients**: Smooth color transitions for visual appeal
- **Animations**: Subtle hover effects and transitions
- **Typography**: Clean, readable font hierarchy

## 🔧 Configuration

### TypeScript Path Mapping
The project uses path mapping for clean imports:
```json
{
  "paths": {
    "@/*": ["./*"]
  }
}
```

### Vite Configuration
- Path aliases configured for `@/` imports
- React plugin for JSX support
- Optimized dependencies

## 🎵 Mock Data

The application includes comprehensive mock data for:
- **Artists**: Popular musicians with follower counts
- **Albums**: Complete album information with artwork
- **Tracks**: Individual songs with metadata
- **Playlists**: Curated collections of music
- **Users**: Mock user profiles and preferences

## 🎮 Usage

### Navigation
- Use the sidebar to navigate between different sections
- Search functionality in the top bar
- User menu for account management

### Music Playback
- Click on any track to start playing
- Use the mini player controls for playback
- Keyboard shortcuts for quick control
- Volume slider for audio adjustment

### Music Discovery
- Browse different sections on the home page
- Horizontal scrolling for more content
- Hover effects for track information

## 🔮 Future Enhancements

- **Real API Integration**: Replace mock data with actual music streaming API
- **User Authentication**: Complete login/signup system
- **Playlist Management**: Create and edit playlists
- **Offline Support**: Download tracks for offline listening
- **Social Features**: Share playlists and follow friends
- **Advanced Search**: Filter by genre, mood, and other criteria

## 📝 License

This project is for demonstration purposes. The design and implementation showcase modern React development practices and UI/UX design principles.

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

---

**Note**: This is a demo application with mock data. For production use, integrate with a real music streaming API and implement proper authentication and licensing.
