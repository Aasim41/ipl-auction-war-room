'use client';

import React, { useRef, useState } from 'react';
import { Download, Share2, Copy, Check, X, Trophy, MapPin, Sparkles, Shield, Flame } from 'lucide-react';
import { FranchiseData } from '../data/franchises';

interface SquadExportModalProps {
  franchise: FranchiseData;
  squad: any[];
  stadiumName: string;
  stadiumCity: string;
  onClose: () => void;
}

export default function SquadExportModal({ franchise, squad, stadiumName, stadiumCity, onClose }: SquadExportModalProps) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Group squad into matchday roles
  const wks = squad.filter(p => p.role === 'WK');
  const bats = squad.filter(p => p.role === 'BAT');
  const ars = squad.filter(p => p.role === 'AR');
  const bowls = squad.filter(p => p.role === 'BOWL');

  const totalPurseSpend = squad.reduce((sum, p) => sum + (p.predicted_price || p.base_price || p.price || 0), 0);
  const avgPI = squad.length > 0 ? (squad.reduce((sum, p) => sum + (Number(p.Power_Index) || 75), 0) / squad.length).toFixed(1) : '75.0';

  const handleCopyLink = () => {
    // Generate a portable squad code
    const playerIds = squad.map(p => p.player_id || p.id || p.name).join(',');
    const shareableUrl = `${window.location.origin}/squad?team=${franchise.id}&roster=${encodeURIComponent(playerIds)}`;
    navigator.clipboard.writeText(shareableUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadImage = () => {
    setDownloading(true);
    const canvas = canvasRef.current;
    if (!canvas) {
      setDownloading(false);
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setDownloading(false);
      return;
    }

    // Canvas dimensions: 1200 x 675 (16:9 HD Shareable Card)
    canvas.width = 1200;
    canvas.height = 675;

    // Background gradient matching franchise identity
    const bgGrad = ctx.createLinearGradient(0, 0, 1200, 675);
    bgGrad.addColorStop(0, '#060a12');
    bgGrad.addColorStop(0.5, '#0b1120');
    bgGrad.addColorStop(1, '#030712');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1200, 675);

    // Accent stadium glow corners
    const accentColor = franchise.color || '#3b82f6';
    const radGlow1 = ctx.createRadialGradient(0, 0, 10, 0, 0, 450);
    radGlow1.addColorStop(0, `${accentColor}40`);
    radGlow1.addColorStop(1, 'transparent');
    ctx.fillStyle = radGlow1;
    ctx.fillRect(0, 0, 600, 400);

    const radGlow2 = ctx.createRadialGradient(1200, 675, 10, 1200, 675, 450);
    radGlow2.addColorStop(0, `${accentColor}30`);
    radGlow2.addColorStop(1, 'transparent');
    ctx.fillStyle = radGlow2;
    ctx.fillRect(600, 275, 600, 400);

    // Pitch crease watermark
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 2;
    ctx.strokeRect(100, 60, 1000, 555);
    ctx.strokeRect(300, 60, 600, 555);

    // Top Header - Franchise & Fortress
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 36px "Montserrat", sans-serif';
    ctx.fillText(`${franchise.emoji} ${franchise.name.toUpperCase()}`, 60, 80);

    ctx.font = '600 16px sans-serif';
    ctx.fillStyle = accentColor;
    ctx.fillText(`OFFICIAL 2026 SQUAD WAR ROOM • ${stadiumName.toUpperCase()}`, 60, 110);

    // Right top metrics
    ctx.textAlign = 'right';
    ctx.fillStyle = '#10b981';
    ctx.font = '800 24px monospace';
    ctx.fillText(`SPEND: ₹${totalPurseSpend.toFixed(1)} Cr / 125 Cr`, 1140, 75);

    ctx.font = '700 16px sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`SQUAD POWER: ${avgPI} / 100 • ${squad.length} PLAYERS`, 1140, 105);
    ctx.textAlign = 'left';

    // Divider Line
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(60, 130);
    ctx.lineTo(1140, 130);
    ctx.stroke();

    // Roster Columns (Openers/Bats, Keepers/ARs, Bowlers)
    const renderSection = (title: string, players: any[], startX: number, startY: number, color: string) => {
      ctx.fillStyle = color;
      ctx.font = '800 16px sans-serif';
      ctx.fillText(title.toUpperCase(), startX, startY);

      ctx.fillStyle = '#ffffff';
      let y = startY + 28;
      players.slice(0, 7).forEach((p, idx) => {
        // Player badge pill
        ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
        ctx.fillRect(startX, y - 18, 330, 28);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.strokeRect(startX, y - 18, 330, 28);

        // Player Name
        ctx.fillStyle = '#f8fafc';
        ctx.font = '700 13px sans-serif';
        const nameText = `${idx + 1}. ${p.name}`;
        ctx.fillText(nameText.length > 22 ? nameText.slice(0, 21) + '..' : nameText, startX + 10, y);

        // Role & Overseas tag
        ctx.font = '600 11px monospace';
        ctx.fillStyle = p.is_overseas ? '#38bdf8' : '#e2e8f0';
        const meta = `${p.role}${p.is_overseas ? ' ✈️' : ''} • ₹${p.predicted_price || p.base_price || p.price}Cr`;
        ctx.textAlign = 'right';
        ctx.fillText(meta, startX + 320, y);
        ctx.textAlign = 'left';

        y += 34;
      });
    };

    renderSection(`Batters (${bats.length})`, bats, 60, 175, '#38bdf8');
    renderSection(`Keepers & All-Rounders (${wks.length + ars.length})`, [...wks, ...ars], 430, 175, '#fbbf24');
    renderSection(`Bowling Attack (${bowls.length})`, bowls, 800, 175, '#f43f5e');

    // Bottom Footer
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.fillRect(60, 600, 1080, 45);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.strokeRect(60, 600, 1080, 45);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 13px sans-serif';
    ctx.fillText('⚡ GENERATED ON AUCTIONXI • IPL PREDICTIVE WAR ROOM & PITCH OPTIMIZER', 80, 628);

    ctx.textAlign = 'right';
    ctx.fillStyle = accentColor;
    ctx.font = '800 13px monospace';
    ctx.fillText('HTTP://LOCALHOST:3000/SQUAD', 1120, 628);
    ctx.textAlign = 'left';

    // Trigger download
    setTimeout(() => {
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `IPL2026_${franchise.short}_Squad_WarRoom.png`;
      link.href = dataUrl;
      link.click();
      setDownloading(false);
    }, 200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl bg-slate-950 border border-slate-700/60 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden">
        
        {/* Glow Header */}
        <div 
          className="absolute top-0 left-0 right-0 h-1.5"
          style={{ backgroundColor: franchise.color }}
        />

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-800 text-gray-300 hover:text-white hover:bg-slate-700 transition-colors"
        >
          <X size={18} />
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-3 mb-6">
          <div 
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl font-bold border"
            style={{ 
              backgroundColor: `${franchise.color}20`,
              borderColor: `${franchise.color}60`
            }}
          >
            {franchise.emoji}
          </div>
          <div>
            <h2 className="text-2xl font-black text-white font-display tracking-wide flex items-center gap-2">
              Share & Export Matchday Squad
              <Sparkles size={18} className="text-amber-400" />
            </h2>
            <p className="text-xs text-gray-400">
              Download high-res 16:9 poster or copy a universal battle link for {franchise.name}
            </p>
          </div>
        </div>

        {/* Visual Poster Card Preview */}
        <div 
          className="p-6 rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-950 mb-6 relative overflow-hidden"
          style={{ boxShadow: `0 0 30px ${franchise.color}15` }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-4 border-b border-white/10">
            <div>
              <span className="text-xl font-black text-white">{franchise.emoji} {franchise.name}</span>
              <div className="text-xs text-emerald-400 flex items-center gap-1 mt-0.5">
                <MapPin size={12} /> {stadiumName} ({stadiumCity})
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-xs text-gray-400">Salary Spend</div>
                <div className="text-base font-black font-mono text-emerald-400">₹{totalPurseSpend.toFixed(1)} Cr</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-400">Squad Power</div>
                <div className="text-base font-black font-mono text-amber-400">{avgPI}/100</div>
              </div>
            </div>
          </div>

          {/* Quick Roster Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="font-bold text-sky-400 block mb-2">Batters ({bats.length})</span>
              <div className="space-y-1 text-gray-300">
                {bats.slice(0, 5).map(p => <div key={p.player_id} className="truncate">• {p.name} {p.is_overseas ? '✈️' : ''}</div>)}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="font-bold text-amber-400 block mb-2">Keepers & ARs ({wks.length + ars.length})</span>
              <div className="space-y-1 text-gray-300">
                {[...wks, ...ars].slice(0, 5).map(p => <div key={p.player_id} className="truncate">• {p.name} {p.is_overseas ? '✈️' : ''}</div>)}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="font-bold text-rose-400 block mb-2">Bowlers ({bowls.length})</span>
              <div className="space-y-1 text-gray-300">
                {bowls.slice(0, 5).map(p => <div key={p.player_id} className="truncate">• {p.name} {p.is_overseas ? '✈️' : ''}</div>)}
              </div>
            </div>
          </div>
        </div>

        {/* Hidden Canvas for High-Resolution Export */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={handleDownloadImage}
            disabled={downloading}
            className="w-full sm:w-auto flex-1 px-5 py-3 rounded-2xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-teal-600 text-white flex items-center justify-center gap-2 hover:opacity-95 transition-opacity shadow-lg cursor-pointer"
          >
            <Download size={16} />
            {downloading ? 'Rendering HD Poster...' : 'Download HD Matchday Card (PNG)'}
          </button>

          <button
            onClick={handleCopyLink}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl font-bold text-sm bg-slate-800 border border-slate-700 text-gray-200 hover:text-white hover:bg-slate-700 flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            {copied ? <Check size={16} className="text-emerald-400" /> : <Share2 size={16} />}
            {copied ? 'Share Link Copied!' : 'Copy Squad Battle Link'}
          </button>
        </div>

      </div>
    </div>
  );
}
