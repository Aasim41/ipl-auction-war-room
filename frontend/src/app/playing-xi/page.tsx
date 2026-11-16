'use client';

import React, { useState, useEffect } from 'react';
import { Users, MapPin, Zap, ChevronRight, Info, ShieldAlert, Sparkles, Activity, AlertCircle } from 'lucide-react';

const VENUE_INSIGHTS: Record<string, { title: string, behavior: string, boost: string, hint: string, favRole: string }> = {
  Chennai: {
    title: 'M.A. Chidambaram Stadium (Chepauk)',
    behavior: 'Spin Paradise & Slow Turning Track',
    boost: '+25% Boost to Spin Bowlers & Slow Anchors',
    hint: 'Pack your XI with finger and wrist spinners. High friction surface rewards flight and turn.',
    favRole: 'Spin Bowling & Tactical Anchors'
  },
  Mumbai: {
    title: 'Wankhede Stadium',
    behavior: 'Pace & High-Scoring Dew Track',
    boost: '+20% Boost to Powerhitters & Express Pacers',
    hint: 'Short boundaries and dew in second innings. Prioritize 140+ km/h seamers and aggressive openers.',
    favRole: 'Power Hitters & Fast Bowlers'
  },
  Kolkata: {
    title: 'Eden Gardens',
    behavior: 'True Bounce & Outfield Paradise',
    boost: '+15% Boost to Mystery Spin & Middle Order Hitters',
    hint: 'Lush outfield with quick boundaries. Balanced track with late dew factor.',
    favRole: 'All-Rounders & Spinners'
  },
  Bengaluru: {
    title: 'M. Chinnaswamy Stadium',
    behavior: 'High Altitude & Small Boundaries',
    boost: '+30% Boost to Batting Strike Rate',
    hint: 'Highest scoring ground in IPL. Boundary-clearing ability is paramount.',
    favRole: 'Aggressors & Death Bowlers'
  },
  Hyderabad: {
    title: 'Rajiv Gandhi International Stadium',
    behavior: 'Balanced Sporting Deck',
    boost: '+15% Boost to Seam All-Rounders',
    hint: 'Good carry early on, settles into a steady batting deck as the game progresses.',
    favRole: 'Pace All-Rounders'
  },
  Delhi: {
    title: 'Arun Jaitley Stadium',
    behavior: 'Slow & Low Friction Surface',
    boost: '+20% Boost to Slow Left-Arm & Off-Spinners',
    hint: 'Low bounce requires batsmen with good footwork and spinners who hit the pitch hard.',
    favRole: 'Spin Bowlers & Accumulators'
  },
  Jaipur: {
    title: 'Sawai Mansingh Stadium',
    behavior: 'Large Outfield Dimensions',
    boost: '+15% Boost to Fit Runners & Control Bowlers',
    hint: 'Big square boundaries reward two-running and economical spell bowling.',
    favRole: 'Control Bowlers & Fit Batters'
  },
  Lucknow: {
    title: 'BRSABV Ekana Cricket Stadium',
    behavior: 'Gripping Black Soil Track',
    boost: '+25% Boost to Off-Cutters & Spinners',
    hint: 'Extremely slow surface where 140-150 is a winning score.',
    favRole: 'Spinners & Slower Ball Specialists'
  },
  Ahmedabad: {
    title: 'Narendra Modi Stadium',
    behavior: 'Pace, Bounce & Red/Black Soil Variation',
    boost: '+20% Boost to Tall Express Seamers',
    hint: 'Generous bounce early on gives fast bowlers a distinct edge in powerplay.',
    favRole: 'Express Pacers & Top Order'
  },
  Dharamsala: {
    title: 'HPCA Stadium',
    behavior: 'High Altitude Swing & Seam Track',
    boost: '+25% Boost to Swing Bowlers',
    hint: 'Cool mountain air generates high lateral movement with the new ball.',
    favRole: 'New Ball Swing Bowlers'
  }
};

import { useStore } from '../../store/useStore';

const TEAM_HOME_CITY: Record<string, string> = {
  rcb: 'Bengaluru',
  csk: 'Chennai',
  mi: 'Mumbai',
  kkr: 'Kolkata',
  srh: 'Hyderabad',
  dc: 'Delhi',
  rr: 'Jaipur',
  lsg: 'Lucknow',
  gt: 'Ahmedabad',
  pbks: 'Dharamsala'
};

