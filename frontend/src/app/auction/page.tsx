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
  Flame, 
  Shield, 
  Volume2, 
  VolumeX,
  Play,
  RotateCcw
} from 'lucide-react'
import { useCampaignStore, CampaignPlayer } from '../../store/useCampaignStore'
import { CampaignPhaseStepper } from '../../components/CampaignPhaseStepper'
import { getFranchise, IPL_FRANCHISES, RELEASED_AUCTION_POOL } from '../../data/franchises'

interface AuctionPlayer {
  id: string
  name: string
  role: 'BAT' | 'BOWL' | 'AR' | 'WK'
  nationality: 'Indian' | 'Overseas'
  is_overseas: boolean
  basePrice: number
  powerIndex: number
  formerTeam?: string
  statsSummary?: string
}

// Initial 2027 Mini-Auction Pool
const INITIAL_AUCTION_POOL: AuctionPlayer[] = [
  ...RELEASED_AUCTION_POOL.map((p, i) => ({
    id: `auc_rel_${i + 1}`,
    name: p.name,
    role: p.role,
    nationality: (p.is_overseas ? 'Overseas' : 'Indian') as 'Indian' | 'Overseas',
    is_overseas: p.is_overseas,
    basePrice: p.basePrice || 2.0,
    powerIndex: p.powerIndex || 85,
    formerTeam: p.formerTeam,
    statsSummary: p.reason
  })),
  { id: 'auc_1', name: 'Phil Salt', role: 'WK', nationality: 'Overseas', is_overseas: true, basePrice: 2.0, powerIndex: 92, formerTeam: 'KKR', statsSummary: 'Powerplay T20 Blaster • 185+ SR' },
  { id: 'auc_2', name: 'Liam Livingstone', role: 'AR', nationality: 'Overseas', is_overseas: true, basePrice: 2.0, powerIndex: 89, formerTeam: 'PBKS', statsSummary: 'Six-Machine & Dual Spin Variations' },
  { id: 'auc_3', name: 'Devdutt Padikkal', role: 'BAT', nationality: 'Indian', is_overseas: false, basePrice: 1.5, powerIndex: 82, formerTeam: 'LSG', statsSummary: 'Top-Order Anchor • Indian Classic Lefty' },
  { id: 'auc_4', name: 'Gerald Coetzee', role: 'BOWL', nationality: 'Overseas', is_overseas: true, basePrice: 1.5, powerIndex: 85, formerTeam: 'MI', statsSummary: '150 km/h Hit-the-Deck Express Pacer' },
  { id: 'auc_5', name: 'Wanindu Hasaranga', role: 'AR', nationality: 'Overseas', is_overseas: true, basePrice: 2.0, powerIndex: 87, formerTeam: 'SRH', statsSummary: 'World #1 Sri Lankan Leg-Spinner & Finisher' },
  { id: 'auc_6', name: 'Vaibhav Sooryavanshi', role: 'BAT', nationality: 'Indian', is_overseas: false, basePrice: 0.3, powerIndex: 86, formerTeam: 'RR', statsSummary: '13-Year-Old Sensation • Striking at 230+' },
  { id: 'auc_7', name: 'Anshul Kamboj', role: 'BOWL', nationality: 'Indian', is_overseas: false, basePrice: 0.3, powerIndex: 80, formerTeam: 'MI', statsSummary: 'Ranji 10-Wicket Legend • Seam & Swing' },
  { id: 'auc_8', name: 'Vijaykumar Vyshak', role: 'BOWL', nationality: 'Indian', is_overseas: false, basePrice: 0.5, powerIndex: 78, formerTeam: 'RCB', statsSummary: 'Knuckle-ball & Death Overs Bouncer Specialist' }
]

const BOT_TEAMS = ['csk', 'mi', 'kkr', 'srh', 'rr', 'dc', 'pbks', 'lsg', 'gt']

