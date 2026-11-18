import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getFranchise, IPLPlayer, IPL_FRANCHISES } from '../data/franchises'
import { 
  ALL_TEAM_IDS,
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

// Intelligent Cricket Lineup Builder & Tactical Optimizer
// Calibrates XI based on: Pitch/Venue characteristics, Rival Strengths/Weaknesses, and Bat-First vs Bowl-First tactics
export function computeOptimalPlayingXI(
  activeSquad: CampaignPlayer[],
  options?: {
    venueCity?: string;
    rivalTeamId?: string;
    mode?: 'bat_first' | 'bowl_first';
  }
): { xiIds: string[]; impactId?: string; strategySummary?: string } {
  const eligible = activeSquad.filter((p) => !p.is_released)
  if (eligible.length === 0) return { xiIds: [] }

  const venue = options?.venueCity || 'Mumbai'
  const rival = (options?.rivalTeamId || 'csk').toLowerCase()
  const mode = options?.mode || 'bat_first'

  // Spin-favoring conditions (Chepauk, Ekana, Arun Jaitley)
  const isSpinTrack = venue === 'Chennai' || venue === 'Lucknow' || venue === 'Delhi'
  // Pace & Bounce / High Scoring (Wankhede, Hyderabad, Eden Gardens, Mohali)
  const isPaceTrack = venue === 'Mumbai' || venue === 'Hyderabad' || venue === 'Kolkata' || venue === 'Mohali'
  // Short boundaries (Chinnaswamy)
  const isSmallGround = venue === 'Bengaluru'
  // Large Outfield (Jaipur, Ahmedabad)
  const isLargeGround = venue === 'Jaipur' || venue === 'Ahmedabad'

  // Helper to test spinner keywords
  const isSpinner = (p: CampaignPlayer) => {
    const n = p.name.toLowerCase()
    const s = (p.statsSummary || '').toLowerCase()
    return n.includes('chahal') || n.includes('kuldeep') || n.includes('narine') || 
           n.includes('rashid') || n.includes('ashwin') || n.includes('jadeja') || 
           n.includes('bishnoi') || n.includes('varun') || n.includes('axar') || 
           n.includes('theekshana') || n.includes('hasaranga') || n.includes('zampa') || 
           n.includes('suyash') || n.includes('noor') || s.includes('spin') || s.includes('turn')
  }

  // Helper to test express pacers / swing
  const isExpressPacer = (p: CampaignPlayer) => {
    const n = p.name.toLowerCase()
    const s = (p.statsSummary || '').toLowerCase()
    return n.includes('bumrah') || n.includes('boult') || n.includes('starc') || 
           n.includes('cummins') || n.includes('arshdeep') || n.includes('shami') || 
           n.includes('siraj') || n.includes('archer') || n.includes('nortje') || 
           n.includes('rabada') || n.includes('coetzee') || n.includes('mayank yadav') || 
           n.includes('ferguson') || n.includes('wood') || n.includes('harshit') || 
           s.includes('pace') || s.includes('pacer') || s.includes('seam') || s.includes('swing') || s.includes('yorker')
  }

  // Helper to test explosive boundary clearers
  const isPowerhitter = (p: CampaignPlayer) => {
    const n = p.name.toLowerCase()
    const s = (p.statsSummary || '').toLowerCase()
    return n.includes('klaasen') || n.includes('pooran') || n.includes('russell') || 
           n.includes('rohit') || n.includes('suryakumar') || n.includes('hardik') || 
           n.includes('head') || n.includes('miller') || n.includes('rinku') || 
           n.includes('livingstone') || n.includes('maxwell') || s.includes('six') || s.includes('explosive')
  }

  // Compute Tactical Rating per player
  const scoredSquad = eligible.map((p) => {
    let score = Number(p.Power_Index) || 82
    const s = (p.statsSummary || '').toLowerCase()

    // 1. VENUE FACTOR
    if (isSpinTrack) {
      if (isSpinner(p)) score += 24 // Massive boost on turn tracks
      else if (p.role === 'AR' && isSpinner(p)) score += 20
      else if (isExpressPacer(p) && !p.name.toLowerCase().includes('bumrah')) score -= 4
      if (s.includes('anchor') || p.name.includes('Kohli') || p.name.includes('Gaikwad')) score += 8
    } else if (isPaceTrack) {
      if (isExpressPacer(p)) score += 22 // High bounce & pace carry
      if (isPowerhitter(p)) score += 14 // Clear boundaries with dew
      if (isSpinner(p) && !p.name.includes('Rashid') && !p.name.includes('Narine')) score -= 3
    } else if (isSmallGround) {
      if (isPowerhitter(p)) score += 24 // Chinnaswamy 200+ par score
      if (s.includes('death') || s.includes('yorker')) score += 14
    } else if (isLargeGround) {
      if (p.role === 'AR') score += 10
      if (s.includes('control') || s.includes('economy')) score += 12
    }

    // 2. RIVAL WEAKNESS / STRENGTH COUNTER FACTOR
    if (rival === 'csk') {
      // Counter CSK: pace yorkers at death (Dhoni/Jadeja) + wrist spin in middle overs
      if (s.includes('yorker') || s.includes('death')) score += 10
      if (isSpinner(p)) score += 8
    } else if (rival === 'srh' || rival === 'kkr') {
      // Counter SRH/KKR: New ball swing to dismiss Head/Abhishek/Narine in powerplay
      if (isExpressPacer(p) && (s.includes('swing') || s.includes('powerplay') || p.name.includes('Boult') || p.name.includes('Starc') || p.name.includes('Bumrah'))) score += 16
    } else if (rival === 'mi') {
      // Counter MI: Middle-order mystery spin & wide yorkers
      if (isSpinner(p) || s.includes('yorker')) score += 12
    } else if (rival === 'rr') {
      // Counter RR: Pace variation & change of length
      if (s.includes('cutter') || s.includes('variation')) score += 10
    }

    // 3. TACTICAL MODE FACTOR (Bat First vs Bowl First)
    if (mode === 'bat_first') {
      // Optimize for setting huge target: Boost batting depth
      if (p.role === 'BAT') score += 12
      if (p.role === 'AR') score += 10
      if (p.role === 'WK') score += 8
    } else {
      // Optimize for restricting opposition: Boost 5-6 frontline bowling weapons
      if (p.role === 'BOWL') score += 16
      if (p.role === 'AR') score += 8
      if (isExpressPacer(p) || isSpinner(p)) score += 10
    }

    return { ...p, tacticalScore: score }
  })

  // Group by role sorted by tactical score
  const wks = scoredSquad.filter((p) => p.role === 'WK').sort((a, b) => b.tacticalScore - a.tacticalScore)
  const bats = scoredSquad.filter((p) => p.role === 'BAT').sort((a, b) => b.tacticalScore - a.tacticalScore)
  const ars = scoredSquad.filter((p) => p.role === 'AR').sort((a, b) => b.tacticalScore - a.tacticalScore)
  const bowls = scoredSquad.filter((p) => p.role === 'BOWL').sort((a, b) => b.tacticalScore - a.tacticalScore)

  const selected: CampaignPlayer[] = []
  let overseasCount = 0

  const canSelect = (p: CampaignPlayer) => {
    if (selected.some((s) => s.player_id === p.player_id)) return false
    if (p.is_overseas && overseasCount >= 4) return false
    return true
  }

  const add = (p: CampaignPlayer) => {
    selected.push(p)
    if (p.is_overseas) overseasCount++
  }

  // 1. Mandatory Wicketkeeper (BCCI Rule: min 1 WK)
  const primaryWk = wks.find(canSelect) || wks[0]
  if (primaryWk && canSelect(primaryWk)) {
    add(primaryWk)
  }

  // 2. Openers: Top 2 opening batsmen
  const openerPool = [...bats, ...wks].sort((a, b) => {
    const isOpA = (a.statsSummary || '').toLowerCase().includes('open') ? 30 : 0
    const isOpB = (b.statsSummary || '').toLowerCase().includes('open') ? 30 : 0
    return (b.tacticalScore + isOpB) - (a.tacticalScore + isOpA)
  })

  for (const p of openerPool) {
    if (selected.filter((s) => s.role === 'BAT' || s.role === 'WK').length >= 3) break
    if (canSelect(p)) add(p)
  }

  // 3. Middle Order & Finishers based on Bat-First vs Bowl-First
  const maxBats = mode === 'bat_first' ? 5 : 4
  for (const p of bats) {
    if (selected.filter((s) => s.role === 'BAT').length >= maxBats) break
    if (canSelect(p)) add(p)
  }

  // 4. All-Rounders
  for (const p of ars) {
    if (selected.filter((s) => s.role === 'AR').length >= 3) break
    if (canSelect(p)) add(p)
  }

  // 5. Frontline Bowlers (Ensure bowlers + ars >= 5)
  const minBowlers = mode === 'bowl_first' ? 5 : 4
  for (const p of bowls) {
    if (selected.filter((s) => s.role === 'BOWL').length >= minBowlers) break
    if (canSelect(p)) add(p)
  }

  // 6. Fill remaining up to 11
  const sortedRemaining = [...scoredSquad].sort((a, b) => b.tacticalScore - a.tacticalScore)
  for (const p of sortedRemaining) {
    if (selected.length >= 11) break
    if (canSelect(p)) add(p)
  }

  // Fallback for overseas cap
  for (const p of sortedRemaining) {
    if (selected.length >= 11) break
    if (!selected.some((s) => s.player_id === p.player_id) && !p.is_overseas) {
      selected.push(p)
    }
  }

  // 7. Sort into authentic cricket order 1 to 11
  const orderedXI: CampaignPlayer[] = []
  const pool = [...selected]

  const takeOne = (predicate: (p: CampaignPlayer) => boolean): CampaignPlayer | undefined => {
    const idx = pool.findIndex(predicate)
    if (idx !== -1) {
      const [item] = pool.splice(idx, 1)
      return item
    }
    return undefined
  }

  // 1-2: Openers
  for (let i = 0; i < 2; i++) {
    const opener = takeOne((p) => (p.role === 'BAT' || p.role === 'WK') && (p.statsSummary || '').toLowerCase().includes('open'))
      || takeOne((p) => p.role === 'BAT' || p.role === 'WK')
      || takeOne((p) => p.role === 'AR')
      || pool.shift()
    if (opener) orderedXI.push(opener)
  }

  // 3-4: Top Order Anchors
  for (let i = 0; i < 2; i++) {
    const top = takeOne((p) => p.role === 'BAT')
      || takeOne((p) => p.role === 'WK')
      || takeOne((p) => p.role === 'AR')
      || pool.shift()
    if (top) orderedXI.push(top)
  }

  // 5: Wicketkeeper or Middle-Order Anchor
  const mid = takeOne((p) => p.role === 'WK')
    || takeOne((p) => p.role === 'BAT')
    || takeOne((p) => p.role === 'AR')
    || pool.shift()
  if (mid) orderedXI.push(mid)

  // 6-7: Finishers & All-Rounders
  for (let i = 0; i < 2; i++) {
    const fin = takeOne((p) => p.role === 'AR')
      || takeOne((p) => p.role === 'BAT')
      || takeOne((p) => p.role === 'WK')
      || pool.shift()
    if (fin) orderedXI.push(fin)
  }

  // 8-11: Bowlers (ARs before pure bowlers, express pacers bat last)
  pool.sort((a, b) => {
    if (a.role === 'AR' && b.role !== 'AR') return -1
    if (b.role === 'AR' && a.role !== 'AR') return 1
    const aIsPace = isExpressPacer(a)
    const bIsPace = isExpressPacer(b)
    if (aIsPace && !bIsPace) return 1
    if (!aIsPace && bIsPace) return -1
    return 0
  })

  while (pool.length > 0) {
    orderedXI.push(pool.shift()!)
  }

  // 8. TACTICAL IMPACT PLAYER (12th Man) SELECTION
  const bench = scoredSquad.filter((p) => !orderedXI.some((o) => o.player_id === p.player_id))
  let impact: CampaignPlayer | undefined
  if (mode === 'bat_first') {
    // If batting first: 12th man should be the best frontline bowler/spinner to bowl in 2nd innings!
    impact = bench.filter((p) => p.role === 'BOWL' || p.role === 'AR').sort((a, b) => b.tacticalScore - a.tacticalScore)[0] 
      || bench.sort((a, b) => b.tacticalScore - a.tacticalScore)[0]
  } else {
    // If bowling first: 12th man should be the best explosive finisher/batter to chase in 2nd innings!
    impact = bench.filter((p) => p.role === 'BAT' || p.role === 'WK' || isPowerhitter(p)).sort((a, b) => b.tacticalScore - a.tacticalScore)[0]
      || bench.sort((a, b) => b.tacticalScore - a.tacticalScore)[0]
  }

  const pacerCount = orderedXI.slice(0, 11).filter(isExpressPacer).length
  const spinCount = orderedXI.slice(0, 11).filter(isSpinner).length
  const strategySummary = `Calibrated for ${venue} vs ${rival.toUpperCase()} (${mode === 'bat_first' ? 'Bat First' : 'Bowl First'}): Configured ${pacerCount} Express Pacers + ${spinCount} Spinners, with ${impact?.name || '12th Man'} lined up as tactical Impact Sub!`

  return {
    xiIds: orderedXI.slice(0, 11).map((p) => p.player_id),
    impactId: impact?.player_id,
    strategySummary
  }
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
  batFirstXI?: string[]
  bowlFirstXI?: string[]
  impactPlayerId?: string
  batFirstImpactId?: string
  bowlFirstImpactId?: string
  rulesAcknowledged: boolean
  lastSaved: string
  // Tournament season mode
  schedule: TournamentFixture[]
  currentMatchIndex: number
  pointsTable: TournamentPointsEntry[]
  lockedPhases: Array<'trade' | 'retain_release' | 'mini_auction'>
  rivalTeamsData?: Record<string, {
    remainingPurse: number;
    squad: CampaignPlayer[];
  }>;
  activeMatchSimulation?: {
    fixtureMatchNo: number;
    matchKey?: string;
    tossPhase: 'ceremony' | 'arena';
    userCoinCall: 'heads' | 'tails';
    coinResult: 'heads' | 'tails' | null;
    tossWinner: 'user' | 'rival' | null;
    tossDecision: 'bat' | 'bowl' | null;
    tossSummaryText: string;
    aBatsFirst: boolean;
    currentInnings: 1 | 2;
    inn1: any;
    inn2: any;
    strikerIdx: number;
    nonStrikerIdx: number;
    nextBatterIdx: number;
    currentBowlerIdx: number;
    battingTactic: string;
    bowlingTactic: string;
    matchDone: boolean;
    matchResultSummary: any;
    potm: any;
    bat1Squad: any[];
    bowl1Squad: any[];
    lastSavedTime: number;
  } | null
  lastSimulatedWave?: {
    simulatedCount: number;
    simulatedMatches: Array<{ matchNo: number; teamAShort: string; teamBShort: string; resultSummary: string }>;
    nextMatchNo: number;
    nextRivalShort: string;
  } | null
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
  recordAuctionSale: (player: CampaignPlayer, winnerTeamId: string, winningPrice: number) => void
  updateRivalTeamsData: (rivalData: Record<string, { remainingPurse: number; squad: CampaignPlayer[] }>) => void
  executeTrade: (playerOutId: string, playerIn: CampaignPlayer, rivalTeamId: string, cashDelta: number) => boolean
  setPlayingXI: (playerIds: string[], impactPlayerId?: string, mode?: 'bat_first' | 'bowl_first') => void
  swapPlayingXISlots: (indexA: number, indexB: number, mode?: 'bat_first' | 'bowl_first') => void
  replacePlayingXIPlayer: (slotIndex: number, newPlayerId: string, mode?: 'bat_first' | 'bowl_first') => void
  autoOptimizePlayingXI: (venueCity?: string, rivalTeamId?: string, mode?: 'bat_first' | 'bowl_first') => { strategySummary?: string }
  
  // Tournament Season & Match Simulation
  recordMatchResult: (matchNo: number, resultData: TournamentFixture['result'], userScorecard?: any) => void
  simulateScheduleMatch: (matchNo: number) => void
  simulateRound: (roundNumber: number) => void
  saveActiveMatchSimulation: (matchState: any) => void
  clearActiveMatchSimulation: () => void
  dismissSimulatedWaveAlert: () => void
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
        const initialXI = computeOptimalPlayingXI(initialSquad)

        const initialRivals: Record<string, { remainingPurse: number; squad: CampaignPlayer[] }> = {}
        ALL_TEAM_IDS.forEach((tId) => {
          if (tId !== teamId) {
            const f = getFranchise(tId)
            if (f) {
              initialRivals[tId] = {
                remainingPurse: f.miniAuctionPurse2026 || 15.0,
                squad: (f.squad2026 || []).map((p, idx) => ({
                  ...p,
                  player_id: p.player_id || `${tId}_${idx + 1}`,
                  currentPrice: p.price,
                  is_retained: true,
                  is_released: false
                }))
              }
            }
          }
        })

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
          playingXI: initialXI.xiIds,
          impactPlayerId: initialXI.impactId,
          rulesAcknowledged: false,
          lastSaved: new Date().toISOString(),
          schedule,
          currentMatchIndex: 0,
          pointsTable,
          lockedPhases: [],
          rivalTeamsData: initialRivals
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
          // Self-heal: ensure tournament schedule (all 74 matches), points table, and dual playing XIs
          let needsUpdate = false
          let updatedActive = { ...active }

          if (!updatedActive.schedule || updatedActive.schedule.length < 74) {
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
          if (!updatedActive.rivalTeamsData || Object.keys(updatedActive.rivalTeamsData).length === 0) {
            const initialRivals: Record<string, { remainingPurse: number; squad: CampaignPlayer[] }> = {}
            ALL_TEAM_IDS.forEach((tId) => {
              if (tId !== updatedActive.teamId) {
                const f = getFranchise(tId)
                if (f) {
                  initialRivals[tId] = {
                    remainingPurse: f.miniAuctionPurse2026 || 15.0,
                    squad: (f.squad2026 || []).map((p, idx) => ({
                      ...p,
                      player_id: p.player_id || `${tId}_${idx + 1}`,
                      currentPrice: p.price,
                      is_retained: true,
                      is_released: false
                    }))
                  }
                }
              }
            })
            updatedActive.rivalTeamsData = initialRivals
            needsUpdate = true
          }

          // Ensure dual playing 11s (Bat-First & Bowl-First) are populated for matches
          const activeSquad = updatedActive.squad.filter((p) => !p.is_released)
          if (activeSquad.length >= 11) {
            const franchiseData = getFranchise(updatedActive.teamId)
            const homeCity = franchiseData?.stadiumCity || 'Bengaluru'
            
            if (!updatedActive.batFirstXI || updatedActive.batFirstXI.length < 11) {
              const optBat = computeOptimalPlayingXI(activeSquad, { venueCity: homeCity, rivalTeamId: 'csk', mode: 'bat_first' })
              updatedActive.batFirstXI = optBat.xiIds
              updatedActive.batFirstImpactId = optBat.impactId
              if (!updatedActive.playingXI || updatedActive.playingXI.length < 11) {
                updatedActive.playingXI = optBat.xiIds
                updatedActive.impactPlayerId = optBat.impactId
              }
              needsUpdate = true
            }
            if (!updatedActive.bowlFirstXI || updatedActive.bowlFirstXI.length < 11) {
              const optBowl = computeOptimalPlayingXI(activeSquad, { venueCity: homeCity, rivalTeamId: 'csk', mode: 'bowl_first' })
              updatedActive.bowlFirstXI = optBowl.xiIds
              updatedActive.bowlFirstImpactId = optBowl.impactId
              needsUpdate = true
            }
          }

          // Strict Lockdown Self-Healing: guarantee that if a phase is past, it's locked!
          const requiredLocks: Array<'trade' | 'retain_release' | 'mini_auction'> = []
          if (updatedActive.currentPhase === 'retain_release') {
            requiredLocks.push('trade')
          } else if (updatedActive.currentPhase === 'mini_auction') {
            requiredLocks.push('trade', 'retain_release')
          } else if (updatedActive.currentPhase === 'playing_xi' || updatedActive.currentPhase === 'match') {
            requiredLocks.push('trade', 'retain_release', 'mini_auction')
          }

          for (const req of requiredLocks) {
            if (!updatedActive.lockedPhases.includes(req)) {
              updatedActive.lockedPhases.push(req)
              needsUpdate = true
            }
          }

          if (needsUpdate) {
            const activeId = activeCampaignId || active.id
            if (activeId && campaigns[activeId]) {
              // Direct in-memory mutation so callers in this tick see the repaired data immediately
              campaigns[activeId] = updatedActive
            }
            // Defer Zustand set() to microtask so we NEVER trigger setState during React render pass!
            queueMicrotask(() => {
              const state = get()
              const targetId = state.activeCampaignId || active.id
              if (targetId && state.campaigns[targetId]) {
                set({
                  campaigns: {
                    ...state.campaigns,
                    [targetId]: {
                      ...updatedActive,
                      lastSaved: new Date().toISOString()
                    }
                  }
                })
              }
            })
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
        const state = get()
        let activeId = state.activeCampaignId
        if (!activeId || !state.campaigns[activeId]) {
          const userCamps = Object.values(state.campaigns).filter((c) => c.userId === state.currentUserId)
          if (userCamps.length > 0) {
            const sorted = userCamps.sort((a, b) => new Date(b.lastSaved).getTime() - new Date(a.lastSaved).getTime())
            activeId = sorted[0].id
          }
        }
        if (!activeId || !state.campaigns[activeId]) return
        const updated = updater(state.campaigns[activeId])
        set({
          activeCampaignId: activeId,
          campaigns: {
            ...state.campaigns,
            [activeId]: {
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

        const resetXI = computeOptimalPlayingXI(resetSquad)
        const resetCamp: UserCampaign = {
          ...current,
          currentPhase: 'trade',
          remainingPurse: franchise.miniAuctionPurse2026 || 18.5,
          squad: resetSquad,
          releasedStars: [],
          tradedHistory: [],
          playingXI: resetXI.xiIds,
          impactPlayerId: resetXI.impactId,
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

      recordAuctionSale: (player, winnerTeamId, winningPrice) => {
        get().updateActiveCampaign((prev) => {
          if (winnerTeamId === prev.teamId) {
            const newPurse = Math.max(0, Math.round((prev.remainingPurse - winningPrice) * 100) / 100)
            const newSquad = [
              ...prev.squad,
              {
                ...player,
                currentPrice: winningPrice,
                price: winningPrice,
                is_retained: true,
                is_released: false,
                statsSummary: `Acquired in 2027 Mini-Auction for ₹${winningPrice.toFixed(2)} Cr`
              }
            ]
            return {
              ...prev,
              remainingPurse: newPurse,
              squad: newSquad,
              lastSaved: new Date().toISOString()
            }
          } else {
            const currentRivals = prev.rivalTeamsData ? { ...prev.rivalTeamsData } : {}
            const botData = currentRivals[winnerTeamId] || {
              remainingPurse: getFranchise(winnerTeamId)?.miniAuctionPurse2026 || 15.0,
              squad: (getFranchise(winnerTeamId)?.squad2026 || []).map((p, idx) => ({
                ...p,
                player_id: p.player_id || `${winnerTeamId}_${idx + 1}`,
                currentPrice: p.price,
                is_retained: true,
                is_released: false
              }))
            }

            const updatedPurse = Math.max(0, Math.round((botData.remainingPurse - winningPrice) * 100) / 100)
            const updatedSquad = [
              ...botData.squad,
              {
                ...player,
                currentPrice: winningPrice,
                price: winningPrice,
                is_retained: true,
                is_released: false,
                statsSummary: `Acquired in 2027 Mini-Auction for ₹${winningPrice.toFixed(2)} Cr`
              }
            ]

            currentRivals[winnerTeamId] = {
              remainingPurse: updatedPurse,
              squad: updatedSquad
            }

            return {
              ...prev,
              rivalTeamsData: currentRivals,
              lastSaved: new Date().toISOString()
            }
          }
        })
      },

      updateRivalTeamsData: (rivalData) => {
        get().updateActiveCampaign((prev) => ({
          ...prev,
          rivalTeamsData: rivalData,
          lastSaved: new Date().toISOString()
        }))
      },

      executeTrade: (playerOutId, playerIn, rivalTeamId, cashDelta) => {
        const campaign = get().getActiveCampaign()
        if (!campaign) return false
        if (campaign.lockedPhases?.includes('trade')) return false

        const outPlayer = campaign.squad.find((p) => p.player_id === playerOutId)
        if (!outPlayer) return false

        if (campaign.remainingPurse + cashDelta < 0) return false

        let tradeExecuted = false

        get().updateActiveCampaign((prev) => {
          const filteredSquad = prev.squad.filter((p) => p.player_id !== playerOutId)
          const newPlayer: CampaignPlayer = { ...playerIn, is_retained: true, is_released: false }
          const updatedSquad: CampaignPlayer[] = [
            ...filteredSquad,
            newPlayer
          ]

          // Also update playing XIs if playerOut was in them
          const replaceInXI = (xi?: string[]) => 
            (xi || []).map(id => id === playerOutId ? newPlayer.player_id : id)

          tradeExecuted = true

          return {
            ...prev,
            remainingPurse: Math.round((prev.remainingPurse + cashDelta) * 100) / 100,
            squad: updatedSquad,
            playingXI: replaceInXI(prev.playingXI),
            batFirstXI: replaceInXI(prev.batFirstXI),
            bowlFirstXI: replaceInXI(prev.bowlFirstXI),
            impactPlayerId: prev.impactPlayerId === playerOutId ? newPlayer.player_id : prev.impactPlayerId,
            batFirstImpactId: prev.batFirstImpactId === playerOutId ? newPlayer.player_id : prev.batFirstImpactId,
            bowlFirstImpactId: prev.bowlFirstImpactId === playerOutId ? newPlayer.player_id : prev.bowlFirstImpactId,
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

        return tradeExecuted
      },

      setPlayingXI: (playerIds, impactPlayerId, mode = 'bat_first') => {
        get().updateActiveCampaign((prev) => {
          if (mode === 'bat_first') {
            return {
              ...prev,
              batFirstXI: playerIds,
              batFirstImpactId: impactPlayerId,
              playingXI: playerIds,
              impactPlayerId: impactPlayerId || prev.impactPlayerId
            }
          } else {
            return {
              ...prev,
              bowlFirstXI: playerIds,
              bowlFirstImpactId: impactPlayerId
            }
          }
        })
      },

      swapPlayingXISlots: (indexA, indexB, mode = 'bat_first') => {
        get().updateActiveCampaign((prev) => {
          const currentXI = mode === 'bowl_first' && prev.bowlFirstXI && prev.bowlFirstXI.length >= 11
            ? [...prev.bowlFirstXI]
            : (prev.batFirstXI && prev.batFirstXI.length >= 11 ? [...prev.batFirstXI] : [...prev.playingXI])
          if (indexA < 0 || indexA >= currentXI.length || indexB < 0 || indexB >= currentXI.length) return prev
          const temp = currentXI[indexA]
          currentXI[indexA] = currentXI[indexB]
          currentXI[indexB] = temp
          if (mode === 'bowl_first') {
            return { ...prev, bowlFirstXI: currentXI }
          } else {
            return { ...prev, batFirstXI: currentXI, playingXI: currentXI }
          }
        })
      },

      replacePlayingXIPlayer: (slotIndex, newPlayerId, mode = 'bat_first') => {
        get().updateActiveCampaign((prev) => {
          const currentXI = mode === 'bowl_first' && prev.bowlFirstXI && prev.bowlFirstXI.length >= 11
            ? [...prev.bowlFirstXI]
            : (prev.batFirstXI && prev.batFirstXI.length >= 11 ? [...prev.batFirstXI] : [...prev.playingXI])
          if (slotIndex < 0 || slotIndex >= 11) return prev
          const existingIdx = currentXI.indexOf(newPlayerId)
          if (existingIdx !== -1) {
            const oldAtSlot = currentXI[slotIndex]
            currentXI[slotIndex] = newPlayerId
            currentXI[existingIdx] = oldAtSlot
          } else {
            currentXI[slotIndex] = newPlayerId
          }
          if (mode === 'bowl_first') {
            return { ...prev, bowlFirstXI: currentXI }
          } else {
            return { ...prev, batFirstXI: currentXI, playingXI: currentXI }
          }
        })
      },

      autoOptimizePlayingXI: (venueCity, rivalTeamId, mode = 'bat_first') => {
        let strategySummary: string | undefined
        get().updateActiveCampaign((prev) => {
          const activePlayers = prev.squad.filter((p) => !p.is_released)
          if (activePlayers.length === 0) return prev

          const optimized = computeOptimalPlayingXI(activePlayers, { venueCity, rivalTeamId, mode })
          strategySummary = optimized.strategySummary
          if (mode === 'bowl_first') {
            return {
              ...prev,
              bowlFirstXI: optimized.xiIds,
              bowlFirstImpactId: optimized.impactId
            }
          } else {
            return {
              ...prev,
              batFirstXI: optimized.xiIds,
              batFirstImpactId: optimized.impactId,
              playingXI: optimized.xiIds,
              impactPlayerId: optimized.impactId
            }
          }
        })
        return { strategySummary }
      },

      recordMatchResult: (matchNo, resultData, userScorecard) => {
        if (!resultData) return

        get().updateActiveCampaign((prev) => {
          // 1. Identify the user's NEXT upcoming match
          const nextMyMatch = (prev.schedule || []).find(
            (f) => f.isMyMatch && f.status === 'UPCOMING' && f.matchNo > matchNo
          )
          const targetCeiling = nextMyMatch ? nextMyMatch.matchNo : 75

          const newlySimulatedAiMatches: Array<{ matchNo: number; teamAShort: string; teamBShort: string; resultSummary: string }> = []

          // 2. Update user match AND auto-simulate all unplayed AI matches before user's next match
          const updatedSchedule = (prev.schedule || []).map((f) => {
            if (f.matchNo === matchNo) {
              return {
                ...f,
                status: 'COMPLETED' as const,
                result: resultData,
                scorecard: userScorecard || f.scorecard
              }
            }

            // Automatically simulate every AI match occurring before user's next match with full realistic scorecard
            if (f.matchNo < targetCeiling && f.status !== 'COMPLETED' && !f.isMyMatch) {
              const aiSim = simulateAIMatch(f)
              newlySimulatedAiMatches.push({
                matchNo: f.matchNo,
                teamAShort: f.teamAShort,
                teamBShort: f.teamBShort,
                resultSummary: `${aiSim.result.winnerName} won by ${aiSim.result.margin}`
              })
              return {
                ...f,
                status: 'COMPLETED' as const,
                result: aiSim.result,
                scorecard: aiSim.scorecard
              }
            }

            return f
          })

          // 3. Mark user's next match as CURRENT if it exists
          if (nextMyMatch) {
            const nextMatchInUpdated = updatedSchedule.find((f) => f.matchNo === nextMyMatch.matchNo)
            if (nextMatchInUpdated) {
              nextMatchInUpdated.status = 'CURRENT'
            }
          }

          // 4. Rebuild the entire points table deterministically from ALL completed league matches
          const pointsMap: Record<string, { played: number, won: number, lost: number, runsFor: number, oversFor: number, runsAgainst: number, oversAgainst: number }> = {};
          ALL_TEAM_IDS.forEach((id) => {
            pointsMap[id] = { played: 0, won: 0, lost: 0, runsFor: 0, oversFor: 0, runsAgainst: 0, oversAgainst: 0 };
          });

          updatedSchedule.forEach((f) => {
            if (f.status === 'COMPLETED' && f.result && f.stage === 'League') {
              const res = f.result;
              const tA = f.teamAId;
              const tB = f.teamBId;
              if (pointsMap[tA] && pointsMap[tB]) {
                pointsMap[tA].played += 1;
                pointsMap[tB].played += 1;

                if (res.winnerTeamId === tA) {
                  pointsMap[tA].won += 1;
                  pointsMap[tB].lost += 1;
                } else {
                  pointsMap[tB].won += 1;
                  pointsMap[tA].lost += 1;
                }

                pointsMap[tA].runsFor += res.teamARuns;
                pointsMap[tA].oversFor += Math.max(1, res.teamAOvers);
                pointsMap[tA].runsAgainst += res.teamBRuns;
                pointsMap[tA].oversAgainst += Math.max(1, res.teamBOvers);

                pointsMap[tB].runsFor += res.teamBRuns;
                pointsMap[tB].oversFor += Math.max(1, res.teamBOvers);
                pointsMap[tB].runsAgainst += res.teamARuns;
                pointsMap[tB].oversAgainst += Math.max(1, res.teamAOvers);
              }
            }
          });

          const updatedPoints = ALL_TEAM_IDS.map((tId) => {
            const f = getFranchise(tId);
            const st = pointsMap[tId];
            const nrr = st.oversFor > 0 && st.oversAgainst > 0
              ? (st.runsFor / st.oversFor) - (st.runsAgainst / st.oversAgainst)
              : 0;
            return {
              teamId: tId,
              teamName: f.name,
              shortName: f.short,
              color: f.color,
              emoji: f.emoji,
              played: st.played,
              won: st.won,
              lost: st.lost,
              points: st.won * 2,
              nrr: Math.round(nrr * 1000) / 1000
            };
          });

          // Sort Points Table by Points descending, then NRR descending
          updatedPoints.sort((a, b) => b.points - a.points || b.nrr - a.nrr);

          // 5. Seed Playoffs if League Completed (all 70 matches completed)
          const leagueDone = updatedSchedule.filter(f => f.stage === 'League' && f.status === 'COMPLETED').length >= 70;
          if (leagueDone) {
            const top4 = updatedPoints.slice(0, 4);
            const q1 = updatedSchedule.find(f => f.matchNo === 71);
            const elim = updatedSchedule.find(f => f.matchNo === 72);

            if (q1 && top4.length >= 2) {
              q1.teamAId = top4[0].teamId;
              q1.teamAName = top4[0].teamName;
              q1.teamAShort = top4[0].shortName;
              q1.teamAColor = top4[0].color;
              q1.teamAEmoji = top4[0].emoji;
              q1.teamBId = top4[1].teamId;
              q1.teamBName = top4[1].teamName;
              q1.teamBShort = top4[1].shortName;
              q1.teamBColor = top4[1].color;
              q1.teamBEmoji = top4[1].emoji;
              q1.isMyMatch = q1.teamAId === prev.teamId || q1.teamBId === prev.teamId;
              if (q1.status === 'UPCOMING') q1.status = 'CURRENT';
            }

            if (elim && top4.length >= 4) {
              elim.teamAId = top4[2].teamId;
              elim.teamAName = top4[2].teamName;
              elim.teamAShort = top4[2].shortName;
              elim.teamAColor = top4[2].color;
              elim.teamAEmoji = top4[2].emoji;
              elim.teamBId = top4[3].teamId;
              elim.teamBName = top4[3].teamName;
              elim.teamBShort = top4[3].shortName;
              elim.teamBColor = top4[3].color;
              elim.teamBEmoji = top4[3].emoji;
              elim.isMyMatch = elim.teamAId === prev.teamId || elim.teamBId === prev.teamId;
            }
          }

          const waveSummary = newlySimulatedAiMatches.length > 0 ? {
            simulatedCount: newlySimulatedAiMatches.length,
            simulatedMatches: newlySimulatedAiMatches,
            nextMatchNo: nextMyMatch?.matchNo || 74,
            nextRivalShort: nextMyMatch ? (nextMyMatch.teamAId === prev.teamId ? nextMyMatch.teamBShort : nextMyMatch.teamAShort) : 'Playoffs'
          } : null;

          return {
            ...prev,
            schedule: updatedSchedule,
            currentMatchIndex: Math.min(matchNo, updatedSchedule.length - 1),
            pointsTable: updatedPoints,
            activeMatchSimulation: null,
            lastSimulatedWave: waveSummary,
            lastSaved: new Date().toISOString()
          };
        })
      },

      simulateScheduleMatch: (matchNo) => {
        get().updateActiveCampaign((prev) => {
          const match = (prev.schedule || []).find(f => f.matchNo === matchNo);
          if (!match || match.status === 'COMPLETED') return prev;

          const aiSim = simulateAIMatch(match);
          const updatedSchedule = (prev.schedule || []).map(f => f.matchNo === matchNo ? { ...f, status: 'COMPLETED' as const, result: aiSim.result, scorecard: aiSim.scorecard } : f);

          // Rebuild points table from all completed league matches
          const pointsMap: Record<string, { played: number, won: number, lost: number, runsFor: number, oversFor: number, runsAgainst: number, oversAgainst: number }> = {};
          ALL_TEAM_IDS.forEach((id) => {
            pointsMap[id] = { played: 0, won: 0, lost: 0, runsFor: 0, oversFor: 0, runsAgainst: 0, oversAgainst: 0 };
          });

          updatedSchedule.forEach((f) => {
            if (f.status === 'COMPLETED' && f.result && f.stage === 'League') {
              const r = f.result;
              const tA = f.teamAId;
              const tB = f.teamBId;
              if (pointsMap[tA] && pointsMap[tB]) {
                pointsMap[tA].played += 1;
                pointsMap[tB].played += 1;
                if (r.winnerTeamId === tA) {
                  pointsMap[tA].won += 1;
                  pointsMap[tB].lost += 1;
                } else {
                  pointsMap[tB].won += 1;
                  pointsMap[tA].lost += 1;
                }
                pointsMap[tA].runsFor += r.teamARuns;
                pointsMap[tA].oversFor += Math.max(1, r.teamAOvers);
                pointsMap[tA].runsAgainst += r.teamBRuns;
                pointsMap[tA].oversAgainst += Math.max(1, r.teamBOvers);
                pointsMap[tB].runsFor += r.teamBRuns;
                pointsMap[tB].oversFor += Math.max(1, r.teamBOvers);
                pointsMap[tB].runsAgainst += r.teamARuns;
                pointsMap[tB].oversAgainst += Math.max(1, r.teamAOvers);
              }
            }
          });

          const updatedPoints = ALL_TEAM_IDS.map((tId) => {
            const f = getFranchise(tId);
            const st = pointsMap[tId];
            const nrr = st.oversFor > 0 && st.oversAgainst > 0
              ? (st.runsFor / st.oversFor) - (st.runsAgainst / st.oversAgainst)
              : 0;
            return {
              teamId: tId,
              teamName: f.name,
              shortName: f.short,
              color: f.color,
              emoji: f.emoji,
              played: st.played,
              won: st.won,
              lost: st.lost,
              points: st.won * 2,
              nrr: Math.round(nrr * 1000) / 1000
            };
          });
          updatedPoints.sort((a, b) => b.points - a.points || b.nrr - a.nrr);

          return {
            ...prev,
            schedule: updatedSchedule,
            pointsTable: updatedPoints,
            lastSaved: new Date().toISOString()
          };
        });
      },

      simulateRound: (roundNumber) => {
        get().updateActiveCampaign((prev) => {
          const updatedSchedule = (prev.schedule || []).map((f) => {
            if (f.round === roundNumber && f.status !== 'COMPLETED') {
              const aiSim = simulateAIMatch(f);
              return { ...f, status: 'COMPLETED' as const, result: aiSim.result, scorecard: aiSim.scorecard };
            }
            return f;
          });

          const pointsMap: Record<string, { played: number, won: number, lost: number, runsFor: number, oversFor: number, runsAgainst: number, oversAgainst: number }> = {};
          ALL_TEAM_IDS.forEach((id) => {
            pointsMap[id] = { played: 0, won: 0, lost: 0, runsFor: 0, oversFor: 0, runsAgainst: 0, oversAgainst: 0 };
          });

          updatedSchedule.forEach((f) => {
            if (f.status === 'COMPLETED' && f.result && f.stage === 'League') {
              const r = f.result;
              const tA = f.teamAId;
              const tB = f.teamBId;
              if (pointsMap[tA] && pointsMap[tB]) {
                pointsMap[tA].played += 1;
                pointsMap[tB].played += 1;
                if (r.winnerTeamId === tA) {
                  pointsMap[tA].won += 1;
                  pointsMap[tB].lost += 1;
                } else {
                  pointsMap[tB].won += 1;
                  pointsMap[tA].lost += 1;
                }
                pointsMap[tA].runsFor += r.teamARuns;
                pointsMap[tA].oversFor += Math.max(1, r.teamAOvers);
                pointsMap[tA].runsAgainst += r.teamBRuns;
                pointsMap[tA].oversAgainst += Math.max(1, r.teamBOvers);
                pointsMap[tB].runsFor += r.teamBRuns;
                pointsMap[tB].oversFor += Math.max(1, r.teamBOvers);
                pointsMap[tB].runsAgainst += r.teamARuns;
                pointsMap[tB].oversAgainst += Math.max(1, r.teamAOvers);
              }
            }
          });

          const updatedPoints = ALL_TEAM_IDS.map((tId) => {
            const f = getFranchise(tId);
            const st = pointsMap[tId];
            const nrr = st.oversFor > 0 && st.oversAgainst > 0
              ? (st.runsFor / st.oversFor) - (st.runsAgainst / st.oversAgainst)
              : 0;
            return {
              teamId: tId,
              teamName: f.name,
              shortName: f.short,
              color: f.color,
              emoji: f.emoji,
              played: st.played,
              won: st.won,
              lost: st.lost,
              points: st.won * 2,
              nrr: Math.round(nrr * 1000) / 1000
            };
          });
          updatedPoints.sort((a, b) => b.points - a.points || b.nrr - a.nrr);

          return {
            ...prev,
            schedule: updatedSchedule,
            pointsTable: updatedPoints,
            lastSaved: new Date().toISOString()
          };
        });
      },

      saveActiveMatchSimulation: (matchState) => {
        get().updateActiveCampaign((prev) => ({
          ...prev,
          activeMatchSimulation: matchState,
          lastSaved: new Date().toISOString()
        }));
      },

      clearActiveMatchSimulation: () => {
        get().updateActiveCampaign((prev) => ({
          ...prev,
          activeMatchSimulation: null,
          lastSaved: new Date().toISOString()
        }));
      },

      dismissSimulatedWaveAlert: () => {
        get().updateActiveCampaign((prev) => ({
          ...prev,
          lastSimulatedWave: null
        }));
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
