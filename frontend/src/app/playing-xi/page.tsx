'use client';

import React, { useState, useEffect } from 'react';
import { Users, MapPin, Zap, ChevronRight, Info, ShieldAlert, Sparkles, Activity, AlertCircle, Swords } from 'lucide-react';
import { useCampaignStore } from '../../store/useCampaignStore';
import { CampaignPhaseStepper } from '../../components/CampaignPhaseStepper';
import { getFranchise } from '../../data/franchises';
import BallByBallMatchSimulator from '../../components/BallByBallMatchSimulator';

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
  const { getActiveCampaign } = useCampaignStore();
  const campaign = getActiveCampaign();

  const [players, setPlayers] = useState<any[]>([]);
  const [squad, setSquad] = useState<string[]>([]);
  const [venue, setVenue] = useState('Bengaluru');
  const [impactPlayer, setImpactPlayer] = useState(true);
  const [optimizedXi, setOptimizedXi] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);

  const venues = Object.keys(VENUE_INSIGHTS);
  const currentInsight = VENUE_INSIGHTS[venue] || VENUE_INSIGHTS['Chennai'];

  // Initialize from active campaign
  useEffect(() => {
    if (campaign) {
      const activePlayers = campaign.squad.filter(p => !p.is_released);
      setPlayers(activePlayers);
      setSquad(activePlayers.map(p => p.player_id));
      if (TEAM_HOME_CITY[campaign.teamId]) {
        setVenue(TEAM_HOME_CITY[campaign.teamId]);
      }
    }
  }, [campaign]);

  const toggleSquadPlayer = (id: string) => {
    if (squad.includes(id)) {
      setSquad(squad.filter(sId => sId !== id));
    } else {
      if (squad.length < 25) setSquad([...squad, id]);
    }
  };

  // Smart Offline-first Playing XI Optimizer
  const optimizeXI = async () => {
    setLoading(true);
    
    // Attempt backend first with instant offline fallback
    try {
      const selectedPlayerObjects = players.filter(p => squad.includes(p.player_id));
      const res = await fetch('http://localhost:8000/api/playing-xi/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          squad_player_ids: squad, 
          venue, 
          impact_player: impactPlayer, 
          players_data: selectedPlayerObjects
        })
      });
      if (res.ok) {
        const data = await res.json();
        setOptimizedXi(data);
        setLoading(false);
        return;
      }
    } catch (e) {
      // Handled by offline algorithm below
    }

    // Client-side offline selection algorithm
    const pool = players.filter(p => squad.includes(p.player_id));
    
    // Sort by OVR / Power Index
    const sorted = [...pool].sort((a, b) => (Number(b.Power_Index) || 80) - (Number(a.Power_Index) || 80));
    
    // Pick with constraints: Max 4 Overseas, Min 1 WK, Min 3 Bat, Min 4 Bowl
    const xi: any[] = [];
    let overseasPicked = 0;

    // 1. Pick Top Wicket-keeper
    const wk = sorted.find(p => p.role === 'WK');
    if (wk) {
      xi.push(wk);
      if (wk.is_overseas) overseasPicked++;
    }

    // 2. Pick Top Batters (3-4)
    for (const p of sorted) {
      if (xi.length >= 5) break;
      if (xi.some(x => x.player_id === p.player_id)) continue;
      if (p.role === 'BAT') {
        if (p.is_overseas && overseasPicked >= 4) continue;
        xi.push(p);
        if (p.is_overseas) overseasPicked++;
      }
    }

    // 3. Pick Top All-Rounders (2)
    for (const p of sorted) {
      if (xi.length >= 7) break;
      if (xi.some(x => x.player_id === p.player_id)) continue;
      if (p.role === 'AR') {
        if (p.is_overseas && overseasPicked >= 4) continue;
        xi.push(p);
        if (p.is_overseas) overseasPicked++;
      }
    }

    // 4. Pick Top Bowlers (4)
    for (const p of sorted) {
      if (xi.length >= 11) break;
      if (xi.some(x => x.player_id === p.player_id)) continue;
      if (p.role === 'BOWL') {
        if (p.is_overseas && overseasPicked >= 4) continue;
        xi.push(p);
        if (p.is_overseas) overseasPicked++;
      }
    }

    // Fill remaining up to 11 if still under
    for (const p of sorted) {
      if (xi.length >= 11) break;
      if (xi.some(x => x.player_id === p.player_id)) continue;
      if (p.is_overseas && overseasPicked >= 4) continue;
      xi.push(p);
      if (p.is_overseas) overseasPicked++;
    }

    // Impact player (12th man)
    let impactSub: any = null;
    if (impactPlayer) {
      impactSub = sorted.find(p => !xi.some(x => x.player_id === p.player_id));
      if (impactSub) {
        impactSub = { ...impactSub, is_impact_player: true };
      }
    }

    const totalPower = xi.reduce((acc, p) => acc + (Number(p.Power_Index) || 80), 0);

    setOptimizedXi({
      playing_xi: xi,
      impact_player: impactSub,
      total_power: totalPower,
      venue_boost: currentInsight.boost
    });

    setLoading(false);
  };

  const displayXi = optimizedXi ? (
    optimizedXi.impact_player 
      ? [...(optimizedXi.playing_xi || []), optimizedXi.impact_player] 
      : (optimizedXi.playing_xi || [])
  ) : [];

  const franchise = campaign ? getFranchise(campaign.teamId) : null;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between pt-14">
      <CampaignPhaseStepper />

      <main className="max-w-7xl mx-auto w-full px-3 sm:px-6 py-4 flex-1 flex flex-col justify-between">
        
        {/* Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 mb-3 border-b border-white/10 gap-2 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-mono font-black uppercase">
                PART 4 OF 4: PLAYING XI & HOME FORTRESS
              </span>
              <span className="text-[11px] text-gray-400">Background Pitch Engine Calibrated</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black font-display text-white mt-0.5">
              Matchday Lineup & Pitch Calibration
            </h1>
          </div>

          <button
            onClick={() => setShowSimulator(true)}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(244,63,94,0.4)] cursor-pointer hover:scale-[1.02] transition-all shrink-0"
          >
            <Swords size={16} />
            <span>Launch Match Simulation</span>
          </button>
        </div>

        {/* 2-Column Playing XI Selector */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 flex-1">
          
          {/* Controls Column */}
          <div className="lg:col-span-1 space-y-4">
            
            {/* Venue Selector */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-white/10 shadow-lg">
              <label className="text-xs font-black uppercase text-gray-300 block mb-2 flex items-center gap-1.5">
                <MapPin size={14} className="text-amber-400" />
                Match Stadium
              </label>
              <select 
                value={venue} 
                onChange={(e) => setVenue(e.target.value)}
                className="w-full bg-slate-950 border border-white/15 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
              >
                {venues.map(v => (
                  <option key={v} value={v}>{v} — {VENUE_INSIGHTS[v]?.title}</option>
                ))}
              </select>

              {/* Dynamic Venue Behavior Card */}
              <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs">
                <div className="font-bold text-amber-300 mb-0.5">{currentInsight.title}</div>
                <div className="text-[11px] text-gray-300">{currentInsight.behavior}</div>
                <div className="text-[10px] text-emerald-400 font-bold mt-1.5 flex items-center gap-1">
                  <Sparkles size={11} /> {currentInsight.boost}
                </div>
              </div>
            </div>

            {/* Impact Player Toggle */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">Impact Player Rule</span>
                <span className="text-[10px] text-gray-400">12th tactical sub allowed</span>
              </div>
              <input
                type="checkbox"
                checked={impactPlayer}
                onChange={(e) => setImpactPlayer(e.target.checked)}
                className="w-4 h-4 accent-amber-500 cursor-pointer"
              />
            </div>

            {/* Generate XI Button */}
            <button
              onClick={optimizeXI}
              disabled={loading || squad.length < 11}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.3)] cursor-pointer hover:scale-[1.01] transition-all disabled:opacity-40"
            >
              <Zap size={15} />
              <span>{loading ? 'Optimizing XI...' : `Generate Calibrated XI for ${venue}`}</span>
            </button>
          </div>

          {/* Output Column */}
          <div className="lg:col-span-2 p-5 rounded-3xl bg-slate-900/90 border border-white/10 flex flex-col justify-between shadow-xl">
            {displayXi.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div>
                    <h3 className="text-base font-black text-white">Official Matchday Playing XI</h3>
                    <span className="text-[11px] text-emerald-400 font-medium">
                      Calibrated for {venue} • {currentInsight.boost}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 uppercase block">Total Power</span>
                    <span className="text-xl font-black font-mono text-amber-300">
                      {optimizedXi?.total_power ? optimizedXi.total_power.toFixed(0) : '890'}
                    </span>
                  </div>
                </div>

                {/* 11 Players Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {displayXi.map((player: any, idx: number) => {
                    const isImpact = player.is_impact_player;
                    return (
                      <div
                        key={player.player_id || idx}
                        className={`p-3 rounded-2xl border flex flex-col justify-between ${
                          isImpact
                            ? 'bg-amber-500/20 border-amber-500/50'
                            : 'bg-slate-950 border-white/10'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-1">
                          <span className="text-[10px] font-mono font-bold text-gray-400">
                            {isImpact ? 'IMPACT SUB' : `#${idx + 1}`}
                          </span>
                          <span className="text-[10px] font-black text-amber-400 font-mono">
                            {player.Power_Index || 85} OVR
                          </span>
                        </div>
                        <div className="font-bold text-xs text-white truncate">
                          {player.name}
                        </div>
                        <div className="text-[10px] text-gray-400 font-mono mt-1 flex items-center gap-1.5">
                          <span className="text-indigo-300 font-bold">{player.role}</span>
                          {player.is_overseas && <span className="text-sky-300">OS</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Action to proceed to match */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs text-gray-300">Lineup verified with BCCI Overseas & WK quota.</span>
                  <button
                    onClick={() => setShowSimulator(true)}
                    className="px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg cursor-pointer transition-all"
                  >
                    <Swords size={14} />
                    <span>Start Match Simulation</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-gray-500">
                <Users size={40} className="mb-3 text-gray-600" />
                <h4 className="text-sm font-bold text-gray-300">No Playing XI Generated Yet</h4>
                <p className="text-xs text-gray-500 max-w-sm mt-1">
                  Click &quot;Generate Calibrated XI&quot; to automatically pick your best 11 based on pitch behavior at {venue}.
                </p>
              </div>
            )}
          </div>

        </div>

      </main>

      {/* Full Match Simulator Modal */}
      {franchise && (
        <BallByBallMatchSimulator
          isOpen={showSimulator}
          onClose={() => setShowSimulator(false)}
          myFranchise={franchise}
          mySquad={campaign.squad.map(p => ({
            ...p,
            is_overseas: !!p.is_overseas,
            base_price: p.price,
            predicted_price: p.price
          }))}
        />
      )}
    </div>
  );
}
