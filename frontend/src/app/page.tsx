'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Trophy, 
  MapPin, 
  Users, 
  Shield, 
  Compass, 
  Zap, 
  Sparkles, 
  Gavel, 
  ArrowRight,
  TrendingUp,
  Activity,
  Flame,
  CheckCircle2
} from 'lucide-react'
import { useStore } from '../store/useStore'
import { useCampaignStore } from '../store/useCampaignStore'
import { STADIUMS, getStadiumForTeam } from '../data/stadiums'
import { getFranchise, IPL_FRANCHISES } from '../data/franchises'
import { getFranchiseAI } from '../data/franchiseAI'
import { OnboardingAuthModal } from '../components/OnboardingAuthModal'
import { GameLoadingScreen } from '../components/GameLoadingScreen'
import { GamerOnboardingModal } from '../components/GamerOnboardingModal'
import { gameAudio, triggerGameHaptic } from '../lib/gameAudioAndHaptics'

const TEAMS = [
  { id: 'csk',  name: 'Chennai Super Kings',         short: 'CSK',  color: '#fbbf24', emoji: '🦁', titles: '5x Champions', stadium: 'Chepauk (M. A. Chidambaram)', city: 'Chennai' },
  { id: 'mi',   name: 'Mumbai Indians',              short: 'MI',   color: '#2563eb', emoji: '🏏', titles: '5x Champions', stadium: 'Wankhede Stadium', city: 'Mumbai' },
  { id: 'rcb',  name: 'Royal Challengers Bengaluru', short: 'RCB',  color: '#dc2626', emoji: '👑', titles: 'Bold Army', stadium: 'M. Chinnaswamy Stadium', city: 'Bengaluru' },
  { id: 'kkr',  name: 'Kolkata Knight Riders',       short: 'KKR',  color: '#7c3aed', emoji: '⚔️', titles: '3x Champions', stadium: 'Eden Gardens', city: 'Kolkata' },
  { id: 'srh',  name: 'Sunrisers Hyderabad',         short: 'SRH',  color: '#ea580c', emoji: '🌅', titles: '2x Champions', stadium: 'Rajiv Gandhi Stadium', city: 'Hyderabad' },
  { id: 'rr',   name: 'Rajasthan Royals',            short: 'RR',   color: '#db2777', emoji: '💎', titles: 'Inaugural Champions', stadium: 'Sawai Mansingh Stadium', city: 'Jaipur' },
  { id: 'dc',   name: 'Delhi Capitals',              short: 'DC',   color: '#0284c7', emoji: '🦅', titles: 'Roar Macha', stadium: 'Arun Jaitley Stadium', city: 'Delhi' },
  { id: 'pbks', name: 'Punjab Kings',                short: 'PBKS', color: '#b91c1c', emoji: '🗡️', titles: 'Sadda Punjab', stadium: 'Maharaja Yadavindra Stadium', city: 'Mullanpur' },
  { id: 'lsg',  name: 'Lucknow Super Giants',        short: 'LSG',  color: '#0891b2', emoji: '🐘', titles: 'Adab Se', stadium: 'BRSABV Ekana Stadium', city: 'Lucknow' },
  { id: 'gt',   name: 'Gujarat Titans',              short: 'GT',   color: '#0d9488', emoji: '🛡️', titles: '2022 Champions', stadium: 'Narendra Modi Arena', city: 'Ahmedabad' },
]

