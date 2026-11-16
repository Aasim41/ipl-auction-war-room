'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Sparkles, Gavel, CheckCircle2, AlertTriangle, RefreshCw, X, ArrowRight, Zap, Target } from 'lucide-react';
import { FranchiseData, IPL_FRANCHISES } from '../data/franchises';

interface MegaAuctionRetentionModalProps {
  franchise: FranchiseData;
  isOpen: boolean;
  onClose: () => void;
  onConfirmMegaStart: (startingPurse: number, rtmCards: number, retainedPlayers: any[]) => void;
}

export default function MegaAuctionRetentionModal({
  franchise,
  isOpen,
  onClose,
  onConfirmMegaStart,
}: MegaAuctionRetentionModalProps) {
  const [loading, setLoading] = useState(false);
  const [megaPresets, setMegaPresets] = useState<any>(null);
  const [selectedFranchiseId, setSelectedFranchiseId] = useState(franchise.id);
  const [selectedRetentions, setSelectedRetentions] = useState<any[]>([]);

  // Fetch official BCCI Mega Auction presets from backend
  useEffect(() => {
    if (!isOpen) return;
    fetch('http://localhost:8000/api/auction/mega-retentions')
      .then((res) => res.json())
      .then((data) => {
        setMegaPresets(data.presets);
        const teamKey = franchise.short.toUpperCase();
        const preset = data.presets?.[teamKey] || data.presets?.['RCB'];
        if (preset) {
          setSelectedRetentions(preset.retentions || []);
        }
      })
      .catch((err) => console.error(err));
  }, [isOpen, franchise.short]);

  if (!isOpen) return null;

  // Calculate official BCCI retention deductions
  const cappedRetentions = selectedRetentions.filter((r) => !r.is_uncapped);
  const uncappedRetentions = selectedRetentions.filter((r) => r.is_uncapped);

  const CAPPED_SLABS = [18.0, 14.0, 11.0, 18.0, 14.0];
  const UNCAPPED_SLAB = 4.0;
  const TOTAL_MEGA_PURSE = 120.0;

  // Sort capped retentions by price descending
  const sortedCapped = [...cappedRetentions].sort((a, b) => b.price - a.price);

  let totalDeduction = 0;
  const slabDetails: any[] = [];

  sortedCapped.forEach((p, idx) => {
    const slab = idx < CAPPED_SLABS.length ? CAPPED_SLABS[idx] : 14.0;
    const deduction = Math.max(slab, p.price);
    totalDeduction += deduction;
    slabDetails.push({
      name: p.name,
      role: p.role,
      type: `Capped Slot #${idx + 1}`,
      slab: slab,
      salary: p.price,
      deduction: deduction,
      is_uncapped: false,
    });
  });

  uncappedRetentions.forEach((p, idx) => {
    const slab = UNCAPPED_SLAB;
    const deduction = Math.max(slab, p.price);
    totalDeduction += deduction;
    slabDetails.push({
      name: p.name,
      role: p.role,
      type: `Uncapped Slot #${idx + 1}`,
      slab: slab,
      salary: p.price,
      deduction: deduction,
      is_uncapped: true,
    });
  });

  const remainingPurse = Math.max(0, TOTAL_MEGA_PURSE - totalDeduction);
  const rtmCards = Math.max(0, 6 - selectedRetentions.length);
  const openSlots = 25 - selectedRetentions.length;

  const handleSelectPreset = (teamKey: string) => {
    setSelectedFranchiseId(teamKey.toLowerCase());
    if (megaPresets?.[teamKey]) {
      setSelectedRetentions(megaPresets[teamKey].retentions);
    }
  };

  const handleRemoveRetention = (name: string) => {
    setSelectedRetentions((prev) => prev.filter((p) => p.name !== name));
  };

  const handleLaunch = () => {
    onConfirmMegaStart(remainingPurse, rtmCards, selectedRetentions);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in text-slate-100">
      <div className="relative w-full max-w-4xl bg-slate-950 border border-white/20 rounded-3xl p-5 sm:p-6 shadow-2xl max-h-[92vh] flex flex-col justify-between overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-bold">
              <Gavel size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white">BCCI Official Mega Auction Strategy</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  SLAB MATH & RTM RULES
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Configure your official 6-player retentions. BCCI deductions calculate your starting auction purse and Right-to-Match (RTM) cards.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-3 space-y-4 pr-1">
          
          {/* Quick Franchise Preset Selector */}
          <div>
            <span className="text-[10px] font-mono uppercase font-bold text-gray-400 block mb-1.5">
              Select Franchise Official 2025/2026 Retention Baseline:
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {Object.keys(OFFICIAL_MEGA_PRESETS_UI).map((team) => (
                <button
                  key={team}
                  onClick={() => handleSelectPreset(team)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap border ${
                    selectedFranchiseId === team.toLowerCase()
                      ? 'bg-amber-500 text-black border-amber-400 shadow-md scale-105'
                      : 'bg-white/5 text-gray-400 border-white/10 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {team}
                </button>
              ))}
            </div>
          </div>

          {/* Vitals Summary Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-2xl bg-slate-900 border border-white/10">
              <span className="text-[10px] uppercase font-bold text-gray-400 block">Total BCCI Cap</span>
              <span className="text-xl font-black text-white font-mono">₹{TOTAL_MEGA_PURSE.toFixed(1)} Cr</span>
              <span className="text-[10px] text-gray-400 block mt-0.5">BCCI Salary Ceiling</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900 border border-rose-500/30">
              <span className="text-[10px] uppercase font-bold text-rose-400 block">Total Deducted</span>
              <span className="text-xl font-black text-rose-400 font-mono">₹{totalDeduction.toFixed(1)} Cr</span>
              <span className="text-[10px] text-gray-400 block mt-0.5">For {selectedRetentions.length} Retained Stars</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900 border border-emerald-500/30">
              <span className="text-[10px] uppercase font-bold text-emerald-400 block">Starting Mega Purse</span>
              <span className="text-xl font-black text-emerald-400 font-mono">₹{remainingPurse.toFixed(1)} Cr</span>
              <span className="text-[10px] text-gray-400 block mt-0.5">For {openSlots} Auction Buys</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900 border border-purple-500/30">
              <span className="text-[10px] uppercase font-bold text-purple-400 block">RTM Cards</span>
              <span className="text-xl font-black text-purple-400 font-mono">🎯 {rtmCards} Cards</span>
              <span className="text-[10px] text-gray-400 block mt-0.5">Formula: 6 - Retentions</span>
            </div>
          </div>

          {/* BCCI Retention Slab Table */}
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black uppercase text-white flex items-center gap-1.5">
                <Target size={14} className="text-amber-400" />
                BCCI Official Slab Math Breakdown ({selectedRetentions.length} / 6 Max)
              </span>
              <span className="text-[10px] text-gray-400 font-mono">
                Capped: {cappedRetentions.length}/5 • Uncapped: {uncappedRetentions.length}/2
              </span>
            </div>

            {slabDetails.length === 0 ? (
              <div className="p-6 text-center text-xs text-gray-500 border border-dashed border-white/10 rounded-xl">
                No retentions configured. PBKS-style full reset: You enter auction with ₹120 Cr and 6 RTM cards!
              </div>
            ) : (
              <div className="space-y-1.5">
                {slabDetails.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-slate-950/80 border border-white/5 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center font-bold text-[10px] text-gray-400">
                        {idx + 1}
                      </span>
                      <div>
                        <div className="font-bold text-white flex items-center gap-1.5">
                          {item.name}
                          <span className={`px-1.5 py-0.2 rounded text-[9px] font-black ${
                            item.is_uncapped
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                              : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                          }`}>
                            {item.type}
                          </span>
                        </div>
                        <span className="text-[10px] text-gray-400">
                          Slab Base: ₹{item.slab} Cr • Actual Fee: ₹{item.salary} Cr
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="font-mono font-bold text-rose-400 text-xs block">
                          -₹{item.deduction.toFixed(1)} Cr
                        </span>
                        <span className="text-[9px] text-gray-500">Purse Deducted</span>
                      </div>
                      <button
                        onClick={() => handleRemoveRetention(item.name)}
                        className="text-gray-500 hover:text-red-400 p-1 transition-colors cursor-pointer"
                        title="Release to Mega Auction Pool"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Official BCCI Rules Summary Box */}
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-amber-200">
              <AlertTriangle size={13} className="shrink-0 text-amber-400" /> Official BCCI Mega Auction Regulations:
            </div>
            <ul className="list-disc pl-4 space-y-0.5 text-amber-200/90 text-[10px]">
              <li><strong>Capped Slabs:</strong> 1st = ₹18 Cr, 2nd = ₹14 Cr, 3rd = ₹11 Cr, 4th = ₹18 Cr, 5th = ₹14 Cr (Total ₹75 Cr).</li>
              <li><strong>Uncapped Slabs:</strong> Fixed at ₹4.0 Cr each (max 2 uncapped players).</li>
              <li><strong>RTM Math:</strong> Total 6 cards minus retentions made. An un-retained player can be matched during the auction!</li>
              <li><strong>New 2-Step RTM Rule:</strong> When RTM is invoked, the highest bidder gets ONE chance to raise their bid before former franchise matches.</li>
            </ul>
          </div>

        </div>

        {/* Footer Action */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={() => setSelectedRetentions([])}
            className="px-3 py-2 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer"
          >
            Clear All (PBKS Full Reset)
          </button>

          <button
            onClick={handleLaunch}
            className="px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider text-black bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 transition-all flex items-center gap-2 cursor-pointer shadow-xl hover:scale-[1.02]"
          >
            <span>Launch Mega Auction Floor (₹{remainingPurse.toFixed(1)} Cr • {rtmCards} RTMs)</span>
            <ArrowRight size={14} />
          </button>
        </div>

      </div>
    </div>
  );
}

const OFFICIAL_MEGA_PRESETS_UI: Record<string, boolean> = {
  RCB: true,
  CSK: true,
  MI: true,
  KKR: true,
  PBKS: true,
  SRH: true,
  RR: true,
  DC: true,
  LSG: true,
  GT: true,
};
