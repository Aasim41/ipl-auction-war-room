'use client';

import React, { useState } from 'react';
import { Play, X, Trophy, Swords, Activity, TrendingUp, Sparkles } from 'lucide-react';
import { IPL_FRANCHISES, FranchiseData } from '../data/franchises';
import { Player } from '../lib/usePlayerData';

interface BallByBallMatchSimulatorProps {
  isOpen: boolean;
  onClose: () => void;
  myFranchise: FranchiseData;
  mySquad: Player[];
}

export default function BallByBallMatchSimulator({
  isOpen,
  onClose,
  myFranchise,
  mySquad
}: BallByBallMatchSimulatorProps) {
  const [rivalFranchiseKey, setRivalFranchiseKey] = useState<string>('csk');
  const [isSimulating, setIsSimulating] = useState(false);
  const [matchResult, setMatchResult] = useState<any | null>(null);
  const [activeInningsTab, setActiveInningsTab] = useState<'inn1' | 'inn2'>('inn1');

  if (!isOpen) return null;

  const rivalFranchise = IPL_FRANCHISES[rivalFranchiseKey] || IPL_FRANCHISES.csk;

  const handleSimulate = async () => {
    setIsSimulating(true);
    setMatchResult(null);

    // Format squads
    const teamASquad = mySquad.map(p => ({
      name: p.name,
      role: p.role || 'BAT',
      Power_Index: Number(p.Power_Index) || 80.0
    }));

    const teamBSquad = (rivalFranchise.squad2026 || []).map(p => ({
      name: p.name,
      role: p.role,
      Power_Index: Number(p.Power_Index) || 82.0
    }));

    try {
      const res = await fetch('http://localhost:8000/api/enterprise/simulate-match-balls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          team_a_name: myFranchise.short,
          team_a_squad: teamASquad,
          team_b_name: rivalFranchise.short,
          team_b_squad: teamBSquad,
          venue: `${myFranchise.stadiumName || 'Wankhede Stadium'}`
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.team_a_innings && data.team_a_innings.batting_card) {
          setMatchResult(data);
          return;
        }
      }
    } catch {
      // Offline-first simulation fallback
    }

    // ─── High-Fidelity Client-Side 20-Over Simulation ───
    const avgPowerA = teamASquad.reduce((s, p) => s + p.Power_Index, 0) / (teamASquad.length || 1);
    const avgPowerB = teamBSquad.reduce((s, p) => s + p.Power_Index, 0) / (teamBSquad.length || 1);
    
    const runsA = Math.floor(160 + (avgPowerA - 78) * 2.4 + (Math.random() * 24));
    const wktsA = Math.min(10, Math.floor(3 + Math.random() * 5));
    const runsB = Math.floor(155 + (avgPowerB - 78) * 2.4 + (Math.random() * 24));
    const wktsB = Math.min(10, Math.floor(3 + Math.random() * 5));

    const aWon = runsA > runsB;
    const margin = aWon ? `${runsA - runsB} runs` : `${10 - wktsB} wickets`;
    const winner = aWon ? myFranchise.name : rivalFranchise.name;

    // Helper: Generate Batting Card
    const buildBattingCard = (squad: any[], totalRuns: number, totalWkts: number) => {
      const activeBatters = squad.slice(0, Math.min(squad.length, 9));
      let currentAlloc = 0;
      return activeBatters.map((p, i) => {
        const isOut = i < totalWkts;
        const weight = (9 - i) / 45;
        let r = Math.max(3, Math.floor(totalRuns * weight + (Math.random() * 6 - 3)));
        if (i === activeBatters.length - 1) {
          r = Math.max(2, totalRuns - currentAlloc);
        }
        currentAlloc += r;
        const b = Math.max(3, Math.floor(r * (0.6 + Math.random() * 0.25)));
        const fours = Math.floor(r / 10);
        const sixes = Math.floor(r / 16);
        const sr = b > 0 ? ((r / b) * 100).toFixed(1) : '100.0';
        const dismissal = isOut
          ? (i % 3 === 0 ? 'c & b Bowler' : i % 2 === 0 ? 'b Bowler' : 'c Deep Midwicket')
          : 'not out';

        return {
          name: p.name,
          dismissal,
          runs: r,
          balls: b,
          fours,
          sixes,
          sr
        };
      });
    };

    // Helper: Generate Bowling Card
    const buildBowlingCard = (bowlingSquad: any[], oppRuns: number, oppWkts: number) => {
      const bowlers = bowlingSquad.filter(p => p.role === 'BOWL' || p.role === 'AR');
      const selected = bowlers.length >= 5 ? bowlers.slice(0, 5) : bowlingSquad.slice(-5);
      let assignedWkts = 0;

      return selected.map((bw, i) => {
        const remainingWkts = oppWkts - assignedWkts;
        const w = i === 0 ? Math.min(remainingWkts, 2) : (remainingWkts > 0 && Math.random() > 0.4 ? 1 : 0);
        assignedWkts += w;
        const runs = Math.floor(oppRuns / 5 + (Math.random() * 8 - 4));
        return {
          name: bw.name,
          overs: '4.0',
          maidens: Math.random() > 0.85 ? 1 : 0,
          runs,
          wickets: w,
          econ: (runs / 4).toFixed(2)
        };
      });
    };

    // Helper: Key Balls Commentary
    const buildKeyBalls = (teamShort: string, totalRuns: number) => {
      return [
        { ball: '16.4', event: '4', commentary: `${teamShort} batter charges down and pierces extra cover! Boundary!`, score_after: `${Math.floor(totalRuns * 0.80)}/3` },
        { ball: '17.2', event: '6', commentary: `Pitched up into the slot, launched over long-on for a monster 102m SIX!`, score_after: `${Math.floor(totalRuns * 0.85)}/3` },
        { ball: '18.1', event: 'W', commentary: `TIMBER! Rapid 146 km/h yorker rattles the stumps! Massive breakthrough!`, score_after: `${Math.floor(totalRuns * 0.88)}/4` },
        { ball: '18.5', event: '4', commentary: `Edged past the diving keeper and trickles into third-man fence.`, score_after: `${Math.floor(totalRuns * 0.92)}/4` },
        { ball: '19.2', event: '6', commentary: `Incredible helicopter swat! Clears square leg boundary with sheer power!`, score_after: `${Math.floor(totalRuns * 0.96)}/4` },
        { ball: '20.0', event: '2', commentary: `Drives hard to deep mid-wicket, running hard for two to close out the innings!`, score_after: `${totalRuns}/4` }
      ];
    };

    setTimeout(() => {
      setMatchResult({
        match_winner: winner,
        result_description: `${winner} won by ${margin}!`,
        team_a_innings: {
          team: myFranchise.short,
          total_runs: runsA,
          wickets: wktsA,
          overs: 20.0,
          run_rate: (runsA / 20).toFixed(2),
          batting_card: buildBattingCard(teamASquad, runsA, wktsA),
          bowling_card: buildBowlingCard(teamBSquad, runsA, wktsA),
          key_balls: buildKeyBalls(myFranchise.short, runsA)
        },
        team_b_innings: {
          team: rivalFranchise.short,
          total_runs: runsB,
          wickets: wktsB,
          overs: 20.0,
          run_rate: (runsB / 20).toFixed(2),
          batting_card: buildBattingCard(teamBSquad, runsB, wktsB),
          bowling_card: buildBowlingCard(teamASquad, runsB, wktsB),
          key_balls: buildKeyBalls(rivalFranchise.short, runsB)
        }
      });
      setIsSimulating(false);
    }, 600);
  };

  const inn1 = matchResult?.team_a_innings;
  const inn2 = matchResult?.team_b_innings;
  const activeInn = activeInningsTab === 'inn1' ? inn1 : inn2;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-x-hidden">
      <div className="relative w-full max-w-5xl bg-slate-950 border border-white/20 rounded-3xl p-4 sm:p-6 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
              <Swords size={18} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                20-Over Live Match Simulator
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                  OFFLINE READY
                </span>
              </h3>
              <p className="text-[11px] text-gray-400">
                Simulating ball-by-ball performance, batting cards, bowling figures, and death overs.
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

        {/* Rival Selection & Run Action */}
        <div className="p-3.5 rounded-2xl bg-slate-900 border border-white/10 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-black uppercase text-gray-400">Select Opponent:</span>
            <select
              value={rivalFranchiseKey}
              onChange={(e) => setRivalFranchiseKey(e.target.value)}
              className="bg-slate-950 border border-white/20 rounded-xl px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              {Object.entries(IPL_FRANCHISES).map(([key, fr]) => {
                if (fr.short === myFranchise.short) return null;
                return (
                  <option key={key} value={key}>
                    {fr.name} ({fr.short})
                  </option>
                );
              })}
            </select>
          </div>

          <button
            onClick={handleSimulate}
            disabled={isSimulating}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-all disabled:opacity-50"
          >
            {isSimulating ? (
              <>
                <Activity className="animate-spin" size={14} /> Simulating Match Deliveries...
              </>
            ) : (
              <>
                <Play size={14} /> Simulate 20-Over Match
              </>
            )}
          </button>
        </div>

        {/* Results Area */}
        {matchResult && (
          <div className="space-y-4">
            
            {/* Match Winner Summary Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-slate-900 to-emerald-500/20 border border-amber-500/30 text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[10px] uppercase mb-1">
                <Trophy size={12} /> Match Result
              </div>
              <div className="text-lg sm:text-2xl font-black text-white">
                {matchResult.result_description}
              </div>
              <div className="text-xs text-gray-300 mt-1.5 flex justify-center items-center gap-6 font-mono font-bold">
                <span>{myFranchise.short}: <strong className="text-emerald-400 text-sm">{inn1?.total_runs}/{inn1?.wickets}</strong> ({inn1?.overs} ov)</span>
                <span className="text-gray-500">vs</span>
                <span>{rivalFranchise.short}: <strong className="text-amber-400 text-sm">{inn2?.total_runs}/{inn2?.wickets}</strong> ({inn2?.overs} ov)</span>
              </div>
            </div>

            {/* Over-by-Over Worm Progression Bar */}
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10">
              <div className="flex items-center justify-between text-xs font-bold text-gray-300 mb-2">
                <span className="flex items-center gap-1.5 text-emerald-400 font-black">
                  <TrendingUp size={13} /> Run Rate Progression
                </span>
                <span className="text-[10px] text-gray-400 font-mono">
                  {myFranchise.short} vs {rivalFranchise.short}
                </span>
              </div>

              <div className="space-y-1.5">
                <div>
                  <div className="flex justify-between text-[11px] text-cyan-300 font-mono mb-0.5 font-bold">
                    <span>{myFranchise.short}: {inn1?.total_runs} runs</span>
                    <span>RR: {inn1?.run_rate}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-950 overflow-hidden flex">
                    <div 
                      className="bg-cyan-500 transition-all duration-1000" 
                      style={{ width: `${Math.min(100, (inn1?.total_runs / 230) * 100)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-amber-300 font-mono mb-0.5 font-bold">
                    <span>{rivalFranchise.short}: {inn2?.total_runs} runs</span>
                    <span>RR: {inn2?.run_rate}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-950 overflow-hidden flex">
                    <div 
                      className="bg-amber-400 transition-all duration-1000" 
                      style={{ width: `${Math.min(100, (inn2?.total_runs / 230) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Innings Tabs */}
            <div className="flex gap-2 border-b border-white/10 pb-2">
              <button
                onClick={() => setActiveInningsTab('inn1')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeInningsTab === 'inn1'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                1st Innings: {inn1?.team} ({inn1?.total_runs}/{inn1?.wickets})
              </button>
              <button
                onClick={() => setActiveInningsTab('inn2')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeInningsTab === 'inn2'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                2nd Innings: {inn2?.team} ({inn2?.total_runs}/{inn2?.wickets})
              </button>
            </div>

            {/* Scorecard Tables Grid (Side-by-side in landscape) */}
            {activeInn && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
                
                {/* Batting Card */}
                <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10">
                  <div className="text-[11px] font-black uppercase tracking-wider text-gray-400 mb-2">
                    Batting Scorecard
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-gray-400 border-b border-white/10 text-left text-[11px]">
                          <th className="py-1.5">Batter</th>
                          <th>Dismissal</th>
                          <th className="text-right">R</th>
                          <th className="text-right">B</th>
                          <th className="text-right">4s</th>
                          <th className="text-right">6s</th>
                          <th className="text-right">SR</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 font-mono text-[11px]">
                        {(activeInn.batting_card || []).map((b: any, idx: number) => (
                          <tr key={idx} className="hover:bg-white/5">
                            <td className="py-1 font-sans font-bold text-white">{b.name}</td>
                            <td className="text-[10px] text-gray-400 font-sans">{b.dismissal}</td>
                            <td className="text-right font-black text-emerald-400">{b.runs}</td>
                            <td className="text-right text-gray-300">{b.balls}</td>
                            <td className="text-right text-gray-300">{b.fours}</td>
                            <td className="text-right text-gray-300">{b.sixes}</td>
                            <td className="text-right text-amber-400 font-bold">{b.sr}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Bowling Figures & Death Overs Feed */}
                <div className="space-y-3.5">
                  <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10">
                    <div className="text-[11px] font-black uppercase tracking-wider text-gray-400 mb-2">
                      Bowling Figures
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="text-gray-400 border-b border-white/10 text-left text-[11px]">
                            <th className="py-1.5">Bowler</th>
                            <th className="text-right">O</th>
                            <th className="text-right">M</th>
                            <th className="text-right">R</th>
                            <th className="text-right">W</th>
                            <th className="text-right">Econ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 font-mono text-[11px]">
                          {(activeInn.bowling_card || []).map((bw: any, idx: number) => (
                            <tr key={idx} className="hover:bg-white/5">
                              <td className="py-1 font-sans font-bold text-white">{bw.name}</td>
                              <td className="text-right text-gray-300">{bw.overs}</td>
                              <td className="text-right text-gray-300">{bw.maidens}</td>
                              <td className="text-right text-gray-300">{bw.runs}</td>
                              <td className="text-right font-black text-rose-400">{bw.wickets}</td>
                              <td className="text-right text-amber-400 font-bold">{bw.econ}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Death Overs Feed */}
                  <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10">
                    <div className="text-[11px] font-black uppercase tracking-wider text-gray-400 mb-1.5">
                      Clutch Over-by-Over Highlights
                    </div>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto font-mono text-[10px]">
                      {(activeInn.key_balls || []).map((k: any, i: number) => (
                        <div key={i} className="p-1 rounded bg-slate-950 flex items-start gap-1.5 border border-white/5">
                          <span className="font-bold text-amber-400 shrink-0">{k.ball}</span>
                          <span className={`px-1 rounded text-[9px] font-black shrink-0 ${
                            k.event === 'W' ? 'bg-rose-500 text-white' : (k.event === '6' ? 'bg-emerald-500 text-black' : (k.event === '4' ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-300'))
                          }`}>
                            {k.event}
                          </span>
                          <span className="text-gray-300 font-sans">{k.commentary}</span>
                          <span className="text-gray-500 ml-auto shrink-0 font-mono">[{k.score_after}]</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
