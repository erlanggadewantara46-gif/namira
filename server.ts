import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { 
  INITIAL_MILESTONES, 
  INITIAL_MEMORIES, 
  INITIAL_NOTES, 
  DEFAULT_GREETING_TITLE, 
  DEFAULT_GREETING_MESSAGE,
  DEFAULT_HERO_BADGE,
  DEFAULT_HERO_TITLE,
  DEFAULT_HERO_SUBTITLE,
  DEFAULT_LETTER_TITLE,
  DEFAULT_LETTER_BODY,
  DEFAULT_MILESTONES_BADGE,
  DEFAULT_MILESTONES_TITLE,
  DEFAULT_MILESTONES_SUBTITLE,
  DEFAULT_GALLERY_BADGE,
  DEFAULT_GALLERY_TITLE,
  DEFAULT_GALLERY_SUBTITLE,
  DEFAULT_NOTES_BADGE,
  DEFAULT_NOTES_TITLE,
  DEFAULT_NOTES_SUBTITLE
} from './src/data/initialData';
import { AppStateData } from './src/types';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Persistent Data Storage Path
const DATA_DIR = path.join(process.cwd(), 'data');
const STORE_PATH = path.join(DATA_DIR, 'store.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Load or initialize store
function loadStore(): AppStateData {
  let loadedStore: AppStateData | null = null;
  try {
    if (fs.existsSync(STORE_PATH)) {
      const raw = fs.readFileSync(STORE_PATH, 'utf-8');
      loadedStore = JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading store.json, reinitializing...', err);
  }

  if (loadedStore) {
    if (!loadedStore.greetingTitle) loadedStore.greetingTitle = DEFAULT_GREETING_TITLE;
    if (!loadedStore.greetingMessage) loadedStore.greetingMessage = DEFAULT_GREETING_MESSAGE;
    if (!loadedStore.heroBadge) loadedStore.heroBadge = DEFAULT_HERO_BADGE;
    if (!loadedStore.heroTitle) loadedStore.heroTitle = DEFAULT_HERO_TITLE;
    if (!loadedStore.heroSubtitle) loadedStore.heroSubtitle = DEFAULT_HERO_SUBTITLE;
    if (!loadedStore.letterTitle) loadedStore.letterTitle = DEFAULT_LETTER_TITLE;
    if (!loadedStore.letterBody) loadedStore.letterBody = DEFAULT_LETTER_BODY;
    if (!loadedStore.milestonesBadge) loadedStore.milestonesBadge = DEFAULT_MILESTONES_BADGE;
    if (!loadedStore.milestonesTitle) loadedStore.milestonesTitle = DEFAULT_MILESTONES_TITLE;
    if (!loadedStore.milestonesSubtitle) loadedStore.milestonesSubtitle = DEFAULT_MILESTONES_SUBTITLE;
    if (!loadedStore.galleryBadge) loadedStore.galleryBadge = DEFAULT_GALLERY_BADGE;
    if (!loadedStore.galleryTitle) loadedStore.galleryTitle = DEFAULT_GALLERY_TITLE;
    if (!loadedStore.gallerySubtitle) loadedStore.gallerySubtitle = DEFAULT_GALLERY_SUBTITLE;
    if (!loadedStore.notesBadge) loadedStore.notesBadge = DEFAULT_NOTES_BADGE;
    if (!loadedStore.notesTitle) loadedStore.notesTitle = DEFAULT_NOTES_TITLE;
    if (!loadedStore.notesSubtitle) loadedStore.notesSubtitle = DEFAULT_NOTES_SUBTITLE;
    
    // Ensure notes array exists
    if (!loadedStore.notes) loadedStore.notes = [];
    if (!loadedStore.relationshipStartDate || loadedStore.relationshipStartDate === '2024-02-14') {
      loadedStore.relationshipStartDate = '2024-09-28';
    }
    if (!loadedStore.stat1Label) loadedStore.stat1Label = 'Hari Bersama ❤️';
    if (!loadedStore.stat1Sublabel) loadedStore.stat1Sublabel = '(Sejak 28 Sept 2024)';
    if (!loadedStore.stat2Label) loadedStore.stat2Label = 'Milestone Challenges 🎁';
    if (!loadedStore.stat3Value) loadedStore.stat3Value = 'Selamanya';
    if (!loadedStore.stat3Label) loadedStore.stat3Label = 'Janji Setia ur bf 💍';
    saveStore(loadedStore);
    return loadedStore;
  }
  
  const initialStore: AppStateData = {
    milestones: INITIAL_MILESTONES,
    memories: INITIAL_MEMORIES,
    notes: [],
    relationshipStartDate: '2024-09-28',
    birthdayDate: '1999-08-12',
    greetingTitle: DEFAULT_GREETING_TITLE,
    greetingMessage: DEFAULT_GREETING_MESSAGE,
    heroBadge: DEFAULT_HERO_BADGE,
    heroTitle: DEFAULT_HERO_TITLE,
    heroSubtitle: DEFAULT_HERO_SUBTITLE,
    letterTitle: DEFAULT_LETTER_TITLE,
    letterBody: DEFAULT_LETTER_BODY,
    milestonesBadge: DEFAULT_MILESTONES_BADGE,
    milestonesTitle: DEFAULT_MILESTONES_TITLE,
    milestonesSubtitle: DEFAULT_MILESTONES_SUBTITLE,
    galleryBadge: DEFAULT_GALLERY_BADGE,
    galleryTitle: DEFAULT_GALLERY_TITLE,
    gallerySubtitle: DEFAULT_GALLERY_SUBTITLE,
    notesBadge: DEFAULT_NOTES_BADGE,
    notesTitle: DEFAULT_NOTES_TITLE,
    notesSubtitle: DEFAULT_NOTES_SUBTITLE
  };

  saveStore(initialStore);
  return initialStore;
}

function saveStore(data: AppStateData) {
  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing store.json:', err);
  }
}

let currentStore = loadStore();

// Allow hardcoded emails
const ALLOWED_USERS = [
  {
    email: 'erlanggadewantara46@gmail.com',
    name: 'Erlangga Dewantara',
    nickname: 'ur bf',
    role: 'erlangga',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'
  },
  {
    email: 'namirafisilmiyasmin@gmail.com',
    name: 'Namira Fisilmi Yasmin',
    nickname: 'Princess Namira',
    role: 'namira',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=200&auto=format&fit=crop'
  }
];

// --- API ROUTES ---

// Auth endpoint
app.post('/api/auth/login', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const user = ALLOWED_USERS.find(u => u.email.toLowerCase() === normalizedEmail);

  if (!user) {
    return res.status(401).json({
      error: 'Akses Ditolak. Email ini tidak terdaftar dalam sistem kenangan privat.'
    });
  }

  return res.json({ success: true, user });
});

