/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Trophy, Play, Radio, Volume2 } from 'lucide-react';
import { audioService } from '../services/audioService';

interface SplashViewProps {
  onEnter: () => void;
}

export const SplashView: React.FC<SplashViewProps> = ({ onEnter }) => {
  const handleStart = () => {
    // Satisfies browser autoplay rules by initializing Web Audio API on first user interaction!
    audioService.playCorrect();
    audioService.startMusic();
    onEnter();
  };

  return (
    <div
      id="splash-screen"
      className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden bg-slate-950 text-slate-100"
    >
      {/* Cinematic Spotlights */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px] animate-pulse pointer-events-none" />

      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      {/* Radial Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(2,6,23,0.95)_95%)] pointer-events-none" />

      <div className="relative z-20 flex flex-col items-center max-w-4xl px-6 text-center">
        {/* Animated Badge */}
        <motion.div
          id="splash-live-badge"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="flex items-center gap-2 px-3 py-1.5 mb-8 border rounded-full bg-slate-900/80 border-amber-500/40 text-amber-400 text-xs tracking-widest uppercase shadow-[0_0_15px_rgba(245,158,11,0.15)] font-mono"
        >
          <Radio className="w-4 h-4 animate-pulse text-amber-500" />
          Live Game Show Mode
        </motion.div>

        {/* Cinematic Logo Heading */}
        <div className="mb-4">
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 60, damping: 15, delay: 0.2 }}
            className="relative flex flex-col items-center font-sans tracking-tighter"
          >
            <span className="text-xl font-medium uppercase tracking-[0.25em] text-blue-400">The Ultimate</span>
            <h1 className="text-6xl md:text-8xl font-black bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 drop-shadow-[0_0_30px_rgba(245,158,11,0.3)] select-none">
              QUIZ SHOW
            </h1>
            <div className="absolute -inset-x-20 top-1/2 h-[2px] bg-gradient-to-r from-transparent via-amber-400/50 to-transparent blur-[1px]" />
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ duration: 1.2, delay: 0.6 }}
            className="mt-6 text-base md:text-lg max-w-xl mx-auto text-slate-300 leading-relaxed font-sans"
          >
            A high-stakes, broadcast-ready cinematic quiz experience crafted for content creators, YouTube recordings, and trivia masters.
          </motion.p>
        </div>

        {/* Feature Highlights Bento Row */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl mt-12 mb-12"
        >
          <div className="p-4 rounded-xl border border-blue-500/10 bg-slate-900/50 backdrop-blur-md">
            <Trophy className="w-6 h-6 mx-auto mb-2 text-amber-400" />
            <h3 className="font-semibold text-sm">TV Production UI</h3>
            <p className="text-xs text-slate-400 mt-1">Stunning dark aesthetics and full-screen layout.</p>
          </div>
          <div className="p-4 rounded-xl border border-blue-500/10 bg-slate-900/50 backdrop-blur-md">
            <Volume2 className="w-6 h-6 mx-auto mb-2 text-blue-400" />
            <h3 className="font-semibold text-sm">Live Synth SFX</h3>
            <p className="text-xs text-slate-400 mt-1">Real-time synthesized chime alerts and beats.</p>
          </div>
          <div className="p-4 rounded-xl border border-blue-500/10 bg-slate-900/50 backdrop-blur-md">
            <Play className="w-6 h-6 mx-auto mb-2 text-emerald-400" />
            <h3 className="font-semibold text-sm">Creator Tools</h3>
            <p className="text-xs text-slate-400 mt-1">Optimized for YouTube Shorts or Landscape recordings.</p>
          </div>
        </motion.div>

        {/* Huge Interactive Call to Action */}
        <motion.button
          id="enter-stage-btn"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 200, damping: 10, delay: 0.8 }}
          onClick={handleStart}
          className="group relative px-10 py-5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-slate-950 font-bold text-lg uppercase tracking-wider shadow-[0_0_30px_rgba(245,158,11,0.4)] cursor-pointer overflow-hidden"
        >
          <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          <span className="relative z-10 flex items-center justify-center gap-3">
            Enter the Stage
            <Play className="w-5 h-5 fill-slate-950" />
          </span>
        </motion.button>

        {/* Footer credits */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="mt-16 text-xs text-slate-500 font-mono"
        >
          PRESS ENTER THE STAGE TO UNLOCK BROADCAST SFX ENGINE
        </motion.div>
      </div>
    </div>
  );
};
export default SplashView;
