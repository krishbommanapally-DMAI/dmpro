/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Question, Category, Achievement, GameSettings, LeaderboardEntry } from './types';

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'general',
    name: 'General Trivia',
    description: 'A mind-bending journey through history, world events, and trivia.',
    icon: 'Globe',
    color: 'from-blue-600 to-indigo-600',
  },
  {
    id: 'tech',
    name: 'Science & Tech',
    description: 'Quantum physics, coding lore, space exploration, and futuristic gadgets.',
    icon: 'Cpu',
    color: 'from-cyan-500 to-blue-500',
  },
  {
    id: 'brands',
    name: 'Logo & Brand Quiz',
    description: 'Identify famous brands, logos, and advertising legends.',
    icon: 'Award',
    color: 'from-amber-500 to-amber-600',
  },
  {
    id: 'emoji',
    name: 'Emoji Puzzles',
    description: 'Decode movies, idioms, and famous personalities hidden in emojis.',
    icon: 'Smile',
    color: 'from-pink-500 to-rose-500',
  },
  {
    id: 'flags',
    name: 'Flags of the World',
    description: 'Identify countries by their flags, colors, and national symbols.',
    icon: 'Flag',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    id: 'monuments',
    name: 'Monuments & Travel',
    description: 'Epic landmarks, ancient wonders, and breathtaking locations.',
    icon: 'MapPin',
    color: 'from-purple-500 to-indigo-500',
  }
];

