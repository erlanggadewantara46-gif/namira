import { MilestoneChallenge, MemoryPhoto, LoveNote } from '../types';

const heroCoverImg = '/src/assets/images/hero_romantic_cover_1786555470247.jpg';
const kempinskiImg = '/src/assets/images/bali_kempinski_1786555487793.jpg';
const cookieImg = '/src/assets/images/dubai_chewy_cookie_1786555506115.jpg';
const baliTicketImg = '/src/assets/images/romantic_bali_ticket_1786555525448.jpg';

export const DEFAULT_GREETING_TITLE = "Pesan Spesial Dari ur bf";

export const DEFAULT_GREETING_MESSAGE = `Namira sayang,

Selamat ulang tahun ya cintaku! Di hari yang luar biasa indah ini, ur bf cuma ingin bilang betapa bersyukurnya ur bf kepada Allah SWT karena telah mempertemukan dan menyatukan ur bf dengan sosok sebaik, secantik, dan semanis kamu.

Setiap hari bersamamu selalu terasa istimewa. Senyumanmu adalah penyemangat ur bf di kala lelah, dan kehangatan hatimu adalah rumah tempat ur bf selalu ingin pulang. Terima kasih ya sayang sudah sabar, mengerti, dan selalu menemani perjalanan hidup ur bf hingga hari ini.

Aplikasi ini ur bf buat khusus sebagai hadiah kejutan kecil untuk merayakan ulang tahunmu. Di dalamnya, ur bf sudah menyusun 7-Day & Milestone Check-in Challenge lengkap dengan reward istimewa — mulai dari Dubai Chewy Cookie favoritmu, Movie & Spa Date, hingga tiket penerbangan & Fine Dining romantis di The Apurva Kempinski Bali!

Semoga di usiamu yang baru ini, Namira selalu diberikan kesehatan, keberkahan, kebahagiaan yang melimpah, dan semoga seluruh doa serta cita-citamu dikabulkan. ur bf janji akan selalu menggenggam erat tanganmu dan mencintaimu selamanya.

Dengan seluruh kasih sayang,
ur bf ❤️`;

export const DEFAULT_HERO_BADGE = "Spesial Untuk Namira Fisilmi Yasmin 🌹";
export const DEFAULT_HERO_TITLE = "Selamat Ulang Tahun, Bidadari Tercintaku!";
export const DEFAULT_HERO_SUBTITLE = "Di hari yang indah ini, dunia bersuka cita menyambut hari lahirnya sosok paling berharga dalam hidup ur bf.";

export const DEFAULT_LETTER_TITLE = "Surat Cinta Puitis Untuk Namira";
export const DEFAULT_LETTER_BODY = `Untuk Namira Fisilmi Yasmin tercinta,

Di hari ulang tahunmu ini, ur bf cuma ingin mengulang betapa bersyukurnya memiliki kamu dalam hidup ini. Setiap senyumanmu adalah alasan terbaik untuk terus berjuang, dan setiap pelukanmu adalah rumah tempat ur bf selalu ingin pulang.

Selamat ulang tahun sayangku. Semoga panjang umur, sehat selalu, makin bersinar, dan semoga seluruh doa baikmu dikabulkan Allah SWT. ur bf akan selalu ada di sampingmu untuk menggenggam tanganmu melangkah melewati hari demi hari.

Dengan seluruh cinta,
ur bf ❤️`;

export const DEFAULT_MILESTONES_BADGE = "Couple Daily & Milestone Journey";
export const DEFAULT_MILESTONES_TITLE = "7-Day & Milestone Check-in Challenge";
export const DEFAULT_MILESTONES_SUBTITLE = "Petualangan check-in harian istimewa untuk Namira Fisilmi Yasmin. Lakukan check-in setiap hari untuk membuka voucher kejutan romantis dari ur bf!";

export const DEFAULT_GALLERY_BADGE = "Galeri Foto Kenangan";
export const DEFAULT_GALLERY_TITLE = "Perjalanan Indah Erlangga & Namira";
export const DEFAULT_GALLERY_SUBTITLE = "Setiap foto menyimpan cerita manis, tawa, dan kenangan tak terbalaskan sepanjang hubungan kita.";

export const DEFAULT_NOTES_BADGE = "Wish Jar & Catatan Harapan";
export const DEFAULT_NOTES_TITLE = "Toples Pesan Cinta & Doa Untuk Namira";
export const DEFAULT_NOTES_SUBTITLE = "Ruang hangat untuk saling menuliskan harapan, apresiasi, ucapan manis, dan doa-doa indah setiap hari.";

