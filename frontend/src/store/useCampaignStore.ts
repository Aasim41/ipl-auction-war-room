import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getFranchise, IPLPlayer, IPL_FRANCHISES } from '../data/franchises'
import { 
  generateTournamentSchedule, 
  generateInitialPointsTable, 
  simulateAIMatch,
  TournamentFixture, 
  TournamentPointsEntry 
} from '../data/scheduleGenerator'

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
  playingXI: string[] // player_ids in batting order (0: Opener 1 ... 10: No. 11)
  impactPlayerId?: string
  rulesAcknowledged: boolean
  lastSaved: string
  // Tournament season mode
  schedule: TournamentFixture[]
  currentMatchIndex: number
  pointsTable: TournamentPointsEntry[]
  lockedPhases: Array<'trade' | 'retain_release' | 'mini_auction'>
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
  
  // Phase Transitions & Lockdown ("no going back in the cycle")
  advancePhase: (nextPhase: UserCampaign['currentPhase']) => void
  acknowledgeRules: () => void
  
  // Squad Actions
  togglePlayerRetention: (playerId: string) => void
  addAuctionPlayerToSquad: (player: CampaignPlayer, bidAmount: number) => boolean
  executeTrade: (playerOutId: string, playerIn: CampaignPlayer, rivalTeamId: string, cashDelta: number) => boolean
  setPlayingXI: (playerIds: string[], impactPlayerId?: string) => void
  swapPlayingXISlots: (indexA: number, indexB: number) => void
  replacePlayingXIPlayer: (slotIndex: number, newPlayerId: string) => void
  autoOptimizePlayingXI: () => void
  
  // Tournament Season & Match Simulation
  recordMatchResult: (matchNo: number, resultData: TournamentFixture['result']) => void
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

        if (target.pin && pin && target.pin !== pin.trim()) {
          return false
        }

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
        const { profiles, campaigns } = get()
        const updatedProfiles = { ...profiles }
        delete updatedProfiles[userId]

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

        const initialSquad: CampaignPlayer[] = franchise.squad2026.map((p, idx) => ({
          ...p,
          player_id: p.player_id || `${teamId}_${idx + 1}`,
          currentPrice: p.price,
          is_retained: true,
          is_released: false
        }))

        const schedule = generateTournamentSchedule(teamId)
        const pointsTable = generateInitialPointsTable()

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
          lastSaved: new Date().toISOString(),
          schedule,
          currentMatchIndex: 0,
          pointsTable,
          lockedPhases: []
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
        let active: UserCampaign | null = null

        if (activeCampaignId && campaigns[activeCampaignId]) {
          active = campaigns[activeCampaignId]
        } else {
          const userCamps = Object.values(campaigns).filter((c) => c.userId === currentUserId)
          if (userCamps.length > 0) {
            const sorted = userCamps.sort((a, b) => new Date(b.lastSaved).getTime() - new Date(a.lastSaved).getTime())
            active = sorted[0]
          }
        }

        if (active) {
          // Self-heal: ensure tournament schedule and points table are present
          let needsUpdate = false
          let updatedActive = { ...active }

          if (!updatedActive.schedule || updatedActive.schedule.length === 0) {
            updatedActive.schedule = generateTournamentSchedule(updatedActive.teamId)
            updatedActive.currentMatchIndex = 0
            needsUpdate = true
          }
          if (!updatedActive.pointsTable || updatedActive.pointsTable.length === 0) {
            updatedActive.pointsTable = generateInitialPointsTable()
            needsUpdate = true
          }
          if (!updatedActive.lockedPhases) {
            updatedActive.lockedPhases = []
            needsUpdate = true
          }

          if (needsUpdate) {
            get().updateActiveCampaign(() => updatedActive)
            return updatedActive
          }
        }

        return active
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
          lastSaved: new Date().toISOString(),
          schedule: generateTournamentSchedule(current.teamId),
          currentMatchIndex: 0,
          pointsTable: generateInitialPointsTable(),
          lockedPhases: []
        }

        set({
          campaigns: { ...campaigns, [campaignId]: resetCamp }
        })
      },

      advancePhase: (nextPhase) => {
        get().updateActiveCampaign((prev) => {
          const locked: Array<'trade' | 'retain_release' | 'mini_auction'> = [...(prev.lockedPhases || [])]
          
          // Enforce "once a cycle is started there is no going back"
          if (nextPhase === 'retain_release' && !locked.includes('trade')) {
            locked.push('trade')
          }
          if (nextPhase === 'mini_auction') {
            if (!locked.includes('trade')) locked.push('trade')
            if (!locked.includes('retain_release')) locked.push('retain_release')
          }
          if (nextPhase === 'playing_xi' || nextPhase === 'match') {
            if (!locked.includes('trade')) locked.push('trade')
            if (!locked.includes('retain_release')) locked.push('retain_release')
            if (!locked.includes('mini_auction')) locked.push('mini_auction')
          }

          return {
            ...prev,
            currentPhase: nextPhase,
            lockedPhases: locked
          }
        })
      },

      acknowledgeRules: () => {
        get().updateActiveCampaign((prev) => ({
          ...prev,
          rulesAcknowledged: true,
          currentPhase: prev.currentPhase === 'rules' ? 'trade' : prev.currentPhase
        }))
      },

      togglePlayerRetention: (playerId: string) => {
        const camp = get().getActiveCampaign()
        if (camp?.lockedPhases?.includes('retain_release')) return // Locked!

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
        if (campaign.lockedPhases?.includes('mini_auction')) return false

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
        if (campaign.lockedPhases?.includes('trade')) return false

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
      },

      swapPlayingXISlots: (indexA, indexB) => {
        get().updateActiveCampaign((prev) => {
          const xi = [...prev.playingXI]
          if (indexA < 0 || indexA >= xi.length || indexB < 0 || indexB >= xi.length) return prev
          const temp = xi[indexA]
          xi[indexA] = xi[indexB]
          xi[indexB] = temp
          return {
            ...prev,
            playingXI: xi
          }
        })
      },

      replacePlayingXIPlayer: (slotIndex, newPlayerId) => {
        get().updateActiveCampaign((prev) => {
          const xi = [...prev.playingXI]
          if (slotIndex < 0 || slotIndex >= 11) return prev
          // If player already in XI at another slot, swap them
          const existingIdx = xi.indexOf(newPlayerId)
          if (existingIdx !== -1) {
            const oldAtSlot = xi[slotIndex]
            xi[slotIndex] = newPlayerId
            xi[existingIdx] = oldAtSlot
          } else {
            xi[slotIndex] = newPlayerId
          }
          return {
            ...prev,
            playingXI: xi
          }
        })
      },

      autoOptimizePlayingXI: () => {
        get().updateActiveCampaign((prev) => {
          const activePlayers = prev.squad.filter((p) => !p.is_released)
          if (activePlayers.length === 0) return prev

          // Separate candidates by role
          const wks = activePlayers.filter((p) => p.role === 'WK').sort((a, b) => (Number(b.Power_Index) || 80) - (Number(a.Power_Index) || 80))
          const bats = activePlayers.filter((p) => p.role === 'BAT').sort((a, b) => (Number(b.Power_Index) || 80) - (Number(a.Power_Index) || 80))
          const ars = activePlayers.filter((p) => p.role === 'AR').sort((a, b) => (Number(b.Power_Index) || 80) - (Number(a.Power_Index) || 80))
          const bowls = activePlayers.filter((p) => p.role === 'BOWL').sort((a, b) => (Number(b.Power_Index) || 80) - (Number(a.Power_Index) || 80))

          const chosen: CampaignPlayer[] = []
          let overseasCount = 0

          const canPick = (p: CampaignPlayer) => {
            if (chosen.some((c) => c.player_id === p.player_id)) return false
            if (p.is_overseas && overseasCount >= 4) return false
            return true
          }

          const addPlayer = (p: CampaignPlayer) => {
            chosen.push(p)
            if (p.is_overseas) overseasCount++
          }

          // Slot 1 & 2: Explosive Openers (Batters with high SR or top WK)
          const openerCandidates = [...bats, ...wks].sort((a, b) => {
            const srA = Number(a.statsSummary?.match(/SR\s*([\d.]+)/)?.[1]) || 135
            const srB = Number(b.statsSummary?.match(/SR\s*([\d.]+)/)?.[1]) || 135
            return srB - srA
          })

          for (const cand of openerCandidates) {
            if (chosen.length >= 2) break
            if (canPick(cand)) addPlayer(cand)
          }

          // Slot 3 & 4: Solid Top Order Anchors (Highest Avg)
          const anchorCandidates = [...bats].sort((a, b) => {
            const avgA = Number(a.statsSummary?.match(/Avg\s*([\d.]+)/)?.[1]) || 30
            const avgB = Number(b.statsSummary?.match(/Avg\s*([\d.]+)/)?.[1]) || 30
            return avgB - avgA
          })

          for (const cand of anchorCandidates) {
            if (chosen.length >= 4) break
            if (canPick(cand)) addPlayer(cand)
          }

          // Slot 5: Ensure Primary Wicketkeeper is in XI
          const hasWK = chosen.some((p) => p.role === 'WK')
          if (!hasWK) {
            const bestWk = wks.find(canPick)
            if (bestWk) addPlayer(bestWk)
          }

          // Slot 6 & 7: Explosive Finishers & Premier All-Rounders
          for (const cand of ars) {
            if (chosen.length >= 7) break
            if (canPick(cand)) addPlayer(cand)
          }

          // Slot 8, 9, 10, 11: Specialist Spinners & Death Bowlers
          for (const cand of bowls) {
            if (chosen.length >= 11) break
            if (canPick(cand)) addPlayer(cand)
          }

          // If still under 11, backfill with best available players obeying overseas <= 4
          const allRemaining = [...activePlayers].sort((a, b) => (Number(b.Power_Index) || 80) - (Number(a.Power_Index) || 80))
          for (const cand of allRemaining) {
            if (chosen.length >= 11) break
            if (canPick(cand)) addPlayer(cand)
          }

          // Impact sub: best bench player (power hitter or bowler)
          const impact = allRemaining.find((p) => !chosen.some((c) => c.player_id === p.player_id))

          return {
            ...prev,
            playingXI: chosen.slice(0, 11).map((p) => p.player_id),
            impactPlayerId: impact?.player_id
          }
        })
      },

      recordMatchResult: (matchNo, resultData) => {
        if (!resultData) return

        get().updateActiveCampaign((prev) => {
          const currentFix = (prev.schedule || []).find(f => f.matchNo === matchNo)
          const targetRound = currentFix?.round || 1

          const pointsMap: Record<string, { played: number, won: number, lost: number, runsFor: number, oversFor: number, runsAgainst: number, oversAgainst: number }> = {}
          
          // Seed pointsMap from existing pointsTable
          (prev.pointsTable || generateInitialPointsTable()).forEach(t => {
            pointsMap[t.teamId] = {
              played: t.played,
              won: t.won,
              lost: t.lost,
              runsFor: t.nrr * t.played * 20 + t.played * 160,
              oversFor: Math.max(1, t.played * 20),
              runsAgainst: t.played * 160,
              oversAgainst: Math.max(1, t.played * 20)
            }
          })

          // 1. Update the user's match
          const updatedSchedule = (prev.schedule || []).map((f) => {
            if (f.matchNo === matchNo) {
              return {
                ...f,
                status: 'COMPLETED' as const,
                result: resultData
              }
            }

            // 2. Simultaneously simulate any unplayed AI match in this same round
            if (f.round === targetRound && f.status !== 'COMPLETED' && f.matchNo !== matchNo) {
              const aiRes = simulateAIMatch(f)
              return {
                ...f,
                status: 'COMPLETED' as const,
                result: aiRes
              }
            }

            return f
          })

          // 3. Accumulate points & NRR for this round's completed matches
          updatedSchedule.filter(f => f.round === targetRound && f.result).forEach(f => {
            const res = f.result!
            const tA = f.teamAId
            const tB = f.teamBId

            if (pointsMap[tA] && pointsMap[tB]) {
              pointsMap[tA].played += 1
              pointsMap[tB].played += 1

              if (res.winnerTeamId === tA) {
                pointsMap[tA].won += 1
                pointsMap[tB].lost += 1
              } else {
                pointsMap[tB].won += 1
                pointsMap[tA].lost += 1
              }

              pointsMap[tA].runsFor += res.teamARuns
              pointsMap[tA].oversFor += res.teamAOvers
              pointsMap[tA].runsAgainst += res.teamBRuns
              pointsMap[tA].oversAgainst += res.teamBOvers

              pointsMap[tB].runsFor += res.teamBRuns
              pointsMap[tB].oversFor += res.teamBOvers
              pointsMap[tB].runsAgainst += res.teamARuns
              pointsMap[tB].oversAgainst += res.teamAOvers
            }
          })

          // Rebuild points table
          const updatedPoints = (prev.pointsTable || generateInitialPointsTable()).map((entry) => {
            const st = pointsMap[entry.teamId]
            if (!st) return entry
            const nrr = st.oversFor > 0 ? (st.runsFor / st.oversFor) - (st.runsAgainst / st.oversAgainst) : 0
            return {
              ...entry,
              played: st.played,
              won: st.won,
              lost: st.lost,
              points: st.won * 2,
              nrr: Math.round(nrr * 1000) / 1000
            }
          })

          // Sort Points Table by Points descending, then NRR descending
          updatedPoints.sort((a, b) => b.points - a.points || b.nrr - a.nrr)

          // 4. Find the user's next upcoming match and mark it CURRENT
          const nextMyMatch = updatedSchedule.find(f => f.isMyMatch && f.status === 'UPCOMING')
          if (nextMyMatch) {
            nextMyMatch.status = 'CURRENT'
          } else if (targetRound >= 14) {
            // League complete! Seed Top 4 into Qualifier 1 & Eliminator
            const top4 = updatedPoints.slice(0, 4)
            const q1 = updatedSchedule.find(f => f.matchNo === 71)
            const elim = updatedSchedule.find(f => f.matchNo === 72)

            if (q1 && top4.length >= 2) {
              q1.teamAId = top4[0].teamId
              q1.teamAName = top4[0].teamName
              q1.teamAShort = top4[0].shortName
              q1.teamAColor = top4[0].color
              q1.teamAEmoji = top4[0].emoji
              q1.teamBId = top4[1].teamId
              q1.teamBName = top4[1].teamName
              q1.teamBShort = top4[1].shortName
              q1.teamBColor = top4[1].color
              q1.teamBEmoji = top4[1].emoji
              q1.isMyMatch = q1.teamAId === prev.teamId || q1.teamBId === prev.teamId
              q1.status = 'CURRENT'
            }

            if (elim && top4.length >= 4) {
              elim.teamAId = top4[2].teamId
              elim.teamAName = top4[2].teamName
              elim.teamAShort = top4[2].shortName
              elim.teamAColor = top4[2].color
              elim.teamAEmoji = top4[2].emoji
              elim.teamBId = top4[3].teamId
              elim.teamBName = top4[3].teamName
              elim.teamBShort = top4[3].shortName
              elim.teamBColor = top4[3].color
              elim.teamBEmoji = top4[3].emoji
              elim.isMyMatch = elim.teamAId === prev.teamId || elim.teamBId === prev.teamId
            }
          }

          return {
            ...prev,
            schedule: updatedSchedule,
            currentMatchIndex: Math.min(matchNo, updatedSchedule.length - 1),
            pointsTable: updatedPoints
          }
        })
      }
    }),
    {
      name: 'auctionxi-user-campaign-v3',
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
