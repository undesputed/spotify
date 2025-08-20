import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Sidebar } from '../components/navigation/Sidebar';
import { TopBar } from '../components/navigation/TopBar';
import { MiniPlayer } from '../components/player/MiniPlayer';
import { AudioPlayer } from '../components/player/AudioPlayer';
import { HomePage } from './HomePage';
import { useKeyboardShortcuts } from '../hooks/usePlayer';
import { useAuth } from '../hooks/useAuth';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
    },
  },
});

function AppContent() {
  useKeyboardShortcuts();
  const { user } = useAuth();
  
  // Initialize with a mock user for demo purposes
  useEffect(() => {
    if (!user) {
      // Simulate a logged-in user for demo
      const mockUser = {
        id: '1',
        email: 'demo@musicstream.com',
        name: 'Music Lover',
        isPremium: false,
        createdAt: new Date().toISOString(),
      };
      // Note: In a real app, this would be handled by the auth system
    }
  }, [user]);
  
  return (
    <>
      <Sidebar />
      <TopBar />
      <main className="ml-64 pt-16 pb-20 min-h-screen bg-gradient-to-br from-background to-background-secondary">
        <div className="p-6">
          <HomePage />
        </div>
      </main>
      <MiniPlayer />
      <AudioPlayer />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-100">
        <AppContent />
        <ReactQueryDevtools initialIsOpen={false} />
      </div>
    </QueryClientProvider>
  );
}

export default App;
