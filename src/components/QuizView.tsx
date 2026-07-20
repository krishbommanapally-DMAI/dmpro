/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Clock, Heart, Award, Sparkles, Brain, AlertCircle, RefreshCw, Star, Coins, Volume2, Flame, User, ArrowRight, Play, EyeOff } from 'lucide-react';
import { Question, GameMode, GameSettings, LeaderboardEntry, Difficulty } from '../types';
import { THEME_CONFIGS } from '../data';
import { audioService } from '../services/audioService';

interface QuizViewProps {
  questions: Question[];
  category: string;
  mode: GameMode;
  settings: GameSettings;
  particlesRef: any; // Ref to trigger visual canvas effects
  onFinishGame: (finalScore: number, finalAccuracy: number, finalCoins: number, highestStreak: number) => void;
  onBack: () => void;
}

export const QuizView: React.FC<QuizViewProps> = ({
  questions,
  category,
  mode,
  settings,
  particlesRef,
  onFinishGame,
  onBack,
}) => {
  // Gameplay State
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [highestStreak, setHighestStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [coinsWon, setCoinsWon] = useState(0);

  // Time Attack Global Clock
  const [globalTime, setGlobalTime] = useState(45);

  // Survival Lives count
  const [lives, setLives] = useState(3);

  // Individual Question Timer
  const [timeRemaining, setTimeRemaining] = useState(settings.timerDuration);
  const timerIntervalRef = useRef<any>(null);

  // AI Hint & Explanation helpers
  const [aiHint, setAiHint] = useState<string | null>(null);
  const [fetchingHint, setFetchingHint] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [fetchingExplanation, setFetchingExplanation] = useState(false);

  // Game over state
  const [isGameOver, setIsGameOver] = useState(false);

  // Leaderboard registry
  const [username, setUsername] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const themeConfig = THEME_CONFIGS[settings.theme] || THEME_CONFIGS.blue_neon;
  const activeQuestion = questions[currentIdx];

  // Initialize individual and global countdown timers
  useEffect(() => {
    if (isGameOver || !activeQuestion) return;

    // Set individual timers based on game mode
    const initialDuration = mode === 'rapid_fire' ? 5 : settings.timerDuration;
    setTimeRemaining(initialDuration);

    // Dynamic ticking clock interval
    timerIntervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerIntervalRef.current);
          handleTimeout();
          return 0;
        }
        // Play click-tick sound on sfx
        if (settings.sound.sfxEnabled) {
          audioService.playTick();
        }
        return prev - 1;
      });

      // Maintain Time Attack global countdown decrease
      if (mode === 'time_attack') {
        setGlobalTime((prev) => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current);
            setIsGameOver(true);
            audioService.playExplosion();
            if (particlesRef.current) {
              particlesRef.current.triggerError();
            }
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [currentIdx, isGameOver, activeQuestion]);

  // Handle timeout (hitting 0s)
  const handleTimeout = () => {
    if (isAnswered || isGameOver) return;
    
    audioService.playWrong();
    if (particlesRef.current) {
      particlesRef.current.triggerError();
    }

    setSelectedAnswer(''); // Timeout flag
    setIsAnswered(true);
    setStreak(0);

    if (mode === 'survival') {
      setLives((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          setIsGameOver(true);
          audioService.playExplosion();
        }
        return next;
      });
    }

    if (mode === 'time_attack') {
      setGlobalTime((prev) => Math.max(0, prev - 10)); // Major penalty
    }

    // Auto next triggers in Creator Mode after delay
    if (settings.creatorMode && settings.autoNext) {
      setTimeout(() => {
        handleNextQuestion();
      }, 4000);
    }
  };

  // Submit answer choice
  const handleSelectAnswer = (choice: string) => {
    if (isAnswered || isGameOver) return;

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    setSelectedAnswer(choice);
    setIsAnswered(true);

    const isCorrect = choice === activeQuestion.correctAnswer;

    if (isCorrect) {
      // Correct!
      audioService.playCorrect();
      audioService.playCoin();
      if (particlesRef.current) {
        particlesRef.current.triggerSuccess();
        particlesRef.current.triggerCoinRain();
      }

      const nextStreak = streak + 1;
      setStreak(nextStreak);
      if (nextStreak > highestStreak) {
        setHighestStreak(nextStreak);
      }

      setCorrectCount((prev) => prev + 1);

      // Multiplier logic
      const multiplier = nextStreak >= 5 ? 3 : nextStreak >= 3 ? 2 : 1;
      const basePoints = activeQuestion.points || 100;
      const pointsEarned = basePoints * multiplier;
      setScore((prev) => prev + pointsEarned);

      // Gold coin rewards
      const coinsEarned = 10 * multiplier;
      setCoinsWon((prev) => prev + coinsEarned);

      // Adds extra seconds in Time Attack
      if (mode === 'time_attack') {
        setGlobalTime((prev) => prev + 5);
      }

    } else {
      // Wrong!
      audioService.playWrong();
      if (particlesRef.current) {
        particlesRef.current.triggerError();
      }

      setStreak(0);

      if (mode === 'survival') {
        setLives((prev) => {
          const next = prev - 1;
          if (next <= 0) {
            setIsGameOver(true);
            audioService.playExplosion();
          }
          return next;
        });
      }

      if (mode === 'time_attack') {
        setGlobalTime((prev) => Math.max(0, prev - 10)); // Deduct 10s penalty
      }
    }

    // Creator Mode auto-advance support
    if (settings.creatorMode && settings.autoNext) {
      setTimeout(() => {
        handleNextQuestion();
      }, 4000);
    }
  };

  // Advance stage
  const handleNextQuestion = () => {
    setAiHint(null);
    setAiExplanation(null);
    setSelectedAnswer(null);
    setIsAnswered(false);

    if (currentIdx + 1 < questions.length) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      // End game
      setIsGameOver(true);
      audioService.playVictory();
    }
  };

  // Dynamic Hint AI
  const fetchAiHint = async () => {
    if (fetchingHint || aiHint) return;
    setFetchingHint(true);
    audioService.playClick();

    try {
      const res = await fetch('/api/ai/hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: activeQuestion.question,
          options: activeQuestion.options,
          category: activeQuestion.category,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAiHint(data.hint);
      } else {
        setAiHint(activeQuestion.hint);
      }
    } catch (e) {
      setAiHint(activeQuestion.hint);
    } finally {
      setFetchingHint(false);
    }
  };

  // Dynamic Host Commentary AI
  const fetchAiExplanation = async () => {
    if (fetchingExplanation || aiExplanation) return;
    setFetchingExplanation(true);
    audioService.playClick();

    try {
      const res = await fetch('/api/ai/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: activeQuestion.question,
          correctAnswer: activeQuestion.correctAnswer,
          explanation: activeQuestion.explanation,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAiExplanation(data.explanation);
      } else {
        setAiExplanation(activeQuestion.explanation);
      }
    } catch (e) {
      setAiExplanation(activeQuestion.explanation);
    } finally {
      setFetchingExplanation(false);
    }
  };

  // Submit final show results to world leaderboard
  const handleSubmitScore = async () => {
    if (!username.trim() || submitted) return;
    audioService.playClick();

    try {
      const accuracy = Math.round((correctCount / (questions.length || 1)) * 100);
      await fetch('/api/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: username.trim(),
          score,
          accuracy,
          timeTaken: 120, // default placeholder, could track actual timer differences
          avatar: '🎬',
          mode
        }),
      });
      setSubmitted(true);
      audioService.playVictory();
    } catch (e) {
      console.error(e);
    }
  };

  // Circular timer config
  const maxTimerVal = mode === 'rapid_fire' ? 5 : settings.timerDuration;
  const strokeDashoffset = 113 - (timeRemaining / maxTimerVal) * 113;

  // Dynamic countdown color
  const getTimerColor = () => {
    const ratio = timeRemaining / maxTimerVal;
    if (ratio > 0.5) return 'stroke-emerald-400';
    if (ratio > 0.25) return 'stroke-yellow-400';
    if (ratio > 0.1) return 'stroke-orange-400';
    return 'stroke-red-500 animate-pulse';
  };

  // UI sizing multiplier for YouTube Creator Mode (super-scaled)
  const creatorLayoutClasses = settings.creatorMode ? 'cursor-none select-none py-12 max-w-3xl' : 'max-w-4xl';

  return (
    <div className={`w-full mx-auto px-4 ${creatorLayoutClasses}`}>
      <AnimatePresence mode="wait">
        {!isGameOver ? (
          <motion.div
            key="gameplay"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Show HUD (Not visible in full Creator screen mode if requested, but kept clean) */}
            <div className="flex items-center justify-between p-4 rounded-2xl border border-blue-500/10 bg-slate-900/35 backdrop-blur-md">
              <div className="flex items-center gap-4 text-xs font-mono">
                <span className="text-slate-400">CATEGORY:</span>
                <span className="text-amber-400 uppercase font-black">{category === 'all' ? 'MIXED ARENA' : category}</span>
                <span className="text-slate-600">|</span>
                <span className="text-slate-400">MODE:</span>
                <span className="text-blue-400 uppercase font-black">{mode}</span>
              </div>

              {/* HUD Right Info */}
              <div className="flex items-center gap-5">
                {/* Score balance */}
                <div className="flex items-center gap-1.5 font-sans">
                  <Coins className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-black text-slate-100">{score}</span>
                </div>

                {/* Combos streak indicators */}
                {streak >= 2 && (
                  <motion.div
                    animate={{ scale: [1, 1.15, 1] }}
                    className="flex items-center gap-1 bg-gradient-to-r from-rose-500 to-amber-500 text-slate-950 font-black text-[10px] uppercase px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(244,63,94,0.3)] font-mono"
                  >
                    <Flame className="w-3 h-3 fill-slate-950" />
                    STREAK x{streak}
                  </motion.div>
                )}

                {/* Lives tracker if survival mode */}
                {mode === 'survival' && (
                  <div className="flex items-center gap-1">
                    {[1, 2, 3].map((lifeIdx) => (
                      <Heart
                        key={lifeIdx}
                        className={`w-4 h-4 ${
                          lifeIdx <= lives ? 'text-red-500 fill-red-500' : 'text-slate-700'
                        } transition-colors`}
                      />
                    ))}
                  </div>
                )}

                {/* Global clock timer if Time Attack */}
                {mode === 'time_attack' && (
                  <div className="flex items-center gap-1.5 font-mono text-sm font-black text-amber-400">
                    <Clock className="w-4 h-4" />
                    {globalTime}s
                  </div>
                )}

                {!settings.creatorMode && (
                  <button
                    onClick={onBack}
                    className="text-xs text-slate-500 hover:text-slate-300 font-mono uppercase tracking-wide cursor-pointer ml-2"
                  >
                    Quit
                  </button>
                )}
              </div>
            </div>

            {/* Central Stage Question Board */}
            <div className="p-8 md:p-10 rounded-3xl border border-white/10 bg-slate-950/60 backdrop-blur-xl shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
              
              {/* Question progress and Circular Clock */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-xs font-mono text-slate-500 uppercase tracking-widest block mb-1">
                    Stage Segment {currentIdx + 1} of {questions.length}
                  </span>
                  <div className="h-1 w-24 bg-slate-950 rounded-full overflow-hidden border border-white/5 p-0.5">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full transition-all duration-300 rounded-full"
                      style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Floating Circular Clock Ring */}
                {mode !== 'time_attack' && (
                  <div className="relative w-12 h-12 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 40 40">
                      <circle cx="20" cy="20" r="18" fill="transparent" stroke="rgba(255,255,255,0.02)" strokeWidth="3" />
                      <circle
                        cx="20"
                        cy="20"
                        r="18"
                        fill="transparent"
                        className={`transition-all duration-1000 ${getTimerColor()}`}
                        strokeWidth="3"
                        strokeDasharray="113"
                        strokeDashoffset={strokeDashoffset}
                      />
                    </svg>
                    <span className="absolute text-xs font-mono font-extrabold text-slate-200">{timeRemaining}</span>
                  </div>
                )}
              </div>

              {/* Special graphical components based on type */}
              <div className="flex flex-col items-center mb-6">
                {activeQuestion.type === 'emoji' && (
                  <motion.div
                    animate={{ scale: [0.95, 1.05, 0.95] }}
                    transition={{ repeat: Infinity, duration: 3 }}
                    className="text-5xl md:text-6xl p-4 mb-4 bg-slate-950/80 border border-white/10 rounded-3xl shadow-inner select-none"
                  >
                    {activeQuestion.emojiSymbol}
                  </motion.div>
                )}

                {activeQuestion.type === 'puzzle' && (
                  <div className="text-4xl p-3 mb-4 bg-slate-950/80 border border-white/10 rounded-3xl shadow-inner select-none font-sans">
                    {activeQuestion.puzzleClue}
                  </div>
                )}

                {/* Flag / Image Representation inside Quiz Card */}
                {(activeQuestion.type === 'flag' || activeQuestion.type === 'image' || activeQuestion.type === 'logo') && activeQuestion.imageUrl && (
                  <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    className="text-7xl p-5 mb-4 bg-slate-950/80 border border-white/10 rounded-3xl shadow-inner select-none"
                  >
                    {activeQuestion.imageUrl}
                  </motion.div>
                )}

                {/* Large typographic Question Title */}
                <h2 className={`text-center font-black text-slate-100 tracking-tight leading-snug w-full ${
                  settings.creatorMode ? 'text-3xl md:text-4xl' : 'text-2xl md:text-3xl'
                }`}>
                  {activeQuestion.question}
                </h2>
              </div>

              {/* Dynamic AI Hint helper bar */}
              {mode === 'classic' && !isAnswered && (
                <div className="flex justify-center mb-8">
                  {aiHint ? (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs font-sans text-amber-300 italic max-w-lg text-center px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl"
                    >
                      💡 Hint: {aiHint}
                    </motion.div>
                  ) : (
                    <button
                      onClick={fetchAiHint}
                      disabled={fetchingHint}
                      className="px-3 py-1.5 text-[10px] font-mono tracking-wider font-extrabold uppercase rounded-lg border border-cyan-500/20 bg-cyan-500/5 text-cyan-400 hover:bg-cyan-500/20 transition-all cursor-pointer"
                    >
                      {fetchingHint ? 'Connecting to Gemini Hint...' : 'Spark AI Hint 💡'}
                    </button>
                  )}
                </div>
              )}

              {/* Question Choices Cards Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeQuestion.options.map((choice, idx) => {
                  const isChoiceSelected = selectedAnswer === choice;
                  const isCorrectAnswer = choice === activeQuestion.correctAnswer;
                  const showSuccessBorder = isAnswered && isCorrectAnswer;
                  const showDangerBorder = isAnswered && isChoiceSelected && !isCorrectAnswer;

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectAnswer(choice)}
                      disabled={isAnswered}
                      className={`p-5 rounded-3xl border text-left flex items-center justify-between font-sans transition-all cursor-pointer ${
                        settings.creatorMode ? 'text-lg font-black py-6' : 'text-sm font-semibold'
                      } ${
                        showSuccessBorder
                          ? 'border-emerald-500 bg-emerald-950/30 text-emerald-300 shadow-[0_0_25px_rgba(16,185,129,0.3)] font-extrabold scale-[1.02]'
                          : showDangerBorder
                          ? 'border-red-500 bg-red-950/30 text-red-300 shadow-[0_0_25px_rgba(239,68,68,0.3)] scale-[0.98]'
                          : isAnswered
                          ? 'border-white/5 bg-slate-950/10 text-slate-500 opacity-65'
                          : 'border-white/10 bg-white/5 text-slate-200 hover:border-blue-500/50 hover:bg-white/10 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] shadow-md'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-7 h-7 rounded-lg border flex items-center justify-center font-mono text-xs ${
                          showSuccessBorder
                            ? 'border-emerald-500 text-emerald-400 bg-emerald-950'
                            : showDangerBorder
                            ? 'border-red-500 text-red-400 bg-red-950'
                            : 'border-white/10 text-slate-400 bg-slate-950/40'
                        }`}>
                          {['A', 'B', 'C', 'D'][idx]}
                        </span>
                        <span>{choice}</span>
                      </div>
                      
                      {/* Check/Fail glyph indicators */}
                      {showSuccessBorder && (
                        <span className="text-[11px] font-mono tracking-widest bg-emerald-500 text-slate-950 px-2 py-1 rounded font-black uppercase">
                          Correct
                        </span>
                      )}
                      {showDangerBorder && (
                        <span className="text-[11px] font-mono tracking-widest bg-red-500 text-slate-950 px-2 py-1 rounded font-black uppercase">
                          Miss
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* TV Commentary Reveal & Auto Next Control */}
              {isAnswered && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 pt-6 border-t border-slate-800/80 text-center"
                >
                  {aiExplanation ? (
                    <p className="text-xs md:text-sm text-slate-300 max-w-2xl mx-auto italic leading-relaxed pl-4 border-l-4 border-amber-400 font-sans">
                      🎤 Host: "{aiExplanation}"
                    </p>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-xs md:text-sm text-slate-400 leading-relaxed font-sans">
                        🎤 Host: "{activeQuestion.explanation}"
                      </p>
                      <button
                        onClick={fetchAiExplanation}
                        disabled={fetchingExplanation}
                        className="px-3.5 py-1.5 text-[10px] font-mono tracking-wider font-extrabold uppercase rounded-lg border border-amber-500/20 bg-amber-500/5 text-amber-400 hover:bg-amber-500/20 transition-all cursor-pointer inline-flex items-center gap-1.5"
                      >
                        {fetchingExplanation ? 'Connecting Host Mic...' : 'Request host monologues &ldquo;Explain in 3 lines&rdquo; 🎤'}
                      </button>
                    </div>
                  )}

                  {/* Manual advance control if AutoNext is disabled or non-creator mode */}
                  {(!settings.creatorMode || !settings.autoNext) && (
                    <button
                      id="next-question-btn"
                      onClick={handleNextQuestion}
                      className="mt-6 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-extrabold text-xs uppercase tracking-widest rounded-xl hover:opacity-90 shadow-[0_0_15px_rgba(59,130,246,0.25)] flex items-center gap-2 mx-auto cursor-pointer"
                    >
                      Next Segment
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        ) : (
          /* SHOW RESULTS SCREEN CARD */
          <motion.div
            key="results"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-xl mx-auto p-8 rounded-3xl border border-blue-500/15 bg-slate-900/40 backdrop-blur-md shadow-2xl space-y-6 text-center"
          >
            <Trophy className="w-16 h-16 mx-auto text-amber-400 animate-bounce" />

            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold">Show Segment Complete</span>
              <h2 className="text-4xl font-black text-white mt-1">THE FINAL SCORE</h2>
            </div>

            {/* Results Bento Box */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                <span className="text-[10px] text-slate-500 font-mono uppercase block mb-1">Score Accumulated</span>
                <span className="text-2xl font-black text-amber-400">{score}</span>
              </div>

              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                <span className="text-[10px] text-slate-500 font-mono uppercase block mb-1">Answering Accuracy</span>
                <span className="text-2xl font-black text-emerald-400">
                  {Math.round((correctCount / (questions.length || 1)) * 100)}%
                </span>
              </div>

              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                <span className="text-[10px] text-slate-500 font-mono uppercase block mb-1">Gold Coins Won</span>
                <span className="text-2xl font-black text-yellow-300 flex items-center justify-center gap-1.5">
                  <Coins className="w-5 h-5 text-yellow-400" />
                  +{coinsWon}
                </span>
              </div>

              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                <span className="text-[10px] text-slate-500 font-mono uppercase block mb-1">Highest Streak</span>
                <span className="text-2xl font-black text-rose-400 flex items-center justify-center gap-1">
                  <Flame className="w-5 h-5 fill-rose-500 text-rose-500 inline" />
                  {highestStreak}
                </span>
              </div>
            </div>

            {/* Leaderboard registry container */}
            {!submitted ? (
              <div className="p-5 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-3.5 text-left">
                <h4 className="font-bold text-sm text-slate-200 flex items-center gap-2">
                  <User className="w-4 h-4 text-amber-400" />
                  Registry to World Rankings
                </h4>
                <div className="flex gap-2">
                  <input
                    id="leaderboard-username-input"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your Creator Alias"
                    maxLength={16}
                    className="flex-1 p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                  />
                  <button
                    onClick={handleSubmitScore}
                    disabled={!username.trim()}
                    className="px-5 py-3 bg-amber-400 hover:bg-yellow-400 disabled:opacity-50 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer shadow-md transition-colors"
                  >
                    Register
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 border border-emerald-500/20 bg-emerald-950/10 rounded-2xl text-xs text-emerald-400 font-sans font-semibold">
                ✓ Your final score of {score} pts has been logged on the rankings board!
              </div>
            )}

            {/* Action control bar */}
            <div className="flex gap-3 pt-4 border-t border-slate-800/50">
              <button
                onClick={() => {
                  // Finish and claim values to main App profile
                  onFinishGame(score, Math.round((correctCount / (questions.length || 1)) * 100), coinsWon, highestStreak);
                }}
                className="flex-1 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:opacity-90 cursor-pointer shadow-lg"
              >
                Accept and Close Stage
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default QuizView;