export const INITIAL_MILESTONES: MilestoneChallenge[] = [
  {
    day: 1,
    title: "Mendapatkan Dubai Chewy Cookie 🍪",
    description: "Nikmati kelezatan Dubai Chewy Cookie yang super legit, chewy, dengan isian pistachio knafeh yang melimpah khusus untuk manisnya harimu!",
    reward: "1 Box Special Dubai Chewy Cookie",
    rewardDetails: "Voucher ini dapat ditukarkan kapan saja dengan ur bf untuk memesan / mengambil 1 box fresh Dubai Chewy Cookie favorit Namira.",
    category: "Snack & Food",
    iconName: "Cookie",
    image: cookieImg,
    isCompleted: true,
    completedAt: "2026-08-12T10:00:00.000Z",
    completedBy: "namirafisilmiyasmin@gmail.com",
    voucherCode: "NMY-DAY01-COOKIE"
  },
  {
    day: 2,
    title: "Keluar Bermain / Date Seru Berdua 🎡",
    description: "Hari khusus untuk jalan-jalan santai, main arcade/theme park, foto-foto lucu di photobooth, dan menikmati quality time tanpa batas!",
    reward: "Day Out Fun Date Pass",
    rewardDetails: "Bebas pilih destinasi bermain (Timezone, Dufan, Mall Walk, atau piknik taman) & foto photobooth sepuasnya bareng ur bf.",
    category: "Quality Time",
    iconName: "Sparkles",
    image: "https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=1000&auto=format&fit=crop",
    isCompleted: false,
    voucherCode: "NMY-DAY02-FUN-DATE"
  },
  {
    day: 3,
    title: "Movie Date Nonton Bioskop Pilihan 🍿🎬",
    description: "Maraton film terbaru di bioskop pilihan (XXI Premiere / CGV Velvet) lengkap dengan popcorn caramel hangat dan minuman segar pilihan Namira.",
    reward: "VIP Movie Ticket & Popcorn Pass",
    rewardDetails: "Tiket nonton bioskop kelas VIP/Premiere untuk 2 orang + paket snacks popcorn pilihan Namira.",
    category: "Quality Time",
    iconName: "Film",
    image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1000&auto=format&fit=crop",
    isCompleted: false,
    voucherCode: "NMY-DAY03-MOVIE-DATE"
  },
  {
    day: 4,
    title: "Jajan Makanan Apa Pun Yang Namira Suka 🧋🍰",
    description: "Bebas berburu kuliner, boba, matcha, dessert aesthetic, atau jajanan favorit Namira seharian penuh tanpa mikir hitungan kalori!",
    reward: "Unlimited Snack & Dessert Spree",
    rewardDetails: "Bebas pesan atau beli makanan, matcha latte, gelato, dan cake favorit apapun yang diidamkan Namira hari ini.",
    category: "Snack & Food",
    iconName: "Cake",
    image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?q=80&w=1000&auto=format&fit=crop",
    isCompleted: false,
    voucherCode: "NMY-DAY04-JAJAN-SPREE"
  },
  {
    day: 5,
    title: "Masak-Masak Bareng di Rumah / Kos 🍳🧑‍🍳",
    description: "Sesi kuliner intimacy! Belanja bahan-bahan steak, pasta, atau shabu-shabu lalu masak bareng sambil dengerin lagu favorit berdua.",
    reward: "Romantic Home Chef Night",
    rewardDetails: "ur bf siap jadi sous-chef & cuci piring, siap menyajikan hidangan lezat buatan berdua dalam suasana hangat candle light home dinner.",
    category: "Quality Time",
    iconName: "Utensils",
    image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=1000&auto=format&fit=crop",
    isCompleted: false,
    voucherCode: "NMY-DAY05-COOKING-NIGHT"
  },
  {
    day: 6,
    title: "Spa Bareng untuk Relaksasi 💆‍♀️✨",
    description: "Manjakan tubuh dan pikiran dengan perawatan massage & spa mewah berdua agar rileks, segar, dan siap menjalani hari-hari indah mendatang.",
    reward: "Couples Luxury Spa Day",
    rewardDetails: "Paket full-body aromatherapy massage, reflexology, dan spa treatment santai berdua di spa langganan terfavorit.",
    category: "Relaxation",
    iconName: "HeartHandshake",
    image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=1000&auto=format&fit=crop",
    isCompleted: false,
    voucherCode: "NMY-DAY06-SPA-RELAX"
  },
  {
    day: 7,
    title: "Special Gift Berupa Tiket Pergi ke Bali ✈️🏝️",
    description: "Selamat! Puncak milestone minggu pertama: Tiket pesawat keberangkatan ke Pulau Dewata Bali untuk liburan impian kita berdua!",
    reward: "Flight Ticket to Paradise Bali",
    rewardDetails: "Tiket penerbangan satu arah menuju Bali lengkap dengan seat reservation pilihan dan bagasi terdaftar.",
    category: "Travel & Luxury",
    iconName: "Plane",
    image: baliTicketImg,
    isCompleted: false,
    voucherCode: "NMY-DAY07-BALI-FLIGHT"
  },
  {
    day: 10,
    title: "Tiket Pulang-Pergi (PP) ke Bali 🛫🏝️🛬",
    description: "Milestone spesial Hari ke-10: Tiket penerbangan Pulang-Pergi (Roundtrip) komplit ke Bali! Siapkan koper dan OOTD pantai terbaikmu!",
    reward: "Roundtrip Bali Airline Pass",
    rewardDetails: "Tiket Pesawat Pulang-Pergi (PP) Jakarta - Bali untuk Erlangga & Namira. Siap terbang kapan pun Namira luang!",
    category: "Travel & Luxury",
    iconName: "MapPin",
    image: baliTicketImg,
    isCompleted: false,
    voucherCode: "NMY-DAY10-BALI-ROUNDTRIP"
  },
  {
    day: 50,
    title: "Fine Dining Romantis di The Apurva Kempinski Bali 🥂🌹🍽️",
    description: "Puncak hadiah teristimewa Hari ke-50! Pengalaman santap malam mewah bintang lima dengan pemandangan akuarium raksasa Samudra Hindia yang magis.",
    reward: "Ultimate Fine Dining at The Apurva Kempinski Bali",
    rewardDetails: "All-inclusive romantic fine dining course menu at Koral Restaurant / Pala Restaurant The Apurva Kempinski Bali, lengkap dengan wine/mocktail, candle-light table arrangement, dan buket bunga mawar merah segar.",
    category: "Travel & Luxury",
    iconName: "GlassWater",
    image: kempinskiImg,
    isCompleted: false,
    voucherCode: "NMY-DAY50-KEMPINSKI-FINEDINING"
  }
];

