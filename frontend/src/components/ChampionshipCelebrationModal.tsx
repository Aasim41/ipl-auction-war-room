'use client';

import React, { useEffect, useRef } from 'react';
import { Trophy, Award, Sparkles, X, ChevronRight, Share2 } from 'lucide-react';
import { TeamLogo } from './TeamLogo';
import { getTeamTheme } from '../data/teamThemes';
import { gameAudio, triggerGameHaptic } from '../lib/gameAudioAndHaptics';

interface ChampionshipModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
  teamName: string;
  resultSummary?: string;
  seasonLabel?: string;
  onViewTrophies?: () => void;
}

export function ChampionshipCelebrationModal({
  isOpen,
  onClose,
  teamId,
  teamName,
  resultSummary = 'Champions of IPL 2027',
  seasonLabel = 'IPL 2027',
  onViewTrophies
}: ChampionshipModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const theme = getTeamTheme(teamId);

  useEffect(() => {
    if (!isOpen) return;

    gameAudio.unlockAudio();
    gameAudio.playTrophyCelebrationFanfare();
    triggerGameHaptic('heavy');

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Generate 120 confetti pieces
    const colors = ['#f59e0b', '#fbbf24', theme.primary, '#ffffff', '#38bdf8', '#a855f7'];
    const particles = Array.from({ length: 120 }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * -height,
      size: Math.random() * 8 + 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      speedY: Math.random() * 3 + 2.5,
      speedX: (Math.random() - 0.5) * 2,
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 10,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.y += p.speedY;
        p.x += p.speedX;
        p.rotation += p.rotSpeed;

        if (p.y > height) {
          p.y = -20;
          p.x = Math.random() * width;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen, theme.primary]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-xl animate-fadeIn">
      {/* ─── Confetti Particle Canvas ─── */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" />

      {/* ─── Modal Content Container ─── */}
      <div 
        style={{
          borderColor: theme.cardBorder,
          boxShadow: `0 0 60px ${theme.primary}55, 0 25px 50px -12px rgba(0, 0, 0, 0.95)`,
        }}
        className="relative z-10 w-full max-w-lg bg-slate-900/95 border-2 rounded-3xl p-5 sm:p-7 text-center overflow-hidden flex flex-col items-center"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-all cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Top Gold Pill */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-[11px] font-black uppercase tracking-widest shadow-lg mb-3">
          <Sparkles size={13} className="text-slate-950" />
          <span>OFFICIAL CHAMPIONSHIP PODIUM</span>
          <Sparkles size={13} className="text-slate-950" />
        </div>

        {/* Golden Trophy Visual */}
        <div className="relative my-3 flex items-center justify-center">
          <div 
            className="absolute w-40 h-40 rounded-full blur-2xl opacity-60"
            style={{ backgroundColor: theme.primary }}
          />
          <div className="relative flex flex-col items-center">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 p-0.5 shadow-2xl flex items-center justify-center border-2 border-amber-200">
              <Trophy size={64} className="text-slate-950 drop-shadow-md" />
            </div>
            {/* Team Crest Pin */}
            <div className="absolute -bottom-2 w-10 h-10 rounded-full bg-slate-950 border-2 border-amber-300 flex items-center justify-center shadow-lg">
              <TeamLogo teamId={teamId} size={26} />
            </div>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-black font-display text-white mt-3 uppercase tracking-wide">
          {teamName}
        </h2>
        <div 
          style={{ color: theme.primary }}
          className="text-base sm:text-lg font-black font-mono tracking-wider uppercase mt-0.5 drop-shadow-sm"
        >
          CHAMPIONS OF {seasonLabel}
        </div>

        {/* Result Highlight */}
        <p className="text-xs sm:text-sm text-gray-300 font-medium max-w-sm mx-auto mt-2 leading-relaxed">
          {resultSummary}
        </p>

        {/* GM Tactical Accolade Box */}
        <div className="w-full mt-4 p-3 rounded-2xl bg-white/5 border border-white/10 grid grid-cols-3 gap-2 text-center text-xs font-mono">
          <div className="p-1.5 rounded-xl bg-slate-950/60 border border-white/5">
            <span className="text-[10px] text-gray-400 block uppercase font-bold">GM Rating</span>
            <span className="text-emerald-400 font-black text-sm">S+ ELITE</span>
          </div>
          <div className="p-1.5 rounded-xl bg-slate-950/60 border border-white/5">
            <span className="text-[10px] text-gray-400 block uppercase font-bold">Prize Purse</span>
            <span className="text-amber-300 font-black text-sm">₹20.00 Cr</span>
          </div>
          <div className="p-1.5 rounded-xl bg-slate-950/60 border border-white/5">
            <span className="text-[10px] text-gray-400 block uppercase font-bold">Cabinet</span>
            <span className="text-amber-400 font-black text-sm">🏆 Gold Cup</span>
          </div>
        </div>

        {/* Actions */}
        <div className="w-full mt-5 flex flex-col sm:flex-row items-center gap-2.5">
          {onViewTrophies && (
            <button
              onClick={() => {
                onClose();
                onViewTrophies();
              }}
              style={{
                backgroundColor: theme.pillBg,
                color: theme.pillText,
                borderColor: theme.cardBorder,
              }}
              className="w-full sm:flex-1 py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-lg hover:brightness-110 active:scale-95 transition-all"
            >
              <Award size={15} />
              <span>View In Trophy Room</span>
              <ChevronRight size={14} />
            </button>
          )}

          <button
            onClick={onClose}
            className="w-full sm:w-auto py-3 px-5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase cursor-pointer transition-all border border-white/10"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
