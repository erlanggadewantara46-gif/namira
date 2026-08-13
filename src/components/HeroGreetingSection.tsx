import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from '../types';
import { 
  DEFAULT_GREETING_TITLE, 
  DEFAULT_GREETING_MESSAGE,
  DEFAULT_HERO_BADGE,
  DEFAULT_HERO_TITLE,
  DEFAULT_HERO_SUBTITLE,
  DEFAULT_LETTER_TITLE,
  DEFAULT_LETTER_BODY
} from '../data/initialData';
import { Heart, Sparkles, Wand2, Quote, X, Gift, Edit3, Check, Save } from 'lucide-react';

const heroCoverImg = '/src/assets/images/hero_romantic_cover_1786555470247.jpg';

interface HeroGreetingSectionProps {
  currentUser: User | null;
  greetingTitle?: string;
  greetingMessage?: string;
  heroBadge?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  letterTitle?: string;
  letterBody?: string;
  relationshipStartDate?: string;
  stat1Label?: string;
  stat1Sublabel?: string;
  stat2Value?: string;
  stat2Label?: string;
  stat3Value?: string;
  stat3Label?: string;
  totalMilestonesCount?: number;
  onUpdateHeroContent?: (payload: {
    greetingTitle?: string;
    greetingMessage?: string;
    heroBadge?: string;
    heroTitle?: string;
    heroSubtitle?: string;
    letterTitle?: string;
    letterBody?: string;
    relationshipStartDate?: string;
    stat1Label?: string;
    stat1Sublabel?: string;
    stat2Value?: string;
    stat2Label?: string;
    stat3Value?: string;
    stat3Label?: string;
  }) => Promise<boolean>;
  onNavigateToMilestones: () => void;
}

