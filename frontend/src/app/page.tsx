'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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
  CheckCircle2,
  Play,
  ChevronRight
} from 'lucide-react'
import { useStore } from '../store/useStore'
import { useCampaignStore } from '../store/useCampaignStore'
import { STADIUMS, getStadiumForTeam } from '../data/stadiums'
import { getFranchise, IPL_FRANCHISES } from '../data/franchises'
import { getFranchiseAI } from '../data/franchiseAI'
import { OnboardingAuthModal } from '../components/OnboardingAuthModal'
import { GameLoadingScreen } from '../components/GameLoadingScreen'
import { GamerOnboardingModal } from '../components/GamerOnboardingModal'
import GameModeSelectionModal from '../components/GameModeSelectionModal'
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
    currentUser,
    createScratchCampaign
  } = useCampaignStore()

  const [mounted, setMounted] = useState(false)
  const [selectedTeamId, setSelectedTeamId] = useState<string>('rcb')
  const [selectedGameMode, setSelectedGameMode] = useState<'official_season' | 'scratch_inception'>('official_season')
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showLoading, setShowLoading] = useState(true)
  const [showGameModeModal, setShowGameModeModal] = useState(false)
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
    touchStartXRef.current = null
    touchStartYRef.current = null

    if (Math.abs(deltaX) > 30 && Math.abs(deltaX) > Math.abs(deltaY) * 0.75) {
      const curIdx = TEAMS.findIndex(t => t.id === selectedTeamId)
      if (deltaX < 0 && curIdx < TEAMS.length - 1) {
        handleSelectTeamTab(TEAMS[curIdx + 1].id)
      } else if (deltaX > 0 && curIdx > 0) {
        handleSelectTeamTab(TEAMS[curIdx - 1].id)
      }
    }
  }

  // Synchronize with GlobalSwipeManager custom event
  useEffect(() => {
    const handleAppSwipe = (e: any) => {
      const direction = e.detail?.direction
      const curIdx = TEAMS.findIndex(t => t.id === selectedTeamId)
      if (direction === 'left' && curIdx < TEAMS.length - 1) {
        e.preventDefault()
        handleSelectTeamTab(TEAMS[curIdx + 1].id)
      } else if (direction === 'right' && curIdx > 0) {
        e.preventDefault()
        handleSelectTeamTab(TEAMS[curIdx - 1].id)
      }
    }
    window.addEventListener('app:swipe', handleAppSwipe)
    return () => window.removeEventListener('app:swipe', handleAppSwipe)
  }, [selectedTeamId])

  useEffect(() => {
    setMounted(true)

    // Check active campaign safely with localStorage fallback for hydration resilience
    let activeCamp = getActiveCampaign()
    if (!activeCamp && typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('auctionxi-user-campaign-v3')
        if (raw) {
          const parsed = JSON.parse(raw)
          const cId = parsed.state?.activeCampaignId
          const camps = parsed.state?.campaigns
          if (cId && camps && camps[cId]) {
            activeCamp = camps[cId]
          } else if (camps && Object.values(camps).length > 0) {
            const sorted = (Object.values(camps) as any[]).sort((a: any, b: any) => new Date(b.lastSaved).getTime() - new Date(a.lastSaved).getTime())
            activeCamp = sorted[0]
          }
        }
      } catch (e) {}
    }

    const isSeasonDone = activeCamp?.schedule?.length ? activeCamp.schedule.every(f => f.status === 'COMPLETED') : false
    const hasBooted = typeof window !== 'undefined' ? localStorage.getItem('auctionxi_boot_complete') : null
    const savedMode = typeof window !== 'undefined' ? (localStorage.getItem('auctionxi_game_mode_selected') || localStorage.getItem('auctionxi_preferred_game_mode')) as any : null

    if (savedMode === 'scratch_inception' || savedMode === 'official_season') {
      setSelectedGameMode(savedMode)
    }

    if (activeCamp && !isSeasonDone) {
      // Existing active tournament in progress: immediately resume to the current phase!
      setSelectedTeamId(activeCamp.teamId)
      setTheme(activeCamp.teamId)
      if (activeCamp.mode) {
        setSelectedGameMode(activeCamp.mode)
      }
      setShowLoading(false)
      setShowGameModeModal(false)

      const targetUrl = (activeCamp.currentPhase === 'playing_xi' || activeCamp.currentPhase === 'match')
        ? '/playing-xi'
        : activeCamp.currentPhase === 'mini_auction'
        ? '/auction'
        : activeCamp.currentPhase === 'retain_release'
        ? '/squad'
        : activeCamp.currentPhase === 'draft'
        ? '/draft'
        : '/trade'
      router.replace(targetUrl)
      return
    }

    // New Cycle or Completed Season:
    setShowLoading(false)
    if (isSeasonDone || !hasBooted || !savedMode) {
      setShowGameModeModal(true)
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

  const handleLaunchFranchise = (teamId: string) => {
    setTheme(teamId)

    if (selectedGameMode === 'scratch_inception') {
      gameAudio.playConfettiFanfare()
      triggerGameHaptic('heavy')
      const scratchCampaignId = `${currentUser.id}_${teamId}_scratch_2027`
      if (campaigns[scratchCampaignId]) {
        switchCampaign(scratchCampaignId)
        const c = campaigns[scratchCampaignId]
        const targetUrl = (c.currentPhase === 'playing_xi' || c.currentPhase === 'match')
          ? '/playing-xi'
          : c.currentPhase === 'mini_auction'
          ? '/auction'
          : '/draft'
        router.push(targetUrl)
      } else {
        createScratchCampaign(teamId)
        router.push('/draft')
      }
    } else {
      gameAudio.playTradeDealSuccess()
      triggerGameHaptic('heavy')
      const officialCampaignId = `${currentUser.id}_${teamId}_2027`
      const existing = campaigns[officialCampaignId] || Object.values(campaigns).find(c => c.teamId === teamId && c.mode !== 'scratch_inception')
      if (existing) {
        switchCampaign(existing.id)
        if (existing.activeMatchSimulation && !existing.activeMatchSimulation.matchDone) {
          router.push('/playing-xi')
          return
        }
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
  }

  const activeTeam = TEAMS.find(t => t.id === selectedTeamId) || TEAMS[2]
  const activeStadium = STADIUMS[activeTeam.id] || STADIUMS.rcb
  const activeFranchiseAI = getFranchiseAI(activeTeam.id)
  const activeFranchise = getFranchise(activeTeam.id)
  const existingCampaign = selectedGameMode === 'scratch_inception'
    ? Object.values(campaigns).find(c => c.teamId === activeTeam.id && c.mode === 'scratch_inception')
    : Object.values(campaigns).find(c => c.teamId === activeTeam.id && c.mode !== 'scratch_inception')

  return (
    <div className="min-h-screen relative overflow-x-hidden flex flex-col justify-between text-white bg-transparent safe-page-top pb-16 touch-manipulation select-none">
      
      {/* Optional Cinematic Loading Screen */}
      {showLoading && (
        <GameLoadingScreen
          onComplete={() => {
            setShowLoading(false)
            localStorage.setItem('auctionxi_boot_complete', 'true')
            
            let activeCamp = getActiveCampaign()
            if (!activeCamp && typeof window !== 'undefined') {
              try {
                const raw = localStorage.getItem('auctionxi-user-campaign-v3')
                if (raw) {
                  const parsed = JSON.parse(raw)
                  const cId = parsed.state?.activeCampaignId
                  const camps = parsed.state?.campaigns
                  if (cId && camps && camps[cId]) {
                    activeCamp = camps[cId]
                  } else if (camps && Object.values(camps).length > 0) {
                    const sorted = (Object.values(camps) as any[]).sort((a: any, b: any) => new Date(b.lastSaved).getTime() - new Date(a.lastSaved).getTime())
                    activeCamp = sorted[0]
                  }
                }
              } catch (e) {}
            }

            const isSeasonDone = activeCamp?.schedule?.length ? activeCamp.schedule.every(f => f.status === 'COMPLETED') : false

            if (activeCamp && !isSeasonDone) {
              const targetUrl = (activeCamp.currentPhase === 'playing_xi' || activeCamp.currentPhase === 'match')
                ? '/playing-xi'
                : activeCamp.currentPhase === 'mini_auction'
                ? '/auction'
                : activeCamp.currentPhase === 'retain_release'
                ? '/squad'
                : activeCamp.currentPhase === 'draft'
                ? '/draft'
                : '/trade'
              router.replace(targetUrl)
            } else {
              setShowGameModeModal(true)
            }
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
          <span className="text-amber-400 font-bold uppercase font-mono">{activeTeam.short}</span>
          <span>Swipe 👉</span>
        </div>

        {/* Minimal Hero Franchise Card */}
        <div 
          onTouchStart={handleHeroTouchStart}
          onTouchEnd={handleHeroTouchEnd}
          className="p-3 sm:p-4 rounded-3xl bg-slate-900/90 border border-white/10 shadow-2xl flex flex-col justify-between gap-3 relative overflow-hidden flex-1"
        >
          <div 
            className="absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl opacity-20 pointer-events-none"
            style={{ backgroundColor: activeTeam.color }}
          />

          <div>
            {/* Header: Crest & Team Name */}
            <div className="flex items-start justify-between pb-2.5 border-b border-white/10 gap-3">
              <div className="flex items-center gap-3">
                <div 
                  className="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl shadow-xl border shrink-0"
                  style={{
                    backgroundColor: `${activeTeam.color}25`,
                    borderColor: `${activeTeam.color}50`
                  }}
                >
                  {activeTeam.emoji}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-black font-mono text-white">{activeTeam.short}</h2>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400 font-mono mt-0.5">
                    <Link
                      href="/trophies"
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        gameAudio.playUiTap('select');
                        triggerGameHaptic('light');
                      }}
                      className="text-amber-400 font-bold flex items-center gap-1 hover:underline cursor-pointer bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/30 transition-all hover:bg-amber-500/20 text-[11px]"
                      title="View Franchise Trophy Cabinet"
                    >
                      <Trophy size={11} /> {activeTeam.titles}
                    </Link>
                    <span>•</span>
                    <span className="text-[11px]">Cap: ₹125.0 Cr</span>
                  </div>
                </div>
              </div>

              {existingCampaign && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9.5px] font-mono font-bold uppercase shrink-0">
                  Save: {existingCampaign.currentPhase.replace('_', ' ')}
                </span>
              )}
            </div>

            {/* Active Match Resumption Quick-Launch Banner */}
            {existingCampaign?.activeMatchSimulation && !existingCampaign.activeMatchSimulation.matchDone && (
              <div 
                onClick={() => router.push('/playing-xi')}
                className="my-2.5 p-2.5 rounded-2xl bg-gradient-to-r from-emerald-500/25 via-emerald-600/15 to-slate-900 border border-emerald-400/50 flex items-center justify-between cursor-pointer shadow-lg hover:border-emerald-400 transition-all active:scale-[0.99] group animate-pulse"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black shadow-md shrink-0">
                    <Play size={15} className="fill-slate-950" />
                  </div>
                  <div>
                    <span className="text-[9px] font-mono font-black uppercase text-emerald-400 block tracking-wider">
                      ⚡ MATCH IN PROGRESS
                    </span>
                    <span className="text-xs font-bold text-white">
                      Resume Active Match
                    </span>
                  </div>
                </div>
                <div className="px-2.5 py-1 rounded-lg bg-emerald-500 text-slate-950 font-black text-xs uppercase flex items-center gap-1 group-hover:bg-emerald-400 transition-colors shadow">
                  <span>Resume ➔</span>
                </div>
              </div>
            )}

            {/* 4 Clean Key Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-2.5">
              <div className="p-2 rounded-xl bg-slate-950/70 border border-white/5">
                <span className="text-[9px] font-mono text-gray-400 uppercase block">Fortress</span>
                <span className="text-[11px] font-bold text-white block truncate">{activeStadium.name.split(' ')[0]}</span>
                <span className="text-[9px] font-mono text-emerald-400">Par {activeStadium.avgFirstInnings}</span>
              </div>

              <div className="p-2 rounded-xl bg-slate-950/70 border border-white/5">
                <span className="text-[9px] font-mono text-gray-400 uppercase block">Pitch</span>
                <span className="text-[11px] font-bold text-amber-300 block truncate">{activeStadium.pitchType}</span>
                <span className="text-[9px] font-mono text-gray-400">{activeStadium.boundarySize}</span>
              </div>

              <div className="p-2 rounded-xl bg-slate-950/70 border border-white/5">
                <span className="text-[9px] font-mono text-gray-400 uppercase block">Focus</span>
                <span className="text-[11px] font-bold text-sky-300 block truncate">{activeFranchiseAI.personality || 'Tactical'}</span>
                <span className="text-[9px] font-mono text-gray-400">Strategy</span>
              </div>

              <div className="p-2 rounded-xl bg-slate-950/70 border border-white/5">
                <span className="text-[9px] font-mono text-gray-400 uppercase block">Squad</span>
                <span className="text-[11px] font-bold text-white block">25 Players</span>
                <span className="text-[9px] font-mono text-purple-400">₹125.0 Cr</span>
              </div>
            </div>

            {/* Marquee Core Stars */}
            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-white/5">
              <span className="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                <Shield size={11} className="text-amber-400" />
                <span>Core Stars</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {activeFranchiseAI.untouchables.map((star, idx) => (
                  <span 
                    key={idx}
                    className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-[11px] font-bold text-white flex items-center gap-1"
                  >
                    <span className="text-amber-400 text-[10px]">★</span> {star}
                  </span>
                ))}
              </div>
            </div>

            {/* Franchise Trophy Room & Honors Banner */}
            <Link
              href="/trophies"
              onClick={() => {
                gameAudio.playUiTap('select');
                triggerGameHaptic('light');
              }}
              className="mt-2 p-2.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-slate-950 to-amber-500/10 border border-amber-500/30 flex items-center justify-between cursor-pointer hover:border-amber-400/60 transition-all active:scale-[0.99] group shadow-sm"
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center text-sm border border-amber-500/40 shrink-0">
                  🏆
                </div>
                <div>
                  <div className="text-[11px] font-black text-white flex items-center gap-1.5">
                    <span>Trophy Cabinet & Season Honors</span>
                  </div>
                  <div className="text-[9px] text-gray-400 font-mono">
                    Silverware, Orange & Purple Cap standings & Hall of Fame
                  </div>
                </div>
              </div>
              <ChevronRight size={13} className="text-gray-400 group-hover:text-amber-400 transition-colors shrink-0" />
            </Link>
          </div>

          {/* Single High-Impact Primary CTA */}
          <button
            onClick={() => handleLaunchFranchise(activeTeam.id)}
            className="w-full py-3 rounded-xl font-display text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl cursor-pointer hover:scale-[1.01] active:scale-95 transition-all text-slate-950"
            style={{
              backgroundColor: activeTeam.color,
              boxShadow: `0 0 20px ${activeTeam.color}50`
            }}
          >
            {existingCampaign?.activeMatchSimulation && !existingCampaign.activeMatchSimulation.matchDone ? (
              <>
                <Play size={16} className="fill-slate-950" />
                <span>Resume Match ➔</span>
              </>
            ) : selectedGameMode === 'scratch_inception' ? (
              <>
                <Sparkles size={15} />
                <span>{existingCampaign ? `Resume ${activeTeam.short} ➔` : `Start with ${activeTeam.short} ➔`}</span>
              </>
            ) : (
              <>
                <span>{existingCampaign ? `Resume ${activeTeam.short} ➔` : `Start with ${activeTeam.short} ➔`}</span>
              </>
            )}
          </button>
        </div>

      </main>

      {/* Modals */}
      <GameModeSelectionModal
        isOpen={showGameModeModal}
        onSelectMode={(mode) => {
          setSelectedGameMode(mode)
          setShowGameModeModal(false)
        }}
        onClose={() => setShowGameModeModal(false)}
      />

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
