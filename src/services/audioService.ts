/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SoundSettings } from '../types';

class AudioService {
  private ctx: AudioContext | null = null;
  private settings: SoundSettings = {
    musicVolume: 0.4,
    sfxVolume: 0.5,
    musicEnabled: true,
    sfxEnabled: true,
  };

  private backgroundNode: OscillatorNode | null = null;
  private backgroundGain: GainNode | null = null;
  private musicInterval: any = null;

  constructor() {
    // Lazy-initialized on first click/action to satisfy browser autoplay policies
  }

  updateSettings(settings: SoundSettings) {
    this.settings = settings;
    if (!settings.musicEnabled) {
      this.stopMusic();
    } else if (settings.musicEnabled && this.ctx && !this.musicInterval) {
      this.startMusic();
    }
    if (this.backgroundGain) {
      this.backgroundGain.gain.value = settings.musicEnabled ? settings.musicVolume * 0.1 : 0;
    }
  }

  private initCtx() {
    if (!this.ctx) {
      // Compatibility fallback
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playClick() {
    this.initCtx();
    if (!this.ctx || !this.settings.sfxEnabled) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(this.settings.sfxVolume * 0.15, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }

  playTick() {
    this.initCtx();
    if (!this.ctx || !this.settings.sfxEnabled) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1000, this.ctx.currentTime);
    osc.frequency.setValueAtTime(800, this.ctx.currentTime + 0.01);

    gain.gain.setValueAtTime(this.settings.sfxVolume * 0.12, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.04);
  }

  playCorrect() {
    this.initCtx();
    if (!this.ctx || !this.settings.sfxEnabled) return;

    const now = this.ctx.currentTime;
    const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5 (major chord)

    notes.forEach((freq, index) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + index * 0.08);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + index * 0.08 + 0.3);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(this.settings.sfxVolume * 0.18, now + index * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.08 + 0.4);

      osc.start(now + index * 0.08);
      osc.stop(now + index * 0.08 + 0.45);
    });
  }

  playWrong() {
    this.initCtx();
    if (!this.ctx || !this.settings.sfxEnabled) return;

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(140, now);
    osc1.frequency.linearRampToValueAtTime(80, now + 0.45);

    osc2.type = 'square';
    osc2.frequency.setValueAtTime(142, now);
    osc2.frequency.linearRampToValueAtTime(82, now + 0.45);

    gain.gain.setValueAtTime(this.settings.sfxVolume * 0.22, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.45);

    osc1.start();
    osc1.stop(now + 0.45);
    osc2.start();
    osc2.stop(now + 0.45);
  }

  playCoin() {
    this.initCtx();
    if (!this.ctx || !this.settings.sfxEnabled) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.type = 'sine';
    // Arpeggiated sound (bell ring)
    osc.frequency.setValueAtTime(987.77, now); // B5
    osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6

    gain.gain.setValueAtTime(this.settings.sfxVolume * 0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.start();
    osc.stop(now + 0.4);
  }

  playVictory() {
    this.initCtx();
    if (!this.ctx || !this.settings.sfxEnabled) return;

    const now = this.ctx.currentTime;
    // Ascending celebratory arpeggio in C major with standard fanfare structure
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];

    notes.forEach((freq, index) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.type = index % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now + index * 0.07);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(this.settings.sfxVolume * 0.16, now + index * 0.07 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.07 + 0.35);

      osc.start(now + index * 0.07);
      osc.stop(now + index * 0.07 + 0.4);
    });

    // Generate applause noise simulation
    this.generateApplause(0.6);
  }

  private generateApplause(duration: number = 0.5) {
    if (!this.ctx || !this.settings.sfxEnabled) return;
    const now = this.ctx.currentTime;

    // Simulate standard applause with white noise envelope sparks
    for (let i = 0; i < 25; i++) {
      const delay = Math.random() * duration;
      const filter = this.ctx.createBiquadFilter();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(100 + Math.random() * 300, now + delay);

      filter.type = 'bandpass';
      filter.frequency.value = 1500;
      filter.Q.value = 10;

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(this.settings.sfxVolume * 0.05, now + delay + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.12);

      osc.start(now + delay);
      osc.stop(now + delay + 0.15);
    }
  }

  playExplosion() {
    this.initCtx();
    if (!this.ctx || !this.settings.sfxEnabled) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(20, now + 0.6);

    gain.gain.setValueAtTime(this.settings.sfxVolume * 0.3, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.6);

    osc.start();
    osc.stop(now + 0.6);
  }

  startMusic() {
    this.initCtx();
    if (!this.ctx || !this.settings.musicEnabled || this.musicInterval) return;

    // Background low suspense rumble
    this.backgroundNode = this.ctx.createOscillator();
    this.backgroundGain = this.ctx.createGain();

    this.backgroundNode.connect(this.backgroundGain);
    this.backgroundGain.connect(this.ctx.destination);

    this.backgroundNode.type = 'sine';
    this.backgroundNode.frequency.setValueAtTime(65.41, this.ctx.currentTime); // C2 chord fundamental

    this.backgroundGain.gain.setValueAtTime(this.settings.musicVolume * 0.1, this.ctx.currentTime);
    this.backgroundNode.start();

    // Continuous premium synthesized arpeggiated loop
    const notes = [130.81, 164.81, 196.00, 261.63, 196.00, 164.81]; // C3, E3, G3, C4, G3, E3
    let noteIndex = 0;

    this.musicInterval = setInterval(() => {
      if (!this.ctx || !this.settings.musicEnabled) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(notes[noteIndex], now);
      
      gain.gain.setValueAtTime(this.settings.musicVolume * 0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.start();
      osc.stop(now + 0.45);

      noteIndex = (noteIndex + 1) % notes.length;
    }, 450);
  }

  stopMusic() {
    if (this.backgroundNode) {
      try {
        this.backgroundNode.stop();
      } catch (e) {}
      this.backgroundNode = null;
    }
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }
}

export const audioService = new AudioService();
export default audioService;
