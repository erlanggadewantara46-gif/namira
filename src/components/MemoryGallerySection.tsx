import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MemoryPhoto, User } from '../types';
import { Heart, Plus, MapPin, Calendar, Image as ImageIcon, X, Sparkles, Filter, Edit3, Trash2, Upload, Loader2, Check } from 'lucide-react';

interface MemoryGallerySectionProps {
  memories: MemoryPhoto[];
  onAddMemory: (mem: Omit<MemoryPhoto, 'id' | 'likes' | 'lovedByNamira'>) => void;
  onLikeMemory: (id: string) => void;
  currentUser: User | null;
  badge?: string;
  title?: string;
  subtitle?: string;
  onUpdateHeader?: (payload: { galleryBadge?: string; galleryTitle?: string; gallerySubtitle?: string }) => Promise<boolean>;
  onEditMemory?: (id: string, data: Partial<MemoryPhoto>) => Promise<boolean>;
  onDeleteMemory?: (id: string) => Promise<boolean>;
  onRenameCategory?: (oldCategory: string, newCategory: string) => Promise<boolean>;
}

export const MemoryGallerySection: React.FC<MemoryGallerySectionProps> = ({
  memories,
  onAddMemory,
  onLikeMemory,
  currentUser,
  badge = 'Galeri Foto Kenangan',
  title = 'Perjalanan Indah Erlangga & Namira',
  subtitle = 'Setiap foto menyimpan cerita manis, tawa, dan kenangan tak terbalaskan sepanjang hubungan kita.',
  onUpdateHeader,
  onEditMemory,
  onDeleteMemory,
  onRenameCategory
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [activePhotoModal, setActivePhotoModal] = useState<MemoryPhoto | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const isErlangga = currentUser?.email.toLowerCase() === 'erlanggadewantara46@gmail.com';

  // Header edit modal state
  const [isHeaderEditOpen, setIsHeaderEditOpen] = useState(false);
  const [headerBadge, setHeaderBadge] = useState(badge);
  const [headerTitle, setHeaderTitle] = useState(title);
  const [headerSubtitle, setHeaderSubtitle] = useState(subtitle);

  // Custom Category States
  const [isCustomCategoryAdd, setIsCustomCategoryAdd] = useState(false);
  const [isCustomCategoryEdit, setIsCustomCategoryEdit] = useState(false);

  // Rename Category Modal State
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [oldCategoryToRename, setOldCategoryToRename] = useState('');
  const [newCategoryNameInput, setNewCategoryNameInput] = useState('');
  const [isRenamingCategory, setIsRenamingCategory] = useState(false);

  // Edit Memory Modal State
  const [editingPhoto, setEditingPhoto] = useState<MemoryPhoto | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editCategory, setEditCategory] = useState<string>('Momen Spesial');
  const [isUploadingEdit, setIsUploadingEdit] = useState(false);

  // Form State for Adding New Memory
  const [titleInput, setTitleInput] = useState('');
  const [dateInput, setDateInput] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [descriptionInput, setDescriptionInput] = useState('');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [categoryInput, setCategoryInput] = useState<string>('Momen Spesial');
  const [isUploadingAdd, setIsUploadingAdd] = useState(false);

  const addFileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  // Compression helper to convert image file from HP/Gallery into optimized Data URL
  const compressAndReadImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round((height * MAX_WIDTH) / width);
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round((width * MAX_HEIGHT) / height);
              height = MAX_HEIGHT;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
            resolve(dataUrl);
          } else {
            resolve(e.target?.result as string);
          }
        };
        img.onerror = () => resolve(e.target?.result as string);
        img.src = e.target?.result as string;
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleAddFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingAdd(true);
      const dataUrl = await compressAndReadImage(file);
      setImageUrlInput(dataUrl);
    } catch (err) {
      console.error('Error reading photo:', err);
      alert('Gagal membaca file foto. Silakan coba lagi.');
    } finally {
      setIsUploadingAdd(false);
    }
  };

  const handleEditFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingEdit(true);
      const dataUrl = await compressAndReadImage(file);
      setEditImageUrl(dataUrl);
    } catch (err) {
      console.error('Error reading photo:', err);
      alert('Gagal membaca file foto. Silakan coba lagi.');
    } finally {
      setIsUploadingEdit(false);
    }
  };

  const defaultCategories = ['Kencan Pertama', 'Liburan', 'Ulang Tahun', 'Momen Spesial', 'Sehari-hari'];
  const categoriesFromMemories = Array.from(new Set(memories.map(m => m.category).filter(Boolean)));
  const availableCategories = Array.from(new Set([...defaultCategories, ...categoriesFromMemories]));
  const filterCategories = ['Semua', ...availableCategories];

  const filteredMemories = memories.filter(m => {
    if (selectedCategory === 'Semua') return true;
    return m.category === selectedCategory;
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleInput || !descriptionInput) return;

    onAddMemory({
      title: titleInput,
      date: dateInput || new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      location: locationInput || 'Jakarta',
      description: descriptionInput,
      imageUrl: imageUrlInput.trim() || 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?q=80&w=1000&auto=format&fit=crop',
      category: categoryInput
    });

    // Reset Form
    setTitleInput('');
    setDateInput('');
    setLocationInput('');
    setDescriptionInput('');
    setImageUrlInput('');
    setIsAddModalOpen(false);
  };

  const handleOpenEditPhoto = (photo: MemoryPhoto, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingPhoto(photo);
    setEditTitle(photo.title);
    setEditDate(photo.date);
    setEditLocation(photo.location);
    setEditDescription(photo.description);
    setEditImageUrl(photo.imageUrl);
    setEditCategory(photo.category);
  };

  const handleSaveEditPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPhoto || !onEditMemory) return;

    await onEditMemory(editingPhoto.id, {
      title: editTitle,
      date: editDate,
      location: editLocation,
      description: editDescription,
      imageUrl: editImageUrl,
      category: editCategory
    });

    setEditingPhoto(null);
    if (activePhotoModal?.id === editingPhoto.id) {
      setActivePhotoModal({
        ...editingPhoto,
        title: editTitle,
        date: editDate,
        location: editLocation,
        description: editDescription,
        imageUrl: editImageUrl,
        category: editCategory
      });
    }
  };

  const handleDeletePhoto = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!onDeleteMemory) return;
    if (window.confirm('Yakin ingin menghapus foto kenangan ini?')) {
      await onDeleteMemory(id);
      if (activePhotoModal?.id === id) {
        setActivePhotoModal(null);
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-rose-900 via-rose-950 to-pink-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-rose-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
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

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-rose-900/50 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Kenangan Baru</span>
        </button>
      </div>

      {/* Category Filter Pills & Admin Category Manager */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-rose-50/50 p-3 rounded-2xl border border-rose-100">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
          {filterCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-rose-500 text-white shadow-md'
                  : 'bg-white text-rose-900 hover:bg-rose-100 border border-rose-200/80'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {isErlangga && (
          <button
            type="button"
            onClick={() => {
              setOldCategoryToRename(availableCategories[0] || 'Momen Spesial');
              setNewCategoryNameInput(availableCategories[0] || '');
              setIsRenameModalOpen(true);
            }}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 transition-colors flex items-center justify-center gap-1.5 shrink-0 shadow-sm cursor-pointer"
            title="Ubah Nama Kategori Foto"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Ubah Nama Kategori</span>
          </button>
        )}
      </div>

      {/* Grid Photo Gallery */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMemories.map((photo) => (
          <motion.div
            key={photo.id}
            whileHover={{ y: -4 }}
            onClick={() => setActivePhotoModal(photo)}
            className="group relative bg-white rounded-3xl overflow-hidden border border-rose-200/80 shadow-md hover:shadow-xl transition-all cursor-pointer flex flex-col"
          >
            <div className="relative h-64 overflow-hidden bg-rose-100">
              <img
                src={photo.imageUrl}
                alt={photo.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

              <div className="absolute top-3 left-3">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-600 text-white shadow-sm backdrop-blur-md">
                  {photo.category}
                </span>
              </div>

              {/* Action Buttons (Like / Edit / Delete) */}
              <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                {isErlangga && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => handleOpenEditPhoto(photo, e)}
                      className="p-1.5 rounded-full bg-amber-500/80 hover:bg-amber-500 text-slate-950 backdrop-blur-md transition-all cursor-pointer shadow-sm"
                      title="Edit Photo"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDeletePhoto(photo.id, e)}
                      className="p-1.5 rounded-full bg-rose-600/80 hover:bg-rose-600 text-white backdrop-blur-md transition-all cursor-pointer shadow-sm"
                      title="Hapus Photo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onLikeMemory(photo.id);
                  }}
                  className={`p-2 rounded-full backdrop-blur-md transition-all cursor-pointer ${
                    photo.lovedByNamira 
                      ? 'bg-rose-500 text-white shadow-md scale-110' 
                      : 'bg-black/40 text-white hover:bg-rose-500'
                  }`}
                  title="Sukai Foto"
                >
                  <Heart className={`w-4 h-4 ${photo.lovedByNamira ? 'fill-white' : ''}`} />
                </button>
              </div>

              <div className="absolute bottom-3 left-4 right-4 text-white space-y-1">
                <div className="flex items-center gap-3 text-[11px] text-rose-200 font-medium">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-rose-400" /> {photo.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-rose-400" /> {photo.location}
                  </span>
                </div>
                <h3 className="text-base font-bold drop-shadow-md truncate">
                  {photo.title}
                </h3>
              </div>
            </div>

            <div className="p-4 bg-white flex items-center justify-between text-xs text-slate-600 border-t border-rose-100">
              <p className="line-clamp-2 italic text-slate-700">
                "{photo.description}"
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Lightbox Photo Detail Modal */}
      <AnimatePresence>
        {activePhotoModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-3xl bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-rose-500/30 text-white my-auto max-h-[85vh] sm:max-h-[90vh] flex flex-col"
            >
              <button
                type="button"
                onClick={() => setActivePhotoModal(null)}
                className="absolute top-3 right-3 z-30 p-2 rounded-full bg-black/70 hover:bg-black text-white transition-colors cursor-pointer border border-white/20 shadow-md"
                title="Tutup Modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 overflow-y-auto max-h-[85vh] sm:max-h-[90vh]">
                <div className="h-64 sm:h-72 md:h-full bg-black flex items-center justify-center">
                  <img
                    src={activePhotoModal.imageUrl}
                    alt={activePhotoModal.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="p-5 sm:p-6 md:p-8 space-y-5 flex flex-col justify-between bg-slate-900">
                  <div className="space-y-3">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/40 inline-block">
                      {activePhotoModal.category}
                    </span>

                    <h3 className="text-lg sm:text-xl font-bold font-serif text-rose-100">
                      {activePhotoModal.title}
                    </h3>

                    <div className="flex flex-wrap gap-4 text-xs text-rose-300/80">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-rose-400" /> {activePhotoModal.date}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-rose-400" /> {activePhotoModal.location}
                      </span>
                    </div>

                    <p className="text-sm text-slate-300 leading-relaxed font-serif italic pt-2 border-t border-slate-800">
                      "{activePhotoModal.description}"
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onLikeMemory(activePhotoModal.id)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                          activePhotoModal.lovedByNamira
                            ? 'bg-rose-500 text-white shadow-md'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${activePhotoModal.lovedByNamira ? 'fill-white' : ''}`} />
                        <span>{activePhotoModal.lovedByNamira ? 'Disukai Namira ❤️' : 'Sukai Foto Ini'}</span>
                      </button>

                      {isErlangga && (
                        <>
                          <button
                            type="button"
                            onClick={(e) => handleOpenEditPhoto(activePhotoModal, e)}
                            className="px-3 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" /> Edit
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDeletePhoto(activePhotoModal.id, e)}
                            className="px-3 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Hapus
                          </button>
                        </>
                      )}
                    </div>

                    <button
                      onClick={() => setActivePhotoModal(null)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors cursor-pointer"
                    >
                      Tutup
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add New Memory Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-rose-200 text-slate-800 my-auto max-h-[85vh] sm:max-h-[90vh] flex flex-col overflow-hidden"
            >
              {/* Fixed Header */}
              <div className="flex items-center justify-between p-4 sm:p-5 border-b border-rose-100 bg-white shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-rose-500 text-white shadow-sm">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-rose-950 font-serif">
                      Tambah Foto Kenangan Baru
                    </h3>
                    <p className="text-xs text-slate-500">
                      Abadikan momen manis Erlangga & Namira
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-2 rounded-full bg-rose-100 text-rose-800 hover:bg-rose-200 transition-colors cursor-pointer shrink-0"
                  title="Tutup Modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Form Body */}
              <form onSubmit={handleFormSubmit} className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-rose-900 mb-1">
                    Judul Momen
                  </label>
                  <input
                    type="text"
                    required
                    value={titleInput}
                    onChange={(e) => setTitleInput(e.target.value)}
                    placeholder="Contoh: Dinner Romantis di Pantai"
                    className="w-full p-3 rounded-xl border border-rose-200 text-sm focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-rose-900 mb-1">
                      Tanggal
                    </label>
                    <input
                      type="text"
                      value={dateInput}
                      onChange={(e) => setDateInput(e.target.value)}
                      placeholder="Contoh: 12 Agustus 2026"
                      className="w-full p-3 rounded-xl border border-rose-200 text-sm focus:outline-none focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-rose-900 mb-1">
                      Lokasi
                    </label>
                    <input
                      type="text"
                      value={locationInput}
                      onChange={(e) => setLocationInput(e.target.value)}
                      placeholder="Contoh: Bali"
                      className="w-full p-3 rounded-xl border border-rose-200 text-sm focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-rose-900 mb-1">
                    Kategori Foto Kenangan
                  </label>
                  <select
                    value={isCustomCategoryAdd ? '__CUSTOM__' : categoryInput}
                    onChange={(e) => {
                      if (e.target.value === '__CUSTOM__') {
                        setIsCustomCategoryAdd(true);
                        setCategoryInput('');
                      } else {
                        setIsCustomCategoryAdd(false);
                        setCategoryInput(e.target.value);
                      }
                    }}
                    className="w-full p-3 rounded-xl border border-rose-200 text-sm focus:outline-none focus:border-rose-500 bg-white font-medium"
                  >
                    {availableCategories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                    <option value="__CUSTOM__">+ Buat / Ketik Nama Kategori Baru...</option>
                  </select>

                  {isCustomCategoryAdd && (
                    <input
                      type="text"
                      required
                      value={categoryInput}
                      onChange={(e) => setCategoryInput(e.target.value)}
                      placeholder="Ketikkan nama kategori kustom (contoh: Wisata Kuliner, Concert, OOTD)"
                      className="mt-2 w-full p-3 rounded-xl border border-rose-300 text-sm focus:outline-none focus:border-rose-500 bg-rose-50/60"
                    />
                  )}
                </div>

                {/* Photo Upload Zone */}
                <div>
                  <label className="block text-xs font-semibold text-rose-900 mb-1">
                    Foto Kenangan (Upload dari HP / Laptop)
                  </label>
                  
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      ref={addFileInputRef}
                      onChange={handleAddFileChange}
                      className="hidden"
                    />
                    
                    <div className="flex flex-col sm:flex-row items-center gap-2">
                      <button
                        type="button"
                        disabled={isUploadingAdd}
                        onClick={() => addFileInputRef.current?.click()}
                        className="w-full sm:w-auto px-4 py-2.5 rounded-xl border-2 border-dashed border-rose-300 bg-rose-50/60 hover:bg-rose-100 text-rose-900 text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {isUploadingAdd ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-rose-600" />
                            <span>Memproses Foto...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 text-rose-500" />
                            <span>Pilih Foto dari Galeri HP / File</span>
                          </>
                        )}
                      </button>

                      <span className="text-[11px] text-slate-400 font-medium">atau masukan URL foto</span>
                    </div>

                    {/* Live Photo Preview */}
                    {imageUrlInput && (
                      <div className="relative mt-2 rounded-xl overflow-hidden border border-rose-200 bg-slate-900 h-36 flex items-center justify-center group">
                        <img
                          src={imageUrlInput}
                          alt="Preview"
                          className="max-h-full max-w-full object-contain"
                        />
                        <button
                          type="button"
                          onClick={() => setImageUrlInput('')}
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 hover:bg-rose-600 text-white transition-colors cursor-pointer"
                          title="Hapus Foto"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/90 text-white flex items-center gap-1">
                          <Check className="w-3 h-3" /> Foto Terpilih
                        </span>
                      </div>
                    )}

                    <input
                      type="url"
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      placeholder="Atau tempelkan URL foto jika ada (https://...)"
                      className="w-full p-2.5 rounded-xl border border-rose-200 text-xs focus:outline-none focus:border-rose-500 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-rose-900 mb-1">
                    Cerita / Caption Kenangan
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={descriptionInput}
                    onChange={(e) => setDescriptionInput(e.target.value)}
                    placeholder="Tuliskan ungkapan atau kenangan manis momen ini..."
                    className="w-full p-3 rounded-xl border border-rose-200 text-sm focus:outline-none focus:border-rose-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-rose-500 hover:bg-rose-600 text-white shadow-md transition-all cursor-pointer"
                >
                  Simpan Foto Kenangan
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Photo Modal */}
      <AnimatePresence>
        {editingPhoto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-rose-200 text-slate-800 my-auto max-h-[85vh] sm:max-h-[90vh] flex flex-col overflow-hidden"
            >
              {/* Fixed Header */}
              <div className="flex items-center justify-between p-4 sm:p-5 border-b border-rose-100 bg-white shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-amber-500 text-slate-950 shadow-sm">
                    <Edit3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-rose-950 font-serif">
                      Edit Foto Kenangan
                    </h3>
                    <p className="text-xs text-slate-500">
                      Ubah detail foto kenangan ini
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingPhoto(null)}
                  className="p-2 rounded-full bg-rose-100 text-rose-800 hover:bg-rose-200 transition-colors cursor-pointer shrink-0"
                  title="Tutup Modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Form Body */}
              <form onSubmit={handleSaveEditPhoto} className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-rose-900 mb-1">
                    Judul Momen
                  </label>
                  <input
                    type="text"
                    required
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full p-3 rounded-xl border border-rose-200 text-sm focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-rose-900 mb-1">
                      Tanggal
                    </label>
                    <input
                      type="text"
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      className="w-full p-3 rounded-xl border border-rose-200 text-sm focus:outline-none focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-rose-900 mb-1">
                      Lokasi
                    </label>
                    <input
                      type="text"
                      value={editLocation}
                      onChange={(e) => setEditLocation(e.target.value)}
                      className="w-full p-3 rounded-xl border border-rose-200 text-sm focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-rose-900 mb-1">
                    Kategori Foto Kenangan
                  </label>
                  <select
                    value={isCustomCategoryEdit ? '__CUSTOM__' : editCategory}
                    onChange={(e) => {
                      if (e.target.value === '__CUSTOM__') {
                        setIsCustomCategoryEdit(true);
                        setEditCategory('');
                      } else {
                        setIsCustomCategoryEdit(false);
                        setEditCategory(e.target.value);
                      }
                    }}
                    className="w-full p-3 rounded-xl border border-rose-200 text-sm focus:outline-none focus:border-rose-500 bg-white font-medium"
                  >
                    {availableCategories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                    <option value="__CUSTOM__">+ Buat / Ketik Nama Kategori Baru...</option>
                  </select>

                  {isCustomCategoryEdit && (
                    <input
                      type="text"
                      required
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      placeholder="Ketikkan nama kategori kustom (contoh: Wisata Kuliner, Concert, OOTD)"
                      className="mt-2 w-full p-3 rounded-xl border border-rose-300 text-sm focus:outline-none focus:border-rose-500 bg-rose-50/60"
                    />
                  )}
                </div>

                {/* Edit Photo Upload Zone */}
                <div>
                  <label className="block text-xs font-semibold text-rose-900 mb-1">
                    Ganti Foto (Upload dari HP / Laptop)
                  </label>
                  
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      ref={editFileInputRef}
                      onChange={handleEditFileChange}
                      className="hidden"
                    />
                    
                    <div className="flex flex-col sm:flex-row items-center gap-2">
                      <button
                        type="button"
                        disabled={isUploadingEdit}
                        onClick={() => editFileInputRef.current?.click()}
                        className="w-full sm:w-auto px-4 py-2.5 rounded-xl border-2 border-dashed border-rose-300 bg-rose-50/60 hover:bg-rose-100 text-rose-900 text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {isUploadingEdit ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-rose-600" />
                            <span>Memproses Foto...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 text-rose-500" />
                            <span>Pilih Foto Baru dari Galeri</span>
                          </>
                        )}
                      </button>

                      <span className="text-[11px] text-slate-400 font-medium">atau ubah URL</span>
                    </div>

                    {/* Live Photo Preview */}
                    {editImageUrl && (
                      <div className="relative mt-2 rounded-xl overflow-hidden border border-rose-200 bg-slate-900 h-36 flex items-center justify-center group">
                        <img
                          src={editImageUrl}
                          alt="Preview"
                          className="max-h-full max-w-full object-contain"
                        />
                        <button
                          type="button"
                          onClick={() => setEditImageUrl('')}
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 hover:bg-rose-600 text-white transition-colors cursor-pointer"
                          title="Hapus Foto"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/90 text-white flex items-center gap-1">
                          <Check className="w-3 h-3" /> Foto Terpasang
                        </span>
                      </div>
                    )}

                    <input
                      type="url"
                      value={editImageUrl}
                      onChange={(e) => setEditImageUrl(e.target.value)}
                      placeholder="Atau tempelkan URL foto baru (https://...)"
                      className="w-full p-2.5 rounded-xl border border-rose-200 text-xs focus:outline-none focus:border-rose-500 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-rose-900 mb-1">
                    Cerita / Caption Kenangan
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full p-3 rounded-xl border border-rose-200 text-sm focus:outline-none focus:border-rose-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md transition-all cursor-pointer"
                >
                  Simpan Perubahan
                </button>
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
                    Edit Teks Banner Header Galeri
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsHeaderEditOpen(false)}
                  className="p-1.5 rounded-full hover:bg-rose-100 text-slate-500 cursor-pointer shrink-0"
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
                      galleryBadge: headerBadge,
                      galleryTitle: headerTitle,
                      gallerySubtitle: headerSubtitle
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

      {/* Rename Category Modal */}
      <AnimatePresence>
        {isRenameModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-rose-200 text-slate-800 my-auto max-h-[85vh] sm:max-h-[90vh] flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 sm:p-5 border-b border-rose-100 bg-white shrink-0">
                <div className="flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-amber-500" />
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 font-serif">
                    Ubah Nama Kategori Foto
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsRenameModalOpen(false)}
                  className="p-1.5 rounded-full hover:bg-rose-100 text-slate-500 cursor-pointer shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!oldCategoryToRename || !newCategoryNameInput.trim()) return;
                  if (!onRenameCategory) return;

                  setIsRenamingCategory(true);
                  const ok = await onRenameCategory(oldCategoryToRename, newCategoryNameInput.trim());
                  setIsRenamingCategory(false);

                  if (ok) {
                    if (selectedCategory === oldCategoryToRename) {
                      setSelectedCategory(newCategoryNameInput.trim());
                    }
                    setIsRenameModalOpen(false);
                  } else {
                    alert('Gagal mengubah nama kategori');
                  }
                }}
                className="p-4 sm:p-6 space-y-4 text-left overflow-y-auto flex-1"
              >
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Pilih Kategori Yang Ingin Diubah
                  </label>
                  <select
                    value={oldCategoryToRename}
                    onChange={(e) => {
                      setOldCategoryToRename(e.target.value);
                      setNewCategoryNameInput(e.target.value);
                    }}
                    className="w-full p-2.5 rounded-xl border border-rose-200 bg-rose-50/30 text-xs font-semibold focus:outline-none focus:border-rose-500"
                  >
                    {availableCategories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Kategori Baru
                  </label>
                  <input
                    type="text"
                    required
                    value={newCategoryNameInput}
                    onChange={(e) => setNewCategoryNameInput(e.target.value)}
                    placeholder="Contoh: Jalan-Jalan & Kuliner"
                    className="w-full p-2.5 rounded-xl border border-rose-200 bg-rose-50/30 text-xs font-semibold focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="pt-3 flex items-center justify-end gap-2 border-t border-rose-100">
                  <button
                    type="button"
                    onClick={() => setIsRenameModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isRenamingCategory}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-500 text-slate-950 shadow-md cursor-pointer flex items-center gap-1.5"
                  >
                    {isRenamingCategory ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      <span>Simpan Perubahan</span>
                    )}
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