export default function UnifiedTeamSelectHomePage() {
  const router = useRouter()
  const { theme, setTheme } = useStore()
  const { 
    campaigns, 
    getActiveCampaign, 
    createCampaign, 
    switchCampaign, 
    currentUser 
  } = useCampaignStore()

  const [mounted, setMounted] = useState(false)
  const [selectedTeamId, setSelectedTeamId] = useState<string>('rcb')
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showLoading, setShowLoading] = useState(true)
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    setMounted(true)
    const hasLoaded = sessionStorage.getItem('auctionxi_boot_complete')
    if (hasLoaded) {
      setShowLoading(false)
    }

    // Default to active campaign or current theme
    const activeCamp = getActiveCampaign()
    if (activeCamp) {
      setSelectedTeamId(activeCamp.teamId)
    } else if (theme) {
      setSelectedTeamId(theme)
    }
  }, [])

  const handleSelectTeamTab = (teamId: string) => {
    setSelectedTeamId(teamId)
    setTheme(teamId)
    gameAudio.playUiTap('select')
    triggerGameHaptic('light')
  }

  const handleEnterWarRoom = (teamId: string) => {
    gameAudio.playTradeDealSuccess()
    triggerGameHaptic('heavy')
    setTheme(teamId)

    // Check if an existing campaign exists for this team
    const existing = Object.values(campaigns).find(c => c.teamId === teamId)
    if (existing) {
      switchCampaign(existing.id)
      const targetUrl = existing.currentPhase === 'playing_xi' || existing.currentPhase === 'match'
        ? '/playing-xi'
        : existing.currentPhase === 'mini_auction'
        ? '/auction'
        : existing.currentPhase === 'retain_release'
        ? '/squad'
        : '/trade'
      router.push(targetUrl)
    } else {
      createCampaign(teamId)
      router.push('/trade')
    }
  }

  const activeTeam = TEAMS.find(t => t.id === selectedTeamId) || TEAMS[2]
  const activeStadium = STADIUMS[activeTeam.id] || STADIUMS.rcb
  const activeFranchiseAI = getFranchiseAI(activeTeam.id)
  const activeFranchise = getFranchise(activeTeam.id)
  const existingCampaign = Object.values(campaigns).find(c => c.teamId === activeTeam.id)

  return (
    <div className="min-h-screen relative overflow-x-hidden flex flex-col justify-between text-white bg-slate-950 pt-12 sm:pt-14 pb-4">
      
      {/* Optional Cinematic Loading Screen */}
      {showLoading && (
        <GameLoadingScreen
          onComplete={() => {
            setShowLoading(false)
            sessionStorage.setItem('auctionxi_boot_complete', 'true')
          }}
        />
      )}

      {/* Main Container */}
      <main className="max-w-7xl mx-auto w-full px-2 sm:px-4 py-2 sm:py-3 flex-1 flex flex-col justify-between overflow-x-hidden">
        
        {/* Header Broadcast Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-2 mb-2 border-b border-white/10 gap-2 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-mono font-black uppercase">
                IPL 2027 FRANCHISE SELECTION & FORTRESS CALIBRATION
              </span>
              <span className="text-[10px] text-gray-400">10 Official War Rooms • ₹125 Cr Cap</span>
            </div>
            <h1 className="text-base sm:text-lg font-black font-display text-white">
              Select Your Franchise & Master Your Home Fortress
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                gameAudio.playUiTap('medium')
                triggerGameHaptic('light')
                setShowOnboarding(true)
              }}
              className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-amber-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-white/10 transition-all shrink-0"
            >
              <Sparkles size={12} className="text-amber-400" />
              <span>How to Play</span>
            </button>
            <button
              onClick={() => setShowAuthModal(true)}
              className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-gray-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-white/10 transition-all shrink-0"
            >
              <span>{currentUser.avatar || '👑'}</span>
              <span className="truncate max-w-[80px]">{currentUser.gamerTag}</span>
            </button>
          </div>
        </div>

        {/* 10-Team Fast Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1 mb-2.5 shrink-0">
          {TEAMS.map((t) => {
            const isSelected = t.id === activeTeam.id
            const hasSave = Object.values(campaigns).some(c => c.teamId === t.id)
            return (
              <button
                key={t.id}
                onClick={() => handleSelectTeamTab(t.id)}
                className={`px-2.5 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0 border ${
                  isSelected
                    ? 'scale-[1.04] shadow-lg text-slate-950 font-black'
                    : 'bg-slate-900/80 text-gray-300 hover:text-white border-white/10 hover:bg-white/10'
                }`}
                style={{
                  backgroundColor: isSelected ? t.color : undefined,
                  borderColor: isSelected ? t.color : undefined,
                  boxShadow: isSelected ? `0 0 16px ${t.color}60` : undefined
                }}
              >
                <span>{t.emoji}</span>
                <span>{t.short}</span>
                {hasSave && (
                  <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-slate-950 animate-ping' : 'bg-emerald-400'}`} />
                )}
              </button>
            )
          })}
        </div>

        {/* Active Team Showcase: Dual-Pane Stats & Fortress Console */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 sm:gap-3.5 flex-1 min-h-[380px]">
          
          {/* Left Pane: Franchise Identity, Roster Cap & AI Persona */}
          <div className="md:col-span-6 p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-slate-900/90 border border-white/10 flex flex-col justify-between shadow-xl relative overflow-hidden">
            <div 
              className="absolute -top-20 -right-20 w-56 h-56 rounded-full blur-3xl opacity-20 pointer-events-none"
              style={{ backgroundColor: activeTeam.color }}
            />

            <div>
              <div className="flex items-start justify-between pb-2 mb-2.5 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div 
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-lg border shrink-0"
                    style={{
                      backgroundColor: `${activeTeam.color}25`,
                      borderColor: `${activeTeam.color}50`
                    }}
                  >
                    {activeTeam.emoji}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h2 className="text-base sm:text-lg font-black font-display text-white">{activeTeam.name}</h2>
                      <span 
                        className="px-1.5 py-0.2 rounded text-[10px] font-black text-slate-950"
                        style={{ backgroundColor: activeTeam.color }}
                      >
                        {activeTeam.short}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-gray-400 font-mono mt-0.5">
                      <span className="text-amber-400 font-bold flex items-center gap-1">
                        <Trophy size={11} /> {activeTeam.titles}
                      </span>
                      <span>•</span>
                      <span>Starting Cap: ₹125.0 Cr</span>
                    </div>
                  </div>
                </div>

                {existingCampaign && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-mono font-black uppercase">
                    Active Save ({existingCampaign.currentPhase.replace('_', ' ')})
                  </span>
                )}
              </div>

              {/* Franchise AI & Strategy Profile */}
              <div className="space-y-2 mb-3">
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-white/5 text-xs">
                  <div className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Zap size={11} className="text-sky-400" />
                    <span>Franchise War Room Identity</span>
                  </div>
                  <p className="text-[11px] text-gray-200 leading-snug">
                    {activeFranchiseAI.tagline || activeFranchiseAI.personality}
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-white/5 text-xs">
                  <div className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Activity size={11} className="text-emerald-400" />
                    <span>Matchday Playing Style</span>
                  </div>
                  <p className="text-[11px] text-gray-200 leading-snug">
                    {activeFranchiseAI.personality}
                  </p>
                </div>

                {/* Marquee Untouchable Stars */}
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-white/5">
                  <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                    <Shield size={11} className="text-amber-400" />
                    <span>Untouchable Core Icons</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeFranchiseAI.untouchables.map((star, idx) => (
                      <span 
                        key={idx}
                        className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold text-white flex items-center gap-1"
                      >
                        <span className="text-amber-400">★</span> {star}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Launch / Resume CTA */}
            <button
              onClick={() => handleEnterWarRoom(activeTeam.id)}
              className="w-full py-2.5 sm:py-3 rounded-2xl font-display text-xs sm:text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl cursor-pointer hover:scale-[1.02] active:scale-95 transition-all text-slate-950"
              style={{
                backgroundColor: activeTeam.color,
                boxShadow: `0 0 25px ${activeTeam.color}60`
              }}
            >
              <span>{existingCampaign ? `RESUME ${activeTeam.name.toUpperCase()} CAMPAIGN` : `SELECT ${activeTeam.name.toUpperCase()} & ENTER WAR ROOM`}</span>
              <ArrowRight size={15} />
            </button>
          </div>

          {/* Right Pane: Home Ground Fortress, Soil & Pitch Analytics */}
          <div className="md:col-span-6 p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-slate-900/90 border border-white/10 flex flex-col justify-between shadow-xl relative overflow-hidden">
            <div>
              <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Compass size={16} className="text-emerald-400" />
                  <div>
                    <h3 className="text-xs sm:text-sm font-black uppercase text-white">Home Ground Fortress</h3>
                    <span className="text-[10px] text-gray-400">{activeStadium.name} ({activeStadium.city})</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-emerald-300 font-bold">
                  Par: {activeStadium.avgFirstInnings} Runs
                </span>
              </div>

              {/* Pitch Characteristics Grid */}
              <div className="grid grid-cols-2 gap-2 mb-2.5 text-xs">
                <div className="p-2 rounded-xl bg-slate-950/70 border border-white/5">
                  <span className="text-[9px] font-mono text-gray-400 uppercase block">Pitch Profile</span>
                  <span className="text-[11px] font-bold text-amber-300">{activeStadium.pitchType}</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-950/70 border border-white/5">
                  <span className="text-[9px] font-mono text-gray-400 uppercase block">Stadium Capacity</span>
                  <span className="text-[11px] font-bold text-white">{activeStadium.capacity}</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-950/70 border border-white/5">
                  <span className="text-[9px] font-mono text-gray-400 uppercase block">Boundary Scale</span>
                  <span className="text-[11px] font-bold text-sky-300">{activeStadium.boundarySize}</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-950/70 border border-white/5">
                  <span className="text-[9px] font-mono text-gray-400 uppercase block">Ground Record</span>
                  <span className="text-[11px] font-bold text-emerald-400">{activeStadium.recordScore}</span>
                </div>
              </div>

              {/* Boundary Dimensions */}
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-white/5 mb-2.5">
                <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 mb-1">
                  <span>GROUND DIMENSIONS</span>
                  <span className="text-gray-300">{activeStadium.boundarySize} • Capacity: {activeStadium.capacity}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-900 border border-white/10 overflow-hidden flex">
                  <div className="h-full bg-sky-500" style={{ width: '33%' }} title="Off" />
                  <div className="h-full bg-emerald-500" style={{ width: '34%' }} title="Straight" />
                  <div className="h-full bg-amber-500" style={{ width: '33%' }} title="Leg" />
                </div>
              </div>

              {/* Tournament Flow Summary */}
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-gray-300 space-y-1">
                <span className="text-[10px] font-black uppercase text-amber-300 block">
                  Official 4-Phase Championship Road
                </span>
                <p className="text-[10px] leading-relaxed text-gray-400">
                  1. Trade Window (Side-by-Side Player Swaps) ➔ 2. Retain & Release (Purse Refunds) ➔ 3. Mini-Auction (Live Bidding vs 9 AI Bots) ➔ 4. 74-Match Tournament & Ball-by-Ball Matchday Operations.
                </p>
              </div>
            </div>

            {/* Quick Play Action Button */}
            <button
              onClick={() => handleEnterWarRoom(activeTeam.id)}
              className="w-full py-2.5 sm:py-3 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer border border-white/15 transition-all mt-2"
            >
              <Zap size={14} className="text-amber-400" />
              <span>Launch {activeTeam.short} Campaign Now</span>
            </button>
          </div>

        </div>

      </main>

      {/* Modals */}
      <OnboardingAuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />

      <GamerOnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={() => setShowOnboarding(false)}
      />
    </div>
  )
}
