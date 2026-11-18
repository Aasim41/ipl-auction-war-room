'use client'

import { useEffect, useState } from 'react'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { Search } from 'lucide-react'

type Player = {
  player_id: string
  name: string
  role: string
  specific_role: string
  base_price: number
  Power_Index: number
  team_name: string
  nationality: string
  is_overseas: boolean
  capped_status: string
  matches_played: number
  seasons_played: number
  batting_sr: number | null
  batting_avg: number | null
  bowling_econ: number | null
  bowling_wpm: number | null
  bowling_style: string | null
}

const getRoleColorHex = (role: string) => {
  switch(role) {
    case 'BAT': return '#38bdf8'; // sky-400
    case 'BOWL': return '#fb7185'; // rose-400
    case 'AR': return '#fbbf24'; // amber-400
    case 'WK': return '#34d399'; // emerald-400
    default: return '#fbbf24';
  }
}

export default function ComparePlayers() {
  const [players, setPlayers] = useState<Player[]>([])
  const [playerA, setPlayerA] = useState<Player | null>(null)
  const [playerB, setPlayerB] = useState<Player | null>(null)
  const [searchA, setSearchA] = useState('')
  const [searchB, setSearchB] = useState('')

  useEffect(() => {
    fetch('http://localhost:8000/api/players/')
      .then(r => r.json())
      .then((data: Player[]) => {
        setPlayers(data)
        // Pick top 2 as defaults
        if (data.length > 1) {
          const sorted = [...data].sort((a,b) => b.Power_Index - a.Power_Index)
          setPlayerA(sorted[0])
          setPlayerB(sorted[1])
        }
      })
  }, [])

  // Normalize stats for radar chart (0-100 scale roughly)
  const normalizeScore = (val: number | null, max: number, inverse = false) => {
    if (val === null || val === undefined) return 10
    let score = (val / max) * 100
    if (inverse) {
      score = 100 - score
    }
    return Math.max(10, Math.min(100, score))
  }

  const chartData = [
    {
      metric: 'Power Index',
      TeamA: playerA ? normalizeScore(playerA.Power_Index, 100) : 0,
      TeamB: playerB ? normalizeScore(playerB.Power_Index, 100) : 0,
    },
    {
      metric: 'Batting Strike Rate',
      TeamA: playerA ? normalizeScore(playerA.batting_sr, 200) : 0,
      TeamB: playerB ? normalizeScore(playerB.batting_sr, 200) : 0,
    },
    {
      metric: 'Batting Average',
      TeamA: playerA ? normalizeScore(playerA.batting_avg, 50) : 0,
      TeamB: playerB ? normalizeScore(playerB.batting_avg, 50) : 0,
    },
    {
      metric: 'Bowling Economy (Inv)',
      // Economy is better when lower. Max expected is ~12. Inverse scoring.
      TeamA: playerA && playerA.bowling_econ ? normalizeScore(playerA.bowling_econ, 12, true) : 0,
      TeamB: playerB && playerB.bowling_econ ? normalizeScore(playerB.bowling_econ, 12, true) : 0,
    },
    {
      metric: 'Wickets Per Match',
      TeamA: playerA ? normalizeScore(playerA.bowling_wpm, 2) : 0,
      TeamB: playerB ? normalizeScore(playerB.bowling_wpm, 2) : 0,
    },
  ]

  return (
    <div className="min-h-screen text-white p-6 pt-24 font-sans max-w-6xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-black font-display uppercase tracking-widest text-[var(--accent-primary)] mb-2">Head-to-Head Comparison</h1>
        <p className="text-gray-400 max-w-2xl mx-auto">Compare player analytics and overall value in the mega auction.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        {/* Player A Selector & Card */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search Player A..." 
              value={searchA}
              onChange={e => setSearchA(e.target.value)}
              className="w-full bg-[var(--input)] border border-[var(--accent-primary)]/50 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
            />
            {searchA && (
              <div className="absolute z-10 w-full mt-1 bg-[#0d1117] border border-white/10 rounded-lg max-h-48 overflow-y-auto shadow-xl">
                {players.filter(p => p.name.toLowerCase().includes(searchA.toLowerCase())).slice(0, 10).map((p, i) => (
                  <div 
                    key={p.player_id || i}
                    className="p-2 hover:bg-white/10 cursor-pointer text-sm"
                    onClick={() => { setPlayerA(p); setSearchA('') }}
                  >
                    {p.name} <span className="text-xs text-gray-500">({p.role})</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {playerA && (
            <div className="card-profile">
              <div className="prof-photo" style={{ background: getRoleColorHex(playerA.role) }}>
                <div className="prof-avatar" style={{ color: getRoleColorHex(playerA.role) }}>{playerA.role}</div>
                <div className="prof-status-badge text-black">₹{playerA.base_price} Cr</div>
              </div>
              <div className="prof-body">
                <div className="prof-handle">{playerA.team_name} • {playerA.nationality}</div>
                <h2 className="prof-name">{playerA.name}</h2>
                <div className="prof-bio" style={{ borderLeftColor: getRoleColorHex(playerA.role) }}>
                  {playerA.capped_status} | {playerA.seasons_played} Seasons<br/>
                  {playerA.is_overseas ? 'Overseas' : 'Domestic'} | {playerA.specific_role || 'Main'}
                </div>
              </div>
              <div className="prof-stats">
                <div className="pstat">
                  <span className="psv">{playerA.role}</span>
                  <span className="psl">Specialty</span>
                </div>
                <div className="pstat">
                  <span className="psv">{playerA.batting_sr ? playerA.batting_sr.toFixed(0) : '-'}</span>
                  <span className="psl">Bat SR</span>
                </div>
                <div className="pstat">
                  <span className="psv">{playerA.bowling_wpm ? playerA.bowling_wpm.toFixed(1) : '-'}</span>
                  <span className="psl">Wkt/M</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Player B Selector & Card */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search Player B..." 
              value={searchB}
              onChange={e => setSearchB(e.target.value)}
              className="w-full bg-[var(--input)] border border-emerald-500/50 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            {searchB && (
              <div className="absolute z-10 w-full mt-1 bg-[#0d1117] border border-white/10 rounded-lg max-h-48 overflow-y-auto shadow-xl">
                {players.filter(p => p.name.toLowerCase().includes(searchB.toLowerCase())).slice(0, 10).map((p, i) => (
                  <div 
                    key={p.player_id || i}
                    className="p-2 hover:bg-white/10 cursor-pointer text-sm"
                    onClick={() => { setPlayerB(p); setSearchB('') }}
                  >
                    {p.name} <span className="text-xs text-gray-500">({p.role})</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {playerB && (
            <div className="card-profile">
              <div className="prof-photo" style={{ background: getRoleColorHex(playerB.role) }}>
                <div className="prof-avatar" style={{ color: getRoleColorHex(playerB.role) }}>{playerB.role}</div>
                <div className="prof-status-badge text-black">₹{playerB.base_price} Cr</div>
              </div>
              <div className="prof-body">
                <div className="prof-handle">{playerB.team_name} • {playerB.nationality}</div>
                <h2 className="prof-name">{playerB.name}</h2>
                <div className="prof-bio" style={{ borderLeftColor: getRoleColorHex(playerB.role) }}>
                  {playerB.capped_status} | {playerB.seasons_played} Seasons<br/>
                  {playerB.is_overseas ? 'Overseas' : 'Domestic'} | {playerB.specific_role || 'Main'}
                </div>
              </div>
              <div className="prof-stats">
                <div className="pstat">
                  <span className="psv">{playerB.role}</span>
                  <span className="psl">Specialty</span>
                </div>
                <div className="pstat">
                  <span className="psv">{playerB.batting_sr ? playerB.batting_sr.toFixed(0) : '-'}</span>
                  <span className="psl">Bat SR</span>
                </div>
                <div className="pstat">
                  <span className="psv">{playerB.bowling_wpm ? playerB.bowling_wpm.toFixed(1) : '-'}</span>
                  <span className="psl">Wkt/M</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Radar Chart Performance Analyzer */}
      {playerA && playerB && (
        <div className="rounded-xl border border-gray-700/50 bg-slate-900/80 backdrop-blur p-8 shadow-2xl max-w-4xl mx-auto mb-20">
          <h2 className="text-xl font-bold text-white mb-6 text-center uppercase tracking-widest font-display">Performance Analyzer</h2>
          
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  itemStyle={{ color: '#e2e8f0' }}
                  formatter={(value, name) => [
                    `${Number(value ?? 0).toFixed(0)} (normalized)`,
                    name === 'TeamA' ? playerA.name : playerB.name
                  ]}
                />
                <Legend 
                  formatter={(value) => <span className="text-slate-300 font-semibold ml-2">{value === 'TeamA' ? playerA.name : playerB.name}</span>} 
                />
                <Radar
                  name="TeamA"
                  dataKey="TeamA"
                  stroke="#4f46e5"
                  strokeWidth={3}
                  fill="#4f46e5"
                  fillOpacity={0.4}
                />
                <Radar
                  name="TeamB"
                  dataKey="TeamB"
                  stroke="#10b981"
                  strokeWidth={3}
                  fill="#10b981"
                  fillOpacity={0.4}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}
