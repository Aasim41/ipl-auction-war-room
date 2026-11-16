import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getFranchise } from '../data/franchises'

interface AppState {
  theme: string
  setTheme: (theme: string) => void
  mySquad: any[]
  setMySquad: (squad: any[]) => void
  load2026Squad: (teamId?: string) => void
  cachedPlayers: any[]
  setCachedPlayers: (players: any[]) => void
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      theme: 'rcb',
      cachedPlayers: [],
      setCachedPlayers: (players) => set({ cachedPlayers: players }),

      setTheme: (theme) => {
        const franchise = getFranchise(theme)
        const squadFormatted = franchise.squad2026.map(p => ({
          player_id: p.player_id,
          name: p.name,
          role: p.role,
          nationality: p.nationality,
          is_overseas: p.is_overseas,
          base_price: p.price,
          predicted_price: p.price,
          Power_Index: p.Power_Index,
          is_retained: true,
          statsSummary: p.statsSummary,
        }))

        set({
          theme,
          mySquad: squadFormatted,
        })
      },

      mySquad: getFranchise('rcb').squad2026.map(p => ({
        player_id: p.player_id,
        name: p.name,
        role: p.role,
        nationality: p.nationality,
        is_overseas: p.is_overseas,
        base_price: p.price,
        predicted_price: p.price,
        Power_Index: p.Power_Index,
        is_retained: true,
        statsSummary: p.statsSummary,
      })),

      setMySquad: (mySquad) => set({ mySquad }),

      load2026Squad: (teamId) => {
        const currentTheme = teamId || get().theme || 'rcb'
        const franchise = getFranchise(currentTheme)
        const squadFormatted = franchise.squad2026.map(p => ({
          player_id: p.player_id,
          name: p.name,
          role: p.role,
          nationality: p.nationality,
          is_overseas: p.is_overseas,
          base_price: p.price,
          predicted_price: p.price,
          Power_Index: p.Power_Index,
          is_retained: true,
          statsSummary: p.statsSummary,
        }))
        set({ mySquad: squadFormatted })
      },
    }),
    {
      name: 'auctionxi-storage-ipl2026-v3',
      partialize: (state) => ({ theme: state.theme, mySquad: state.mySquad }),
      onRehydrateStorage: () => (state) => {
        if (!state) return
        if (!state.mySquad || state.mySquad.length < 12) {
          const franchise = getFranchise(state.theme || 'rcb')
          const squadFormatted = franchise.squad2026.map(p => ({
            player_id: p.player_id,
            name: p.name,
            role: p.role,
            nationality: p.nationality,
            is_overseas: p.is_overseas,
            base_price: p.price,
            predicted_price: p.price,
            Power_Index: p.Power_Index,
            is_retained: true,
            statsSummary: p.statsSummary,
          }))
          state.setMySquad(squadFormatted)
        }
      }
    }
  )
)