// Fetch complete app state
app.get('/api/state', (req, res) => {
  res.json(currentStore);
});

// Complete or toggle milestone challenge (1-Day 1-Claim Rule Enforcement)
app.post('/api/milestones/:day/complete', (req, res) => {
  const dayParam = parseInt(req.params.day, 10);
  const { userEmail } = req.body;
  const isErlangga = String(userEmail || '').trim().toLowerCase() === 'erlanggadewantara46@gmail.com';

  const milestone = currentStore.milestones.find(m => m.day === dayParam);
  if (!milestone) {
    return res.status(404).json({ error: 'Milestone tidak ditemukan' });
  }

  // If attempting to claim (set isCompleted from false to true)
  if (!milestone.isCompleted) {
    // Check 1-Day 1-Claim rule for non-admin users (Namira)
    if (!isErlangga) {
      const todayStr = new Date().toISOString().slice(0, 10);
      const claimedToday = currentStore.milestones.find(m => {
        if (!m.isCompleted || !m.completedAt) return false;
        try {
          return new Date(m.completedAt).toISOString().slice(0, 10) === todayStr;
        } catch {
          return false;
        }
      });

      if (claimedToday) {
        return res.status(400).json({
          error: `Aturan 1 Hari 1 Claim: Kamu sudah mengklaim hadiah "${claimedToday.reward}" hari ini! Silakan kembali besok untuk klaim hadiah berikutnya. ❤️`,
          claimedToday
        });
      }
    }

    milestone.isCompleted = true;
    milestone.completedAt = new Date().toISOString();
    milestone.completedBy = userEmail || 'namirafisilmiyasmin@gmail.com';
  } else {
    // Unclaiming / Resetting
    milestone.isCompleted = false;
    milestone.completedAt = undefined;
    milestone.completedBy = undefined;
  }

  saveStore(currentStore);
  res.json({ success: true, milestone, milestones: currentStore.milestones });
});

