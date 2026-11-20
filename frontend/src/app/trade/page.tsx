'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeftRight, 
  Check, 
  X, 
  Shield, 
  ArrowRight, 
  RefreshCw, 
  AlertCircle, 
  ArrowLeft,
  Lock,
  Sparkles,
  Zap,
  CheckCircle2
} from 'lucide-react'
import { useCampaignStore, CampaignPlayer } from '../../store/useCampaignStore'
import { getFranchise, IPL_FRANCHISES } from '../../data/franchises'
import { getFranchiseAI, isUntouchablePlayer } from '../../data/franchiseAI'
import { gameAudio, triggerGameHaptic } from '../../lib/gameAudioAndHaptics'
import TeamLogo from '../../components/TeamLogo'

export default function TradeWindowPage() {
  const router = useRouter()
  const campaigns = useCampaignStore((state) => state.campaigns)
  const getActiveCampaign = useCampaignStore((state) => state.getActiveCampaign)
  const executeTrade = useCampaignStore((state) => state.executeTrade)
  const advancePhase = useCampaignStore((state) => state.advancePhase)
  const [mounted, setMounted] = useState(false)
  const campaign = mounted ? getActiveCampaign() : null

  const [selectedRivalId, setSelectedRivalId] = useState<string>('csk')
  const [playerOut, setPlayerOut] = useState<CampaignPlayer | null>(null)
  const [playerIn, setPlayerIn] = useState<CampaignPlayer | null>(null)
  const [cashOffer, setCashOffer] = useState<number>(0) // in Crores
  const [tradeMessage, setTradeMessage] = useState<string | null>(null)
  const [searchMy, setSearchMy] = useState('')
  const [searchRival, setSearchRival] = useState('')
  const [isTradingAnimation, setIsTradingAnimation] = useState(false)
  const [showConfirmLock, setShowConfirmLock] = useState(false)
  const [mobileTab, setMobileTab] = useState<'my' | 'deal' | 'rival'>('my')
  const [expandedTradePlayerId, setExpandedTradePlayerId] = useState<string | null>(null)

  const tradeTouchStartX = React.useRef<number | null>(null)
  const tradeTouchStartY = React.useRef<number | null>(null)

  const handleTradeTouchStart = (e: React.TouchEvent) => {
    tradeTouchStartX.current = e.touches[0].clientX
    tradeTouchStartY.current = e.touches[0].clientY
  }

  const handleTradeTouchEnd = (e: React.TouchEvent) => {
    if (tradeTouchStartX.current === null || tradeTouchStartY.current === null) return
    const deltaX = e.changedTouches[0].clientX - tradeTouchStartX.current
    const deltaY = e.changedTouches[0].clientY - tradeTouchStartY.current
    tradeTouchStartX.current = null
    tradeTouchStartY.current = null

    const tabs: Array<'my' | 'deal' | 'rival'> = ['my', 'deal', 'rival']
    const curIdx = tabs.indexOf(mobileTab)

    if (Math.abs(deltaX) > 30 && Math.abs(deltaX) > Math.abs(deltaY) * 0.75) {
      if (deltaX < 0 && curIdx < tabs.length - 1) {
        setMobileTab(tabs[curIdx + 1])
        gameAudio.playUiTap('select')
        triggerGameHaptic('light')
      } else if (deltaX > 0 && curIdx > 0) {
        setMobileTab(tabs[curIdx - 1])
        gameAudio.playUiTap('select')
        triggerGameHaptic('light')
      }
    }
  }

  // Synchronize with GlobalSwipeManager custom event
  useEffect(() => {
    const handleAppSwipe = (e: any) => {
      const direction = e.detail?.direction
      const tabs: Array<'my' | 'deal' | 'rival'> = ['my', 'deal', 'rival']
      const curIdx = tabs.indexOf(mobileTab)
      if (direction === 'left' && curIdx < tabs.length - 1) {
        e.preventDefault()
        setMobileTab(tabs[curIdx + 1])
        gameAudio.playUiTap('select')
        triggerGameHaptic('light')
      } else if (direction === 'right' && curIdx > 0) {
        e.preventDefault()
        setMobileTab(tabs[curIdx - 1])
        gameAudio.playUiTap('select')
        triggerGameHaptic('light')
      }
    }
    window.addEventListener('app:swipe', handleAppSwipe)
    return () => window.removeEventListener('app:swipe', handleAppSwipe)
  }, [mobileTab])

  useEffect(() => {
    setMounted(true)
  }, [])

  // Strict cycle lockdown: redirect if Trade Window is concluded
  useEffect(() => {
    if (mounted && campaign && campaign.lockedPhases?.includes('trade')) {
      const target = campaign.currentPhase === 'playing_xi' || campaign.currentPhase === 'match'
        ? '/playing-xi'
        : campaign.currentPhase === 'mini_auction'
        ? '/auction'
        : '/squad'
      router.replace(target)
    }
  }, [mounted, campaign, router])

  if (!mounted) {
    return <div className="min-h-screen bg-slate-950" />
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-white text-center">
        <div className="p-8 rounded-3xl bg-slate-900 border border-white/10 max-w-md">
          <AlertCircle size={36} className="mx-auto text-amber-400 mb-3" />
          <h3 className="text-lg font-black font-display mb-2">No Active Campaign Found</h3>
          <p className="text-xs text-gray-400 mb-4">Please choose your franchise to start the 2027 IPL cycle.</p>
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

  const isTradeLocked = campaign.lockedPhases?.includes('trade')
  const myFranchise = getFranchise(campaign.teamId)
  const rivalFranchise = getFranchise(selectedRivalId)

  // Resolve Rival Squad from campaign.rivalTeamsData if available, fallback to squad2026
  const getRivalSquad = (): CampaignPlayer[] => {
    let squad: CampaignPlayer[] = []
    if (campaign.rivalTeamsData?.[selectedRivalId]?.squad && campaign.rivalTeamsData[selectedRivalId].squad.length > 0) {
      squad = [...campaign.rivalTeamsData[selectedRivalId].squad]
    } else {
      squad = (rivalFranchise.squad2026 || []).map((p, idx) => ({
        ...p,
        player_id: p.player_id || `${selectedRivalId}_${idx + 1}`,
        currentPrice: p.price,
        is_retained: true,
        is_released: false
      }))
    }

    // SANITIZATION: A player can NEVER be in two squads at the same time!
    // 1. Filter out any player who currently exists in the user's active squad (e.g. Naman Dhir)
    const userPlayerNames = new Set(
      campaign.squad.filter(p => !p.is_released).map(p => p.name.trim().toLowerCase())
    )
    squad = squad.filter(p => !userPlayerNames.has(p.name.trim().toLowerCase()))

    // 2. Also ensure any player traded out to THIS rival is present in this rival's squad!
    if (campaign.tradedHistory) {
      campaign.tradedHistory.forEach(th => {
        if (th.rivalTeam?.toLowerCase() === selectedRivalId.toLowerCase()) {
          const alreadyInRival = squad.some(p => p.name.trim().toLowerCase() === th.playerOut.trim().toLowerCase())
          if (!alreadyInRival) {
            const originalPlayer = (myFranchise.squad2026 || []).find(
              p => p.name.trim().toLowerCase() === th.playerOut.trim().toLowerCase()
            )
            squad.push({
              player_id: originalPlayer?.player_id || `traded_${selectedRivalId}_${th.playerOut.replace(/\s+/g, '_')}`,
              name: th.playerOut,
              role: originalPlayer?.role || 'AR',
              nationality: originalPlayer?.nationality || 'Indian',
              is_overseas: originalPlayer?.is_overseas || false,
              price: originalPlayer?.price || 5.0,
              currentPrice: originalPlayer?.price || 5.0,
              Power_Index: originalPlayer?.Power_Index || 82,
              is_retained: true,
              is_released: false,
              statsSummary: `Acquired via Trade from ${myFranchise.name}`
            })
          }
        }
      })
    }

    return squad
  }

  const rivalSquad = getRivalSquad()

  // Filter squads
  const filteredMySquad = campaign.squad.filter(p => 
    !p.is_released && p.name.toLowerCase().includes(searchMy.toLowerCase())
  )

  const filteredRivalSquad = rivalSquad.filter(p =>
    p.name.toLowerCase().includes(searchRival.toLowerCase())
  )

  // AI Trade Evaluation logic with Franchise Personalities & Realistic Bargaining (100% offline)
  const evaluateTrade = () => {
    if (!playerOut || !playerIn) {
      return { 
        acceptable: false, 
        status: 'NO SELECTION', 
        reason: 'Select one player from each team to evaluate trade offer.' 
      }
    }

    const rivalAI = getFranchiseAI(selectedRivalId)
    const powerOut = Number(playerOut.Power_Index) || 80
    const powerIn = Number(playerIn.Power_Index) || 80
    const priceOut = Number(playerOut.currentPrice || playerOut.price) || 5
    const priceIn = Number(playerIn.currentPrice || playerIn.price) || 5

    // 1. UNTOUCHABLE FRANCHISE CORNERSTONE PROTECTION
    const isUntouchable = isUntouchablePlayer(playerIn.name, rivalAI.untouchables)
    if (isUntouchable) {
      return { 
        acceptable: false, 
        isUntouchable: true,
        status: 'UNTOUCHABLE ICON',
        reason: `❌ REJECTED IMMEDIATELY: ${playerIn.name} is the franchise marquee icon of ${rivalFranchise.name}! The board, fans, and sponsors consider him non-negotiable. He cannot be traded under any circumstances.` 
      }
    }

    // 2. OVERSEAS SQUAD QUOTA CHECK (Max 8 in squad)
    if (playerIn.is_overseas && !playerOut.is_overseas) {
      const currentOverseas = campaign.squad.filter(p => !p.is_released && p.is_overseas).length
      if (currentOverseas >= 8) {
        return { 
          acceptable: false, 
          status: 'OVERSEAS LIMIT',
          reason: '❌ REJECTED: Your 8-man overseas squad quota is already full. You must trade an overseas player out to acquire one.' 
        }
      }
    }

    // 3. SPECIALIST ROLE SCARCITY (Wicketkeeper Protection)
    if (playerIn.role === 'WK') {
      const rivalWKs = rivalSquad.filter(p => p.role === 'WK')
      if (rivalWKs.length <= 1 && playerOut.role !== 'WK') {
        return {
          acceptable: false,
          status: 'ROLE SCARCITY',
          reason: `❌ REJECTED: ${playerIn.name} is ${rivalFranchise.short}'s only specialist wicketkeeper! You must offer a quality wicketkeeper in exchange to protect our squad balance.`
        }
      }
    }

    // 4. VALUATION, PURSE LIMITS & BARGAINING COUNTER-OFFER
    const qualityGap = powerIn - powerOut
    const priceGap = priceIn - priceOut

    // Check user's available purse limit
    if (cashOffer > campaign.remainingPurse) {
      return {
        acceptable: false,
        status: 'PURSE EXCEEDED',
        reason: `❌ REJECTED: Cash offer of +₹${cashOffer.toFixed(1)} Cr exceeds your available purse (₹${campaign.remainingPurse.toFixed(1)} Cr).`
      }
    }

    // Check if user is asking for cash from rival team (negative cashOffer)
    const rivalPurse = campaign.rivalTeamsData?.[selectedRivalId]?.remainingPurse ?? (rivalFranchise.miniAuctionPurse2026 || 15.0)
    if (cashOffer < 0) {
      const demandedCash = Math.abs(cashOffer)
      if (demandedCash > rivalPurse) {
        return {
          acceptable: false,
          status: 'RIVAL PURSE EXCEEDED',
          reason: `❌ REJECTED: ${rivalFranchise.short} has only ₹${rivalPurse.toFixed(1)} Cr purse and cannot pay you +₹${demandedCash.toFixed(1)} Cr.`
        }
      }
      if (powerOut < powerIn + demandedCash * 1.5) {
        return {
          acceptable: false,
          counterOfferCash: 0,
          status: 'UNREASONABLE CASH DEMAND',
          reason: `❌ REJECTED: ${rivalFranchise.short} will not pay cash unless receiving a significantly higher-rated marquee superstar.`,
          counterOfferText: `🤝 ${rivalFranchise.short} Counter-Offer: Remove cash demand (₹0.0 Cr) for a straight swap.`
        }
      }
    }

    // Determine target minimum cash sweetener needed from user
    let minCashSweetener = 0
    if (qualityGap > 0 || priceGap > 0) {
      // Base talent gap: ~0.35 Cr per Power Index point + price adjustment
      let rawCash = Math.max(0, (qualityGap * 0.35) + (priceGap > 0 ? priceGap * 0.15 : 0))
      
      if (rivalAI.tradeStyle === 'moneyball') {
        rawCash = Math.max(rawCash, (priceGap + 1.0) * 0.35)
      } else if (rivalAI.tradeStyle === 'aggressive' && qualityGap > 2) {
        rawCash = Math.max(rawCash, qualityGap * 0.5)
      }
      
      // Round to clean 0.5 Cr step
      minCashSweetener = Math.max(0.5, Math.ceil(rawCash * 2) / 2)
    }

    // Is current cash offer sufficient?
    if (cashOffer >= minCashSweetener) {
      return { 
        acceptable: true, 
        status: 'DEAL APPROVED',
        reason: `🟢 ${rivalFranchise.short} Board Approves: Fair value exchange for ${playerIn.name}. ${rivalAI.tagline}` 
      }
    } else {
      const canAffordCounter = campaign.remainingPurse >= minCashSweetener
      return { 
        acceptable: false, 
        counterOfferCash: canAffordCounter ? minCashSweetener : undefined,
        status: 'BARGAINING',
        reason: canAffordCounter
          ? `❌ REJECTED: ${rivalFranchise.short} demands greater value for ${playerIn.name}.`
          : `❌ REJECTED: ${rivalFranchise.short} demands +₹${minCashSweetener.toFixed(1)} Cr cash sweetener, which exceeds your remaining purse of ₹${campaign.remainingPurse.toFixed(1)} Cr. Offer a higher-rated player instead.`,
        counterOfferText: canAffordCounter
          ? `🤝 ${rivalFranchise.short} Counter-Offer: Increase cash sweetener to +₹${minCashSweetener.toFixed(1)} Cr to seal the deal.` 
          : undefined
      }
    }
  }

  const evaluation = evaluateTrade()

  const handleExecuteTrade = () => {
    if (!playerOut || !playerIn || !evaluation.acceptable || isTradeLocked) return

    setIsTradingAnimation(true)

    setTimeout(() => {
      const success = executeTrade(playerOut.player_id, playerIn, selectedRivalId, -cashOffer)
      setIsTradingAnimation(false)
      if (success) {
        gameAudio.playTradeDealSuccess()
        triggerGameHaptic('trade_success')
        setTradeMessage(`✅ Deal Sealed! ${playerIn.name} joined ${myFranchise.short}. ${playerOut.name} moved to ${rivalFranchise.short}.`)
        setPlayerOut(null)
        setPlayerIn(null)
        setCashOffer(0)
        setTimeout(() => setTradeMessage(null), 5000)
      } else {
        gameAudio.playTradeReject()
        triggerGameHaptic('trade_reject')
        setTradeMessage(`❌ Trade Failed: Check purse limits or roster constraints.`)
      }
    }, 800)
  }

  const handleFinishTradeWindow = () => {
    gameAudio.playPhaseLock()
    triggerGameHaptic('lock')
    advancePhase('retain_release')
    router.push('/squad')
  }

  return (
    <div 
      onTouchStart={handleTradeTouchStart}
      onTouchEnd={handleTradeTouchEnd}
      onTouchCancel={() => {
        tradeTouchStartX.current = null
        tradeTouchStartY.current = null
      }}
      className="min-h-[100dvh] bg-transparent text-white flex flex-col safe-page-top pb-16 w-full max-w-full overflow-x-hidden touch-manipulation select-none"
    >
      <main className="max-w-7xl mx-auto w-full px-2 sm:px-4 py-2 sm:py-3 flex-1 flex flex-col gap-3">
        
        {/* Minimal Broadcast Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-2 border-b border-white/10 gap-2 shrink-0">
          <div className="flex items-center gap-2.5">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[10px] font-mono font-black uppercase">
                  TRADE WINDOW
                </span>
                <span className="text-[11px] text-gray-400 font-mono hidden sm:inline">10 Franchises Open</span>
              </div>
              <h1 className="text-base sm:text-lg font-black font-display text-white">
                Player Trading Desk
              </h1>
            </div>
          </div>

          {!isTradeLocked ? (
            <button
              onClick={() => setShowConfirmLock(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer hover:scale-[1.02] active:scale-95 transition-all shrink-0"
            >
              <span>Lock Trades ➔</span>
            </button>
          ) : (
            <button
              onClick={() => router.push('/squad')}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
            >
              <span>Next: Squad & Retain ➔</span>
            </button>
          )}
        </div>

        {/* Lockdown Notice if Window Closed */}
        {isTradeLocked && (
          <div className="p-3 mb-3 rounded-2xl bg-slate-900 border border-amber-500/30 flex items-center justify-between text-xs shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
                <Lock size={16} />
              </div>
              <div>
                <strong className="text-amber-300 block">TRADE WINDOW OFFICIALLY CLOSED</strong>
                <span className="text-gray-400 text-[11px]">
                  BCCI trade deadline has concluded for this season. You cannot make trades after advancing the cycle.
                </span>
              </div>
            </div>
            <button
              onClick={() => router.push('/squad')}
              className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs cursor-pointer"
            >
              Go to Squad
            </button>
          </div>
        )}

        {tradeMessage && (
          <div className="p-3 mb-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs font-bold text-center animate-fade-in shrink-0">
            {tradeMessage}
          </div>
        )}

        {/* Rival Franchise Toggle Selector Strip - Prominently Displayed for Mobile & Phone screens */}
        <div className="mb-2 p-1.5 sm:p-2 rounded-2xl bg-slate-900/90 border border-white/10 flex items-center justify-between gap-2 overflow-x-auto scrollbar-none shrink-0 shadow-lg">
          <div className="flex items-center gap-1.5 shrink-0 pl-1">
            <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
              <ArrowLeftRight size={11} className="text-amber-400" />
              <span className="hidden sm:inline">Trade Partner:</span>
              <span className="sm:hidden">Rival:</span>
            </span>
          </div>

          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5">
            {Object.keys(IPL_FRANCHISES)
              .filter((tid) => tid !== campaign.teamId)
              .map((tid) => {
                const f = IPL_FRANCHISES[tid]
                const isSelected = tid === selectedRivalId
                return (
                  <button
                    key={tid}
                    onClick={() => {
                      gameAudio.playUiTap('select')
                      triggerGameHaptic('light')
                      setSelectedRivalId(tid)
                      setPlayerIn(null)
                    }}
                    className={`px-2 py-1 rounded-xl text-xs font-black flex items-center gap-1 transition-all cursor-pointer shrink-0 border ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/40 scale-105 font-black'
                        : 'bg-slate-950/80 hover:bg-white/10 text-gray-300 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <TeamLogo teamId={tid} size={15} />
                    <span className="text-[10px] font-mono font-bold uppercase">{f.short}</span>
                  </button>
                )
              })}
          </div>
        </div>

        {/* Mobile Swipe Hint */}
        <div className="flex sm:hidden items-center justify-between px-2 py-0.5 mb-1 bg-slate-950/80 rounded-lg border border-white/10 text-[9px] font-mono text-gray-400">
          <span>👈 Swipe</span>
          <span className="text-amber-400 font-bold uppercase">{mobileTab === 'my' ? `${myFranchise.short} Squad` : mobileTab === 'deal' ? 'Deal Room' : `${rivalFranchise.short} Squad`}</span>
          <span>Swipe 👉</span>
        </div>

        {/* Mobile Tab Toggle Bar (Visible only on compact screens) */}
        <div className="flex sm:hidden items-center justify-center gap-1 mb-2 bg-slate-900/90 p-1 rounded-xl border border-white/10 shrink-0">
          <button
            onClick={() => setMobileTab('my')}
            className={`flex-1 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-all ${
              mobileTab === 'my' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-gray-400 hover:text-white'
            }`}
          >
            <span>{myFranchise.short} ({filteredMySquad.length})</span>
            {playerOut && <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />}
          </button>
          <button
            onClick={() => setMobileTab('deal')}
            className={`flex-1 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-all ${
              mobileTab === 'deal' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-gray-400 hover:text-white'
            }`}
          >
            <span>🤝 Deal Room</span>
            {playerOut && playerIn && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
          </button>
          <button
            onClick={() => setMobileTab('rival')}
            className={`flex-1 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-all ${
              mobileTab === 'rival' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-gray-400 hover:text-white'
            }`}
          >
            <span>{rivalFranchise.short} ({filteredRivalSquad.length})</span>
            {playerIn && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
          </button>
        </div>

        {/* True 3-Column Side-by-Side Trade Interface (Your Team | Deal Room in Middle | Rival Team) */}
        <div 
          onTouchStart={handleTradeTouchStart}
          onTouchEnd={handleTradeTouchEnd}
          className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 items-stretch w-full flex-1 select-none"
        >
          
          {/* Column 1 (Left): Your Franchise Squad */}
          <div className={`flex-1 min-w-0 p-3 rounded-3xl bg-slate-900/90 border border-white/10 flex flex-col shadow-xl transition-all ${
            mobileTab !== 'my' ? 'hidden sm:flex' : 'flex'
          } ${
            playerOut ? 'ring-2 ring-rose-500/40 shadow-rose-500/10' : ''
          }`}>
            <div className="shrink-0">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 gap-1">
                <div className="flex items-center gap-2 min-w-0">
                  <TeamLogo teamId={myFranchise.id} size={22} className="shrink-0" />
                  <div className="min-w-0">
                    <h3 className="text-xs font-black uppercase text-white truncate">{myFranchise.name}</h3>
                    <span className="text-[10px] text-gray-400">Squad ({filteredMySquad.length})</span>
                  </div>
                </div>
                {playerOut && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold truncate max-w-[120px]">
                    OUT: {playerOut.name}
                  </span>
                )}
              </div>

              <input
                type="text"
                placeholder="Search player..."
                value={searchMy}
                onChange={(e) => setSearchMy(e.target.value)}
                className="w-full mb-2 bg-slate-950 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-400"
              />
            </div>

            <div className="flex-1 max-h-[420px] overflow-y-auto space-y-1.5 pr-0.5 overscroll-contain touch-pan-y">
              {filteredMySquad.map((p) => {
                const isSelected = playerOut?.player_id === p.player_id
                return (
                  <div
                    key={p.player_id}
                    onClick={() => {
                      if (isTradeLocked) return
                      gameAudio.playCardSwap()
                      triggerGameHaptic('light')
                      setPlayerOut(isSelected ? null : p)
                    }}
                    className={`p-1.5 sm:p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-rose-500/20 border-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.3)] scale-[1.01]'
                        : 'bg-white/5 border-white/5 hover:bg-white/10 text-gray-300'
                    } ${isTradeLocked ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    <div className="truncate mr-1 min-w-0">
                      <div className="font-bold text-[11px] sm:text-xs text-white flex items-center gap-1 truncate">
                        <span className="truncate">{p.name}</span>
                        {p.is_overseas && <span className="text-[8px] sm:text-[9px] px-1 rounded bg-sky-500/20 text-sky-300 shrink-0">OS</span>}
                      </div>
                      <div className="text-[9px] sm:text-[10px] text-gray-400 font-mono">
                        {p.role} • ₹{p.price}Cr
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider block transition-all ${
                        isSelected 
                          ? 'bg-rose-500 text-white font-black shadow-sm' 
                          : 'bg-white/10 text-gray-300'
                      }`}>
                        {isSelected ? '✓ Offering' : 'Trade Out'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Column 2 (Middle): Trade Negotiation & Deal Room */}
          <div className={`w-full sm:w-[210px] md:w-[250px] shrink-0 p-2.5 sm:p-3 rounded-2xl sm:rounded-3xl bg-slate-950 border border-white/15 flex flex-col justify-between items-center text-center shadow-2xl relative overflow-hidden ${
            mobileTab !== 'deal' ? 'hidden sm:flex' : 'flex'
          }`}>
            
            {/* Animated Swapping Light Beam */}
            {isTradingAnimation && (
              <div className="absolute inset-0 bg-gradient-to-r from-rose-500/30 via-amber-500/40 to-emerald-500/30 animate-pulse pointer-events-none flex items-center justify-center">
                <Sparkles className="animate-spin text-amber-300" size={32} />
              </div>
            )}

            <div className="w-full flex flex-col items-center gap-1">
              <div className="flex items-center gap-1.5">
                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center font-bold transition-all ${
                  isTradingAnimation 
                    ? 'bg-amber-500 text-slate-950 scale-125 rotate-180 duration-500' 
                    : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                }`}>
                  <ArrowLeftRight size={15} />
                </div>
                <div>
                  <h4 className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-white">Deal Room</h4>
                  <p className="text-[8px] sm:text-[9px] text-gray-400">Player Swap + Cash</p>
                </div>
              </div>

              {/* Offer Summary Pills */}
              <div className="w-full space-y-1 my-1">
                <div className={`p-1.5 rounded-lg border text-[10px] font-bold truncate ${
                  playerOut ? 'bg-rose-500/15 border-rose-500/30 text-rose-300' : 'bg-white/5 border-white/10 text-gray-400'
                }`}>
                  <span className="text-[8px] text-gray-500 block uppercase">Offering:</span>
                  <span className="truncate">{playerOut ? `${playerOut.name} (₹${playerOut.price}Cr)` : 'Select from left'}</span>
                </div>

                <div className={`p-1.5 rounded-lg border text-[10px] font-bold truncate ${
                  playerIn ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300' : 'bg-white/5 border-white/10 text-gray-400'
                }`}>
                  <span className="text-[8px] text-gray-500 block uppercase">Requesting:</span>
                  <span className="truncate">{playerIn ? `${playerIn.name} (₹${playerIn.price}Cr)` : 'Select from right'}</span>
                </div>
              </div>

              {/* Cash offer adjustment */}
              <div className="w-full py-1.5 border-y border-white/10 my-0.5">
                <span className="text-[9px] font-bold uppercase text-gray-400 block mb-0.5">
                  Cash Transfer
                </span>
                <div className="flex items-center justify-center gap-1.5">
                  <button
                    disabled={isTradeLocked}
                    onClick={() => setCashOffer(Math.max(-5, cashOffer - 0.5))}
                    className="w-6 h-6 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white font-black text-xs cursor-pointer"
                  >
                    -
                  </button>
                  <span className="text-xs sm:text-sm font-black font-mono text-emerald-400 min-w-[65px]">
                    {cashOffer >= 0 ? `+₹${cashOffer.toFixed(1)}Cr` : `-₹${Math.abs(cashOffer).toFixed(1)}Cr`}
                  </span>
                  <button
                    disabled={isTradeLocked}
                    onClick={() => setCashOffer(Math.min(campaign.remainingPurse, cashOffer + 0.5))}
                    className="w-6 h-6 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white font-black text-xs cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Evaluation Status */}
            <div className="w-full my-1">
              <div className={`p-2 rounded-xl border text-[10px] font-bold transition-all ${
                evaluation.acceptable
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-lg shadow-emerald-500/10'
                  : evaluation.isUntouchable
                  ? 'bg-rose-950/40 border-rose-600/50 text-rose-300 animate-shake-reject'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300 animate-shake-reject'
              }`}>
                <div className="flex items-center justify-between mb-0.5">
                  <span className="truncate">{evaluation.acceptable ? '🟢 APPROVED' : evaluation.status || '🔴 REJECTED'}</span>
                  {evaluation.isUntouchable && (
                    <span className="px-1 py-0.2 rounded bg-rose-500/30 text-rose-200 text-[8px] font-mono shrink-0">
                      ICON
                    </span>
                  )}
                </div>
                <div className="text-[9px] font-normal text-gray-300 leading-snug line-clamp-3">
                  {evaluation.reason}
                </div>

                {/* AI Bargaining Counter-Offer */}
                {evaluation.counterOfferText && evaluation.counterOfferCash !== undefined && (
                  <div className="mt-1.5 p-2 rounded-xl bg-amber-500/15 border border-amber-500/40 text-left space-y-1.5 shadow-md">
                    <span className="text-[9px] font-black text-amber-300 block leading-tight">
                      {evaluation.counterOfferText}
                    </span>
                    <button
                      type="button"
                      disabled={isTradeLocked || (campaign.remainingPurse < evaluation.counterOfferCash)}
                      onClick={(e) => {
                        e.stopPropagation()
                        if (evaluation.counterOfferCash !== undefined) {
                          gameAudio.playTradeDealSuccess()
                          triggerGameHaptic('medium')
                          setCashOffer(evaluation.counterOfferCash)
                        }
                      }}
                      className="w-full py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 active:scale-95 text-slate-950 font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-md"
                    >
                      <Sparkles size={12} className="animate-spin text-slate-950" />
                      <span>Accept Counter (+₹{evaluation.counterOfferCash.toFixed(1)}Cr)</span>
                    </button>
                  </div>
                )}

                {/* Approved deal terms callout */}
                {evaluation.acceptable && (
                  <div className="mt-1.5 p-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] flex items-center gap-2 font-bold animate-pulse">
                    <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                    <span className="truncate">Terms Agreed! Tap Confirm below to execute.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Execute Button with Dual Team Colors */}
            <button
              type="button"
              onClick={handleExecuteTrade}
              disabled={!evaluation.acceptable || isTradeLocked || isTradingAnimation}
              style={evaluation.acceptable ? {
                background: `linear-gradient(135deg, ${myFranchise.color} 0%, #082014 45%, #082014 55%, ${rivalFranchise.color} 100%)`,
                boxShadow: `0 0 20px ${myFranchise.color}60, 0 0 20px ${rivalFranchise.color}60`
              } : undefined}
              className={`w-full py-2.5 sm:py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all active:scale-95 cursor-pointer border ${
                evaluation.acceptable
                  ? 'border-white/30 text-white hover:brightness-110 shadow-2xl animate-pulse'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 disabled:opacity-30 disabled:cursor-not-allowed border-transparent shadow-[0_0_20px_rgba(245,158,11,0.2)]'
              }`}
            >
              {isTradingAnimation ? (
                'Executing Trade...'
              ) : evaluation.acceptable ? (
                <div className="flex items-center justify-center gap-2">
                  <TeamLogo teamId={myFranchise.id} size={18} />
                  <span>Confirm Trade ({myFranchise.short} ⇄ {rivalFranchise.short})</span>
                  <TeamLogo teamId={rivalFranchise.id} size={18} />
                </div>
              ) : (
                'Confirm Trade'
              )}
            </button>
          </div>

          {/* Column 3 (Right): Rival Team Squad */}
          <div className={`flex-1 min-w-0 p-3 rounded-3xl bg-slate-900/90 border border-white/10 flex flex-col justify-between shadow-xl transition-all ${
            mobileTab !== 'rival' ? 'hidden sm:flex' : 'flex'
          } ${
            playerIn ? 'ring-2 ring-emerald-500/40 shadow-emerald-500/10' : ''
          }`}>
            <div>
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 gap-1">
                <div className="flex items-center gap-2 min-w-0">
                  <TeamLogo teamId={selectedRivalId} size={22} className="shrink-0" />
                  <div className="min-w-0">
                    <h3 className="text-xs font-black uppercase text-white truncate">{rivalFranchise.name}</h3>
                    <span className="text-[10px] text-gray-400">Rival Squad ({filteredRivalSquad.length})</span>
                  </div>
                </div>
                {playerIn && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold truncate max-w-[120px]">
                    IN: {playerIn.name}
                  </span>
                )}
              </div>

              <input
                type="text"
                placeholder="Search rival player..."
                value={searchRival}
                onChange={(e) => setSearchRival(e.target.value)}
                className="w-full mb-2 bg-slate-950 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-400"
              />
            </div>

            <div className="flex-1 max-h-[420px] overflow-y-auto space-y-1.5 pr-0.5 overscroll-contain touch-pan-y">
              {filteredRivalSquad.map((p) => {
                const isSelected = playerIn?.player_id === p.player_id
                return (
                  <div
                    key={p.player_id}
                    onClick={() => {
                      if (isTradeLocked) return
                      gameAudio.playCardSwap()
                      triggerGameHaptic('light')
                      setPlayerIn(isSelected ? null : p)
                    }}
                    className={`p-1.5 sm:p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-emerald-500/20 border-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] scale-[1.01]'
                        : 'bg-white/5 border-white/5 hover:bg-white/10 text-gray-300'
                    } ${isTradeLocked ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    <div className="truncate mr-1">
                      <div className="font-bold text-[11px] sm:text-xs text-white flex items-center gap-1 truncate">
                        <span className="truncate">{p.name}</span>
                        {p.is_overseas && <span className="text-[8px] sm:text-[9px] px-1 rounded bg-sky-500/20 text-sky-300 shrink-0">OS</span>}
                      </div>
                      <div className="text-[9px] sm:text-[10px] text-gray-400 font-mono">
                        {p.role} • ₹{p.price}Cr
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider block transition-all ${
                        isSelected 
                          ? 'bg-emerald-500 text-slate-950 font-black shadow-sm' 
                          : 'bg-white/10 text-gray-300'
                      }`}>
                        {isSelected ? '✓ Selected' : 'Request'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

        </div>

      </main>

      {/* Confirmation Modal to Lock Trade Window */}
      {showConfirmLock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-slate-950 border border-amber-500/40 rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto mb-3">
              <Lock size={22} />
            </div>
            <h3 className="text-base font-black text-white mb-1.5">
              Lock Trade Window & Proceed?
            </h3>
            <p className="text-xs text-gray-300 mb-5 leading-relaxed">
              According to official BCCI regulations, once the Trade Window is submitted, it locks permanently for this IPL 2027 cycle. There is no going back to trade players.
            </p>
            <div className="flex gap-2.5">
              <button
                onClick={() => setShowConfirmLock(false)}
                className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-gray-300 cursor-pointer"
              >
                Keep Trading
              </button>
              <button
                onClick={() => {
                  setShowConfirmLock(false)
                  handleFinishTradeWindow()
                }}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-xs font-black text-slate-950 cursor-pointer shadow-lg shadow-emerald-500/30"
              >
                Confirm & Lock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
