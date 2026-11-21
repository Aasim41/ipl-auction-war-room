'use client';

import React, { useState, useEffect } from 'react';
import { Swords, MapPin } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { useStore } from '../../store/useStore';

export default function WinProbabilityPage() {
  const [players, setPlayers] = useState<any[]>([]);
  const [teamA, setTeamA] = useState<string[]>([]);
  const [teamB, setTeamB] = useState<string[]>([]);
  const [venue, setVenue] = useState('Mumbai');
  const [probability, setProbability] = useState<any>(null);

  const venues = ['Chennai', 'Mumbai', 'Kolkata', 'Hyderabad', 'Bengaluru', 'Delhi', 'Jaipur', 'Lucknow', 'Ahmedabad', 'Dharamsala'];

  const { mySquad } = useStore();

  useEffect(() => {
    fetch('http://localhost:8000/api/players/')
      .then(res => res.json())
      .then(data => {
        const normalized = data.map((p: any) => ({
          ...p,
          player_id: String(p.player_id || p.id),
          Power_Index: Number(p.Power_Index || p.power_index || 0)
        }));
        setPlayers(normalized);
        
        // Auto-fill Team A with mySquad if available
        if (mySquad && mySquad.length > 0) {
          const squadIds = mySquad.map((p: any) => String(p.player_id || p.id)).slice(0, 11);
          setTeamA(squadIds);
        }
      })
      .catch(err => console.error(err));
  }, [mySquad]);

  const calculateWinProb = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/win-probability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ team_a_ids: teamA, team_b_ids: teamB, venue })
      });
      const data = await res.json();
      setProbability(data);
    } catch (err) {
      console.error(err);
    }
  };

  const togglePlayer = (teamIds: string[], setTeamIds: any, id: string) => {
    if (teamIds.includes(id)) {
      setTeamIds(teamIds.filter(pid => pid !== id));
    } else {
      if (teamIds.length < 11) setTeamIds([...teamIds, id]);
    }
  };

  const chartData = probability ? [
    { name: 'Team A', value: probability.team_a_win_prob || probability.team_a_prob || 50 },
    { name: 'Team B', value: probability.team_b_win_prob || probability.team_b_prob || 50 },
  ] : [];

  return (
    <div className="min-h-screen bg-transparent text-white p-6 pt-20">
      <div className="max-w-7xl mx-auto space-y-8 animate-fade-up">
        
        <div className="glass-panel p-8 rounded-3xl border border-slate-700/50 flex flex-col md:flex-row items-center justify-between gap-8">
          
          {/* Team A Picker */}
          <div className="flex-1 w-full">
            <h2 className="text-xl font-display text-[var(--accent-primary)] mb-4 text-center scoreboard-text">TEAM A SQUAD ({teamA.length}/11)</h2>
            <div className="h-56 overflow-y-auto bg-slate-800/50 rounded-xl p-2 custom-scrollbar grid grid-cols-2 gap-2 border border-slate-700">
              {players.map(p => {
                const pId = p.player_id;
                const selected = teamA.includes(pId);
                return (
                  <div 
                    key={pId} 
                    onClick={() => togglePlayer(teamA, setTeamA, pId)}
                    className={`p-2.5 rounded cursor-pointer text-xs flex justify-between items-center transition-colors ${selected ? 'bg-[var(--accent-primary)] text-slate-900 font-bold' : 'hover:bg-slate-700 text-slate-300 bg-slate-800/40'}`}
                  >
                    <span className="truncate">{p.name}</span>
                    <span className="text-[10px] opacity-75">{p.role}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Controls Column */}
          <div className="flex flex-col items-center gap-6 shrink-0">
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-600">
              <label className="flex items-center gap-2 mb-2 text-sm text-slate-400">
                <MapPin size={16} /> Match Venue
              </label>
              <select 
                className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white outline-none"
                value={venue} onChange={(e) => setVenue(e.target.value)}
              >
                {venues.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>

            <div className="text-5xl font-display font-black text-slate-700 scoreboard-text opacity-50">VS</div>
            
            <button 
              onClick={calculateWinProb}
              disabled={teamA.length < 1 || teamB.length < 1}
              className="bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-slate-900 font-bold px-8 py-4 rounded-full shadow-[var(--accent-glow)] hover:scale-105 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Swords /> CALCULATE ODDS
            </button>
          </div>

          {/* Team B Picker */}
          <div className="flex-1 w-full">
            <h2 className="text-xl font-display text-[var(--accent-secondary)] mb-4 text-center scoreboard-text">TEAM B SQUAD ({teamB.length}/11)</h2>
            <div className="h-56 overflow-y-auto bg-slate-800/50 rounded-xl p-2 custom-scrollbar grid grid-cols-2 gap-2 border border-slate-700">
              {players.map(p => {
                const pId = p.player_id;
                const selected = teamB.includes(pId);
                return (
                  <div 
                    key={pId} 
                    onClick={() => togglePlayer(teamB, setTeamB, pId)}
                    className={`p-2.5 rounded cursor-pointer text-xs flex justify-between items-center transition-colors ${selected ? 'bg-[var(--accent-secondary)] text-slate-900 font-bold' : 'hover:bg-slate-700 text-slate-300 bg-slate-800/40'}`}
                  >
                    <span className="truncate">{p.name}</span>
                    <span className="text-[10px] opacity-75">{p.role}</span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Results Panel */}
        {probability && (
          <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row items-center gap-8 animate-fade-up">
            <div className="w-64 h-64 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={4}>
                    <Cell fill="var(--accent-primary)" />
                    <Cell fill="var(--accent-secondary)" />
                  </Pie>
                  <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center font-display text-xl font-bold">
                <span>{(probability.team_a_win_prob || probability.team_a_prob || 50).toFixed(0)}%</span>
                <span className="text-xs text-gray-400 font-normal">Team A Win Odds</span>
              </div>
            </div>

            <div className="flex-1 space-y-3">
              <h3 className="text-xl font-bold text-[var(--accent-primary)]">Match Prediction Summary</h3>
              <p className="text-sm text-gray-300">
                Simulation based on squad aggregate Power Index at {venue} pitch condition.
              </p>
              {probability.key_matchups && (
                <div className="space-y-1">
                  <span className="text-xs uppercase font-bold text-gray-400">Key Matchups:</span>
                  {probability.key_matchups.map((m: string, i: number) => (
                    <div key={i} className="text-xs text-gray-300">• {m}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