// Admin Route: Add New Milestone / Hadiah (Authorized ONLY for erlanggadewantara46@gmail.com)
app.post('/api/milestones', (req, res) => {
  const { userEmail, title, description, reward, rewardDetails, category, image, voucherCode, day } = req.body;

  if (String(userEmail || '').trim().toLowerCase() !== 'erlanggadewantara46@gmail.com') {
    return res.status(403).json({ error: 'Hanya ur bf yang dapat menambah hadiah.' });
  }

  if (!title || !reward) {
    return res.status(400).json({ error: 'Judul dan Nama Hadiah wajib diisi' });
  }

  const newDay = day ? parseInt(day, 10) : (Math.max(0, ...currentStore.milestones.map(m => m.day)) + 1);

  const newMilestone = {
    day: newDay,
    title,
    description: description || 'Misi spesial cinta dari ur bf untuk Namira!',
    reward,
    rewardDetails: rewardDetails || 'Voucher ini dapat ditukarkan kapan saja dengan ur bf.',
    category: category || 'Quality Time',
    iconName: 'Gift',
    image: image || 'https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=1000&auto=format&fit=crop',
    isCompleted: false,
    voucherCode: voucherCode || `NMY-DAY${newDay}-REWARD`
  };

  currentStore.milestones.push(newMilestone);
  // Sort by day
  currentStore.milestones.sort((a, b) => a.day - b.day);

  saveStore(currentStore);
  res.json({ success: true, milestone: newMilestone, milestones: currentStore.milestones });
});

// Admin Route: Edit Milestone / Hadiah (Authorized ONLY for erlanggadewantara46@gmail.com)
app.put('/api/milestones/:day', (req, res) => {
  const dayParam = parseInt(req.params.day, 10);
  const { userEmail, title, description, reward, rewardDetails, category, image, voucherCode, newDay } = req.body;

  if (String(userEmail || '').trim().toLowerCase() !== 'erlanggadewantara46@gmail.com') {
    return res.status(403).json({ error: 'Hanya ur bf yang dapat mengubah hadiah.' });
  }

  const milestone = currentStore.milestones.find(m => m.day === dayParam);
  if (!milestone) {
    return res.status(404).json({ error: 'Milestone tidak ditemukan' });
  }

  if (title !== undefined) milestone.title = title;
  if (description !== undefined) milestone.description = description;
  if (reward !== undefined) milestone.reward = reward;
  if (rewardDetails !== undefined) milestone.rewardDetails = rewardDetails;
  if (category !== undefined) milestone.category = category;
  if (image !== undefined) milestone.image = image;
  if (voucherCode !== undefined) milestone.voucherCode = voucherCode;
  if (newDay !== undefined && !isNaN(parseInt(newDay, 10))) {
    milestone.day = parseInt(newDay, 10);
  }

  currentStore.milestones.sort((a, b) => a.day - b.day);
  saveStore(currentStore);
  res.json({ success: true, milestone, milestones: currentStore.milestones });
});

// Admin Route: Delete Milestone / Hadiah (Authorized ONLY for erlanggadewantara46@gmail.com)
app.delete('/api/milestones/:day', (req, res) => {
  const dayParam = parseInt(req.params.day, 10);
  const userEmail = req.headers['x-user-email'] || req.query.userEmail;

  if (String(userEmail || '').trim().toLowerCase() !== 'erlanggadewantara46@gmail.com') {
    return res.status(403).json({ error: 'Hanya ur bf yang dapat menghapus hadiah.' });
  }

  currentStore.milestones = currentStore.milestones.filter(m => m.day !== dayParam);
  saveStore(currentStore);
  res.json({ success: true, milestones: currentStore.milestones });
});

// Reset Milestone Claims (Restart check-in from Day 1)
app.post('/api/milestones/reset', (req, res) => {
  const { day, resetAll } = req.body;

  if (day !== undefined && day !== null) {
    const dayNum = parseInt(day, 10);
    const milestone = currentStore.milestones.find(m => m.day === dayNum);
    if (milestone) {
      milestone.isCompleted = false;
      milestone.completedAt = undefined;
      milestone.completedBy = undefined;
    }
  } else if (resetAll || day === undefined) {
    currentStore.milestones.forEach(m => {
      m.isCompleted = false;
      m.completedAt = undefined;
      m.completedBy = undefined;
    });
  }

  saveStore(currentStore);
  res.json({ success: true, milestones: currentStore.milestones });
});

