/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

export interface ParticlesCanvasRef {
  triggerSuccess: () => void;
  triggerCoinRain: () => void;
  triggerError: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay?: number;
  rotation?: number;
  spin?: number;
  gravity?: number;
  type?: 'star' | 'confetti' | 'coin' | 'flare';
}

export const ParticlesCanvas = forwardRef<ParticlesCanvasRef, {}>((_, ref) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const isShakingRef = useRef(false);
  const shakeIntensityRef = useRef(0);

  useImperativeHandle(ref, () => ({
    triggerSuccess() {
      // Confetti burst from centers
      if (!canvasRef.current) return;
      const w = canvasRef.current.width;
      const h = canvasRef.current.height;
      const colors = ['#f59e0b', '#3b82f6', '#ec4899', '#10b981', '#a855f7', '#f43f5e'];

      for (let i = 0; i < 120; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 12;
        particlesRef.current.push({
          x: w / 2,
          y: h / 2 - 50,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - (3 + Math.random() * 4), // Initial upward boost
          size: 3 + Math.random() * 8,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1.0,
          decay: 0.008 + Math.random() * 0.012,
          rotation: Math.random() * Math.PI * 2,
          spin: -0.1 + Math.random() * 0.2,
          gravity: 0.2,
          type: 'confetti',
        });
      }
    },
    triggerCoinRain() {
      // Gold coins raining from the top
      if (!canvasRef.current) return;
      const w = canvasRef.current.width;

      for (let i = 0; i < 40; i++) {
        particlesRef.current.push({
          x: Math.random() * w,
          y: -20 - Math.random() * 100,
          vx: -1 + Math.random() * 2,
          vy: 4 + Math.random() * 6,
          size: 8 + Math.random() * 12,
          color: '#fbbf24', // Luxury Gold
          alpha: 1.0,
          decay: 0.002,
          rotation: Math.random() * Math.PI * 2,
          spin: 0.04 + Math.random() * 0.06,
          gravity: 0.05,
          type: 'coin',
        });
      }
    },
    triggerError() {
      // Red sparks shooting outward, trigger screen shake
      if (!canvasRef.current) return;
      const w = canvasRef.current.width;
      const h = canvasRef.current.height;
      
      isShakingRef.current = true;
      shakeIntensityRef.current = 20;

      for (let i = 0; i < 80; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 3 + Math.random() * 14;
        particlesRef.current.push({
          x: w / 2,
          y: h / 2,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 2 + Math.random() * 5,
          color: Math.random() > 0.4 ? '#ef4444' : '#f43f5e', // Crimson Red
          alpha: 1.0,
          decay: 0.015 + Math.random() * 0.02,
          gravity: 0.1,
          type: 'flare',
        });
      }
    }
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const updateSize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      canvas.width = rect?.width || window.innerWidth;
      canvas.height = rect?.height || window.innerHeight;
    };

    updateSize();

    // Use ResizeObserver for perfect dimension syncing
    const observer = new ResizeObserver(() => {
      updateSize();
    });
    if (canvas.parentElement) {
      observer.observe(canvas.parentElement);
    }

    // Add initial slow drifting ambient background stars
    const w = canvas.width;
    const h = canvas.height;
    for (let i = 0; i < 40; i++) {
      particlesRef.current.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: 1 + Math.random() * 3,
        color: Math.random() > 0.5 ? '#60a5fa' : '#fbbf24', // Soft blue and gold
        alpha: 0.15 + Math.random() * 0.4,
        type: 'star',
      });
    }

    // Render loop
    const render = () => {
      if (!ctx || !canvas) return;

      // Handle screen shake by transforming canvas coordinate system!
      ctx.save();
      if (isShakingRef.current && shakeIntensityRef.current > 0.1) {
        const dx = (Math.random() - 0.5) * shakeIntensityRef.current;
        const dy = (Math.random() - 0.5) * shakeIntensityRef.current;
        ctx.translate(dx, dy);
        shakeIntensityRef.current *= 0.9; // Decay shake intensity
        if (shakeIntensityRef.current < 0.2) {
          isShakingRef.current = false;
        }
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw starry nodes connected by ambient networks
      const stars = particlesRef.current.filter(p => p.type === 'star');
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.04)';
      ctx.lineWidth = 0.5;

      for (let i = 0; i < stars.length; i++) {
        for (let j = i + 1; j < stars.length; j++) {
          const dist = Math.hypot(stars[i].x - stars[j].x, stars[i].y - stars[j].y);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(stars[i].x, stars[i].y);
            ctx.lineTo(stars[j].x, stars[j].y);
            ctx.stroke();
          }
        }
      }

      // Update and draw all particles
      particlesRef.current = particlesRef.current.filter((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.gravity) {
          p.vy += p.gravity;
        }

        if (p.spin !== undefined && p.rotation !== undefined) {
          p.rotation += p.spin;
        }

        // Fade out
        if (p.decay !== undefined) {
          p.alpha -= p.decay;
        }

        if (p.alpha <= 0) return false;

        // Bounce stars off walls to keep ambient density
        if (p.type === 'star') {
          if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
          if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;

        if (p.type === 'coin') {
          // Draw standard circular gold coin with a metallic 3D rim and star engraving!
          ctx.beginPath();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation || 0);
          ctx.scale(Math.sin(p.rotation || 0), 1.0); // Spin 3D effect!

          // Coin outer face
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();

          // Gold border
          ctx.strokeStyle = '#d97706';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Star engraving inside
          ctx.fillStyle = '#fef08a';
          ctx.font = `bold ${p.size * 0.9}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('$', 0, 0.5);

        } else if (p.type === 'confetti') {
          // Draw rectangle or star confetti
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation || 0);
          ctx.shadowBlur = 10;
          ctx.shadowColor = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);

        } else if (p.type === 'flare') {
          // High intensity exploding light sparks
          ctx.shadowBlur = 15;
          ctx.shadowColor = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();

        } else {
          // Ambient stars
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
        return true;
      });

      ctx.restore();
      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      observer.disconnect();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <canvas
      id="game-canvas"
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full pointer-events-none z-10"
    />
  );
});

ParticlesCanvas.displayName = 'ParticlesCanvas';
