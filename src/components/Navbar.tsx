import React from 'react';
import { User } from '../types';
import { Heart, Calendar, Image, Mail, Music, Volume2, VolumeX, LogOut, Sparkles } from 'lucide-react';

interface NavbarProps {
  currentUser: User | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  isPlayingAudio: boolean;
  onToggleAudio: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  onLogout,
  isPlayingAudio,
  onToggleAudio
}) => {
  const navItems = [
    { id: 'greeting', label: 'Ucapan & Surat Spesial', icon: Heart },
    { id: 'milestones', label: '7-Day & Milestone Check-in', icon: Calendar, badge: 'Hadiah' },
    { id: 'gallery', label: 'Galeri Kenangan', icon: Image },
    { id: 'notes', label: 'Wish Jar & Notes', icon: Mail }
  ];

  return (
    <header className="sticky top-0 z-40 bg-rose-950/85 backdrop-blur-md border-b border-rose-800/50 shadow-lg text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand & Couples Initials */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 shadow-md shadow-rose-500/30 text-white font-bold text-lg ring-2 ring-rose-300/40">
              E&N
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold bg-gradient-to-r from-rose-200 via-pink-100 to-rose-300 bg-clip-text text-transparent">
                  Namira's Birthday Journey
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-rose-800/80 text-rose-200 border border-rose-700/60">
                  <Sparkles className="w-3 h-3 text-pink-300" /> Milestone App
                </span>
              </div>
              <p className="text-xs text-rose-300/80 hidden sm:block">
                Erlangga Dewantara ❤️ Namira Fisilmi Yasmin
              </p>
            </div>
          </div>

          {/* Right Controls (Audio Toggle & User Account Profile) */}
          <div className="flex items-center gap-3">
            {/* Audio music toggle */}
            <button
              onClick={onToggleAudio}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                isPlayingAudio 
                  ? 'bg-rose-500/20 text-rose-200 border-rose-500/50 shadow-inner' 
                  : 'bg-rose-900/50 text-rose-300 hover:bg-rose-800/60 border-rose-800'
              }`}
              title={isPlayingAudio ? 'Matikan musik' : 'Putar lagu romantis'}
            >
              {isPlayingAudio ? (
                <>
                  <Volume2 className="w-4 h-4 text-pink-400 animate-pulse" />
                  <span className="hidden md:inline">Musik On</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4 text-rose-400" />
                  <span className="hidden md:inline">Musik Off</span>
                </>
              )}
            </button>

            {/* Current user badge */}
            {currentUser && (
              <div className="flex items-center gap-2 pl-3 border-l border-rose-800/80">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-9 h-9 rounded-full object-cover border-2 border-rose-400 shadow-sm"
                  referrerPolicy="no-referrer"
                />
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-bold text-rose-100">{currentUser.nickname}</div>
                  <div className="text-[10px] text-rose-300/80 truncate max-w-[120px]">{currentUser.email}</div>
                </div>

                <button
                  onClick={onLogout}
                  className="p-2 text-rose-300 hover:text-white hover:bg-rose-800/60 rounded-lg transition-colors cursor-pointer"
                  title="Keluar / Ganti Akun"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-3 pt-1 border-t border-rose-800/40">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md shadow-rose-900/40 ring-1 ring-rose-300/30'
                    : 'text-rose-200 hover:text-white hover:bg-rose-900/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-rose-300'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-rose-950 uppercase tracking-wider">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