// Add new memory
app.post('/api/memories', (req, res) => {
  const { title, date, location, description, imageUrl, category } = req.body;

  if (!title || !description) {
    return res.status(400).json({ error: 'Title and description are required' });
  }

  const newMem = {
    id: 'mem-' + Date.now(),
    title,
    date: date || new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
    location: location || 'Jakarta',
    description,
    imageUrl: imageUrl || 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?q=80&w=1000&auto=format&fit=crop',
    category: category || 'Momen Spesial',
    likes: 1,
    lovedByNamira: true
  };

  currentStore.memories.unshift(newMem);
  saveStore(currentStore);
  res.json({ success: true, memory: newMem, memories: currentStore.memories });
});

// Edit existing memory
app.put('/api/memories/:id', (req, res) => {
  const { id } = req.params;
  const { userEmail, title, date, location, description, imageUrl, category } = req.body;

  if (String(userEmail || '').trim().toLowerCase() !== 'erlanggadewantara46@gmail.com') {
    return res.status(403).json({ error: 'Hanya ur bf yang dapat mengubah kenangan ini.' });
  }

  const memory = currentStore.memories.find(m => m.id === id);
  if (!memory) {
    return res.status(404).json({ error: 'Kenangan tidak ditemukan' });
  }

  if (title !== undefined) memory.title = title;
  if (date !== undefined) memory.date = date;
  if (location !== undefined) memory.location = location;
  if (description !== undefined) memory.description = description;
  if (imageUrl !== undefined) memory.imageUrl = imageUrl;
  if (category !== undefined) memory.category = category;

  saveStore(currentStore);
  res.json({ success: true, memory, memories: currentStore.memories });
});

// Delete memory
app.delete('/api/memories/:id', (req, res) => {
  const { id } = req.params;
  const userEmail = req.headers['x-user-email'] || req.query.userEmail;

  if (String(userEmail || '').trim().toLowerCase() !== 'erlanggadewantara46@gmail.com') {
    return res.status(403).json({ error: 'Hanya ur bf yang dapat menghapus kenangan.' });
  }

  currentStore.memories = currentStore.memories.filter(m => m.id !== id);
  saveStore(currentStore);
  res.json({ success: true, memories: currentStore.memories });
});

// Rename category across all memories (Authorized ONLY for erlanggadewantara46@gmail.com)
app.post('/api/memories/rename-category', (req, res) => {
  const { userEmail, oldCategory, newCategory } = req.body;

  if (String(userEmail || '').trim().toLowerCase() !== 'erlanggadewantara46@gmail.com') {
    return res.status(403).json({ error: 'Hanya ur bf yang dapat mengubah nama kategori.' });
  }

  if (!oldCategory || !newCategory || !newCategory.trim()) {
    return res.status(400).json({ error: 'Nama kategori lama dan baru wajib diisi.' });
  }

  const trimmedNew = newCategory.trim();
  currentStore.memories.forEach(m => {
    if (m.category === oldCategory) {
      m.category = trimmedNew;
    }
  });

  saveStore(currentStore);
  res.json({ success: true, memories: currentStore.memories });
});

// Toggle like / love on memory
app.post('/api/memories/:id/like', (req, res) => {
  const { id } = req.params;
  const memory = currentStore.memories.find(m => m.id === id);
  if (!memory) {
    return res.status(404).json({ error: 'Memory not found' });
  }

  memory.lovedByNamira = !memory.lovedByNamira;
  memory.likes += memory.lovedByNamira ? 1 : -1;

  saveStore(currentStore);
  res.json({ success: true, memory, memories: currentStore.memories });
});

// Post love note
app.post('/api/notes', (req, res) => {
  const { senderEmail, senderName, recipientEmail, content, mood } = req.body;

  if (!content) {
    return res.status(400).json({ error: 'Content is required' });
  }

  const newNote = {
    id: 'note-' + Date.now(),
    senderEmail: senderEmail || 'erlanggadewantara46@gmail.com',
    senderName: senderName || 'Erlangga Dewantara',
    recipientEmail: recipientEmail || 'namirafisilmiyasmin@gmail.com',
    content,
    createdAt: new Date().toISOString(),
    mood: mood || 'romantic',
    isAI: false
  };

  currentStore.notes.unshift(newNote);
  saveStore(currentStore);
  res.json({ success: true, note: newNote, notes: currentStore.notes });
});

