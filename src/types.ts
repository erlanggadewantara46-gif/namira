export type UserEmail = 'erlanggadewantara46@gmail.com' | 'namirafisilmiyasmin@gmail.com';

export interface User {
  email: UserEmail;
  name: string;
  nickname: string;
  role: 'erlangga' | 'namira';
  avatar: string;
}

export interface MilestoneChallenge {
  day: number;
  title: string;
  description: string;
  reward: string;
  rewardDetails: string;
  category: 'Snack & Food' | 'Quality Time' | 'Relaxation' | 'Travel & Luxury';
  iconName: string;
  image: string;
  isCompleted: boolean;
  completedAt?: string;
  completedBy?: string;
  voucherCode: string;
}

export interface MemoryPhoto {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
  imageUrl: string;
  category: string;
  likes: number;
  lovedByNamira?: boolean;
}

export interface LoveNote {
  id: string;
  senderEmail: string;
  senderName: string;
  recipientEmail: string;
  content: string;
  createdAt: string;
  mood: 'sweet' | 'romantic' | 'playful' | 'grateful';
  isAI?: boolean;
}

export interface AppStateData {
  milestones: MilestoneChallenge[];
  memories: MemoryPhoto[];
  notes: LoveNote[];
  relationshipStartDate: string;
  birthdayDate: string;
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
  stat1Label?: string;
  stat1Sublabel?: string;
  stat2Value?: string;
  stat2Label?: string;
  stat3Value?: string;
  stat3Label?: string;
}
