'use client'

import { useEffect, useState, useCallback } from 'react'
import { useStore } from '../store/useStore'

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

export function usePlayerData() {
  const { cachedPlayers, setCachedPlayers, mySquad, setMySquad } = useStore()
  const [loading, setLoading] = useState(cachedPlayers.length === 0)
  const [error, setError] = useState<string | null>(null)

  const fetchPlayers = useCallback(async (silent = false) => {
    if (!silent && cachedPlayers.length === 0) setLoading(true)
    try {
      const res = await fetch('http://localhost:8000/api/players/')
      if (!res.ok) throw new Error('Failed to load player database')
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

      // Silently sync current squad's Power_Index values if they changed
      if (mySquad && mySquad.length > 0) {
        const playerMap = new Map(normalized.map((np) => [np.name.toLowerCase(), np]))
        let squadChanged = false
        const updatedSquad = mySquad.map((sp) => {
          const fresh = playerMap.get(sp.name.toLowerCase())
          if (fresh && fresh.Power_Index !== sp.Power_Index) {
            squadChanged = true
            return { ...sp, Power_Index: fresh.Power_Index }
          }
          return sp
        })
        if (squadChanged) {
          setMySquad(updatedSquad)
        }
      }

      setLoading(false)
    } catch (err: any) {
      if (!silent) {
        console.error('Player fetch error:', err)
        setError(err.message)
        setLoading(false)
      }
    }
  }, [cachedPlayers.length, mySquad, setCachedPlayers, setMySquad])

  // Initial fetch
  useEffect(() => {
    fetchPlayers(false)
  }, [])

  // Background auto-refresh polling every 20 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      fetchPlayers(true)
    }, 20000)
    return () => clearInterval(timer)
  }, [fetchPlayers])

  return { players: cachedPlayers, loading, error, refetch: () => fetchPlayers(false) }
}
