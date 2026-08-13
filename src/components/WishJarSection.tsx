import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LoveNote, User } from '../types';
import { Mail, Send, Heart, Sparkles, Clock, Edit3, Trash2, X } from 'lucide-react';

interface WishJarSectionProps {
  notes: LoveNote[];
  onAddNote: (note: Omit<LoveNote, 'id' | 'createdAt'>) => void;
  currentUser: User | null;
  badge?: string;
  title?: string;
  subtitle?: string;
  onUpdateHeader?: (payload: { notesBadge?: string; notesTitle?: string; notesSubtitle?: string }) => Promise<boolean>;
  onEditNote?: (id: string, data: Partial<LoveNote>) => Promise<boolean>;
  onDeleteNote?: (id: string) => Promise<boolean>;
}

export const WishJarSection: React.FC<WishJarSectionProps> = ({
  notes,
  onAddNote,
  currentUser,
  badge = 'Jar of Love Notes & Wishes',
  title = 'Toples Pesan Cinta & Doa Manis',
  subtitle = 'Saling kirimkan pesan manis, ucapan terima kasih, dan doa-doa indah yang tersimpan selamanya.',
  onUpdateHeader,
  onEditNote,
  onDeleteNote
}) => {
  const [contentInput, setContentInput] = useState('');
  const [moodInput, setMoodInput] = useState<LoveNote['mood']>('romantic');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isErlangga = currentUser?.email.toLowerCase() === 'erlanggadewantara46@gmail.com';

  // Header edit modal state
  const [isHeaderEditOpen, setIsHeaderEditOpen] = useState(false);
  const [headerBadge, setHeaderBadge] = useState(badge);
  const [headerTitle, setHeaderTitle] = useState(title);
  const [headerSubtitle, setHeaderSubtitle] = useState(subtitle);

  // Edit Note Modal state
  const [editingNote, setEditingNote] = useState<LoveNote | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editMood, setEditMood] = useState<LoveNote['mood']>('romantic');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contentInput.trim() || !currentUser) return;

    setIsSubmitting(true);
    onAddNote({
      senderEmail: currentUser.email,
      senderName: currentUser.name,
      recipientEmail: currentUser.email === 'erlanggadewantara46@gmail.com' 
        ? 'namirafisilmiyasmin@gmail.com' 
        : 'erlanggadewantara46@gmail.com',
      content: contentInput.trim(),
      mood: moodInput
    });

    setContentInput('');
    setIsSubmitting(false);
  };

  const handleOpenEditNote = (note: LoveNote) => {
    setEditingNote(note);
    setEditContent(note.content);
    setEditMood(note.mood);
  };

  const handleSaveEditNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNote || !onEditNote) return;

    await onEditNote(editingNote.id, {
      content: editContent,
      mood: editMood
    });

    setEditingNote(null);
  };

  const handleDeleteNoteClick = async (id: string) => {
    if (!onDeleteNote) return;
    if (window.confirm('Yakin ingin menghapus pesan ini dari toples?')) {
      await onDeleteNote(id);
    }
  };

  const moodStyles = {
    romantic: 'bg-rose-100/90 border-rose-300 text-rose-950 shadow-rose-200/50',
    sweet: 'bg-pink-100/90 border-pink-300 text-pink-950 shadow-pink-200/50',
    playful: 'bg-amber-100/90 border-amber-300 text-amber-950 shadow-amber-200/50',
    grateful: 'bg-purple-100/90 border-purple-300 text-purple-950 shadow-purple-200/50'
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-900 via-rose-950 to-pink-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-rose-800/60">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-200 border border-rose-500/40">
              <Sparkles className="w-3.5 h-3.5 text-pink-300" /> {badge}
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

          <h2 className="text-2xl sm:text-3xl font-extrabold font-serif">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-rose-200/90 max-w-xl">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Write New Note Input Box */}
      <div className="bg-white rounded-3xl p-6 shadow-md border border-rose-200/80 space-y-4">
        <div className="flex items-center gap-2 text-rose-900 font-bold text-sm">
          <Mail className="w-4 h-4 text-rose-500" />
          <span>Tulis Pesan Cinta Baru</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            rows={3}
            required
            value={contentInput}
            onChange={(e) => setContentInput(e.target.value)}
            placeholder={`Tuliskan ucapan atau rasa sayangmu dari ${currentUser?.nickname || 'kamu'}...`}
            className="w-full p-4 rounded-2xl bg-rose-50/50 border border-rose-200/80 text-slate-800 text-sm focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 font-serif"
          />

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600">Suasana Pesan:</span>
              <select
                value={moodInput}
                onChange={(e) => setMoodInput(e.target.value as any)}
                className="px-3 py-1.5 rounded-xl border border-rose-200 text-xs font-semibold text-rose-900 bg-white"
              >
                <option value="romantic">🌹 Romantis</option>
                <option value="sweet">💖 Manis</option>
                <option value="playful">🎡 Lucu & Ceria</option>
                <option value="grateful">✨ Penuh Syukur</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !contentInput.trim()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Kirimkan Ke Toples Cinta</span>
            </button>
          </div>
        </form>
      </div>

      {/* Sticky Notes Wall */}
      {notes.length === 0 ? (
        <div className="bg-rose-50/60 rounded-3xl p-10 text-center border border-dashed border-rose-300 space-y-3">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center mx-auto">
            <Mail className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-rose-950 font-serif">
            Toples Pesan Cinta Masih Kosong
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
            Belum ada catatan harapan di Wish Jar saat ini. Tuliskan pesan manis atau doa pertamamu di atas untuk mengisi toples cinta ini! ✨
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => {
            const canEditOrDelete = isErlangga || note.senderEmail.toLowerCase() === currentUser?.email.toLowerCase();

            return (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`p-6 rounded-3xl border shadow-md relative flex flex-col justify-between space-y-4 font-serif ${
                  moodStyles[note.mood] || moodStyles.romantic
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-rose-900/10 pb-2">
                    <span className="text-xs font-bold font-sans uppercase tracking-wider text-rose-800">
                      Dari: {note.senderName}
                    </span>
                    
                    <div className="flex items-center gap-1.5">
                      {canEditOrDelete && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleOpenEditNote(note)}
                            className="p-1 rounded-full hover:bg-rose-200/60 text-slate-700 transition-colors cursor-pointer"
                            title="Edit Pesan Ini"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteNoteClick(note.id)}
                            className="p-1 rounded-full hover:bg-rose-200/60 text-rose-700 transition-colors cursor-pointer"
                            title="Hapus Pesan Ini"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                      <Heart className="w-4 h-4 text-rose-500 fill-rose-500/20" />
                    </div>
                  </div>

                  <p className="text-sm leading-relaxed italic text-slate-800">
                    "{note.content}"
                  </p>
                </div>

                <div className="text-[11px] font-sans text-slate-500 flex items-center justify-between pt-2 border-t border-rose-900/10">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-rose-400" />
                    {new Date(note.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                  <span className="text-rose-700 font-semibold">
                    #LoveNote
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Edit Note Modal */}
      <AnimatePresence>
        {editingNote && (
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
                    Edit Pesan Cinta
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingNote(null)}
                  className="p-1.5 rounded-full hover:bg-rose-100 text-slate-500 cursor-pointer shrink-0"
                  title="Tutup Modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Form Body */}
              <form onSubmit={handleSaveEditNote} className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 text-left font-serif">
                <div>
                  <label className="block text-xs font-bold font-sans text-slate-700 mb-1">
                    Isi Pesan
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full p-3 rounded-xl border border-rose-200 bg-rose-50/30 text-sm focus:outline-none focus:border-rose-500 font-serif"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold font-sans text-slate-700 mb-1">
                    Suasana Pesan
                  </label>
                  <select
                    value={editMood}
                    onChange={(e) => setEditMood(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-rose-200 bg-rose-50/30 text-xs font-semibold focus:outline-none focus:border-rose-500"
                  >
                    <option value="romantic">🌹 Romantis</option>
                    <option value="sweet">💖 Manis</option>
                    <option value="playful">🎡 Lucu & Ceria</option>
                    <option value="grateful">✨ Penuh Syukur</option>
                  </select>
                </div>

                <div className="pt-3 flex items-center justify-end gap-2 border-t border-rose-100 font-sans">
                  <button
                    type="button"
                    onClick={() => setEditingNote(null)}
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
                    Edit Teks Banner Header Wish Jar
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

              {/* Scrollable Form Body */}
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (onUpdateHeader) {
                    await onUpdateHeader({
                      notesBadge: headerBadge,
                      notesTitle: headerTitle,
                      notesSubtitle: headerSubtitle
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
    </div>
  );
};