// Edit existing note
app.put('/api/notes/:id', (req, res) => {
  const { id } = req.params;
  const { content, mood, userEmail } = req.body;

  const note = currentStore.notes.find(n => n.id === id);
  if (!note) {
    return res.status(404).json({ error: 'Catatan tidak ditemukan' });
  }

  if (content !== undefined) note.content = content;
  if (mood !== undefined) note.mood = mood;

  saveStore(currentStore);
  res.json({ success: true, note, notes: currentStore.notes });
});

// Delete note
app.delete('/api/notes/:id', (req, res) => {
  const { id } = req.params;
  
  currentStore.notes = currentStore.notes.filter(n => n.id !== id);
  saveStore(currentStore);
  res.json({ success: true, notes: currentStore.notes });
});

// Update Greeting Message / Hero Content / Letter / Section Headers (Authorized ONLY for erlanggadewantara46@gmail.com)
app.post('/api/greeting', (req, res) => {
  const { 
    userEmail, 
    greetingTitle, 
    greetingMessage,
    heroBadge,
    heroTitle,
    heroSubtitle,
    letterTitle,
    letterBody,
    milestonesBadge,
    milestonesTitle,
    milestonesSubtitle,
    galleryBadge,
    galleryTitle,
    gallerySubtitle,
    notesBadge,
    notesTitle,
    notesSubtitle,
    stat1Label,
    stat1Sublabel,
    stat2Value,
    stat2Label,
    stat3Value,
    stat3Label,
    relationshipStartDate
  } = req.body;

  if (!userEmail) {
    return res.status(400).json({ error: 'User email is required' });
  }

  // Security authorization: Only erlanggadewantara46@gmail.com can edit
  if (String(userEmail).trim().toLowerCase() !== 'erlanggadewantara46@gmail.com') {
    return res.status(403).json({ error: 'Hanya ur bf yang dapat merubah konten ini.' });
  }

  if (greetingTitle !== undefined) currentStore.greetingTitle = String(greetingTitle);
  if (greetingMessage !== undefined) currentStore.greetingMessage = String(greetingMessage);
  if (heroBadge !== undefined) currentStore.heroBadge = String(heroBadge);
  if (heroTitle !== undefined) currentStore.heroTitle = String(heroTitle);
  if (heroSubtitle !== undefined) currentStore.heroSubtitle = String(heroSubtitle);
  if (letterTitle !== undefined) currentStore.letterTitle = String(letterTitle);
  if (letterBody !== undefined) currentStore.letterBody = String(letterBody);

  if (milestonesBadge !== undefined) currentStore.milestonesBadge = String(milestonesBadge);
  if (milestonesTitle !== undefined) currentStore.milestonesTitle = String(milestonesTitle);
  if (milestonesSubtitle !== undefined) currentStore.milestonesSubtitle = String(milestonesSubtitle);

  if (galleryBadge !== undefined) currentStore.galleryBadge = String(galleryBadge);
  if (galleryTitle !== undefined) currentStore.galleryTitle = String(galleryTitle);
  if (gallerySubtitle !== undefined) currentStore.gallerySubtitle = String(gallerySubtitle);

  if (notesBadge !== undefined) currentStore.notesBadge = String(notesBadge);
  if (notesTitle !== undefined) currentStore.notesTitle = String(notesTitle);
  if (notesSubtitle !== undefined) currentStore.notesSubtitle = String(notesSubtitle);

  if (stat1Label !== undefined) currentStore.stat1Label = String(stat1Label);
  if (stat1Sublabel !== undefined) currentStore.stat1Sublabel = String(stat1Sublabel);
  if (stat2Value !== undefined) currentStore.stat2Value = String(stat2Value);
  if (stat2Label !== undefined) currentStore.stat2Label = String(stat2Label);
  if (stat3Value !== undefined) currentStore.stat3Value = String(stat3Value);
  if (stat3Label !== undefined) currentStore.stat3Label = String(stat3Label);
  if (relationshipStartDate !== undefined) currentStore.relationshipStartDate = String(relationshipStartDate);

  saveStore(currentStore);
  res.json({
    success: true,
    greetingTitle: currentStore.greetingTitle,
    greetingMessage: currentStore.greetingMessage,
    heroBadge: currentStore.heroBadge,
    heroTitle: currentStore.heroTitle,
    heroSubtitle: currentStore.heroSubtitle,
    letterTitle: currentStore.letterTitle,
    letterBody: currentStore.letterBody,
    milestonesBadge: currentStore.milestonesBadge,
    milestonesTitle: currentStore.milestonesTitle,
    milestonesSubtitle: currentStore.milestonesSubtitle,
    galleryBadge: currentStore.galleryBadge,
    galleryTitle: currentStore.galleryTitle,
    gallerySubtitle: currentStore.gallerySubtitle,
    notesBadge: currentStore.notesBadge,
    notesTitle: currentStore.notesTitle,
    notesSubtitle: currentStore.notesSubtitle,
    stat1Label: currentStore.stat1Label,
    stat1Sublabel: currentStore.stat1Sublabel,
    stat2Value: currentStore.stat2Value,
    stat2Label: currentStore.stat2Label,
    stat3Value: currentStore.stat3Value,
    stat3Label: currentStore.stat3Label,
    relationshipStartDate: currentStore.relationshipStartDate
  });
});

