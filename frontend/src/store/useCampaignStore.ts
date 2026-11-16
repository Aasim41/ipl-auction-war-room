import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getFranchise, IPLPlayer, IPL_FRANCHISES } from '../data/franchises'

export interface CampaignPlayer extends IPLPlayer {
  is_released?: boolean
  is_retained?: boolean
  currentPrice: number
}

export interface UserCampaign {
  id: string // e.g. "aasim_rcb_2027"
  userId: string
  teamId: string
  teamName: string
  currentPhase: 'rules' | 'trade' | 'retain_release' | 'mini_auction' | 'playing_xi' | 'match'
  totalPurse: number
  remainingPurse: number
  squad: CampaignPlayer[]
  releasedStars: CampaignPlayer[]
  tradedHistory: Array<{
    date: string
    playerOut: string
    playerIn: string
    rivalTeam: string
    cashAdjustment: number
  }>
  playingXI: string[] // player_ids
  impactPlayerId?: string
  rulesAcknowledged: boolean
  lastSaved: string
}

export interface UserProfile {
  id: string
  gamerTag: string
  avatar: string
  createdAt: string
}

interface CampaignStoreState {
  currentUser: UserProfile
  activeCampaignId: string | null
  campaigns: Record<string, UserCampaign> // keyed by campaign id
  
  // User Profile Actions
  setUserProfile: (profile: Partial<UserProfile>) => void
  
  // Campaign Actions
  createCampaign: (teamId: string) => UserCampaign
  switchCampaign: (campaignId: string) => void
  getActiveCampaign: () => UserCampaign | null
  updateActiveCampaign: (updater: (prev: UserCampaign) => UserCampaign) => void
  deleteCampaign: (campaignId: string) => void
  resetCampaign: (campaignId: string) => void
  
  // Phase Transitions
  advancePhase: (nextPhase: UserCampaign['currentPhase']) => void
  acknowledgeRules: () => void
  
  // Squad Actions
  togglePlayerRetention: (playerId: string) => void
  addAuctionPlayerToSquad: (player: CampaignPlayer, bidAmount: number) => boolean
  executeTrade: (playerOutId: string, playerIn: CampaignPlayer, rivalTeamId: string, cashDelta: number) => boolean
  setPlayingXI: (playerIds: string[], impactPlayerId?: string) => void
}

const DEFAULT_USER: UserProfile = {
  id: 'user_cricket_gm_1',
  gamerTag: 'Franchise GM',
  avatar: '🏏',
  createdAt: new Date().toISOString()
}

