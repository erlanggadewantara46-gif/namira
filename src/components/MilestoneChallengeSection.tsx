import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { MilestoneChallenge, User } from '../types';
import { VoucherModal } from './VoucherModal';
import { 
  CheckCircle2, Circle, Gift, Sparkles, Trophy, Calendar, Heart, 
  Plus, Edit3, Trash2, RotateCcw, Clock, ChevronRight, Lock, 
  Check, ArrowRight, Play, RefreshCw, X
} from 'lucide-react';

interface MilestoneChallengeSectionProps {
  milestones: MilestoneChallenge[];
  onToggleComplete: (day: number) => Promise<{ success: boolean; error?: string }>;
  onAddMilestone?: (data: Partial<MilestoneChallenge>) => Promise<boolean>;
  onEditMilestone?: (day: number, data: Partial<MilestoneChallenge>) => Promise<boolean>;
  onDeleteMilestone?: (day: number) => Promise<boolean>;
  onResetClaims?: (day?: number) => Promise<boolean>;
  currentUser: User | null;
  badge?: string;
  title?: string;
  subtitle?: string;
  onUpdateHeader?: (payload: { milestonesBadge?: string; milestonesTitle?: string; milestonesSubtitle?: string }) => Promise<boolean>;
}

export const MilestoneChallengeSection: React.FC<MilestoneChallengeSectionProps> = ({
  milestones,
  onToggleComplete,
  onAddMilestone,
  onEditMilestone,
  onDeleteMilestone,
  onResetClaims,
  currentUser,
  badge = 'Couple Daily & Milestone Journey',
  title = '7-Day & Milestone Check-in Challenge',
  subtitle = 'Petualangan check-in harian istimewa untuk Namira Fisilmi Yasmin. Lakukan check-in setiap hari untuk membuka voucher kejutan romantis dari ur bf!',
  onUpdateHeader
}) => {
  const [selectedMilestone, setSelectedMilestone] = useState<MilestoneChallenge | null>(null);
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending'>('all');
  
  // Alert modal for 1-day 1-claim limit or error messages
  const [limitAlertMessage, setLimitAlertMessage] = useState<string | null>(null);

  // Restart confirmation modal state
  const [isRestartConfirmOpen, setIsRestartConfirmOpen] = useState(false);
  const [restartSuccessMsg, setRestartSuccessMsg] = useState<string | null>(null);

  // Header edit modal state
  const [isHeaderEditOpen, setIsHeaderEditOpen] = useState(false);
  const [headerBadge, setHeaderBadge] = useState(badge);
  const [headerTitle, setHeaderTitle] = useState(title);
  const [headerSubtitle, setHeaderSubtitle] = useState(subtitle);

  // Admin Add/Edit Modal state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<MilestoneChallenge | null>(null);
  
  // Form fields
  const [formData, setFormData] = useState({
    day: 1,
    title: '',
    description: '',
    reward: '',
    rewardDetails: '',
    category: 'Quality Time' as MilestoneChallenge['category'],
    image: '',
    voucherCode: ''
  });

  const isErlangga = currentUser?.email?.toLowerCase() === 'erlanggadewantara46@gmail.com';

  // Sort milestones by day
  const sortedMilestones = [...milestones].sort((a, b) => a.day - b.day);

  const completedCount = sortedMilestones.filter(m => m.isCompleted).length;
  const totalCount = sortedMilestones.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Determine current active day
  // The current active day is the first uncompleted milestone day, or if all are completed, day = totalCount
  const currentActiveMilestone = sortedMilestones.find(m => !m.isCompleted) || sortedMilestones[sortedMilestones.length - 1];
  const currentActiveDay = currentActiveMilestone ? currentActiveMilestone.day : 1;

  // Check if any milestone was claimed today
  const todayStr = new Date().toISOString().slice(0, 10);
  const claimedTodayMilestone = sortedMilestones.find(m => {
    if (!m.isCompleted || !m.completedAt) return false;
    try {
      return new Date(m.completedAt).toISOString().slice(0, 10) === todayStr;
    } catch {
      return false;
    }
  });

  const filteredMilestones = sortedMilestones.filter(m => {
    if (filter === 'completed') return m.isCompleted;
    if (filter === 'pending') return !m.isCompleted;
    return true;
  });

  const handleCheckInClick = async (e: React.MouseEvent, m: MilestoneChallenge) => {
    e.stopPropagation();

    // Local check for non-admin if trying to claim a new milestone while already claimed today
    if (!isErlangga && !m.isCompleted && claimedTodayMilestone) {
      const claimTimeStr = new Date(claimedTodayMilestone.completedAt!).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit'
      });
      setLimitAlertMessage(
        `Aturan 1 Hari 1 Claim Aktif: Kamu sudah mengklaim hadiah "${claimedTodayMilestone.reward}" hari ini (pada ${claimTimeStr} WIB).\n\nSesuai janji 1 Hari 1 Claim, silakan kembali besok untuk mengklaim hadiah berikutnya ya sayang! ❤️`
      );
      return;
    }

    const res = await onToggleComplete(m.day);

    if (res.success) {
      if (!m.isCompleted) {
        // Trigger colorful confetti celebration explosion!
        confetti({
          particleCount: 130,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#f43f5e', '#ec4899', '#fbbf24', '#a855f7', '#3b82f6']
        });
      }
    } else if (res.error) {
      setLimitAlertMessage(res.error);
    }
  };

  // Handle Full Restart Check-In Journey
  const handleConfirmRestart = async () => {
    if (onResetClaims) {
      const ok = await onResetClaims();
      if (ok) {
        setIsRestartConfirmOpen(false);
        setRestartSuccessMsg('Perjalanan check-in berhasil di-restart dari Hari Ke-1! ✨');
        setTimeout(() => setRestartSuccessMsg(null), 4000);
      }
    }
  };

  // Scroll smoothly to a specific day card
  const handleDayNodeClick = (day: number) => {
    const element = document.getElementById(`milestone-card-day-${day}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Open Form Modal for Adding
  const handleOpenAddModal = () => {
    const nextDay = sortedMilestones.length > 0 ? Math.max(...sortedMilestones.map(m => m.day)) + 1 : 1;
    setEditingMilestone(null);
    setFormData({
      day: nextDay,
      title: '',
      description: '',
      reward: '',
      rewardDetails: '',
      category: 'Quality Time',
      image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=1000&auto=format&fit=crop',
      voucherCode: `NMY-DAY${nextDay}-REWARD`
    });
    setIsFormModalOpen(true);
  };

  // Open Form Modal for Editing
  const handleOpenEditModal = (e: React.MouseEvent, m: MilestoneChallenge) => {
    e.stopPropagation();
    setEditingMilestone(m);
    setFormData({
      day: m.day,
      title: m.title,
      description: m.description,
      reward: m.reward,
      rewardDetails: m.rewardDetails,
      category: m.category,
      image: m.image,
      voucherCode: m.voucherCode
    });
    setIsFormModalOpen(true);
  };

  // Handle Delete Milestone
  const handleDeleteClick = async (e: React.MouseEvent, day: number) => {
    e.stopPropagation();
    if (confirm(`Apakah ur bf yakin ingin menghapus Hadiah Hari Ke-${day}?`)) {
      if (onDeleteMilestone) {
        await onDeleteMilestone(day);
      }
    }
  };

  // Handle Reset Single Claim
  const handleResetSingleClaim = async (e: React.MouseEvent, day: number) => {
    e.stopPropagation();
    if (confirm(`Reset status klaim untuk Hadiah Hari Ke-${day}?`)) {
      if (onResetClaims) {
        await onResetClaims(day);
      }
    }
  };

  // Submit Form Modal
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.reward) {
      alert('Judul Misi dan Nama Hadiah wajib diisi!');
      return;
    }

    if (editingMilestone) {
      if (onEditMilestone) {
        await onEditMilestone(editingMilestone.day, formData);
      }
    } else {
      if (onAddMilestone) {
        await onAddMilestone(formData);
      }
    }

    setIsFormModalOpen(false);
  };

  return (
    <div className="space-y-10">
      {/* Header Banner & Overall Progress */}
      <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-rose-950 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-rose-800/80 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-200 border border-rose-500/40 backdrop-blur-md">
                <Trophy className="w-3.5 h-3.5 text-amber-300 animate-pulse" /> {badge}
              </span>
              
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-200 border border-amber-500/40 backdrop-blur-md">
                <Calendar className="w-3.5 h-3.5 text-amber-300" /> Hari Ke-{completedCount === totalCount ? totalCount : currentActiveDay} Dari {totalCount} Hari
              </span>

              {isErlangga && (
                <button
                  type="button"
                  onClick={() => {
                    setHeaderBadge(badge);
                    setHeaderTitle(title);
                    setHeaderSubtitle(subtitle);
                    setIsHeaderEditOpen(true);
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-400 text-slate-950 hover:bg-amber-300 transition-colors shadow-sm cursor-pointer"
                  title="Edit Judul & Teks Banner Tab Ini"
                >
                  <Edit3 className="w-3 h-3" /> Edit Judul Tab
                </button>
              )}
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold text-white font-serif tracking-tight leading-tight">
              {title}
            </h2>

            <p className="text-xs sm:text-sm text-rose-200/90 max-w-2xl leading-relaxed">
              {subtitle}
            </p>

            {/* Global Action Toolbar */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              {/* RESTART CHECK-IN BUTTON FOR ANY USER */}
              <button
                type="button"
                onClick={() => setIsRestartConfirmOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                title="Restart perjalanan check-in dari Hari Ke-1"
              >
                <RotateCcw className="w-4 h-4 text-slate-950" />
                <span>Restart Check-In (Mulai Ulang Dari Hari Ke-1)</span>
              </button>

              {/* Admin Add Milestone Button */}
              {isErlangga && (
                <button
                  type="button"
                  onClick={handleOpenAddModal}
                  className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-all shadow-lg flex items-center gap-1.5 cursor-pointer border border-rose-400/40"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Hadiah Baru</span>
                </button>
              )}
            </div>
          </div>

          {/* Progress Metrics Widget */}
          <div className="bg-rose-900/50 p-5 rounded-2xl border border-rose-700/60 backdrop-blur-md lg:min-w-[280px] space-y-3 text-center">
            <div className="flex items-center justify-between text-xs font-bold text-rose-200">
              <span>Progres Selesai</span>
              <span className="text-amber-300 font-mono text-sm">{completedCount} / {totalCount} Hari</span>
            </div>

            <div className="w-full bg-rose-950 h-3.5 rounded-full overflow-hidden border border-rose-800 p-0.5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-amber-400 via-rose-400 to-pink-500 rounded-full"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 text-left pt-1 border-t border-rose-800/60">
              <div className="bg-rose-950/50 p-2 rounded-xl text-center">
                <div className="text-[10px] text-rose-300 font-medium">Hari Aktif</div>
                <div className="text-xs font-bold text-amber-200">Hari Ke-{completedCount === totalCount ? totalCount : currentActiveDay}</div>
              </div>
              <div className="bg-rose-950/50 p-2 rounded-xl text-center">
                <div className="text-[10px] text-rose-300 font-medium">Status Check-in</div>
                <div className="text-xs font-bold text-emerald-300">
                  {claimedTodayMilestone ? 'Sudah Hari Ini' : 'Belum Claim'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Restart Success Alert Toast */}
      {restartSuccessMsg && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-amber-500/10 border border-amber-300 text-amber-900 font-bold text-xs sm:text-sm flex items-center justify-between gap-3 shadow-sm"
        >
          <div className="flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-amber-600 animate-spin" />
            <span>{restartSuccessMsg}</span>
          </div>
          <button
            onClick={() => setRestartSuccessMsg(null)}
            className="p-1 rounded-full hover:bg-amber-200 text-amber-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {/* VISUAL JOURNEY CALENDAR / TIMELINE STEPPER MAP */}
      <div className="bg-white rounded-3xl p-6 shadow-xl border border-rose-200/80 space-y-4">
        <div className="flex items-center justify-between border-b border-rose-100 pb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-rose-500 text-white">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-rose-950 font-serif">
                Kalender Perjalanan Check-In Harian
              </h3>
              <p className="text-xs text-rose-700">
                Lacak posisi hari ke-berapa kamu saat ini & klik pada lingkaran untuk langsung ke detail hari tersebut
              </p>
            </div>
          </div>

          <div className="text-xs font-bold text-rose-900 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Hari Aktif Saat Ini: <strong className="text-rose-600 font-mono text-sm">Hari Ke-{completedCount === totalCount ? totalCount : currentActiveDay}</strong></span>
          </div>
        </div>

        {/* Horizontal Calendar Stepper Nodes */}
        <div className="pt-2 pb-4 overflow-x-auto no-scrollbar">
          <div className="flex items-center min-w-max px-2 space-x-3 sm:space-x-4">
            {sortedMilestones.map((m, index) => {
              const isCompleted = m.isCompleted;
              const isCurrent = !isCompleted && m.day === currentActiveDay;
              const isFuture = !isCompleted && m.day > currentActiveDay;

              return (
                <React.Fragment key={m.day}>
                  {/* Calendar Node Item */}
                  <button
                    onClick={() => handleDayNodeClick(m.day)}
                    className={`flex flex-col items-center gap-2 group cursor-pointer transition-all transform hover:scale-105 ${
                      isCurrent ? 'ring-2 ring-rose-500 ring-offset-2 rounded-2xl p-2 bg-rose-50' : 'p-2'
                    }`}
                  >
                    <div
                      className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center font-bold text-sm shadow-md transition-all ${
                        isCompleted
                          ? 'bg-emerald-500 text-white shadow-emerald-200'
                          : isCurrent
                          ? 'bg-gradient-to-tr from-rose-500 to-pink-500 text-white ring-4 ring-rose-200 shadow-rose-300 animate-pulse'
                          : 'bg-slate-100 text-slate-500 border border-slate-200 hover:border-rose-300'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-6 h-6 stroke-[3]" />
                      ) : isCurrent ? (
                        <div className="text-center leading-none">
                          <div className="text-[9px] font-bold uppercase tracking-wider text-amber-200">Hari</div>
                          <div className="text-base font-extrabold">{m.day}</div>
                        </div>
                      ) : (
                        <div className="text-center leading-none">
                          <div className="text-[9px] font-medium text-slate-400">Day</div>
                          <div className="text-sm font-bold">{m.day}</div>
                        </div>
                      )}
                    </div>

                    <div className="text-center space-y-0.5">
                      <div className="text-[11px] font-bold text-slate-800 font-mono">
                        Hari Ke-{m.day}
                      </div>
                      <div className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        isCompleted 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : isCurrent 
                          ? 'bg-rose-500 text-white' 
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        {isCompleted ? 'Selesai' : isCurrent ? 'Siap Claim' : 'Belum'}
                      </div>
                    </div>
                  </button>

                  {/* Connecting Line between Days */}
                  {index < sortedMilestones.length - 1 && (
                    <div className={`h-1 w-6 sm:w-10 rounded-full shrink-0 ${
                      m.isCompleted ? 'bg-emerald-400' : 'bg-slate-200'
                    }`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* 1-Day 1-Claim Notice Banner */}
      <div className={`p-4 sm:p-5 rounded-2xl border flex items-center justify-between gap-4 transition-all shadow-sm ${
        claimedTodayMilestone 
          ? 'bg-amber-500/10 border-amber-300 text-amber-900' 
          : 'bg-emerald-500/10 border-emerald-300 text-emerald-900'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl text-white shadow-md ${claimedTodayMilestone ? 'bg-amber-500' : 'bg-emerald-500'}`}>
            <Clock className="w-6 h-6" />
          </div>
          <div className="space-y-0.5">
            <div className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span>Aturan Check-In 1 Hari 1 Claim</span>
              {claimedTodayMilestone && (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10px] font-extrabold">Terpakai Hari Ini</span>
              )}
            </div>
            <p className="text-xs sm:text-sm font-medium">
              {claimedTodayMilestone ? (
                <>
                  Kamu telah mengklaim <span className="font-bold text-amber-950">"{claimedTodayMilestone.reward}"</span> pada jam{' '}
                  <span className="font-mono font-bold">
                    {new Date(claimedTodayMilestone.completedAt!).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                  </span>. Klaim berikutnya terbuka besok! ❤️
                </>
              ) : (
                'Hari ini kamu belum mengklaim hadiah! Silakan klik tombol check-in pada kartu Hari Ke-' + currentActiveDay + ' di bawah.'
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-3 pt-2">
        <div className="flex items-center gap-2 bg-rose-100/70 p-1.5 rounded-2xl border border-rose-200">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === 'all' 
                ? 'bg-rose-500 text-white shadow-sm' 
                : 'text-rose-900 hover:bg-rose-200/50'
            }`}
          >
            Semua Hari ({totalCount})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === 'pending' 
                ? 'bg-rose-500 text-white shadow-sm' 
                : 'text-rose-900 hover:bg-rose-200/50'
            }`}
          >
            Belum Diklaim ({totalCount - completedCount})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === 'completed' 
                ? 'bg-rose-500 text-white shadow-sm' 
                : 'text-rose-900 hover:bg-rose-200/50'
            }`}
          >
            Sudah Diklaim ({completedCount})
          </button>
        </div>

        <div className="text-xs text-rose-800 font-medium flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-rose-500" />
          <span>Klik kartu untuk melihat detail Voucher & Kode Penukaran</span>
        </div>
      </div>

      {/* Grid Cards of Daily & Milestone Challenges */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMilestones.map((m) => {
          const isCurrentDayCard = !m.isCompleted && m.day === currentActiveDay;

          return (
            <motion.div
              id={`milestone-card-day-${m.day}`}
              key={m.day}
              whileHover={{ y: -4 }}
              onClick={() => { if (m.isCompleted) setSelectedMilestone(m); }}
              className={`relative rounded-3xl overflow-hidden border transition-all flex flex-col justify-between ${
                m.isCompleted
                  ? 'cursor-pointer bg-gradient-to-b from-emerald-50/90 via-white to-rose-50/40 border-emerald-300 shadow-md ring-1 ring-emerald-400/30'
                  : isCurrentDayCard
                  ? 'cursor-default bg-white border-rose-400 shadow-xl ring-2 ring-rose-500/50'
                  : 'cursor-default bg-white border-rose-200/80 shadow-md opacity-90'
              }`}
            >
              {/* Top Thumbnail Image */}
              <div className="relative h-48 overflow-hidden bg-rose-100">
                <img
                  src={m.image}
                  alt={m.isCompleted ? m.title : 'Hadiah rahasia terkunci'}
                  className={`w-full h-full object-cover transition-all duration-500 ${
                    m.isCompleted ? 'hover:scale-105' : 'scale-110 blur-lg grayscale-[40%]'
                  }`}
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent" />

                {/* Lock Overlay for Not-Yet-Claimed Milestones (Surprise Reveal) */}
                {!m.isCompleted && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-950/35">
                    <div className="w-12 h-12 rounded-full bg-white/15 border border-white/30 flex items-center justify-center backdrop-blur-md shadow-lg">
                      <Lock className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-white/90 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-sm">
                      Hadiah Rahasia
                    </span>
                  </div>
                )}

                {/* Day Badge */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold shadow-md backdrop-blur-md ${
                    m.isCompleted 
                      ? 'bg-emerald-600/90 text-white' 
                      : isCurrentDayCard 
                      ? 'bg-rose-600 text-white ring-2 ring-white/50' 
                      : 'bg-slate-900/80 text-white'
                  }`}>
                    <Calendar className="w-3.5 h-3.5" /> Hari Ke-{m.day}
                  </span>

                  {isCurrentDayCard && (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-400 text-slate-950 shadow-md animate-pulse uppercase tracking-wider">
                      Siap Claim Hari Ini! 🔥
                    </span>
                  )}
                </div>

                {/* Admin Actions */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5">
                  {isErlangga && (
                    <div className="flex items-center gap-1 bg-black/60 p-1 rounded-full backdrop-blur-md border border-white/20">
                      <button
                        type="button"
                        onClick={(e) => handleOpenEditModal(e, m)}
                        className="p-1.5 rounded-full hover:bg-amber-500 text-white transition-colors cursor-pointer"
                        title="Edit Hadiah"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteClick(e, m.day)}
                        className="p-1.5 rounded-full hover:bg-rose-600 text-white transition-colors cursor-pointer"
                        title="Hapus Hadiah"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      {m.isCompleted && (
                        <button
                          type="button"
                          onClick={(e) => handleResetSingleClaim(e, m.day)}
                          className="p-1.5 rounded-full hover:bg-blue-500 text-white transition-colors cursor-pointer"
                          title="Reset Klaim Hari Ini"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Title Overlay */}
                <div className="absolute bottom-3 left-4 right-4">
                  <h3 className={`text-base font-bold text-white leading-tight drop-shadow-md ${
                    !m.isCompleted ? 'blur-sm select-none' : ''
                  }`}>
                    {m.title}
                  </h3>
                </div>
              </div>

              {/* Card Content Body */}
              <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                <p className={`text-xs leading-relaxed line-clamp-3 ${
                  m.isCompleted ? 'text-slate-600' : 'text-slate-400 blur-[3px] select-none'
                }`}>
                  {m.description}
                </p>

                {/* Reward Box */}
                <div className="p-3 rounded-2xl bg-rose-50/80 border border-rose-100 space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-rose-700 flex items-center gap-1">
                    {m.isCompleted ? (
                      <Gift className="w-3.5 h-3.5 text-rose-500" />
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-rose-400" />
                    )}
                    {m.isCompleted ? `Reward Hari Ke-${m.day}` : 'Reward Rahasia'}
                  </div>
                  <div className={`text-xs font-bold text-slate-900 truncate ${
                    !m.isCompleted ? 'blur-[4px] select-none' : ''
                  }`}>
                    {m.reward}
                  </div>
                  {!m.isCompleted && (
                    <div className="text-[10px] font-semibold text-rose-500 pt-0.5 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Check-in dulu untuk membuka hadiahnya!
                    </div>
                  )}
                </div>

                {/* Timestamp if Completed */}
                {m.isCompleted && m.completedAt && (
                  <div className="text-[11px] font-medium text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200/80 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">
                      Diklaim:{' '}
                      {new Date(m.completedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })},{' '}
                      {new Date(m.completedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                    </span>
                  </div>
                )}

                {/* Footer Actions */}
                <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                  <button
                    type="button"
                    onClick={(e) => handleCheckInClick(e, m)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      m.isCompleted
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300'
                        : isCurrentDayCard
                        ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white hover:from-rose-600 hover:to-pink-700 shadow-md shadow-rose-500/30'
                        : 'bg-rose-500 text-white hover:bg-rose-600 shadow-sm'
                    }`}
                  >
                    {m.isCompleted ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Terklaim
                      </>
                    ) : (
                      <>
                        <Circle className="w-4 h-4" /> Check-in & Klaim
                      </>
                    )}
                  </button>

                  {m.isCompleted ? (
                    <div className="text-xs font-semibold text-rose-600 flex items-center gap-0.5 hover:underline">
                      Voucher <ChevronRight className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5" /> Terkunci
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* RESTART CONFIRMATION MODAL */}
      <AnimatePresence>
        {isRestartConfirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-amber-200 p-6 space-y-5 text-slate-800 text-center"
            >
              <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto border border-amber-200 shadow-sm">
                <RotateCcw className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-bold text-slate-900 font-serif">
                  Restart Perjalanan Check-In?
                </h3>
                <p className="text-xs text-rose-600 font-semibold">
                  Mulai Ulang Seluruh Milestone Dari Hari Ke-1
                </p>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-amber-50/60 p-4 rounded-2xl border border-amber-200/80">
                Apakah kamu yakin ingin mereset seluruh status klaim? Semua hadiah akan dikembalikan menjadi belum diklaim, dan check-in akan diulang kembali dari <strong>Hari Ke-1</strong>. ✨
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRestartConfirmOpen(false)}
                  className="py-3 px-4 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
                >
                  Batal
                </button>

                <button
                  type="button"
                  onClick={handleConfirmRestart}
                  className="py-3 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 shadow-md transition-all cursor-pointer"
                >
                  Ya, Restart Dari Hari Ke-1
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Limit Alert Modal */}
      <AnimatePresence>
        {limitAlertMessage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-rose-200 p-6 space-y-4 text-slate-800 text-center"
            >
              <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto border border-amber-200 shadow-sm">
                <Clock className="w-8 h-8" />
              </div>

              <h3 className="text-lg font-bold text-slate-900 font-serif">
                Aturan 1 Hari 1 Claim
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 whitespace-pre-line leading-relaxed">
                {limitAlertMessage}
              </p>

              <button
                type="button"
                onClick={() => setLimitAlertMessage(null)}
                className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-rose-500 hover:bg-rose-600 text-white transition-all cursor-pointer shadow-md"
              >
                Mengerti & Kembali Besok ❤️
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Admin Form Modal (Add or Edit Milestone) */}
      <AnimatePresence>
        {isFormModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-rose-200 text-slate-800 my-auto max-h-[85vh] sm:max-h-[90vh] flex flex-col overflow-hidden"
            >
              {/* Fixed Header */}
              <div className="flex items-center justify-between p-4 sm:p-5 border-b border-rose-100 bg-white shrink-0">
                <div className="flex items-center gap-2">
                  <Gift className="w-5 h-5 text-rose-500" />
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 font-serif">
                    {editingMilestone ? `Edit Hadiah Hari Ke-${editingMilestone.day}` : 'Tambah Hadiah / Milestone Baru'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="p-1.5 rounded-full hover:bg-rose-100 text-slate-500 cursor-pointer shrink-0"
                  title="Tutup Modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Body */}
              <form onSubmit={handleFormSubmit} className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 text-left">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Hari Ke-
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={formData.day}
                      onChange={(e) => setFormData({ ...formData, day: parseInt(e.target.value, 10) || 1 })}
                      className="w-full p-2.5 rounded-xl border border-rose-200 bg-rose-50/30 text-xs font-semibold focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Kategori
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as MilestoneChallenge['category'] })}
                      className="w-full p-2.5 rounded-xl border border-rose-200 bg-rose-50/30 text-xs font-semibold focus:outline-none focus:border-rose-500"
                    >
                      <option value="Snack & Food">Snack & Food</option>
                      <option value="Quality Time">Quality Time</option>
                      <option value="Relaxation">Relaxation</option>
                      <option value="Travel & Luxury">Travel & Luxury</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Judul Tantangan / Misi
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Sesi Kuliner Intimacy Berdua"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-rose-200 bg-rose-50/30 text-xs font-semibold focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Hadiah / Reward
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 1 Box Special Dubai Chewy Cookie"
                    value={formData.reward}
                    onChange={(e) => setFormData({ ...formData, reward: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-rose-200 bg-rose-50/30 text-xs font-semibold focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Deskripsi Tantangan
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Jelaskan keseruan misi harian ini..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-rose-200 bg-rose-50/30 text-xs focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Detail Cara Penukaran Hadiah
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Contoh: Voucher ini dapat ditukarkan kapan saja dengan ur bf..."
                    value={formData.rewardDetails}
                    onChange={(e) => setFormData({ ...formData, rewardDetails: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-rose-200 bg-rose-50/30 text-xs focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kode Voucher Unique
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: NMY-DAY1-COOKIE"
                    value={formData.voucherCode}
                    onChange={(e) => setFormData({ ...formData, voucherCode: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-rose-200 bg-rose-50/30 text-xs font-mono font-bold focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    URL Gambar Cover
                  </label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-rose-200 bg-rose-50/30 text-xs focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="pt-3 flex items-center justify-end gap-2 border-t border-rose-100">
                  <button
                    type="button"
                    onClick={() => setIsFormModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white shadow-md cursor-pointer"
                  >
                    {editingMilestone ? 'Simpan Perubahan' : 'Tambah Hadiah'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Header Banner Edit Modal */}
      <AnimatePresence>
        {isHeaderEditOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-rose-200 text-slate-800 my-auto max-h-[85vh] sm:max-h-[90vh] flex flex-col overflow-hidden"
            >
              {/* Fixed Header */}
              <div className="flex items-center justify-between p-4 sm:p-5 border-b border-rose-100 bg-white shrink-0">
                <div className="flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-rose-500" />
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 font-serif">
                    Edit Teks Banner Header Tab Milestone
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsHeaderEditOpen(false)}
                  className="p-1.5 rounded-full hover:bg-rose-100 text-slate-500 cursor-pointer shrink-0"
                  title="Tutup Modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Body */}
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (onUpdateHeader) {
                    await onUpdateHeader({
                      milestonesBadge: headerBadge,
                      milestonesTitle: headerTitle,
                      milestonesSubtitle: headerSubtitle
                    });
                  }
                  setIsHeaderEditOpen(false);
                }}
                className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 text-left"
              >
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Badge / Tagline Atas
                  </label>
                  <input
                    type="text"
                    required
                    value={headerBadge}
                    onChange={(e) => setHeaderBadge(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-rose-200 bg-rose-50/30 text-xs font-semibold focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Judul Utama Tab
                  </label>
                  <input
                    type="text"
                    required
                    value={headerTitle}
                    onChange={(e) => setHeaderTitle(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-rose-200 bg-rose-50/30 text-xs font-semibold focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Deskripsi / Subtitle Tab
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={headerSubtitle}
                    onChange={(e) => setHeaderSubtitle(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-rose-200 bg-rose-50/30 text-xs focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="pt-3 flex items-center justify-end gap-2 border-t border-rose-100">
                  <button
                    type="button"
                    onClick={() => setIsHeaderEditOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white shadow-md cursor-pointer"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Voucher Modal Detail Popup */}
      <VoucherModal
        milestone={selectedMilestone}
        onClose={() => setSelectedMilestone(null)}
        currentUser={currentUser}
      />
    </div>
  );
};