export const DEFAULT_QUESTIONS: Question[] = [
  // General Trivia
  {
    id: 'g1',
    question: 'Which of these is the largest ocean on Earth?',
    type: 'mcq',
    options: ['Atlantic Ocean', 'Indian Ocean', 'Pacific Ocean', 'Arctic Ocean'],
    correctAnswer: 'Pacific Ocean',
    explanation: 'The Pacific Ocean is the largest and deepest of Earth\'s oceanic divisions, covering about 46% of Earth\'s water surface.',
    hint: 'It is named after the Latin word for "peaceful".',
    difficulty: 'easy',
    category: 'general',
    points: 100
  },
  {
    id: 'g2',
    question: 'The Great Wall of China is fully visible from outer space with the naked eye.',
    type: 'boolean',
    options: ['True', 'False'],
    correctAnswer: 'False',
    explanation: 'Despite the popular myth, the Great Wall of China is typically not visible to the naked eye from low Earth orbit without aid, as it is narrow and blends with the environment.',
    hint: 'Human eye resolution is not high enough to see a 10m wide wall from 400km away.',
    difficulty: 'easy',
    category: 'general',
    points: 100
  },
  // Science & Tech
  {
    id: 't1',
    question: 'What is the speed of light in a vacuum?',
    type: 'mcq',
    options: ['~150,000 km/s', '~300,000 km/s', '~500,000 km/s', '~1,000,000 km/s'],
    correctAnswer: '~300,000 km/s',
    explanation: 'The speed of light in vacuum is exactly 299,792 kilometers per second, which is roughly 300,000 km/s.',
    hint: 'Light takes about 8 minutes to travel from the Sun to the Earth.',
    difficulty: 'medium',
    category: 'tech',
    points: 150
  },
  {
    id: 't2',
    question: 'Which element has the chemical symbol "Au"?',
    type: 'mcq',
    options: ['Silver', 'Gold', 'Copper', 'Aluminium'],
    correctAnswer: 'Gold',
    explanation: 'The symbol "Au" is derived from the Latin word "aurum", which means "shining dawn".',
    hint: 'It is a highly valued precious metal known for its luster and luxury.',
    difficulty: 'easy',
    category: 'tech',
    points: 100
  },
  // Brands & Logos
  {
    id: 'b1',
    question: 'Which corporate tech giant originally featured Isaac Newton sitting under an apple tree in its logo?',
    type: 'logo',
    options: ['Microsoft', 'Apple', 'Intel', 'HP'],
    correctAnswer: 'Apple',
    explanation: 'Apple\'s very first logo, designed by Ronald Wayne in 1976, showed Isaac Newton sitting under an apple tree, with a poem in the border.',
    hint: 'Founded by Steve Jobs, Steve Wozniak, and Ronald Wayne.',
    difficulty: 'medium',
    category: 'brands',
    points: 150,
    imageUrl: '🍎' // Visual character representation
  },
  {
    id: 'b2',
    question: 'What premium luxury car brand has a logo featuring a charging bull?',
    type: 'logo',
    options: ['Ferrari', 'Porsche', 'Lamborghini', 'Maserati'],
    correctAnswer: 'Lamborghini',
    explanation: 'Lamborghini\'s logo features a golden charging bull on a black shield, representing the founder Ferruccio Lamborghini\'s zodiac sign (Taurus).',
    hint: 'Famous for hypercars like the Aventador and Huracán.',
    difficulty: 'medium',
    category: 'brands',
    points: 150,
    imageUrl: '🐂'
  },
  // Emoji Puzzles
  {
    id: 'e1',
    question: 'Guess the movie from these emojis:',
    type: 'emoji',
    emojiSymbol: '🦁👑👑',
    options: ['The Lion King', 'Madagascar', 'Gladiator', 'Black Panther'],
    correctAnswer: 'The Lion King',
    explanation: 'The combination of the Lion and Crown emojis refers to Disney\'s legendary film "The Lion King".',
    hint: 'Hakuna Matata!',
    difficulty: 'easy',
    category: 'emoji',
    points: 100
  },
  {
    id: 'e2',
    question: 'Guess the famous sci-fi movie from these emojis:',
    type: 'emoji',
    emojiSymbol: '🪐🚀🕶️🔴🔵',
    options: ['Interstellar', 'The Matrix', 'Star Wars', 'Avatar'],
    correctAnswer: 'The Matrix',
    explanation: 'The sunglasses, pills (red pill, blue pill), and spaceship/simulation elements point to the reality-bending sci-fi hit "The Matrix".',
    hint: 'Choose between the red pill or the blue pill.',
    difficulty: 'medium',
    category: 'emoji',
    points: 150
  },
  // Flags of the World
  {
    id: 'f1',
    question: 'Which country\'s flag is a red circle on a solid white background?',
    type: 'flag',
    options: ['South Korea', 'Japan', 'Palau', 'Bangladesh'],
    correctAnswer: 'Japan',
    explanation: 'The national flag of Japan is a white rectangular flag with a crimson circle at its center, representing the rising sun.',
    hint: 'This nation is known as the "Land of the Rising Sun".',
    difficulty: 'easy',
    category: 'flags',
    points: 100,
    imageUrl: '🇯🇵'
  },
  {
    id: 'f2',
    question: 'Which country has a flag featuring a stylized red maple leaf at the center?',
    type: 'flag',
    options: ['Canada', 'Switzerland', 'Austria', 'Denmark'],
    correctAnswer: 'Canada',
    explanation: 'The National Flag of Canada, often simply referred to as the Canadian Flag or the Maple Leaf, features a central 11-pointed maple leaf.',
    hint: 'Its capital is Ottawa.',
    difficulty: 'easy',
    category: 'flags',
    points: 100,
    imageUrl: '🇨🇦'
  },
  // Monuments & Travel
  {
    id: 'm1',
    question: 'In which city would you find the world-famous Colosseum?',
    type: 'image',
    options: ['Athens', 'Rome', 'Paris', 'Istanbul'],
    correctAnswer: 'Rome',
    explanation: 'The Colosseum is an oval amphitheatre in the centre of the city of Rome, Italy, built under the Flavian dynasty.',
    hint: 'It is the capital city of Italy.',
    difficulty: 'easy',
    category: 'monuments',
    points: 100,
    imageUrl: '🏛️'
  },
  {
    id: 'm2',
    question: 'Where is the iconic Taj Mahal located?',
    type: 'image',
    options: ['Agra, India', 'New Delhi, India', 'Cairo, Egypt', 'Lahore, Pakistan'],
    correctAnswer: 'Agra, India',
    explanation: 'The Taj Mahal is an ivory-white marble mausoleum on the south bank of the Yamuna river in the Indian city of Agra, built by the Mughal emperor Shah Jahan.',
    hint: 'It was built as a symbol of eternal love for Mumtaz Mahal.',
    difficulty: 'medium',
    category: 'monuments',
    points: 150,
    imageUrl: '🕌'
  },
  // Puzzles
  {
    id: 'p1',
    question: 'What has keys but can\'t open single locks, has space but no room, and you can enter but can\'t go outside?',
    type: 'puzzle',
    puzzleClue: '🎹',
    options: ['A Piano', 'A Book', 'A Keyboard', 'A Map'],
    correctAnswer: 'A Keyboard',
    explanation: 'A computer keyboard has letter keys, a space bar, and an Enter key!',
    hint: 'You are using one right now to type or navigate.',
    difficulty: 'hard',
    category: 'general',
    points: 200
  }
];