export const useCampaignStore = create<CampaignStoreState>()(
  persist(
    (set, get) => ({
      currentUser: DEFAULT_USER,
      activeCampaignId: null,
      campaigns: {},

      setUserProfile: (profile) => {
        set((state) => ({
          currentUser: { ...state.currentUser, ...profile }
        }))
      },

      createCampaign: (teamId: string) => {
        const { currentUser, campaigns } = get()
        const franchise = getFranchise(teamId)
        const campaignId = `${currentUser.id}_${teamId}_2027`

        // Format full squad with campaign metadata
        const initialSquad: CampaignPlayer[] = franchise.squad2026.map((p, idx) => ({
          ...p,
          player_id: p.player_id || `${teamId}_${idx + 1}`,
          currentPrice: p.price,
          is_retained: true,
          is_released: false
        }))

        const newCampaign: UserCampaign = {
          id: campaignId,
          userId: currentUser.id,
          teamId,
          teamName: franchise.name,
          currentPhase: 'rules',
          totalPurse: franchise.totalPurse || 125.0,
          remainingPurse: franchise.miniAuctionPurse2026 || 18.5,
          squad: initialSquad,
          releasedStars: [],
          tradedHistory: [],
          playingXI: initialSquad.slice(0, 11).map((p) => p.player_id),
          rulesAcknowledged: false,
          lastSaved: new Date().toISOString()
        }

        set({
          campaigns: { ...campaigns, [campaignId]: newCampaign },
          activeCampaignId: campaignId
        })

        return newCampaign
      },

      switchCampaign: (campaignId: string) => {
        if (get().campaigns[campaignId]) {
          set({ activeCampaignId: campaignId })
        }
      },

      getActiveCampaign: () => {
        const { activeCampaignId, campaigns } = get()
        if (!activeCampaignId || !campaigns[activeCampaignId]) {
          // If no active campaign, check if any exists
          const keys = Object.keys(campaigns)
          if (keys.length > 0) {
            return campaigns[keys[0]]
          }
          return null
        }
        return campaigns[activeCampaignId]
      },

      updateActiveCampaign: (updater) => {
        const { activeCampaignId, campaigns } = get()
        if (!activeCampaignId || !campaigns[activeCampaignId]) return
        const updated = updater(campaigns[activeCampaignId])
        set({
          campaigns: {
            ...campaigns,
            [activeCampaignId]: {
              ...updated,
              lastSaved: new Date().toISOString()
            }
          }
        })
      },

      deleteCampaign: (campaignId: string) => {
        const { campaigns, activeCampaignId } = get()
        const newCampaigns = { ...campaigns }
        delete newCampaigns[campaignId]
        const remainingKeys = Object.keys(newCampaigns)
        set({
          campaigns: newCampaigns,
          activeCampaignId: activeCampaignId === campaignId ? (remainingKeys[0] || null) : activeCampaignId
        })
      },

      resetCampaign: (campaignId: string) => {
        const { campaigns } = get()
        const current = campaigns[campaignId]
        if (!current) return
        const franchise = getFranchise(current.teamId)
        const resetSquad: CampaignPlayer[] = franchise.squad2026.map((p, idx) => ({
          ...p,
          player_id: p.player_id || `${current.teamId}_${idx + 1}`,
          currentPrice: p.price,
          is_retained: true,
          is_released: false
        }))

        const resetCamp: UserCampaign = {
          ...current,
          currentPhase: 'trade',
          remainingPurse: franchise.miniAuctionPurse2026 || 18.5,
          squad: resetSquad,
          releasedStars: [],
          tradedHistory: [],
          playingXI: resetSquad.slice(0, 11).map((p) => p.player_id),
          lastSaved: new Date().toISOString()
        }

        set({
          campaigns: { ...campaigns, [campaignId]: resetCamp }
        })
      },

      advancePhase: (nextPhase) => {
        get().updateActiveCampaign((prev) => ({
          ...prev,
          currentPhase: nextPhase
        }))
      },

      acknowledgeRules: () => {
        get().updateActiveCampaign((prev) => ({
          ...prev,
          rulesAcknowledged: true,
          currentPhase: prev.currentPhase === 'rules' ? 'trade' : prev.currentPhase
        }))
      },

      togglePlayerRetention: (playerId: string) => {
        get().updateActiveCampaign((prev) => {
          const target = prev.squad.find((p) => p.player_id === playerId)
          if (!target) return prev

          const isNowReleased = !target.is_released
          const updatedSquad = prev.squad.map((p) => {
            if (p.player_id === playerId) {
              return {
                ...p,
                is_released: isNowReleased,
                is_retained: !isNowReleased
              }
            }
            return p
          })

          // Calculate new purse: Base mini-auction purse + sum of all released player salaries
          const franchise = getFranchise(prev.teamId)
          const basePurse = franchise.miniAuctionPurse2026 || 18.5
          const releasedSum = updatedSquad
            .filter((p) => p.is_released)
            .reduce((sum, p) => sum + (p.price || 0), 0)

          const newlyReleased = updatedSquad.filter((p) => p.is_released)

          return {
            ...prev,
            squad: updatedSquad,
            releasedStars: newlyReleased,
            remainingPurse: Math.round((basePurse + releasedSum) * 100) / 100
          }
        })
      },

      addAuctionPlayerToSquad: (player: CampaignPlayer, bidAmount: number) => {
        const campaign = get().getActiveCampaign()
        if (!campaign) return false

        // Validate purse
        if (campaign.remainingPurse < bidAmount) return false

        // Validate squad size
        const activeCount = campaign.squad.filter((p) => !p.is_released).length
        if (activeCount >= 25) return false

        // Validate overseas quota
        if (player.is_overseas) {
          const overseasCount = campaign.squad.filter((p) => !p.is_released && p.is_overseas).length
          if (overseasCount >= 8) return false
        }

        get().updateActiveCampaign((prev) => ({
          ...prev,
          remainingPurse: Math.round((prev.remainingPurse - bidAmount) * 100) / 100,
          squad: [
            ...prev.squad,
            {
              ...player,
              currentPrice: bidAmount,
              is_retained: true,
              is_released: false
            }
          ]
        }))

        return true
      },

      executeTrade: (playerOutId, playerIn, rivalTeamId, cashDelta) => {
        const campaign = get().getActiveCampaign()
        if (!campaign) return false

        const outPlayer = campaign.squad.find((p) => p.player_id === playerOutId)
        if (!outPlayer) return false

        // Verify budget with cash delta
        if (campaign.remainingPurse + cashDelta < 0) return false

        get().updateActiveCampaign((prev) => {
          const filteredSquad = prev.squad.filter((p) => p.player_id !== playerOutId)
          const updatedSquad: CampaignPlayer[] = [
            ...filteredSquad,
            { ...playerIn, is_retained: true, is_released: false }
          ]

          return {
            ...prev,
            remainingPurse: Math.round((prev.remainingPurse + cashDelta) * 100) / 100,
            squad: updatedSquad,
            tradedHistory: [
              ...prev.tradedHistory,
              {
                date: new Date().toLocaleDateString(),
                playerOut: outPlayer.name,
                playerIn: playerIn.name,
                rivalTeam: rivalTeamId.toUpperCase(),
                cashAdjustment: cashDelta
              }
            ]
          }
        })

        return true
      },

      setPlayingXI: (playerIds, impactPlayerId) => {
        get().updateActiveCampaign((prev) => ({
          ...prev,
          playingXI: playerIds,
          impactPlayerId
        }))
      }
    }),
    {
      name: 'auctionxi-user-campaign-v1',
      partialize: (state) => ({
        currentUser: state.currentUser,
        activeCampaignId: state.activeCampaignId,
        campaigns: state.campaigns
      })
    }
  )
)