export const HeroGreetingSection: React.FC<HeroGreetingSectionProps> = ({
  currentUser,
  greetingTitle = DEFAULT_GREETING_TITLE,
  greetingMessage = DEFAULT_GREETING_MESSAGE,
  heroBadge = DEFAULT_HERO_BADGE,
  heroTitle = DEFAULT_HERO_TITLE,
  heroSubtitle = DEFAULT_HERO_SUBTITLE,
  letterTitle = DEFAULT_LETTER_TITLE,
  letterBody = DEFAULT_LETTER_BODY,
  relationshipStartDate = '2024-09-28',
  stat1Label = 'Hari Bersama ❤️',
  stat1Sublabel = '(Sejak 28 Sept 2024)',
  stat2Value = '',
  stat2Label = 'Milestone Challenges 🎁',
  stat3Value = 'Selamanya',
  stat3Label = 'Janji Setia ur bf 💍',
  totalMilestonesCount = 9,
  onUpdateHeroContent,
  onNavigateToMilestones
}) => {
  const [letterModalOpen, setLetterModalOpen] = useState(false);
  const [aiLetterText, setAiLetterText] = useState('');
  const [isGeneratingLetter, setIsGeneratingLetter] = useState(false);
  const [daysCount, setDaysCount] = useState(0);

  // Edit State (Only accessible for Erlangga)
  const [isEditing, setIsEditing] = useState(false);
  const [editHeroBadge, setEditHeroBadge] = useState(heroBadge);
  const [editHeroTitle, setEditHeroTitle] = useState(heroTitle);
  const [editHeroSubtitle, setEditHeroSubtitle] = useState(heroSubtitle);
  const [editGreetingTitle, setEditGreetingTitle] = useState(greetingTitle);
  const [editGreetingMessage, setEditGreetingMessage] = useState(greetingMessage);
  const [editLetterTitle, setEditLetterTitle] = useState(letterTitle);
  const [editLetterBody, setEditLetterBody] = useState(letterBody);

  // Edit Stat Cards State
  const [editStartDate, setEditStartDate] = useState(relationshipStartDate);
  const [editStat1Label, setEditStat1Label] = useState(stat1Label);
  const [editStat1Sublabel, setEditStat1Sublabel] = useState(stat1Sublabel);
  const [editStat2Value, setEditStat2Value] = useState(stat2Value);
  const [editStat2Label, setEditStat2Label] = useState(stat2Label);
  const [editStat3Value, setEditStat3Value] = useState(stat3Value);
  const [editStat3Label, setEditStat3Label] = useState(stat3Label);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Inline edit in love letter modal
  const [isEditingInLetterModal, setIsEditingInLetterModal] = useState(false);

  const isErlangga = currentUser?.email?.toLowerCase() === 'erlanggadewantara46@gmail.com';

  useEffect(() => {
    setEditHeroBadge(heroBadge);
    setEditHeroTitle(heroTitle);
    setEditHeroSubtitle(heroSubtitle);
    setEditGreetingTitle(greetingTitle);
    setEditGreetingMessage(greetingMessage);
    setEditLetterTitle(letterTitle);
    setEditLetterBody(letterBody);
    setEditStartDate(relationshipStartDate);
    setEditStat1Label(stat1Label);
    setEditStat1Sublabel(stat1Sublabel);
    setEditStat2Value(stat2Value);
    setEditStat2Label(stat2Label);
    setEditStat3Value(stat3Value);
    setEditStat3Label(stat3Label);
  }, [
    heroBadge, heroTitle, heroSubtitle, greetingTitle, greetingMessage,
    letterTitle, letterBody, relationshipStartDate, stat1Label,
    stat1Sublabel, stat2Value, stat2Label, stat3Value, stat3Label
  ]);

  // Calculate days together from relationship start date in WIB (UTC+7)
  useEffect(() => {
    const updateWibDaysCount = () => {
      try {
        const startDateStr = relationshipStartDate || '2024-09-28';
        const wibFormatter = new Intl.DateTimeFormat('en-CA', {
          timeZone: 'Asia/Jakarta',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        });
        const todayWibStr = wibFormatter.format(new Date());

        const [sY, sM, sD] = startDateStr.split('-').map(Number);
        const [tY, tM, tD] = todayWibStr.split('-').map(Number);

        const startUtc = Date.UTC(sY, sM - 1, sD);
        const todayUtc = Date.UTC(tY, tM - 1, tD);

        const diffDays = Math.floor((todayUtc - startUtc) / (1000 * 60 * 60 * 24)) + 1;
        setDaysCount(diffDays > 0 ? diffDays : 1);
      } catch (e) {
        console.error('Error calculating WIB days:', e);
      }
    };

    updateWibDaysCount();
    // Automatically re-check every 30 seconds so it increments past 12:00 AM WIB (00:00 WIB)
    const interval = setInterval(updateWibDaysCount, 30000);
    return () => clearInterval(interval);
  }, [relationshipStartDate]);

  const handleGenerateLetter = async () => {
    setIsGeneratingLetter(true);
    setLetterModalOpen(true);
    setIsEditingInLetterModal(false);

    try {
      const res = await fetch('/api/generate-romantic-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mood: 'sangat puitis, hangat, manis, dan romantis',
          topic: 'Ulang Tahun Namira Fisilmi Yasmin'
        })
      });

      const data = await res.json();
      if (data.success) {
        setAiLetterText(data.text);
      }
    } catch (err) {
      console.error('Failed to generate letter:', err);
    } finally {
      setIsGeneratingLetter(false);
    }
  };

  const handleSaveAll = async () => {
    if (!onUpdateHeroContent) return;
    setIsSaving(true);
    setSaveSuccess(false);

    const ok = await onUpdateHeroContent({
      heroBadge: editHeroBadge.trim(),
      heroTitle: editHeroTitle.trim(),
      heroSubtitle: editHeroSubtitle.trim(),
      greetingTitle: editGreetingTitle.trim(),
      greetingMessage: editGreetingMessage.trim(),
      letterTitle: editLetterTitle.trim(),
      letterBody: editLetterBody.trim(),
      relationshipStartDate: editStartDate.trim(),
      stat1Label: editStat1Label.trim(),
      stat1Sublabel: editStat1Sublabel.trim(),
      stat2Value: editStat2Value.trim(),
      stat2Label: editStat2Label.trim(),
      stat3Value: editStat3Value.trim(),
      stat3Label: editStat3Label.trim(),
    });

    setIsSaving(false);
    if (ok) {
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setIsEditing(false);
        setIsEditingInLetterModal(false);
      }, 1200);
    }
  };

  const handleApplyAiTextToEdit = () => {
    if (aiLetterText) {
      setEditLetterBody(aiLetterText);
      setIsEditing(true);
      setLetterModalOpen(false);
    }
  };

  return (
    <div className="space-y-12">
      {/* Main Banner Hero */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-rose-200/80 bg-gradient-to-b from-rose-950 via-slate-900 to-rose-950 text-white">
        {/* Hero Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroCoverImg}
            alt="Romantic Birthday Banner"
            className="w-full h-full object-cover opacity-35 scale-105 filter blur-[1px]"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-rose-950 via-rose-950/70 to-rose-950/30" />
        </div>

        {/* Floating Admin Quick Edit Button on Hero */}
        {isErlangga && (
          <div className="absolute top-4 right-4 z-20">
            <button
              onClick={() => setIsEditing(true)}
              className="px-3.5 py-2 rounded-xl bg-amber-500/90 hover:bg-amber-500 text-slate-950 font-bold text-xs shadow-lg backdrop-blur-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Halaman Depan</span>
            </button>
          </div>
        )}

        {/* Hero Banner Body */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 py-12 md:py-20 text-center space-y-8">
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/20 border border-rose-400/40 backdrop-blur-md text-rose-200 text-xs sm:text-sm font-semibold shadow-lg"
          >
            <Sparkles className="w-4 h-4 text-pink-300 animate-spin" />
            <span>{heroBadge}</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-rose-100 via-pink-100 to-amber-200 bg-clip-text text-transparent leading-tight font-serif whitespace-pre-line">
              {heroTitle}
            </h1>
            <p className="text-sm sm:text-lg text-rose-100/90 max-w-2xl mx-auto font-light leading-relaxed whitespace-pre-line">
              {heroSubtitle}
            </p>
          </motion.div>

          {/* Action CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-4 pt-4"
          >
            <button
              onClick={onNavigateToMilestones}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-600 hover:to-pink-600 text-white font-bold text-sm sm:text-base shadow-xl shadow-rose-900/50 hover:shadow-2xl transition-all transform hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer"
            >
              <Gift className="w-5 h-5" />
              <span>Buka 7-Day & Milestone Challenge</span>
            </button>

            <button
              onClick={() => {
                setAiLetterText('');
                setLetterModalOpen(true);
              }}
              className="px-6 py-3.5 rounded-2xl bg-white/15 hover:bg-white/25 border border-rose-300/40 text-rose-100 font-semibold text-sm sm:text-base backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Wand2 className="w-5 h-5 text-pink-300" />
              <span>Bacakan Surat Cinta Puitis 💌</span>
            </button>
          </motion.div>
        </div>
      </div>

      {/* Deep Heartfelt Romantic Birthday Letter Block */}
      <div className="bg-gradient-to-br from-rose-50 via-white to-pink-50 rounded-3xl p-6 sm:p-10 border border-rose-200/70 shadow-lg text-slate-800 space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-pink-200/30 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between gap-3 border-b border-rose-200/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-rose-500 text-white shadow-md">
              <Quote className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-rose-950 font-serif">
                {greetingTitle}
              </h2>
              <p className="text-xs text-rose-700">
                Ungkapan hati yang jujur & tulus untuk Namira Fisilmi Yasmin
              </p>
            </div>
          </div>

          {/* EDIT BUTTON: ONLY VISIBLE IF CURRENT USER IS ERLANGGA */}
          {isErlangga && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-all shadow-md hover:shadow-lg cursor-pointer shrink-0"
              title="Edit Tampilan Halaman Depan"
            >
              <Edit3 className="w-4 h-4" />
              <span className="hidden sm:inline">Edit Halaman Depan</span>
            </button>
          )}
        </div>

        {/* Clean Formatted Display for Namira & Erlangga */}
        <div className="prose prose-rose max-w-none text-slate-700 text-sm sm:text-base leading-relaxed whitespace-pre-line font-serif">
          {greetingMessage}
        </div>
      </div>

      {/* ADMIN ALL-IN-ONE EDIT MODAL FOR ERLANGGA */}
      <AnimatePresence>
        {isEditing && isErlangga && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-rose-200 text-slate-800 my-auto max-h-[85vh] sm:max-h-[90vh] flex flex-col overflow-hidden"
            >
              {/* Fixed Header */}
              <div className="flex items-center justify-between p-4 sm:p-5 border-b border-rose-200 bg-white shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-amber-500 text-slate-950 shadow-md">
                    <Edit3 className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-xl font-bold text-rose-950 font-serif">
                      Edit Konten Halaman Depan & Surat Cinta
                    </h3>
                    <p className="text-xs text-rose-600 font-medium">
                      Ubah teks banner depan, pesan ucapan, maupun modal surat cinta untuk Namira
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="p-2 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer shrink-0"
                  title="Tutup Modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Body */}
              <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
                {/* Section 1: Hero Banner Depan */}
                <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-rose-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-rose-500" />
                    <span>1. Banner Besar Paling Depan</span>
                  </h4>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Label Badge Atas Banner
                    </label>
                    <input
                      type="text"
                      value={editHeroBadge}
                      onChange={(e) => setEditHeroBadge(e.target.value)}
                      placeholder="Spesial Untuk Namira Fisilmi Yasmin 🌹"
                      className="w-full p-2.5 rounded-xl border border-rose-200 bg-white text-xs font-semibold focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Judul Banner Utama
                    </label>
                    <input
                      type="text"
                      value={editHeroTitle}
                      onChange={(e) => setEditHeroTitle(e.target.value)}
                      placeholder="Selamat Ulang Tahun, Bidadari Tercintaku!"
                      className="w-full p-2.5 rounded-xl border border-rose-200 bg-white text-xs font-bold focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Subjudul / Deskripsi Banner Utama
                    </label>
                    <textarea
                      rows={2}
                      value={editHeroSubtitle}
                      onChange={(e) => setEditHeroSubtitle(e.target.value)}
                      placeholder="Di hari yang indah ini, dunia bersuka cita..."
                      className="w-full p-2.5 rounded-xl border border-rose-200 bg-white text-xs focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                {/* Section 2: Pesan Ucapan Hati (Greeting Section) */}
                <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-rose-900 flex items-center gap-1.5">
                    <Quote className="w-4 h-4 text-rose-500" />
                    <span>2. Pesan Ucapan Ulang Tahun (Surat Hati)</span>
                  </h4>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Judul Pesan Ucapan
                    </label>
                    <input
                      type="text"
                      value={editGreetingTitle}
                      onChange={(e) => setEditGreetingTitle(e.target.value)}
                      placeholder="Pesan Spesial Dari ur bf"
                      className="w-full p-2.5 rounded-xl border border-rose-200 bg-white text-xs font-semibold focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Isi Pesan Ucapan (Dapat Menggunakan Paragraf)
                    </label>
                    <textarea
                      rows={6}
                      value={editGreetingMessage}
                      onChange={(e) => setEditGreetingMessage(e.target.value)}
                      placeholder="Tuliskan kata-kata dan ucapan indah untuk Namira..."
                      className="w-full p-3 rounded-xl border border-rose-200 bg-white text-xs sm:text-sm font-serif leading-relaxed focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                {/* Section 3: Modal Surat Cinta Puitis */}
                <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-rose-900 flex items-center gap-1.5">
                      <Wand2 className="w-4 h-4 text-rose-500" />
                      <span>3. Modal Popup Surat Cinta Puitis Untuk Namira</span>
                    </h4>

                    <button
                      type="button"
                      onClick={handleGenerateLetter}
                      className="text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer bg-white px-3 py-1 rounded-lg border border-rose-200"
                    >
                      <Wand2 className="w-3.5 h-3.5" />
                      <span>Generate Teks AI</span>
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Judul Popup Surat Cinta
                    </label>
                    <input
                      type="text"
                      value={editLetterTitle}
                      onChange={(e) => setEditLetterTitle(e.target.value)}
                      placeholder="Surat Cinta Puitis Untuk Namira"
                      className="w-full p-2.5 rounded-xl border border-rose-200 bg-white text-xs font-semibold focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Isi Teks Surat Cinta Puitis
                    </label>
                    <textarea
                      rows={6}
                      value={editLetterBody}
                      onChange={(e) => setEditLetterBody(e.target.value)}
                      placeholder="Tuliskan puisi atau surat puitis khusus untuk Namira..."
                      className="w-full p-3 rounded-xl border border-rose-200 bg-white text-xs sm:text-sm font-serif leading-relaxed focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                {/* Section 4: Kartu Statistik & Status Hubungan (3 Kotak Banner Depan) */}
                <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-rose-900 flex items-center gap-1.5">
                    <Heart className="w-4 h-4 text-rose-500" />
                    <span>4. Edit 3 Kotak Statistik & Hari Bersama (Banner Depan)</span>
                  </h4>

                  {/* Date Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Tanggal Jadian / Mulai Hubungan (Format: YYYY-MM-DD)
                    </label>
                    <input
                      type="text"
                      value={editStartDate}
                      onChange={(e) => setEditStartDate(e.target.value)}
                      placeholder="2024-09-28"
                      className="w-full p-2.5 rounded-xl border border-rose-200 bg-white text-xs font-semibold focus:outline-none focus:border-rose-500 font-mono"
                    />
                    <p className="text-[10px] text-rose-600 mt-1">
                      Jumlah hari pada Kotak 1 akan otomatis terhitung dan bertambah +1 setiap melewati jam 12 malam WIB berdasarkan tanggal ini.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Kotak 1: Label Utama (bawah angka hari)
                      </label>
                      <input
                        type="text"
                        value={editStat1Label}
                        onChange={(e) => setEditStat1Label(e.target.value)}
                        placeholder="Hari Bersama ❤️"
                        className="w-full p-2.5 rounded-xl border border-rose-200 bg-white text-xs font-semibold focus:outline-none focus:border-rose-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Kotak 1: Sub-Label Tambahan (keterangan)
                      </label>
                      <input
                        type="text"
                        value={editStat1Sublabel}
                        onChange={(e) => setEditStat1Sublabel(e.target.value)}
                        placeholder="(Sejak 28 Sept 2024)"
                        className="w-full p-2.5 rounded-xl border border-rose-200 bg-white text-xs font-semibold focus:outline-none focus:border-rose-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Kotak 2: Angka / Teks Kustom
                      </label>
                      <input
                        type="text"
                        value={editStat2Value}
                        onChange={(e) => setEditStat2Value(e.target.value)}
                        placeholder="Kosongkan untuk otomatis mengikuti jumlah milestone"
                        className="w-full p-2.5 rounded-xl border border-rose-200 bg-white text-xs font-semibold focus:outline-none focus:border-rose-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Kotak 2: Label Utama
                      </label>
                      <input
                        type="text"
                        value={editStat2Label}
                        onChange={(e) => setEditStat2Label(e.target.value)}
                        placeholder="Milestone Challenges 🎁"
                        className="w-full p-2.5 rounded-xl border border-rose-200 bg-white text-xs font-semibold focus:outline-none focus:border-rose-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Kotak 3: Teks Utama (Besar)
                      </label>
                      <input
                        type="text"
                        value={editStat3Value}
                        onChange={(e) => setEditStat3Value(e.target.value)}
                        placeholder="Selamanya"
                        className="w-full p-2.5 rounded-xl border border-rose-200 bg-white text-xs font-semibold focus:outline-none focus:border-rose-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Kotak 3: Label Utama
                      </label>
                      <input
                        type="text"
                        value={editStat3Label}
                        onChange={(e) => setEditStat3Label(e.target.value)}
                        placeholder="Janji Setia ur bf 💍"
                        className="w-full p-2.5 rounded-xl border border-rose-200 bg-white text-xs font-semibold focus:outline-none focus:border-rose-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {saveSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Semua perubahan berhasil disimpan! Namira akan melihat tampilan baru ini.</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-rose-100">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Batal
                </button>

                <button
                  type="button"
                  onClick={handleSaveAll}
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? (
                    <span>Menyimpan...</span>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Simpan Seluruh Perubahan</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* POPUP MODAL SURAT CINTA PUITIS UNTUK NAMIRA */}
      <AnimatePresence>
        {letterModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-2xl bg-gradient-to-br from-rose-50 via-white to-pink-50 rounded-3xl shadow-2xl border border-rose-300 text-slate-800 my-auto max-h-[85vh] sm:max-h-[90vh] flex flex-col overflow-hidden"
            >
              {/* Fixed Header */}
              <div className="flex items-center justify-between p-4 sm:p-5 border-b border-rose-200 bg-white/90 backdrop-blur-sm shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 sm:p-3 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white shadow-md">
                    <Wand2 className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-xl font-bold text-rose-950 font-serif">
                      {letterTitle}
                    </h3>
                    <p className="text-xs text-rose-600">
                      Ungkapan puitis & cinta terindah untuk Namira Fisilmi Yasmin
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isErlangga && !isGeneratingLetter && (
                    <button
                      type="button"
                      onClick={() => setIsEditingInLetterModal(!isEditingInLetterModal)}
                      className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-sm hover:bg-amber-600 cursor-pointer shrink-0"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{isEditingInLetterModal ? 'Batal Edit' : 'Edit Surat Ini'}</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setLetterModalOpen(false);
                      setIsEditingInLetterModal(false);
                    }}
                    className="p-2 rounded-full bg-rose-100 text-rose-800 hover:bg-rose-200 transition-colors cursor-pointer shrink-0"
                    title="Tutup Modal"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Scrollable Body */}
              <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">

              {isGeneratingLetter ? (
                <div className="py-12 text-center space-y-3">
                  <Sparkles className="w-8 h-8 text-rose-500 animate-spin mx-auto" />
                  <p className="text-sm font-semibold text-rose-800">
                    ur bf sedang merangkai kata-kata cinta terindah...
                  </p>
                </div>
              ) : isEditingInLetterModal && isErlangga ? (
                <div className="space-y-4 text-left">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Judul Surat Cinta
                    </label>
                    <input
                      type="text"
                      value={editLetterTitle}
                      onChange={(e) => setEditLetterTitle(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-rose-300 text-xs font-bold focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Isi Surat Cinta Puitis
                    </label>
                    <textarea
                      rows={8}
                      value={editLetterBody}
                      onChange={(e) => setEditLetterBody(e.target.value)}
                      className="w-full p-3 rounded-xl border border-rose-300 text-xs sm:text-sm font-serif leading-relaxed focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={handleSaveAll}
                      className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white shadow-md flex items-center gap-1.5 cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>Simpan Surat Ini</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white/80 p-5 rounded-2xl border border-rose-200/80 shadow-inner whitespace-pre-line text-sm sm:text-base leading-relaxed font-serif text-slate-800">
                  {aiLetterText || letterBody}
                </div>
              )}

              <div className="pt-2 flex items-center justify-between gap-3">
                {isErlangga && aiLetterText ? (
                  <button
                    onClick={handleApplyAiTextToEdit}
                    className="px-4 py-2 rounded-xl font-bold text-xs bg-rose-600 text-white hover:bg-rose-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Gunakan Teks AI Ini</span>
                  </button>
                ) : <div />}

                <button
                  onClick={() => {
                    setLetterModalOpen(false);
                    setIsEditingInLetterModal(false);
                  }}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs bg-rose-500 text-white hover:bg-rose-600 transition-colors shadow-sm cursor-pointer"
                >
                  Tutup Surat
                </button>
              </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
