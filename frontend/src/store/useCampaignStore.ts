import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getFranchise, IPLPlayer, IPL_FRANCHISES } from '../data/franchises'

export interface CampaignPlayer extends IPLPlayer {
  is_released?: boolean
  is_retained?: boolean
  currentPrice: number
}

export interface UserCampaign {
  id: string // e.g. "gm_123_rcb_2027"
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
  pin?: string
  roleTitle?: string
  createdAt: string
}

interface CampaignStoreState {
  profiles: Record<string, UserProfile>
  currentUserId: string
  currentUser: UserProfile
  activeCampaignId: string | null
  campaigns: Record<string, UserCampaign> // keyed by campaign id
  
  // User Authentication & Onboarding Actions
  registerProfile: (gamerTag: string, avatar: string, pin?: string) => UserProfile
  loginProfile: (gamerTag: string, pin?: string) => boolean
  switchProfile: (userId: string) => void
  setUserProfile: (profile: Partial<UserProfile>) => void
  deleteProfile: (userId: string) => void
  
  // Campaign Actions
  createCampaign: (teamId: string) => UserCampaign
  switchCampaign: (campaignId: string) => void
  getActiveCampaign: () => UserCampaign | null
  getUserCampaigns: () => UserCampaign[]
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
  id: 'gm_default_1',
  gamerTag: 'Franchise GM',
  avatar: '👑',
  roleTitle: 'Head of Cricket Operations',
  createdAt: new Date().toISOString()
}

export const useCampaignStore = create<CampaignStoreState>()(
  persist(
    (set, get) => ({
      profiles: { [DEFAULT_USER.id]: DEFAULT_USER },
      currentUserId: DEFAULT_USER.id,
      currentUser: DEFAULT_USER,
      activeCampaignId: null,
      campaigns: {},

      registerProfile: (gamerTag, avatar, pin) => {
        const id = `gm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
        const newProfile: UserProfile = {
          id,
          gamerTag: gamerTag.trim() || 'Franchise GM',
          avatar: avatar || '👑',
          pin: pin ? pin.trim() : undefined,
          roleTitle: 'Franchise General Manager',
          createdAt: new Date().toISOString()
        }

        const updatedProfiles = { ...get().profiles, [id]: newProfile }
        set({
          profiles: updatedProfiles,
          currentUserId: id,
          currentUser: newProfile
        })
        return newProfile
      },

      loginProfile: (gamerTag, pin) => {
        const { profiles, campaigns } = get()
        const cleanTag = gamerTag.trim().toLowerCase()
        const target = Object.values(profiles).find(
          (p) => p.gamerTag.toLowerCase() === cleanTag
        )

        if (!target) return false

        // Check PIN if profile has one
        if (target.pin && pin && target.pin !== pin.trim()) {
          return false
        }

        // Find their most recently saved campaign
        const userCamps = Object.values(campaigns).filter((c) => c.userId === target.id)
        const lastCamp = userCamps.sort((a, b) => new Date(b.lastSaved).getTime() - new Date(a.lastSaved).getTime())[0]

        set({
          currentUserId: target.id,
          currentUser: target,
          activeCampaignId: lastCamp ? lastCamp.id : null
        })

        return true
      },

      switchProfile: (userId) => {
        const target = get().profiles[userId]
        if (!target) return
        const userCamps = Object.values(get().campaigns).filter((c) => c.userId === userId)
        const lastCamp = userCamps.sort((a, b) => new Date(b.lastSaved).getTime() - new Date(a.lastSaved).getTime())[0]

        set({
          currentUserId: userId,
          currentUser: target,
          activeCampaignId: lastCamp ? lastCamp.id : null
        })
      },

      setUserProfile: (profile) => {
        const current = get().currentUser
        const updated = { ...current, ...profile }
        set((state) => ({
          currentUser: updated,
          profiles: { ...state.profiles, [updated.id]: updated }
        }))
      },

      deleteProfile: (userId) => {
        const { profiles, campaigns, currentUserId } = get()
        const updatedProfiles = { ...profiles }
        delete updatedProfiles[userId]

        // Also clean up campaigns for this user
        const updatedCampaigns = { ...campaigns }
        Object.keys(updatedCampaigns).forEach((cid) => {
          if (updatedCampaigns[cid].userId === userId) {
            delete updatedCampaigns[cid]
          }
        })

        const remainingKeys = Object.keys(updatedProfiles)
        const nextId = remainingKeys[0] || DEFAULT_USER.id
        const nextProfile = updatedProfiles[nextId] || DEFAULT_USER

        set({
          profiles: remainingKeys.length > 0 ? updatedProfiles : { [DEFAULT_USER.id]: DEFAULT_USER },
          currentUserId: nextId,
          currentUser: nextProfile,
          campaigns: updatedCampaigns,
          activeCampaignId: null
        })
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
        const { activeCampaignId, campaigns, currentUserId } = get()
        if (activeCampaignId && campaigns[activeCampaignId]) {
          return campaigns[activeCampaignId]
        }
        // If not set, check if current user has any saved campaign
        const userCamps = Object.values(campaigns).filter((c) => c.userId === currentUserId)
        if (userCamps.length > 0) {
          const sorted = userCamps.sort((a, b) => new Date(b.lastSaved).getTime() - new Date(a.lastSaved).getTime())
          return sorted[0]
        }
        return null
      },

      getUserCampaigns: () => {
        const { campaigns, currentUserId } = get()
        return Object.values(campaigns).filter((c) => c.userId === currentUserId)
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

        if (campaign.remainingPurse < bidAmount) return false

        const activeCount = campaign.squad.filter((p) => !p.is_released).length
        if (activeCount >= 25) return false

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
      name: 'auctionxi-user-campaign-v2',
      partialize: (state) => ({
        profiles: state.profiles,
        currentUserId: state.currentUserId,
        currentUser: state.currentUser,
        activeCampaignId: state.activeCampaignId,
        campaigns: state.campaigns
      })
    }
  )
)
