'use client';

import { useState, useMemo, useEffect } from 'react';
import { 
  Search, Lock, Unlock, Zap, AlertCircle, CheckCircle2, MapPin, 
  Trophy, Shield, Users, RefreshCw, Flame, ExternalLink, ChevronRight, Eye, Sparkles,
  Share2, Swords, BrainCircuit, TrendingUp, Activity, Gavel, Target, ChevronDown, X
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { getStadiumForTeam } from '../../data/stadiums';
import { getFranchise, IPL_FRANCHISES, RELEASED_AUCTION_POOL, FranchiseData, ReleasedPlayer, IPLPlayer } from '../../data/franchises';
import { usePlayerData, Player } from '../../lib/usePlayerData';
import SquadExportModal from '../../components/SquadExportModal';
import HeadToHeadSimulator from '../../components/HeadToHeadSimulator';
import IntegratedAuctionStage from '../../components/IntegratedAuctionStage';
import TacticalMatchupModal from '../../components/TacticalMatchupModal';
import BallByBallMatchSimulator from '../../components/BallByBallMatchSimulator';
import MultiplayerAuctionModal from '../../components/MultiplayerAuctionModal';
import DraftPersistenceModal from '../../components/DraftPersistenceModal';
import NOCRiskBadge from '../../components/NOCRiskBadge';
import AutoSyncIndicator from '../../components/AutoSyncIndicator';
import InternationalScheduleModal from '../../components/InternationalScheduleModal';
import MegaAuctionRetentionModal from '../../components/MegaAuctionRetentionModal';
import Link from 'next/link';

export default function SquadBuilderPage() {
  const { theme, setTheme, mySquad: squad, setMySquad: setSquad, load2026Squad } = useStore();
  const { players: allDbPlayers, loading: playersLoading } = usePlayerData();
  const currentFranchise = getFranchise(theme);
  const stadium = getStadiumForTeam(theme);

  const [activeView, setActiveView] = useState<'live-auction' | 'auction-pool' | 'released-players' | 'rival-teams'>('live-auction');
  const [selectedRivalId, setSelectedRivalId] = useState<string>('csk');
  const [lockedIds, setLockedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [optimizing, setOptimizing] = useState(false);
  const [optimizerMsg, setOptimizerMsg] = useState<string | null>(null);

  // Modals & Dedicated Hubs
  const [showMatchArenaHub, setShowMatchArenaHub] = useState(false);
  const [showStrategyHub, setShowStrategyHub] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showBattleModal, setShowBattleModal] = useState(false);
  const [showMatchupModal, setShowMatchupModal] = useState(false);
  const [showCricsheetSimModal, setShowCricsheetSimModal] = useState(false);
  const [showMultiplayerModal, setShowMultiplayerModal] = useState(false);
  const [showDraftsModal, setShowDraftsModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showRetentionModal, setShowRetentionModal] = useState(false);
  const [auctionMode, setAuctionMode] = useState<'mini' | 'mega'>('mini');
  const [megaPurse, setMegaPurse] = useState<number>(83.0);
  const [megaRtmCards, setMegaRtmCards] = useState<number>(3);
  const [optimizationTarget, setOptimizationTarget] = useState<'power_index' | 'expected_points' | 'value_for_money'>('expected_points');
  const [syncingPipeline, setSyncingPipeline] = useState(false);
  const [pipelineMsg, setPipelineMsg] = useState<string | null>(null);

  // Auto-sync with official 2026 squad if state has stale legacy 3-player retention
  useEffect(() => {
    if (!squad || squad.length < 12) {
      load2026Squad(theme);
    }
  }, [theme, squad, load2026Squad]);

  // Total Salary Cap for IPL 2026 is ₹125.0 Cr
  const MAX_BUDGET = currentFranchise.totalPurse || 125.0;

  // Calculate budget and counts
  const budgetUsed = squad.reduce((sum, p) => sum + (p.predicted_price || p.base_price || 0), 0);
  const budgetRemaining = Math.max(0, MAX_BUDGET - budgetUsed);
  const overseasCount = squad.filter(p => p.is_overseas).length;
  const wkCount = squad.filter(p => p.role === 'WK').length;
  const batCount = squad.filter(p => p.role === 'BAT').length;
  const bowlCount = squad.filter(p => p.role === 'BOWL').length;
  const arCount = squad.filter(p => p.role === 'AR').length;

  // Multi-dimensional Squad Score calculation for 2026
  const squadScore = useMemo(() => {
    if (squad.length === 0) return { overall: 0, batting: 0, bowling: 0, balance: 0 };
    
    const avgPI = squad.reduce((sum, p) => sum + (Number(p.Power_Index) || 75), 0) / squad.length;
    const bats = squad.filter(p => p.role === 'BAT' || p.role === 'WK');
    const bowls = squad.filter(p => p.role === 'BOWL' || p.role === 'AR');

    const batPower = bats.length > 0 ? (bats.reduce((sum, p) => sum + Number(p.Power_Index || 75), 0) / bats.length) : 60;
    const bowlPower = bowls.length > 0 ? (bowls.reduce((sum, p) => sum + Number(p.Power_Index || 75), 0) / bowls.length) : 60;
    
    let balancePoints = 55;
    if (wkCount >= 1) balancePoints += 15;
    if (wkCount >= 2) balancePoints += 10;
    if (batCount >= 5) balancePoints += 10;
    if (bowlCount >= 5) balancePoints += 10;

    const overall = Math.min(99, Math.round((avgPI * 0.6) + (balancePoints * 0.2) + ((Math.min(25, squad.length) / 25) * 20)));

    return {
      overall,
      batting: Math.min(99, Math.round(batPower)),
      bowling: Math.min(99, Math.round(bowlPower)),
      balance: Math.min(99, balancePoints)
    };
  }, [squad, wkCount, batCount, bowlCount]);

  // Filter available auction pool
  const filteredAuctionPlayers = useMemo(() => {
    return allDbPlayers.filter(p => {
      // Must not already be in squad
      const inSquad = squad.some(sp => sp.name.toLowerCase() === p.name.toLowerCase() || sp.player_id === p.player_id);
      if (inSquad) return false;

      // Filter search & role
      const matchesSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
      const matchesRole = roleFilter === 'All' || p.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [allDbPlayers, squad, search, roleFilter]);

  const handleAdd = (player: Player) => {
    if (squad.length >= 25) {
      setOptimizerMsg('Squad Limit Reached: Max 25 players allowed in squad.');
      return;
    }
    const cost = player.predicted_price || player.base_price;
    if (budgetRemaining < cost) {
      setOptimizerMsg(`Budget Exceeded: ₹${cost.toFixed(2)} Cr required, but only ₹${budgetRemaining.toFixed(2)} Cr remaining.`);
      return;
    }
    if (!squad.some(p => p.player_id === player.player_id || p.name.toLowerCase() === player.name.toLowerCase())) {
      setSquad([...squad, player]);
    }
  };

  const handleAddReleased = (rp: ReleasedPlayer) => {
    if (squad.length >= 25) return;
    const playerObj: Player = {
      player_id: `rel_${rp.name.toLowerCase().replace(/\s+/g, '_')}`,
      name: rp.name,
      role: rp.role,
      nationality: rp.is_overseas ? 'Overseas' : 'Indian',
      is_overseas: rp.is_overseas,
      base_price: rp.basePrice,
      predicted_price: rp.predictedAuctionPrice,
      Power_Index: rp.powerIndex,
      statsSummary: rp.reason
    };
    handleAdd(playerObj);
  };

  const handleRemove = (player: Player) => {
    setSquad(squad.filter(p => p.player_id !== player.player_id && p.name !== player.name));
    const newLocked = new Set(lockedIds);
    newLocked.delete(player.player_id);
    setLockedIds(newLocked);
  };

  const toggleLock = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const newLocked = new Set(lockedIds);
    if (newLocked.has(id)) newLocked.delete(id);
    else newLocked.add(id);
    setLockedIds(newLocked);
  };

  const handleNominateToHammer = async (player: any) => {
    try {
      await fetch('http://localhost:8000/api/auction/nominate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player_id: player.player_id || player.id,
          name: player.name,
          role: player.role,
          base_price: player.base_price || player.basePrice || 1.0,
          Power_Index: player.Power_Index || player.powerIndex || 75.0,
          is_overseas: player.is_overseas
        })
      });
      setActiveView('live-auction');
      setOptimizerMsg(`🔨 ${player.name} is now on the Live Auction Hammer Stage!`);
    } catch (e) {
      console.error(e);
      setActiveView('live-auction');
    }
  };

  const handlePlayerWonInAuction = (wonPlayer: Player) => {
    if (!squad.some(p => p.player_id === wonPlayer.player_id || p.name === wonPlayer.name)) {
      setSquad([...squad, wonPlayer]);
      setOptimizerMsg(`🎉 Sold under the hammer! ${wonPlayer.name} has joined ${currentFranchise.name} for ₹${wonPlayer.predicted_price} Cr!`);
    }
  };

  const handleSyncPipeline = async () => {
    setSyncingPipeline(true);
    setPipelineMsg(null);
    try {
      const res = await fetch('http://localhost:8000/api/pipeline/sync-form', { method: 'POST' });
      const data = await res.json();
      if (data.status === 'success') {
        setPipelineMsg(`Live Form Recalibrated! Updated ${data.players_updated} players with latest matchday momentum.`);
        setTimeout(() => setPipelineMsg(null), 5000);
      }
    } catch (e) {
      setPipelineMsg('Pipeline sync offline.');
    } finally {
      setSyncingPipeline(false);
    }
  };

  const handleOptimize = async () => {
    setOptimizing(true);
    setOptimizerMsg(null);

    const budgetToUse = budgetRemaining > 0 ? budgetRemaining : 20.0;
    const idsToLock = Array.from(lockedIds);

    try {
      const res = await fetch('http://localhost:8000/api/optimize/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          budget: budgetToUse,
          locked_players: idsToLock,
          optimization_target: optimizationTarget,
          venue: stadium.city.toLowerCase()
        })
      });
      const data = await res.json();
      if (data.status === 'success' && data.players) {
        const normalizedOptimized = data.players.map((p: any) => ({
          player_id: String(p.player_id || p.id),
          name: p.name,
          role: p.role,
          nationality: p.nationality,
          is_overseas: p.is_overseas,
          base_price: Number(p.base_price || 0),
          predicted_price: Number(p.predicted_price || p.base_price || 0),
          Power_Index: Number(p.Power_Index || 0),
          expected_points: p.expected_matchday_points,
          value_for_money: p.value_for_money,
          valuation_tier: p.valuation_tier,
          tier_color: p.tier_color
        }));

        // Keep all currently in squad that are retained or locked, and add optimal picks to fill 25 slots
        const newSquadMap = new Map<string, Player>();
        squad.forEach(p => newSquadMap.set(p.player_id, p));

        normalizedOptimized.forEach((p: Player) => {
          if (newSquadMap.size < 25 && !newSquadMap.has(p.player_id)) {
            newSquadMap.set(p.player_id, p);
          }
        });

        setSquad(Array.from(newSquadMap.values()));
        const targetLabel = optimizationTarget === 'expected_points' 
          ? 'AI Projected Points' 
          : (optimizationTarget === 'value_for_money' ? 'Moneyball ROI' : 'Overall Power');
        setOptimizerMsg(`Successfully Optimized for [${targetLabel}]! Completed 2026 squad to ${newSquadMap.size} players within the salary cap.`);
      } else {
        setOptimizerMsg(data.message || 'Optimization solver failed.');
      }
    } catch (err) {
      console.error(err);
      setOptimizerMsg('Failed to run LP optimizer backend.');
    } finally {
      setOptimizing(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'BAT': return <span className="px-2 py-0.5 rounded text-[11px] bg-blue-500/20 text-blue-400 border border-blue-500/30 font-bold">BAT</span>;
      case 'BOWL': return <span className="px-2 py-0.5 rounded text-[11px] bg-red-500/20 text-red-400 border border-red-500/30 font-bold">BOWL</span>;
      case 'AR': return <span className="px-2 py-0.5 rounded text-[11px] bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 font-bold">AR</span>;
      case 'WK': return <span className="px-2 py-0.5 rounded text-[11px] bg-purple-500/20 text-purple-400 border border-purple-500/30 font-bold">WK</span>;
      default: return <span className="px-2 py-0.5 rounded text-[11px] bg-gray-500/20 text-gray-400 border border-gray-500/30 font-bold">{role}</span>;
    }
  };

  const selectedRivalFranchise = IPL_FRANCHISES[selectedRivalId] || IPL_FRANCHISES.csk;

  return (
    <div className="min-h-screen text-slate-100 px-3 sm:px-5 pb-6 pt-20 font-sans max-w-full overflow-x-hidden">
      
      {/* ─── CONTINUOUS LIVE PIPELINE & INTERNATIONAL SYNC BAR ─── */}
      <div className="max-w-7xl mx-auto">
        <AutoSyncIndicator onOpenScheduleModal={() => setShowScheduleModal(true)} />
      </div>

      {/* ─── PHASE 1: Franchise Command & Matchday Fortress ─── */}
      <div className="max-w-7xl mx-auto mb-4">
        <div 
          className="p-4 sm:p-5 rounded-3xl border border-white/10 bg-slate-950/90 backdrop-blur-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-2xl relative"
          style={{ borderLeft: `6px solid ${currentFranchise.color}` }}
        >
          {/* Franchise & Fortress Identity */}
          <div className="flex items-center gap-4">
            <div 
              className="w-13 h-13 rounded-2xl flex items-center justify-center text-3xl font-bold border shrink-0 shadow-lg"
              style={{
                backgroundColor: `${currentFranchise.color}25`,
                borderColor: `${currentFranchise.color}70`,
                boxShadow: `0 0 20px ${currentFranchise.color}30`
              }}
            >
              {currentFranchise.emoji}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-sans text-xl sm:text-2xl font-black text-white tracking-tight uppercase">
                  {currentFranchise.name}
                </span>
                <span className="text-xs px-2 py-0.5 rounded font-black text-black" style={{ backgroundColor: currentFranchise.color }}>
                  {currentFranchise.short}
                </span>
                
                {/* Mini vs Mega Mode Badge Toggle */}
                <div className="flex items-center bg-black/50 border border-white/10 rounded-xl p-0.5 ml-1">
                  <button
                    onClick={() => {
                      setAuctionMode('mini');
                      load2026Squad(theme);
                    }}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                      auctionMode === 'mini'
                        ? 'bg-emerald-500 text-black font-black shadow-md'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    ⚡ Mini (2026)
                  </button>
                  <button
                    onClick={() => setShowRetentionModal(true)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all flex items-center gap-1 ${
                      auctionMode === 'mega'
                        ? 'bg-amber-400 text-black font-black shadow-md'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    🔥 Mega (BCCI)
                  </button>
                </div>
              </div>

              <div className="text-xs text-gray-300 flex flex-wrap items-center gap-2.5 mt-1">
                <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                  <MapPin size={12} /> {stadium.name} ({stadium.city})
                </span>
                <span>•</span>
                <span>Pitch: <strong className="text-amber-400">{stadium.pitchType}</strong></span>
                <span>•</span>
                {auctionMode === 'mini' ? (
                  <>
                    <span>Retained Spend: <strong className="text-white font-mono">₹{currentFranchise.retainedSpend2026} Cr</strong></span>
                    <span>•</span>
                    <span>Mini-Purse: <strong className="text-emerald-400 font-mono">₹{currentFranchise.miniAuctionPurse2026} Cr</strong></span>
                  </>
                ) : (
                  <>
                    <span>Mega Cap: <strong className="text-white font-mono">₹120.0 Cr</strong></span>
                    <span>•</span>
                    <span>Mega Purse: <strong className="text-amber-400 font-mono">₹{megaPurse.toFixed(1)} Cr</strong></span>
                    <span>•</span>
                    <span>RTM Cards: <strong className="text-purple-400 font-mono">🎯 {megaRtmCards} Left</strong></span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Primary Action Buttons (Zero-clipping clean modal triggers) */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Match Arena Trigger */}
            <button
              onClick={() => setShowMatchArenaHub(true)}
              className="px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all border bg-gradient-to-r from-rose-600/30 to-rose-500/20 text-rose-300 border-rose-500/50 hover:bg-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.2)] hover:scale-[1.02]"
              title="Open Match Arena to simulate matches against rival fortresses"
            >
              <Swords size={14} className="text-rose-400" />
              <span>Match Arena (Play)</span>
            </button>

            {/* Strategy Tools Hub Trigger */}
            <button
              onClick={() => setShowStrategyHub(true)}
              className="px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all border bg-gradient-to-r from-purple-600/30 to-purple-500/20 text-purple-300 border-purple-500/50 hover:bg-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.2)] hover:scale-[1.02]"
              title="Open Hawkeye Matchups, Multiplayer Room, and Draft Archives"
            >
              <Target size={14} className="text-purple-400" />
              <span>Strategy Tools</span>
            </button>

            {/* Export Card */}
            <button
              onClick={() => setShowExportModal(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all border bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border-white/10"
              title="Export high-res 16:9 matchday squad card"
            >
              <Share2 size={13} />
              <span>Export</span>
            </button>

            {/* Reset Squad */}
            <button
              onClick={() => load2026Squad(theme)}
              className="px-2.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-all text-gray-400 hover:text-white hover:bg-white/5"
              title="Reset to 2026 official roster"
            >
              <RefreshCw size={12} />
              <span>Reset</span>
            </button>

            {/* Switch Franchise */}
            <Link
              href="/select-team"
              className="px-3.5 py-2 rounded-xl text-xs font-black border text-black flex items-center gap-1 cursor-pointer transition-transform hover:scale-105 shadow-md ml-1"
              style={{ backgroundColor: currentFranchise.color }}
            >
              <span>Switch Team</span>
              <ChevronRight size={13} />
            </Link>
          </div>
        </div>

        {/* Live Pipeline Form Recalibration Ticker */}
        {pipelineMsg && (
          <div className="mt-2.5 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between gap-2 animate-fade-in">
            <div className="flex items-center gap-2">
              <Activity size={15} className="text-amber-400 shrink-0" />
              <span>{pipelineMsg}</span>
            </div>
            <span className="text-[10px] text-gray-400 font-mono">AUTOMATED PIPELINE ACTIVE</span>
          </div>
        )}
      </div>

      {/* ─── PHASE 2: Franchise Vitals & Capacity Dashboard ─── */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Vitals Card 1: Remaining Purse */}
          <div className="p-4 rounded-2xl border border-white/10 bg-slate-950/85 backdrop-blur-md shadow-xl flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                {auctionMode === 'mega' ? 'BCCI Mega-Auction Purse' : '2026 Mini-Auction Purse'}
              </span>
              <span className={`text-xs font-mono font-bold ${auctionMode === 'mega' ? 'text-amber-400' : 'text-emerald-400'}`}>
                AVAILABLE
              </span>
            </div>
            <div className={`font-sans text-3xl font-black tracking-tight mt-1 ${auctionMode === 'mega' ? 'text-amber-400' : 'text-emerald-400'}`}>
              ₹{(auctionMode === 'mega' ? megaPurse : budgetRemaining).toFixed(2)} <span className="text-sm font-bold text-gray-300">Cr</span>
            </div>
            <div className="text-[11px] text-gray-400 mt-2 pt-2 border-t border-white/5 flex justify-between">
              <span>{auctionMode === 'mega' ? 'BCCI Rebuild' : `Spend: ₹${budgetUsed.toFixed(1)} Cr`}</span>
              <span className="font-mono">Cap: ₹{auctionMode === 'mega' ? 120 : MAX_BUDGET} Cr</span>
            </div>
          </div>

          {/* Vitals Card 2: Squad Slots */}
          <div className="p-4 rounded-2xl border border-white/10 bg-slate-950/85 backdrop-blur-md shadow-xl flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                Squad Roster Slots
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${squad.length === 25 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                {25 - squad.length} SLOTS OPEN
              </span>
            </div>
            <div className="font-sans text-3xl font-black text-white tracking-tight mt-1">
              {squad.length} <span className="text-base text-gray-500 font-bold">/ 25 Max</span>
            </div>
            <div className="text-[11px] text-gray-400 mt-2 pt-2 border-t border-white/5 flex justify-between">
              <span>Min Required: 18</span>
              <span className="text-emerald-400 font-bold">Need: {25 - squad.length} to complete</span>
            </div>
          </div>

          {/* Vitals Card 3: Overseas Quota */}
          <div className="p-4 rounded-2xl border border-white/10 bg-slate-950/85 backdrop-blur-md shadow-xl flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                Overseas Player Quota
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${overseasCount >= 8 ? 'bg-rose-500/20 text-rose-300' : 'bg-sky-500/20 text-sky-300'}`}>
                {overseasCount >= 8 ? 'QUOTA FULL (8/8)' : `${8 - overseasCount} SLOTS LEFT`}
              </span>
            </div>
            <div className={`font-sans text-3xl font-black tracking-tight mt-1 ${overseasCount > 8 ? 'text-rose-400' : 'text-white'}`}>
              {overseasCount} <span className="text-base text-gray-500 font-bold">/ 8 Max</span>
            </div>
            <div className="text-[11px] text-gray-400 mt-2 pt-2 border-t border-white/5 flex justify-between">
              <span>BCCI Restriction</span>
              <span className={overseasCount >= 8 ? 'text-rose-400 font-bold' : 'text-gray-300'}>
                {overseasCount >= 8 ? 'No more overseas bids' : 'Eligible for overseas bids'}
              </span>
            </div>
          </div>

          {/* Vitals Card 4: Squad Power & Composition */}
          <div className="p-4 rounded-2xl border border-white/10 bg-slate-950/85 backdrop-blur-md shadow-xl flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                Squad Rating & Balance
              </span>
              <span className="text-xs font-bold" style={{ color: currentFranchise.color }}>
                POWER INDEX
              </span>
            </div>
            <div className="font-sans text-3xl font-black text-white tracking-tight mt-1 flex items-baseline gap-2">
              <span style={{ color: currentFranchise.color }}>{squadScore.overall}</span>
              <span className="text-xs text-gray-400 font-normal">
                (Bat: <strong className="text-blue-400">{squadScore.batting}</strong> • Bowl: <strong className="text-red-400">{squadScore.bowling}</strong>)
              </span>
            </div>
            <div className="text-[10px] text-gray-400 mt-2 pt-2 border-t border-white/5 flex justify-between font-mono">
              <span className={wkCount >= 2 ? 'text-emerald-400' : 'text-amber-400'}>{wkCount} WK</span>
              <span className={batCount >= 6 ? 'text-emerald-400' : 'text-amber-400'}>{batCount} BAT</span>
              <span className={bowlCount >= 7 ? 'text-emerald-400' : 'text-amber-400'}>{bowlCount} BOWL</span>
              <span className={arCount >= 4 ? 'text-emerald-400' : 'text-amber-400'}>{arCount} AR</span>
            </div>
          </div>

        </div>
      </div>

      {/* ─── Two-Column War Room Arena (Phase 3 & Phase 4) ─── */}
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-4 mb-4">
        
        {/* ─── Left Column: Phase 3: Live Auction Hammer & Draft Pool ─── */}
        <div className="w-full lg:w-1/2 rounded-3xl border border-white/10 bg-slate-950/75 backdrop-blur-xl p-3.5 sm:p-4 flex flex-col h-[calc(100vh-270px)] min-h-[520px] max-h-[640px] shadow-2xl overflow-hidden">
          
          {/* Phase 3 Header Banner */}
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5 font-sans">
              <Gavel size={14} className="text-amber-400" /> Phase 3: Live Auction Hammer & Draft Pool
            </span>
            <span className="text-[10px] text-emerald-400 font-mono font-bold">LIVE GAVEL READY</span>
          </div>
          
          {/* Four View Selector Tabs */}
          <div className="flex border-b border-white/10 mb-4 pb-2 gap-1.5 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveView('live-auction')}
              className={`py-2 px-3.5 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeView === 'live-auction'
                  ? 'bg-amber-500/20 text-amber-300 shadow-md border border-amber-500/50'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Gavel size={14} className="text-amber-400" />
              Live Auction Hammer Stage
            </button>

            <button
              onClick={() => setActiveView('auction-pool')}
              className={`py-2 px-3.5 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeView === 'auction-pool'
                  ? 'bg-white/15 text-white shadow-md border border-white/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Zap size={14} className="text-amber-400" />
              Draft Pool ({filteredAuctionPlayers.length})
            </button>

            <button
              onClick={() => setActiveView('released-players')}
              className={`py-2 px-3.5 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeView === 'released-players'
                  ? 'bg-white/15 text-white shadow-md border border-white/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Flame size={14} className="text-orange-400" />
              Released Stars ({RELEASED_AUCTION_POOL.length})
            </button>

            <button
              onClick={() => setActiveView('rival-teams')}
              className={`py-2 px-3.5 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeView === 'rival-teams'
                  ? 'bg-white/15 text-white shadow-md border border-white/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Shield size={14} className="text-blue-400" />
              Rival Bots & Teams
            </button>
          </div>

          {/* ─── VIEW 0: Live Auction Hammer Stage ─── */}
          {activeView === 'live-auction' && (
            <IntegratedAuctionStage
              franchise={currentFranchise}
              remainingPurse={auctionMode === 'mega' ? megaPurse : budgetRemaining}
              onPlayerWon={handlePlayerWonInAuction}
              onModeSwitch={(mode) => setAuctionMode(mode)}
            />
          )}

          {/* ─── VIEW 1: Available Auction Pool ─── */}
          {activeView === 'auction-pool' && (
            <div className="flex flex-col flex-1 overflow-hidden">
              <div className="flex gap-2 mb-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input 
                    type="text" 
                    placeholder="Search players to buy with ₹18.5 Cr purse..." 
                    className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-[var(--accent-primary)] transition-colors text-white"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
                <select 
                  className="bg-slate-900/90 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[var(--accent-primary)] cursor-pointer"
                  value={roleFilter}
                  onChange={e => setRoleFilter(e.target.value)}
                >
                  <option value="All">All Roles</option>
                  <option value="BAT">Batters</option>
                  <option value="BOWL">Bowlers</option>
                  <option value="AR">All-Rounders</option>
                  <option value="WK">Wicket-Keepers</option>
                </select>
              </div>

              {/* Player list */}
              <div className="flex-1 overflow-y-auto pr-1 space-y-2">
                {playersLoading ? (
                  <div className="p-8 text-center text-xs text-gray-500">Loading 2026 Auction Pool...</div>
                ) : filteredAuctionPlayers.length === 0 ? (
                  <div className="p-8 text-center text-xs text-gray-500">No matching players in pool</div>
                ) : (
                  filteredAuctionPlayers.map(p => (
                    <div 
                      key={p.player_id}
                      onClick={() => handleAdd(p)}
                      className="p-3 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-800/80 hover:border-slate-600 transition-all cursor-pointer flex justify-between items-center group"
                    >
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="font-bold text-sm text-white flex items-center gap-1.5 group-hover:text-amber-300 transition-colors">
                            {p.name}
                            <span className="text-xs">{p.is_overseas ? '🌍' : '🇮🇳'}</span>
                            <NOCRiskBadge name={p.name} nationality={p.nationality} isOverseas={p.is_overseas} />
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                            {getRoleBadge(p.role)}
                            <span className="font-semibold text-gray-200">
                              ₹{p.predicted_price.toFixed(1)} Cr
                            </span>
                            <span className="text-gray-500 text-[10px]">
                              Base: ₹{p.base_price.toFixed(1)} Cr
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0 flex items-center gap-2">
                        <div className="hidden sm:block">
                          <div className="text-xs font-bold text-amber-400 font-mono">
                            PI {Number(p.Power_Index).toFixed(0)}
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleNominateToHammer(p);
                            }}
                            className="px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[10px] font-bold cursor-pointer transition-colors"
                            title="Nominate player directly to Live Auction Hammer"
                          >
                            🔨 Nominate
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAdd(p);
                            }}
                            className="px-2 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold cursor-pointer transition-colors"
                            title="Sign player directly"
                          >
                            + Sign
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ─── VIEW 2: Released Stars ─── */}
          {activeView === 'released-players' && (
            <div className="flex flex-col flex-1 overflow-hidden">
              <div className="mb-3 text-xs text-gray-300 leading-relaxed bg-amber-950/25 border border-amber-500/20 p-3 rounded-xl">
                <strong className="text-amber-300">Marquee Stars in Pool:</strong> Free-agent superstars available to sign. Click to nominate to live auction or sign directly!
              </div>

              <div className="flex-1 overflow-y-auto pr-1 space-y-2.5">
                {RELEASED_AUCTION_POOL.map((rp, i) => {
                  const inSquad = squad.some(sp => sp.name.toLowerCase() === rp.name.toLowerCase());
                  return (
                    <div
                      key={i}
                      className={`p-3 rounded-xl border transition-all ${
                        inSquad
                          ? 'border-emerald-500/40 bg-emerald-950/20 opacity-70'
                          : 'border-slate-800 bg-slate-900/50 hover:border-slate-600 hover:bg-slate-800/80'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-white">{rp.name}</h4>
                            <span className="text-xs">{rp.is_overseas ? '🌍' : '🇮🇳'}</span>
                            {getRoleBadge(rp.role)}
                          </div>
                          <span className="text-[10px] font-semibold text-gray-400 block mt-0.5">
                            Status: <strong className="text-gray-200">{rp.formerTeam}</strong>
                          </span>
                          <p className="text-[11px] text-gray-400 leading-relaxed mt-1">
                            {rp.reason}
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="font-display text-base font-bold text-amber-400">
                            ₹{rp.predictedAuctionPrice.toFixed(1)} Cr
                          </div>
                          <span className="text-[10px] text-gray-500 block">Base: ₹{rp.basePrice} Cr</span>

                          {inSquad ? (
                            <span className="text-[10px] font-bold text-emerald-400 mt-1 block">In Your Squad ✓</span>
                          ) : (
                            <div className="flex flex-col gap-1 mt-1">
                              <button
                                onClick={() => handleNominateToHammer({
                                  player_id: `rel_${rp.name.toLowerCase().replace(/\s+/g, '_')}`,
                                  name: rp.name,
                                  role: rp.role,
                                  base_price: rp.basePrice,
                                  Power_Index: rp.powerIndex,
                                  is_overseas: rp.is_overseas
                                })}
                                className="px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[10px] font-bold cursor-pointer transition-colors"
                              >
                                🔨 Nominate
                              </button>
                              <button
                                onClick={() => handleAddReleased(rp)}
                                className="px-2 py-0.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold cursor-pointer transition-colors"
                              >
                                + Sign
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ─── VIEW 3: Rival 2026 Teams ─── */}
          {activeView === 'rival-teams' && (
            <div className="flex flex-col flex-1 overflow-hidden">
              {/* Rival Team Pill Switcher */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none mb-3 shrink-0">
                {Object.values(IPL_FRANCHISES).map(f => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedRivalId(f.id)}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer border"
                    style={{
                      backgroundColor: selectedRivalId === f.id ? f.color : 'rgba(255,255,255,0.04)',
                      color: selectedRivalId === f.id ? '#000000' : '#9ca3af',
                      borderColor: selectedRivalId === f.id ? f.color : 'rgba(255,255,255,0.1)',
                    }}
                  >
                    {f.short}
                  </button>
                ))}
              </div>

              {/* Selected Rival Squad Snapshot */}
              <div className="flex-1 overflow-y-auto pr-1">
                <div 
                  className="p-4 rounded-2xl border border-white/10 bg-slate-900/70 mb-3"
                  style={{ borderTop: `3px solid ${selectedRivalFranchise.color}` }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-display text-xl font-bold text-white flex items-center gap-2">
                        <span>{selectedRivalFranchise.emoji}</span>
                        {selectedRivalFranchise.name}
                      </h4>
                      <div className="text-xs text-gray-400">
                        Fortress: <strong className="text-white">{selectedRivalFranchise.stadiumName}</strong>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-gray-400 block">2026 Mini-Purse</span>
                      <span className="font-display text-xl font-bold text-emerald-400">
                        ₹{selectedRivalFranchise.miniAuctionPurse2026} Cr
                      </span>
                    </div>
                  </div>

                  {/* 2026 Needs */}
                  <div className="mt-2 pt-2 border-t border-white/5">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">2026 Mini-Auction Needs:</span>
                    <div className="flex flex-wrap gap-1">
                      {selectedRivalFranchise.key2026AuctionNeeds.map((need, i) => (
                        <span key={i} className="px-2 py-0.5 rounded text-[10px] bg-white/5 text-gray-300 border border-white/5">
                          {need}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Rival Players List */}
                <h5 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                  Official 2026 Retained Squad ({selectedRivalFranchise.squad2026.length} Players)
                </h5>

                <div className="space-y-2 mb-4">
                  {selectedRivalFranchise.squad2026.map((p, idx) => (
                    <div key={p.player_id || idx} className="p-2.5 rounded-xl border border-slate-800 bg-slate-900/40 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-white flex items-center gap-1.5">
                          {p.name}
                          <span className="text-[10px]">{p.is_overseas ? '🌍' : '🇮🇳'}</span>
                          {getRoleBadge(p.role)}
                          <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-400/20 text-emerald-300 font-bold border border-emerald-400/30">
                            2026 Retained
                          </span>
                        </div>
                        {p.statsSummary && (
                          <span className="text-[10px] text-gray-500 block mt-0.5">{p.statsSummary}</span>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-bold text-white block">₹{p.price} Cr</span>
                        <span className="text-[10px] text-amber-400 font-mono">PI: {p.Power_Index}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Take over button */}
                <button
                  onClick={() => {
                    setTheme(selectedRivalFranchise.id);
                    load2026Squad(selectedRivalFranchise.id);
                  }}
                  className="w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 border border-white/15 hover:bg-white/10 text-white cursor-pointer shadow-lg"
                >
                  <Eye size={14} />
                  Take Over {selectedRivalFranchise.short} & Manage 2026 Squad
                </button>
              </div>
            </div>
          )}

        </div>

        {/* ─── Right Column: Phase 4: Your Active 2026 Squad War Room ─── */}
        <div className="w-full lg:w-1/2 rounded-3xl border border-white/10 bg-slate-950/75 backdrop-blur-xl p-3.5 sm:p-4 flex flex-col h-[calc(100vh-270px)] min-h-[520px] max-h-[640px] shadow-2xl overflow-hidden">
          
          {/* Phase 4 Header Banner */}
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
            <span className="text-[11px] font-black uppercase tracking-wider text-purple-400 flex items-center gap-1.5 font-sans">
              <Shield size={14} className="text-purple-400" /> Phase 4: Squad War Room & Moneyball Solver
            </span>
            <span className="text-[10px] text-gray-400 font-mono">Auto-Fill Solver Ready</span>
          </div>

          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-sans text-xl sm:text-2xl font-black text-white flex items-center gap-2 tracking-tight">
                <span>{currentFranchise.emoji}</span>
                {currentFranchise.short} 2026 ROSTER
              </h2>
              <span className="text-xs text-gray-400">
                {squad.length} / 25 Players on Roster ({25 - squad.length} Open Slots • ₹{budgetRemaining.toFixed(2)} Cr Purse Left)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => setSquad([])}
                className="text-xs text-red-400 hover:underline px-2 py-1 cursor-pointer"
              >
                Clear All
              </button>
              <button
                onClick={() => load2026Squad(theme)}
                className="text-xs text-emerald-400 hover:underline px-2 py-1 cursor-pointer font-semibold"
              >
                Reset 2026 Squad
              </button>
            </div>
          </div>

          {/* Squad Balance Check Badges */}
          <div className="grid grid-cols-4 gap-2 mb-3 p-3 rounded-2xl bg-slate-900/70 border border-white/5 text-center text-xs">
            <div className={`p-1.5 rounded-xl border ${wkCount >= 2 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-purple-500/10 border-purple-500/30 text-purple-300'}`}>
              <div className="text-[10px] uppercase font-bold text-gray-400">Wicket-Keepers</div>
              <div className="font-bold text-sm mt-0.5">{wkCount} / 2 Min</div>
            </div>

            <div className={`p-1.5 rounded-xl border ${batCount >= 6 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-blue-500/10 border-blue-500/30 text-blue-300'}`}>
              <div className="text-[10px] uppercase font-bold text-gray-400">Batters</div>
              <div className="font-bold text-sm mt-0.5">{batCount} / 6 Min</div>
            </div>

            <div className={`p-1.5 rounded-xl border ${bowlCount >= 7 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-300'}`}>
              <div className="text-[10px] uppercase font-bold text-gray-400">Bowlers</div>
              <div className="font-bold text-sm mt-0.5">{bowlCount} / 7 Min</div>
            </div>

            <div className={`p-1.5 rounded-xl border ${arCount >= 4 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-amber-500/10 border-amber-500/30 text-amber-300'}`}>
              <div className="text-[10px] uppercase font-bold text-gray-400">All-Rounders</div>
              <div className="font-bold text-sm mt-0.5">{arCount} / 4 Min</div>
            </div>
          </div>

          {/* Optimizer Message Notification */}
          {optimizerMsg && (
            <div className={`mb-3 p-3 rounded-xl border text-xs flex items-center gap-2 ${
              optimizerMsg.includes('Successfully')
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}>
              {optimizerMsg.includes('Successfully') ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{optimizerMsg}</span>
            </div>
          )}

          {/* Squad Roster Cards List */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-2 mb-4">
            {squad.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-xs text-gray-500 border border-dashed border-white/10 rounded-2xl p-8 text-center">
                <Shield size={36} className="text-gray-600 mb-2" />
                <p>Your squad is currently empty.</p>
                <button
                  onClick={() => load2026Squad(theme)}
                  className="mt-3 px-4 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/15 text-white cursor-pointer"
                >
                  Load {currentFranchise.short}&apos;s Official 2026 Squad ({currentFranchise.squad2026.length} Players)
                </button>
              </div>
            ) : (
              squad.map((p, index) => (
                <div 
                  key={p.player_id || index}
                  className="p-2.5 rounded-xl border border-slate-800/80 bg-slate-900/40 hover:bg-slate-850 hover:border-slate-700 transition-all flex justify-between items-center group"
                >
                  <div className="flex-1 cursor-pointer pr-2" onClick={() => handleRemove(p)} title="Click to remove from squad">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-white group-hover:text-amber-300 transition-colors">{p.name}</span>
                      <span className="text-xs">{p.is_overseas ? '🌍' : '🇮🇳'}</span>
                      {getRoleBadge(p.role)}
                      {p.is_retained !== false ? (
                        <span className="px-1.5 py-0.2 rounded text-[8px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Retained
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.2 rounded text-[8px] font-black uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-500/30">
                          Auction
                        </span>
                      )}
                      <span className="font-black text-xs text-emerald-400 font-mono ml-auto mr-2">
                        ₹{Number(p.predicted_price || p.base_price || 0).toFixed(2)} Cr
                      </span>
                    </div>

                    <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-1 flex-wrap">
                      <span className="font-mono text-gray-300">PI: <strong className="text-amber-400 font-bold">{Number(p.Power_Index || 75).toFixed(0)}</strong></span>
                      {p.expected_points && (
                        <span>• <span className="text-indigo-300 font-mono font-medium">{p.expected_points} pts</span></span>
                      )}
                      {p.valuation_tier && (
                        <span>• <span className="text-sky-300 font-medium">{p.valuation_tier.split(' ')[0]}</span></span>
                      )}
                      <NOCRiskBadge name={p.name} nationality={p.nationality} isOverseas={p.is_overseas} />
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button 
                      onClick={(e) => toggleLock(e, p.player_id)}
                      className={`p-1.5 rounded-lg transition-colors border cursor-pointer ${
                        lockedIds.has(p.player_id) 
                          ? 'bg-amber-400/20 text-amber-300 border-amber-400/40' 
                          : 'text-slate-600 border-transparent hover:bg-slate-800 hover:text-slate-400'
                      }`}
                      title={lockedIds.has(p.player_id) ? "Locked for Linear Optimizer" : "Lock player for Optimizer"}
                    >
                      {lockedIds.has(p.player_id) ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Optimization Strategy Switcher */}
          <div className="mb-3 p-2.5 rounded-2xl bg-slate-900 border border-white/5">
            <div className="flex items-center justify-between mb-1.5 px-1">
              <span className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1">
                <BrainCircuit size={12} className="text-amber-400" /> Optimization Model Strategy
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">PyTorch & PuLP Solver</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-xs">
              <button
                onClick={() => setOptimizationTarget('power_index')}
                className={`py-1.5 px-2 rounded-xl font-bold transition-all border cursor-pointer text-center ${
                  optimizationTarget === 'power_index'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                    : 'bg-slate-950/60 text-gray-400 border-transparent hover:text-white'
                }`}
              >
                ⚡ Overall Power
              </button>
              <button
                onClick={() => setOptimizationTarget('expected_points')}
                className={`py-1.5 px-2 rounded-xl font-bold transition-all border cursor-pointer text-center ${
                  optimizationTarget === 'expected_points'
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50'
                    : 'bg-slate-950/60 text-gray-400 border-transparent hover:text-white'
                }`}
              >
                🧠 AI Points
              </button>
              <button
                onClick={() => setOptimizationTarget('value_for_money')}
                className={`py-1.5 px-2 rounded-xl font-bold transition-all border cursor-pointer text-center ${
                  optimizationTarget === 'value_for_money'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                    : 'bg-slate-950/60 text-gray-400 border-transparent hover:text-white'
                }`}
              >
                💰 Moneyball ROI
              </button>
            </div>
          </div>

          {/* ─── Bottom Actions: PuLP LP Optimizer Button ─── */}
          <button
            onClick={() => handleOptimize()}
            disabled={optimizing}
            className="w-full py-3.5 rounded-2xl font-display text-base font-bold tracking-wider text-black flex items-center justify-center gap-2 transition-all transform hover:scale-[1.01] active:scale-[0.99] shadow-2xl cursor-pointer disabled:opacity-50"
            style={{
              backgroundColor: currentFranchise.color,
              boxShadow: `0 8px 30px ${currentFranchise.color}50`,
            }}
          >
            <Zap className="w-5 h-5 fill-current" />
            {optimizing ? 'Calculating Optimal Squad...' : `Auto-Fill 2026 Mini-Auction (Use ₹${budgetRemaining.toFixed(1)} Cr Purse)`}
          </button>

          <p className="text-[10px] text-slate-500 text-center mt-2">
            PuLP CBC solver optimizes remaining {25 - squad.length} slots using your ₹{budgetRemaining.toFixed(2)} Cr purse.
          </p>

        </div>

      </div>

      {/* ─── Dedicated Match Arena Hub Modal (Zero Clipping / 100% Readable) ─── */}
      {showMatchArenaHub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-2xl bg-slate-950 border border-white/20 rounded-3xl p-6 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center font-bold">
                  <Swords size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    Match Arena • Matchday Simulator
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono font-bold">
                      PHASE 5
                    </span>
                  </h3>
                  <p className="text-xs text-gray-400">
                    Test your assembled 2026 squad against rival franchises at their home fortress.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowMatchArenaHub(false)}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Option 1: 120-Ball Match Engine */}
              <div 
                onClick={() => {
                  setShowMatchArenaHub(false);
                  setShowCricsheetSimModal(true);
                }}
                className="p-5 rounded-2xl bg-slate-900 border border-white/10 hover:border-teal-500/50 hover:bg-teal-950/20 transition-all cursor-pointer group flex flex-col justify-between shadow-lg"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <Zap size={20} />
                  </div>
                  <h4 className="text-base font-black text-white group-hover:text-teal-300 transition-colors">
                    120-Ball Match Engine
                  </h4>
                  <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
                    Full 20-over ball-by-ball simulation with striker rotation, run rate Worm charts, death-over feeds, and broadcast batting & bowling scorecards.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-bold text-teal-400">
                  <span>Over-by-Over Simulation</span>
                  <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Option 2: Fortress Battle Showdown */}
              <div 
                onClick={() => {
                  setShowMatchArenaHub(false);
                  setShowBattleModal(true);
                }}
                className="p-5 rounded-2xl bg-slate-900 border border-white/10 hover:border-rose-500/50 hover:bg-rose-950/20 transition-all cursor-pointer group flex flex-col justify-between shadow-lg"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <Swords size={20} />
                  </div>
                  <h4 className="text-base font-black text-white group-hover:text-rose-300 transition-colors">
                    Fortress Battle Showdown
                  </h4>
                  <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
                    Fast 3-phase clash (Powerplay, Middle Overs, Death) against any rival 2026 fortress with real-time win probability and tactical duels.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-bold text-rose-400">
                  <span>Fast Phase Battle</span>
                  <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Dedicated Strategy Tools Hub Modal (Zero Clipping / 100% Readable) ─── */}
      {showStrategyHub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-3xl bg-slate-950 border border-white/20 rounded-3xl p-6 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold">
                  <Target size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    Franchise Strategy & Operations Hub
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono font-bold">
                      ENTERPRISE
                    </span>
                  </h3>
                  <p className="text-xs text-gray-400">
                    Advanced tactical intelligence, multiplayer bidding, and draft accuracy benchmarking.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowStrategyHub(false)}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Tool 1: Hawkeye Matchups */}
              <div 
                onClick={() => {
                  setShowStrategyHub(false);
                  setShowMatchupModal(true);
                }}
                className="p-4 rounded-2xl bg-slate-900 border border-white/10 hover:border-purple-500/50 hover:bg-purple-950/20 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center mb-2.5">
                    <Target size={18} />
                  </div>
                  <h4 className="text-sm font-black text-white group-hover:text-purple-300 transition-colors">
                    Hawkeye Matchup Matrix
                  </h4>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                    Granular head-to-head metrics: Batter stance (RHB/LHB) vs bowling release trajectories, dot ball %, and dismissal frequencies.
                  </p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-xs font-bold text-purple-400">
                  <span>Open Tactical Radar</span>
                  <ChevronRight size={13} />
                </div>
              </div>

              {/* Tool 2: Multiplayer Live Auction */}
              <div 
                onClick={() => {
                  setShowStrategyHub(false);
                  setShowMultiplayerModal(true);
                }}
                className="p-4 rounded-2xl bg-slate-900 border border-white/10 hover:border-sky-500/50 hover:bg-sky-950/20 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center mb-2.5">
                    <Users size={18} />
                  </div>
                  <h4 className="text-sm font-black text-white group-hover:text-sky-300 transition-colors">
                    Multiplayer Auction Arena
                  </h4>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                    Host or join real-time WebSocket bidding rooms with a room code. Friends claim franchise desks and bid under the live gavel timer!
                  </p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-xs font-bold text-sky-400">
                  <span>Enter Live Room</span>
                  <ChevronRight size={13} />
                </div>
              </div>

              {/* Tool 3: Draft Archives & Accuracy */}
              <div 
                onClick={() => {
                  setShowStrategyHub(false);
                  setShowDraftsModal(true);
                }}
                className="p-4 rounded-2xl bg-slate-900 border border-white/10 hover:border-amber-500/50 hover:bg-amber-950/20 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mb-2.5">
                    <Trophy size={18} />
                  </div>
                  <h4 className="text-sm font-black text-white group-hover:text-amber-300 transition-colors">
                    Draft Archives & 2026 Accuracy
                  </h4>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                    Save multiple mock draft iterations. Benchmark your player prices against consensus 2026 valuations and receive an Analyst Grade.
                  </p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-xs font-bold text-amber-400">
                  <span>Benchmark Roster</span>
                  <ChevronRight size={13} />
                </div>
              </div>

              {/* Tool 4: Sync Live Pitch & Form */}
              <div 
                onClick={() => {
                  handleSyncPipeline();
                  setShowStrategyHub(false);
                }}
                className="p-4 rounded-2xl bg-slate-900 border border-white/10 hover:border-orange-500/50 hover:bg-orange-950/20 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center mb-2.5">
                    <Flame size={18} />
                  </div>
                  <h4 className="text-sm font-black text-white group-hover:text-orange-300 transition-colors">
                    Recalibrate Live Pitch & Form
                  </h4>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                    One-click sync: Updates all 357 players with dynamic matchday momentum (HOT FORM 🔥, COLD SLUMP ❄️) and stadium pitch friction.
                  </p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-xs font-bold text-orange-400">
                  <span>{syncingPipeline ? 'Syncing...' : 'Sync Form Feed'}</span>
                  <ChevronRight size={13} />
                </div>
              </div>

              {/* Tool 5: 2026 International Schedule & NOC Matrix */}
              <div 
                onClick={() => {
                  setShowStrategyHub(false);
                  setShowScheduleModal(true);
                }}
                className="p-4 rounded-2xl bg-slate-900 border border-white/10 hover:border-indigo-500/50 hover:bg-indigo-950/20 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mb-2.5">
                    <Activity size={18} />
                  </div>
                  <h4 className="text-sm font-black text-white group-hover:text-indigo-300 transition-colors">
                    2026 International Calendar & NOC Matrix
                  </h4>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                    Track ECB, CA, CSA tours, player departure dates, playoff risk windows, and live 5-match scorecard form feeds.
                  </p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-xs font-bold text-indigo-400">
                  <span>Open Tour Matrix</span>
                  <ChevronRight size={13} />
                </div>
              </div>

              {/* Tool 6: BCCI Mega Auction Retention Calculator */}
              <div 
                onClick={() => {
                  setShowStrategyHub(false);
                  setShowRetentionModal(true);
                }}
                className="p-4 rounded-2xl bg-slate-900 border border-white/10 hover:border-amber-500/50 hover:bg-amber-950/20 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mb-2.5">
                    <Gavel size={18} />
                  </div>
                  <h4 className="text-sm font-black text-white group-hover:text-amber-300 transition-colors">
                    BCCI Mega Auction Slab Math & RTM
                  </h4>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                    Official 18-14-11-18-14-4 Cr retention deductions, starting purse calculation, and Right-to-Match card allocation.
                  </p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-xs font-bold text-amber-400">
                  <span>Configure Retentions</span>
                  <ChevronRight size={13} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Social Share & Battle Modals ─── */}
      {showExportModal && (
        <SquadExportModal
          franchise={currentFranchise}
          squad={squad}
          stadiumName={stadium.name}
          stadiumCity={stadium.city}
          onClose={() => setShowExportModal(false)}
        />
      )}

      {showBattleModal && (
        <HeadToHeadSimulator
          myFranchise={currentFranchise}
          mySquad={squad}
          onClose={() => setShowBattleModal(false)}
        />
      )}

      {showMatchupModal && (
        <TacticalMatchupModal
          isOpen={showMatchupModal}
          onClose={() => setShowMatchupModal(false)}
        />
      )}

      {showCricsheetSimModal && (
        <BallByBallMatchSimulator
          isOpen={showCricsheetSimModal}
          onClose={() => setShowCricsheetSimModal(false)}
          myFranchise={currentFranchise}
          mySquad={squad}
        />
      )}

      {showMultiplayerModal && (
        <MultiplayerAuctionModal
          isOpen={showMultiplayerModal}
          onClose={() => setShowMultiplayerModal(false)}
          myDefaultTeam={currentFranchise.short}
        />
      )}

      {showDraftsModal && (
        <DraftPersistenceModal
          isOpen={showDraftsModal}
          onClose={() => setShowDraftsModal(false)}
          franchise={currentFranchise}
          currentSquad={squad}
          onLoadDraft={(loadedSquad) => setSquad(loadedSquad)}
        />
      )}

      {/* ─── International Schedule & NOC Conflict Modal ─── */}
      <InternationalScheduleModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
      />

      {/* ─── BCCI Mega Auction Retention & Slab Math Modal ─── */}
      <MegaAuctionRetentionModal
        franchise={currentFranchise}
        isOpen={showRetentionModal}
        onClose={() => setShowRetentionModal(false)}
        onConfirmMegaStart={(startingPurse, rtmCards, retainedPlayers) => {
          setAuctionMode('mega');
          setMegaPurse(startingPurse);
          setMegaRtmCards(rtmCards);
          if (retainedPlayers && retainedPlayers.length > 0) {
            const formatted = retainedPlayers.map((p, idx) => ({
              player_id: `mega_ret_${idx}`,
              name: p.name,
              role: p.role || 'BAT',
              nationality: 'Indian',
              is_overseas: false,
              base_price: p.price,
              predicted_price: p.price,
              Power_Index: 85.0,
              is_retained: true,
              statsSummary: `Official Mega Auction Retained (${p.is_uncapped ? 'Uncapped' : 'Capped'})`
            }));
            setSquad(formatted);
          } else {
            setSquad([]);
          }
        }}
      />

    </div>
  );
}
