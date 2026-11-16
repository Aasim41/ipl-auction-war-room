'use client';

import React, { useState } from 'react';
import { Swords, MapPin, Zap, Flame, Shield, Trophy, RefreshCw, X, ChevronRight, Activity } from 'lucide-react';
import { IPL_FRANCHISES, FranchiseData, getFranchise } from '../data/franchises';
import { STADIUMS } from '../data/stadiums';

interface HeadToHeadSimulatorProps {
  myFranchise: FranchiseData;
  mySquad: any[];
  onClose: () => void;
}

export default function HeadToHeadSimulator({ myFranchise, mySquad, onClose }: HeadToHeadSimulatorProps) {
  const [rivalId, setRivalId] = useState<string>('csk');
  const [venueKey, setVenueKey] = useState<string>('rcb');
  const [simulating, setSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<any | null>(null);

  const rivalFranchise = IPL_FRANCHISES[rivalId] || IPL_FRANCHISES.csk;
  const rivalSquad = rivalFranchise.squad2026;

  const stadium = STADIUMS[venueKey] || STADIUMS.rcb;

  const handleSimulate = async () => {
    setSimulating(true);
    setSimulationResult(null);

    // Call backend win probability engine
    try {
      const teamA_ids = mySquad.map(p => p.player_id || p.name).slice(0, 11);
      const teamB_ids = rivalSquad.map(p => p.player_id || p.name).slice(0, 11);

      const res = await fetch('http://localhost:8000/api/win-probability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          team_a_ids: teamA_ids,
          team_b_ids: teamB_ids,
          venue: stadium.city
        })
      });

      const data = await res.json();

      // Simulate detailed matchday scoreline based on stadium par score and team balance
      const par = stadium.avgFirstInnings || 180;
      const myPowerAvg = mySquad.reduce((sum, p) => sum + (Number(p.Power_Index) || 75), 0) / Math.max(1, mySquad.length);
      const rivalPowerAvg = rivalSquad.reduce((sum, p) => sum + (Number(p.Power_Index) || 75), 0) / Math.max(1, rivalSquad.length);

      // Score computations
      const myScore = Math.round(par + (myPowerAvg - 80) * 1.8 + (Math.random() * 16 - 8));
      const myWickets = Math.min(10, Math.max(3, Math.round(6 + (Math.random() * 4 - 2))));

      const rivalScore = Math.round(par + (rivalPowerAvg - 80) * 1.8 + (Math.random() * 16 - 8));
      const rivalWickets = Math.min(10, Math.max(3, Math.round(6 + (Math.random() * 4 - 2))));

      const winProbA = Math.round(data.prob_a || (myPowerAvg / (myPowerAvg + rivalPowerAvg)) * 100);
      const winProbB = 100 - winProbA;

      const winner = myScore >= rivalScore ? myFranchise.name : rivalFranchise.name;
      const margin = Math.abs(myScore - rivalScore);

      setTimeout(() => {
        setSimulationResult({
          teamA: {
            name: myFranchise.name,
            short: myFranchise.short,
            color: myFranchise.color,
            score: `${myScore}/${myWickets}`,
            winProb: winProbA,
            powerplay: `${Math.round(myScore * 0.31)}/1`,
            middleOvers: `${Math.round(myScore * 0.42)}/${Math.max(1, myWickets - 3)}`,
            deathOvers: `${Math.round(myScore * 0.27)}/${myWickets}`
          },
          teamB: {
            name: rivalFranchise.name,
            short: rivalFranchise.short,
            color: rivalFranchise.color,
            score: `${rivalScore}/${rivalWickets}`,
            winProb: winProbB,
            powerplay: `${Math.round(rivalScore * 0.30)}/1`,
            middleOvers: `${Math.round(rivalScore * 0.44)}/${Math.max(1, rivalWickets - 3)}`,
            deathOvers: `${Math.round(rivalScore * 0.26)}/${rivalWickets}`
          },
          winner,
          margin: `${margin} runs`,
          venue: `${stadium.name} (${stadium.city})`,
          pitchFactor: stadium.pitchType,
          keyDuels: [
            `${mySquad[0]?.name || 'Top Opener'} vs ${rivalSquad[4]?.name || 'Spearhead Seamer'} (New Ball Swing)`,
            `${mySquad[1]?.name || 'Middle Anchor'} vs ${rivalSquad[1]?.name || 'Lead Spinner'} (Turn & Grip)`,
            `${mySquad[6]?.name || 'Finisher'} vs ${rivalSquad[2]?.name || 'Death Bowler'} (19th Over Crunch)`
          ]
        });
        setSimulating(false);
      }, 700);
    } catch (err) {
      console.error(err);
      setSimulating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl bg-slate-950 border border-slate-700/70 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[92vh]">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-800 text-gray-300 hover:text-white hover:bg-slate-700 transition-colors"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center text-white shadow-lg">
            <Swords size={22} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white font-sans tracking-tight">
              Fortress Battle Showdown
            </h2>
            <p className="text-xs text-gray-400">
              Simulate head-to-head match outcomes against rival 2026 squads across any IPL stadium
            </p>
          </div>
        </div>

        {/* Rival and Stadium Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* Select Rival */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <label className="text-xs font-bold text-gray-400 block mb-2 uppercase">Select Rival Franchise</label>
            <select
              value={rivalId}
              onChange={(e) => setRivalId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-sm text-white font-semibold focus:outline-none focus:border-rose-500 cursor-pointer"
            >
              {Object.values(IPL_FRANCHISES).filter(f => f.id !== myFranchise.id).map(f => (
                <option key={f.id} value={f.id}>{f.emoji} {f.name} ({f.short})</option>
              ))}
            </select>
          </div>

          {/* Select Fortress Venue */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <label className="text-xs font-bold text-gray-400 block mb-2 uppercase">Select Matchday Fortress</label>
            <select
              value={venueKey}
              onChange={(e) => setVenueKey(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-sm text-white font-semibold focus:outline-none focus:border-rose-500 cursor-pointer"
            >
              {Object.entries(STADIUMS).map(([k, s]) => (
                <option key={k} value={k}>{s.name} ({s.city}) - Par: {s.avgFirstInnings}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Head-to-Head Banner Preview */}
        <div className="flex items-center justify-between p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-slate-800 mb-6">
          {/* Team A */}
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-bold border"
              style={{ backgroundColor: `${myFranchise.color}25`, borderColor: myFranchise.color }}
            >
              {myFranchise.emoji}
            </div>
            <div>
              <div className="text-base font-black text-white">{myFranchise.short}</div>
              <div className="text-xs text-gray-400">Your 2026 Squad</div>
            </div>
          </div>

          <div className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 text-xs font-black">
            VS
          </div>

          {/* Team B */}
          <div className="flex items-center gap-3 flex-row-reverse text-right">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-bold border"
              style={{ backgroundColor: `${rivalFranchise.color}25`, borderColor: rivalFranchise.color }}
            >
              {rivalFranchise.emoji}
            </div>
            <div>
              <div className="text-base font-black text-white">{rivalFranchise.short}</div>
              <div className="text-xs text-gray-400">Rival 2026 Core</div>
            </div>
          </div>
        </div>

        {/* Simulate Action Button */}
        <button
          onClick={handleSimulate}
          disabled={simulating}
          className="w-full py-3.5 rounded-2xl font-black text-sm bg-gradient-to-r from-rose-600 to-amber-600 text-white flex items-center justify-center gap-2 hover:opacity-95 transition-all shadow-xl cursor-pointer mb-6"
        >
          <Zap size={18} />
          {simulating ? 'Simulating 20 Overs Ball-by-Ball...' : 'Run Fortress Match Simulation'}
        </button>

        {/* Simulation Output Card */}
        {simulationResult && (
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-white/10 space-y-5 animate-fade-in">
            {/* Victory Result Banner */}
            <div className="text-center pb-4 border-b border-white/10">
              <span className="text-xs text-amber-400 font-bold uppercase tracking-wider block mb-1">
                Predicted Match Outcome
              </span>
              <div className="text-2xl font-black text-white font-display">
                🏆 {simulationResult.winner} wins by {simulationResult.margin}!
              </div>
              <div className="text-xs text-gray-400 mt-1 flex items-center justify-center gap-1">
                <MapPin size={12} /> {simulationResult.venue} • {simulationResult.pitchFactor}
              </div>
            </div>

            {/* Scoreboard Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div 
                className="p-4 rounded-xl border bg-slate-950/70"
                style={{ borderColor: `${simulationResult.teamA.color}50` }}
              >
                <div className="text-xs text-gray-400 font-bold mb-1">{simulationResult.teamA.name}</div>
                <div className="text-3xl font-black font-mono text-white mb-2">{simulationResult.teamA.score}</div>
                <div className="text-xs text-gray-300 space-y-0.5">
                  <div>PP (1-6): <strong className="text-emerald-400">{simulationResult.teamA.powerplay}</strong></div>
                  <div>Mid (7-15): <strong className="text-amber-400">{simulationResult.teamA.middleOvers}</strong></div>
                  <div>Death (16-20): <strong className="text-rose-400">{simulationResult.teamA.deathOvers}</strong></div>
                </div>
              </div>

              <div 
                className="p-4 rounded-xl border bg-slate-950/70 text-right"
                style={{ borderColor: `${simulationResult.teamB.color}50` }}
              >
                <div className="text-xs text-gray-400 font-bold mb-1">{simulationResult.teamB.name}</div>
                <div className="text-3xl font-black font-mono text-white mb-2">{simulationResult.teamB.score}</div>
                <div className="text-xs text-gray-300 space-y-0.5">
                  <div>PP (1-6): <strong className="text-emerald-400">{simulationResult.teamB.powerplay}</strong></div>
                  <div>Mid (7-15): <strong className="text-amber-400">{simulationResult.teamB.middleOvers}</strong></div>
                  <div>Death (16-20): <strong className="text-rose-400">{simulationResult.teamB.deathOvers}</strong></div>
                </div>
              </div>
            </div>

            {/* Win Probability Bar */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1.5">
                <span style={{ color: simulationResult.teamA.color }}>{simulationResult.teamA.short}: {simulationResult.teamA.winProb}%</span>
                <span style={{ color: simulationResult.teamB.color }}>{simulationResult.teamB.short}: {simulationResult.teamB.winProb}%</span>
              </div>
              <div className="h-3 w-full rounded-full bg-slate-800 overflow-hidden flex">
                <div 
                  className="h-full transition-all duration-700" 
                  style={{ width: `${simulationResult.teamA.winProb}%`, backgroundColor: simulationResult.teamA.color }}
                />
                <div 
                  className="h-full transition-all duration-700" 
                  style={{ width: `${simulationResult.teamB.winProb}%`, backgroundColor: simulationResult.teamB.color }}
                />
              </div>
            </div>

            {/* Key Matchup Duels */}
            <div className="pt-3 border-t border-white/10">
              <span className="text-xs font-bold text-gray-400 uppercase block mb-2">Key Tactical Matchups:</span>
              <div className="space-y-1.5 text-xs text-gray-300">
                {simulationResult.keyDuels.map((duel: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-rose-400">⚡</span>
                    <span>{duel}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
