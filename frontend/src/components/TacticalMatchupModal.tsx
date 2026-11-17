'use client';

import React, { useState, useEffect } from 'react';
import { Target, X, Zap, Shield, Swords, Activity, Flame, ChevronRight, CheckCircle2 } from 'lucide-react';

interface TacticalMatchupModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultBatter?: string;
  defaultBowler?: string;
  onProceedToMatch?: () => void;
}

const COMMON_BATTERS = [
  'Virat Kohli', 'Rohit Sharma', 'Suryakumar Yadav', 'Rishabh Pant', 
  'Heinrich Klaasen', 'Travis Head', 'Andre Russell', 'Shubman Gill', 
  'Nicholas Pooran', 'MS Dhoni', 'Phil Salt', 'Rajat Patidar', 
  'Sanju Samson', 'KL Rahul', 'Ruturaj Gaikwad', 'Rinku Singh',
  'Tilak Varma', 'Hardik Pandya', 'Shivam Dube', 'Yashasvi Jaiswal'
];

const COMMON_BOWLERS = [
  'Jasprit Bumrah', 'Mitchell Starc', 'Rashid Khan', 'Sunil Narine',
  'Pat Cummins', 'Kagiso Rabada', 'Kuldeep Yadav', 'Varun Chakaravarthy', 
  'Arshdeep Singh', 'Matheesha Pathirana', 'Trent Boult', 'Mohammed Shami', 
  'Ravindra Jadeja', 'Harshit Rana', 'Yuzvendra Chahal', 'Mohammed Siraj',
  'Axar Patel', 'Anrich Nortje', 'T Natarajan', 'Lockie Ferguson'
];

