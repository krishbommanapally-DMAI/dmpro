/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Trophy, Award, Zap, Flame, Clock, Heart, Star, Calendar, RefreshCw } from 'lucide-react';
import { LeaderboardEntry, GameMode } from '../types';
import { audioService } from '../services/audioService';

interface LeaderboardViewProps {
  entries: LeaderboardEntry[];
  onBack: () => void;
}

const MODE_LABELS: Record<GameMode | 'all', string> = {
  all: 'All Arena Scores',
  classic: 'Classic Mode',
  time_attack: 'Time Attack',
  survival: 'Survival',
  rapid_fire: 'Rapid Fire'
};

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ entries, onBack }) => {
  const [filterMode, setFilterMode] = useState<GameMode | 'all'>('all');

  // Filter and sort entries by score descending
  const filteredEntries = entries
    .filter((entry) => filterMode === 'all' || entry.mode === filterMode)
    .sort((a, b) => b.score - a.score);

  // Top 3 placements
  const podium1st = filteredEntries[0];
  const podium2nd = filteredEntries[1];
  const podium3rd = filteredEntries[2];

  // Rest of the list
  const listEntries = filteredEntries.slice(3);

  const handleFilterChange = (mode: GameMode | 'all') => {
    setFilterMode(mode);
    audioService.playClick();
  };

  return (
    <div id="leaderboard-view" className="w-full max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Trophy className="w-8 h-8 text-amber-400 animate-pulse" />
          <div>
            <h1 className="text-3xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-amber-200 to-amber-500">
              WORLD RANKINGS
            </h1>
            <p className="text-xs text-slate-400 font-sans mt-0.5">The hall of fame for elite content creators and game show contestants.</p>
          </div>
        </div>
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 text-xs font-mono uppercase tracking-wider rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:text-white hover:border-white/20 hover:bg-white/10 cursor-pointer transition-all"
        >
          Back
        </button>
      </div>

      {/* Mode Filters Row */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(MODE_LABELS).map(([key, label]) => (
          <button
            key={key}
            onClick={() => handleFilterChange(key as any)}
            className={`px-4 py-2 text-xs font-mono uppercase tracking-wider rounded-xl border transition-all cursor-pointer ${
              filterMode === key
                ? 'border-amber-400 bg-amber-500/15 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                : 'border-white/5 bg-slate-950/40 text-slate-400 hover:border-white/15 hover:text-slate-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Cinematic 3D Podium */}
      {filteredEntries.length > 0 ? (
        <div className="mb-12 pt-16 pb-6 flex flex-col md:flex-row items-end justify-center gap-6 md:gap-4 max-w-3xl mx-auto border-b border-slate-800/50">
          
          {/* 2nd Place (Left side of podium) */}
          {podium2nd ? (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col items-center order-2 md:order-1 w-full md:w-1/3"
            >
              <div className="relative mb-3 group">
                <div className="absolute inset-0 bg-slate-400/20 rounded-full blur-md group-hover:blur-lg transition-all" />
                <div className="relative w-16 h-16 rounded-full border-2 border-slate-300 bg-slate-950 flex items-center justify-center text-3xl shadow-lg">
                  {podium2nd.avatar}
                </div>
                <div className="absolute -top-2 -right-2 bg-slate-300 text-slate-950 text-xs font-black w-6 h-6 rounded-full flex items-center justify-center shadow-md">
                  2
                </div>
              </div>
              <h3 className="font-bold text-sm text-slate-200 text-center truncate w-32">{podium2nd.name}</h3>
              <p className="text-xs text-amber-400/80 font-bold mb-3">{podium2nd.score} pts</p>
              
              {/* Podium Column */}
              <div className="w-full h-24 bg-gradient-to-t from-slate-950 via-slate-900/80 to-slate-900 border-t-2 border-slate-400 rounded-t-3xl flex flex-col items-center justify-center text-slate-400 text-sm font-bold shadow-inner font-mono">
                SILVER
                <span className="text-[10px] font-normal text-slate-500 mt-1">{podium2nd.accuracy}% acc</span>
              </div>
            </motion.div>
          ) : (
            <div className="hidden md:block w-1/3 order-1 h-10" />
          )}

          {/* 1st Place (Center tallest column) */}
          {podium1st && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex flex-col items-center order-1 md:order-2 w-full md:w-1/3 z-10"
            >
              <div className="relative mb-4 group scale-110">
                <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-xl group-hover:blur-2xl transition-all" />
                <div className="relative w-20 h-20 rounded-full border-4 border-amber-400 bg-slate-950 flex items-center justify-center text-4xl shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                  {podium1st.avatar}
                  <Star className="absolute -top-4 text-amber-400 fill-amber-400 w-6 h-6 animate-spin-slow" />
                </div>
                <div className="absolute -top-2 -right-2 bg-amber-400 text-slate-950 text-xs font-black w-6 h-6 rounded-full flex items-center justify-center shadow-md border-2 border-slate-950">
                  1
                </div>
              </div>
              <h3 className="font-extrabold text-base text-white text-center truncate w-36">{podium1st.name}</h3>
              <p className="text-sm text-amber-400 font-extrabold mb-3">{podium1st.score} pts</p>

              {/* Podium Column */}
              <div className="w-full h-36 bg-gradient-to-t from-slate-950 via-amber-950/20 to-amber-950/45 border-t-4 border-amber-400 rounded-t-3xl flex flex-col items-center justify-center text-amber-400 text-base font-black shadow-[0_0_25px_rgba(245,158,11,0.15)] font-mono">
                CHAMPION
                <span className="text-[10px] font-normal text-amber-200/60 mt-1">{podium1st.accuracy}% acc</span>
              </div>
            </motion.div>
          )}

          {/* 3rd Place (Right side of podium) */}
          {podium3rd ? (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col items-center order-3 w-full md:w-1/3"
            >
              <div className="relative mb-3 group">
                <div className="absolute inset-0 bg-amber-700/10 rounded-full blur-md group-hover:blur-lg transition-all" />
                <div className="relative w-16 h-16 rounded-full border-2 border-amber-700 bg-slate-950 flex items-center justify-center text-3xl shadow-lg">
                  {podium3rd.avatar}
                </div>
                <div className="absolute -top-2 -right-2 bg-amber-700 text-amber-100 text-xs font-black w-6 h-6 rounded-full flex items-center justify-center shadow-md">
                  3
                </div>
              </div>
              <h3 className="font-bold text-sm text-slate-200 text-center truncate w-32">{podium3rd.name}</h3>
              <p className="text-xs text-amber-400/80 font-bold mb-3">{podium3rd.score} pts</p>

              {/* Podium Column */}
              <div className="w-full h-18 bg-gradient-to-t from-slate-950 via-slate-900/80 to-slate-900 border-t-2 border-amber-700 rounded-t-3xl flex flex-col items-center justify-center text-amber-700 text-xs font-bold shadow-inner font-mono">
                BRONZE
                <span className="text-[10px] font-normal text-slate-500 mt-1">{podium3rd.accuracy}% acc</span>
              </div>
            </motion.div>
          ) : (
            <div className="hidden md:block w-1/3 order-3 h-10" />
          )}

        </div>
      ) : (
        <div className="p-12 text-center text-slate-500 font-mono">
          NO SCORES REGISTERED YET. BE THE FIRST!
        </div>
      )}

      {/* Main Table for Positions 4+ */}
      {listEntries.length > 0 && (
        <div className="space-y-2 max-w-4xl mx-auto">
          <h3 className="text-xs font-mono tracking-widest uppercase mb-4 text-slate-500">Remaining Top Board Contestants</h3>
          {listEntries.map((entry, index) => {
            const currentRank = index + 4;
            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="p-4 rounded-2xl border border-white/5 bg-slate-950/40 hover:border-white/15 hover:bg-slate-950/60 flex items-center justify-between gap-4 transition-all"
              >
                <div className="flex items-center gap-4">
                  <span className="font-mono text-sm font-bold text-slate-500 w-6 text-center">
                    #{currentRank}
                  </span>
                  <div className="w-10 h-10 rounded-full bg-slate-950 flex items-center justify-center text-xl border border-white/10">
                    {entry.avatar}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-200">{entry.name}</h4>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono mt-0.5">
                      <span className="bg-slate-950 px-2 py-0.5 rounded border border-white/5 uppercase text-slate-400">
                        {entry.mode}
                      </span>
                      <span className="flex items-center gap-1 text-slate-400">
                        <Clock className="w-3 h-3" />
                        {entry.timeTaken}s
                      </span>
                      <span className="flex items-center gap-1 text-slate-400">
                        <Calendar className="w-3 h-3" />
                        {entry.date}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-extrabold text-amber-400 block">{entry.score} pts</span>
                  <span className="text-[10px] text-slate-500 font-mono">{entry.accuracy}% accuracy</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
export default LeaderboardView;
