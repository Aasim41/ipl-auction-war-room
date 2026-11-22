'use client'

import { useState } from 'react'
import { List } from 'react-window'
import { Search, X, Zap, Activity, Shield, Flame, Award, BarChart2 } from 'lucide-react'
import { usePlayerData } from '../../lib/usePlayerData'

type Player = {
  player_id: string
  name: string
  nationality: string
  is_overseas: boolean
  role: string
  specific_role?: string
  bowling_style?: string
  capped_status: string
  base_price: number
  Power_Index: number
  batting_sr?: number
  batting_avg?: number
  bowling_econ?: number
  bowling_wpm?: number
  matches_played?: number
  age: number
  seasons_played: number
}

const ROLE_COLORS: Record<string, { bg: string, border: string, text: string, pastel: string }> = {
  BAT:  { bg: 'bg-sky-500/10',    border: 'border-sky-400/30',    text: 'text-sky-400',    pastel: 'from-sky-500/15 to-sky-900/5' },
  BOWL: { bg: 'bg-rose-500/10',   border: 'border-rose-400/30',   text: 'text-rose-400',   pastel: 'from-rose-500/15 to-rose-900/5' },
  AR:   { bg: 'bg-amber-500/10',  border: 'border-amber-400/30',  text: 'text-amber-400',  pastel: 'from-amber-500/15 to-amber-900/5' },
  WK:   { bg: 'bg-emerald-500/10', border: 'border-emerald-400/30', text: 'text-emerald-400', pastel: 'from-emerald-500/15 to-emerald-900/5' },
}
const getRoleStyle = (role: string) => ROLE_COLORS[role] || ROLE_COLORS['AR']

const getRoleColorHex = (role: string) => {
  switch(role) {
    case 'BAT': return '#38bdf8'; // sky-400
    case 'BOWL': return '#fb7185'; // rose-400
    case 'AR': return '#fbbf24'; // amber-400
    case 'WK': return '#34d399'; // emerald-400
    default: return '#fbbf24';
  }
}

const RowComponent = ({ index, style, players, onSelect }: { index: number, style: React.CSSProperties, players: Player[], onSelect: (p: Player) => void }) => {
  const p = players[index]
  if (!p) return null
  const rc = getRoleStyle(p.role)
  return (
    <div style={style} className="px-4 py-1">
      <div 
        onClick={() => onSelect(p)}
        className={`flex items-center justify-between p-4 bg-gradient-to-r ${rc.pastel} border ${rc.border} rounded-xl hover:scale-[1.01] transition-all cursor-pointer h-full group card-hover`}
      >
        <div className="flex-1 flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg ${rc.bg} ${rc.border} border flex items-center justify-center text-xs font-black ${rc.text}`}>
            {p.role}
          </div>
          <div>
            <h3 className="font-bold text-base text-white group-hover:text-[var(--accent-primary)] transition-colors flex items-center gap-2">
              {p.name}
              <span className="text-xs">{p.is_overseas ? '🌍' : '🇮🇳'}</span>
            </h3>
            <p className="text-xs text-gray-400">{p.nationality} {p.specific_role ? `• ${p.specific_role}` : ''}</p>
          </div>
        </div>

        <div className="flex-1 text-center">
          <div className="text-xl font-black text-amber-300 font-mono">
            {p.role}
          </div>
          <div className="text-[10px] uppercase text-gray-500 font-semibold tracking-wider">{p.specific_role || 'Specialist'}</div>
        </div>

        <div className="flex-1 text-right">
          <div className="text-lg font-bold text-white">₹{p.base_price} Cr</div>
          <div className={`text-xs ${rc.text} font-medium`}>{p.capped_status} • {p.seasons_played} seasons</div>
        </div>
      </div>
    </div>
  )
}

