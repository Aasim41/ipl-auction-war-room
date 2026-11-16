'use client';

import React, { useState, useEffect } from 'react';
import { ArrowRightLeft, Scale, Plus, X, Search, TrendingUp, TrendingDown } from 'lucide-react';

export default function TradeSimulatorPage() {
  const [players, setPlayers] = useState<any[]>([]);
  const [teamA, setTeamA] = useState<any[]>([]);
  const [teamB, setTeamB] = useState<any[]>([]);
  const [searchA, setSearchA] = useState('');
  const [searchB, setSearchB] = useState('');
  const [evaluation, setEvaluation] = useState<any>(null);

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
      })
      .catch(err => console.error(err));
  }, []);

  const evaluateTrade = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/trade/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          team_a_ids: teamA.map(p => p.player_id), 
          team_b_ids: teamB.map(p => p.player_id) 
        })
      });
      const data = await res.json();
      setEvaluation(data);
    } catch (err) {
      console.error(err);
    }
  };

  const renderTeamColumn = (title: string, team: any[], setTeam: any, search: string, setSearch: any) => {
    const filteredPlayers = players.filter(p => 
      p.name.toLowerCase().includes(search.toLowerCase()) && 
      !team.some(tp => tp.player_id === p.player_id)
    );
    
    return (
      <div className="flex-1 glass-panel p-6 rounded-2xl border border-slate-700/50 flex flex-col h-[550px]">
        <h2 className="text-2xl font-display font-bold text-center mb-4 text-[var(--accent-primary)] scoreboard-text">{title}</h2>
        
        <div className="relative mb-4">
          <Search className="absolute left-3 top-3 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search player name to add..." 
            className="w-full bg-slate-800 border border-slate-600 rounded-lg pl-10 p-3 text-white focus:outline-none focus:border-[var(--accent-primary)] text-sm"
            value={search} onChange={(e) => setSearch(e.target.value)}
          />
          {search && filteredPlayers.length > 0 && (
            <div className="absolute z-20 w-full bg-slate-800 border border-slate-600 rounded-lg mt-1 max-h-48 overflow-y-auto shadow-2xl">
              {filteredPlayers.map(p => (
                <div 
                  key={p.player_id} 
                  className="p-3 hover:bg-slate-700 cursor-pointer flex justify-between items-center text-xs"
                  onClick={() => { setTeam([...team, p]); setSearch(''); }}
                >
                  <span className="font-semibold">{p.name} ({p.role})</span>
                  <Plus size={16} className="text-[var(--accent-primary)]" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar">
          {team.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-gray-500 border border-dashed border-white/10 rounded-xl p-4 text-center">
              Search & select players to include in trade proposal.
            </div>
          ) : (
            team.map(p => (
              <div key={p.player_id} className="glass-panel p-3.5 rounded-xl border border-slate-700 flex justify-between items-center animate-fade-up">
                <div>
                  <div className="font-bold text-sm text-white">{p.name}</div>
                  <div className="text-xs text-slate-400">{p.role} • ₹{p.base_price} Cr</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="scoreboard-text text-[var(--accent-secondary)] text-base font-bold">{p.Power_Index.toFixed(1)}</div>
                  <button onClick={() => setTeam(team.filter(tp => tp.player_id !== p.player_id))} className="text-slate-500 hover:text-red-400">
                    <X size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-900 stadium-bg text-white p-6 pt-20 grid-pattern">
      <div className="max-w-7xl mx-auto space-y-8 animate-fade-up">
        
        <div className="flex flex-col lg:flex-row gap-6 items-center">
          {renderTeamColumn('TEAM A TRADES AWAY', teamA, setTeamA, searchA, setSearchA)}
          
          <div className="flex flex-col items-center gap-4 shrink-0">
            <Scale size={36} className="text-[var(--accent-primary)] animate-pulse" />
            <button 
              onClick={evaluateTrade}
              disabled={teamA.length === 0 || teamB.length === 0}
              className="bg-[var(--accent-primary)] text-slate-900 font-bold px-6 py-3 rounded-full shadow-[var(--accent-glow)] hover:scale-105 transition-all text-sm uppercase tracking-wider cursor-pointer disabled:opacity-50"
            >
              Evaluate Trade
            </button>
          </div>

          {renderTeamColumn('TEAM B TRADES AWAY', teamB, setTeamB, searchB, setSearchB)}
        </div>

        {/* Evaluation Output */}
        {evaluation && (
          <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4 animate-fade-up">
            <h3 className="text-xl font-bold text-[var(--accent-primary)] flex items-center gap-2">
              <ArrowRightLeft size={20} /> Trade Analysis Output
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                <div className="text-xs text-gray-400 uppercase">Team A Net Power Index Delta</div>
                <div className={`text-2xl font-bold scoreboard-text mt-1 ${(evaluation.team_a_delta || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {(evaluation.team_a_delta || 0) >= 0 ? '+' : ''}{(evaluation.team_a_delta || 0).toFixed(1)}
                </div>
              </div>
              <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                <div className="text-xs text-gray-400 uppercase">Team B Net Power Index Delta</div>
                <div className={`text-2xl font-bold scoreboard-text mt-1 ${(evaluation.team_b_delta || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {(evaluation.team_b_delta || 0) >= 0 ? '+' : ''}{(evaluation.team_b_delta || 0).toFixed(1)}
                </div>
              </div>
            </div>
            {evaluation.recommendation && (
              <div className="p-3 bg-white/5 rounded-lg border border-white/10 text-xs text-gray-300">
                <strong>Verdict:</strong> {evaluation.recommendation}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
