/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Volume2, Music, Timer, Tv, RefreshCw, Palette, ArrowLeft, VolumeX, EyeOff, Check } from 'lucide-react';
import { GameSettings, Theme } from '../types';
import { THEME_CONFIGS } from '../data';
import { audioService } from '../services/audioService';

interface SettingsViewProps {
  settings: GameSettings;
  onUpdate: (settings: GameSettings) => void;
  onBack: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ settings, onUpdate, onBack }) => {

  const triggerSfxTest = () => {
    audioService.playClick();
  };

  const handleVolumeChange = (field: 'musicVolume' | 'sfxVolume', value: number) => {
    const updatedSound = { ...settings.sound, [field]: value };
    const updated = { ...settings, sound: updatedSound };
    onUpdate(updated);
    audioService.updateSettings(updatedSound);
    if (field === 'sfxVolume') {
      audioService.playCoin();
    }
  };

  const handleToggleSound = (field: 'musicEnabled' | 'sfxEnabled') => {
    const updatedSound = { ...settings.sound, [field]: !settings.sound[field] };
    const updated = { ...settings, sound: updatedSound };
    onUpdate(updated);
    audioService.updateSettings(updatedSound);
    if (field === 'sfxEnabled' && updatedSound.sfxEnabled) {
      audioService.playCorrect();
    }
  };

  const selectTheme = (theme: Theme) => {
    onUpdate({ ...settings, theme });
    audioService.playClick();
  };

  const selectTimer = (timerDuration: number) => {
    onUpdate({ ...settings, timerDuration });
    audioService.playClick();
  };

  const toggleCreatorMode = () => {
    onUpdate({ ...settings, creatorMode: !settings.creatorMode });
    audioService.playClick();
  };

  const toggleAutoNext = () => {
    onUpdate({ ...settings, autoNext: !settings.autoNext });
    audioService.playClick();
  };

  return (
    <div id="settings-view" className="w-full max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Palette className="w-8 h-8 text-amber-400" />
          <div>
            <h1 className="text-3xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-amber-200 to-amber-500">
              STUDIO SETTINGS
            </h1>
            <p className="text-xs text-slate-400 font-sans mt-0.5">Configure parameters, themes, audio, and creator options.</p>
          </div>
        </div>
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 text-xs font-mono uppercase tracking-wider rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:text-white hover:border-white/20 hover:bg-white/10 cursor-pointer transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Sound & Display */}
        <div className="space-y-6">
          {/* Audio Station */}
          <div className="p-6 rounded-3xl border border-white/10 bg-slate-950/40 backdrop-blur-xl">
            <h2 className="text-xs font-mono tracking-wider uppercase mb-6 text-amber-400 flex items-center gap-2 font-bold">
              <Volume2 className="w-5 h-5" />
              Broadcasting Audio
            </h2>

            {/* Music Setting */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center text-sm">
                <span className="flex items-center gap-2 font-sans font-semibold text-slate-200 text-xs">
                  <Music className="w-4 h-4 text-blue-400" />
                  Background Music
                </span>
                <button
                  onClick={() => handleToggleSound('musicEnabled')}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-wider font-bold transition-all ${
                    settings.sound.musicEnabled ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-slate-900 text-slate-500 border border-white/5'
                  }`}
                >
                  {settings.sound.musicEnabled ? 'On' : 'Off'}
                </button>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.sound.musicVolume}
                onChange={(e) => handleVolumeChange('musicVolume', parseFloat(e.target.value))}
                disabled={!settings.sound.musicEnabled}
                className="w-full accent-blue-500 bg-slate-900 rounded-lg appearance-none h-1.5 cursor-pointer"
              />
            </div>

            {/* SFX Setting */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="flex items-center gap-2 font-sans font-semibold text-slate-200 text-xs">
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                  Sound Effects (SFX)
                </span>
                <button
                  onClick={() => handleToggleSound('sfxEnabled')}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-wider font-bold transition-all ${
                    settings.sound.sfxEnabled ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-900 text-slate-500 border border-white/5'
                  }`}
                >
                  {settings.sound.sfxEnabled ? 'On' : 'Off'}
                </button>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.sound.sfxVolume}
                onChange={(e) => handleVolumeChange('sfxVolume', parseFloat(e.target.value))}
                disabled={!settings.sound.sfxEnabled}
                className="w-full accent-emerald-500 bg-slate-900 rounded-lg appearance-none h-1.5 cursor-pointer"
              />
              <button
                onClick={triggerSfxTest}
                className="w-full py-2.5 border border-white/10 bg-white/5 hover:bg-white/10 text-[10px] font-mono uppercase tracking-wider text-slate-300 rounded-xl transition-colors cursor-pointer"
              >
                Test Sound Engine Click
              </button>
            </div>
          </div>

          {/* Countdown Clock */}
          <div className="p-6 rounded-3xl border border-white/10 bg-slate-950/40 backdrop-blur-xl">
            <h2 className="text-xs font-mono tracking-wider uppercase mb-4 text-amber-400 flex items-center gap-2 font-bold">
              <Timer className="w-5 h-5" />
              Game Countdown
            </h2>
            <p className="text-xs text-slate-400 mb-4 font-sans">Select response time for each standard question.</p>
            <div className="grid grid-cols-4 gap-2">
              {[10, 20, 30, 60].map((dur) => (
                <button
                  key={dur}
                  onClick={() => selectTimer(dur)}
                  className={`py-3 rounded-2xl font-mono font-bold border text-xs tracking-wider transition-all cursor-pointer ${
                    settings.timerDuration === dur
                      ? 'border-amber-400 bg-amber-500/15 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                      : 'border-white/5 bg-slate-950/40 text-slate-400 hover:border-white/15 hover:text-slate-200'
                  }`}
                >
                  {dur}s
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Themes & Creator Mode */}
        <div className="space-y-6">
          {/* Creator Mode Card */}
          <div className="p-6 rounded-3xl border border-pink-500/20 bg-slate-950/45 backdrop-blur-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 bg-pink-500/10 text-pink-400 rounded-bl-3xl">
              <Tv className="w-5 h-5" />
            </div>

            <h2 className="text-xs font-mono tracking-wider uppercase mb-2 text-pink-400 font-bold">
              YouTube Creator Mode
            </h2>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed font-sans">
              Reformats the screen entirely. Font sizes are enlarged for high-definition mobile viewports, unneeded interface rails are completely hidden, mouse cursors can be hidden, and slides auto-advance. Designed specifically for vertical **YouTube Shorts** or landscape stream captures!
            </p>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-sans font-semibold flex items-center gap-2 text-slate-200">
                  <EyeOff className="w-4 h-4 text-pink-400" />
                  Enable Creator UI
                </span>
                <button
                  onClick={toggleCreatorMode}
                  className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 focus:outline-none cursor-pointer ${
                    settings.creatorMode ? 'bg-pink-500' : 'bg-slate-900 border border-white/5'
                  }`}
                >
                  <div
                    className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${
                      settings.creatorMode ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-xs font-sans font-semibold flex items-center gap-2 text-slate-200">
                  <RefreshCw className="w-4 h-4 text-pink-400" />
                  Auto Next Question
                </span>
                <button
                  onClick={toggleAutoNext}
                  disabled={!settings.creatorMode}
                  className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 focus:outline-none cursor-pointer ${
                    settings.autoNext && settings.creatorMode ? 'bg-pink-500' : 'bg-slate-900 border border-white/5 opacity-50'
                  }`}
                >
                  <div
                    className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${
                      settings.autoNext && settings.creatorMode ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Aesthetic Themes Selector */}
          <div className="p-6 rounded-3xl border border-white/10 bg-slate-950/40 backdrop-blur-xl">
            <h2 className="text-xs font-mono tracking-wider uppercase mb-4 text-amber-400 flex items-center gap-2 font-bold">
              <Palette className="w-5 h-5" />
              Television Aesthetics
            </h2>
            <div className="grid grid-cols-2 gap-2.5">
              {Object.entries(THEME_CONFIGS).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => selectTheme(key as Theme)}
                  className={`p-3 rounded-2xl border flex items-center justify-between text-left transition-all cursor-pointer ${
                    settings.theme === key
                      ? 'border-amber-400 bg-amber-500/10 shadow-[0_0_12px_rgba(245,158,11,0.15)] text-white'
                      : 'border-white/5 bg-slate-950/40 text-slate-400 hover:border-white/15 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {/* Visual color dot representing theme color */}
                    <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: value.accentHex }} />
                    <span className="text-xs font-bold font-sans">{value.name}</span>
                  </div>
                  {settings.theme === key && <Check className="w-4 h-4 text-amber-400" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default SettingsView;