export default function PlayingXIPage() {
  const { mySquad, theme } = useStore();
  const [players, setPlayers] = useState<any[]>([]);
  const [squad, setSquad] = useState<string[]>([]);
  const [venue, setVenue] = useState(TEAM_HOME_CITY[theme] || 'Bengaluru');
  const [matchSituation, setMatchSituation] = useState('Neutral');
  const [impactPlayer, setImpactPlayer] = useState(false);
  const [optimizedXi, setOptimizedXi] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const venues = Object.keys(VENUE_INSIGHTS);
  const currentInsight = VENUE_INSIGHTS[venue] || VENUE_INSIGHTS['Chennai'];

  useEffect(() => {
    if (theme && TEAM_HOME_CITY[theme]) {
      setVenue(TEAM_HOME_CITY[theme]);
    }
  }, [theme]);

  useEffect(() => {
    if (mySquad && mySquad.length > 0) {
      setPlayers(mySquad);
      setSquad(mySquad.map(p => p.player_id));
    } else {
      fetch('http://localhost:8000/api/players/')
        .then(res => res.json())
        .then(data => {
          setPlayers(data);
          setSquad(data.slice(0, 18).map((p: any) => p.player_id));
        })
        .catch(err => console.error(err));
    }
  }, [mySquad]);

  const toggleSquadPlayer = (id: string) => {
    if (squad.includes(id)) {
      setSquad(squad.filter(sId => sId !== id));
    } else {
      if (squad.length < 25) setSquad([...squad, id]);
    }
  };

  const optimizeXI = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const selectedPlayerObjects = players.filter(p => squad.includes(p.player_id));
      const res = await fetch('http://localhost:8000/api/playing-xi/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          squad_player_ids: squad, 
          venue, 
          impact_player: impactPlayer, 
          match_situation: matchSituation,
          players_data: selectedPlayerObjects
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.detail || 'Could not find an optimal XI. Ensure your pool has at least 1 WK, 3 BAT, and 3 BOWL.');
        setOptimizedXi(null);
      } else {
        setOptimizedXi(data);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to connect to the optimization service.');
    } finally {
      setLoading(false);
    }
  };

  const displayXi = optimizedXi?.playing_xi || [];

  return (
    <div className="min-h-screen stadium-bg text-white p-6 pt-20 grid-pattern">
      <div className="max-w-7xl mx-auto space-y-6 animate-fade-up">
        
        <div className="glass-panel p-6 rounded-2xl border border-slate-700/50 relative overflow-hidden">
          <h1 className="text-3xl font-display font-bold mb-4 text-[var(--accent-primary)] scoreboard-text">Playing XI Selector</h1>
          
          {errorMsg && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/40 text-red-400 text-sm flex items-center gap-2">
              <AlertCircle size={16} />
              {errorMsg}
            </div>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Control Column */}
            <div className="lg:col-span-1 space-y-5">
              
              {/* Venue Selector */}
              <div>
                <label className="flex items-center gap-2 mb-2 font-semibold text-sm">
                  <MapPin size={16} className="text-[var(--accent-secondary)]" /> Match Venue Pitch Selection
                </label>
                <select 
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white font-semibold focus:outline-none focus:border-[var(--accent-primary)] transition-colors mb-4"
                  value={venue} onChange={(e) => setVenue(e.target.value)}
                >
                  {venues.map(v => <option key={v} value={v}>{v}</option>)}
                </select>

                <label className="flex items-center gap-2 mb-2 font-semibold text-sm mt-4">
                  <Activity size={16} className="text-orange-400" /> Match Situation
                </label>
                <select 
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white font-semibold focus:outline-none focus:border-orange-400 transition-colors"
                  value={matchSituation} onChange={(e) => setMatchSituation(e.target.value)}
                >
                  <option value="Neutral">Neutral (Balanced)</option>
                  <option value="Batting First">Batting First (Bench Bowler)</option>
                  <option value="Bowling First">Bowling First (Bench Batter)</option>
                  <option value="Early Collapse">Early Collapse (Anchor Sub)</option>
                  <option value="Aggressive Finish">Aggressive Finish (Finisher Sub)</option>
                </select>
              </div>

              {/* ─── DYNAMIC VENUE PITCH INSIGHT CARD ───────────── */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-[var(--accent-primary)]/15 via-slate-800/80 to-slate-900 border border-[var(--accent-primary)]/30 space-y-2 animate-fade-up">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent-primary)] flex items-center gap-1.5">
                    <Sparkles size={14} /> Venue Pitch Insights
                  </span>
                  <span className="text-[10px] bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] font-bold px-2 py-0.5 rounded border border-[var(--accent-primary)]/30">
                    {currentInsight.boost}
                  </span>
                </div>

                <div className="font-bold text-sm text-white">
                  {currentInsight.title}
                </div>

                <div className="text-xs text-gray-300 flex items-center gap-1">
                  <Info size={12} className="text-gray-400 shrink-0" />
                  <span><strong>Behavior:</strong> {currentInsight.behavior}</span>
                </div>

                <p className="text-xs text-gray-400 leading-relaxed bg-black/30 p-2.5 rounded-lg border border-white/5">
                  💡 <strong>Tactical Hint:</strong> {currentInsight.hint}
                </p>
              </div>

              {/* Impact Player Toggle */}
              <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                <span className="font-semibold text-xs">Impact Player (12th Man)</span>
                <input 
                  type="checkbox" 
                  checked={impactPlayer} 
                  onChange={(e) => setImpactPlayer(e.target.checked)}
                  className="w-5 h-5 accent-[var(--accent-primary)] cursor-pointer"
                />
              </div>

              {/* Squad Pool Selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-xs text-gray-300">Select Squad Pool ({squad.length}/25)</span>
                  <button onClick={() => setSquad(players.slice(0, 18).map(p => String(p.player_id || p.id)))} className="text-xs text-[var(--accent-primary)] hover:underline font-bold">Select Top 18</button>
                </div>
                <div className="max-h-52 overflow-y-auto pr-1 space-y-1.5 border border-slate-700 rounded-lg p-2 bg-slate-800/30">
                  {players.map(p => {
                    const pId = String(p.player_id || p.id);
                    const selected = squad.includes(pId);
                    return (
                      <div 
                        key={pId} 
                        onClick={() => toggleSquadPlayer(pId)}
                        className={`p-2 rounded flex items-center justify-between text-xs cursor-pointer transition-colors ${selected ? 'bg-[var(--accent-primary)]/20 border border-[var(--accent-primary)]/40 text-white font-bold' : 'bg-slate-800/40 text-gray-400 hover:bg-slate-800'}`}
                      >
                        <span className="truncate max-w-[140px] font-medium">{p.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-[var(--accent-primary)]">₹{(p.predicted_price || p.base_price || 0).toFixed(1)}Cr</span>
                          <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-black/20">{p.role}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Generate Button */}
              <button 
                onClick={optimizeXI}
                disabled={loading || squad.length < 11}
                className="w-full py-3.5 rounded-xl font-bold uppercase tracking-wider text-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                style={{ backgroundColor: 'var(--accent-primary)', color: '#07090f', boxShadow: '0 0 20px var(--accent-glow)' }}
              >
                {loading ? 'Optimizing XI...' : `Generate XI for ${venue}`}
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Field / XI Output Column */}
            <div className="lg:col-span-2 flex flex-col items-center justify-center min-h-[480px] relative glass-panel rounded-xl p-6 border border-white/10">
              {displayXi.length > 0 ? (
                <div className="w-full space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div>
                      <h3 className="font-bold text-lg text-white">Optimized Playing XI</h3>
                      <span className="text-xs text-[var(--accent-primary)] font-medium">Pitch Calibrated for {venue} ({currentInsight.favRole})</span>
                    </div>
                    <div className="text-xs text-gray-400">
                      Total Power: <strong className="scoreboard-text text-white text-base">{(optimizedXi?.total_power || 0).toFixed(1)}</strong>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {displayXi.map((player: any, i: number) => {
                      const isImpact = player.is_impact_player;
                      return (
                        <div key={player.player_id || player.id || i} className={`p-3 bg-slate-800/80 border ${isImpact ? 'border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.3)]' : 'border-slate-700/80 hover:border-[var(--accent-primary)]/50'} rounded-xl flex flex-col justify-between transition-all relative`}>
                          {isImpact && (
                            <div className="absolute -top-2 -right-2 bg-orange-500 text-black text-[9px] font-bold px-1.5 py-0.5 rounded uppercase shadow-lg">
                              Impact Sub
                            </div>
                          )}
                          <div className="flex items-center justify-between mb-1">
                            <div className="font-bold text-sm text-white flex items-center gap-1">
                              <span className={`text-xs ${isImpact ? 'text-orange-400' : 'text-[var(--accent-primary)]'} font-mono`}>#{i + 1}</span> 
                              <span className="truncate max-w-[100px]">{player.name}</span>
                            </div>
                            <div className={`flex items-center gap-1 ${isImpact ? 'text-orange-400' : 'text-[var(--accent-primary)]'} text-xs font-bold font-mono`}>
                              <Zap size={12} className="fill-current" />
                              {(player.adjusted_power || player.Power_Index || 0).toFixed(1)}
                            </div>
                          </div>
                          <div className="text-[10px] text-gray-400 uppercase font-semibold flex items-center gap-2">
                            <span>{player.role}</span>
                            {player.batting_avg > 0 && <span className="opacity-60 text-[9px]">Avg: {player.batting_avg}</span>}
                            {player.batting_sr > 0 && <span className="opacity-60 text-[9px]">SR: {player.batting_sr}</span>}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 space-y-3">
                  <Users size={44} className="mx-auto opacity-30 text-[var(--accent-primary)]" />
                  <p className="text-sm font-medium">Select at least 11 players from your squad pool (or click "Select Top 18") and hit Generate XI.</p>
                  <div className="text-xs text-gray-400 bg-white/5 p-3 rounded-xl border border-white/5 max-w-md mx-auto">
                    ✨ Selecting <strong>{venue}</strong> will automatically weight players using ground-specific pitch behavior & boundary metrics.
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
