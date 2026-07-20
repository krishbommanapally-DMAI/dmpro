/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Globe, Cpu, Award, Smile, Flag, MapPin, Sparkles, Brain, Flame, Zap, ArrowLeft, ShieldAlert } from 'lucide-react';
import { GameMode, Category } from '../types';
import { DEFAULT_CATEGORIES } from '../data';
import { audioService } from '../services/audioService';

interface CategoriesViewProps {
  onSelect: (category: string, mode: GameMode) => void;
  onBack: () => void;
}

const MODES_INFO: Record<GameMode, { title: string; desc: string; icon: any; color: string; perk: string }> = {
  classic: {
    title: 'Classic Mode',
    desc: 'The complete game show experience. Standard timer, full questions, hints available.',
    icon: Sparkles,
    color: 'border-blue-500/30 text-blue-400 bg-blue-950/20 shadow-[0_0_15px_rgba(59,130,246,0.15)]',
    perk: '+100 XP per question',
  },
  time_attack: {
    title: 'Time Attack',
    desc: 'Race against a strict global clock. Correct answers add extra seconds, wrong ones subtract!',
    icon: Zap,
    color: 'border-amber-500/30 text-amber-400 bg-amber-950/20 shadow-[0_0_15px_rgba(245,158,11,0.15)]',
    perk: 'Speed multiplier activated',
  },
  survival: {
    title: 'Survival Arena',
    desc: 'High stakes! You have strictly 3 lives. One mistake cost a life. How long can you survive?',
    icon: Flame,
    color: 'border-rose-500/30 text-rose-400 bg-rose-950/20 shadow-[0_0_15px_rgba(244,63,94,0.15)]',
    perk: 'Double gold multiplier',
  },
  rapid_fire: {
    title: 'Rapid Fire',
    desc: 'Uncapped questions! 5 seconds per question. Quick reflex answers, no hesitation allowed.',
    icon: Brain,
    color: 'border-purple-500/30 text-purple-400 bg-purple-950/20 shadow-[0_0_15px_rgba(168,85,247,0.15)]',
    perk: 'Fast-paced reflection',
  }
};

const CATEGORIES_ICONS: Record<string, any> = {
  Globe,
  Cpu,
  Award,
  Smile,
  Flag,
  MapPin,
};

export const CategoriesView: React.FC<CategoriesViewProps> = ({ onSelect, onBack }) => {
  const [selectedMode, setSelectedMode] = useState<GameMode>('classic');

  const handleSelectCategory = (catId: string) => {
    audioService.playCorrect();
    onSelect(catId, selectedMode);
  };

  const handleModeChange = (mode: GameMode) => {
    setSelectedMode(mode);
    audioService.playClick();
  };

  return (
    <div id="categories-view" className="w-full max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-white/10">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-300 via-blue-100 to-amber-200">
            CHOOSE YOUR ARENA
          </h1>
          <p className="text-xs text-slate-400 font-sans mt-1">Configure your game mode and select a trivia category to start.</p>
        </div>
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 text-xs font-mono uppercase tracking-wider rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:text-white hover:border-white/20 hover:bg-white/10 cursor-pointer transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      {/* Mode Selector Row */}
      <div className="space-y-4">
        <h2 className="text-xs font-mono tracking-wider uppercase text-amber-400 font-bold">Step 1: Select Game Mode</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(MODES_INFO).map(([key, info]) => {
            const IconComponent = info.icon;
            const isSelected = selectedMode === key;
            return (
              <button
                key={key}
                onClick={() => handleModeChange(key as GameMode)}
                className={`p-5 rounded-3xl border text-left flex flex-col justify-between h-44 cursor-pointer transition-all ${
                  isSelected
                    ? `${info.color} scale-[1.02] border-opacity-100 shadow-[0_0_25px_rgba(245,158,11,0.15)]`
                    : 'border-white/5 bg-slate-950/40 text-slate-300 hover:border-white/15 hover:bg-white/5'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <IconComponent className="w-6 h-6" />
                    {isSelected && (
                      <span className="text-[9px] font-mono font-bold uppercase tracking-widest bg-slate-950 px-2.5 py-1 border border-current rounded-full">
                        Active
                      </span>
                    )}
                  </div>
                  <h3 className="font-extrabold text-base text-slate-100 tracking-tight">{info.title}</h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed font-sans line-clamp-2">{info.desc}</p>
                </div>
                <div className="text-[10px] font-mono tracking-wide text-amber-400/85 uppercase mt-2">
                  {info.perk}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Category Grid Section */}
      <div className="space-y-4">
        <h2 className="text-xs font-mono tracking-wider uppercase text-amber-400 font-bold">Step 2: Pick Your Category</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Default Categories */}
          {DEFAULT_CATEGORIES.map((cat) => {
            const Icon = CATEGORIES_ICONS[cat.icon] || Globe;
            return (
              <button
                key={cat.id}
                onClick={() => handleSelectCategory(cat.id)}
                className="group relative p-6 rounded-3xl border border-white/5 bg-slate-950/40 hover:border-blue-500/30 cursor-pointer text-left transition-all hover:-translate-y-1 hover:shadow-[0_0_25px_rgba(59,130,246,0.1)] h-44 flex flex-col justify-between overflow-hidden"
              >
                {/* Visual hover glow gradient */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/10 to-transparent rounded-bl-full pointer-events-none group-hover:from-blue-500/20 transition-all duration-300" />
                
                <div>
                  <div className="w-10 h-10 rounded-xl bg-slate-950 border border-white/10 flex items-center justify-center mb-4 text-blue-400 group-hover:text-amber-400 group-hover:border-amber-500/30 transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-extrabold text-lg text-slate-200 tracking-tight group-hover:text-white">{cat.name}</h3>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed font-sans line-clamp-2">{cat.description}</p>
                </div>

                <div className="text-[10px] font-mono font-bold text-slate-500 group-hover:text-blue-400 tracking-wider uppercase transition-colors">
                  Play Category &rarr;
                </div>
              </button>
            );
          })}

          {/* Play All Master Category */}
          <button
            onClick={() => handleSelectCategory('all')}
            className="group relative p-6 rounded-3xl border border-amber-500/25 bg-slate-950/45 hover:border-amber-400 cursor-pointer text-left transition-all hover:-translate-y-1 hover:shadow-[0_0_35px_rgba(245,158,11,0.15)] h-44 flex flex-col justify-between overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-500/15 to-transparent rounded-bl-full pointer-events-none group-hover:from-amber-500/25 transition-all duration-300" />

            <div>
              <div className="w-10 h-10 rounded-xl bg-slate-950 border border-amber-500/30 flex items-center justify-center mb-4 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.2)]">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-lg text-amber-200 tracking-tight">The Ultimate Mix</h3>
              <p className="text-xs text-amber-100/70 mt-1.5 leading-relaxed font-sans line-clamp-2">
                Combine every single question, image, flag, logo, and puzzle. The definitive TV host challenger!
              </p>
            </div>

            <div className="text-[10px] font-mono font-bold text-amber-400 tracking-wider uppercase">
              Start Master Quiz &rarr;
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
export default CategoriesView;