export const INITIAL_MEMORIES: MemoryPhoto[] = [
  {
    id: "mem-1",
    title: "Momen Ulang Tahun Spesial Namira 🎂✨",
    date: "12 Agustus 2026",
    location: "Jakarta",
    description: "Senyum manismu saat meniup lilin kue ulang tahun adalah pemandangan terindah dalam hidup ur bf. Semoga semua impianmu terwujud ya sayang!",
    imageUrl: heroCoverImg,
    category: "Ulang Tahun",
    likes: 12,
    lovedByNamira: true
  },
  {
    id: "mem-2",
    title: "Kencan Pertama yang Selalu Dikenang ☕❤️",
    date: "14 Februari 2024",
    location: "Coffee Shop Aesthetic, Jakarta",
    description: "Awal dari segalanya. Masih ingat betapa deg-degannya ur bf waktu pertama kali duduk berdua sama kamu. Mata dan senyummu langsung bikin ur bf jatuh hati.",
    imageUrl: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=1000&auto=format&fit=crop",
    category: "Kencan Pertama",
    likes: 9,
    lovedByNamira: true
  },
  {
    id: "mem-3",
    title: "Liburan Impian & Menikmati Sunset Berdua 🌅🏝️",
    date: "20 Juni 2025",
    location: "Pantai Sunset, Bali",
    description: "Duduk berdua di atas pasir pantai sambil mendengarkan deru ombak dan memandangi jingga sunset Bali. Momen tenang yang sempurna bersamamu.",
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000&auto=format&fit=crop",
    category: "Liburan",
    likes: 15,
    lovedByNamira: true
  },
  {
    id: "mem-4",
    title: "Masak-Masak & Ketawa Bareng di Dapur 🍝👩‍🍳",
    date: "10 November 2025",
    location: "Rumah",
    description: "Meskipun sausnya sempat keasinan sikit, tapi ketawa dan kebersamaan kita bikin masakan ini terasa paling enak di dunia!",
    imageUrl: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=1000&auto=format&fit=crop",
    category: "Sehari-hari",
    likes: 8,
    lovedByNamira: false
  },
  {
    id: "mem-5",
    title: "Nonton Konser & Menyanyi Bersama 🎵🎤",
    date: "05 Desember 2025",
    location: "Stadium Concert Hall",
    description: "Menyanyikan lagu favorit kita dengan suara lantang di tengah riuhnya ribuan penonton. Tangan kita saling menggenggam erat.",
    imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1000&auto=format&fit=crop",
    category: "Momen Spesial",
    likes: 11,
    lovedByNamira: true
  }
];

export const INITIAL_NOTES: LoveNote[] = [];
