import React from 'react';
import { User } from '../types';
import { Heart, Calendar, Image, Mail, Volume2, VolumeX, LogOut, Sparkles } from 'lucide-react';

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
    { id: 'greeting', label: 'Ucapan', icon: Heart },
    { id: 'milestones', label: 'Milestone', icon: Calendar, badge: 'Hadiah' },
    { id: 'gallery', label: 'Galeri', icon: Image },
    { id: 'notes', label: 'Wish Jar', icon: Mail }
  ];

  return (
    <>
      {/* ===== TOP HEADER ===== */}
      <header className="navbar-safe sticky top-0 z-40 bg-rose-950/90 backdrop-blur-md border-b border-rose-800/50 shadow-lg text-white">
        <div className="px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">

            {/* Brand */}
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-500 shadow-md text-white font-bold text-sm ring-2 ring-rose-300/40">
                E&N
              </div>
              <div>
                <h1 className="text-sm font-bold bg-gradient-to-r from-rose-200 via-pink-100 to-rose-300 bg-clip-text text-transparent leading-tight">
                  Namira's Birthday Journey
                </h1>
                <p className="text-[10px] text-rose-300/70 hidden sm:block">
                  Erlangga ❤️ Namira
                </p>
              </div>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-2">
              {/* Audio toggle */}
              <button
                onClick={onToggleAudio}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                  isPlayingAudio
                    ? 'bg-rose-500/20 text-rose-200 border-rose-500/50'
                    : 'bg-rose-900/50 text-rose-300 border-rose-800'
                }`}
              >
                {isPlayingAudio ? (
                  <Volume2 className="w-4 h-4 text-pink-400 animate-pulse" />
                ) : (
                  <VolumeX className="w-4 h-4 text-rose-400" />
                )}
                <span className="hidden sm:inline">
                  {isPlayingAudio ? 'On' : 'Off'}
                </span>
              </button>

              {/* User avatar + logout */}
              {currentUser && (
                <div className="flex items-center gap-2 pl-2 border-l border-rose-800/80">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-full object-cover border-2 border-rose-400"
                    referrerPolicy="no-referrer"
                  />
                  <button
                    onClick={onLogout}
                    className="p-1.5 text-rose-300 hover:text-white hover:bg-rose-800/60 rounded-lg transition-colors"
                    title="Keluar"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Desktop Tab Bar (hidden on mobile) */}
          <div className="hidden sm:flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-3 pt-1 border-t border-rose-800/40">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md ring-1 ring-rose-300/30'
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

      {/* ===== BOTTOM NAV BAR (Mobile only - iOS style) ===== */}
      <nav className="bottom-nav-safe sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-rose-950/95 backdrop-blur-md border-t border-rose-800/50">
        <div className="flex items-center justify-around px-2 pt-2 pb-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all relative ${
                  isActive ? 'text-pink-300' : 'text-rose-400'
                }`}
              >
                {/* Active indicator dot */}
                {isActive && (
                  <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-pink-400" />
                )}
                <Icon className={`w-5 h-5 ${isActive ? 'text-pink-300' : 'text-rose-500'}`} />
                <span className={`text-[10px] font-semibold ${isActive ? 'text-pink-200' : 'text-rose-400'}`}>
                  {item.label}
                </span>
                {item.badge && (
                  <span className="absolute -top-0.5 right-1 w-2 h-2 rounded-full bg-amber-400" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
