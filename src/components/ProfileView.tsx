/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Trophy, Brain, Flame, Coins, Award, Zap, Clock, ShieldCheck, Heart } from 'lucide-react';
import { UserProfile, Achievement } from '../types';
import { DEFAULT_ACHIEVEMENTS } from '../data';
import { audioService } from '../services/audioService';

interface ProfileViewProps {
  profile: UserProfile;
  achievements: Achievement[];
  onClaimReward: (achievementId: string, xp: number, coins: number) => void;
  onBack: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ profile, achievements, onClaimReward, onBack }) => {

  const handleClaim = (ach: Achievement) => {
    if (!ach.unlocked || profile.unlockedAchievements.includes(ach.id)) return;
    audioService.playCoin();
    onClaimReward(ach.id, ach.xpReward, ach.coinReward);
  };

  const accuracyRate = profile.stats.gamesPlayed > 0
    ? Math.round((profile.stats.correctAnswers / (profile.stats.correctAnswers + profile.stats.wrongAnswers || 1)) * 100)
    : 0;

  return (
    <div id="profile-view" className="w-full max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Award className="w-8 h-8 text-amber-400 animate-pulse" />
          <div>
            <h1 className="text-3xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-amber-200 to-amber-500">
              CREATOR PORTFOLIO
            </h1>
            <p className="text-xs text-slate-400 font-sans mt-0.5">Track levels, unlock achievements, and review broadcast statistics.</p>
          </div>
        </div>
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 text-xs font-mono uppercase tracking-wider rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:text-white hover:border-white/20 hover:bg-white/10 cursor-pointer transition-all"
        >
          Back
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Avatar & Progression */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl border border-white/10 bg-slate-950/40 backdrop-blur-xl text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 text-slate-500">
              <Zap className="w-4 h-4 text-amber-400" />
            </div>

            {/* Huge Avatar Ring */}
            <div className="relative w-28 h-28 mx-auto mb-4 flex items-center justify-center rounded-full border-2 border-amber-400/50 bg-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.2)] text-5xl">
              {profile.avatar}
              <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 text-xs font-black px-2.5 py-1 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.4)] font-mono">
                Lvl {profile.level}
              </div>
            </div>

            <h2 className="text-xl font-bold text-slate-100">{profile.name}</h2>
            <p className="text-xs text-slate-400 font-mono uppercase tracking-widest mt-1">Quiz Show Host</p>

            {/* XP progress bar */}
            <div className="mt-6 text-left">
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="text-slate-400 font-mono">XP Progression</span>
                <span className="font-bold text-amber-400 font-mono">{(profile.xp % 100).toFixed(0)} / 100 XP</span>
              </div>
              <div className="w-full bg-slate-950 border border-white/5 p-0.5 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full transition-all duration-500 shadow-[0_0_10px_rgba(245,158,11,0.3)] rounded-full"
                  style={{ width: `${profile.xp % 100}%` }}
                />
              </div>
            </div>

            {/* Balance panel */}
            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/10">
              <div className="bg-slate-950/50 p-3 rounded-2xl border border-white/5 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Coins className="w-4 h-4 text-amber-400" />
                  <span className="text-[10px] text-slate-400 font-mono uppercase">Gold Bank</span>
                </div>
                <div className="text-lg font-black text-slate-100 font-mono">{profile.coins}</div>
              </div>

              <div className="bg-slate-950/50 p-3 rounded-2xl border border-white/5 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Trophy className="w-4 h-4 text-blue-400" />
                  <span className="text-[10px] text-slate-400 font-mono uppercase">Total Score</span>
                </div>
                <div className="text-lg font-black text-slate-100 font-mono">{profile.stats.totalScore}</div>
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="p-6 rounded-3xl border border-white/10 bg-slate-950/40 backdrop-blur-xl">
            <h3 className="text-xs font-mono tracking-wider uppercase mb-4 text-amber-400 flex items-center gap-2 font-bold">
              <Clock className="w-4 h-4" />
              Broadcaster Stats
            </h3>
            <div className="grid grid-cols-2 gap-3.5">
              <div className="p-3 bg-slate-950/40 rounded-2xl border border-white/5">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Accuracy</span>
                <span className="text-base font-bold text-emerald-400 font-mono">{accuracyRate}%</span>
              </div>
              <div className="p-3 bg-slate-950/40 rounded-2xl border border-white/5">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Streak record</span>
                <span className="text-base font-bold text-rose-400 flex items-center gap-1 font-mono">
                  <Flame className="w-4 h-4 fill-rose-500 text-rose-500 inline" />
                  {profile.stats.highestStreak}
                </span>
              </div>
              <div className="p-3 bg-slate-950/40 rounded-2xl border border-white/5">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Shows Played</span>
                <span className="text-base font-bold text-blue-400 font-mono">{profile.stats.gamesPlayed}</span>
              </div>
              <div className="p-3 bg-slate-950/40 rounded-2xl border border-white/5">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Avg Reply Time</span>
                <span className="text-base font-bold text-purple-400 font-mono">{profile.stats.avgTime.toFixed(1)}s</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Achievements and Challenges */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-3xl border border-white/10 bg-slate-950/40 backdrop-blur-xl h-full">
            <h3 className="text-xs font-mono tracking-wider uppercase mb-6 text-amber-400 flex items-center gap-2 font-bold">
              <Trophy className="w-5 h-5 text-amber-400" />
              Achievements Board
            </h3>

            <div className="space-y-4">
              {achievements.map((ach) => {
                const isClaimed = profile.unlockedAchievements.includes(ach.id);
                // Calculate real live progress
                let currentVal = 0;
                if (ach.metric === 'gamesPlayed') currentVal = profile.stats.gamesPlayed;
                else if (ach.metric === 'totalScore') currentVal = profile.stats.totalScore;
                else if (ach.metric === 'highestStreak') currentVal = profile.stats.highestStreak;
                else if (ach.metric === 'coins') currentVal = profile.coins;
                else if (ach.metric === 'xp') currentVal = profile.xp;

                const isUnlocked = currentVal >= ach.targetValue;
                const progressPercentage = Math.min(Math.round((currentVal / ach.targetValue) * 100), 100);

                return (
                  <div
                    key={ach.id}
                    className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                      isClaimed
                        ? 'border-white/5 bg-slate-950/20 opacity-60'
                        : isUnlocked
                        ? 'border-amber-500/30 bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.08)]'
                        : 'border-white/5 bg-slate-950/40'
                    }`}
                  >
                    <div className="flex items-start gap-3.5 flex-1">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center border text-lg ${
                        isClaimed ? 'border-white/5 bg-slate-950/60 text-slate-500' : isUnlocked ? 'border-amber-400 bg-slate-950 text-amber-400' : 'border-white/10 bg-slate-950/40 text-slate-400'
                      }`}>
                        {ach.icon === 'Trophy' && <Trophy className="w-5 h-5" />}
                        {ach.icon === 'Brain' && <Brain className="w-5 h-5" />}
                        {ach.icon === 'Flame' && <Flame className="w-5 h-5" />}
                        {ach.icon === 'Coins' && <Coins className="w-5 h-5" />}
                        {ach.icon === 'Heart' && <Heart className="w-5 h-5" />}
                      </div>

                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className={`font-extrabold text-sm ${isClaimed ? 'text-slate-500 font-sans' : 'text-slate-100 font-sans'}`}>
                            {ach.title}
                          </h4>
                          {isUnlocked && !isClaimed && (
                            <span className="text-[9px] font-mono font-bold uppercase bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded animate-pulse">
                              Unlocked
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 leading-normal font-sans">{ach.description}</p>

                        {/* Progress slider */}
                        <div className="flex items-center gap-3 pt-1.5 max-w-xs">
                          <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-white/5 p-[1px]">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${isClaimed ? 'bg-slate-700' : 'bg-gradient-to-r from-blue-500 to-cyan-400'}`}
                              style={{ width: `${progressPercentage}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-mono text-slate-500 whitespace-nowrap">
                            {currentVal} / {ach.targetValue}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Button Controls */}
                    <div className="flex sm:flex-col items-end gap-2 text-right">
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                        <span className="text-amber-400">+{ach.coinReward} Gold</span>
                        <span>•</span>
                        <span className="text-blue-400">+{ach.xpReward} XP</span>
                      </div>

                      {isClaimed ? (
                        <span className="flex items-center gap-1 px-3 py-1.5 text-xs text-emerald-400 font-bold bg-slate-950 border border-emerald-500/20 rounded-lg font-mono">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Claimed
                        </span>
                      ) : (
                        <button
                          onClick={() => handleClaim(ach)}
                          disabled={!isUnlocked}
                          className={`w-full sm:w-auto px-4 py-2 text-[10px] font-mono font-bold uppercase rounded-lg border transition-all cursor-pointer ${
                            isUnlocked
                              ? 'border-amber-400 bg-amber-500 text-slate-950 hover:bg-yellow-400 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                              : 'border-white/5 bg-slate-900/40 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          Claim Reward
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ProfileView;