export default function MiniAuctionPage() {
  const router = useRouter()
  const { getActiveCampaign, addAuctionPlayerToSquad, advancePhase } = useCampaignStore()
  const campaign = getActiveCampaign()

  // Full auction pool (includes players released by the user!)
  const [auctionPool, setAuctionPool] = useState<AuctionPlayer[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [currentBid, setCurrentBid] = useState(0)
  const [highestBidder, setHighestBidder] = useState<string>('BCCI Auctioneer')
  const [bidHistory, setBidHistory] = useState<Array<{ bidder: string; amount: number; isUser?: boolean }>>([])
  const [timer, setTimer] = useState(10)
  const [gavelPhase, setGavelPhase] = useState<'bidding' | 'going_once' | 'going_twice' | 'sold'>('bidding')
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [soldLog, setSoldLog] = useState<Array<{ player: AuctionPlayer; winner: string; price: number }>>([])

  // Initialize pool
  useEffect(() => {
    if (!campaign) return
    const userReleased: AuctionPlayer[] = (campaign.releasedStars || []).map((p, idx) => ({
      id: `user_rel_${idx}`,
      name: p.name,
      role: p.role,
      nationality: p.nationality,
      is_overseas: p.is_overseas,
      basePrice: Math.min(2.0, p.price || 2.0),
      powerIndex: Number(p.Power_Index) || 80,
      formerTeam: campaign.teamName,
      statsSummary: 'Released by Manager into 2027 Auction Pool'
    }))

    const combined = [...userReleased, ...INITIAL_AUCTION_POOL]
    setAuctionPool(combined)
    if (combined.length > 0) {
      setCurrentBid(combined[0].basePrice)
    }
  }, [campaign])

  const currentPlayer = auctionPool[currentIndex]
  const isUserHighest = highestBidder === campaign?.teamId

  // Live Timer & Gavel Countdown
  useEffect(() => {
    if (!currentPlayer || gavelPhase === 'sold') return

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          // Progress gavel phase
          if (gavelPhase === 'bidding') {
            setGavelPhase('going_once')
            return 3
          } else if (gavelPhase === 'going_once') {
            setGavelPhase('going_twice')
            return 3
          } else if (gavelPhase === 'going_twice') {
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

  // AI Bots Automatic Counter-Bidding
  useEffect(() => {
    if (!currentPlayer || gavelPhase === 'sold' || gavelPhase === 'going_twice') return

    // Random trigger for AI bot bid
    const botTimeout = setTimeout(() => {
      // 40% chance bot bids if current bid is below player valuation
      const valuation = (currentPlayer.powerIndex / 10) * 1.5
      if (currentBid < valuation && Math.random() > 0.45) {
        // Pick eligible rival bot
        const availableBots = BOT_TEAMS.filter((t) => t !== campaign?.teamId && t !== highestBidder)
        if (availableBots.length > 0) {
          const chosenBot = availableBots[Math.floor(Math.random() * availableBots.length)]
          const increment = currentBid < 5 ? 0.25 : currentBid < 10 ? 0.5 : 1.0
          const newBid = Math.round((currentBid + increment) * 100) / 100

          setCurrentBid(newBid)
          setHighestBidder(chosenBot)
          setTimer(8)
          setGavelPhase('bidding')
          setBidHistory((prev) => [
            { bidder: chosenBot, amount: newBid },
            ...prev.slice(0, 7)
          ])
        }
      }
    }, Math.floor(Math.random() * 2500) + 1200)

    return () => clearTimeout(botTimeout)
  }, [currentBid, highestBidder, gavelPhase, currentPlayer])

  // Handle SOLD resolution
  const handleSold = () => {
    if (!currentPlayer) return

    const winnerName = highestBidder === campaign?.teamId ? campaign.teamName : getFranchise(highestBidder)?.name || 'Unsold'
    
    // If User Won
    if (highestBidder === campaign?.teamId) {
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
        statsSummary: `Acquired in 2027 Mini-Auction for ₹${currentBid} Cr`
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

    // Validate budget
    if (newBid > campaign.remainingPurse) {
      alert(`Cannot bid ₹${newBid} Cr: Exceeds your available purse of ₹${campaign.remainingPurse.toFixed(2)} Cr!`)
      return
    }

    // Validate overseas quota
    if (currentPlayer.is_overseas) {
      const overseasCount = campaign.squad.filter((p) => !p.is_released && p.is_overseas).length
      if (overseasCount >= 8) {
        alert('Cannot bid: Your 8-player overseas quota is full!')
        return
      }
    }

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
    advancePhase('playing_xi')
    router.push('/playing-xi')
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-white text-center">
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

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between pt-14">
      <CampaignPhaseStepper />

      <main className="max-w-7xl mx-auto w-full px-3 sm:px-6 py-4 flex-1 flex flex-col justify-between">
        
        {/* Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 mb-3 border-b border-white/10 gap-2 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-black uppercase">
                PART 3 OF 4: MINI-AUCTION ARENA
              </span>
              <span className="text-[11px] text-gray-400">Competing against 9 AI Franchise Bots</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black font-display text-white mt-0.5">
              Live Gavel Bidding War Room
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 transition-colors"
              title="Toggle Audio"
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
            <button
              onClick={handleFinishAuction}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(168,85,247,0.3)] cursor-pointer hover:scale-[1.02] transition-all shrink-0"
            >
              <span>Finalize Squad ➔ Proceed to Part 4: Playing XI</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* 3-Column Auction Stage */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
          
          {/* Column 1 (Left): Live Hammer Stage & Current Player */}
          <div className="lg:col-span-8 p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-white/10 flex flex-col justify-between shadow-2xl relative overflow-hidden">
            
            {/* Top Gavel Bar */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                  <Gavel size={18} />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-gray-400 block">SET LOT #{currentIndex + 1} OF {auctionPool.length}</span>
                  <span className="text-xs font-black uppercase text-amber-300">Live Auctioneer Gavel</span>
                </div>
              </div>

              {/* Live Countdown Timer */}
              <div className="flex items-center gap-2">
                <div className={`px-3 py-1 rounded-xl font-mono text-sm font-black flex items-center gap-1.5 ${
                  timer <= 3 ? 'bg-rose-500/30 text-rose-300 border border-rose-500/50 animate-pulse' : 'bg-slate-800 text-white border border-white/10'
                }`}>
                  <Clock size={14} />
                  <span>00:0{timer}s</span>
                </div>
                <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider ${
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
              <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-6">
                
                {/* Player Card */}
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/15 flex items-center justify-center text-3xl shadow-xl shrink-0">
                    🏏
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-bold font-mono">
                        {currentPlayer.role}
                      </span>
                      {currentPlayer.is_overseas && (
                        <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 text-[10px] font-bold font-mono">
                          OVERSEAS
                        </span>
                      )}
                      {currentPlayer.formerTeam && (
                        <span className="text-[10px] text-gray-400">Ex: {currentPlayer.formerTeam}</span>
                      )}
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-black text-white font-display mt-1 tracking-tight">
                      {currentPlayer.name}
                    </h2>
                    
                    <p className="text-xs text-gray-400 mt-1 max-w-md">
                      {currentPlayer.statsSummary || 'Key impact player registered for the 2027 IPL Mini-Auction.'}
                    </p>

                    <div className="flex items-center gap-4 mt-2 text-xs font-mono">
                      <span>Base Price: <strong className="text-gray-200">₹{currentPlayer.basePrice} Cr</strong></span>
                      <span>•</span>
                      <span>Power Rating: <strong className="text-amber-400 font-bold">{currentPlayer.powerIndex} OVR</strong></span>
                    </div>
                  </div>
                </div>

                {/* Current Bid Display */}
                <div className="text-center sm:text-right p-4 rounded-2xl bg-slate-950/80 border border-white/10 w-full sm:w-auto shadow-inner">
                  <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">
                    Highest Bidder
                  </span>
                  <div className={`text-sm font-black mt-0.5 flex items-center justify-center sm:justify-end gap-1.5 ${
                    isUserHighest ? 'text-emerald-400' : 'text-amber-300'
                  }`}>
                    <span>{isUserHighest ? '👑 YOU HOLD BID' : highestBidder.toUpperCase()}</span>
                  </div>

                  <div className="text-3xl sm:text-4xl font-black font-mono text-emerald-400 mt-1">
                    ₹{currentBid.toFixed(2)} <span className="text-base text-gray-500">Cr</span>
                  </div>
                </div>

              </div>
            ) : null}

            {/* Bottom: User Interactive Paddle Controls */}
            <div className="pt-4 border-t border-white/10">
              {gavelPhase === 'sold' ? (
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-400" />
                    <span>HAMMER DOWN: Sold to <strong className="text-amber-300">{highestBidder.toUpperCase()}</strong> for <strong className="text-emerald-400">₹{currentBid.toFixed(2)} Cr</strong>!</span>
                  </div>

                  <button
                    onClick={handleNextPlayer}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-lg"
                  >
                    <span>Next Player</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-xs text-gray-300 text-center sm:text-left">
                    <span>Your Remaining Purse: <strong className="text-emerald-400 font-mono">₹{campaign.remainingPurse.toFixed(2)} Cr</strong></span>
                    <span className="block text-[10px] text-gray-500">Overseas: {overseasCount}/8 • Squad: {activeSquadCount}/25</span>
                  </div>

                  {/* Paddle Buttons */}
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => handleUserBid(0.2)}
                      disabled={isUserHighest || currentBid + 0.2 > campaign.remainingPurse}
                      className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed text-white font-black text-xs uppercase cursor-pointer transition-all shadow-md"
                    >
                      Bid +₹20L
                    </button>
                    <button
                      onClick={() => handleUserBid(0.5)}
                      disabled={isUserHighest || currentBid + 0.5 > campaign.remainingPurse}
                      className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed text-white font-black text-xs uppercase cursor-pointer transition-all shadow-md"
                    >
                      Bid +₹50L
                    </button>
                    <button
                      onClick={() => handleUserBid(1.0)}
                      disabled={isUserHighest || currentBid + 1.0 > campaign.remainingPurse}
                      className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-30 disabled:cursor-not-allowed text-slate-950 font-black text-xs uppercase cursor-pointer transition-all shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                    >
                      Bid +₹1.0 Cr
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Column 2 (Right): Live Bidding Log & Recent Sales */}
          <div className="lg:col-span-4 flex flex-col gap-3.5">
            
            {/* Live Paddle Log */}
            <div className="p-4 rounded-3xl bg-slate-900 border border-white/10 flex-1 flex flex-col justify-between shadow-xl">
              <div>
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
                  <h4 className="text-xs font-black uppercase text-white flex items-center gap-1.5">
                    <Flame size={14} className="text-amber-400" />
                    Live Bidding Action Feed
                  </h4>
                  <span className="text-[10px] text-emerald-400 font-mono font-bold">REAL-TIME</span>
                </div>
              </div>

              <div className="space-y-1.5 flex-1 overflow-y-auto max-h-52 pr-1">
                {bidHistory.length === 0 ? (
                  <div className="h-32 flex items-center justify-center text-xs text-gray-500 text-center">
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
            </div>

            {/* Auction Sales Ledger */}
            <div className="p-4 rounded-3xl bg-slate-900 border border-white/10 flex-1 flex flex-col justify-between shadow-xl">
              <div>
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
                  <h4 className="text-xs font-black uppercase text-white flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-indigo-400" />
                    Completed Lot Sales ({soldLog.length})
                  </h4>
                </div>
              </div>

              <div className="space-y-1.5 flex-1 overflow-y-auto max-h-48 pr-1">
                {soldLog.length === 0 ? (
                  <div className="h-28 flex items-center justify-center text-xs text-gray-500 text-center">
                    No players sold yet.
                  </div>
                ) : (
                  soldLog.map((s, idx) => (
                    <div key={idx} className="p-2 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-white">{s.player.name}</span>
                        <span className="text-[10px] text-gray-400 block">{s.winner}</span>
                      </div>
                      <span className="font-mono text-amber-300 font-black">₹{s.price.toFixed(2)} Cr</span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>

      </main>
    </div>
  )
}