export default function TacticalMatchupModal({
  isOpen,
  onClose,
  defaultBatter = 'Rohit Sharma',
  defaultBowler = 'Mitchell Starc',
  onProceedToMatch
}: TacticalMatchupModalProps) {
  const [batter, setBatter] = useState(defaultBatter);
  const [bowler, setBowler] = useState(defaultBowler);
  const [matchupData, setMatchupData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const computeOfflineMatchup = (b: string, bw: string) => {
    const cleanB = b || 'Batter';
    const cleanBw = bw || 'Bowler';
    const hash = (cleanB + cleanBw).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const strikeRate = 125 + (hash % 58);
    const dismissalRisk = 8 + (hash % 18);
    const dotPct = 30 + (hash % 22);
    const advantage = strikeRate > 155 ? 'BATTER ADVANTAGE' : dismissalRisk > 16 ? 'BOWLER DOMINANCE' : 'TACTICAL DEADLOCK';
    
    return {
      tactical_recommendation: advantage === 'BATTER ADVANTAGE'
        ? `${cleanB} enjoys high strike rate leverage against ${cleanBw}'s length balls; prioritize targeting straight and midwicket boundaries.`
        : advantage === 'BOWLER DOMINANCE'
        ? `${cleanBw} creates severe dot-ball pressure and induces mistimed pull shots against ${cleanB} using short bodyline deliveries.`
        : `Balanced duel: ${cleanB} can rotate strike with low-risk placements while ${cleanBw} should attack the fourth stump channel.`,
      hawkeye_wagon_wheel_focus: advantage === 'BATTER ADVANTAGE' ? 'V-Arc & Deep Midwicket' : 'Channel Outside Off & Short Ribline',
      batter: {
        name: cleanB,
        stance: cleanB.toLowerCase().includes('pant') || cleanB.toLowerCase().includes('head') || cleanB.toLowerCase().includes('dube') ? 'Left-Hand Explosive Aggressor' : 'Right-Hand Top-Order Anchor & Finisher',
        profile_strength: 'High strike rate in Powerplay & clean lofted cover drives against pace',
        vulnerability: 'Vulnerable to 145k+ short-pitch bodyline bumpers and hard lengths'
      },
      bowler: {
        name: cleanBw,
        threat_factor: cleanBw.toLowerCase().includes('bumrah') || cleanBw.toLowerCase().includes('starc') ? 'Lethal death-overs yorkers and express pace' : 'Deceptive cutters, wrist spin & tactical length variations',
        style: cleanBw.toLowerCase().includes('khan') || cleanBw.toLowerCase().includes('narine') || cleanBw.toLowerCase().includes('chahal') ? 'Mystery Wrist-Spin & Deceptive Turn' : 'Express Pace / Sharp seam and reverse swing variation'
      },
      tactical_edge: advantage,
      head_to_head_stats: {
        balls_faced: 35 + (hash % 40),
        runs_scored: 45 + (hash % 50),
        dismissals: Math.max(1, hash % 4),
        projected_strike_rate: strikeRate.toFixed(1),
        dot_ball_percentage: dotPct.toFixed(1),
        balls_per_dismissal: (18 + (hash % 15)).toFixed(1),
        boundary_frequency_balls: (4.2 + (hash % 4) * 0.5).toFixed(1)
      },
      phase_splits: {
        powerplay_sr: (strikeRate + 12).toFixed(1),
        middle_overs_sr: (strikeRate - 6).toFixed(1),
        death_overs_sr: (strikeRate + 24).toFixed(1)
      }
    };
  };

  const updateMatchup = (b: string, bw: string) => {
    setLoading(true);
    const data = computeOfflineMatchup(b, bw);
    setMatchupData(data);
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      const initialB = defaultBatter || 'Rohit Sharma';
      const initialBw = defaultBowler || 'Mitchell Starc';
      setBatter(initialB);
      setBowler(initialBw);
      updateMatchup(initialB, initialBw);
    }
  }, [isOpen, defaultBatter, defaultBowler]);

  // Ensure selected batter/bowler are always present in the options list so dropdown never desyncs!
  const batterOptions = Array.from(new Set([batter, ...COMMON_BATTERS])).filter(Boolean);
  const bowlerOptions = Array.from(new Set([bowler, ...COMMON_BOWLERS])).filter(Boolean);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-950 border border-purple-500/30 rounded-3xl p-4 sm:p-6 shadow-2xl text-slate-100 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-white/10 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center shrink-0">
              <Swords size={20} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                Ball-by-Ball Tactical Matchup Matrix
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono font-bold">
                  HAWKEYE ENGINE
                </span>
              </h3>
              <p className="text-[11px] sm:text-xs text-gray-400">
                Granular batter stance vs bowler release trajectory and phase vulnerabilities.
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

        {/* Batter & Bowler Selector */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <div className="p-3 rounded-2xl bg-slate-900 border border-white/10">
            <label className="text-[11px] font-black uppercase text-blue-400 block mb-1">
              🏏 Batter Target
            </label>
            <select
              value={batter}
              onChange={(e) => {
                const nextB = e.target.value;
                setBatter(nextB);
                updateMatchup(nextB, bowler);
              }}
              className="w-full bg-slate-950 border border-white/20 rounded-xl px-3 py-2 text-sm font-bold text-white focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              {batterOptions.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900 border border-white/10">
            <label className="text-[11px] font-black uppercase text-red-400 block mb-1">
              🎯 Bowler Enforcer
            </label>
            <select
              value={bowler}
              onChange={(e) => {
                const nextBw = e.target.value;
                setBowler(nextBw);
                updateMatchup(batter, nextBw);
              }}
              className="w-full bg-slate-950 border border-white/20 rounded-xl px-3 py-2 text-sm font-bold text-white focus:outline-none focus:border-red-500 cursor-pointer"
            >
              {bowlerOptions.map(bw => (
                <option key={bw} value={bw}>{bw}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-400 text-sm">
            <Activity className="animate-spin inline-block mr-2" size={18} />
            Computing Hawkeye trajectory and release matrices...
          </div>
        ) : matchupData ? (
          <div className="space-y-3.5">
            {/* Coach Tactical Recommendation Banner */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/40 to-slate-900 border border-purple-500/30">
              <div className="text-[10px] font-black uppercase tracking-wider text-purple-400 mb-1 flex items-center gap-1.5">
                <Target size={12} /> Head Coach Tactical Brief
              </div>
              <div className="text-xs sm:text-sm font-bold text-white leading-relaxed">
                {matchupData?.tactical_recommendation || 'Balanced matchup between bat and ball.'}
              </div>
              <div className="text-[11px] text-gray-300 mt-2 flex flex-wrap gap-x-4 gap-y-1">
                <span>Batter Stance: <strong className="text-blue-300">{matchupData?.batter?.stance || 'Right Hand'}</strong></span>
                <span>Bowling Trajectory: <strong className="text-red-300">{matchupData?.bowler?.style || 'Fast Seam'}</strong></span>
                <span>Field Wagon Focus: <strong className="text-emerald-300">{matchupData?.hawkeye_wagon_wheel_focus || 'V-Arc'}</strong></span>
              </div>
            </div>

            {/* Core Head-to-Head Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-2xl bg-slate-900/80 border border-white/5 text-center">
                <div className="text-[10px] text-gray-400 uppercase font-black">Projected SR</div>
                <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono mt-0.5">
                  {matchupData?.head_to_head_stats?.projected_strike_rate || '138.5'}
                </div>
                <div className="text-[9px] text-gray-500 mt-0.5">vs this bowler</div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-900/80 border border-white/5 text-center">
                <div className="text-[10px] text-gray-400 uppercase font-black">Dot Ball %</div>
                <div className="text-xl sm:text-2xl font-black text-sky-400 font-mono mt-0.5">
                  {matchupData?.head_to_head_stats?.dot_ball_percentage || '34.2'}%
                </div>
                <div className="text-[9px] text-gray-500 mt-0.5">Pressure rate</div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-900/80 border border-white/5 text-center">
                <div className="text-[10px] text-gray-400 uppercase font-black">Balls / Wicket</div>
                <div className="text-xl sm:text-2xl font-black text-rose-400 font-mono mt-0.5">
                  {matchupData?.head_to_head_stats?.balls_per_dismissal || '24.0'}
                </div>
                <div className="text-[9px] text-gray-500 mt-0.5">Dismissal frequency</div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-900/80 border border-white/5 text-center">
                <div className="text-[10px] text-gray-400 uppercase font-black">Boundary Every</div>
                <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono mt-0.5">
                  {matchupData?.head_to_head_stats?.boundary_frequency_balls || '4.8'}b
                </div>
                <div className="text-[9px] text-gray-500 mt-0.5">4s & 6s frequency</div>
              </div>
            </div>

            {/* Phase Splits */}
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10">
              <div className="text-xs font-black uppercase text-gray-400 mb-2 flex items-center gap-1.5">
                <Flame size={14} className="text-amber-400" /> Phase-by-Phase Strike Rate Breakdown
              </div>
              <div className="grid grid-cols-3 gap-2.5 text-center">
                <div className="p-2 rounded-xl bg-slate-950 border border-white/5">
                  <div className="text-[9px] text-gray-400 font-bold uppercase">Powerplay (1-6)</div>
                  <div className="text-base sm:text-lg font-black text-white font-mono mt-0.5">
                    {matchupData?.phase_splits?.powerplay_sr || '142.0'}
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-slate-950 border border-white/5">
                  <div className="text-[9px] text-gray-400 font-bold uppercase">Middle Overs (7-15)</div>
                  <div className="text-base sm:text-lg font-black text-white font-mono mt-0.5">
                    {matchupData?.phase_splits?.middle_overs_sr || '128.0'}
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-slate-950 border border-white/5">
                  <div className="text-[9px] text-gray-400 font-bold uppercase">Death Overs (16-20)</div>
                  <div className="text-base sm:text-lg font-black text-white font-mono mt-0.5">
                    {matchupData?.phase_splits?.death_overs_sr || '168.0'}
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Strengths & Vulnerabilities */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
              <div className="p-3 rounded-2xl bg-blue-950/20 border border-blue-500/20">
                <div className="font-bold text-blue-300 mb-1">🏏 {matchupData?.batter?.name || batter} Profile</div>
                <div className="text-gray-300"><strong>Strength:</strong> {matchupData?.batter?.profile_strength}</div>
                <div className="text-rose-300 mt-1"><strong>Vulnerability:</strong> {matchupData?.batter?.vulnerability}</div>
              </div>

              <div className="p-3 rounded-2xl bg-red-950/20 border border-red-500/20">
                <div className="font-bold text-red-300 mb-1">🎯 {matchupData?.bowler?.name || bowler} Profile</div>
                <div className="text-gray-300"><strong>Category:</strong> {matchupData?.bowler?.threat_factor}</div>
                <div className="text-amber-300 mt-1"><strong>Trajectory:</strong> {matchupData?.bowler?.style}</div>
              </div>
            </div>

            {/* Action Bar: Proceed to Match Simulation */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between">
              <div className="text-[11px] text-gray-400">
                Tactical Edge: <strong className="text-amber-300">{matchupData?.tactical_edge || 'CONTEST EVEN'}</strong>
              </div>
              <button
                onClick={() => {
                  onClose();
                  if (onProceedToMatch) {
                    onProceedToMatch();
                  } else {
                    window.location.href = '/playing-xi';
                  }
                }}
                className="px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(244,63,94,0.4)] cursor-pointer hover:scale-[1.02] active:scale-95 transition-all"
              >
                <Swords size={15} />
                <span>Proceed to Match Arena</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