export default function StatsHub() {
  const { players } = usePlayerData()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [selectedPlayer, setSelectedPlayer] = useState<any | null>(null)

  const filteredPlayers = players.filter(p => {
    if (roleFilter !== 'ALL' && p.role !== roleFilter) return false
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 safe-page-top pb-16">
      
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/90 border border-white/15 shadow-xl">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
            Stats <span className="text-[var(--accent-primary)]">Analyzer</span>
          </h1>
          <p className="text-xs text-gray-300 mt-1">Click on any player to view deep technical performance metrics.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <div className="relative flex-1 md:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search player name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-950/90 border border-white/15 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-amber-400 transition-colors w-full md:w-64 text-white placeholder-gray-500 shadow-inner"
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { value: 'ALL', label: 'All Roles', color: 'bg-slate-800 text-white border-white/20 hover:bg-slate-700' },
              { value: 'BAT', label: '🏏 Batters', color: 'bg-sky-500/20 text-sky-300 border-sky-400/40 hover:bg-sky-500/30' },
              { value: 'BOWL', label: '🎯 Bowlers', color: 'bg-rose-500/20 text-rose-300 border-rose-400/40 hover:bg-rose-500/30' },
              { value: 'AR', label: '⚡ All-Rounders', color: 'bg-amber-500/20 text-amber-300 border-amber-400/40 hover:bg-amber-500/30' },
              { value: 'WK', label: '🧤 Keepers', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40 hover:bg-emerald-500/30' },
            ].map(f => (
              <button
                key={f.value}
                onClick={() => setRoleFilter(f.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-sm ${
                  roleFilter === f.value
                    ? f.color + ' ring-1 ring-white/30 font-black scale-[1.02]'
                    : 'bg-slate-950/80 text-gray-400 border-white/10 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* List Container */}
      <div className="glass-panel rounded-xl overflow-hidden h-[600px] py-4 border border-white/10">
        {filteredPlayers.length > 0 ? (
          <List
            style={{ height: 560, width: '100%' }}
            rowCount={filteredPlayers.length}
            rowHeight={90}
            rowComponent={RowComponent as any}
            rowProps={{ players: filteredPlayers, onSelect: setSelectedPlayer } as any}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            No players matching your search criteria.
          </div>
        )}
      </div>

      {/* ─── PLAYER ANALYTICS MODAL ───────────────────────────── */}
      {selectedPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-up">
          <div className="card-profile animate-fade-up">
            <div className="prof-photo" style={{ background: getRoleColorHex(selectedPlayer.role) }}>
              <div className="prof-avatar" style={{ color: getRoleColorHex(selectedPlayer.role) }}>{selectedPlayer.role}</div>
              <div className="prof-status-badge">₹{selectedPlayer.base_price} Cr</div>
            </div>
            <div className="prof-body">
              <div className="prof-handle">{selectedPlayer.team_name} • {selectedPlayer.nationality}</div>
              <h2 className="prof-name">{selectedPlayer.name}</h2>
              <div className="prof-bio" style={{ borderLeftColor: getRoleColorHex(selectedPlayer.role) }}>
                {selectedPlayer.capped_status} | {selectedPlayer.seasons_played} Seasons
                <br/>
                {selectedPlayer.is_overseas ? 'Overseas' : 'Domestic Player'} {selectedPlayer.specific_role ? `| ${selectedPlayer.specific_role}` : ''}
              </div>
            </div>
            <div className="prof-stats">
              <div className="pstat">
                <span className="psv">{selectedPlayer.role}</span>
                <span className="psl">Discipline</span>
              </div>
              <div className="pstat">
                <span className="psv">{selectedPlayer.batting_sr ? selectedPlayer.batting_sr.toFixed(0) : '-'}</span>
                <span className="psl">Bat SR</span>
              </div>
              <div className="pstat">
                <span className="psv">{selectedPlayer.bowling_wpm ? selectedPlayer.bowling_wpm.toFixed(1) : '-'}</span>
                <span className="psl">Wkts / M</span>
              </div>
            </div>
            <button className="prof-btn" onClick={() => setSelectedPlayer(null)}>
              CLOSE PROFILE
            </button>
          </div>
        </div>
      )}

    </div>
  )
}
