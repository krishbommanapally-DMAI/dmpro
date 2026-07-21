/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Brain, Cpu, Send, Check, AlertTriangle, RefreshCw, Layers } from 'lucide-react';
import { Question, Difficulty } from '../types';
import { DEFAULT_CATEGORIES } from '../data';
import { audioService } from '../services/audioService';

interface AIWidgetProps {
  onQuestionsGenerated: (questions: Question[]) => void;
  onBack: () => void;
}

const TOPICS_PRESETS = [
  '90s Cyberpunk Movies & Lore',
  'Ancient Egyptian Architectural Wonders',
  'Famous Software Bugs in History',
  'Global Street Food & National Dishes',
  'Video Game Boss Battles of the 2000s',
  'Silly Scientific Paradoxes Explained'
];

export const AIWidget: React.FC<AIWidgetProps> = ({ onQuestionsGenerated, onBack }) => {
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [questionCount, setQuestionCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [generatedCount, setGeneratedCount] = useState(0);

  const [targetCategoryMode, setTargetCategoryMode] = useState<'detect' | 'preset' | 'custom'>('detect');
  const [selectedPresetCategory, setSelectedPresetCategory] = useState('general');
  const [customCategoryName, setCustomCategoryName] = useState('');

  const getSelectedCategory = (): string => {
    if (targetCategoryMode === 'preset') {
      return selectedPresetCategory;
    }
    if (targetCategoryMode === 'custom') {
      return customCategoryName.trim().toLowerCase() || 'ai_generated';
    }
    return 'ai_generated';
  };

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Please provide a topic or theme first.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);
    audioService.playClick();

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim(),
          difficulty,
          count: questionCount,
          category: getSelectedCategory()
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'The AI generator returned an error.');
      }

      setGeneratedCount(data.questions.length);
      setSuccess(true);
      audioService.playVictory();
      onQuestionsGenerated(data.questions);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Could not communicate with the server. Please check that GEMINI_API_KEY is configured in Settings > Secrets.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPreset = (preset: string) => {
    setTopic(preset);
    audioService.playClick();
  };

  return (
    <div id="ai-generator-widget" className="w-full max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-cyan-400 animate-spin-slow" />
          <div>
            <h1 className="text-3xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-blue-500">
              AI BROADCAST STUDIO
            </h1>
            <p className="text-xs text-slate-400 font-sans mt-0.5">Instantly materialize professional, TV-ready quiz segments using the Gemini API.</p>
          </div>
        </div>
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 text-xs font-mono uppercase tracking-wider rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:text-white hover:border-white/20 hover:bg-white/10 cursor-pointer transition-all"
        >
          Back
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Left Input Board (3 Columns) */}
        <div className="md:col-span-3 space-y-6">
          <div className="p-6 rounded-3xl border border-white/10 bg-slate-950/40 backdrop-blur-xl space-y-5">
            <h3 className="text-xs font-mono tracking-wider uppercase text-cyan-400 flex items-center gap-2 font-bold">
              <Brain className="w-5 h-5 text-cyan-400" />
              Creative Topic Brief
            </h3>

            {/* Custom Brief input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-slate-400 block uppercase tracking-wider">Topic, Historical Era, or Niche Hobby</label>
              <input
                id="ai-topic-input"
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Quantum Mechanics Paradoxes, Marvel Phase 4 Trivia, European Flags"
                className="w-full p-4 bg-slate-950 border border-white/5 rounded-2xl text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50 font-sans placeholder-slate-600 transition-all"
              />
            </div>

            {/* Target Category Control */}
            <div className="space-y-2.5 border border-cyan-500/15 p-4 rounded-2xl bg-slate-950/45">
              <label className="text-[10px] font-mono text-cyan-400 block uppercase tracking-wider font-bold">
                Destination Category Classification
              </label>
              
              <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-white/5">
                {[
                  { mode: 'detect', label: 'Default (AI Generated)' },
                  { mode: 'preset', label: 'Built-in Preset' },
                  { mode: 'custom', label: 'New Custom' }
                ].map((option) => (
                  <button
                    key={option.mode}
                    type="button"
                    onClick={() => { setTargetCategoryMode(option.mode as any); audioService.playClick(); }}
                    className={`py-1.5 text-[9px] font-mono font-bold uppercase rounded-lg transition-all cursor-pointer ${
                      targetCategoryMode === option.mode
                        ? 'bg-cyan-500 text-slate-950 font-extrabold shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              {targetCategoryMode === 'preset' && (
                <div className="space-y-1 pt-1">
                  <label className="text-[9px] font-mono text-slate-500 block uppercase">Select Built-in Destination</label>
                  <select
                    value={selectedPresetCategory}
                    onChange={(e) => { setSelectedPresetCategory(e.target.value); audioService.playClick(); }}
                    className="w-full p-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-slate-200 font-sans focus:outline-none focus:border-cyan-500/50"
                  >
                    {DEFAULT_CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {targetCategoryMode === 'custom' && (
                <div className="space-y-1 pt-1">
                  <label className="text-[9px] font-mono text-slate-500 block uppercase">Type Custom Category Name</label>
                  <input
                    type="text"
                    value={customCategoryName}
                    onChange={(e) => setCustomCategoryName(e.target.value)}
                    placeholder="e.g. Science, Space, History, Cinema"
                    className="w-full p-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-slate-200 font-sans focus:outline-none focus:border-cyan-500/50 placeholder-slate-600"
                  />
                </div>
              )}

              {targetCategoryMode === 'detect' && (
                <p className="text-[9px] text-slate-500 font-sans italic leading-relaxed">
                  Questions will be automatically grouped into the "AI Generated" category tab in your choice arena.
                </p>
              )}
            </div>

            {/* Configuration options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-slate-400 block uppercase tracking-wider">Difficulty Tier</label>
                <div className="flex rounded-2xl bg-slate-950 p-1 border border-white/5">
                  {(['easy', 'medium', 'hard'] as Difficulty[]).map((tier) => (
                    <button
                      key={tier}
                      onClick={() => { setDifficulty(tier); audioService.playClick(); }}
                      className={`flex-1 py-2 text-[10px] font-mono font-bold uppercase rounded-xl transition-all cursor-pointer ${
                        difficulty === tier
                          ? 'bg-cyan-500 text-slate-950 font-black shadow-md'
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {tier}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-mono text-slate-400 block uppercase tracking-wider">Question Volume</label>
                <div className="flex rounded-2xl bg-slate-950 p-1 border border-white/5">
                  {[3, 5, 8].map((count) => (
                    <button
                      key={count}
                      onClick={() => { setQuestionCount(count); audioService.playClick(); }}
                      className={`flex-1 py-2 text-[10px] font-mono font-bold rounded-xl transition-all cursor-pointer ${
                        questionCount === count
                          ? 'bg-cyan-500 text-slate-950 font-black shadow-md'
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {count} Qs
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 border border-red-500/25 bg-red-950/10 rounded-2xl text-[11px] text-red-400 leading-normal font-sans">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-start gap-2 p-3 border border-emerald-500/25 bg-emerald-950/10 rounded-2xl text-[11px] text-emerald-400 font-sans">
                <Check className="w-4 h-4 shrink-0 text-emerald-500 mt-0.5" />
                <span>Successfully generated **{generatedCount} questions** on topic "{topic}"! They have been automatically synchronized into active memory.</span>
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-mono font-extrabold rounded-2xl text-xs uppercase tracking-widest shadow-[0_0_25px_rgba(6,182,212,0.35)] hover:opacity-90 cursor-pointer flex items-center justify-center gap-2.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Generating Segment (10-15s)...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 fill-slate-950 text-slate-950" />
                  Materialize Showsegment
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Presets Panel (2 Columns) */}
        <div className="md:col-span-2 space-y-6">
          <div className="p-6 rounded-3xl border border-white/10 bg-slate-950/40 backdrop-blur-xl h-full flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-mono tracking-wider uppercase text-cyan-400 flex items-center gap-2 mb-4 font-bold">
                <Layers className="w-4 h-4 text-cyan-400" />
                Creative Presets
              </h3>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed font-sans">
                Short on ideas? Click any premium pre-modeled seed topic below to instantly feed our host engine:
              </p>

              <div className="space-y-2">
                {TOPICS_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => handleSelectPreset(preset)}
                    className="w-full p-3.5 bg-slate-950/60 hover:bg-slate-900/80 border border-white/5 hover:border-cyan-500/20 text-xs font-bold text-slate-300 hover:text-white rounded-2xl text-left transition-all cursor-pointer font-sans"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-white/10 mt-6 text-[10px] text-slate-500 font-mono flex items-center gap-2 leading-relaxed uppercase">
              <Cpu className="w-4 h-4 text-cyan-500/50 animate-pulse" />
              <span>POWERED BY GEMINI-2.5 FOR HIGH PRECISION TRIVIA LOGIC.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AIWidget;
