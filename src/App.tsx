/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Brain, Flame, Coins, Award, Zap, Clock, ShieldCheck, Heart, Sparkles, Play, Settings, Database, User, Volume2, VolumeX, Radio, Tv } from 'lucide-react';
import { Question, GameMode, GameSettings, LeaderboardEntry, UserProfile, Achievement } from './types';
import { DEFAULT_ACHIEVEMENTS, INITIAL_SETTINGS, DEFAULT_QUESTIONS, DEFAULT_LEADERBOARD } from './data';
import { audioService } from './services/audioService';

// Import our modular custom sub-components
import SplashView from './components/SplashView';
import { ParticlesCanvas, ParticlesCanvasRef } from './components/ParticlesCanvas';
import CategoriesView from './components/CategoriesView';
import QuizView from './components/QuizView';
import LeaderboardView from './components/LeaderboardView';
import ProfileView from './components/ProfileView';
import SettingsView from './components/SettingsView';
import ImportPanel from './components/ImportPanel';
import AIWidget from './components/AIWidget';

type Screen = 'splash' | 'home' | 'categories' | 'quiz' | 'leaderboard' | 'profile' | 'settings' | 'import' | 'ai_generator';

export default function App() {
  const [screen, setScreen] = useState<Screen>('splash');
  const [settings, setSettings] = useState<GameSettings>(INITIAL_SETTINGS);
  
  // Game questions & Leaderboard synced from Express API or fallback data
  const [questions, setQuestions] = useState<Question[]>(DEFAULT_QUESTIONS);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(DEFAULT_LEADERBOARD);

  // Active Quiz parameters
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [quizCategory, setQuizCategory] = useState<string>('all');
  const [quizMode, setQuizMode] = useState<GameMode>('classic');

  // Interactive animation canvas reference
  const particlesCanvasRef = useRef<ParticlesCanvasRef | null>(null);

  // User career profile, persisted locally
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('quiz_creator_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      name: 'Host_Contestant',
      avatar: '👑',
      xp: 0,
      coins: 100,
      level: 1,
      stats: {
        gamesPlayed: 0,
        totalScore: 0,
        correctAnswers: 0,
        wrongAnswers: 0,
        highestStreak: 0,
        avgTime: 12.5,
      },
      unlockedAchievements: [],
      savedQuestions: [],
    };
  });

  // Track achievements progress dynamically
  const [achievements, setAchievements] = useState<Achievement[]>(DEFAULT_ACHIEVEMENTS);

  // Sync profile to localStorage
  useEffect(() => {
    localStorage.setItem('quiz_creator_profile', JSON.stringify(profile));
  }, [profile]);

  // Load questions and rankings from database API on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const qRes = await fetch('/api/questions');
        if (qRes.ok) {
          const qData = await qRes.json();
          setQuestions(qData);
        }

        const lRes = await fetch('/api/leaderboard');
        if (lRes.ok) {
          const lData = await lRes.json();
          setLeaderboard(lData);
        }
      } catch (e) {
        console.warn('Backend API offline, falling back to rich mock memory states.');
      }
    };
    fetchInitialData();
  }, [screen]);

  // Handle setting audio parameters
  const handleUpdateSettings = (newSettings: GameSettings) => {
    setSettings(newSettings);
    audioService.updateSettings(newSettings.sound);
  };

  // Launch Quiz from category selection
  const handleStartQuiz = (categoryId: string, mode: GameMode) => {
    audioService.playClick();
    
    // Filters based on category selection
    let filtered = categoryId === 'all' 
      ? questions 
      : questions.filter(q => q.category === categoryId);

    if (filtered.length === 0) {
      filtered = questions; // Fallback
    }

    // Limit to maximum 10 questions for excellent game show pacing
    const shuffled = [...filtered].sort(() => 0.5 - Math.random()).slice(0, 10);

    setQuizQuestions(shuffled);
    setQuizCategory(categoryId);
    setQuizMode(mode);
    setScreen('quiz');
  };

  // Trigger game complete and earn rewards
  const handleFinishGame = (finalScore: number, finalAccuracy: number, finalCoins: number, highestStreak: number) => {
    audioService.playClick();
    
    // Recompute User Stats and profile progress
    const correctCount = Math.round((shuffledCount() * finalAccuracy) / 100);
    const wrongCount = shuffledCount() - correctCount;

    const newStats = {
      gamesPlayed: profile.stats.gamesPlayed + 1,
      totalScore: profile.stats.totalScore + finalScore,
      correctAnswers: profile.stats.correctAnswers + correctCount,
      wrongAnswers: profile.stats.wrongAnswers + wrongCount,
      highestStreak: Math.max(profile.stats.highestStreak, highestStreak),
      avgTime: profile.stats.avgTime,
    };

    // Calculate XP increase
    const xpIncrease = Math.round(finalScore / 10);
    const totalXp = profile.xp + xpIncrease;
    const newLevel = Math.floor(totalXp / 100) + 1;

    // Trigger visual confetti burst for leveling up!
    if (newLevel > profile.level && particlesCanvasRef.current) {
      particlesCanvasRef.current.triggerSuccess();
    }

    setProfile((prev) => ({
      ...prev,
      xp: totalXp,
      level: newLevel,
      coins: prev.coins + finalCoins,
      stats: newStats,
    }));

    // Reset back to main Home dashboard
    setScreen('home');
  };

  const shuffledCount = () => quizQuestions.length || 5;

  // Handle claimed achievement bonuses
  const handleClaimReward = (achievementId: string, xp: number, coins: number) => {
    setProfile((prev) => ({
      ...prev,
      unlockedAchievements: [...prev.unlockedAchievements, achievementId],
      xp: prev.xp + xp,
      coins: prev.coins + coins,
    }));
  };

  // Handle NotebookLM parsing completed
  const handleImportComplete = (imported: Question[]) => {
    setQuestions((prev) => [...imported, ...prev]);
    setScreen('home');
    if (particlesCanvasRef.current) {
      particlesCanvasRef.current.triggerSuccess();
    }
  };

  // Trigger Daily Challenge instantly
  const startDailyChallenge = () => {
    audioService.playCorrect();
    // Start mixed arena in survival mode for high dramatic stakes!
    handleStartQuiz('all', 'survival');
  };

  const toggleSoundMute = () => {
    const isMuted = !settings.sound.musicEnabled;
    const updatedSound = {
      ...settings.sound,
      musicEnabled: isMuted,
      sfxEnabled: isMuted
    };
    handleUpdateSettings({
      ...settings,
      sound: updatedSound
    });
  };

  return (
    <div
      className={`min-h-screen relative overflow-hidden bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-slate-950 ${
        settings.creatorMode ? 'cursor-none select-none' : ''
      }`}
    >
      {/* Cinematic Spotlight Overlays */}
      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />

      {/* Retro TV Scanlines and grids */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none z-10" />

      {/* Shimmering particle stars canvas */}
      <ParticlesCanvas ref={particlesCanvasRef} />

      <AnimatePresence mode="wait">
        {screen === 'splash' && (
          <SplashView onEnter={() => setScreen('home')} />
        )}

        {screen !== 'splash' && (
          <motion.div
            key="dashboard-stage"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-20 min-h-screen flex flex-col"
          >
            {/* Top Navigation Bar (Hidden during full Creator Mode view) */}
            {!settings.creatorMode && (
              <header className="border-b border-blue-500/10 bg-slate-950/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                  {/* Brand Branding */}
                  <button
                    onClick={() => { audioService.playClick(); setScreen('home'); }}
                    className="flex items-center gap-2 text-left cursor-pointer group"
                  >
                    <Tv className="w-5 h-5 text-amber-400 group-hover:rotate-12 transition-transform" />
                    <div>
                      <span className="font-sans font-black text-sm tracking-widest text-slate-100 uppercase">
                        Cinematic <span className="text-amber-400">Quiz Show</span>
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono uppercase block -mt-0.5">YOUTUBE STUDIO</span>
                    </div>
                  </button>

                  {/* Core Navigation Panels Link */}
                  <nav className="hidden md:flex items-center gap-6 text-xs font-mono tracking-widest uppercase">
                    {[
                      { id: 'home', label: 'Arena Studio' },
                      { id: 'categories', label: 'Play Board' },
                      { id: 'ai_generator', label: 'Gemini AI Ingestion' },
                      { id: 'import', label: 'Imports' },
                      { id: 'leaderboard', label: 'Rankings' },
                      { id: 'profile', label: 'Career Portfolio' },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => { audioService.playClick(); setScreen(tab.id as Screen); }}
                        className={`hover:text-amber-400 cursor-pointer transition-colors ${
                          screen === tab.id ? 'text-amber-400 font-bold' : 'text-slate-400'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </nav>

                  {/* Right Balance & Sound controls */}
                  <div className="flex items-center gap-4">
                    {/* User profile capsule */}
                    <button
                      onClick={() => { audioService.playClick(); setScreen('profile'); }}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900/50 cursor-pointer hover:border-slate-700 transition-colors"
                    >
                      <span className="text-sm">{profile.avatar}</span>
                      <span className="text-xs font-bold text-slate-200">Lvl {profile.level}</span>
                    </button>

                    {/* Mute toggle */}
                    <button
                      onClick={toggleSoundMute}
                      className="p-2 border border-slate-800 bg-slate-900/50 text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
                    >
                      {settings.sound.musicEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
                    </button>

                    <button
                      onClick={() => { audioService.playClick(); setScreen('settings'); }}
                      className="p-2 border border-slate-800 bg-slate-900/50 text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </header>
            )}

            {/* Dynamic Screen Mounting Center */}
            <main className="flex-1 flex flex-col justify-center py-6">
              {screen === 'home' && (
                <div className="w-full max-w-7xl mx-auto px-4 lg:px-6">
                  {/* Three Column Grid of Immersive UI */}
                  <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr_260px] gap-6 items-start">
                    
                    {/* Left Column: Presenter Profile Card */}
                    <div className="space-y-6 lg:sticky lg:top-6">
                      <div className="glass-panel rounded-3xl p-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-500/10 to-transparent rounded-bl-full pointer-events-none" />
                        
                        <div className="flex flex-col items-center text-center">
                          <div className="relative mb-4">
                            <div className="w-20 h-20 flex items-center justify-center rounded-full border-2 border-amber-400 bg-slate-950/80 text-4xl shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                              {profile.avatar}
                            </div>
                            <div className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase font-mono">
                              Lvl {profile.level}
                            </div>
                          </div>
                          
                          <h3 className="font-extrabold text-lg text-slate-100 tracking-tight">{profile.name}</h3>
                          <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider mt-0.5">Presenter Director</p>
                          
                          {/* XP Progress Bar */}
                          <div className="w-full mt-5 space-y-1.5">
                            <div className="flex justify-between text-[10px] font-mono text-slate-400">
                              <span>PROGRESSION XP</span>
                              <span className="text-amber-400 font-bold">{profile.xp % 100}/100 XP</span>
                            </div>
                            <div className="w-full bg-slate-950/80 rounded-full h-2 overflow-hidden border border-white/5 p-0.5">
                              <div 
                                className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full rounded-full shadow-[0_0_8px_rgba(245,158,11,0.5)] transition-all duration-500"
                                style={{ width: `${profile.xp % 100}%` }}
                              />
                            </div>
                          </div>

                          {/* Stat Capsules */}
                          <div className="grid grid-cols-2 gap-2 w-full mt-5 text-left">
                            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                              <span className="text-[9px] font-mono text-slate-500 block uppercase">Coins Balance</span>
                              <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                                <Coins className="w-3.5 h-3.5 text-amber-400" />
                                {profile.coins}
                              </span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                              <span className="text-[9px] font-mono text-slate-500 block uppercase">Correct Rate</span>
                              <span className="text-xs font-bold text-emerald-400">
                                {profile.stats.gamesPlayed > 0 
                                  ? Math.round((profile.stats.correctAnswers / (profile.stats.correctAnswers + profile.stats.wrongAnswers || 1)) * 100)
                                  : 0}%
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() => { audioService.playClick(); setScreen('profile'); }}
                            className="w-full mt-5 py-2.5 glass-button text-[11px] font-mono text-slate-300 rounded-xl tracking-wider uppercase"
                          >
                            Portfolio Dashboard
                          </button>
                        </div>
                      </div>

                      {/* Interactive TV / Sound Widget */}
                      <div className="glass-panel rounded-3xl p-5 space-y-4">
                        <div className="flex items-center gap-2 border-b border-white/5 pb-2.5">
                          <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
                          <span className="text-xs font-mono font-bold uppercase text-slate-300">STUDIO MASTER</span>
                        </div>
                        <div className="space-y-3">
                          <button
                            onClick={toggleSoundMute}
                            className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-white/5 hover:border-cyan-500/20 text-xs transition-colors cursor-pointer"
                          >
                            <span className="text-slate-400">Audio Broadcast</span>
                            <span className="font-mono font-bold text-cyan-400">
                              {settings.sound.musicEnabled ? "ON AIR" : "MUTED"}
                            </span>
                          </button>
                          <button
                            onClick={() => { audioService.playClick(); setScreen('settings'); }}
                            className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-white/5 hover:border-pink-500/20 text-xs transition-colors cursor-pointer"
                          >
                            <span className="text-slate-400">Studio Theme</span>
                            <span className="font-mono font-bold text-pink-400 uppercase">
                              {settings.theme.replace('_', ' ')}
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Center Column: Main Game Show Arena (Spotlight Daily + Arenas grid) */}
                    <div className="space-y-6">
                      
                      {/* Premium Spotlight Daily Challenge Card */}
                      <div className="relative p-8 rounded-3xl border border-amber-500/20 bg-gradient-to-r from-slate-950 via-amber-950/20 to-slate-950 overflow-hidden shadow-[0_0_40px_rgba(245,158,11,0.06)] flex flex-col md:flex-row items-center justify-between gap-6 group">
                        <div className="absolute top-0 right-0 p-4 bg-amber-500/5 text-amber-500/30 rounded-bl-3xl">
                          <Radio className="w-10 h-10 animate-pulse text-amber-500/40" />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                        <div className="space-y-2.5 flex-1 relative z-10">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-amber-400" />
                            <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">Featured Broadcast</span>
                          </div>
                          <h2 className="text-3xl md:text-4xl font-black text-slate-100 tracking-tight leading-none">THE DAILY SHOWDOWN</h2>
                          <p className="text-xs text-slate-400 font-sans max-w-xl leading-relaxed">
                            A dynamic, high-stakes mixed-trivia survival quiz. 3 lives. Extreme difficulty levels. Triple XP and Gold rewards earned upon completion!
                          </p>
                        </div>

                        <button
                          id="play-daily-btn"
                          onClick={startDailyChallenge}
                          className="px-8 py-4.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-widest shadow-[0_0_25px_rgba(245,158,11,0.3)] hover:scale-105 active:scale-95 transition-all cursor-pointer whitespace-nowrap relative z-10"
                        >
                          Accept Challenge
                        </button>
                      </div>

                      {/* Quiz Arenas Main Block */}
                      <div className="glass-panel rounded-3xl p-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-44 h-44 bg-gradient-to-br from-blue-500/10 to-transparent rounded-bl-full pointer-events-none" />
                        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                          <div className="space-y-2">
                            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                              <Play className="w-6 h-6 fill-blue-400" />
                            </div>
                            <h3 className="font-extrabold text-2xl text-slate-100 tracking-tight">QUIZ ARENAS</h3>
                            <p className="text-xs text-slate-400 max-w-lg leading-relaxed font-sans">
                              Select from Time Attack, Survival, or Classic game show formats. Play built-in categories, image-based, or dynamic mixed playlists.
                            </p>
                          </div>
                          <button
                            id="open-categories-btn"
                            onClick={() => { audioService.playClick(); setScreen('categories'); }}
                            className="px-6 py-4 bg-blue-600 hover:bg-blue-500 active:scale-95 text-slate-100 text-xs font-bold uppercase tracking-widest rounded-xl transition-all cursor-pointer whitespace-nowrap shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                          >
                            Enter Play Arena &rarr;
                          </button>
                        </div>
                      </div>

                      {/* Sub-Bento Secondary Ingestion Options */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* AI Ingestion Block */}
                        <div className="glass-panel rounded-3xl p-6 overflow-hidden relative group h-64 flex flex-col justify-between">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-500/10 to-transparent rounded-bl-full pointer-events-none" />
                          <div>
                            <div className="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4 text-cyan-400">
                              <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
                            </div>
                            <h3 className="font-extrabold text-lg text-slate-100 tracking-tight">AI QUESTIONS GENERATOR</h3>
                            <p className="text-xs text-slate-400 mt-2 max-w-xs leading-relaxed font-sans">
                              Generate highly custom game show segments instantly using the server-side Gemini API.
                            </p>
                          </div>
                          <button
                            onClick={() => { audioService.playClick(); setScreen('ai_generator'); }}
                            className="w-full py-3 bg-slate-950/60 border border-cyan-500/30 hover:bg-cyan-500/10 hover:border-cyan-400 text-[11px] text-cyan-400 font-bold uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                          >
                            Start AI Materialization
                          </button>
                        </div>

                        {/* Ingestion & Paste Block */}
                        <div className="glass-panel rounded-3xl p-6 overflow-hidden relative group h-64 flex flex-col justify-between">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-500/10 to-transparent rounded-bl-full pointer-events-none" />
                          <div>
                            <div className="w-11 h-11 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center mb-4 text-pink-400">
                              <Database className="w-5 h-5 text-pink-400" />
                            </div>
                            <h3 className="font-extrabold text-lg text-slate-100 tracking-tight">NOTEBOOKLM INGESTION</h3>
                            <p className="text-xs text-slate-400 mt-2 max-w-xs leading-relaxed font-sans">
                              Paste study logs, chat transcripts, or spreadsheets. Automatically extracts and validates question matrices.
                            </p>
                          </div>
                          <button
                            onClick={() => { audioService.playClick(); setScreen('import'); }}
                            className="w-full py-3 bg-slate-950/60 border border-pink-500/30 hover:bg-pink-500/10 hover:border-pink-400 text-[11px] text-pink-400 font-bold uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                          >
                            Paste Custom Segments
                          </button>
                        </div>
                      </div>

                    </div>

                    {/* Right Column: World Rankings Leaderboard */}
                    <div className="space-y-6 lg:sticky lg:top-6">
                      <div className="glass-panel rounded-3xl p-6 relative overflow-hidden">
                        <div className="flex items-center justify-between border-b border-white/5 pb-3.5 mb-4">
                          <div className="flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-amber-400" />
                            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">WORLD STANDINGS</span>
                          </div>
                          <span className="text-[10px] bg-amber-500/10 text-amber-400 font-mono font-bold px-2 py-0.5 rounded-md">LIVE</span>
                        </div>

                        {/* Mini standings list */}
                        <div className="space-y-3">
                          {leaderboard.slice(0, 5).map((entry, index) => {
                            const isUser = entry.name === profile.name;
                            const medals = ["🥇", "🥈", "🥉"];
                            return (
                              <div 
                                key={entry.id || index}
                                className={`flex items-center justify-between p-2.5 rounded-xl border transition-colors ${
                                  isUser 
                                    ? "bg-amber-500/10 border-amber-500/30" 
                                    : "bg-slate-950/35 border-white/5 hover:border-white/10"
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <span className="text-xs font-mono font-bold text-slate-400 w-4">
                                    {index < 3 ? medals[index] : `${index + 1}`}
                                  </span>
                                  <div className="min-w-0">
                                    <span className="text-xs font-bold text-slate-100 block truncate leading-tight">
                                      {entry.name}
                                    </span>
                                    <span className="text-[9px] text-slate-500 font-mono">
                                      {entry.mode.toUpperCase().replace('_', ' ')} • {entry.accuracy}% ACC
                                    </span>
                                  </div>
                                </div>
                                <span className="text-xs font-mono font-bold text-amber-400">
                                  {entry.score}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        <button
                          onClick={() => { audioService.playClick(); setScreen('leaderboard'); }}
                          className="w-full mt-5 py-3 bg-slate-950/60 border border-slate-800 hover:border-slate-600 text-[11px] font-mono text-slate-300 rounded-xl tracking-wider uppercase transition-all"
                        >
                          Standings Board
                        </button>
                      </div>

                      {/* Broadcast Tips block */}
                      <div className="glass-panel rounded-3xl p-5 space-y-2 text-left">
                        <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest font-bold">PRODUCER SECRET</span>
                        <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                          Press <span className="text-white font-mono font-bold">F11</span> in your browser to enter full screen. Toggle <span className="text-amber-400 font-sans font-bold">Creator Mode</span> to hide user menus for immersive recordings!
                        </p>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {screen === 'categories' && (
                <CategoriesView
                  onSelect={handleStartQuiz}
                  onBack={() => setScreen('home')}
                />
              )}

              {screen === 'quiz' && (
                <QuizView
                  questions={quizQuestions}
                  category={quizCategory}
                  mode={quizMode}
                  settings={settings}
                  particlesRef={particlesCanvasRef}
                  onFinishGame={handleFinishGame}
                  onBack={() => setScreen('home')}
                />
              )}

              {screen === 'leaderboard' && (
                <LeaderboardView
                  entries={leaderboard}
                  onBack={() => setScreen('home')}
                />
              )}

              {screen === 'profile' && (
                <ProfileView
                  profile={profile}
                  achievements={achievements}
                  onClaimReward={handleClaimReward}
                  onBack={() => setScreen('home')}
                />
              )}

              {screen === 'settings' && (
                <SettingsView
                  settings={settings}
                  onUpdate={handleUpdateSettings}
                  onBack={() => setScreen('home')}
                />
              )}

              {screen === 'import' && (
                <ImportPanel
                  onImportComplete={handleImportComplete}
                  onBack={() => setScreen('home')}
                />
              )}

              {screen === 'ai_generator' && (
                <AIWidget
                  onQuestionsGenerated={(newQs) => {
                    setQuestions((prev) => [...newQs, ...prev]);
                    setScreen('home');
                  }}
                  onBack={() => setScreen('home')}
                />
              )}
            </main>

            {/* Global Footer (Hidden in Creator Mode view for recording perfection) */}
            {!settings.creatorMode && (
              <footer className="border-t border-blue-500/10 py-6 bg-slate-950/80 text-center text-xs text-slate-500 font-mono mt-8">
                CINEMATIC QUIZ SHOW ENGINE V1.2 • PRODUCED FOR GAMEPLAY RECORDING CREATORS • POWERED BY GEMINI AI
              </footer>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
