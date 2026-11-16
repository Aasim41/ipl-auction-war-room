'use client'

import { useEffect, useState, useCallback } from 'react'
import { useStore } from '../store/useStore'
import { IPL_FRANCHISES, RELEASED_AUCTION_POOL } from '../data/franchises'

export interface Player {
  player_id: string
  name: string
  role: string
  nationality: string
  is_overseas: boolean
  base_price: number
  predicted_price: number
  Power_Index: number
  is_retained?: boolean
  statsSummary?: string
}

// Generate complete offline master player pool
function getBundledPlayerPool(): Player[] {
  const all: Player[] = []
  const seen = new Set<string>()

  // 1. Add all players from all 10 franchise rosters
  Object.values(IPL_FRANCHISES).forEach((franchise) => {
    franchise.squad2026.forEach((p, idx) => {
      const lower = p.name.toLowerCase()
      if (!seen.has(lower)) {
        seen.add(lower)
        all.push({
          player_id: p.player_id || `${franchise.id}_${idx + 1}`,
          name: p.name,
          role: p.role,
          nationality: p.nationality,
          is_overseas: p.is_overseas,
          base_price: p.price,
          predicted_price: p.price,
          Power_Index: Number(p.Power_Index) || 80,
          is_retained: true,
          statsSummary: p.statsSummary
        })
      }
    })
  })

  // 2. Add all released marquee stars
  RELEASED_AUCTION_POOL.forEach((p, idx) => {
    const lower = p.name.toLowerCase()
    if (!seen.has(lower)) {
      seen.add(lower)
      all.push({
        player_id: `rel_${idx + 1}`,
        name: p.name,
        role: p.role,
        nationality: p.is_overseas ? 'Overseas' : 'Indian',
        is_overseas: p.is_overseas,
        base_price: p.basePrice || 2.0,
        predicted_price: p.predictedAuctionPrice || 5.0,
        Power_Index: Number(p.powerIndex) || 85,
        is_retained: false,
        statsSummary: p.reason
      })
    }
  })

  return all
}

export function usePlayerData() {
  const { cachedPlayers, setCachedPlayers, mySquad, setMySquad } = useStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const bundled = getBundledPlayerPool()
  const effectivePlayers = cachedPlayers.length > 0 ? cachedPlayers : bundled

  const fetchPlayers = useCallback(async (silent = false) => {
    // If we have bundled players and this is initial load, initialize right away
    if (cachedPlayers.length === 0) {
      setCachedPlayers(bundled)
    }

    try {
      const res = await fetch('http://localhost:8000/api/players/', { signal: AbortSignal.timeout(3000) })
      if (!res.ok) throw new Error('Backend not reachable')
      const data = await res.json()
      const normalized: Player[] = data.map((p: any) => ({
        player_id: String(p.player_id || p.id),
        name: p.name,
        role: p.role,
        nationality: p.nationality,
        is_overseas: p.is_overseas ?? (p.nationality?.toLowerCase() === 'overseas'),
        base_price: Number(p.base_price || 0),
        predicted_price: Number(p.predicted_price || p.base_price || 0),
        Power_Index: Number(p.Power_Index || p.power_index || 0),
      }))
      setCachedPlayers(normalized)
      setLoading(false)
    } catch (err: any) {
      // Offline fallback: Use bundled players
      if (cachedPlayers.length === 0) {
        setCachedPlayers(bundled)
      }
      setLoading(false)
    }
  }, [cachedPlayers.length, setCachedPlayers, bundled])

  // Initial fetch
  useEffect(() => {
    fetchPlayers(false)
  }, [])

  return { players: effectivePlayers, loading, error, refetch: () => fetchPlayers(false) }
}
