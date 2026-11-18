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

  // Rival players (using franchise.squad2026 as starting base)
  const rivalSquad: CampaignPlayer[] = rivalFranchise.squad2026.map((p, idx) => ({
    ...p,
    player_id: p.player_id || `${selectedRivalId}_${idx + 1}`,
    currentPrice: p.price,
    is_retained: true,
    is_released: false
  }))

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

    // 4. QUALITY DISPARITY & BARGAINING COUNTER-OFFER
    const qualityGap = powerIn - powerOut
    let requiredCash = Math.max(0, Math.round((qualityGap * 0.8 + (priceIn - priceOut) * 0.5) * 2) / 2)

    // Personality adjustments
    if (rivalAI.tradeStyle === 'moneyball') {
      // RR strictly demands positive financial surplus
      requiredCash = Math.max(requiredCash, Math.round((priceIn - priceOut + 1.5) * 2) / 2)
    } else if (rivalAI.tradeStyle === 'aggressive' && qualityGap > 2) {
      // MI / SRH demand heavy compensation for losing power
      requiredCash = Math.max(requiredCash, Math.round((qualityGap * 1.1) * 2) / 2)
    }

    if (qualityGap >= 8 && cashOffer < requiredCash) {
      return {
        acceptable: false,
        counterOfferCash: requiredCash,
        status: 'OFFER INSUFFICIENT',
        reason: `❌ REJECTED: Large quality disparity! ${playerIn.name} (PI: ${powerIn}) is significantly superior to ${playerOut.name} (PI: ${powerOut}). ${rivalFranchise.short} refuses this straight swap.`,
        counterOfferText: `🤝 ${rivalFranchise.short} Counter-Offer: Pay a cash transfer of +₹${requiredCash.toFixed(1)} Cr to bridge the talent gap.`
      }
    }

    // Net value difference calculation
    const netValueDiff = (powerOut - powerIn) + (cashOffer * 1.5)

    if (netValueDiff >= 0 || (requiredCash > 0 && cashOffer >= requiredCash)) {
      return { 
        acceptable: true, 
        status: 'DEAL APPROVED',
        reason: `🟢 ${rivalFranchise.short} Board Approves: Fair value exchange for ${playerIn.name}. ${rivalAI.tagline}` 
      }
    } else {
      const deficit = Math.max(0.5, Math.abs(Math.round(netValueDiff / 1.5 * 2) / 2))
      return { 
        acceptable: false, 
        counterOfferCash: deficit,
        status: 'BARGAINING',
        reason: `❌ REJECTED: ${rivalFranchise.short} demands greater value for ${playerIn.name}.`,
        counterOfferText: `🤝 ${rivalFranchise.short} Counter-Offer: Increase cash sweetener to +₹${deficit.toFixed(1)} Cr to seal the deal.` 
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
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between pt-13 sm:pt-14 w-full max-w-full overflow-x-hidden touch-pan-y">
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
                <span className="px-2 py-0.2 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[9px] font-mono font-black uppercase">
                  PART 1: TRADING WINDOW
                </span>
                <span className="text-[10px] text-gray-400">All 10 Franchises Open for Direct Exchange</span>
              </div>
              <h1 className="text-base sm:text-lg font-black font-display text-white">
                IPL 2027 Official Player Trading Desk
              </h1>
            </div>
          </div>

          {!isTradeLocked ? (
            <button
              onClick={() => setShowConfirmLock(true)}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer hover:scale-[1.02] active:scale-95 transition-all shrink-0"
            >
              <span>Lock Trades & Proceed to Retentions</span>
              <ArrowRight size={13} />
            </button>
          ) : (
            <button
              onClick={() => router.push('/squad')}
              className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
            >
              <span>Proceed to Retain & Release</span>
              <ArrowRight size={13} />
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

        {/* True 3-Column Side-by-Side Trade Interface (Your Team | Deal Room in Middle | Rival Team) */}
        <div className="flex flex-row gap-2 sm:gap-3 items-stretch w-full min-h-[440px] flex-1 overflow-hidden">
          
          {/* Column 1 (Left): Your Franchise Squad */}
          <div className={`flex-1 min-w-[250px] max-w-[41%] p-2.5 sm:p-3.5 rounded-2xl sm:rounded-3xl bg-slate-900/90 border border-white/10 flex flex-col justify-between shadow-xl transition-all ${
            playerOut ? 'ring-2 ring-rose-500/40 shadow-rose-500/10' : ''
          }`}>
            <div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-1.5 sm:pb-2 mb-2 border-b border-white/10 gap-1">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-base sm:text-xl">{myFranchise.emoji}</span>
                  <div>
                    <h3 className="text-[11px] sm:text-xs font-black uppercase text-white truncate max-w-[130px] sm:max-w-none">{myFranchise.name}</h3>
                    <span className="text-[9px] sm:text-[10px] text-gray-400">Squad ({filteredMySquad.length})</span>
                  </div>
                </div>
                {playerOut && (
                  <span className="text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold animate-pulse truncate max-w-[120px]">
                    OUT: {playerOut.name}
                  </span>
                )}
              </div>

              <input
                type="text"
                placeholder="Filter player..."
                value={searchMy}
                onChange={(e) => setSearchMy(e.target.value)}
                className="w-full mb-2 bg-slate-950 border border-white/10 rounded-xl px-2.5 py-1 text-xs text-white focus:outline-none focus:border-indigo-400"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-1 sm:space-y-1.5 max-h-[280px] sm:max-h-[380px] pr-0.5">
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
                      <div className="text-[11px] sm:text-xs font-black text-amber-300 font-mono">{p.Power_Index}</div>
                      <span className="text-[8px] sm:text-[9px] text-gray-500 block">{isSelected ? '✓' : 'Offer'}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Column 2 (Middle): Trade Negotiation & Deal Room (Placed in the Middle!) */}
          <div className="w-[220px] sm:w-[260px] shrink-0 p-2.5 sm:p-3 rounded-2xl sm:rounded-3xl bg-slate-950 border border-white/15 flex flex-col justify-between items-center text-center shadow-2xl relative overflow-hidden">
            
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
                {evaluation.counterOfferText && evaluation.counterOfferCash && (
                  <div className="mt-1 p-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-left animate-pulse">
                    <span className="text-[8px] font-black text-amber-300 block mb-0.5">
                      {evaluation.counterOfferText}
                    </span>
                    <button
                      disabled={isTradeLocked}
                      onClick={() => {
                        gameAudio.playUiTap('select')
                        triggerGameHaptic('medium')
                        setCashOffer(evaluation.counterOfferCash!)
                      }}
                      className="w-full py-1 rounded bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black text-[9px] uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer transition-all shadow-sm"
                    >
                      <Sparkles size={10} />
                      <span>Accept Counter (+₹{evaluation.counterOfferCash.toFixed(1)}Cr)</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Execute Button */}
            <button
              onClick={handleExecuteTrade}
              disabled={!evaluation.acceptable || isTradeLocked || isTradingAnimation}
              className="w-full py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black text-[11px] sm:text-xs uppercase tracking-wider disabled:opacity-30 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(245,158,11,0.3)] cursor-pointer transition-all active:scale-95"
            >
              {isTradingAnimation ? 'Executing...' : 'Confirm Trade'}
            </button>
          </div>

          {/* Column 3 (Right): Rival Team Squad */}
          <div className={`flex-1 min-w-[250px] max-w-[41%] p-2.5 sm:p-3.5 rounded-2xl sm:rounded-3xl bg-slate-900/90 border border-white/10 flex flex-col justify-between shadow-xl transition-all ${
            playerIn ? 'ring-2 ring-emerald-500/40 shadow-emerald-500/10' : ''
          }`}>
            <div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-1.5 sm:pb-2 mb-2 border-b border-white/10 gap-1">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-base sm:text-xl">{rivalFranchise.emoji}</span>
                  <div>
                    <select
                      value={selectedRivalId}
                      onChange={(e) => {
                        setSelectedRivalId(e.target.value)
                        setPlayerIn(null)
                      }}
                      className="bg-slate-950 border border-white/15 text-[10px] sm:text-xs font-black uppercase text-white rounded-lg px-1.5 py-0.5 focus:outline-none cursor-pointer max-w-[130px] sm:max-w-none"
                    >
                      {Object.keys(IPL_FRANCHISES)
                        .filter(tid => tid !== campaign.teamId)
                        .map(tid => (
                          <option key={tid} value={tid}>
                            {IPL_FRANCHISES[tid].name}
                          </option>
                        ))}
                    </select>
                    <span className="text-[9px] sm:text-[10px] text-gray-400 block mt-0.5">Rival Squad ({filteredRivalSquad.length})</span>
                  </div>
                </div>
                {playerIn && (
                  <span className="text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold animate-pulse truncate max-w-[120px]">
                    IN: {playerIn.name}
                  </span>
                )}
              </div>

              <input
                type="text"
                placeholder="Filter rival..."
                value={searchRival}
                onChange={(e) => setSearchRival(e.target.value)}
                className="w-full mb-2 bg-slate-950 border border-white/10 rounded-xl px-2.5 py-1 text-xs text-white focus:outline-none focus:border-indigo-400"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-1 sm:space-y-1.5 max-h-[280px] sm:max-h-[380px] pr-0.5">
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
                      <div className="text-[11px] sm:text-xs font-black text-amber-300 font-mono">{p.Power_Index}</div>
                      <span className="text-[8px] sm:text-[9px] text-gray-500 block">{isSelected ? '✓' : 'Request'}</span>
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
