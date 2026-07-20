/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type QuestionType = 'mcq' | 'boolean' | 'emoji' | 'image' | 'logo' | 'flag' | 'puzzle';

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Question {
  id: string;
  question: string;
  type: QuestionType;
  options: string[];
  correctAnswer: string;
  explanation: string;
  hint: string;
  difficulty: Difficulty;
  category: string;
  points: number;
  imageUrl?: string; // Standard or image base64
  emojiSymbol?: string; // For emoji quiz
  puzzleClue?: string; // For puzzle quiz
}

export type GameMode = 'classic' | 'time_attack' | 'survival' | 'rapid_fire';

export type Theme = 'blue_neon' | 'gold_premium' | 'cyber' | 'galaxy' | 'minimal' | 'purple' | 'crimson';

export interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  accuracy: number;
  timeTaken: number; // in seconds
  date: string;
  rank?: number;
  avatar: string;
  mode: GameMode;
}

export interface UserStats {
  gamesPlayed: number;
  totalScore: number;
  correctAnswers: number;
  wrongAnswers: number;
  highestStreak: number;
  avgTime: number;
}

export interface UserProfile {
  name: string;
  avatar: string;
  xp: number;
  coins: number;
  level: number;
  stats: UserStats;
  unlockedAchievements: string[];
  savedQuestions: Question[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  coinReward: number;
  icon: string;
  metric: keyof UserStats | 'xp' | 'coins' | 'custom';
  targetValue: number;
  currentValue: number;
  unlocked: boolean;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  bannerImage?: string;
}

export interface SoundSettings {
  musicVolume: number; // 0 to 1
  sfxVolume: number; // 0 to 1
  musicEnabled: boolean;
  sfxEnabled: boolean;
}

export interface GameSettings {
  timerDuration: number; // in seconds
  showTimerRing: boolean;
  creatorMode: boolean; // Hide mouse, large typography, perfect for recording
  sound: SoundSettings;
  theme: Theme;
  language: string;
  reducedMotion: boolean;
  autoNext: boolean; // Auto advance in Creator Mode
}
