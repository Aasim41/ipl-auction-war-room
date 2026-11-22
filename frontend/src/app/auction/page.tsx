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
  Info,
  SkipForward
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
import TeamLogo from '../../components/TeamLogo'
import { getDetailedPlayerRole, getCompactRoleBadge } from '../../lib/bowlerClassification'
import { getTeamTheme } from '../../data/teamThemes'
const BOT_TEAMS = ['csk', 'mi', 'kkr', 'srh', 'rr', 'dc', 'pbks', 'lsg', 'gt']

export default function MiniAuctionPage() {
  const router = useRouter()
  const { getActiveCampaign, addAuctionPlayerToSquad, recordAuctionSale, updateRivalTeamsData, advancePhase } = useCampaignStore()
  const campaign = getActiveCampaign()

  const myTheme = useMemo(() => getTeamTheme(campaign?.teamId), [campaign?.teamId])

  // Full multi-franchise auction pool (includes releases from all teams!)
  const [auctionPool, setAuctionPool] = useState<DynamicAuctionPlayer[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [currentBid, setCurrentBid] = useState(0)
  const [highestBidder, setHighestBidder] = useState<string>('BCCI Auctioneer')
  const [bidHistory, setBidHistory] = useState<Array<{ bidder: string; amount: number; isUser?: boolean }>>([])

  const currentBidderTheme = useMemo(() => {
    if (highestBidder && highestBidder !== 'none' && highestBidder !== 'BCCI Auctioneer') {
      return getTeamTheme(highestBidder)
    }
    return myTheme
  }, [highestBidder, myTheme])
  const [timer, setTimer] = useState(10)
  const [gavelPhase, setGavelPhase] = useState<'bidding' | 'going_once' | 'going_twice' | 'sold'>('bidding')
  const [nextLotCountdown, setNextLotCountdown] = useState<number | null>(null)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [soldLog, setSoldLog] = useState<Array<{ player: DynamicAuctionPlayer; winner: string; price: number }>>([])
  
  // View Tabs: 'stage' (mobile default) | 'pool' | 'squads' | 'ledger'
  const [auctionView, setAuctionView] = useState<'stage' | 'pool' | 'squads' | 'ledger'>('stage')
  const [sideTab, setSideTab] = useState<'pool' | 'squads' | 'ledger'>('pool')
  const [selectedFranchiseView, setSelectedFranchiseView] = useState<string>('')
  const [expandedLot, setExpandedLot] = useState(false)

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

  // Initialize Dynamic Auction Pool once per campaign
  const poolInitializedRef = useRef<string | null>(null)
  useEffect(() => {
    if (!campaign) return
    if (poolInitializedRef.current === campaign.id) return
    poolInitializedRef.current = campaign.id

    const pool = generateDynamicAuctionPool(
      campaign.teamId, 
      campaign.releasedStars || [],
      campaign.squad,
      campaign.rivalTeamsData,
      campaign.tradedHistory,
      campaign.mode === 'scratch_inception'
    )
    setAuctionPool(pool)
    if (pool.length > 0) {
      setCurrentBid(pool[0].basePrice)
    }
    setSelectedFranchiseView(campaign.teamId)
  }, [campaign?.id])

  const currentPlayer = auctionPool[currentIndex]
  const isUserHighest = highestBidder === campaign?.teamId

  // Live Timer: pure decrement every 1s (NO state mutations inside setState!)
  useEffect(() => {
    if (!currentPlayer || gavelPhase === 'sold' || isAutoSimulating) return

    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    return () => clearInterval(interval)
  }, [gavelPhase, currentPlayer?.id, isAutoSimulating])

  // Gavel countdown phase transitions: runs purely in useEffect when timer reaches 0
  useEffect(() => {
    if (timer > 0 || !currentPlayer || gavelPhase === 'sold' || isAutoSimulating) return

    if (gavelPhase === 'bidding') {
      gameAudio.playAuctionGavel(false)
      setGavelPhase('going_once')
      setTimer(3)
    } else if (gavelPhase === 'going_once') {
      gameAudio.playAuctionGavel(false)
      setGavelPhase('going_twice')
      setTimer(3)
    } else if (gavelPhase === 'going_twice') {
      gameAudio.playAuctionGavel(true)
      triggerGameHaptic('gavel')
      setGavelPhase('sold')
      handleSold()
    }
  }, [timer, gavelPhase, currentPlayer?.id, isAutoSimulating])

  // Dynamic live purse & squad inspection across all 10 franchises
  const getTeamPurse = (teamId: string): number => {
    if (!campaign) return 0
    if (teamId === campaign.teamId) return campaign.remainingPurse
    return campaign.rivalTeamsData?.[teamId]?.remainingPurse ?? (getFranchise(teamId)?.miniAuctionPurse2026 || 15.0)
  }

  const getTeamSquad = (teamId: string): CampaignPlayer[] => {
    if (!campaign) return []
    if (teamId === campaign.teamId) return campaign.squad.filter((p) => !p.is_released)
    return (
      campaign.rivalTeamsData?.[teamId]?.squad ??
      (getFranchise(teamId)?.squad2026 || []).map((p, idx) => ({
        ...p,
        player_id: p.player_id || `${teamId}_${idx + 1}`,
        currentPrice: p.price,
        is_retained: p.is_retained ?? true,
        is_released: false
      }))
    )
  }

  // Strict BCCI Budget & Roster Compliance Validator
  const canTeamBid = (teamId: string, bidAmount: number, isOverseas: boolean): boolean => {
    const purse = getTeamPurse(teamId)
    const squad = getTeamSquad(teamId)

    // Rule 1: Cannot bid more than available purse
    if (bidAmount > purse) return false

    // Rule 2: Cannot exceed 25 roster limit
    if (squad.length >= 25) return false

    // Rule 3: Cannot exceed 8 overseas limit
    if (isOverseas) {
      const osCount = squad.filter((p) => p.is_overseas).length
      if (osCount >= 8) return false
    }

    // Rule 4: BCCI Reserve Purse Rule - Must preserve ₹0.30 Cr per remaining slot needed to reach 18 players
    const slotsToMin18 = Math.max(0, 18 - squad.length)
    const reserveNeeded = Math.max(0, slotsToMin18 - 1) * 0.30
    if (purse - bidAmount < reserveNeeded) return false

    return true
  }

  // AI Bots Automatic Counter-Bidding with Utility AI Franchise Personalities & Strict Budget Check
  useEffect(() => {
    if (!currentPlayer || gavelPhase === 'sold' || gavelPhase === 'going_twice' || isAutoSimulating) return

    const botTimeout = setTimeout(() => {
      const availableBots = BOT_TEAMS.filter((t) => t !== campaign?.teamId && t !== highestBidder)
      
      if (availableBots.length > 0) {
        const interestedBots = availableBots.filter((botId) => {
          const increment = currentBid < 5 ? 0.25 : currentBid < 10 ? 0.5 : 1.0
          const candidateBid = Math.round((currentBid + increment) * 100) / 100

          // Strict financial and squad compliance
          if (!canTeamBid(botId, candidateBid, currentPlayer.is_overseas)) return false

          const botPurse = getTeamPurse(botId)
          const botSquad = getTeamSquad(botId)
          const ai = getFranchiseAI(botId)

          const slotsToMin18 = Math.max(0, 18 - botSquad.length)
          const reserveNeeded = Math.max(0, slotsToMin18 - 1) * 0.30
          const maxAffordable = Math.max(0, botPurse - reserveNeeded)

          let valuation = (currentPlayer.powerIndex / 10) * 1.5
          if (ai.id === 'csk') {
            const isSpinOrAnchor = currentPlayer.role === 'BAT' || currentPlayer.role === 'AR'
            if (isSpinOrAnchor) valuation *= 1.2
          } else if (ai.id === 'srh' || ai.id === 'mi') {
            const isPacerOrHitter = currentPlayer.role === 'BOWL' || currentPlayer.powerIndex > 80
            if (isPacerOrHitter) valuation *= 1.35
          } else if (ai.id === 'rr') {
            valuation *= 1.05
          }

          const maxBid = Math.min(maxAffordable, valuation)
          return candidateBid <= maxBid && Math.random() > 0.35
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
    }, Math.floor(Math.random() * 2000) + 900)

    return () => clearTimeout(botTimeout)
  }, [currentBid, highestBidder, gavelPhase, currentPlayer, isAutoSimulating, campaign])

  // Handle SOLD resolution
  const soldPlayerIdsRef = useRef<Set<string>>(new Set())
  const handleSold = () => {
    if (!currentPlayer || !campaign) return

    // Prevent duplicate sold processing for the same player lot
    if (soldPlayerIdsRef.current.has(currentPlayer.id)) return
    soldPlayerIdsRef.current.add(currentPlayer.id)

    // If nobody bid or bidder is still initial auctioneer
    if (!highestBidder || highestBidder === 'BCCI Auctioneer' || highestBidder === 'none' || bidHistory.length === 0) {
      gameAudio.playTradeReject()
      triggerGameHaptic('trade_reject')
      setGavelPhase('sold')
      setSoldLog((prev) => {
        if (prev.some((e) => e.player.id === currentPlayer.id || e.player.name.toLowerCase() === currentPlayer.name.toLowerCase())) {
          return prev
        }
        return [{ player: currentPlayer, winner: 'UNSOLD', price: 0 }, ...prev]
      })
      // Trigger automatic countdown to next lot so it NEVER gets stuck!
      setNextLotCountdown(3)
      return
    }

    const isUserWin = highestBidder === campaign.teamId
    const winnerName = isUserWin ? (getFranchise(campaign.teamId)?.short || campaign.teamName) : (getFranchise(highestBidder)?.short || highestBidder.toUpperCase())
    
    const campaignPlayer: CampaignPlayer = {
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
    }

    // Immediately record sale in store! Deducts purse and adds to that team's squad!
    recordAuctionSale(campaignPlayer, highestBidder, currentBid)

    if (isUserWin) {
      gameAudio.playTradeDealSuccess()
      gameAudio.playCrowdRoar('cheer')
      triggerGameHaptic('heavy')
    } else {
      gameAudio.playAuctionGavel(true)
      triggerGameHaptic('gavel')
    }

    setSoldLog((prev) => {
      if (prev.some((e) => e.player.id === currentPlayer.id || e.player.name.toLowerCase() === currentPlayer.name.toLowerCase())) {
        return prev
      }
      return [{ player: currentPlayer, winner: winnerName, price: currentBid }, ...prev]
    })

    // Trigger automatic countdown to next lot (3 seconds) so it NEVER gets stuck!
    setNextLotCountdown(3)
  }

  // Automatic transition countdown to next lot
  useEffect(() => {
    if (nextLotCountdown === null) return
    if (nextLotCountdown <= 0) {
      setNextLotCountdown(null)
      handleNextPlayer()
      return
    }
    const t = setTimeout(() => {
      setNextLotCountdown((prev) => (prev !== null ? prev - 1 : null))
    }, 1000)
    return () => clearTimeout(t)
  }, [nextLotCountdown, currentIndex, auctionPool])

  // User Bidding Eligibility Check & Dynamic Feedback Message
  const [biddingBlockedMsg, setBiddingBlockedMsg] = useState<string | null>(null)

  const getUserBiddingStatus = () => {
    if (!campaign || !currentPlayer) return { canBid: false, type: 'info', reason: 'No player currently on auction block' }
    if (isUserHighest) {
      return { canBid: false, type: 'info', reason: `You currently hold the highest bid (₹${currentBid.toFixed(2)} Cr)!` }
    }
    if (currentPlayer.is_overseas && overseasCount >= 8) {
      return { canBid: false, type: 'danger', reason: 'Bidding Closed: Overseas quota is full (8/8)! You cannot acquire more overseas players.' }
    }
    if (activeSquadCount >= 25) {
      return { canBid: false, type: 'danger', reason: 'Bidding Closed: Squad roster is full (25/25)!' }
    }
    const minNextBid = Math.round((currentBid + 0.2) * 100) / 100
    if (minNextBid > campaign.remainingPurse) {
      return { canBid: false, type: 'danger', reason: `Bidding Closed: Next bid (+₹0.20 Cr = ₹${minNextBid.toFixed(2)} Cr) exceeds remaining purse (₹${campaign.remainingPurse.toFixed(2)} Cr)!` }
    }
    const slotsToMin18 = Math.max(0, 18 - activeSquadCount)
    const reserveNeeded = Math.max(0, slotsToMin18 - 1) * 0.30
    if (campaign.remainingPurse - minNextBid < reserveNeeded) {
      return { canBid: false, type: 'warning', reason: `Bidding Closed: BCCI Reserve Rule — must reserve ₹${reserveNeeded.toFixed(2)} Cr for remaining ${slotsToMin18} slots to reach 18 players!` }
    }
    return { canBid: true, type: 'success', reason: null }
  }

  // User Bidding Handlers
  const handleUserBid = (increment: number) => {
    if (!campaign || !currentPlayer) return
    const status = getUserBiddingStatus()
    if (!status.canBid) {
      gameAudio.playTradeReject()
      triggerGameHaptic('trade_reject')
      setBiddingBlockedMsg(status.reason)
      setTimeout(() => setBiddingBlockedMsg(null), 4500)
      return
    }

    const newBid = Math.round((currentBid + increment) * 100) / 100
    if (!canTeamBid(campaign.teamId, newBid, currentPlayer.is_overseas)) {
      gameAudio.playTradeReject()
      triggerGameHaptic('trade_reject')
      const squad = getTeamSquad(campaign.teamId)
      const slotsToMin18 = Math.max(0, 18 - squad.length)
      const reserveNeeded = Math.max(0, slotsToMin18 - 1) * 0.30
      setBiddingBlockedMsg(`Cannot bid ₹${newBid} Cr! Available purse is ₹${campaign.remainingPurse.toFixed(2)} Cr (Reserve ₹${reserveNeeded.toFixed(2)} Cr needed).`)
      setTimeout(() => setBiddingBlockedMsg(null), 4500)
      return
    }

    setBiddingBlockedMsg(null)
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
    setNextLotCountdown(null)
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
      handleFinishAuction()
    }
  }

  // User Skip Feature: Instantly simulate rivalry AI bidding for current player and advance
  const [skipNotification, setSkipNotification] = useState<{
    playerName: string;
    winner: string;
    price: number;
    unsold: boolean;
  } | null>(null);

  useEffect(() => {
    if (!skipNotification) return;
    const t = setTimeout(() => setSkipNotification(null), 8000);
    return () => clearTimeout(t);
  }, [skipNotification]);

  const handleSkipCurrentPlayer = () => {
    if (!currentPlayer || !campaign || isAutoSimulating) return;

    // Prevent duplicate sold processing
    if (soldPlayerIdsRef.current.has(currentPlayer.id)) {
      handleNextPlayer();
      return;
    }
    soldPlayerIdsRef.current.add(currentPlayer.id);

    const botTeams = BOT_TEAMS.filter((t) => t !== campaign.teamId);
    let winningBot: string | null = null;
    let finalPrice = currentBid;

    // If an AI bot has already placed a bid
    if (highestBidder && highestBidder !== 'BCCI Auctioneer' && highestBidder !== campaign.teamId && highestBidder !== 'none') {
      winningBot = highestBidder;
      finalPrice = currentBid;
    } else {
      // Find candidate rival bots interested in this player lot
      const eligibleBots = botTeams.filter((botId) => {
        const purse = getTeamPurse(botId);
        const squad = getTeamSquad(botId);
        if (currentPlayer.basePrice > purse) return false;
        if (squad.length >= 25) return false;
        if (currentPlayer.is_overseas && squad.filter((sp) => sp.is_overseas).length >= 8) return false;
        const slotsNeeded = Math.max(0, 18 - squad.length);
        const reserveNeeded = Math.max(0, slotsNeeded - 1) * 0.30;
        if (purse - currentPlayer.basePrice < reserveNeeded) return false;

        // Interest valuation check based on powerIndex and random factor
        const valuation = Math.max(currentPlayer.basePrice, (currentPlayer.powerIndex / 10) * 1.5);
        return currentPlayer.basePrice <= valuation && Math.random() > 0.25;
      });

      if (eligibleBots.length > 0) {
        winningBot = eligibleBots[Math.floor(Math.random() * eligibleBots.length)];
        const valuation = Math.max(currentPlayer.basePrice, (currentPlayer.powerIndex / 10) * 1.5);
        const maxAffordable = getTeamPurse(winningBot);
        const targetPrice = Math.min(maxAffordable, valuation);
        const randomFactor = 0.85 + Math.random() * 0.35;
        finalPrice = Math.min(maxAffordable, Math.max(currentPlayer.basePrice, Math.round(targetPrice * randomFactor * 100) / 100));
      }
    }

    if (winningBot) {
      const winnerName = getFranchise(winningBot)?.short || winningBot.toUpperCase();
      const campaignPlayer: CampaignPlayer = {
        player_id: currentPlayer.id,
        name: currentPlayer.name,
        role: currentPlayer.role,
        nationality: currentPlayer.nationality,
        is_overseas: currentPlayer.is_overseas,
        price: finalPrice,
        currentPrice: finalPrice,
        Power_Index: currentPlayer.powerIndex,
        is_retained: true,
        is_released: false,
        statsSummary: `Acquired in 2027 Mini-Auction for ₹${finalPrice.toFixed(2)} Cr`
      };

      recordAuctionSale(campaignPlayer, winningBot, finalPrice);
      setSoldLog((prev) => [{ player: currentPlayer, winner: winnerName, price: finalPrice }, ...prev]);
      gameAudio.playAuctionGavel(true);
      triggerGameHaptic('light');

      setSkipNotification({
        playerName: currentPlayer.name,
        winner: winnerName,
        price: finalPrice,
        unsold: false
      });
    } else {
      setSoldLog((prev) => [{ player: currentPlayer, winner: 'UNSOLD', price: 0 }, ...prev]);
      gameAudio.playTradeReject();
      triggerGameHaptic('light');

      setSkipNotification({
        playerName: currentPlayer.name,
        winner: 'UNSOLD',
        price: 0,
        unsold: true
      });
    }

    // Immediately advance to next player!
    handleNextPlayer();
  };

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

      const simRivals: Record<string, { remainingPurse: number; squad: CampaignPlayer[] }> = {}
      BOT_TEAMS.forEach((tk) => {
        if (tk !== campaign.teamId) {
          simRivals[tk] = {
            remainingPurse: getTeamPurse(tk),
            squad: [...getTeamSquad(tk)]
          }
        }
      })

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
        const reservePurseNeeded = Math.max(0, slotsToMin18 - 1) * 0.30
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

        // User is the human player. AI simulation NEVER automatically buys players for the user's franchise.
        // The user buys players only when manually bidding.
        const shouldUserBuy = false

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
          // Rival bot buys strictly within budget and reserve rules
          const botTeams = BOT_TEAMS.filter((t) => t !== campaign.teamId)
          const eligibleBots = botTeams.filter((botId) => {
            const rData = simRivals[botId]
            if (!rData) return false
            if (estimatedPrice > rData.remainingPurse) return false
            if (rData.squad.length >= 25) return false
            if (p.is_overseas && rData.squad.filter((sp) => sp.is_overseas).length >= 8) return false
            const slotsNeeded = Math.max(0, 18 - rData.squad.length)
            const reserveNeeded = Math.max(0, slotsNeeded - 1) * 0.30
            return (rData.remainingPurse - estimatedPrice) >= reserveNeeded
          })

          if (eligibleBots.length > 0) {
            const winningBot = eligibleBots[Math.floor(Math.random() * eligibleBots.length)]
            const rData = simRivals[winningBot]
            rData.remainingPurse = Math.round((rData.remainingPurse - estimatedPrice) * 100) / 100
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
              statsSummary: `Acquired in 2027 Mini-Auction for ₹${estimatedPrice.toFixed(2)} Cr`
            }
            rData.squad.push(campaignPlayer)
            const winnerName = getFranchise(winningBot)?.short || winningBot.toUpperCase()
            newSoldLog.unshift({ player: p, winner: winnerName, price: estimatedPrice })
          } else {
            // No bot can afford or fit: player is UNSOLD
            newSoldLog.unshift({ player: p, winner: 'UNSOLD', price: 0 })
          }
        }
      }

      // Sync rival teams' data in store
      updateRivalTeamsData(simRivals)

      newSoldLog.forEach((s) => soldPlayerIdsRef.current.add(s.player.id))
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
        badge: `🌟 MARQUEE ICON`,
        text: `Elite game-changer with high match-winning pedigree.`
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
  const displaySquad = getTeamSquad(selectedFranchiseView || campaign.teamId)
  const displayPurse = getTeamPurse(selectedFranchiseView || campaign.teamId)

  return (
    <div 
      className="min-h-[100dvh] bg-transparent text-white flex flex-col safe-page-top pb-16 w-full max-w-full overflow-x-hidden select-none"
    >
      <main className="max-w-7xl mx-auto w-full px-3 sm:px-4 py-3 sm:py-4 flex-1 flex flex-col gap-3">
        
        {/* Minimal Broadcast Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-2 border-b border-white/10 gap-2 shrink-0">
          <div className="flex items-center gap-2.5">
            <div>
              <div className="flex items-center gap-2">
                <span 
                  style={{
                    backgroundColor: myTheme.pillBg,
                    color: myTheme.pillText,
                    borderColor: `${myTheme.primary}80`,
                  }}
                  className="px-2.5 py-0.5 rounded-full border text-[10px] font-mono font-black uppercase shadow-sm"
                >
                  MINI-AUCTION ARENA
                </span>
                <span className="text-[11px] text-gray-400 font-mono hidden sm:inline">
                  Lot #{currentIndex + 1} of {auctionPool.length}
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-black font-display text-white">
                Live Gavel Bidding Stage
              </h1>
            </div>
          </div>

          {/* Top Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            {(activeSquadCount >= 18 || currentIndex >= auctionPool.length - 1 || soldLog.length > 0) && (
              <button
                onClick={handleFinishAuction}
                style={{
                  backgroundColor: myTheme.pillBg,
                  color: myTheme.pillText,
                  boxShadow: `0 0 16px ${myTheme.primary}70`,
                }}
                className="px-4 py-1.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md cursor-pointer hover:scale-[1.02] active:scale-95 transition-all shrink-0"
                title="Proceed to Playing XI"
              >
                <span>Proceed to XI ➔</span>
              </button>
            )}
          </div>
        </div>

        {/* Minimal Tactical HUD Strip */}
        <div 
          style={{
            background: myTheme.cardBg,
            borderColor: myTheme.cardBorder,
            boxShadow: myTheme.cardGlow,
          }}
          className="p-2.5 sm:p-3 rounded-2xl border flex flex-wrap items-center justify-between gap-2 shadow-md"
        >
          <div className="flex items-center gap-2 flex-wrap text-xs font-mono">
            <div className="flex items-center gap-1 text-white font-black">
              <IndianRupee size={13} className="text-white" />
              <span>₹{campaign.remainingPurse.toFixed(1)} Cr Purse</span>
            </div>
            <span className="text-gray-400">•</span>
            <div className="text-white font-bold">
              <span>{activeSquadCount}/25 Squad</span>
              {activeSquadCount < 18 && (
                <span className="text-amber-300 text-[10px] ml-1">(need {slotsNeededForMin18} for 18)</span>
              )}
            </div>
            <span className="text-gray-400">•</span>
            <div className={overseasCount >= 8 ? 'text-rose-400 font-bold' : 'text-sky-300'}>
              {overseasCount}/8 OS
            </div>
            <span className="text-gray-400">•</span>
            <div className={wkCount < 1 ? 'text-rose-400 font-bold' : 'text-emerald-300'}>
              {wkCount} WK
            </div>
            <span className="text-gray-400">•</span>
            <div className={bowlCount < 5 ? 'text-amber-300 font-bold' : 'text-emerald-300'}>
              {bowlCount}/5 Bowl
            </div>
          </div>
        </div>

        {/* Mobile View Switcher Tabs (4 Tabs: Stage | Pool | Squads | Sold) */}
        <div 
          style={{
            background: `${myTheme.bgDeep}f0`,
            borderColor: `${myTheme.primary}40`,
          }}
          className="flex lg:hidden items-center justify-between gap-1 p-1 rounded-2xl border overflow-x-auto scrollbar-none shrink-0"
        >
          {[
            { id: 'stage', label: '🔨 Gavel Stage' },
            { id: 'pool', label: `📋 Pool (${auctionPool.length})` },
            { id: 'squads', label: '👥 Squads' },
            { id: 'ledger', label: `💰 Sold (${soldLog.length})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setAuctionView(tab.id as any);
                if (tab.id !== 'stage') setSideTab(tab.id as any);
                gameAudio.playUiTap('select');
                triggerGameHaptic('light');
              }}
              style={auctionView === tab.id ? {
                backgroundColor: myTheme.pillBg,
                color: myTheme.pillText,
                boxShadow: `0 0 10px ${myTheme.primary}70`,
              } : {}}
              className={`px-2.5 py-1.5 rounded-xl text-[11px] font-black whitespace-nowrap transition-all cursor-pointer flex-1 text-center ${
                auctionView === tab.id
                  ? 'font-black'
                  : 'text-gray-400 hover:text-white bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 2-Pane Auction Stage (Side-by-side on desktop, swipeable tabs on mobile) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 flex-1">
          
          {/* Column 1 (Left 7 cols): Live Hammer Stage & Paddle Controls */}
          <div 
            style={{
              background: myTheme.cardBg,
              borderColor: myTheme.cardBorder,
              boxShadow: myTheme.cardGlow,
            }}
            className={`lg:col-span-7 p-3 sm:p-4 rounded-2xl border flex flex-col justify-between shadow-2xl relative overflow-hidden ${auctionView === 'stage' ? 'flex' : 'hidden lg:flex'}`}
          >
            
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
                  <span className={`px-4 py-1 rounded-full text-white font-black text-[11px] font-mono tracking-widest uppercase shadow-lg ${
                    highestBidder === 'none' || highestBidder === 'BCCI Auctioneer' || bidHistory.length === 0
                      ? 'bg-amber-600'
                      : 'bg-rose-600'
                  }`}>
                    {highestBidder === 'none' || highestBidder === 'BCCI Auctioneer' || bidHistory.length === 0
                      ? 'HAMMER DOWN • UNSOLD'
                      : 'HAMMER DOWN • SOLD!'}
                  </span>
                  <h3 className="text-lg sm:text-2xl font-black text-white font-display mt-1 drop-shadow-md">
                    {currentPlayer?.name}
                  </h3>
                  <p className="text-xs text-amber-300 font-mono font-bold mt-0.5">
                    {highestBidder === 'none' || highestBidder === 'BCCI Auctioneer' || bidHistory.length === 0
                      ? 'No qualifying bids received • Returned to pool'
                      : `Acquired by ${highestBidder === campaign.teamId ? (getFranchise(campaign.teamId)?.short || campaign.teamName) : (getFranchise(highestBidder)?.short || highestBidder.toUpperCase())} for ₹${currentBid.toFixed(2)} Cr`}
                  </p>
                </div>
              </div>
            )}

            {/* Real-time feedback when user skips a player */}
            {skipNotification && (
              <div className="mb-2 p-2 sm:p-2.5 rounded-2xl bg-slate-950 border border-amber-500/50 flex items-center justify-between gap-2 shadow-lg animate-fadeIn text-xs shrink-0">
                <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                  <span className={`px-2 py-0.5 rounded-full font-bold font-mono text-[9px] uppercase tracking-wider shrink-0 ${
                    skipNotification.unsold
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {skipNotification.unsold ? 'UNSOLD' : 'ACQUIRED'}
                  </span>
                  <span className="font-bold text-white text-xs">{skipNotification.playerName}</span>
                  {skipNotification.unsold ? (
                    <span className="text-gray-400 text-xs">passed without rival bids (Unsold).</span>
                  ) : (
                    <span className="text-xs text-gray-200">
                      ➔ Sold to <span className="font-black text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded border border-amber-500/40">{skipNotification.winner}</span> for <span className="font-mono font-bold text-emerald-400">₹{skipNotification.price.toFixed(2)} Cr</span>
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setSkipNotification(null)}
                  className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white text-xs cursor-pointer shrink-0"
                  aria-label="Dismiss notification"
                >
                  ✕
                </button>
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
                <div className={`px-2.5 py-1 rounded-xl font-mono text-xs font-black flex items-center gap-1.5 shadow-sm ${
                  timer <= 3 ? 'bg-rose-500/30 text-rose-300 border border-rose-500/50 animate-pulse' : 'bg-slate-800 text-white border border-white/10'
                }`}>
                  <Clock size={13} className={timer <= 3 ? 'text-rose-400' : 'text-amber-400'} />
                  <span>00:0{timer}s</span>
                </div>
                <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-sm ${
                  gavelPhase === 'sold'
                    ? 'bg-rose-500 text-white'
                    : gavelPhase === 'going_twice'
                    ? 'bg-amber-500 text-slate-950 animate-bounce'
                    : gavelPhase === 'going_once'
                    ? 'bg-amber-500/30 text-amber-300 border border-amber-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}>
                  {gavelPhase.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Hammer Progress Bar */}
            <div className="w-full h-1.5 rounded-full bg-slate-950/80 border border-white/5 overflow-hidden my-1">
              <div 
                className={`h-full transition-all duration-1000 ${
                  timer <= 3 
                    ? 'bg-gradient-to-r from-rose-500 to-rose-600 shadow-[0_0_8px_rgba(244,63,94,0.8)]' 
                    : timer <= 6 
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500' 
                    : 'bg-gradient-to-r from-emerald-400 to-teal-500'
                }`}
                style={{ width: `${Math.max(5, (timer / 10) * 100)}%` }}
              />
            </div>

            {/* Middle: Player Profile Spotlight */}
            {currentPlayer ? (
              <div className="py-2 flex flex-col gap-3">
                
                <div 
                  onClick={() => {
                    setExpandedLot(!expandedLot);
                    gameAudio.playUiTap('light');
                  }}
                  style={{
                    background: currentBidderTheme.cardBg,
                    borderColor: currentBidderTheme.cardBorder,
                    boxShadow: currentBidderTheme.cardGlow,
                  }}
                  className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all shadow-xl"
                >
                  {/* Player Identity */}
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div 
                      style={{
                        backgroundColor: currentBidderTheme.pillBg,
                        color: currentBidderTheme.pillText,
                        borderColor: currentBidderTheme.cardBorder,
                      }}
                      className="w-14 h-14 rounded-2xl border flex items-center justify-center text-3xl shadow-xl shrink-0"
                    >
                      🏏
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span 
                          style={{
                            backgroundColor: `${currentBidderTheme.bgDeep}ee`,
                            color: '#ffffff',
                            border: `1px solid ${currentBidderTheme.primary}70`
                          }}
                          className="px-2 py-0.5 rounded-lg text-[10px] font-bold font-mono"
                        >
                          {getDetailedPlayerRole(currentPlayer)}
                        </span>
                        {currentPlayer.is_overseas && (
                          <span 
                            style={{
                              backgroundColor: currentBidderTheme.pillBg,
                              color: currentBidderTheme.pillText,
                            }}
                            className="px-2 py-0.5 rounded-lg text-[10px] font-black font-mono shadow-sm"
                          >
                            OVERSEAS ✈
                          </span>
                        )}
                        {currentPlayer.formerTeam && (
                          <span className="text-[10px] text-gray-200 font-mono">Ex: {currentPlayer.formerTeam}</span>
                        )}
                      </div>

                      <h2 className="text-lg sm:text-2xl font-black text-white font-display mt-0.5 tracking-tight truncate">
                        {currentPlayer.name}
                      </h2>
                      
                      <div className="flex items-center gap-2 mt-1 text-xs font-mono">
                        <span className="text-gray-200">Base: <strong className="text-white font-black">₹{currentPlayer.basePrice} Cr</strong></span>
                        <span className="text-white/80 text-[10px] ml-1 font-bold">{expandedLot ? '▲ Hide Details' : '▼ View Telemetry'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Current Bid Display */}
                  <div 
                    style={{
                      background: `${currentBidderTheme.bgDeep}f0`,
                      borderColor: currentBidderTheme.cardBorder,
                      boxShadow: `0 0 16px ${currentBidderTheme.primary}50`,
                    }}
                    className="text-center sm:text-right p-3 rounded-2xl border w-full sm:w-auto shadow-2xl shrink-0"
                  >
                    <span className="text-[9px] font-black uppercase tracking-wider text-gray-300 block mb-0.5">
                      Top Live Bidder
                    </span>
                    <div 
                      style={{ color: currentBidderTheme.primary }}
                      className="text-xs font-black flex items-center justify-center sm:justify-end gap-1.5"
                    >
                      {highestBidder !== 'none' && highestBidder !== 'BCCI Auctioneer' && (
                        <TeamLogo teamId={highestBidder === campaign.teamId ? campaign.teamId : highestBidder} size={18} />
                      )}
                      <span>{isUserHighest ? '👑 YOU HOLD BID' : (getFranchise(highestBidder)?.short || highestBidder.toUpperCase())}</span>
                    </div>

                    <div 
                      style={{ color: currentBidderTheme.primary }}
                      className="text-2xl sm:text-3xl font-black font-mono mt-0.5 drop-shadow-[0_0_12px_rgba(255,255,255,0.25)]"
                    >
                      ₹{currentBid.toFixed(2)} <span className="text-xs text-gray-300 font-sans">Cr</span>
                    </div>
                  </div>
                </div>

                {/* Expandable Lot Telemetry Tray */}
                {expandedLot && (
                  <div className="p-3 rounded-2xl bg-slate-950/90 border border-amber-500/30 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono animate-fadeIn">
                    <div className="p-1.5 rounded-lg bg-white/5 border border-white/5">
                      <span className="text-[9px] text-gray-400 block">Role Spec</span>
                      <span className="text-white font-bold">{getDetailedPlayerRole(currentPlayer)}</span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-white/5 border border-white/5">
                      <span className="text-[9px] text-gray-400 block">Cap Impact</span>
                      <span className="text-amber-300 font-bold">~{((currentBid / ((campaign as any)?.remaining_budget || (campaign as any)?.purse || 125)) * 100).toFixed(1)}% Purse</span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-white/5 border border-white/5">
                      <span className="text-[9px] text-gray-400 block">Total Bids</span>
                      <span className="text-sky-300 font-bold">{bidHistory.length} paddles</span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-white/5 border border-white/5">
                      <span className="text-[9px] text-gray-400 block">Synergy Score</span>
                      <span className="text-emerald-400 font-bold">✓ 91% Match</span>
                    </div>
                  </div>
                )}
              </div>
            ) : null}

            {/* Bottom: User Interactive Paddle Controls */}
            <div className="pt-3 border-t border-white/10">
              {gavelPhase === 'sold' ? (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
                    {highestBidder === 'none' || highestBidder === 'BCCI Auctioneer' || bidHistory.length === 0 ? (
                      <>
                        <Gavel size={15} className="text-amber-400 shrink-0" />
                        <span className="truncate">UNSOLD: <strong className="text-gray-300">{currentPlayer.name}</strong> passed without bids.</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                        <span className="truncate">SOLD to <strong className="text-amber-300">{highestBidder === campaign.teamId ? 'YOU' : (getFranchise(highestBidder)?.short || highestBidder.toUpperCase())}</strong> for <strong className="text-emerald-400">₹{currentBid.toFixed(2)} Cr</strong>!</span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                    {nextLotCountdown !== null && (
                      <span className="text-[10px] font-mono text-gray-400 hidden sm:inline">
                        Auto-advancing in {nextLotCountdown}s...
                      </span>
                    )}
                    <button
                      onClick={handleNextPlayer}
                      style={{
                        backgroundColor: myTheme.pillBg,
                        color: myTheme.pillText,
                        boxShadow: `0 0 16px ${myTheme.primary}70`,
                      }}
                      className="px-4 py-2 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-lg transition-transform active:scale-95"
                    >
                      <span>{nextLotCountdown !== null ? `Next (${nextLotCountdown}s)` : 'Next Lot'}</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {/* Real-time Bid Validation Feedback Banner */}
                  {(!getUserBiddingStatus().canBid || biddingBlockedMsg) && (
                    <div className={`p-2.5 rounded-xl text-xs font-bold flex items-start gap-2 shadow-lg animate-fade-in ${
                      (biddingBlockedMsg || getUserBiddingStatus().type === 'danger')
                        ? 'bg-rose-950/80 border border-rose-500/50 text-rose-300'
                        : getUserBiddingStatus().type === 'warning'
                        ? 'bg-amber-950/80 border border-amber-500/50 text-amber-300'
                        : 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-300'
                    }`}>
                      <AlertTriangle size={15} className="shrink-0 mt-0.5" />
                      <span className="leading-snug break-words flex-1">{biddingBlockedMsg || getUserBiddingStatus().reason}</span>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
                    <div className="text-[11px] text-gray-300 text-center sm:text-left">
                      <span>Purse: <strong className="text-emerald-400 font-mono">₹{campaign.remainingPurse.toFixed(2)} Cr</strong></span>
                      <span className="block text-[10px] text-gray-500 font-mono">OS: {overseasCount}/8 • Squad: {activeSquadCount}/25</span>
                    </div>

                    {/* Paddle Buttons (Active or tap-to-explain when restricted) */}
                    <div className="flex items-center gap-1.5 w-full sm:w-auto">
                      <button
                        onClick={handleSkipCurrentPlayer}
                        style={{
                          background: `${myTheme.bgDeep}cc`,
                          borderColor: `${myTheme.primary}50`,
                        }}
                        className="flex-1 sm:flex-none px-3 py-2 rounded-xl text-xs font-black uppercase hover:bg-white/10 active:scale-95 text-white border cursor-pointer transition-all shadow-sm flex items-center justify-center gap-1"
                        title="Skip this player and see who buys them"
                      >
                        <SkipForward size={13} style={{ color: myTheme.primary }} />
                        <span>Skip</span>
                      </button>

                      <button
                        onClick={() => handleUserBid(0.2)}
                        style={getUserBiddingStatus().canBid ? {
                          backgroundColor: myTheme.pillBg,
                          color: myTheme.pillText,
                          borderColor: myTheme.primary,
                          boxShadow: `0 0 10px ${myTheme.primary}50`,
                        } : {}}
                        className={`flex-1 sm:flex-none px-3 py-2 rounded-xl text-xs font-black uppercase cursor-pointer transition-all shadow-md border ${
                          !getUserBiddingStatus().canBid
                            ? 'bg-slate-800 text-gray-400 border-white/10 opacity-75'
                            : 'hover:scale-105 active:scale-95'
                        }`}
                        title={!getUserBiddingStatus().canBid ? (getUserBiddingStatus().reason || 'Bidding unavailable') : 'Bid +₹20L'}
                      >
                        +₹20L
                      </button>
                      <button
                        onClick={() => handleUserBid(0.5)}
                        style={getUserBiddingStatus().canBid ? {
                          backgroundColor: myTheme.pillBg,
                          color: myTheme.pillText,
                          borderColor: myTheme.primary,
                          boxShadow: `0 0 12px ${myTheme.primary}60`,
                        } : {}}
                        className={`flex-1 sm:flex-none px-3 py-2 rounded-xl text-xs font-black uppercase cursor-pointer transition-all shadow-md border ${
                          !getUserBiddingStatus().canBid
                            ? 'bg-slate-800 text-gray-400 border-white/10 opacity-75'
                            : 'hover:scale-105 active:scale-95'
                        }`}
                        title={!getUserBiddingStatus().canBid ? (getUserBiddingStatus().reason || 'Bidding unavailable') : 'Bid +₹50L'}
                      >
                        +₹50L
                      </button>
                      <button
                        onClick={() => handleUserBid(1.0)}
                        style={getUserBiddingStatus().canBid ? {
                          backgroundColor: myTheme.pillBg,
                          color: myTheme.pillText,
                          borderColor: myTheme.primary,
                          boxShadow: `0 0 16px ${myTheme.primary}80`,
                        } : {}}
                        className={`flex-1 sm:flex-none px-3.5 py-2 rounded-xl text-xs font-black uppercase cursor-pointer transition-all shadow-md border ${
                          !getUserBiddingStatus().canBid
                            ? 'bg-slate-800 text-gray-400 border-white/10 opacity-75'
                            : 'hover:scale-105 active:scale-95'
                        }`}
                        title={!getUserBiddingStatus().canBid ? (getUserBiddingStatus().reason || 'Bidding unavailable') : 'Bid +₹1.0 Cr'}
                      >
                        +₹1.0 Cr
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Column 2 (Right 5 cols): Multi-Tab Live War Room (Pool | Squads & Purses | Feed | Sold) */}
          <div 
            style={{
              background: myTheme.cardBg,
              borderColor: myTheme.cardBorder,
              boxShadow: myTheme.cardGlow,
            }}
            className={`lg:col-span-5 flex flex-col gap-2 rounded-2xl border p-3 shadow-xl h-[520px] max-h-[85vh] overflow-hidden select-none ${auctionView !== 'stage' ? 'flex' : 'hidden lg:flex'}`}
          >
            
            {/* Tab Navigation: 4 Tabs - HIDE ON MOBILE TO PREVENT REPEATED NAVBARS */}
            <div className="hidden lg:flex items-center gap-1 pb-2 border-b border-white/10">
              <button
                onClick={() => setSideTab('pool')}
                style={sideTab === 'pool' ? {
                  backgroundColor: myTheme.pillBg,
                  color: myTheme.pillText,
                  boxShadow: `0 0 10px ${myTheme.primary}70`,
                } : {}}
                className={`flex-1 py-1 px-1.5 rounded-lg text-[10px] font-black flex items-center justify-center gap-1 cursor-pointer transition-all ${
                  sideTab === 'pool'
                    ? 'shadow-sm'
                    : 'text-gray-400 hover:text-white bg-white/5'
                }`}
              >
                <ListOrdered size={12} />
                <span>Pool ({auctionPool.length})</span>
              </button>

              <button
                onClick={() => setSideTab('squads')}
                style={sideTab === 'squads' ? {
                  backgroundColor: myTheme.pillBg,
                  color: myTheme.pillText,
                  boxShadow: `0 0 10px ${myTheme.primary}70`,
                } : {}}
                className={`flex-1 py-1 px-1.5 rounded-lg text-[10px] font-black flex items-center justify-center gap-1 cursor-pointer transition-all ${
                  sideTab === 'squads'
                    ? 'shadow-sm'
                    : 'text-gray-400 hover:text-white bg-white/5'
                }`}
              >
                <Users size={12} />
                <span>Squads</span>
              </button>

              <button
                onClick={() => setSideTab('ledger')}
                style={sideTab === 'ledger' ? {
                  backgroundColor: myTheme.pillBg,
                  color: myTheme.pillText,
                  boxShadow: `0 0 10px ${myTheme.primary}70`,
                } : {}}
                className={`flex-1 py-1 px-1.5 rounded-lg text-[10px] font-black flex items-center justify-center gap-1 cursor-pointer transition-all ${
                  sideTab === 'ledger'
                    ? 'shadow-sm'
                    : 'text-gray-400 hover:text-white bg-white/5'
                }`}
              >
                <CheckCircle2 size={12} />
                <span>Sold ({soldLog.length})</span>
              </button>
            </div>

            {/* TAB 1: AUCTION PLAYER POOL (Interactive 64 Stars Schedule) */}
            {sideTab === 'pool' && (
              <div className="flex-1 min-h-0 flex flex-col gap-1 overflow-hidden">
                
                {/* Search & Role Filters Bar */}
                <div className="space-y-1.5 pb-2 mb-1.5 border-b border-white/5 shrink-0">
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
                        style={poolRoleFilter === r ? {
                          backgroundColor: myTheme.pillBg,
                          color: myTheme.pillText,
                          boxShadow: `0 0 10px ${myTheme.primary}70`,
                        } : {}}
                        className={`px-2 py-0.5 rounded-md cursor-pointer transition-all ${
                          poolRoleFilter === r
                            ? 'font-black shadow-sm'
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
                <div className="flex-1 min-h-0 overflow-y-auto space-y-1.5 pr-1">
                  {filteredAuctionPool.length === 0 ? (
                    <div className="h-40 flex flex-col items-center justify-center text-xs text-gray-500 text-center">
                      <Search size={20} className="mb-1 text-gray-600" />
                      <span>No players found matching &quot;{poolSearch}&quot;</span>
                    </div>
                  ) : (
                    filteredAuctionPool.map((p, pIdx) => {
                      const originalIndex = auctionPool.findIndex((ap) => ap.id === p.id)
                      const isLiveNow = originalIndex === currentIndex
                      const soldRecord = soldLog.find((s) => s.player.id === p.id)

                      return (
                        <div
                          key={`pool_item_${p.id}_${pIdx}`}
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
                                  {getCompactRoleBadge(p)}
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
              <div className="flex-1 min-h-0 flex flex-col gap-1 overflow-hidden">
                
                {/* Franchise Selector */}
                <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-white/5 gap-2 shrink-0">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Inspect:</span>
                  <select
                    value={selectedFranchiseView}
                    onChange={(e) => setSelectedFranchiseView(e.target.value)}
                    className="bg-slate-950 border border-white/20 rounded-lg px-2 py-1 text-[11px] font-bold text-white focus:outline-none focus:border-amber-400 cursor-pointer flex-1"
                  >
                    <option value={campaign.teamId}>👑 My Team: {getFranchise(campaign.teamId)?.short || campaign.teamName}</option>
                    {BOT_TEAMS.map((tk) => {
                      if (tk === campaign.teamId) return null
                      const f = getFranchise(tk)
                      return (
                        <option key={tk} value={tk}>
                          {f.emoji} {f.short}
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
                      ₹{displayPurse.toFixed(2)} Cr
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
                <div className="flex-1 min-h-0 overflow-y-auto space-y-1 pr-1">
                  {displaySquad.map((p, idx) => (
                    <div
                      key={`${p.player_id || p.name}_${idx}`}
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
                        <span className="text-emerald-400 font-bold text-[10px]">₹{p.price} Cr</span>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            )}

            {/* TAB 3: SALES LEDGER */}
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
                <div className="flex-1 min-h-0 overflow-y-auto space-y-1.5 pr-1">
                  {soldLog.length === 0 ? (
                    <div className="h-40 flex items-center justify-center text-xs text-gray-500 text-center">
                      No lots sold yet.
                    </div>
                  ) : (
                    soldLog.map((s, idx) => (
                      <div key={`${s.player.id}_${s.winner}_${idx}`} className="p-2 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-xs">
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
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto touch-pan-y">
          <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-slate-900 border border-amber-500/30 max-w-md w-full shadow-2xl relative animate-scale-up max-h-[94dvh] overflow-y-auto">
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
                <span className="text-gray-400">Tactical Role:</span>
                <strong className="text-amber-400">{previewPlayer.role}</strong>
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto touch-pan-y">
          <div className="p-3 sm:p-5 rounded-2xl sm:rounded-3xl bg-slate-900 border border-white/15 max-w-4xl w-full max-h-[96dvh] flex flex-col shadow-2xl relative animate-scale-up">
            
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
                {filteredAuctionPool.map((p, pIdx) => {
                  const originalIndex = auctionPool.findIndex((ap) => ap.id === p.id)
                  const isLiveNow = originalIndex === currentIndex
                  const soldRecord = soldLog.find((s) => s.player.id === p.id)

                  return (
                    <div
                      key={`modal_pool_${p.id}_${pIdx}`}
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

      {/* MODAL 4: AI Auto-Auction Results Summary */}
      {autoAuctionSummary && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto touch-pan-y overscroll-contain">
          <div className="p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-slate-900 border-2 border-amber-500/50 max-w-4xl w-full shadow-2xl relative animate-scale-up h-auto max-h-[96dvh] flex flex-col overflow-y-auto sm:overflow-hidden landscape:overflow-hidden touch-pan-y">
            
            {/* Responsive 2-Column War Room Layout in Landscape/Wide, Stacked with Smooth Scroll in Portrait */}
            <div className="flex flex-col sm:flex-row landscape:flex-row gap-3 sm:gap-4 flex-1 min-h-0">
              
              {/* Left Column: Official Declaration, BCCI Checkpoints & Action Buttons */}
              <div className="sm:w-5/12 landscape:w-5/12 w-full flex flex-col justify-between shrink-0">
                <div>
                  <div className="text-left pb-1.5 border-b border-white/10 shrink-0">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-mono font-black uppercase">
                      AUCTION OFFICIALLY CONCLUDED
                    </span>
                    <h2 className="text-base sm:text-xl font-black font-display text-white mt-1">
                      2027 Squad Successfully Drafted!
                    </h2>
                    <p className="text-[11px] text-gray-300 mt-0.5">
                      AI Director drafted <strong className="text-amber-400">{autoAuctionSummary.purchased.length} new stars</strong> to complete your official roster.
                    </p>
                  </div>

                  {/* Checklist of BCCI Requirements (2x2 Grid) */}
                  <div className="grid grid-cols-2 gap-1.5 my-2 text-center font-mono text-xs">
                    <div className="p-1.5 rounded-xl bg-slate-950 border border-white/10">
                      <span className="text-[8px] sm:text-[9px] text-gray-400 uppercase block">Roster Size</span>
                      <strong className="text-white text-xs sm:text-sm">{autoAuctionSummary.finalSquadCount} / 25</strong>
                      <span className="text-[8px] sm:text-[9px] text-emerald-400 block">✓ Min 18 Met</span>
                    </div>
                    <div className="p-1.5 rounded-xl bg-slate-950 border border-white/10">
                      <span className="text-[8px] sm:text-[9px] text-gray-400 uppercase block">Overseas</span>
                      <strong className="text-sky-300 text-xs sm:text-sm">{autoAuctionSummary.finalOverseasCount} / 8</strong>
                      <span className="text-[8px] sm:text-[9px] text-emerald-400 block">✓ Cap Safe</span>
                    </div>
                    <div className="p-1.5 rounded-xl bg-slate-950 border border-white/10">
                      <span className="text-[8px] sm:text-[9px] text-gray-400 uppercase block">Keepers</span>
                      <strong className="text-indigo-300 text-xs sm:text-sm">{autoAuctionSummary.roleBreakdown.wk} WK</strong>
                      <span className="text-[8px] sm:text-[9px] text-emerald-400 block">✓ Min 1 Met</span>
                    </div>
                    <div className="p-1.5 rounded-xl bg-slate-950 border border-white/10">
                      <span className="text-[8px] sm:text-[9px] text-gray-400 uppercase block">Purse Left</span>
                      <strong className="text-emerald-400 text-xs sm:text-sm">₹{autoAuctionSummary.finalPurse.toFixed(2)} Cr</strong>
                      <span className="text-[8px] sm:text-[9px] text-gray-500 block">Spend: ₹{autoAuctionSummary.totalSpent.toFixed(2)}Cr</span>
                    </div>
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row gap-2 shrink-0">
                  <button
                    onClick={() => {
                      setAutoAuctionSummary(null);
                      setSideTab('ledger');
                    }}
                    className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase cursor-pointer transition-all active:scale-95 text-center"
                  >
                    Review Ledger
                  </button>

                  <button
                    onClick={handleFinishAuction}
                    className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-[0_0_20px_rgba(16,185,129,0.4)] cursor-pointer transition-all active:scale-95"
                  >
                    <span>Proceed to Playing XI & Schedule</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>

              {/* Right Column: Scrollable Acquired Recruits with Touch-Pan-Y */}
              <div className="sm:w-7/12 landscape:w-7/12 w-full flex flex-col flex-1 min-h-[140px] max-h-[55vh] sm:max-h-none landscape:max-h-none bg-slate-950/60 p-2 sm:p-2.5 rounded-2xl border border-white/10 overflow-hidden">
                <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-white/10 shrink-0">
                  <span className="text-[10px] sm:text-xs font-mono font-bold text-amber-300 uppercase tracking-wider">
                    Acquired Recruits ({autoAuctionSummary.purchased.length} New Stars):
                  </span>
                </div>

                <div className="flex-1 min-h-[100px] overflow-y-auto overscroll-contain touch-pan-y space-y-1.5 pr-1 -webkit-overflow-scrolling-touch">
                  {autoAuctionSummary.purchased.length === 0 ? (
                    <div className="h-full flex items-center justify-center p-4 rounded-xl bg-white/5 text-center text-xs text-gray-400">
                      Your squad was already complete! No additional auction purchases needed.
                    </div>
                  ) : (
                    autoAuctionSummary.purchased.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-2 sm:p-2.5 rounded-xl bg-slate-900 border border-white/10 hover:border-amber-500/40 flex items-center justify-between text-xs transition-all shadow-sm"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                            #{idx + 1}
                          </span>
                          <div className="min-w-0 truncate">
                            <div className="font-bold text-white truncate flex items-center gap-1.5">
                              <span className="truncate">{item.player.name}</span>
                              {item.player.is_overseas && (
                                <span className="px-1 py-0.2 rounded bg-sky-500/20 text-sky-300 text-[8px] font-mono font-bold shrink-0">
                                  OS
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-gray-400 font-mono">
                              {item.player.role} • {item.player.formerTeam ? `Ex: ${item.player.formerTeam}` : 'Free Agent'}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2.5 font-mono shrink-0 pl-1">
                          <span className="text-emerald-400 font-black text-xs sm:text-sm">₹{item.price.toFixed(2)} Cr</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  )
}