// Server-side Gemini AI Romantic Birthday Letter / Poem Generator
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== 'MY_GEMINI_API_KEY') {
      aiClient = new GoogleGenAI({ apiKey: key });
    }
  }
  return aiClient;
}

app.post('/api/generate-romantic-letter', async (req, res) => {
  const { mood = 'romantis', topic = 'ucapan ulang tahun' } = req.body;

  try {
    const ai = getGeminiClient();
    if (ai) {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Buatkan surat ucapan ulang tahun atau puisi romantis yang sangat puitis, tulus, manis, dan menyentuh hati dalam bahasa Indonesia dari Mas Erlangga Dewantara untuk pasangan tercintanya Namira Fisilmi Yasmin.
Suasana / Mood: ${mood}. Topik khusus: ${topic}.
Sebutkan nama "Namira" dan panggil dirimu "Mas Erlangga". Buat sekitar 3-4 paragraf puitis dengan bahasa yang hangat, penuh kasih sayang, dan membuat tersenyum bahagia.`
      });

      const generatedText = response.text || '';
      if (generatedText) {
        return res.json({ success: true, text: generatedText });
      }
    }
  } catch (err) {
    console.error('Gemini API generate error, using romantic fallback:', err);
  }

  // Romantic fallbacks if API key is not active
  const fallbacks = [
    `Untuk Namira Fisilmi Yasmin tercinta,\n\nDi hari ulang tahunmu ini, Mas Erlangga cuma ingin mengulang betapa bersyukurnya Mas memiliki kamu dalam hidup ini. Setiap senyumanmu adalah alasan terbaik Mas untuk terus berjuang, dan setiap pelukanmu adalah rumah tempat Mas pulang.\n\nSelamat ulang tahun sayangku. Semoga panjang umur, sehat selalu, makin bersinar, dan semoga seluruh doa baikmu dikabulkan Allah SWT. Mas akan selalu ada di sampingmu untuk menggenggam tanganmu melangkah melewati hari demi hari.\n\nDengan seluruh cinta,\nMas Erlangga Dewantara ❤️`,
    `Namira sayang,\n\nSeperti embun pagi yang menyejukkan bumi, kehadiranmu dalam hidup Mas Erlangga selalu membawa kedamaian dan kebahagiaan tak terhingga. Selamat ulang tahun pasangan terbaikku!\n\nDi usia yang baru ini, Mas berdoa semoga harimu selalu dipenuhi gelak tawa, petualangan manis, serta mimpi-mimpi indah yang satu per satu terwujud. Terima kasih sudah menjadi sosok terindah dalam perjalanan hidup Mas.\n\nSelamanya milikmu,\nMas Erlangga ✨`,
    `Selamat Ulang Tahun Princess Namira! 💖\n\nHari ini adalah hari yang paling istimewa karena di hari inilah sosok tercantik dan terkasih lahir ke dunia. Terima kasih ya sayang sudah hadir dan mewarnai hari-hari Mas Erlangga jadi begitu indah dan penuh makna.\n\nSemoga keberkahan, kebahagiaan, dan kasih sayang selalu melingkupi setiap langkahmu. Mas mencintaimu lebih dari kata-kata yang bisa diucapkan!\n\nHappy Birthday My Sunshine, Mas Erlangga 🌹`
  ];

  const randomFallback = fallbacks[Math.floor(Math.random() * fallbacks.length)];
  return res.json({ success: true, text: randomFallback, fallbackUsed: true });
});

// START SERVER / VITE MIDDLEWARE
async function main() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✨ Server running on http://0.0.0.0:${PORT}`);
  });
}

main();
