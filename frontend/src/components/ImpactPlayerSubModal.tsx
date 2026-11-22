'use client';

import React, { useState } from 'react';
import { Zap, X, ArrowRight, Shield, AlertTriangle, Users } from 'lucide-react';
import { formatPlayerInitial } from '../lib/nameFormatter';
import { getDetailedPlayerRole } from '../lib/bowlerClassification';
import { gameAudio, triggerGameHaptic } from '../lib/gameAudioAndHaptics';

interface ImpactSubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmSub: (outPlayerName: string, inPlayerName: string, inPlayerObj: any) => void;
  activePlayers: Array<{ name: string; role?: string; is_overseas?: boolean; runs?: number; overs?: string }>;
  benchPlayers: Array<any>;
  teamColor: string;
}

export function ImpactPlayerSubModal({
  isOpen,
  onClose,
  onConfirmSub,
  activePlayers,
  benchPlayers,
  teamColor,
}: ImpactSubModalProps) {
  const [selectedOutPlayer, setSelectedOutPlayer] = useState<string | null>(activePlayers[0]?.name || null);
  const [selectedInPlayer, setSelectedInPlayer] = useState<any | null>(benchPlayers[0] || null);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!selectedOutPlayer || !selectedInPlayer) return;
    gameAudio.unlockAudio();
    gameAudio.playSirenSting();
    gameAudio.playConfettiFanfare();
    triggerGameHaptic('heavy');
    onConfirmSub(selectedOutPlayer, selectedInPlayer.name, selectedInPlayer);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-xl bg-slate-900 border-2 border-amber-400/50 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col gap-4 text-white">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black">
              <Zap size={18} />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black font-display text-white uppercase tracking-wide">
                T20 Tactical Impact Player Sub
              </h3>
              <p className="text-[11px] text-gray-400">
                12th Man Substitution • Active for the remainder of the match
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-gray-400 hover:text-white transition-all cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tactical Rule Notice */}
        <div className="p-2.5 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-start gap-2 text-xs">
          <Zap size={15} className="text-amber-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-amber-200 leading-relaxed">
            <strong>Tactical GM Control:</strong> Sub any player into the active XI whenever you want. You have complete tactical authority with no rigid restrictions.
          </p>
        </div>

        {/* Dual Selection Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto pr-1">
          {/* Column 1: Player to SUB OUT */}
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-mono font-bold text-rose-400 block px-1">
              1. Choose Player to Sub OUT (On-Field)
            </span>
            <div className="space-y-1 max-h-48 overflow-y-auto pr-0.5">
              {activePlayers.map((p) => {
                const isSelected = selectedOutPlayer === p.name;
                return (
                  <div
                    key={p.name}
                    onClick={() => {
                      setSelectedOutPlayer(p.name);
                      gameAudio.playUiTap('light');
                    }}
                    className={`p-2 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-rose-500/20 border-rose-400 text-white font-bold'
                        : 'bg-slate-950/60 border-white/10 text-gray-300 hover:bg-white/5'
                    }`}
                  >
                    <span className="truncate">{formatPlayerInitial(p.name)}</span>
                    <span className="text-[9px] font-mono opacity-80 text-gray-400">
                      {p.role || 'Player'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Column 2: Player to SUB IN */}
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-mono font-bold text-emerald-400 block px-1">
              2. Choose Impact Player to Sub IN (Bench)
            </span>
            <div className="space-y-1 max-h-48 overflow-y-auto pr-0.5">
              {benchPlayers.length === 0 ? (
                <div className="p-4 text-center text-xs text-gray-500">No reserves available.</div>
              ) : (
                benchPlayers.map((bp) => {
                  const isSelected = selectedInPlayer?.player_id === bp.player_id;
                  return (
                    <div
                      key={bp.player_id}
                      onClick={() => {
                        setSelectedInPlayer(bp);
                        gameAudio.playUiTap('light');
                      }}
                      className={`p-2 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-emerald-500/20 border-emerald-400 text-white font-bold shadow-sm'
                          : 'bg-slate-950/60 border-white/10 text-gray-300 hover:bg-white/5'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="truncate flex items-center gap-1">
                          <span>{formatPlayerInitial(bp.name)}</span>
                          {bp.is_overseas && (
                            <span className="text-[8px] px-1 rounded bg-sky-500/20 text-sky-300">OS</span>
                          )}
                        </div>
                        <div className="text-[9.5px] text-gray-400 font-mono">
                          {getDetailedPlayerRole(bp)}
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-amber-300 shrink-0 font-bold">
                        P.I {bp.Power_Index || 85}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Selected Pair Preview */}
        {selectedOutPlayer && selectedInPlayer && (
          <div className="p-2.5 rounded-2xl bg-slate-950 border border-white/15 flex items-center justify-between gap-2 text-xs">
            <div className="text-left min-w-0">
              <span className="text-[9px] uppercase font-mono text-rose-400 block">Out</span>
              <strong className="text-white truncate block">{formatPlayerInitial(selectedOutPlayer)}</strong>
            </div>
            <ArrowRight size={16} className="text-amber-400 shrink-0" />
            <div className="text-right min-w-0">
              <span className="text-[9px] uppercase font-mono text-emerald-400 block">In (Impact Sub)</span>
              <strong className="text-emerald-300 truncate block">{formatPlayerInitial(selectedInPlayer.name)}</strong>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-gray-300 font-bold text-xs uppercase cursor-pointer transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedOutPlayer || !selectedInPlayer}
            className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-xl disabled:opacity-30 active:scale-95 transition-all"
          >
            <Zap size={14} className="text-slate-950" />
            <span>Confirm & Activate Impact Sub</span>
          </button>
        </div>

      </div>
    </div>
  );
}
