import React, { useState, useEffect, useRef } from 'react';
import { User, MilestoneChallenge, MemoryPhoto, LoveNote, AppStateData } from './types';
import { Navbar } from './components/Navbar';
import { LoginPage } from './components/LoginPage';
import { HeroGreetingSection } from './components/HeroGreetingSection';
import { MilestoneChallengeSection } from './components/MilestoneChallengeSection';
import { MemoryGallerySection } from './components/MemoryGallerySection';
import { WishJarSection } from './components/WishJarSection';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('namira_app_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState('greeting');
  const [appState, setAppState] = useState<AppStateData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch initial app data from server
  useEffect(() => {
    fetch('/api/state')
      .then((res) => res.json())
      .then((data: AppStateData) => {
        setAppState(data);
      })
      .catch((err) => {
        console.error('Failed to load state from API:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // Sync user state with localStorage
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('namira_app_user', JSON.stringify(user));
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('namira_app_user');
    } catch (e) {
      console.error(e);
    }
  };

  // Toggle Background Audio
  const handleToggleAudio = () => {
    if (!audioRef.current) return;

    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlayingAudio(true))
        .catch((err) => console.log('Audio autoplay blocked:', err));
    }
  };

  // Milestone Complete / Toggle API Action
  const handleToggleMilestone = async (day: number): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) return { success: false, error: 'User tidak ditemukan' };

    try {
      const res = await fetch(`/api/milestones/${day}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail: currentUser.email })
      });

      const data = await res.json();
      if (res.ok && data.success && appState) {
        setAppState((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            milestones: data.milestones || prev.milestones.map((m) => (m.day === day ? data.milestone : m))
          };
        });
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Gagal mengubah status milestone' };
      }
    } catch (err) {
      console.error('Error completing milestone:', err);
      return { success: false, error: 'Terjadi kesalahan koneksi server' };
    }
  };

  // Add Milestone API Action (Admin)
  const handleAddMilestone = async (milestoneData: Partial<MilestoneChallenge>): Promise<boolean> => {
    if (!currentUser) return false;
    try {
      const res = await fetch('/api/milestones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: currentUser.email,
          ...milestoneData
        })
      });

      const data = await res.json();
      if (data.success && appState) {
        setAppState((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            milestones: data.milestones
          };
        });
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error adding milestone:', err);
      return false;
    }
  };

  // Edit Milestone API Action (Admin)
  const handleEditMilestone = async (day: number, editData: Partial<MilestoneChallenge>): Promise<boolean> => {
    if (!currentUser) return false;
    try {
      const res = await fetch(`/api/milestones/${day}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: currentUser.email,
          ...editData
        })
      });

      const data = await res.json();
      if (data.success && appState) {
        setAppState((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            milestones: data.milestones
          };
        });
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error editing milestone:', err);
      return false;
    }
  };

  // Delete Milestone API Action (Admin)
  const handleDeleteMilestone = async (day: number): Promise<boolean> => {
    if (!currentUser) return false;
    try {
      const res = await fetch(`/api/milestones/${day}?userEmail=${encodeURIComponent(currentUser.email)}`, {
        method: 'DELETE',
        headers: { 'x-user-email': currentUser.email }
      });

      const data = await res.json();
      if (data.success && appState) {
        setAppState((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            milestones: data.milestones
          };
        });
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error deleting milestone:', err);
      return false;
    }
  };

  // Reset Milestone Claims API Action (Admin)
  const handleResetMilestoneClaims = async (day?: number): Promise<boolean> => {
    if (!currentUser) return false;
    try {
      const res = await fetch('/api/milestones/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: currentUser.email,
          day,
          resetAll: day === undefined
        })
      });

      const data = await res.json();
      if (data.success && appState) {
        setAppState((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            milestones: data.milestones
          };
        });
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error resetting milestones:', err);
      return false;
    }
  };

  // Add Memory API Action
  const handleAddMemory = async (newMem: Omit<MemoryPhoto, 'id' | 'likes' | 'lovedByNamira'>) => {
    try {
      const res = await fetch('/api/memories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMem)
      });

      const data = await res.json();
      if (data.success && appState) {
        setAppState((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            memories: [data.memory, ...prev.memories]
          };
        });
      }
    } catch (err) {
      console.error('Error adding memory:', err);
    }
  };

  // Like Memory API Action
  const handleLikeMemory = async (id: string) => {
    try {
      const res = await fetch(`/api/memories/${id}/like`, {
        method: 'POST'
      });

      const data = await res.json();
      if (data.success && appState) {
        setAppState((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            memories: prev.memories.map((m) => (m.id === id ? data.memory : m))
          };
        });
      }
    } catch (err) {
      console.error('Error liking memory:', err);
    }
  };

  // Add Love Note API Action
  const handleAddNote = async (noteData: Omit<LoveNote, 'id' | 'createdAt'>) => {
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(noteData)
      });

      const data = await res.json();
      if (data.success && appState) {
        setAppState((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            notes: [data.note, ...prev.notes]
          };
        });
      }
    } catch (err) {
      console.error('Error adding note:', err);
    }
  };

  // Update Hero Content, Greeting & Letter & Section Headers API Action
  const handleUpdateHeroContent = async (payload: {
    greetingTitle?: string;
    greetingMessage?: string;
    heroBadge?: string;
    heroTitle?: string;
    heroSubtitle?: string;
    letterTitle?: string;
    letterBody?: string;
    milestonesBadge?: string;
    milestonesTitle?: string;
    milestonesSubtitle?: string;
    galleryBadge?: string;
    galleryTitle?: string;
    gallerySubtitle?: string;
    notesBadge?: string;
    notesTitle?: string;
    notesSubtitle?: string;
  }): Promise<boolean> => {
    if (!currentUser) return false;
    try {
      const res = await fetch('/api/greeting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: currentUser.email,
          ...payload
        })
      });

      const data = await res.json();
      if (data.success && appState) {
        setAppState((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            ...data
          };
        });
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error updating hero content:', err);
      return false;
    }
  };

  // Edit Memory API Action (Admin)
  const handleEditMemory = async (id: string, memData: Partial<MemoryPhoto>): Promise<boolean> => {
    if (!currentUser) return false;
    try {
      const res = await fetch(`/api/memories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: currentUser.email,
          ...memData
        })
      });

      const data = await res.json();
      if (data.success && appState) {
        setAppState((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            memories: data.memories || prev.memories
          };
        });
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error editing memory:', err);
      return false;
    }
  };

  // Delete Memory API Action (Admin)
  const handleDeleteMemory = async (id: string): Promise<boolean> => {
    if (!currentUser) return false;
    try {
      const res = await fetch(`/api/memories/${id}?userEmail=${encodeURIComponent(currentUser.email)}`, {
        method: 'DELETE',
        headers: { 'x-user-email': currentUser.email }
      });

      const data = await res.json();
      if (data.success && appState) {
        setAppState((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            memories: data.memories || prev.memories
          };
        });
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error deleting memory:', err);
      return false;
    }
  };

  // Rename Category Across Memories API Action
  const handleRenameCategory = async (oldCategory: string, newCategory: string): Promise<boolean> => {
    if (!currentUser) return false;
    try {
      const res = await fetch('/api/memories/rename-category', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: currentUser.email,
          oldCategory,
          newCategory
        })
      });

      const data = await res.json();
      if (data.success && appState) {
        setAppState((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            memories: data.memories || prev.memories
          };
        });
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error renaming category:', err);
      return false;
    }
  };

  // Edit Note API Action
  const handleEditNote = async (id: string, noteData: Partial<LoveNote>): Promise<boolean> => {
    if (!currentUser) return false;
    try {
      const res = await fetch(`/api/notes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: currentUser.email,
          ...noteData
        })
      });

      const data = await res.json();
      if (data.success && appState) {
        setAppState((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            notes: data.notes || prev.notes
          };
        });
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error editing note:', err);
      return false;
    }
  };

  // Delete Note API Action
  const handleDeleteNote = async (id: string): Promise<boolean> => {
    if (!currentUser) return false;
    try {
      const res = await fetch(`/api/notes/${id}`, {
        method: 'DELETE'
      });

      const data = await res.json();
      if (data.success && appState) {
        setAppState((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            notes: data.notes || prev.notes
          };
        });
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error deleting note:', err);
      return false;
    }
  };

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-rose-950/20 text-slate-800 font-sans flex flex-col" style={{ minHeight: '-webkit-fill-available' }}>
      {/* Background Audio Source */}
      <audio
        ref={audioRef}
        loop
        src="https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3"
      />

      {/* Main Top Navigation Navbar */}
      <Navbar
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        isPlayingAudio={isPlayingAudio}
        onToggleAudio={handleToggleAudio}
      />

      {/* App Body Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 sm:pb-8 main-content">
        {isLoading || !appState ? (
          <div className="flex flex-col items-center justify-center py-20 text-rose-800 space-y-3">
            <div className="w-10 h-10 border-4 border-rose-300 border-t-rose-600 rounded-full animate-spin" />
            <p className="text-sm font-semibold">Memuat momen manis Namira & ur bf...</p>
          </div>
        ) : (
          <>
            {activeTab === 'greeting' && (
              <HeroGreetingSection
                currentUser={currentUser}
                greetingTitle={appState.greetingTitle}
                greetingMessage={appState.greetingMessage}
                heroBadge={appState.heroBadge}
                heroTitle={appState.heroTitle}
                heroSubtitle={appState.heroSubtitle}
                letterTitle={appState.letterTitle}
                letterBody={appState.letterBody}
                relationshipStartDate={appState.relationshipStartDate}
                stat1Label={appState.stat1Label}
                stat1Sublabel={appState.stat1Sublabel}
                stat2Value={appState.stat2Value}
                stat2Label={appState.stat2Label}
                stat3Value={appState.stat3Value}
                stat3Label={appState.stat3Label}
                totalMilestonesCount={appState.milestones?.length || 9}
                onUpdateHeroContent={handleUpdateHeroContent}
                onNavigateToMilestones={() => setActiveTab('milestones')}
              />
            )}

            {activeTab === 'milestones' && (
              <MilestoneChallengeSection
                milestones={appState.milestones}
                onToggleComplete={handleToggleMilestone}
                onAddMilestone={handleAddMilestone}
                onEditMilestone={handleEditMilestone}
                onDeleteMilestone={handleDeleteMilestone}
                onResetClaims={handleResetMilestoneClaims}
                currentUser={currentUser}
                badge={appState.milestonesBadge}
                title={appState.milestonesTitle}
                subtitle={appState.milestonesSubtitle}
                onUpdateHeader={handleUpdateHeroContent}
              />
            )}

            {activeTab === 'gallery' && (
              <MemoryGallerySection
                memories={appState.memories}
                onAddMemory={handleAddMemory}
                onLikeMemory={handleLikeMemory}
                currentUser={currentUser}
                badge={appState.galleryBadge}
                title={appState.galleryTitle}
                subtitle={appState.gallerySubtitle}
                onUpdateHeader={handleUpdateHeroContent}
                onEditMemory={handleEditMemory}
                onDeleteMemory={handleDeleteMemory}
                onRenameCategory={handleRenameCategory}
              />
            )}

            {activeTab === 'notes' && (
              <WishJarSection
                notes={appState.notes}
                onAddNote={handleAddNote}
                currentUser={currentUser}
                badge={appState.notesBadge}
                title={appState.notesTitle}
                subtitle={appState.notesSubtitle}
                onUpdateHeader={handleUpdateHeroContent}
                onEditNote={handleEditNote}
                onDeleteNote={handleDeleteNote}
              />
            )}
          </>
        )}
      </main>

      {/* Footer hidden on mobile PWA, shown on desktop */}
      <footer className="hidden sm:block bg-rose-950 text-rose-200/80 text-xs py-6 border-t border-rose-900/60 text-center space-y-1">
        <p className="font-semibold">
          Dibuat dengan seluruh cinta oleh <span className="text-rose-100">Erlangga Dewantara</span> khusus untuk <span className="text-pink-200 font-bold">Namira Fisilmi Yasmin</span> ❤️
        </p>
        <p className="text-[11px] text-rose-300/60">
          Ulang Tahun Special Milestone Application • 2026
        </p>
      </footer>
    </div>
  );
}
