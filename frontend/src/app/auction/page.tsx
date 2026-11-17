'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Gavel, 
  IndianRupee, 
  Users, 
  Globe, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  Flame, 
  Shield, 
  Volume2, 
  VolumeX,
  Play,
  RotateCcw,
  Eye,
  ListOrdered,
  Lock,
  Bot,
  Search,
  Filter,
  Maximize2,
  X,
  Zap,
  AlertTriangle,
  Info
} from 'lucide-react'
import { useCampaignStore, CampaignPlayer } from '../../store/useCampaignStore'
import { CampaignPhaseStepper } from '../../components/CampaignPhaseStepper'
import { 
  getFranchise, 
  IPL_FRANCHISES, 
  generateDynamicAuctionPool, 
  DynamicAuctionPlayer 
} from '../../data/franchises'
import { gameAudio, triggerGameHaptic } from '../../lib/gameAudioAndHaptics'
import { getFranchiseAI } from '../../data/franchiseAI'

const BOT_TEAMS = ['csk', 'mi', 'kkr', 'srh', 'rr', 'dc', 'pbks', 'lsg', 'gt']

export default function MiniAuctionPage() {
  const router = useRouter()
  const { getActiveCampaign, addAuctionPlayerToSquad, advancePhase } = useCampaignStore()
  const campaign = getActiveCampaign()

  // Full multi-franchise auction pool (includes releases from all teams!)
  const [auctionPool, setAuctionPool] = useState<DynamicAuctionPlayer[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [currentBid, setCurrentBid] = useState(0)
  const [highestBidder, setHighestBidder] = useState<string>('BCCI Auctioneer')
  const [bidHistory, setBidHistory] = useState<Array<{ bidder: string; amount: number; isUser?: boolean }>>([])
  const [timer, setTimer] = useState(10)
  const [gavelPhase, setGavelPhase] = useState<'bidding' | 'going_once' | 'going_twice' | 'sold'>('bidding')
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [soldLog, setSoldLog] = useState<Array<{ player: DynamicAuctionPlayer; winner: string; price: number }>>([])
  
  // Right Column View Tabs: 'pool' | 'squads' | 'feed' | 'ledger'
  const [sideTab, setSideTab] = useState<'pool' | 'squads' | 'feed' | 'ledger'>('pool')
  const [selectedFranchiseView, setSelectedFranchiseView] = useState<string>('')

  // Auction Pool Filtering & Inspection
  const [poolSearch, setPoolSearch] = useState('')
  const [poolRoleFilter, setPoolRoleFilter] = useState<'ALL' | 'BAT' | 'BOWL' | 'AR' | 'WK' | 'OS'>('ALL')
  const [previewPlayer, setPreviewPlayer] = useState<DynamicAuctionPlayer | null>(null)
  const [showFullPoolModal, setShowFullPoolModal] = useState(false)

  // AI Auto-Draft / Auto-Auction State
  const [showAutoAuctionModal, setShowAutoAuctionModal] = useState(false)
  const [isAutoSimulating, setIsAutoSimulating] = useState(false)
  const [autoAuctionSummary, setAutoAuctionSummary] = useState<{
    purchased: Array<{ player: DynamicAuctionPlayer; price: number }>
    totalSpent: number
    finalPurse: number
    finalSquadCount: number
    finalOverseasCount: number
    roleBreakdown: { wk: number; bat: number; bowl: number; ar: number }
    rulesSatisfied: boolean
  } | null>(null)

  // Initialize Dynamic Auction Pool (All 10 Franchises)
  useEffect(() => {
    if (!campaign) return
    const pool = generateDynamicAuctionPool(campaign.teamId, campaign.releasedStars || [])
    setAuctionPool(pool)
    if (pool.length > 0) {
      setCurrentBid(pool[0].basePrice)
    }
    setSelectedFranchiseView(campaign.teamId)
  }, [campaign])

  const currentPlayer = auctionPool[currentIndex]
  const isUserHighest = highestBidder === campaign?.teamId

  // Live Timer & Gavel Countdown with Procedural Sound & Haptics
  useEffect(() => {
    if (!currentPlayer || gavelPhase === 'sold' || isAutoSimulating) return

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          if (gavelPhase === 'bidding') {
            gameAudio.playAuctionGavel(false)
            setGavelPhase('going_once')
            return 3
          } else if (gavelPhase === 'going_once') {
            gameAudio.playAuctionGavel(false)
            setGavelPhase('going_twice')
            return 3
          } else if (gavelPhase === 'going_twice') {
            gameAudio.playAuctionGavel(true)
            triggerGameHaptic('gavel')
            setGavelPhase('sold')
            handleSold()
            return 0
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [timer, gavelPhase, currentPlayer, isAutoSimulating])

  // AI Bots Automatic Counter-Bidding with Utility AI Franchise Personalities
  useEffect(() => {
    if (!currentPlayer || gavelPhase === 'sold' || gavelPhase === 'going_twice' || isAutoSimulating) return

    const botTimeout = setTimeout(() => {
      const baseValuation = (currentPlayer.powerIndex / 10) * 1.5
      const availableBots = BOT_TEAMS.filter((t) => t !== campaign?.teamId && t !== highestBidder)
      
      if (availableBots.length > 0) {
        const interestedBots = availableBots.filter((botId) => {
          const ai = getFranchiseAI(botId)
          if (ai.id === 'csk') {
            const isSpinOrAnchor = currentPlayer.role === 'BAT' || currentPlayer.role === 'AR'
            const maxBid = baseValuation * 1.15
            return currentBid < maxBid && isSpinOrAnchor && Math.random() > 0.4
          }
          if (ai.id === 'srh' || ai.id === 'mi') {
            const isPacerOrHitter = currentPlayer.role === 'BOWL' || currentPlayer.powerIndex > 80
            const maxBid = baseValuation * 1.85
            return currentBid < maxBid && (isPacerOrHitter ? Math.random() > 0.25 : Math.random() > 0.5)
          }
          if (ai.id === 'rr') {
            const maxBid = baseValuation * 1.05
            return currentBid < maxBid && Math.random() > 0.35
          }
          return currentBid < baseValuation * 1.3 && Math.random() > 0.4
        })

        if (interestedBots.length > 0) {
          const chosenBot = interestedBots[Math.floor(Math.random() * interestedBots.length)]
          const increment = currentBid < 5 ? 0.25 : currentBid < 10 ? 0.5 : 1.0
          const newBid = Math.round((currentBid + increment) * 100) / 100

          gameAudio.playBiddingPaddle()
          setCurrentBid(newBid)
          setHighestBidder(chosenBot)
          setTimer(8)
          setGavelPhase('bidding')
          setBidHistory((prev) => [
            { bidder: chosenBot.toUpperCase(), amount: newBid },
            ...prev.slice(0, 7)
          ])
        }
      }
    }, Math.floor(Math.random() * 2200) + 1000)

    return () => clearTimeout(botTimeout)
  }, [currentBid, highestBidder, gavelPhase, currentPlayer, isAutoSimulating])

  // Handle SOLD resolution
  const handleSold = () => {
    if (!currentPlayer || !campaign) return

    const isUserWin = highestBidder === campaign.teamId
    const winnerName = isUserWin ? campaign.teamName : (getFranchise(highestBidder)?.name || highestBidder.toUpperCase())
    
    if (isUserWin) {
      gameAudio.playTradeDealSuccess()
      gameAudio.playCrowdRoar('cheer')
      triggerGameHaptic('heavy')
      addAuctionPlayerToSquad({
        player_id: currentPlayer.id,
        name: currentPlayer.name,
        role: currentPlayer.role,
        nationality: currentPlayer.nationality,
        is_overseas: currentPlayer.is_overseas,
        price: currentBid,
        currentPrice: currentBid,
        Power_Index: currentPlayer.powerIndex,
        is_retained: true,
        is_released: false,
        statsSummary: `Acquired in 2027 Mini-Auction for ₹${currentBid.toFixed(2)} Cr`
      }, currentBid)
    }

    setSoldLog((prev) => [
      { player: currentPlayer, winner: winnerName, price: currentBid },
      ...prev
    ])
  }

  // User Bidding Handlers
  const handleUserBid = (increment: number) => {
    if (!campaign || !currentPlayer) return
    const newBid = Math.round((currentBid + increment) * 100) / 100

    if (newBid > campaign.remainingPurse) {
      gameAudio.playTradeReject()
      triggerGameHaptic('trade_reject')
      alert(`Cannot bid ₹${newBid} Cr: Exceeds your available purse of ₹${campaign.remainingPurse.toFixed(2)} Cr!`)
      return
    }

    if (currentPlayer.is_overseas) {
      const overseasCount = campaign.squad.filter((p) => !p.is_released && p.is_overseas).length
      if (overseasCount >= 8) {
        gameAudio.playTradeReject()
        triggerGameHaptic('trade_reject')
        alert('Cannot bid: Your 8-player overseas quota is full!')
        return
      }
    }

    gameAudio.playBiddingPaddle()
    triggerGameHaptic('paddle')
    setCurrentBid(newBid)
    setHighestBidder(campaign.teamId)
    setTimer(10)
    setGavelPhase('bidding')
    setBidHistory((prev) => [
      { bidder: campaign.teamName, amount: newBid, isUser: true },
      ...prev.slice(0, 7)
    ])
  }

  const handleNextPlayer = () => {
    if (currentIndex + 1 < auctionPool.length) {
      const nextIndex = currentIndex + 1
      setCurrentIndex(nextIndex)
      const nextP = auctionPool[nextIndex]
      setCurrentBid(nextP.basePrice)
      setHighestBidder('BCCI Auctioneer')
      setBidHistory([])
      setTimer(10)
      setGavelPhase('bidding')
    } else {
      alert('The 2027 Mini-Auction has concluded! Proceeding to Playing XI selection.')
      handleFinishAuction()
    }
  }

  const handleFinishAuction = () => {
    gameAudio.playPhaseLock()
    triggerGameHaptic('lock')
    advancePhase('playing_xi')
    router.push('/playing-xi')
  }

  // AI Auto-Draft / Auto-Auction Simulation Algorithm based on User's Squad Requirements
  const handleAIAutoCompleteAuction = () => {
    if (!campaign || auctionPool.length === 0) return
    setIsAutoSimulating(true)
    setShowAutoAuctionModal(false)

    gameAudio.playUiTap('medium')
    triggerGameHaptic('medium')

    setTimeout(() => {
      let currentPurse = campaign.remainingPurse
      let simSquad = [...campaign.squad.filter((p) => !p.is_released)]
      let simOverseas = simSquad.filter((p) => p.is_overseas).length
      let simWk = simSquad.filter((p) => p.role === 'WK').length
      let simBowl = simSquad.filter((p) => p.role === 'BOWL').length
      let simBat = simSquad.filter((p) => p.role === 'BAT').length
      let simAr = simSquad.filter((p) => p.role === 'AR').length

      const newPurchases: Array<{ player: DynamicAuctionPlayer; price: number }> = []
      const newSoldLog: Array<{ player: DynamicAuctionPlayer; winner: string; price: number }> = [...soldLog]

      // Loop through remaining lots
      for (let i = currentIndex; i < auctionPool.length; i++) {
        const p = auctionPool[i]

        // Skip if already auctioned in soldLog
        if (newSoldLog.some((item) => item.player.id === p.id)) continue

        const baseVal = (p.powerIndex / 10) * 1.5
        const estimatedPrice = Math.round(
          Math.max(p.basePrice, p.basePrice + Math.random() * Math.max(0.2, (baseVal - p.basePrice) * 0.75)) * 100
        ) / 100

        const slotsToMin18 = Math.max(0, 18 - simSquad.length)
        const reservePurseNeeded = Math.max(0, slotsToMin18 - 1) * 0.40
        const canAfford = (currentPurse - estimatedPrice) >= reservePurseNeeded && currentPurse >= estimatedPrice
        const hasRosterSpace = simSquad.length < 25
        const overseasAllowed = !p.is_overseas || simOverseas < 8

        let userNeedScore = 0

        if (canAfford && hasRosterSpace && overseasAllowed) {
          // Positional urgency evaluation
          if (p.role === 'WK') {
            if (simWk === 0) userNeedScore += 95 // Emergency: BCCI 1 WK rule
            else if (simWk === 1) userNeedScore += 45 // Backup WK
          } else if (p.role === 'BOWL') {
            if (simBowl < 5) userNeedScore += 85 // Need minimum 5 bowlers
            else if (simBowl < 7) userNeedScore += 50
          } else if (p.role === 'BAT') {
            if (simBat < 4) userNeedScore += 75
            else if (simBat < 6) userNeedScore += 45
          } else if (p.role === 'AR') {
            if (simAr < 3) userNeedScore += 65
            else if (simAr < 5) userNeedScore += 35
          }

          // Squad depth urgency
          if (simSquad.length < 18) userNeedScore += 45

          // Quality bonus
          if (p.powerIndex >= 90) userNeedScore += 30
          else if (p.powerIndex >= 85) userNeedScore += 15

          // Budget protection penalty
          if (estimatedPrice > currentPurse * 0.40 && simSquad.length < 18) {
            userNeedScore -= 40
          }
        }

        const shouldUserBuy = canAfford && hasRosterSpace && overseasAllowed && (
          userNeedScore >= 50 || 
          (simSquad.length < 18 && canAfford && Math.random() > 0.25)
        )

        if (shouldUserBuy) {
          currentPurse = Math.round((currentPurse - estimatedPrice) * 100) / 100
          const campaignPlayer: CampaignPlayer = {
            player_id: p.id,
            name: p.name,
            role: p.role,
            nationality: p.nationality,
            is_overseas: p.is_overseas,
            price: estimatedPrice,
            currentPrice: estimatedPrice,
            Power_Index: p.powerIndex,
            is_retained: true,
            is_released: false,
            statsSummary: `Acquired in AI Auto-Auction for ₹${estimatedPrice.toFixed(2)} Cr`
          }

          simSquad.push(campaignPlayer)
          if (p.is_overseas) simOverseas++
          if (p.role === 'WK') simWk++
          if (p.role === 'BOWL') simBowl++
          if (p.role === 'BAT') simBat++
          if (p.role === 'AR') simAr++

          addAuctionPlayerToSquad(campaignPlayer, estimatedPrice)
          newPurchases.push({ player: p, price: estimatedPrice })
          newSoldLog.unshift({ player: p, winner: campaign.teamName, price: estimatedPrice })
        } else {
          // Rival bot buys
          const botTeams = BOT_TEAMS.filter((t) => t !== campaign.teamId)
          const winningBot = botTeams[Math.floor(Math.random() * botTeams.length)]
          const winnerName = getFranchise(winningBot)?.name || winningBot.toUpperCase()
          newSoldLog.unshift({ player: p, winner: winnerName, price: estimatedPrice })
        }
      }

      setSoldLog(newSoldLog)
      setCurrentIndex(auctionPool.length - 1)
      setGavelPhase('sold')
      setIsAutoSimulating(false)

      const totalSpent = newPurchases.reduce((acc, curr) => acc + curr.price, 0)
      setAutoAuctionSummary({
        purchased: newPurchases,
        totalSpent: Math.round(totalSpent * 100) / 100,
        finalPurse: currentPurse,
        finalSquadCount: simSquad.length,
        finalOverseasCount: simOverseas,
        roleBreakdown: { wk: simWk, bat: simBat, bowl: simBowl, ar: simAr },
        rulesSatisfied: simSquad.length >= 18 && simWk >= 1 && simBowl >= 5 && simOverseas <= 8
      })

      gameAudio.playTradeDealSuccess()
      gameAudio.playCrowdRoar('cheer')
      triggerGameHaptic('heavy')
    }, 1100)
  }

  // Filtered pool list for the Pool Tab
  const filteredAuctionPool = useMemo(() => {
    return auctionPool.filter((p) => {
      const matchesSearch = poolSearch.trim() === '' || 
        p.name.toLowerCase().includes(poolSearch.toLowerCase()) || 
        (p.formerTeam && p.formerTeam.toLowerCase().includes(poolSearch.toLowerCase()))
      
      if (!matchesSearch) return false

      if (poolRoleFilter === 'ALL') return true
      if (poolRoleFilter === 'OS') return p.is_overseas
      return p.role === poolRoleFilter
    })
  }, [auctionPool, poolSearch, poolRoleFilter])

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="min-h-screen bg-slate-950" />
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-white text-center">
        <div className="p-8 rounded-3xl bg-slate-900 border border-white/10 max-w-md">
          <Gavel size={36} className="mx-auto text-amber-400 mb-3" />
          <h3 className="text-lg font-black font-display mb-2">No Active Campaign</h3>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs uppercase cursor-pointer"
          >
            Select Franchise
          </button>
        </div>
      </div>
    )
  }

  // Squad Requirements Metrics
  const myFranchise = getFranchise(campaign.teamId)
  const activeSquad = campaign.squad.filter((p) => !p.is_released)
  const activeSquadCount = activeSquad.length
  const overseasCount = activeSquad.filter((p) => p.is_overseas).length
  const wkCount = activeSquad.filter((p) => p.role === 'WK').length
  const batCount = activeSquad.filter((p) => p.role === 'BAT').length
  const bowlCount = activeSquad.filter((p) => p.role === 'BOWL').length
  const arCount = activeSquad.filter((p) => p.role === 'AR').length
  const openSquadSlots = 25 - activeSquadCount
  const slotsNeededForMin18 = Math.max(0, 18 - activeSquadCount)
  const openOverseasSlots = Math.max(0, 8 - overseasCount)
  const avgPursePerSlot = openSquadSlots > 0 ? (campaign.remainingPurse / openSquadSlots).toFixed(2) : '0.00'

  // Contextual Tactical Fit Intelligence for Current Lot
  const getTacticalMatchInfo = () => {
    if (!currentPlayer) return null
    if (currentPlayer.is_overseas && overseasCount >= 8) {
      return {
        type: 'danger',
        badge: 'OVERSEAS LIMIT FULL (8/8)',
        text: `Your squad has 8 overseas players. You cannot bid on ${currentPlayer.name}.`
      }
    }
    if (currentPlayer.basePrice > campaign.remainingPurse) {
      return {
        type: 'warning',
        badge: 'PURSE DEFICIT',
        text: `Base price (₹${currentPlayer.basePrice} Cr) exceeds your available purse (₹${campaign.remainingPurse.toFixed(2)} Cr).`
      }
    }
    if (currentPlayer.role === 'WK') {
      if (wkCount === 0) {
        return {
          type: 'urgent',
          badge: '🚨 URGENT: WICKETKEEPER NEEDED (0/1)',
          text: `BCCI rules require at least 1 Wicketkeeper! ${currentPlayer.name} resolves your critical vacancy.`
        }
      }
      if (wkCount === 1) {
        return {
          type: 'match',
          badge: '🎯 TARGET FIT: BACKUP WICKETKEEPER',
          text: `${currentPlayer.name} provides vital top-order firepower and keeping cover.`
        }
      }
    }
    if (currentPlayer.role === 'BOWL' && bowlCount < 5) {
      return {
        type: 'urgent',
        badge: `🚨 BOWLING DEFICIT: ONLY ${bowlCount}/5 BOWLERS`,
        text: `Playing XI requires 5 frontline bowling options. ${currentPlayer.name} strengthens bowling attack.`
      }
    }
    if (currentPlayer.role === 'BAT' && batCount < 4) {
      return {
        type: 'match',
        badge: `🎯 BATTING NEED (${batCount} in squad)`,
        text: `${currentPlayer.name} solidifies top-to-middle order anchor depth.`
      }
    }
    if (currentPlayer.powerIndex >= 90) {
      return {
        type: 'marquee',
        badge: `🌟 MARQUEE ICON (${currentPlayer.powerIndex} OVR)`,
        text: `Elite game-changer with high match-winning win probability.`
      }
    }
    return {
      type: 'info',
      badge: `📋 ${currentPlayer.role} AVAILABLE`,
      text: `${currentPlayer.name} • Ex-${currentPlayer.formerTeam || 'Franchise'} • Base ₹${currentPlayer.basePrice} Cr`
    }
  }

  const tacticalMatchInfo = getTacticalMatchInfo()

  // Inspecting franchise data for the side squad tab
  const inspectingFranchise = getFranchise(selectedFranchiseView || campaign.teamId)
  const isInspectingMyTeam = inspectingFranchise.id === campaign.teamId
  const displaySquad = isInspectingMyTeam 
    ? campaign.squad.filter((p) => !p.is_released)
    : inspectingFranchise.squad2026

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between pt-12 sm:pt-14 overflow-x-hidden">
      <CampaignPhaseStepper />

      <main className="max-w-7xl mx-auto w-full px-2 sm:px-4 py-2 sm:py-3 flex-1 flex flex-col justify-between overflow-x-hidden">
        
        {/* Top Header Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-2 mb-2 border-b border-white/10 gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                gameAudio.playUiTap('light')
                triggerGameHaptic('light')
                router.push('/')
              }}
              className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-gray-200 hover:text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-white/10 transition-all shrink-0"
              title="Return to Home Dashboard"
            >
              <ArrowLeft size={13} />
              <span>Back</span>
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-mono font-black uppercase">
                  PART 3: LIVE MINI-AUCTION ARENA
                </span>
                <span className="text-[10px] text-gray-400">
                  Pool of {auctionPool.length} Stars (AI Releases + Marquee)
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-black font-display text-white">
                IPL 2027 Gavel Bidding War Room
              </h1>
            </div>
          </div>

          {/* Top Actions: AI Auto-Auction + Sound + Finalize */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowAutoAuctionModal(true)}
              disabled={isAutoSimulating || currentIndex >= auctionPool.length - 1}
              className="px-3 sm:px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_20px_rgba(245,158,11,0.4)] cursor-pointer hover:scale-[1.03] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all shrink-0"
              title="Simulate the entire auction automatically based on your squad requirements"
            >
              <Bot size={15} className="text-slate-950" />
              <span>AI Auto-Complete Auction</span>
            </button>

            {(activeSquadCount >= 18 || currentIndex >= auctionPool.length - 1 || soldLog.length > 0) && (
              <button
                onClick={handleFinishAuction}
                className="px-3.5 sm:px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_20px_rgba(16,185,129,0.4)] cursor-pointer hover:scale-[1.03] active:scale-95 transition-all shrink-0 animate-pulse"
                title="Proceed to Playing XI & Schedule"
              >
                <span>Proceed to Playing XI</span>
                <ArrowRight size={14} />
              </button>
            )}

            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 transition-colors"
              title="Toggle Audio"
            >
              {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
            </button>
          </div>
        </div>

        {/* PROMINENT TEAM REQUIREMENTS & WAR ROOM COMMAND HUD */}
        <div className="rounded-2xl bg-gradient-to-r from-slate-900/95 via-slate-900/90 to-slate-950 border-2 border-amber-500/35 p-2.5 sm:p-3 shadow-[0_0_25px_rgba(245,158,11,0.15)] mb-2.5 shrink-0">
          
          {/* HUD Top Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-2 mb-2 border-b border-white/10 gap-1.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-amber-300 font-display">
                {campaign.teamName} Official Squad Requirements HUD
              </span>
              <span className="text-[10px] text-gray-400 font-mono hidden md:inline">
                (BCCI Cap: 18–25 Squad • Max 8 Overseas • Min 1 WK • Min 5 Bowlers)
              </span>
            </div>

            <div className="flex items-center gap-2">
              {activeSquadCount >= 18 && wkCount >= 1 && bowlCount >= 5 && overseasCount <= 8 ? (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-mono font-bold flex items-center gap-1">
                  <CheckCircle2 size={11} />
                  <span>BCCI Minimums Satisfied</span>
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[9px] font-mono font-bold flex items-center gap-1 animate-pulse">
                  <AlertTriangle size={11} />
                  <span>Requirements Deficits Open</span>
                </span>
              )}
            </div>
          </div>

          {/* 4 Big Requirements Pillar Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-2.5">
            
            {/* 1. Remaining Purse */}
            <div className="p-2 sm:p-2.5 rounded-xl bg-slate-950/80 border border-emerald-500/30 flex flex-col justify-between shadow-inner">
              <div className="flex items-center justify-between text-gray-400 text-[10px] font-bold uppercase">
                <span className="flex items-center gap-1 text-emerald-300">
                  <IndianRupee size={12} />
                  <span>Purse Remaining</span>
                </span>
                <span className="text-[9px] font-mono text-gray-500">₹125 Cr Cap</span>
              </div>
              <div className="text-xl sm:text-2xl font-black font-mono text-emerald-400 my-0.5">
                ₹{campaign.remainingPurse.toFixed(2)} <span className="text-xs text-gray-500">Cr</span>
              </div>
              <div className="text-[10px] text-gray-400 font-mono truncate">
                ~₹{avgPursePerSlot} Cr <span className="text-gray-500">/ open slot</span>
              </div>
            </div>

            {/* 2. Roster Depth */}
            <div className="p-2 sm:p-2.5 rounded-xl bg-slate-950/80 border border-white/10 flex flex-col justify-between shadow-inner">
              <div className="flex items-center justify-between text-gray-400 text-[10px] font-bold uppercase">
                <span className="flex items-center gap-1 text-indigo-300">
                  <Users size={12} />
                  <span>Roster Depth</span>
                </span>
                <span className="text-[9px] font-mono text-gray-500">Min 18 / Max 25</span>
              </div>
              <div className="text-xl sm:text-2xl font-black font-mono text-white my-0.5">
                {activeSquadCount} <span className="text-xs text-gray-500">/ 25</span>
              </div>
              <div className="text-[10px] font-bold truncate">
                {activeSquadCount < 18 ? (
                  <span className="text-rose-400 font-mono">🚨 Need {slotsNeededForMin18} more for min 18</span>
                ) : (
                  <span className="text-emerald-400 font-mono">✓ Min 18 Met ({openSquadSlots} open)</span>
                )}
              </div>
            </div>

            {/* 3. Overseas Quota */}
            <div className="p-2 sm:p-2.5 rounded-xl bg-slate-950/80 border border-white/10 flex flex-col justify-between shadow-inner">
              <div className="flex items-center justify-between text-gray-400 text-[10px] font-bold uppercase">
                <span className="flex items-center gap-1 text-sky-300">
                  <Globe size={12} />
                  <span>Overseas Slots</span>
                </span>
                <span className="text-[9px] font-mono text-gray-500">Max 8 Allowed</span>
              </div>
              <div className="text-xl sm:text-2xl font-black font-mono text-sky-300 my-0.5">
                {overseasCount} <span className="text-xs text-gray-500">/ 8</span>
              </div>
              <div className="text-[10px] font-bold truncate">
                {overseasCount >= 8 ? (
                  <span className="text-rose-400 font-mono">🚫 Cap Reached (No OS bids)</span>
                ) : (
                  <span className="text-sky-400 font-mono">✓ {openOverseasSlots} slots available</span>
                )}
              </div>
            </div>

            {/* 4. Positional Quotas */}
            <div className="p-2 sm:p-2.5 rounded-xl bg-slate-950/80 border border-white/10 flex flex-col justify-between shadow-inner">
              <div className="flex items-center justify-between text-gray-400 text-[10px] font-bold uppercase mb-1">
                <span className="flex items-center gap-1 text-amber-300">
                  <Shield size={12} />
                  <span>Role Quotas</span>
                </span>
                <span className="text-[9px] font-mono text-gray-500">Target Breakdown</span>
              </div>
              <div className="grid grid-cols-2 gap-1 text-[10px] font-mono font-bold">
                <span className={`px-1.5 py-0.5 rounded text-center border ${
                  wkCount === 0 
                    ? 'bg-rose-500/25 text-rose-300 border-rose-500/50 animate-pulse' 
                    : wkCount === 1 
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' 
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                }`}>
                  WK: {wkCount} {wkCount === 0 ? '🚨 0/1' : wkCount === 1 ? '⚠️ 1' : '✓'}
                </span>
                <span className={`px-1.5 py-0.5 rounded text-center border ${
                  bowlCount < 5 
                    ? 'bg-rose-500/25 text-rose-300 border-rose-500/50' 
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                }`}>
                  BOWL: {bowlCount} {bowlCount < 5 ? `🚨 ${bowlCount}/5` : '✓'}
                </span>
                <span className={`px-1.5 py-0.5 rounded text-center border ${
                  batCount < 4 
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' 
                    : 'bg-white/5 text-gray-200 border-white/10'
                }`}>
                  BAT: {batCount}
                </span>
                <span className="px-1.5 py-0.5 rounded text-center border bg-white/5 text-gray-200 border-white/10">
                  AR: {arCount}
                </span>
              </div>
              <div className="text-[9px] text-gray-500 font-mono mt-0.5 truncate">
                Need ≥1 WK • ≥5 Bowlers for Playing XI
              </div>
            </div>

          </div>

          {/* Current Player Tactical Fit Recommendation */}
          {tacticalMatchInfo && (
            <div className={`mt-2 p-1.5 sm:p-2 rounded-xl border flex items-center justify-between gap-2 text-xs transition-all ${
              tacticalMatchInfo.type === 'urgent'
                ? 'bg-rose-500/15 border-rose-500/40 text-rose-200'
                : tacticalMatchInfo.type === 'danger'
                ? 'bg-rose-950/40 border-rose-500/30 text-rose-300'
                : tacticalMatchInfo.type === 'warning'
                ? 'bg-amber-500/15 border-amber-500/30 text-amber-200'
                : tacticalMatchInfo.type === 'match'
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-200'
                : 'bg-white/5 border-white/10 text-gray-300'
            }`}>
              <div className="flex items-center gap-2 truncate">
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black font-mono uppercase tracking-wider shrink-0 ${
                  tacticalMatchInfo.type === 'urgent'
                    ? 'bg-rose-600 text-white'
                    : tacticalMatchInfo.type === 'danger'
                    ? 'bg-rose-800 text-white'
                    : tacticalMatchInfo.type === 'warning'
                    ? 'bg-amber-500 text-slate-950 font-black'
                    : tacticalMatchInfo.type === 'match'
                    ? 'bg-emerald-500 text-slate-950 font-black'
                    : 'bg-indigo-600 text-white'
                }`}>
                  {tacticalMatchInfo.badge}
                </span>
                <span className="text-[11px] truncate font-medium">
                  {tacticalMatchInfo.text}
                </span>
              </div>

              <div className="shrink-0 flex items-center gap-1.5 font-mono text-[10px] text-gray-400">
                <span>Slot Impact:</span>
                <strong className="text-white">
                  {currentPlayer?.is_overseas ? `${overseasCount + 1}/8 OS` : `${overseasCount}/8 OS`} • {activeSquadCount + 1}/25
                </strong>
              </div>
            </div>
          )}

        </div>

        {/* 2-Pane Auction Stage (Side-by-side in landscape!) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 flex-1">
          
          {/* Column 1 (Left 7 cols): Live Hammer Stage & Paddle Controls */}
          <div className="lg:col-span-7 p-3 sm:p-4 rounded-2xl bg-slate-900/90 border border-white/10 flex flex-col justify-between shadow-2xl relative overflow-hidden">
            
            {/* Dramatic Gavel Slam Strike Animation Overlay */}
            {gavelPhase === 'sold' && (
              <div className="absolute inset-0 z-30 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-4 pointer-events-none">
                <div className="relative flex items-center justify-center mb-3">
                  <div className="absolute w-32 h-32 rounded-full border-4 border-amber-400/80 animate-shockwave" />
                  <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center shadow-[0_0_50px_rgba(245,158,11,0.8)] animate-gavel-slam">
                    <Gavel size={36} className="text-white drop-shadow-lg" />
                  </div>
                </div>
                <div className="text-center">
                  <span className="px-4 py-1 rounded-full bg-rose-600 text-white font-black text-[11px] font-mono tracking-widest uppercase shadow-lg">
                    HAMMER DOWN • SOLD!
                  </span>
                  <h3 className="text-lg sm:text-2xl font-black text-white font-display mt-1 drop-shadow-md">
                    {currentPlayer?.name}
                  </h3>
                  <p className="text-xs text-amber-300 font-mono font-bold mt-0.5">
                    Acquired by <span className="text-white uppercase font-black">{highestBidder}</span> for ₹{currentBid.toFixed(2)} Cr
                  </p>
                </div>
              </div>
            )}

            {/* Top Gavel Bar */}
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                  <Gavel size={15} />
                </div>
                <div>
                  <span className="text-[9px] font-mono text-gray-400 block">LOT #{currentIndex + 1} OF {auctionPool.length}</span>
                  <span className="text-[11px] font-black uppercase text-amber-300">Live Auctioneer Hammer</span>
                </div>
              </div>

              {/* Live Countdown Timer */}
              <div className="flex items-center gap-2">
                <div className={`px-2.5 py-0.5 rounded-xl font-mono text-xs font-black flex items-center gap-1 ${
                  timer <= 3 ? 'bg-rose-500/30 text-rose-300 border border-rose-500/50 animate-pulse' : 'bg-slate-800 text-white border border-white/10'
                }`}>
                  <Clock size={12} />
                  <span>00:0{timer}s</span>
                </div>
                <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider ${
                  gavelPhase === 'sold'
                    ? 'bg-rose-500 text-white'
                    : gavelPhase === 'going_twice'
                    ? 'bg-amber-500 text-slate-950 animate-bounce'
                    : gavelPhase === 'going_once'
                    ? 'bg-amber-500/30 text-amber-300'
                    : 'bg-emerald-500/20 text-emerald-300'
                }`}>
                  {gavelPhase.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Middle: Player Profile Spotlight */}
            {currentPlayer ? (
              <div className="py-3 flex flex-col sm:flex-row items-center justify-between gap-4">
                
                {/* Player Card */}
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/15 flex items-center justify-center text-2xl shadow-xl shrink-0">
                    🏏
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2 py-0.2 rounded bg-indigo-500/20 text-indigo-300 text-[9px] font-bold font-mono">
                        {currentPlayer.role}
                      </span>
                      {currentPlayer.is_overseas && (
                        <span className="px-2 py-0.2 rounded bg-sky-500/20 text-sky-300 text-[9px] font-bold font-mono">
                          OVERSEAS
                        </span>
                      )}
                      {currentPlayer.formerTeam && (
                        <span className="text-[10px] text-gray-400 font-mono">Ex: {currentPlayer.formerTeam}</span>
                      )}
                    </div>

                    <h2 className="text-xl sm:text-2xl font-black text-white font-display mt-0.5 tracking-tight">
                      {currentPlayer.name}
                    </h2>
                    
                    <p className="text-[11px] text-gray-400 mt-0.5 max-w-sm line-clamp-2">
                      {currentPlayer.statsSummary}
                    </p>

                    <div className="flex items-center gap-3 mt-1.5 text-[11px] font-mono">
                      <span>Base: <strong className="text-gray-200">₹{currentPlayer.basePrice} Cr</strong></span>
                      <span>•</span>
                      <span>Rating: <strong className="text-amber-400 font-bold">{currentPlayer.powerIndex} OVR</strong></span>
                    </div>
                  </div>
                </div>

                {/* Current Bid Display */}
                <div className="text-center sm:text-right p-3 rounded-2xl bg-slate-950/80 border border-white/10 w-full sm:w-auto shadow-inner shrink-0">
                  <span className="text-[9px] font-black uppercase tracking-wider text-gray-400 block">
                    Highest Bidder
                  </span>
                  <div className={`text-xs font-black mt-0.5 flex items-center justify-center sm:justify-end gap-1 ${
                    isUserHighest ? 'text-emerald-400' : 'text-amber-300'
                  }`}>
                    <span>{isUserHighest ? '👑 YOU HOLD BID' : highestBidder.toUpperCase()}</span>
                  </div>

                  <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-400 mt-0.5">
                    ₹{currentBid.toFixed(2)} <span className="text-xs text-gray-500">Cr</span>
                  </div>
                </div>

              </div>
            ) : null}

            {/* Bottom: User Interactive Paddle Controls */}
            <div className="pt-3 border-t border-white/10">
              {gavelPhase === 'sold' ? (
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <CheckCircle2 size={15} className="text-emerald-400" />
                    <span>HAMMER DOWN: Sold to <strong className="text-amber-300">{highestBidder.toUpperCase()}</strong> for <strong className="text-emerald-400">₹{currentBid.toFixed(2)} Cr</strong>!</span>
                  </div>

                  <button
                    onClick={handleNextPlayer}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1 cursor-pointer shadow-lg"
                  >
                    <span>Next Lot</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
                  <div className="text-[11px] text-gray-300 text-center sm:text-left">
                    <span>Purse: <strong className="text-emerald-400 font-mono">₹{campaign.remainingPurse.toFixed(2)} Cr</strong></span>
                    <span className="block text-[10px] text-gray-500 font-mono">OS: {overseasCount}/8 • Squad: {activeSquadCount}/25</span>
                  </div>

                  {/* Paddle Buttons */}
                  <div className="flex items-center gap-1.5 w-full sm:w-auto">
                    <button
                      onClick={() => handleUserBid(0.2)}
                      disabled={isUserHighest || currentBid + 0.2 > campaign.remainingPurse}
                      className="flex-1 sm:flex-none px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed text-white font-black text-xs uppercase cursor-pointer transition-all shadow-md"
                    >
                      +₹20L
                    </button>
                    <button
                      onClick={() => handleUserBid(0.5)}
                      disabled={isUserHighest || currentBid + 0.5 > campaign.remainingPurse}
                      className="flex-1 sm:flex-none px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed text-white font-black text-xs uppercase cursor-pointer transition-all shadow-md"
                    >
                      +₹50L
                    </button>
                    <button
                      onClick={() => handleUserBid(1.0)}
                      disabled={isUserHighest || currentBid + 1.0 > campaign.remainingPurse}
                      className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-30 disabled:cursor-not-allowed text-slate-950 font-black text-xs uppercase cursor-pointer transition-all shadow-[0_0_12px_rgba(245,158,11,0.4)]"
                    >
                      +₹1.0 Cr
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Column 2 (Right 5 cols): Multi-Tab Live War Room (Pool | Squads & Purses | Feed | Sold) */}
          <div className="lg:col-span-5 flex flex-col gap-2 rounded-2xl bg-slate-900 border border-white/10 p-3 shadow-xl max-h-[460px] overflow-hidden">
            
            {/* Tab Navigation: 4 Tabs */}
            <div className="flex items-center gap-1 pb-2 border-b border-white/10">
              <button
                onClick={() => setSideTab('pool')}
                className={`flex-1 py-1 px-1.5 rounded-lg text-[10px] font-black flex items-center justify-center gap-1 cursor-pointer transition-all ${
                  sideTab === 'pool'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-gray-400 hover:text-white bg-white/5'
                }`}
              >
                <ListOrdered size={12} />
                <span>Pool ({auctionPool.length})</span>
              </button>

              <button
                onClick={() => setSideTab('squads')}
                className={`flex-1 py-1 px-1.5 rounded-lg text-[10px] font-black flex items-center justify-center gap-1 cursor-pointer transition-all ${
                  sideTab === 'squads'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-gray-400 hover:text-white bg-white/5'
                }`}
              >
                <Users size={12} />
                <span>Squads</span>
              </button>

              <button
                onClick={() => setSideTab('feed')}
                className={`flex-1 py-1 px-1.5 rounded-lg text-[10px] font-black flex items-center justify-center gap-1 cursor-pointer transition-all ${
                  sideTab === 'feed'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-gray-400 hover:text-white bg-white/5'
                }`}
              >
                <Flame size={12} />
                <span>Feed</span>
              </button>

              <button
                onClick={() => setSideTab('ledger')}
                className={`flex-1 py-1 px-1.5 rounded-lg text-[10px] font-black flex items-center justify-center gap-1 cursor-pointer transition-all ${
                  sideTab === 'ledger'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-gray-400 hover:text-white bg-white/5'
                }`}
              >
                <CheckCircle2 size={12} />
                <span>Sold ({soldLog.length})</span>
              </button>
            </div>

            {/* TAB 1: AUCTION PLAYER POOL (Interactive 64 Stars Schedule) */}
            {sideTab === 'pool' && (
              <div className="flex-1 flex flex-col justify-between overflow-hidden">
                
                {/* Search & Role Filters Bar */}
                <div className="space-y-1.5 pb-2 mb-1.5 border-b border-white/5">
                  <div className="flex items-center gap-1.5">
                    <div className="relative flex-1">
                      <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={poolSearch}
                        onChange={(e) => setPoolSearch(e.target.value)}
                        placeholder="Search 64 stars or ex-team..."
                        className="w-full bg-slate-950/80 border border-white/15 rounded-lg pl-7 pr-2 py-1 text-[11px] text-white placeholder-gray-500 focus:outline-none focus:border-amber-400"
                      />
                      {poolSearch && (
                        <button
                          onClick={() => setPoolSearch('')}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs cursor-pointer"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    <button
                      onClick={() => setShowFullPoolModal(true)}
                      className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-[10px] font-bold border border-white/10 flex items-center gap-1 shrink-0 cursor-pointer"
                      title="Open Full Pool Grid"
                    >
                      <Maximize2 size={11} />
                      <span>Full Grid</span>
                    </button>
                  </div>

                  {/* Role filter pills */}
                  <div className="flex items-center gap-1 overflow-x-auto pb-0.5 text-[9px] font-mono font-bold">
                    {(['ALL', 'BAT', 'BOWL', 'AR', 'WK', 'OS'] as const).map((r) => (
                      <button
                        key={r}
                        onClick={() => setPoolRoleFilter(r)}
                        className={`px-2 py-0.5 rounded-md cursor-pointer transition-all ${
                          poolRoleFilter === r
                            ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                            : 'bg-white/5 text-gray-400 hover:text-white'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                    <span className="ml-auto text-gray-500 text-[9px]">
                      {filteredAuctionPool.length} of {auctionPool.length}
                    </span>
                  </div>
                </div>

                {/* Pool Players Scrollable List */}
                <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 max-h-64">
                  {filteredAuctionPool.length === 0 ? (
                    <div className="h-40 flex flex-col items-center justify-center text-xs text-gray-500 text-center">
                      <Search size={20} className="mb-1 text-gray-600" />
                      <span>No players found matching &quot;{poolSearch}&quot;</span>
                    </div>
                  ) : (
                    filteredAuctionPool.map((p) => {
                      const originalIndex = auctionPool.findIndex((ap) => ap.id === p.id)
                      const isLiveNow = originalIndex === currentIndex
                      const soldRecord = soldLog.find((s) => s.player.id === p.id)

                      return (
                        <div
                          key={p.id}
                          onClick={() => setPreviewPlayer(p)}
                          className={`p-1.5 sm:p-2 rounded-xl border flex items-center justify-between text-[11px] cursor-pointer transition-all hover:border-amber-400/50 ${
                            isLiveNow
                              ? 'bg-amber-500/15 border-amber-500/60 shadow-[0_0_12px_rgba(245,158,11,0.25)] ring-1 ring-amber-400/50'
                              : soldRecord
                              ? 'bg-white/5 border-white/5 opacity-75'
                              : 'bg-slate-950/60 border-white/10 hover:bg-white/5'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="text-[9px] font-mono text-gray-400 font-bold shrink-0">
                              #{originalIndex + 1}
                            </span>

                            <div className="truncate">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-white truncate">{p.name}</span>
                                <span className={`text-[8px] px-1 rounded font-mono font-bold ${
                                  p.role === 'WK' ? 'bg-indigo-500/25 text-indigo-300' :
                                  p.role === 'BOWL' ? 'bg-rose-500/25 text-rose-300' :
                                  p.role === 'BAT' ? 'bg-blue-500/25 text-blue-300' :
                                  'bg-emerald-500/25 text-emerald-300'
                                }`}>
                                  {p.role}
                                </span>
                                {p.is_overseas && (
                                  <span className="text-[8px] px-1 rounded bg-sky-500/20 text-sky-300 font-mono font-bold">
                                    OS
                                  </span>
                                )}
                              </div>

                              <div className="text-[9px] text-gray-400 font-mono truncate">
                                {p.formerTeam ? `Ex: ${p.formerTeam}` : 'Free Agent'} • Base ₹{p.basePrice} Cr
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-amber-400 font-mono text-[10px] font-bold">
                              {p.powerIndex} OVR
                            </span>

                            {isLiveNow ? (
                              <span className="px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 text-[8px] font-black uppercase font-mono animate-pulse">
                                ON HAMMER
                              </span>
                            ) : soldRecord ? (
                              <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[8px] font-mono font-bold">
                                SOLD ₹{soldRecord.price.toFixed(1)}Cr
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded bg-white/10 text-gray-400 text-[8px] font-mono">
                                UPCOMING
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>

              </div>
            )}

            {/* TAB 2: SQUADS & PURSES */}
            {sideTab === 'squads' && (
              <div className="flex-1 flex flex-col justify-between overflow-hidden">
                
                {/* Franchise Selector */}
                <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-white/5 gap-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Inspect:</span>
                  <select
                    value={selectedFranchiseView}
                    onChange={(e) => setSelectedFranchiseView(e.target.value)}
                    className="bg-slate-950 border border-white/20 rounded-lg px-2 py-1 text-[11px] font-bold text-white focus:outline-none focus:border-amber-400 cursor-pointer flex-1"
                  >
                    <option value={campaign.teamId}>👑 My Team: {campaign.teamName}</option>
                    {BOT_TEAMS.map((tk) => {
                      if (tk === campaign.teamId) return null
                      const f = getFranchise(tk)
                      return (
                        <option key={tk} value={tk}>
                          {f.emoji} {f.name} ({f.short})
                        </option>
                      )
                    })}
                  </select>
                </div>

                {/* Vitals of inspected team */}
                <div className="p-2 rounded-xl bg-slate-950/80 border border-white/10 mb-2 flex items-center justify-between text-[11px] font-mono">
                  <div>
                    <span className="text-gray-400 block text-[9px] uppercase">Purse Left</span>
                    <strong className="text-emerald-400">
                      ₹{isInspectingMyTeam ? campaign.remainingPurse.toFixed(2) : inspectingFranchise.miniAuctionPurse2026.toFixed(2)} Cr
                    </strong>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[9px] uppercase">Squad Size</span>
                    <strong className="text-indigo-300">
                      {displaySquad.length}/25
                    </strong>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[9px] uppercase">Overseas</span>
                    <strong className="text-sky-300">
                      {displaySquad.filter((p) => p.is_overseas).length}/8
                    </strong>
                  </div>
                </div>

                {/* Squad Members Scroll List */}
                <div className="flex-1 overflow-y-auto space-y-1 pr-1 max-h-56">
                  {displaySquad.map((p, idx) => (
                    <div
                      key={p.player_id || idx}
                      className="p-1.5 rounded-lg bg-white/5 border border-white/5 flex items-center justify-between text-[11px]"
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="font-bold text-white truncate">{p.name}</span>
                        {p.is_overseas && (
                          <span className="text-[8px] px-1 rounded bg-sky-500/20 text-sky-300 font-mono">OS</span>
                        )}
                        <span className="text-[9px] text-gray-400 font-mono font-bold">{p.role}</span>
                      </div>
                      <div className="flex items-center gap-2 font-mono shrink-0">
                        <span className="text-amber-400 text-[10px]">{p.Power_Index} OVR</span>
                        <span className="text-emerald-400 font-bold text-[10px]">₹{p.price} Cr</span>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            )}

            {/* TAB 3: LIVE ACTION FEED */}
            {sideTab === 'feed' && (
              <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 max-h-72">
                {bidHistory.length === 0 ? (
                  <div className="h-40 flex items-center justify-center text-xs text-gray-500 text-center">
                    Awaiting opening paddle...
                  </div>
                ) : (
                  bidHistory.map((b, idx) => (
                    <div
                      key={idx}
                      className={`p-2 rounded-xl border flex items-center justify-between text-xs animate-fade-in ${
                        b.isUser
                          ? 'bg-emerald-500/20 border-emerald-500/50 text-white font-bold'
                          : 'bg-white/5 border-white/5 text-gray-300'
                      }`}
                    >
                      <span>{b.bidder}</span>
                      <span className="font-mono text-emerald-400 font-black">₹{b.amount.toFixed(2)} Cr</span>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB 4: SALES LEDGER */}
            {sideTab === 'ledger' && (
              <div className="flex-1 flex flex-col min-h-0">
                {(activeSquadCount >= 18 || soldLog.length > 0) && (
                  <div className="p-2.5 mb-2 rounded-xl bg-emerald-950/70 border border-emerald-500/40 flex items-center justify-between gap-2 shadow-sm shrink-0">
                    <div>
                      <div className="text-xs font-bold text-emerald-300 flex items-center gap-1">
                        <CheckCircle2 size={13} />
                        <span>Squad Finalized ({activeSquadCount} Players)</span>
                      </div>
                      <div className="text-[10px] text-gray-300">Reviewed ledger? Ready for Matchday.</div>
                    </div>
                    <button
                      onClick={handleFinishAuction}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase flex items-center gap-1 cursor-pointer transition-all shadow shrink-0 hover:scale-[1.02] active:scale-95"
                    >
                      <span>Proceed</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                )}
                <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 max-h-72">
                  {soldLog.length === 0 ? (
                    <div className="h-40 flex items-center justify-center text-xs text-gray-500 text-center">
                      No lots sold yet.
                    </div>
                  ) : (
                    soldLog.map((s, idx) => (
                      <div key={idx} className="p-2 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-white block">{s.player.name}</span>
                          <span className="text-[10px] text-gray-400">Sold to: <strong className="text-amber-300">{s.winner}</strong></span>
                        </div>
                        <span className="font-mono text-emerald-400 font-black">₹{s.price.toFixed(2)} Cr</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Global Bottom Proceed Floating Bar when squad minimums satisfied */}
        {activeSquadCount >= 18 && (
          <div className="mt-2.5 p-2.5 sm:p-3 rounded-2xl bg-gradient-to-r from-slate-900/95 via-slate-900 to-slate-950 border border-emerald-500/40 flex items-center justify-between gap-2 shadow-2xl shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <div>
                <div className="text-xs font-bold text-white">
                  Squad Ready for Matchday ({activeSquadCount} Players)
                </div>
                <div className="text-[10px] text-gray-400 font-mono">
                  BCCI Roster Minimums Satisfied • Remaining Purse: ₹{campaign.remainingPurse.toFixed(2)} Cr
                </div>
              </div>
            </div>
            <button
              onClick={handleFinishAuction}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.35)] hover:scale-[1.02] active:scale-95 transition-all shrink-0"
            >
              <span>Proceed to Playing XI & Schedule</span>
              <ArrowRight size={14} />
            </button>
          </div>
        )}

      </main>

      {/* MODAL 1: Quick Player Preview Modal from Pool */}
      {previewPlayer && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="p-5 rounded-3xl bg-slate-900 border border-amber-500/30 max-w-md w-full shadow-2xl relative animate-scale-up">
            <button
              onClick={() => setPreviewPlayer(null)}
              className="absolute top-4 right-4 p-1 rounded-full bg-white/10 hover:bg-white/20 text-gray-400 hover:text-white"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-3 mb-3">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-2xl">
                🏏
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[9px] font-mono font-bold">
                    {previewPlayer.role}
                  </span>
                  {previewPlayer.is_overseas && (
                    <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 text-[9px] font-mono font-bold">
                      OVERSEAS
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-black text-white font-display mt-0.5">{previewPlayer.name}</h3>
                <span className="text-xs text-gray-400 font-mono">Ex: {previewPlayer.formerTeam || 'Free Agent'}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-white/10 mb-3 space-y-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-gray-400">Power Rating:</span>
                <strong className="text-amber-400">{previewPlayer.powerIndex} OVR</strong>
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-gray-400">Base Auction Price:</span>
                <strong className="text-emerald-400">₹{previewPlayer.basePrice} Cr</strong>
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-gray-400">Nationality:</span>
                <span className="text-gray-200">{previewPlayer.nationality}</span>
              </div>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed mb-4">
              {previewPlayer.statsSummary}
            </p>

            <button
              onClick={() => setPreviewPlayer(null)}
              className="w-full py-2.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider cursor-pointer hover:bg-amber-400"
            >
              Close Preview
            </button>
          </div>
        </div>
      )}

      {/* MODAL 2: Full 64-Player Auction Pool Grid */}
      {showFullPoolModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
          <div className="p-4 sm:p-6 rounded-3xl bg-slate-900 border border-white/15 max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl relative animate-scale-up">
            
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
              <div>
                <span className="text-[10px] font-mono text-amber-300 uppercase tracking-wider font-bold">
                  BCCI Official Register
                </span>
                <h2 className="text-lg sm:text-xl font-black font-display text-white">
                  IPL 2027 Auction Player Pool ({auctionPool.length} Stars)
                </h2>
              </div>
              <button
                onClick={() => setShowFullPoolModal(false)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-2 pb-3 mb-2 border-b border-white/5">
              <div className="relative flex-1 w-full">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={poolSearch}
                  onChange={(e) => setPoolSearch(e.target.value)}
                  placeholder="Search player name, former team..."
                  className="w-full bg-slate-950 border border-white/20 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto text-xs font-mono font-bold">
                {(['ALL', 'BAT', 'BOWL', 'AR', 'WK', 'OS'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setPoolRoleFilter(r)}
                    className={`px-2.5 py-1 rounded-lg cursor-pointer transition-all ${
                      poolRoleFilter === r
                        ? 'bg-amber-500 text-slate-950 font-black'
                        : 'bg-white/5 text-gray-400 hover:text-white'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid of Players */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {filteredAuctionPool.map((p) => {
                  const originalIndex = auctionPool.findIndex((ap) => ap.id === p.id)
                  const isLiveNow = originalIndex === currentIndex
                  const soldRecord = soldLog.find((s) => s.player.id === p.id)

                  return (
                    <div
                      key={p.id}
                      className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-all ${
                        isLiveNow
                          ? 'bg-amber-500/15 border-amber-500/70 shadow-md ring-1 ring-amber-400'
                          : soldRecord
                          ? 'bg-white/5 border-white/5 opacity-80'
                          : 'bg-slate-950/70 border-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span className="w-7 h-7 rounded-lg bg-white/5 font-mono text-[10px] text-gray-400 flex items-center justify-center font-bold shrink-0">
                          #{originalIndex + 1}
                        </span>

                        <div className="truncate">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-white truncate">{p.name}</span>
                            <span className={`text-[8px] px-1 rounded font-mono font-bold ${
                              p.role === 'WK' ? 'bg-indigo-500/25 text-indigo-300' :
                              p.role === 'BOWL' ? 'bg-rose-500/25 text-rose-300' :
                              p.role === 'BAT' ? 'bg-blue-500/25 text-blue-300' :
                              'bg-emerald-500/25 text-emerald-300'
                            }`}>
                              {p.role}
                            </span>
                            {p.is_overseas && (
                              <span className="text-[8px] px-1 rounded bg-sky-500/20 text-sky-300 font-mono font-bold">
                                OS
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-gray-400 font-mono truncate block">
                            {p.formerTeam ? `Ex: ${p.formerTeam}` : 'Free Agent'} • Base ₹{p.basePrice} Cr
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-amber-400 font-mono text-xs font-bold block">
                          {p.powerIndex} OVR
                        </span>
                        {isLiveNow ? (
                          <span className="px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 text-[8px] font-black uppercase font-mono">
                            LIVE
                          </span>
                        ) : soldRecord ? (
                          <span className="text-[9px] text-emerald-400 font-mono font-bold">
                            Sold ₹{soldRecord.price.toFixed(1)}Cr
                          </span>
                        ) : (
                          <span className="text-[9px] text-gray-500 font-mono">
                            Upcoming
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="pt-3 mt-2 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
              <span>Showing {filteredAuctionPool.length} of {auctionPool.length} registered stars</span>
              <button
                onClick={() => setShowFullPoolModal(false)}
                className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold cursor-pointer"
              >
                Close Register
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 3: AI Auto-Auction Confirmation Modal */}
      {showAutoAuctionModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="p-6 rounded-3xl bg-slate-900 border border-amber-500/40 max-w-md w-full shadow-2xl relative animate-scale-up">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(245,158,11,0.5)]">
              <Bot size={26} className="text-slate-950" />
            </div>

            <h3 className="text-lg font-black font-display text-white">
              AI Franchise Auto-Draft Director
            </h3>

            <p className="text-xs text-gray-300 mt-1 leading-relaxed">
              Not interested in bidding through all remaining auction lots manually? Let the AI Director complete the auction based on your franchise requirements:
            </p>

            <div className="my-3 p-3 rounded-2xl bg-slate-950/80 border border-white/10 space-y-1.5 text-[11px] font-mono">
              <div className="flex items-center gap-1.5 text-emerald-300">
                <CheckCircle2 size={13} />
                <span>Builds squad to meet BCCI 18-player minimum</span>
              </div>
              <div className="flex items-center gap-1.5 text-indigo-300">
                <CheckCircle2 size={13} />
                <span>Prioritizes missing roles (Wicketkeepers, Bowlers, Batsmen)</span>
              </div>
              <div className="flex items-center gap-1.5 text-sky-300">
                <CheckCircle2 size={13} />
                <span>Strictly enforces 8 Overseas player maximum</span>
              </div>
              <div className="flex items-center gap-1.5 text-amber-300">
                <CheckCircle2 size={13} />
                <span>Manages ₹{campaign.remainingPurse.toFixed(2)} Cr budget with price safety</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAutoAuctionModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase cursor-pointer"
              >
                Cancel & Bid Manually
              </button>

              <button
                onClick={handleAIAutoCompleteAuction}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1 shadow-lg cursor-pointer hover:bg-amber-400"
              >
                <Zap size={14} />
                <span>Simulate Auction</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OVERLAY: Auto-Auction Simulation in Progress */}
      {isAutoSimulating && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-4">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border-2 border-amber-500 flex items-center justify-center mb-4 animate-bounce">
            <Gavel size={32} className="text-amber-400 animate-pulse" />
          </div>
          <h3 className="text-xl font-black font-display text-white text-center">
            Simulating Mini-Auction with 9 AI Rivals...
          </h3>
          <p className="text-xs text-amber-300 font-mono mt-1 text-center">
            Balancing your ₹{campaign.remainingPurse.toFixed(2)} Cr salary cap, overseas quota, and role deficits...
          </p>
        </div>
      )}

      {/* MODAL 4: AI Auto-Auction Results Summary */}
      {autoAuctionSummary && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="p-6 rounded-3xl bg-slate-900 border-2 border-amber-500/50 max-w-xl w-full shadow-2xl relative animate-scale-up max-h-[85vh] flex flex-col">
            
            <div className="text-center pb-3 border-b border-white/10 shrink-0">
              <span className="px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-black uppercase">
                AUCTION OFFICIALLY CONCLUDED
              </span>
              <h2 className="text-2xl font-black font-display text-white mt-1">
                2027 Squad Successfully Drafted!
              </h2>
              <p className="text-xs text-gray-300">
                AI Director drafted <strong className="text-amber-400">{autoAuctionSummary.purchased.length} new stars</strong> to complete your official roster.
              </p>
            </div>

            {/* Checklist of BCCI Requirements */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-3 shrink-0 text-center font-mono text-xs">
              <div className="p-2 rounded-xl bg-slate-950 border border-white/10">
                <span className="text-[9px] text-gray-400 uppercase block">Roster Size</span>
                <strong className="text-white text-sm">{autoAuctionSummary.finalSquadCount} / 25</strong>
                <span className="text-[9px] text-emerald-400 block">✓ Min 18 Met</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-950 border border-white/10">
                <span className="text-[9px] text-gray-400 uppercase block">Overseas</span>
                <strong className="text-sky-300 text-sm">{autoAuctionSummary.finalOverseasCount} / 8</strong>
                <span className="text-[9px] text-emerald-400 block">✓ Cap Safe</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-950 border border-white/10">
                <span className="text-[9px] text-gray-400 uppercase block">Keepers</span>
                <strong className="text-indigo-300 text-sm">{autoAuctionSummary.roleBreakdown.wk} WK</strong>
                <span className="text-[9px] text-emerald-400 block">✓ Min 1 Met</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-950 border border-white/10">
                <span className="text-[9px] text-gray-400 uppercase block">Purse Left</span>
                <strong className="text-emerald-400 text-sm">₹{autoAuctionSummary.finalPurse.toFixed(2)} Cr</strong>
                <span className="text-[9px] text-gray-500 block">Spend: ₹{autoAuctionSummary.totalSpent.toFixed(2)}Cr</span>
              </div>
            </div>

            {/* List of Acquired Recruits */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 my-2">
              <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">
                Acquired Players ({autoAuctionSummary.purchased.length}):
              </span>
              {autoAuctionSummary.purchased.length === 0 ? (
                <div className="p-4 rounded-xl bg-white/5 text-center text-xs text-gray-400">
                  Your squad was already complete! No additional auction purchases needed.
                </div>
              ) : (
                autoAuctionSummary.purchased.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-xl bg-slate-950/80 border border-white/10 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{item.player.name}</span>
                      <span className="px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 text-[9px] font-mono font-bold">
                        {item.player.role}
                      </span>
                      {item.player.is_overseas && (
                        <span className="px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 text-[9px] font-mono font-bold">
                          OS
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-amber-400 text-[10px]">{item.player.powerIndex} OVR</span>
                      <span className="text-emerald-400 font-bold">₹{item.price.toFixed(2)} Cr</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Bottom Proceed CTA */}
            <div className="pt-3 border-t border-white/10 flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  setAutoAuctionSummary(null);
                  setSideTab('ledger');
                }}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase cursor-pointer"
              >
                Review Ledger
              </button>

              <button
                onClick={handleFinishAuction}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-[0_0_20px_rgba(16,185,129,0.4)] cursor-pointer"
              >
                <span>Proceed to Playing XI & Schedule</span>
                <ArrowRight size={14} />
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
