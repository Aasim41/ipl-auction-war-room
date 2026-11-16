'use client';

import React, { useState, useEffect } from 'react';
import { Gavel, Play, SkipForward, Zap, History, Flame, Shield, Sparkles, TrendingUp, AlertCircle, CheckCircle2, Target, Settings } from 'lucide-react';
import { FranchiseData } from '../data/franchises';
import { Player } from '../lib/usePlayerData';
import FallbackTreeDrawer from './FallbackTreeDrawer';
import NOCRiskBadge from './NOCRiskBadge';
import MegaAuctionRetentionModal from './MegaAuctionRetentionModal';

interface IntegratedAuctionStageProps {
  franchise: FranchiseData;
  remainingPurse: number;
  onPlayerWon: (player: Player) => void;
  onModeSwitch?: (mode: 'mini' | 'mega') => void;
}

export default function IntegratedAuctionStage({
  franchise,
  remainingPurse,
  onPlayerWon,
  onModeSwitch,
}: IntegratedAuctionStageProps) {
  const [isStarted, setIsStarted] = useState(false);
  const [auctionMode, setAuctionMode] = useState<'mini' | 'mega'>('mini');
  const [auctionState, setAuctionState] = useState<any | null>(null);
  const [soldMessage, setSoldMessage] = useState<{ team: string; amount: number } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showRetentionModal, setShowRetentionModal] = useState(false);
  const [rtmFeedback, setRtmFeedback] = useState<string | null>(null);

  useEffect(() => {
    fetchAuctionState();
  }, [franchise.id]);

  const fetchAuctionState = async () => {
    setActionLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/auction/state');
      const data = await res.json();
      setAuctionState(data);
      if (data && (data.status === 'active' || data.current_player)) {
        setIsStarted(true);
      }
      if (data?.mode) {
        setAuctionMode(data.mode);
      }
    } catch (err) {
      console.error('Failed to fetch auction state:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const startAuction = async (mode: 'mini' | 'mega', budget?: number, rtmCards?: number) => {
    setActionLoading(true);
    try {
      const budgetToUse = budget || (mode === 'mini' ? Math.max(5.0, remainingPurse) : 83.0);
      const res = await fetch('http://localhost:8000/api/auction/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          team_name: franchise.short,
          budget: budgetToUse,
          mode: mode,
          rtm_cards: rtmCards || 0,
        }),
      });
      const data = await res.json();
      setAuctionState(data);
      setAuctionMode(mode);
      setIsStarted(true);
      if (onModeSwitch) onModeSwitch(mode);
    } catch (err) {
      console.error('Failed to start auction:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAction = async (action: 'bid' | 'pass') => {
    setActionLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/auction/bid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();

      if (data.status === 'sold' || data.status === 'unsold') {
        const soldTeam = data.status === 'sold' ? data.current_bidder : 'UNSOLD';
        const soldAmt = data.status === 'sold' ? data.current_bid : 0;
        setSoldMessage({ team: soldTeam, amount: soldAmt });

        if (soldTeam === franchise.short && auctionState?.current_player) {
          const wonPlayer: Player = {
            player_id: String(auctionState.current_player.id || auctionState.current_player.player_id),
            name: auctionState.current_player.name,
            role: auctionState.current_player.role,
            nationality: auctionState.current_player.nationality,
            is_overseas: auctionState.current_player.is_overseas,
            base_price: auctionState.current_player.base_price,
            predicted_price: soldAmt,
            Power_Index: auctionState.current_player.power_index,
            is_retained: false,
            statsSummary: `Acquired in ${auctionMode.toUpperCase()} Auction for ₹${soldAmt} Cr`,
          };
          onPlayerWon(wonPlayer);
        }

        setTimeout(() => {
          setSoldMessage(null);
          setAuctionState(data);
        }, 2200);
      } else {
        setAuctionState(data);
      }
    } catch (err) {
      console.error('Action failed:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRtmDecision = async (exercise: boolean, raisedBid?: number) => {
    setActionLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/auction/rtm-decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exercise, raised_bid: raisedBid }),
      });
      const data = await res.json();
      setRtmFeedback(exercise ? 'RTM Successfully Exercised! Player retained.' : 'RTM Declined.');
      setTimeout(() => setRtmFeedback(null), 3500);

      if (data.status === 'sold' && data.current_bidder === franchise.short && auctionState?.current_player) {
        const wonPlayer: Player = {
          player_id: String(auctionState.current_player.id || auctionState.current_player.player_id),
          name: auctionState.current_player.name,
          role: auctionState.current_player.role,
          nationality: auctionState.current_player.nationality,
          is_overseas: auctionState.current_player.is_overseas,
          base_price: auctionState.current_player.base_price,
          predicted_price: data.current_bid,
          Power_Index: auctionState.current_player.power_index,
          is_retained: true,
          statsSummary: `Retained via Right-to-Match (RTM) Card for ₹${data.current_bid} Cr`,
        };
        onPlayerWon(wonPlayer);
      }

      setAuctionState(data);
    } catch (err) {
      console.error('RTM decision error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleNominatePlan = async (playerName: string, basePrice: number, role: string) => {
    setActionLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/auction/nominate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: playerName,
          role: role,
          base_price: basePrice,
        }),
      });
      const data = await res.json();
      setAuctionState(data);
    } catch (err) {
      console.error('Failed to nominate plan:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'BAT': return 'bg-blue-500/20 text-blue-400 border-blue-500/30 font-bold';
      case 'BOWL': return 'bg-red-500/20 text-red-400 border-red-500/30 font-bold';
      case 'AR': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30 font-bold';
      case 'WK': return 'bg-purple-500/20 text-purple-400 border-purple-500/30 font-bold';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30 font-bold';
    }
  };

  if (!auctionState) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-xs text-gray-400">
        <Gavel size={32} className="text-gray-600 mb-2 animate-bounce" />
        <p>Connecting to Live Multi-Agent Auction Floor...</p>
      </div>
    );
  }

  const p = auctionState.current_player;

  return (
    <div className="flex-1 flex flex-col justify-between overflow-hidden relative">
      
      {/* SOLD BANNER POPUP OVERLAY */}
      {soldMessage && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in pointer-events-none rounded-2xl">
          <div className="text-center p-6 transform scale-110">
            <div className={`text-3xl font-black italic tracking-wider drop-shadow-xl ${
              soldMessage.team === 'UNSOLD' ? 'text-rose-500' : 'text-amber-400'
            }`}>
              {soldMessage.team === 'UNSOLD' ? 'UNSOLD' : '🔨 SOLD!'}
            </div>
            {soldMessage.team !== 'UNSOLD' && (
              <div className="mt-2 text-white">
                <div className="text-lg font-bold">To {soldMessage.team}</div>
                <div className="text-2xl font-mono text-emerald-400 font-black mt-1">₹{soldMessage.amount.toFixed(2)} Cr</div>
                {soldMessage.team === franchise.short && (
                  <div className="text-[11px] text-emerald-300 font-bold mt-2 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/40 inline-block">
                    ✓ Added to your Squad War Room!
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TOP HEADER & AUCTION MODE TOGGLE */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 shrink-0 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Gavel size={15} />
          </div>
          <div>
            <h3 className="text-xs font-black text-white font-sans uppercase tracking-wide flex items-center gap-1.5">
              <span>Live Auction Stage</span>
              <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold ${
                auctionMode === 'mega' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}>
                {auctionMode.toUpperCase()}
              </span>
            </h3>
            <span className="text-[10px] text-gray-400 font-mono">
              Purse: ₹{auctionState.my_budget.toFixed(1)} Cr {auctionMode === 'mega' ? `• 🎯 ${auctionState.my_rtm_cards || 0} RTMs` : ''}
            </span>
          </div>
        </div>

        {/* Mini vs Mega Mode Toggle Button Group */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => startAuction('mini')}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
              auctionMode === 'mini'
                ? 'bg-emerald-500/30 text-emerald-300 border-emerald-400 shadow-sm'
                : 'bg-white/5 text-gray-400 border-white/10 hover:text-white'
            }`}
          >
            ⚡ Mini-Auction
          </button>

          <button
            onClick={() => setShowRetentionModal(true)}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer flex items-center gap-1 ${
              auctionMode === 'mega'
                ? 'bg-indigo-500/30 text-indigo-300 border-indigo-400 shadow-sm'
                : 'bg-white/5 text-gray-400 border-white/10 hover:text-white'
            }`}
            title="Configure BCCI Mega Auction Retentions and Slab Math"
          >
            <Settings size={10} />
            <span>🔥 Mega Auction (BCCI)</span>
          </button>
        </div>
      </div>

      {/* MAIN BIDDING ARENA */}
      <div className="flex-1 flex flex-col justify-between overflow-hidden space-y-2">
        {p ? (
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-white/10 relative overflow-hidden shadow-xl flex flex-col justify-between flex-1">
            
            {/* Player Banner */}
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                    <span className="text-base">{p.nationality === 'India' ? '🇮🇳' : '🌍'}</span>
                    <span className={`px-2 py-0.2 rounded text-[10px] border ${getRoleBadge(p.role)}`}>
                      {p.role}
                    </span>
                    {p.is_overseas && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] bg-sky-500/20 text-sky-300 font-bold border border-sky-500/30">
                        Overseas ✈️
                      </span>
                    )}
                    {p.former_team && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                        Ex-{p.former_team} (RTM Eligible)
                      </span>
                    )}
                    <NOCRiskBadge name={p.name} nationality={p.nationality} isOverseas={p.is_overseas} />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white font-sans tracking-tight">
                    {p.name}
                  </h2>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[9px] text-gray-400 block uppercase font-mono">Power Index</span>
                  <span className="text-lg font-black font-mono text-amber-400 flex items-center justify-end gap-1">
                    <Zap size={13} className="fill-amber-400" /> {p.power_index}
                  </span>
                </div>
              </div>

              {/* Unified Clean Auction HUD */}
              <div className="p-3 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-1.5 mb-2">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-gray-400 block">Current Hammer Bid</span>
                    <span className="text-2xl font-black font-mono text-emerald-400 tracking-tight">
                      ₹{auctionState.current_bid.toFixed(2)} Cr
                    </span>
                    <span className="text-[10px] text-gray-500 font-mono ml-2">Base: ₹{p.base_price.toFixed(1)} Cr</span>
                  </div>

                  <div className="text-right">
                    <span className="text-[9px] uppercase font-bold text-gray-400 block">Holding Bidder</span>
                    <span className="inline-block font-black font-mono px-2 py-0.5 rounded-lg bg-white/10 text-white text-xs mt-0.5">
                      {auctionState.current_bidder ? `👑 ${auctionState.current_bidder}` : 'Awaiting Bid'}
                    </span>
                  </div>
                </div>

                {/* AI Valuation & Live Commentary */}
                <div className="pt-1.5 border-t border-white/5 flex flex-wrap items-center justify-between gap-1 text-xs">
                  {p.predicted_hammer_price && (
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <span className="text-indigo-300 font-bold">🧠 AI Target:</span>
                      <span className="font-mono text-white font-bold">₹{p.predicted_hammer_price} Cr</span>
                      <span className={`px-1 rounded text-[8px] font-bold border ${
                        auctionState.current_bid <= p.predicted_hammer_price 
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      }`}>
                        {auctionState.current_bid <= p.predicted_hammer_price ? 'Value Steal' : 'Premium'}
                      </span>
                    </div>
                  )}

                  {auctionState.current_bidder_rationale && (
                    <div className="text-[9px] text-amber-300/80 italic truncate max-w-[240px]">
                      &ldquo;{auctionState.current_bidder_rationale}&rdquo;
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* RTM DECISION PROMPT (If Right to Match Situation is Active) */}
            {auctionState.rtm_active && (
              <div className="p-3 rounded-2xl bg-gradient-to-r from-purple-950 to-indigo-950 border border-purple-400/50 my-2 animate-fade-in shadow-2xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black uppercase text-purple-300 flex items-center gap-1.5 font-mono">
                    <Target size={14} className="text-purple-400 animate-spin" />
                    Right to Match (RTM) Triggered!
                  </span>
                  <span className="text-[10px] font-mono text-amber-300 font-bold">
                    {auctionState.rtm_info?.former_team === franchise.short ? `Your Cards: ${auctionState.my_rtm_cards}` : ''}
                  </span>
                </div>
                <p className="text-xs text-white font-bold mb-2">
                  {auctionState.rtm_info?.prompt}
                </p>

                {auctionState.rtm_info?.former_team === franchise.short ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRtmDecision(true)}
                      disabled={actionLoading}
                      className="flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-emerald-500 hover:bg-emerald-400 text-black cursor-pointer transition-transform hover:scale-[1.02]"
                    >
                      🎯 Match ₹{auctionState.rtm_info?.current_bid} Cr (Use 1 RTM)
                    </button>
                    <button
                      onClick={() => handleRtmDecision(false)}
                      disabled={actionLoading}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/15 text-gray-300 hover:text-white cursor-pointer"
                    >
                      Decline
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRtmDecision(false, auctionState.current_bid + 1.0)}
                      disabled={actionLoading}
                      className="flex-1 py-2 rounded-xl text-xs font-black uppercase bg-amber-500 hover:bg-amber-400 text-black cursor-pointer"
                    >
                      ⚡ Raise Bid to ₹{(auctionState.current_bid + 1.0).toFixed(1)} Cr (Final Step)
                    </button>
                    <button
                      onClick={() => handleRtmDecision(false)}
                      disabled={actionLoading}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/15 text-gray-300 hover:text-white cursor-pointer"
                    >
                      Concede to {auctionState.rtm_info?.former_team}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* BID & PASS BUTTONS */}
            {!auctionState.rtm_active && (
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleAction('pass')}
                  disabled={actionLoading || !!soldMessage}
                  className="py-2.5 rounded-xl font-bold text-xs uppercase border border-white/10 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white cursor-pointer transition-colors disabled:opacity-40 flex items-center justify-center gap-1.5"
                >
                  <SkipForward size={14} />
                  <span>Pass</span>
                </button>

                <button
                  onClick={() => handleAction('bid')}
                  disabled={actionLoading || !!soldMessage || auctionState.current_bidder === franchise.short}
                  className={`col-span-2 py-2.5 rounded-xl font-sans text-xs font-black uppercase tracking-wider transition-all transform flex items-center justify-center gap-1.5 cursor-pointer shadow-lg disabled:opacity-40 ${
                    auctionState.current_bidder === franchise.short
                      ? 'bg-slate-800 text-gray-400 border border-slate-700 cursor-not-allowed'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-black hover:scale-[1.01]'
                  }`}
                >
                  <Gavel size={14} className="fill-current" />
                  <span>
                    {auctionState.current_bidder === franchise.short
                      ? 'Holding Highest Bid ✓'
                      : actionLoading
                      ? 'Bidding...'
                      : `BID NOW (Raise Bid)`}
                  </span>
                </button>
              </div>
            )}

          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-xs text-gray-500 border border-dashed border-white/10 rounded-2xl">
            <TrophyIcon />
            <h4 className="text-base font-black text-white mt-2">Auction Concluded!</h4>
            <p className="mt-1">All available players have walked under the gavel.</p>
            <button
              onClick={() => startAuction(auctionMode)}
              className="mt-3 px-4 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/15 text-white cursor-pointer"
            >
              Reset Auction Floor
            </button>
          </div>
        )}

        {/* Collapsible Strategy Fallback Tree */}
        <FallbackTreeDrawer
          currentBid={auctionState.current_bid}
          currentPlayer={p ? {
            player_id: String(p.id || p.player_id),
            name: p.name,
            role: p.role,
            base_price: p.base_price,
            Power_Index: p.power_index,
            is_overseas: p.is_overseas
          } : null}
          onNominatePlan={handleNominatePlan}
        />
      </div>

      {/* Mega Auction Retention Modal */}
      <MegaAuctionRetentionModal
        franchise={franchise}
        isOpen={showRetentionModal}
        onClose={() => setShowRetentionModal(false)}
        onConfirmMegaStart={(startingPurse, rtmCards) => {
          startAuction('mega', startingPurse, rtmCards);
        }}
      />

    </div>
  );
}

function TrophyIcon() {
  return (
    <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center">
      <Zap size={20} />
    </div>
  );
}