export const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_win',
    title: 'Showtime Champion',
    description: 'Complete and win your first quiz session.',
    xpReward: 100,
    coinReward: 50,
    icon: 'Trophy',
    metric: 'gamesPlayed',
    targetValue: 1,
    currentValue: 0,
    unlocked: false,
  },
  {
    id: 'quiz_master',
    title: 'Ultimate Brainiac',
    description: 'Reach a cumulative score of 1,000 points.',
    xpReward: 300,
    coinReward: 150,
    icon: 'Brain',
    metric: 'totalScore',
    targetValue: 1000,
    currentValue: 0,
    unlocked: false,
  },
  {
    id: 'streak_3',
    title: 'Triple Threat',
    description: 'Answer 3 questions correctly in a row.',
    xpReward: 150,
    coinReward: 75,
    icon: 'Flame',
    metric: 'highestStreak',
    targetValue: 3,
    currentValue: 0,
    unlocked: false,
  },
  {
    id: 'wealthy',
    title: 'High Roller',
    description: 'Earn 500 gold coins across your gaming career.',
    xpReward: 200,
    coinReward: 100,
    icon: 'Coins',
    metric: 'coins',
    targetValue: 500,
    currentValue: 0,
    unlocked: false,
  },
  {
    id: 'survivalist',
    title: 'Last Man Standing',
    description: 'Play a full game in Survival Mode.',
    xpReward: 250,
    coinReward: 100,
    icon: 'Heart',
    metric: 'gamesPlayed',
    targetValue: 3, // Play multiple games to unlock
    currentValue: 0,
    unlocked: false,
  }
];

export const DEFAULT_LEADERBOARD: LeaderboardEntry[] = [
  {
    id: 'l1',
    name: 'ShortsKing_99',
    score: 1850,
    accuracy: 95,
    timeTaken: 120,
    date: '2026-07-19',
    avatar: '👑',
    mode: 'classic'
  },
  {
    id: 'l2',
    name: 'TriviaToni',
    score: 1620,
    accuracy: 90,
    timeTaken: 140,
    date: '2026-07-18',
    avatar: '⚡',
    mode: 'time_attack'
  },
  {
    id: 'l3',
    name: 'QuizVlogger',
    score: 1450,
    accuracy: 85,
    timeTaken: 110,
    date: '2026-07-19',
    avatar: '🎥',
    mode: 'classic'
  },
  {
    id: 'l4',
    name: 'MindPalace',
    score: 1200,
    accuracy: 80,
    timeTaken: 160,
    date: '2026-07-17',
    avatar: '🧠',
    mode: 'survival'
  },
  {
    id: 'l5',
    name: 'CreatorBeast',
    score: 950,
    accuracy: 75,
    timeTaken: 90,
    date: '2026-07-19',
    avatar: '🦁',
    mode: 'rapid_fire'
  }
];

export const INITIAL_SETTINGS: GameSettings = {
  timerDuration: 20,
  showTimerRing: true,
  creatorMode: false,
  sound: {
    musicVolume: 0.5,
    sfxVolume: 0.6,
    musicEnabled: true,
    sfxEnabled: true,
  },
  theme: 'blue_neon',
  language: 'en',
  reducedMotion: false,
  autoNext: true,
};

