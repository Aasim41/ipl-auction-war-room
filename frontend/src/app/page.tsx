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
import ThreeChampionshipCup from '../components/ThreeChampionshipCup'
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
  const [expandedFortress, setExpandedFortress] = useState(false)

  const touchStartXRef = useRef<number | null>(null)
  const touchStartYRef = useRef<number | null>(null)

  const handleHeroTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX
    touchStartYRef.current = e.touches[0].clientY
  }

  const handleHeroTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return
    const deltaX = e.changedTouches[0].clientX - touchStartXRef.current
    const deltaY = e.changedTouches[0].clientY - touchStartYRef.current

    if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.3) {
      const curIdx = TEAMS.findIndex(t => t.id === selectedTeamId)
      if (deltaX < 0 && curIdx < TEAMS.length - 1) {
        handleSelectTeamTab(TEAMS[curIdx + 1].id)
      } else if (deltaX > 0 && curIdx > 0) {
        handleSelectTeamTab(TEAMS[curIdx - 1].id)
      }
    }
    touchStartXRef.current = null
    touchStartYRef.current = null
  }

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
      <main className="max-w-5xl mx-auto w-full px-3 sm:px-4 py-3 sm:py-4 flex-1 flex flex-col justify-between overflow-x-hidden gap-3">
        
        {/* Minimal Broadcast Header */}
        <div className="flex items-center justify-between pb-2 border-b border-white/10 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-black uppercase tracking-wider">
                IPL 2027 SEASON
              </span>
              <span className="text-[11px] text-gray-400 font-mono hidden sm:inline">10 Franchises • ₹125 Cr Cap</span>
            </div>
            <h1 className="text-base sm:text-lg font-black font-display text-white mt-0.5">
              Select Franchise War Room
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                gameAudio.playUiTap('medium')
                triggerGameHaptic('light')
                setShowOnboarding(true)
              }}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-amber-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-white/10 transition-all shrink-0"
            >
              <Sparkles size={13} className="text-amber-400" />
              <span>Guide</span>
            </button>
            <button
              onClick={() => setShowAuthModal(true)}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-gray-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-white/10 transition-all shrink-0"
            >
              <span>{currentUser.avatar || '👑'}</span>
              <span className="truncate max-w-[90px]">{currentUser.gamerTag}</span>
            </button>
          </div>
        </div>

        {/* 10-Team Fast Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1 shrink-0">
          {TEAMS.map((t) => {
            const isSelected = t.id === activeTeam.id
            const hasSave = Object.values(campaigns).some(c => c.teamId === t.id)
            return (
              <button
                key={t.id}
                onClick={() => handleSelectTeamTab(t.id)}
                className={`px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0 border ${
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

        {/* Mobile Franchise Swipe Hint */}
        <div className="flex sm:hidden items-center justify-between px-3 py-1 bg-slate-900/80 rounded-xl border border-white/10 text-[10px] font-mono text-gray-400">
          <span>👈 Swipe</span>
          <span className="text-amber-400 font-bold uppercase">{activeTeam.name} ({activeTeam.short})</span>
          <span>Swipe 👉</span>
        </div>

        {/* Minimal Hero Franchise Card */}
        <div 
          onTouchStart={handleHeroTouchStart}
          onTouchEnd={handleHeroTouchEnd}
          className="p-4 sm:p-6 rounded-3xl bg-slate-900/90 border border-white/10 shadow-2xl flex flex-col justify-between gap-4 relative overflow-hidden flex-1"
        >
          <div 
            className="absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl opacity-20 pointer-events-none"
            style={{ backgroundColor: activeTeam.color }}
          />

          <div>
            {/* Header: Crest & Team Name */}
            <div className="flex items-start justify-between pb-3 border-b border-white/10 gap-3">
              <div className="flex items-center gap-3.5">
                <div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-xl border shrink-0"
                  style={{
                    backgroundColor: `${activeTeam.color}25`,
                    borderColor: `${activeTeam.color}50`
                  }}
                >
                  {activeTeam.emoji}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg sm:text-2xl font-black font-display text-white">{activeTeam.name}</h2>
                    <span 
                      className="px-2 py-0.5 rounded text-[11px] font-black text-slate-950"
                      style={{ backgroundColor: activeTeam.color }}
                    >
                      {activeTeam.short}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400 font-mono mt-0.5">
                    <span className="text-amber-400 font-bold flex items-center gap-1">
                      <Trophy size={12} /> {activeTeam.titles}
                    </span>
                    <span>•</span>
                    <span>Starting Cap: ₹125.0 Cr</span>
                  </div>
                </div>
              </div>

              {existingCampaign && (
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-black uppercase shrink-0">
                  Save Active ({existingCampaign.currentPhase.replace('_', ' ')})
                </span>
              )}
            </div>

            {/* 3D Championship Trophy Stage */}
            <div className="my-3">
              <ThreeChampionshipCup 
                franchiseColor={activeTeam.color} 
                franchiseShort={activeTeam.short}
                franchiseName={activeTeam.name}
              />
            </div>

            {/* 4 Sleek Key Stat Cards with Expandable Home Fortress */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-3">
              <div 
                onClick={() => {
                  setExpandedFortress(!expandedFortress);
                  gameAudio.playUiTap('light');
                }}
                className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                  expandedFortress
                    ? 'bg-emerald-950/40 border-emerald-500/50 shadow-md ring-1 ring-emerald-400/40'
                    : 'bg-slate-950/70 border-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono text-gray-400 uppercase">Home Fortress</span>
                  <span className="text-[9px] text-emerald-400 font-mono font-bold">{expandedFortress ? '▲ Collapse' : '▼ Expand'}</span>
                </div>
                <span className="text-xs font-bold text-white block truncate">{activeStadium.name}</span>
                <span className="text-[10px] font-mono text-emerald-400">Par {activeStadium.avgFirstInnings} Runs</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/70 border border-white/5">
                <span className="text-[10px] font-mono text-gray-400 uppercase block mb-1">Pitch Profile</span>
                <span className="text-xs font-bold text-amber-300 block">{activeStadium.pitchType}</span>
                <span className="text-[10px] font-mono text-gray-400">{activeStadium.boundarySize} Bound.</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/70 border border-white/5">
                <span className="text-[10px] font-mono text-gray-400 uppercase block mb-1">War Room Identity</span>
                <span className="text-xs font-bold text-sky-300 block truncate">{activeFranchiseAI.tagline || activeFranchiseAI.personality}</span>
                <span className="text-[10px] font-mono text-gray-400">Tactical Focus</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/70 border border-white/5">
                <span className="text-[10px] font-mono text-gray-400 uppercase block mb-1">Starting Roster</span>
                <span className="text-xs font-bold text-white block">25 Players</span>
                <span className="text-[10px] font-mono text-purple-400">₹125.0 Cr Cap</span>
              </div>
            </div>

            {/* Expandable Fortress Telemetry Tray */}
            {expandedFortress && (
              <div className="p-3 mb-3 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono animate-fadeIn">
                <div className="p-2 rounded-xl bg-slate-950/70 border border-white/5">
                  <span className="text-[9px] text-gray-400 block">Pace vs Spin</span>
                  <span className="text-white font-bold">{activeStadium.pitchType.includes('Spin') ? '65% Spin / 35% Pace' : '60% Pace / 40% Spin'}</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-950/70 border border-white/5">
                  <span className="text-[9px] text-gray-400 block">Dew Impact</span>
                  <span className="text-amber-300 font-bold">{activeStadium.city === 'Mumbai' || activeStadium.city === 'Chennai' ? 'High (Chase Favor)' : 'Moderate'}</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-950/70 border border-white/5">
                  <span className="text-[9px] text-gray-400 block">Boundary Size</span>
                  <span className="text-sky-300 font-bold">{activeStadium.boundarySize} (High 6s)</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-950/70 border border-white/5">
                  <span className="text-[9px] text-gray-400 block">Historical 1st Inn Par</span>
                  <span className="text-emerald-400 font-bold">{activeStadium.avgFirstInnings} / 6 in 20 ov</span>
                </div>
              </div>
            )}
                <span className="text-[10px] font-mono text-purple-400">₹125.0 Cr Cap</span>
              </div>
            </div>

            {/* Marquee Core Stars */}
            <div className="p-3 rounded-2xl bg-slate-950/70 border border-white/5">
              <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                <Shield size={12} className="text-amber-400" />
                <span>Marquee Core Icons</span>
              </span>
              <div className="flex flex-wrap gap-2">
                {activeFranchiseAI.untouchables.map((star, idx) => (
                  <span 
                    key={idx}
                    className="px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white flex items-center gap-1.5"
                  >
                    <span className="text-amber-400">★</span> {star}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Single High-Impact Primary CTA */}
          <button
            onClick={() => handleEnterWarRoom(activeTeam.id)}
            className="w-full py-3.5 sm:py-4 rounded-2xl font-display text-sm sm:text-base font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl cursor-pointer hover:scale-[1.01] active:scale-95 transition-all text-slate-950"
            style={{
              backgroundColor: activeTeam.color,
              boxShadow: `0 0 25px ${activeTeam.color}60`
            }}
          >
            <span>{existingCampaign ? `RESUME ${activeTeam.name.toUpperCase()} CAMPAIGN` : `SELECT ${activeTeam.name.toUpperCase()} & ENTER WAR ROOM`}</span>
            <ArrowRight size={16} />
          </button>
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
        onCompleteToTeamSelect={() => setShowOnboarding(false)}
      />
    </div>
  )
}
