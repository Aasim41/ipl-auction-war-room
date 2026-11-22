'use client';

import { useState, useEffect } from 'react';
import { Zap, Settings2, SlidersHorizontal, Users, Lock, ChevronDown } from 'lucide-react';

interface Player {
  id: string;
  name: string;
  role: string;
  nationality: string;
  base_price: number;
  power_index: number;
}

export default function OptimizerPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [budget, setBudget] = useState(125);
  const [maxOverseas, setMaxOverseas] = useState(8);
  const [minBowlers, setMinBowlers] = useState(5);
  const [minWk, setMinWk] = useState(1);
  const [squadSize, setSquadSize] = useState(25);
  
  const [lockedPlayers, setLockedPlayers] = useState<Player[]>([]);
  const [search, setSearch] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  const [optimizedSquad, setOptimizedSquad] = useState<Player[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetch('http://localhost:8000/api/players/')
      .then(res => res.json())
      .then(data => setPlayers(data))
      .catch(err => console.error(err));
  }, []);

  const handleOptimize = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/optimize/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          budget: budget,
          locked_players: lockedPlayers.map(p => p.id),
          constraints: {
            max_overseas: maxOverseas,
            min_bowlers: minBowlers,
            min_wk: minWk,
            squad_size: squadSize
          }
        })
      });
      const data = await res.json();
      if (data.squad) {
        setOptimizedSquad(data.squad);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleLockedPlayer = (player: Player) => {
    if (lockedPlayers.find(p => p.id === player.id)) {
      setLockedPlayers(lockedPlayers.filter(p => p.id !== player.id));
    } else {
      setLockedPlayers([...lockedPlayers, player]);
    }
  };

  const filteredSearch = players.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const totalCost = optimizedSquad ? optimizedSquad.reduce((sum, p) => sum + p.base_price, 0) : 0;
  const totalPower = optimizedSquad ? optimizedSquad.reduce((sum, p) => sum + p.power_index, 0) : 0;

  const groupedSquad = optimizedSquad?.reduce((acc, player) => {
    if (!acc[player.role]) acc[player.role] = [];
    acc[player.role].push(player);
    return acc;
  }, {} as Record<string, Player[]>);

  return (
    <div className="min-h-screen bg-transparent text-slate-100 px-4 sm:px-6 safe-page-top pb-16 font-sans animate-fade-up">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
        
        {/* Left Control Panel */}
        <div className="w-full lg:w-1/3 glass-panel p-6 rounded-2xl flex flex-col gap-6" style={{ borderColor: 'var(--accent-primary, #4f46e5)' }}>
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
              <Settings2 className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-display font-bold">PuLP Optimizer</h2>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm text-slate-300 font-medium flex items-center gap-2"><SlidersHorizontal className="w-4 h-4" /> Total Budget</label>
                <span className="scoreboard-text text-indigo-300">{budget} Cr</span>
              </div>
              <input type="range" min="50" max="125" value={budget} onChange={(e) => setBudget(Number(e.target.value))} className="w-full accent-indigo-500" />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm text-slate-300 font-medium">Max Overseas</label>
                <span className="scoreboard-text">{maxOverseas}</span>
              </div>
              <input type="range" min="1" max="8" value={maxOverseas} onChange={(e) => setMaxOverseas(Number(e.target.value))} className="w-full accent-indigo-500" />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm text-slate-300 font-medium">Min Bowlers</label>
                <span className="scoreboard-text">{minBowlers}</span>
              </div>
              <input type="range" min="1" max="8" value={minBowlers} onChange={(e) => setMinBowlers(Number(e.target.value))} className="w-full accent-indigo-500" />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm text-slate-300 font-medium">Min Wicket-Keepers</label>
                <span className="scoreboard-text">{minWk}</span>
              </div>
              <input type="range" min="1" max="4" value={minWk} onChange={(e) => setMinWk(Number(e.target.value))} className="w-full accent-indigo-500" />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm text-slate-300 font-medium">Target Squad Size</label>
                <span className="scoreboard-text">{squadSize}</span>
              </div>
              <input type="range" min="15" max="25" value={squadSize} onChange={(e) => setSquadSize(Number(e.target.value))} className="w-full accent-indigo-500" />
            </div>

            <div className="relative">
              <label className="text-sm text-slate-300 font-medium flex items-center gap-2 mb-2"><Lock className="w-4 h-4" /> Locked Players</label>
              
              <div 
                className="bg-slate-900/50 border border-slate-700 rounded-lg p-3 min-h-[3rem] cursor-text flex flex-wrap gap-2 items-center"
                onClick={() => setDropdownOpen(true)}
              >
                {lockedPlayers.map(p => (
                  <span key={p.id} className="bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded text-sm flex items-center gap-1 border border-indigo-500/30">
                    {p.name} <button onClick={(e) => { e.stopPropagation(); toggleLockedPlayer(p); }} className="hover:text-white ml-1">&times;</button>
                  </span>
                ))}
                <input 
                  type="text" 
                  className="bg-transparent border-none focus:outline-none flex-1 min-w-[100px] text-sm"
                  placeholder={lockedPlayers.length === 0 ? "Search to lock players..." : ""}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onFocus={() => setDropdownOpen(true)}
                />
                <ChevronDown className="w-4 h-4 text-slate-500" />
              </div>

              {dropdownOpen && (
                <div className="absolute z-10 top-full mt-1 w-full bg-slate-800 border border-slate-700 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                  <div className="flex justify-end p-1 sticky top-0 bg-slate-800 border-b border-slate-700">
                     <button onClick={() => setDropdownOpen(false)} className="text-xs text-slate-400 hover:text-white p-1">Close</button>
                  </div>
                  {filteredSearch.map(p => {
                    const isLocked = lockedPlayers.some(lp => lp.id === p.id);
                    return (
                      <div 
                        key={p.id} 
                        className={`p-2 hover:bg-slate-700 cursor-pointer text-sm flex justify-between ${isLocked ? 'bg-indigo-500/10 text-indigo-300' : ''}`}
                        onClick={() => toggleLockedPlayer(p)}
                      >
                        <span>{p.name}</span>
                        <span className="text-slate-500">{p.role}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <button 
            onClick={handleOptimize}
            disabled={isLoading}
            className="mt-4 w-full py-4 rounded-xl text-white font-black text-lg tracking-wider transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.6)] flex justify-center items-center gap-2"
            style={{ backgroundColor: 'var(--accent-primary, #4f46e5)' }}
          >
            {isLoading ? (
              <span className="animate-pulse">RUNNING MODEL...</span>
            ) : (
              <><Zap className="w-6 h-6" /> RUN OPTIMIZER</>
            )}
          </button>
        </div>

        {/* Right Results Area */}
        <div className="w-full lg:w-2/3 flex flex-col gap-6">
          {optimizedSquad ? (
            <div className="animate-scale-in">
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="glass-panel p-4 rounded-xl border border-white/5 bg-slate-800/40 text-center">
                  <div className="text-slate-400 text-sm uppercase tracking-wider mb-2">Total Cost</div>
                  <div className="text-3xl scoreboard-text text-white">{totalCost.toFixed(2)} <span className="text-lg text-slate-500">Cr</span></div>
                </div>
                <div className="glass-panel p-4 rounded-xl border border-white/5 bg-slate-800/40 text-center">
                  <div className="text-slate-400 text-sm uppercase tracking-wider mb-2">Remaining</div>
                  <div className={`text-3xl scoreboard-text ${(budget - totalCost) < 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {(budget - totalCost).toFixed(2)} <span className="text-lg text-green-500/50">Cr</span>
                  </div>
                </div>
                <div className="glass-panel p-4 rounded-xl border border-white/5 bg-slate-800/40 text-center relative overflow-hidden">
                  <div className="absolute -right-4 -bottom-4 opacity-5"><Zap className="w-24 h-24" /></div>
                  <div className="text-slate-400 text-sm uppercase tracking-wider mb-2">Total Power Index</div>
                  <div className="text-3xl scoreboard-text text-yellow-400 flex items-center justify-center gap-2">
                    <Zap className="w-6 h-6 fill-current" /> {totalPower}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {['Batter', 'Wicket-Keeper', 'All-Rounder', 'Bowler'].map(role => {
                  const rolePlayers = groupedSquad?.[role] || [];
                  if (rolePlayers.length === 0) return null;
                  
                  return (
                    <div key={role} className="glass-panel p-6 rounded-xl border border-white/5 bg-slate-900/60">
                      <h3 className="text-lg font-bold text-slate-300 mb-4 border-b border-white/10 pb-2">{role}s <span className="text-slate-500 font-normal ml-2">({rolePlayers.length})</span></h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {rolePlayers.map(p => (
                          <div key={p.id} className="bg-slate-800/80 p-3 rounded-lg border border-slate-700 flex flex-col relative overflow-hidden group">
                            {lockedPlayers.some(lp => lp.id === p.id) && (
                              <div className="absolute top-0 right-0 bg-indigo-500/20 p-1 rounded-bl-lg border-b border-l border-indigo-500/30">
                                <Lock className="w-3 h-3 text-indigo-400" />
                              </div>
                            )}
                            <div className="font-semibold text-lg flex justify-between items-start mb-1">
                              <span>{p.name} {p.nationality === 'India' ? '🇮🇳' : '🌍'}</span>
                            </div>
                            <div className="flex justify-between items-center mt-auto pt-2 border-t border-slate-700/50">
                              <span className="text-slate-300 font-mono text-sm">{p.base_price.toFixed(1)} Cr</span>
                              <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold font-mono">
                                {p.role}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="h-full glass-panel rounded-2xl border border-white/5 bg-slate-800/20 flex flex-col items-center justify-center p-12 text-center text-slate-500 border-dashed">
              <Zap className="w-16 h-16 mb-4 opacity-20" />
              <h3 className="text-2xl font-display mb-2">No Optimization Run Yet</h3>
              <p className="max-w-md mx-auto">Set your constraints on the left and click "Run Optimizer" to let PuLP find the mathematically optimal squad for your budget.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