export const THEME_CONFIGS: Record<string, { name: string; bg: string; text: string; primary: string; secondary: string; glow: string; textHex: string; accentHex: string }> = {
  blue_neon: {
    name: 'Blue Neon',
    bg: 'bg-slate-950 text-slate-100',
    text: 'text-slate-100',
    primary: 'border-blue-500/50 bg-blue-950/25 shadow-[0_0_15px_rgba(59,130,246,0.25)] hover:border-blue-400 hover:bg-blue-900/40',
    secondary: 'text-amber-400',
    glow: 'shadow-[0_0_30px_rgba(37,99,235,0.4)]',
    textHex: '#ffffff',
    accentHex: '#3b82f6',
  },
  gold_premium: {
    name: 'Gold Premium',
    bg: 'bg-zinc-950 text-amber-100',
    text: 'text-amber-100',
    primary: 'border-amber-500/50 bg-amber-950/20 shadow-[0_0_15px_rgba(245,158,11,0.2)] hover:border-amber-400 hover:bg-amber-900/30',
    secondary: 'text-yellow-300',
    glow: 'shadow-[0_0_30px_rgba(245,158,11,0.3)]',
    textHex: '#fef3c7',
    accentHex: '#f59e0b',
  },
  cyber: {
    name: 'Cyberpunk',
    bg: 'bg-neutral-950 text-yellow-400',
    text: 'text-zinc-100',
    primary: 'border-pink-500/50 bg-pink-950/20 shadow-[0_0_15px_rgba(236,72,153,0.25)] hover:border-cyan-400 hover:bg-cyan-950/30',
    secondary: 'text-cyan-400',
    glow: 'shadow-[0_0_30px_rgba(236,72,153,0.4)]',
    textHex: '#facc15',
    accentHex: '#ec4899',
  },
  galaxy: {
    name: 'Cosmic Galaxy',
    bg: 'bg-violet-950/50 text-violet-100',
    text: 'text-violet-100',
    primary: 'border-fuchsia-500/50 bg-fuchsia-950/20 shadow-[0_0_15px_rgba(217,70,239,0.25)] hover:border-violet-400 hover:bg-violet-900/30',
    secondary: 'text-fuchsia-400',
    glow: 'shadow-[0_0_30px_rgba(168,85,247,0.4)]',
    textHex: '#f5f3ff',
    accentHex: '#a855f7',
  },
  minimal: {
    name: 'Studio Minimal',
    bg: 'bg-zinc-900 text-zinc-100',
    text: 'text-zinc-100',
    primary: 'border-zinc-700 bg-zinc-800/50 hover:border-zinc-500 hover:bg-zinc-800',
    secondary: 'text-zinc-300',
    glow: 'shadow-lg',
    textHex: '#f4f4f5',
    accentHex: '#71717a',
  },
  purple: {
    name: 'Royal Violet',
    bg: 'bg-slate-950 text-purple-100',
    text: 'text-purple-100',
    primary: 'border-purple-500/50 bg-purple-950/25 shadow-[0_0_15px_rgba(168,85,247,0.25)] hover:border-purple-400 hover:bg-purple-900/40',
    secondary: 'text-amber-300',
    glow: 'shadow-[0_0_30px_rgba(168,85,247,0.4)]',
    textHex: '#f5f3ff',
    accentHex: '#a855f7',
  },
  crimson: {
    name: 'Crimson Fury',
    bg: 'bg-stone-950 text-rose-100',
    text: 'text-rose-100',
    primary: 'border-red-500/50 bg-red-950/25 shadow-[0_0_15px_rgba(239,68,68,0.25)] hover:border-red-400 hover:bg-red-900/40',
    secondary: 'text-amber-400',
    glow: 'shadow-[0_0_30px_rgba(239,68,68,0.4)]',
    textHex: '#fff1f2',
    accentHex: '#ef4444',
  },
  studio_light: {
    name: 'Studio Light',
    bg: 'bg-slate-50 text-slate-900',
    text: 'text-slate-900',
    primary: 'border-slate-300 bg-white shadow-sm hover:border-amber-500 hover:bg-amber-50 text-slate-900',
    secondary: 'text-amber-600',
    glow: 'shadow-[0_0_20px_rgba(245,158,11,0.05)]',
    textHex: '#0f172a',
    accentHex: '#f59e0b',
  }
};
