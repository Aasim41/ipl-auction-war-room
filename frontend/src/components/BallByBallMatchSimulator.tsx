'use client';

import React, { useState } from 'react';
import { Play, RotateCcw, X, Trophy, Swords, Activity, Zap, TrendingUp } from 'lucide-react';
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

    // Format squads for backend
    const teamASquad = mySquad.map(p => ({
      name: p.name,
      role: p.role,
      Power_Index: p.Power_Index || 75.0
    }));

    const teamBSquad = [
      { name: 'Ruturaj Gaikwad', role: 'BAT', Power_Index: 86.0 },
      { name: 'Devon Conway', role: 'BAT', Power_Index: 84.0 },
      { name: 'Shivam Dube', role: 'AR', Power_Index: 88.0 },
      { name: 'Ravindra Jadeja', role: 'AR', Power_Index: 90.0 },
      { name: 'MS Dhoni', role: 'WK', Power_Index: 85.0 },
      { name: 'Matheesha Pathirana', role: 'BOWL', Power_Index: 89.0 },
      { name: 'Tushar Deshpande', role: 'BOWL', Power_Index: 78.0 },
      { name: 'Shardul Thakur', role: 'BOWL', Power_Index: 79.0 },
      { name: 'Noor Ahmad', role: 'BOWL', Power_Index: 82.0 },
      { name: 'Rachin Ravindra', role: 'AR', Power_Index: 83.0 },
      { name: 'Sameer Rizvi', role: 'BAT', Power_Index: 76.0 }
    ];

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
      const data = await res.json();
      setMatchResult(data);
    } catch (err) {
      console.error('Match simulation error:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  const inn1 = matchResult?.team_a_innings;
  const inn2 = matchResult?.team_b_innings;
  const activeInn = activeInningsTab === 'inn1' ? inn1 : inn2;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-4xl bg-slate-950 border border-white/20 rounded-3xl p-6 shadow-2xl text-slate-100 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Swords size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                Cricsheet 120-Ball Match Engine
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                  OVER-BY-OVER
                </span>
              </h3>
              <p className="text-xs text-gray-400">
                True 20-over ball-by-ball trajectory simulation with worm progression and scorecards.
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
        <div className="p-4 rounded-2xl bg-slate-900 border border-white/10 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="text-xs font-black uppercase text-gray-400">Challenge Rival:</div>
            <select
              value={rivalFranchiseKey}
              onChange={(e) => setRivalFranchiseKey(e.target.value)}
              className="bg-slate-950 border border-white/20 rounded-xl px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-emerald-500"
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
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-all disabled:opacity-50"
          >
            {isSimulating ? (
              <>
                <Activity className="animate-spin" size={14} /> Simulating 120 Deliveries...
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
          <div className="space-y-5">
            {/* Match Winner Summary Banner */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-slate-900 to-emerald-500/20 border border-amber-500/30 text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-bold text-xs uppercase mb-2">
                <Trophy size={14} /> Match Result
              </div>
              <div className="text-xl sm:text-2xl font-black text-white">
                {matchResult.result_description}
              </div>
              <div className="text-xs text-gray-300 mt-2 flex justify-center items-center gap-6 font-mono font-bold">
                <span>{myFranchise.short}: <strong className="text-white text-sm">{inn1?.total_runs}/{inn1?.wickets}</strong> ({inn1?.overs} ov)</span>
                <span>vs</span>
                <span>{rivalFranchise.short}: <strong className="text-white text-sm">{inn2?.total_runs}/{inn2?.wickets}</strong> ({inn2?.overs} ov)</span>
              </div>
            </div>

            {/* Over-by-Over Worm Progression Bar */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10">
              <div className="flex items-center justify-between text-xs font-bold text-gray-300 mb-3">
                <span className="flex items-center gap-1.5 text-emerald-400 font-black">
                  <TrendingUp size={14} /> 20-Over Run Rate Progression (Worm Comparison)
                </span>
                <span className="text-[11px] text-gray-400 font-mono">
                  {myFranchise.short} (Cyan) vs {rivalFranchise.short} (Gold)
                </span>
              </div>

              {/* Simplified Visual Worm Progress Bars */}
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-[11px] text-cyan-300 font-mono mb-1 font-bold">
                    <span>{myFranchise.short}: {inn1?.total_runs} runs</span>
                    <span>RR: {inn1?.run_rate}</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-slate-950 overflow-hidden flex">
                    <div 
                      className="bg-cyan-500 transition-all duration-1000" 
                      style={{ width: `${Math.min(100, (inn1?.total_runs / 230) * 100)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-amber-300 font-mono mb-1 font-bold">
                    <span>{rivalFranchise.short}: {inn2?.total_runs} runs</span>
                    <span>RR: {inn2?.run_rate}</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-slate-950 overflow-hidden flex">
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
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeInningsTab === 'inn1'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                1st Innings: {inn1?.team} ({inn1?.total_runs}/{inn1?.wickets})
              </button>
              <button
                onClick={() => setActiveInningsTab('inn2')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeInningsTab === 'inn2'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                2nd Innings: {inn2?.team} ({inn2?.total_runs}/{inn2?.wickets})
              </button>
            </div>

            {/* Batting Card Table */}
            {activeInn && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10">
                  <div className="text-xs font-black uppercase tracking-wider text-gray-400 mb-3">
                    Batting Scorecard
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-gray-400 border-b border-white/10 text-left">
                          <th className="py-2">Batter</th>
                          <th>Dismissal</th>
                          <th className="text-right">R</th>
                          <th className="text-right">B</th>
                          <th className="text-right">4s</th>
                          <th className="text-right">6s</th>
                          <th className="text-right">SR</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 font-mono">
                        {activeInn.batting_card.map((b: any) => (
                          <tr key={b.name} className="hover:bg-white/5">
                            <td className="py-2 font-sans font-bold text-white">{b.name}</td>
                            <td className="text-[11px] text-gray-400 font-sans">{b.dismissal}</td>
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

                {/* Bowling Card Table */}
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10">
                  <div className="text-xs font-black uppercase tracking-wider text-gray-400 mb-3">
                    Bowling Figures
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-gray-400 border-b border-white/10 text-left">
                          <th className="py-2">Bowler</th>
                          <th className="text-right">O</th>
                          <th className="text-right">M</th>
                          <th className="text-right">R</th>
                          <th className="text-right">W</th>
                          <th className="text-right">Econ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 font-mono">
                        {activeInn.bowling_card.map((bw: any) => (
                          <tr key={bw.name} className="hover:bg-white/5">
                            <td className="py-2 font-sans font-bold text-white">{bw.name}</td>
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

                {/* Key Over Commentary Highlights */}
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10">
                  <div className="text-xs font-black uppercase tracking-wider text-gray-400 mb-2">
                    Death Overs Ball-by-Ball Feed
                  </div>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto font-mono text-[11px]">
                    {activeInn.key_balls.map((k: any, i: number) => (
                      <div key={i} className="p-1.5 rounded-lg bg-slate-950 flex items-start gap-2 border border-white/5">
                        <span className="font-bold text-amber-400 shrink-0">{k.ball}</span>
                        <span className={`px-1 rounded text-[10px] font-black shrink-0 ${
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
            )}
          </div>
        )}
      </div>
    </div>
  );
}
