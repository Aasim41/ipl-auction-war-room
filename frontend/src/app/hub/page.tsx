'use client'

import { usePlayerData } from '../../lib/usePlayerData'
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, ScatterChart, Scatter, ZAxis, LabelList 
} from 'recharts'
import { Database, Info } from 'lucide-react'

type Player = {
  player_id: string
  name: string
  nationality: string
  role: string
  base_price: number
  Power_Index: number
}

const ROLE_NAMES: Record<string, string> = {
  BAT: 'Batters',
  BOWL: 'Bowlers',
  AR: 'All-Rounders',
  WK: 'Wicket-Keepers'
}

const ROLE_COLORS: Record<string, string> = {
  BAT: '#3b82f6',
  BOWL: '#ef4444',
  AR: '#eab308',
  WK: '#a855f7'
}

export default function AnalyticsHub() {
  const { players, loading } = usePlayerData()

  if (loading || !players.length) return <div className="p-8 text-center text-gray-400">Loading Analytics Hub...</div>

  // Aggregations
  const totalPlayers = players.length

  const roleDistribution = Object.entries(
    players.reduce((acc, p) => {
      acc[p.role] = (acc[p.role] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  ).map(([name, value]) => {
    const count = Number(value)
    return {
    name: ROLE_NAMES[name] || name, 
    code: name,
    value: count,
    percentage: ((count / totalPlayers) * 100).toFixed(1)
  }})

  const avgPriceByRole = Object.entries(
    players.reduce((acc, p) => {
      if (!acc[p.role]) acc[p.role] = { sum: 0, count: 0 }
      acc[p.role].sum += p.base_price
      acc[p.role].count += 1
      return acc
    }, {} as Record<string, {sum: number, count: number}>)
  ).map(([name, value]) => {
    const { sum, count } = value as { sum: number, count: number }
    return {
      role: ROLE_NAMES[name] || name,
      avgPrice: Number((sum / count).toFixed(2))
    }
  })

  return (
    <div className="max-w-7xl mx-auto px-6 pt-20 pb-8">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tight">
            Analytics <span className="text-[var(--accent-primary)]">Hub</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Statistical distribution & valuation insights across the auction pool.
          </p>
        </div>

        <div className="flex items-center gap-3 glass-panel px-4 py-2 rounded-xl text-xs text-gray-300 border border-white/10">
          <Database size={16} className="text-[var(--accent-primary)]" />
          <span>Dataset: <strong>{totalPlayers} Registered Auction Players</strong></span>
        </div>
      </div>

      {/* Quick Stat Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-xl bg-gradient-to-br from-sky-500/15 to-sky-900/5 border border-sky-400/20 card-hover">
          <div className="text-sky-400 text-xs font-bold uppercase tracking-wider mb-1">Total Players</div>
          <div className="text-2xl font-black text-white scoreboard-text">{totalPlayers}</div>
        </div>
        <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/15 to-emerald-900/5 border border-emerald-400/20 card-hover">
          <div className="text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">Avg Power Index</div>
          <div className="text-2xl font-black text-white scoreboard-text">{(players.reduce((s, p) => s + p.Power_Index, 0) / totalPlayers).toFixed(1)}</div>
        </div>
        <div className="p-4 rounded-xl bg-gradient-to-br from-violet-500/15 to-violet-900/5 border border-violet-400/20 card-hover">
          <div className="text-violet-400 text-xs font-bold uppercase tracking-wider mb-1">Highest Valuation</div>
          <div className="text-2xl font-black text-white scoreboard-text">₹{Math.max(...players.map(p => p.base_price)).toFixed(1)} Cr</div>
        </div>
        <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/15 to-amber-900/5 border border-amber-400/20 card-hover">
          <div className="text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">Total Pool Value</div>
          <div className="text-2xl font-black text-white scoreboard-text">₹{players.reduce((s, p) => s + p.base_price, 0).toFixed(0)} Cr</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        
        {/* Role Distribution Pie Chart */}
        <div className="glass-panel p-6 rounded-xl relative border border-sky-400/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Player Role Breakdown</h3>
            <span className="text-xs text-gray-500">{totalPlayers} Total</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={roleDistribution} 
                  dataKey="value" 
                  nameKey="name" 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                >
                  {roleDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={ROLE_COLORS[entry.code] || '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any, name: any, item: any) => [`${value} Players (${item.payload.percentage}%)`, name]}
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-white/5">
            {roleDistribution.map(item => (
              <div key={item.code} className="flex items-center justify-between text-xs px-2 py-1 bg-white/[0.02] rounded">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ROLE_COLORS[item.code] || '#94a3b8' }} />
                  <span className="font-medium text-gray-300">{item.name}</span>
                </div>
                <span className="scoreboard-text text-gray-400 font-bold">{item.value} ({item.percentage}%)</span>
              </div>
            ))}
          </div>
        </div>

        {/* Average Base Price by Role */}
        <div className="glass-panel p-6 rounded-xl border border-amber-400/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Average Auction Price by Role</h3>
            <span className="text-xs text-gray-500">₹ in Crores</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={avgPriceByRole} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
                <XAxis dataKey="role" stroke="#64748b" tick={{ fontSize: 12 }} />
                <YAxis stroke="#64748b" tickFormatter={(val) => `₹${val}Cr`} />
                <Tooltip 
                  formatter={(value: any) => [`₹${value} Cr`, 'Avg Valuation']}
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                />
                <Bar dataKey="avgPrice" fill="var(--accent-primary)" radius={[6, 6, 0, 0]}>
                  <LabelList dataKey="avgPrice" position="top" formatter={(v: any) => `₹${v}Cr`} style={{ fill: '#e2e8f0', fontSize: 11, fontWeight: 'bold' }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2 text-xs text-gray-400">
            <Info size={14} className="text-gray-500 shrink-0" />
            <span>Valuations derived from player performance metrics & historical auction values.</span>
          </div>
        </div>

      </div>

      {/* Power Index vs Price Scatter */}
      <div className="glass-panel p-6 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold">Power Index vs. Price Scatter Plot</h3>
            <p className="text-xs text-gray-400">Helps identify high-value bargain picks (high Power Index at lower prices).</p>
          </div>
        </div>

        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
              <XAxis 
                type="number" 
                dataKey="base_price" 
                name="Base Price" 
                unit=" Cr" 
                stroke="#64748b"
                tickFormatter={(val) => `₹${val}Cr`}
              />
              <YAxis 
                type="number" 
                dataKey="Power_Index" 
                name="Power Index" 
                stroke="#64748b" 
                domain={[0, 100]}
              />
              <ZAxis type="category" dataKey="name" name="Player" />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }}
                formatter={(value: any, name: any) => [name === 'Base Price' ? `₹${value} Cr` : value, name]}
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
              />
              <Scatter data={players} fill="var(--accent-primary)" opacity={0.8} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  )
}
