'use client'

import React, { useState, useEffect, useRef } from 'react'
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
  Lock
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
  
  // Right Column View Tabs: 'feed' | 'squads' | 'ledger'
  const [sideTab, setSideTab] = useState<'feed' | 'squads' | 'ledger'>('squads')
  const [selectedFranchiseView, setSelectedFranchiseView] = useState<string>('')

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
    if (!currentPlayer || gavelPhase === 'sold') return

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
  }, [timer, gavelPhase, currentPlayer])

  // AI Bots Automatic Counter-Bidding with Utility AI Franchise Personalities
  useEffect(() => {
    if (!currentPlayer || gavelPhase === 'sold' || gavelPhase === 'going_twice') return

    const botTimeout = setTimeout(() => {
      const baseValuation = (currentPlayer.powerIndex / 10) * 1.5
      const availableBots = BOT_TEAMS.filter((t) => t !== campaign?.teamId && t !== highestBidder)
      
      if (availableBots.length > 0) {
        // Evaluate bot interest based on Franchise AI Profile
        const interestedBots = availableBots.filter((botId) => {
          const ai = getFranchiseAI(botId)
          // CSK: conservative, anchors & spin
          if (ai.id === 'csk') {
            const isSpinOrAnchor = currentPlayer.role === 'BAT' || currentPlayer.role === 'AR'
            const maxBid = baseValuation * 1.15
            return currentBid < maxBid && isSpinOrAnchor && Math.random() > 0.4
          }
          // SRH & MI: hyper-aggressive bidding wars for pacers and power hitters
          if (ai.id === 'srh' || ai.id === 'mi') {
            const isPacerOrHitter = currentPlayer.role === 'BOWL' || currentPlayer.powerIndex > 80
            const maxBid = baseValuation * 1.85
            return currentBid < maxBid && (isPacerOrHitter ? Math.random() > 0.25 : Math.random() > 0.5)
          }
          // RR: moneyball valuation, strictly drops out when prices exceed predicted value
          if (ai.id === 'rr') {
            const maxBid = baseValuation * 1.05
            return currentBid < maxBid && Math.random() > 0.35
          }
          // Other teams
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
  }, [currentBid, highestBidder, gavelPhase, currentPlayer])

  // Handle SOLD resolution
  const handleSold = () => {
    if (!currentPlayer) return

    const isUserWin = highestBidder === campaign?.teamId
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
            onClick={() => router.push('/select-team')}
            className="px-6 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs uppercase cursor-pointer"
          >
            Select Franchise
          </button>
        </div>
      </div>
    )
  }

  const myFranchise = getFranchise(campaign.teamId)
  const overseasCount = campaign.squad.filter((p) => !p.is_released && p.is_overseas).length
  const activeSquadCount = campaign.squad.filter((p) => !p.is_released).length

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
        
        {/* Banner */}
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

        {campaign.lockedPhases?.includes('mini_auction') && (
          <div className="p-3 mb-2 rounded-2xl bg-slate-900 border border-amber-500/30 flex items-center justify-between text-xs shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
                <Lock size={16} />
              </div>
              <div>
                <strong className="text-amber-300 block">MINI-AUCTION OFFICIALLY CONCLUDED</strong>
                <span className="text-gray-400 text-[11px]">
                  Auction hammer is down and all franchise squads are finalized for the season.
                </span>
              </div>
            </div>
            <button
              onClick={() => router.push('/playing-xi')}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs uppercase cursor-pointer"
            >
              Go to Playing XI & Schedule
            </button>
          </div>
        )}

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 transition-colors"
              title="Toggle Audio"
            >
              {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
            </button>
            <button
              onClick={handleFinishAuction}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(168,85,247,0.3)] cursor-pointer hover:scale-[1.02] transition-all shrink-0"
            >
              <span>Finalize Squad ➔ Playing XI</span>
              <ArrowRight size={13} />
            </button>
          </div>
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

          {/* Column 2 (Right 5 cols): Multi-Tab Live War Room (Feed | Squads & Purses | Sales) */}
          <div className="lg:col-span-5 flex flex-col gap-2 rounded-2xl bg-slate-900 border border-white/10 p-3 shadow-xl max-h-[460px] overflow-hidden">
            
            {/* Tab Navigation */}
            <div className="flex items-center gap-1 pb-2 border-b border-white/10">
              <button
                onClick={() => setSideTab('squads')}
                className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-black flex items-center justify-center gap-1 cursor-pointer transition-all ${
                  sideTab === 'squads'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-gray-400 hover:text-white bg-white/5'
                }`}
              >
                <Users size={12} />
                <span>Squads & Purses</span>
              </button>

              <button
                onClick={() => setSideTab('feed')}
                className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-black flex items-center justify-center gap-1 cursor-pointer transition-all ${
                  sideTab === 'feed'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-gray-400 hover:text-white bg-white/5'
                }`}
              >
                <Flame size={12} />
                <span>Paddle Feed</span>
              </button>

              <button
                onClick={() => setSideTab('ledger')}
                className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-black flex items-center justify-center gap-1 cursor-pointer transition-all ${
                  sideTab === 'ledger'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-gray-400 hover:text-white bg-white/5'
                }`}
              >
                <CheckCircle2 size={12} />
                <span>Sold ({soldLog.length})</span>
              </button>
            </div>

            {/* TAB 1: SQUADS & PURSES (Alongside the bidding arena!) */}
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

            {/* TAB 2: LIVE ACTION FEED */}
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

            {/* TAB 3: SALES LEDGER */}
            {sideTab === 'ledger' && (
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
            )}

          </div>

        </div>

      </main>
    </div>
  )
}
