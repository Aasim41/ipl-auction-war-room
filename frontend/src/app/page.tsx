'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { 
  Trophy, 
  Users, 
  Zap, 
  Gavel, 
  TrendingUp, 
  Shield, 
  Compass, 
  MapPin, 
  ChevronRight, 
  Sparkles, 
  Activity,
  User,
  ArrowRight
} from 'lucide-react'
import { useStore } from '../store/useStore'
import { useCampaignStore } from '../store/useCampaignStore'
import { getStadiumForTeam } from '../data/stadiums'
import { getFranchise } from '../data/franchises'
import { StadiumShowcase } from '../components/StadiumShowcase'
import { OnboardingAuthModal } from '../components/OnboardingAuthModal'
import { GameLoadingScreen } from '../components/GameLoadingScreen'
import { GamerOnboardingModal } from '../components/GamerOnboardingModal'
import { useRouter } from 'next/navigation'
import gsap from 'gsap'

const broadcastFeatures = [
  {
    title: 'Linear Programming Optimizer',
    tag: 'Operations Research',
    desc: 'PuLP CBC solver optimizing 25-man squad within ₹125 Cr salary cap and overseas quota.',
    icon: Zap,
    stat: '25 Players • ₹125 Cr',
    color: '#fbbf24'
  },
  {
    title: 'Live Auction Arena',
    tag: 'Bidding Engine',
    desc: 'Broadcast-grade live bidding war room with AI rival franchise counter-bids and paddle wars.',
    icon: Gavel,
    stat: '10 Franchises Live',
    color: '#3b82f6'
  },
  {
    title: 'Home Ground Pitch Engine',
    tag: 'Stadium Calibration',
    desc: 'Pitch-calibrated Playing XI tuned for home turf soil, dew factors, and boundary lengths.',
    icon: Compass,
    stat: '10 Stadium Fortresses',
    color: '#10b981'
  },
  {
    title: '357+ Player Power Index',
    tag: 'Analytics Suite',
    desc: 'Deep strike rate, economy, phase impact, and historical auction valuation models.',
    icon: Users,
    stat: '357 Registered Stars',
    color: '#a855f7'
  }
]

export default function LandingPage() {
  const router = useRouter()
  const { theme, setTheme } = useStore()
  const { getActiveCampaign, currentUser } = useCampaignStore()
  const activeCamp = getActiveCampaign()
  const activeStadium = getStadiumForTeam(activeCamp?.teamId || theme)
  const activeFranchise = getFranchise(activeCamp?.teamId || theme)
  const heroRef = useRef<HTMLDivElement>(null)
  const headlineRef = useRef<HTMLHeadingElement>(null)
  const [mounted, setMounted] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showLoading, setShowLoading] = useState(true)
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Check if the user has already seen loading screen in this session
    const hasLoaded = sessionStorage.getItem('auctionxi_boot_complete')
    if (hasLoaded) {
      setShowLoading(false)
    }
  }, [])

  const handleLoadingComplete = () => {
    setShowLoading(false)
    sessionStorage.setItem('auctionxi_boot_complete', 'true')
    // If no active campaign, launch onboarding automatically!
    if (!activeCamp) {
      setShowOnboarding(true)
    }
  }

  const handleCompleteToTeamSelect = () => {
    setShowOnboarding(false)
    router.push('/select-team')
  }

  // GSAP Entrance Timeline
  useEffect(() => {
    if (!mounted) return

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      tl.fromTo(
        '.gsap-broadcast-badge',
        { opacity: 0, y: -20, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6 }
      )
      .fromTo(
        '.gsap-hero-title',
        { opacity: 0, y: 30, rotateX: 15 },
        { opacity: 1, y: 0, rotateX: 0, duration: 0.8, stagger: 0.15 },
        '-=0.3'
      )
      .fromTo(
        '.gsap-hero-subtitle',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6 },
        '-=0.4'
      )
      .fromTo(
        '.gsap-cta-group',
        { opacity: 0, scale: 0.95, y: 15 },
        { opacity: 1, scale: 1, y: 0, duration: 0.6 },
        '-=0.3'
      )
      .fromTo(
        '.gsap-feature-card',
        { opacity: 0, y: 25 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.08 },
        '-=0.2'
      )
    }, heroRef)

    return () => ctx.revert()
  }, [mounted])

  const targetPhaseUrl = activeCamp
    ? activeCamp.currentPhase === 'trade'
      ? '/trade'
      : activeCamp.currentPhase === 'retain_release'
      ? '/squad'
      : activeCamp.currentPhase === 'mini_auction'
      ? '/auction'
      : '/playing-xi'
    : '/select-team'

  return (
    <div ref={heroRef} className="min-h-screen relative overflow-x-hidden flex flex-col justify-between text-white">

      {/* ─── Matchday Stadium Ribbon (Top Broadcast Bar) ─── */}
      <div className="relative z-20 border-b border-white/10 bg-black/40 backdrop-blur-md px-3 sm:px-6 py-2 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          
          <div className="flex items-center gap-2.5">
            <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px] text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              ARENA ACTIVE
            </span>
            <span className="text-gray-500">•</span>
            <span className="text-gray-300 font-medium text-[11px]">
              Venue: <span className="text-white font-semibold">{activeStadium.name}</span> ({activeStadium.city})
            </span>
          </div>

          {/* User Auth Profile Pill */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAuthModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs text-white cursor-pointer transition-all active:scale-95 shadow-sm"
              title="Change manager profile or PIN"
            >
              <span className="text-sm">{currentUser.avatar || '👑'}</span>
              <span className="font-bold text-[11px]">{currentUser.gamerTag}</span>
              <span className="text-[10px] text-amber-400 font-mono">GM Auth ▾</span>
            </button>

            <Link 
              href="/select-team" 
              className="text-white text-xs font-bold hover:underline transition-colors flex items-center gap-1"
              style={{ color: activeStadium.teamColor }}
            >
              Change Fortress <ChevronRight size={12} />
            </Link>
          </div>

        </div>
      </div>

      {/* ─── Main Hero Section ─── */}
      <main className="relative z-10 max-w-6xl mx-auto text-center px-4 sm:px-6 pt-6 sm:pt-10 pb-6 w-full flex-1 flex flex-col justify-center">
        
        {/* Cricket Broadcast Badge */}
        <div className="gsap-broadcast-badge inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-amber-500/30 bg-amber-950/20 text-amber-300 text-xs font-semibold mb-4 mx-auto shadow-[0_0_20px_rgba(245,158,11,0.15)]">
          <Trophy size={13} className="text-amber-400" />
          <span>ROAD TO IPL 2027 • FRANCHISE GM CAMPAIGN</span>
          <span className="px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-200 text-[9px] font-bold">2027 EDITION</span>
        </div>

        {/* Hero Title */}
        <h1 ref={headlineRef} className="font-display text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.92] mb-4">
          <span className="gsap-hero-title block text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]">
            CONQUER THE
          </span>
          <span 
            className="gsap-hero-title block tracking-tight transition-colors duration-700"
            style={{
              color: activeStadium.teamColor,
              textShadow: `0 0 35px ${activeStadium.teamColor}50`,
            }}
          >
            IPL 2027
          </span>
        </h1>

        {/* Hero Subtitle */}
        <div className="gsap-hero-subtitle text-xs sm:text-base text-gray-300 max-w-2xl mx-auto mb-6 font-normal leading-relaxed">
          The official 4-phase IPL manager campaign. Trade with rivals, lock in retentions for purse refunds, battle 9 AI franchise bots in the live Mini-Auction, and conquer match day!
        </div>

        {/* Saved Career Quick Banner if Active */}
        {mounted && activeCamp && (
          <div className="max-w-md mx-auto mb-6 p-3 rounded-2xl bg-slate-900/90 border border-white/15 flex items-center justify-between shadow-xl backdrop-blur-md">
            <div className="flex items-center gap-2.5 text-left">
              <span className="text-2xl">{activeFranchise.emoji}</span>
              <div>
                <div className="text-xs font-black text-white flex items-center gap-1.5">
                  <span>{activeCamp.teamName}</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 font-black uppercase">
                    {activeCamp.currentPhase.replace('_', ' ')}
                  </span>
                </div>
                <div className="text-[10px] text-gray-400 font-mono">
                  Manager: <strong className="text-gray-200">{currentUser.gamerTag}</strong> • Purse: ₹{activeCamp.remainingPurse.toFixed(2)} Cr
                </div>
              </div>
            </div>

            <Link
              href={targetPhaseUrl}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase flex items-center gap-1 shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <span>Resume</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        )}

        {/* CTA Buttons */}
        <div className="gsap-cta-group flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
          {mounted && activeCamp ? (
            <Link
              href={targetPhaseUrl}
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl font-display text-base sm:text-lg font-bold tracking-wider text-black flex items-center justify-center gap-2 transition-all transform hover:scale-105 active:scale-95 shadow-xl cursor-pointer"
              style={{
                backgroundColor: activeStadium.teamColor,
                boxShadow: `0 8px 25px ${activeStadium.teamColor}60`,
              }}
            >
              <Gavel size={18} />
              RESUME {activeCamp.teamName.toUpperCase()}
            </Link>
          ) : (
            <Link
              href="/select-team"
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl font-display text-base sm:text-lg font-bold tracking-wider text-black flex items-center justify-center gap-2 transition-all transform hover:scale-105 active:scale-95 shadow-xl cursor-pointer"
              style={{
                backgroundColor: activeStadium.teamColor,
                boxShadow: `0 8px 25px ${activeStadium.teamColor}60`,
              }}
            >
              <Gavel size={18} />
              START IPL 2027 CAMPAIGN
            </Link>
          )}

          <button
            onClick={() => setShowOnboarding(true)}
            className="w-full sm:w-auto px-5 py-3.5 rounded-2xl font-display text-sm sm:text-base font-bold tracking-wider text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 flex items-center justify-center gap-2 transition-all transform hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-md"
          >
            <Sparkles size={16} className="text-amber-400" />
            <span>HOW TO PLAY (GUIDE)</span>
          </button>

          <Link
            href="/select-team"
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl font-display text-sm sm:text-base font-bold tracking-wider text-white bg-white/5 hover:bg-white/10 border border-white/15 flex items-center justify-center gap-2 transition-all transform hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-md"
          >
            <MapPin size={18} />
            {activeCamp ? 'SWITCH FRANCHISE' : 'CHOOSE TEAM'}
          </Link>
        </div>
          >
            <MapPin size={18} />
            {activeCamp ? 'SWITCH FRANCHISE SAVE' : 'CHOOSE YOUR TEAM'}
          </Link>
        </div>

        {/* ─── Interactive Home Ground Stadium Showcase ─── */}
        <div className="max-w-4xl mx-auto w-full mb-6">
          <StadiumShowcase />
        </div>

        {/* ─── 4 Broadcast Capabilities Cards ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-left my-4">
          {broadcastFeatures.map((f, i) => (
            <div
              key={i}
              className="gsap-feature-card p-3.5 rounded-2xl border border-white/10 bg-slate-950/60 backdrop-blur-md hover:border-white/20 transition-all duration-300 group hover:-translate-y-1"
            >
              <div className="flex items-center justify-between mb-2">
                <div 
                  className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-slate-950 shadow-md"
                  style={{ backgroundColor: f.color }}
                >
                  <f.icon size={16} />
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/5 text-gray-400">
                  {f.tag}
                </span>
              </div>
              <h4 className="font-bold text-xs text-white group-hover:text-amber-300 transition-colors">
                {f.title}
              </h4>
              <p className="text-[11px] text-gray-400 mt-1 leading-snug line-clamp-2">
                {f.desc}
              </p>
            </div>
          ))}
        </div>

      </main>

      {/* Onboarding Auth Modal */}
      <OnboardingAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      {/* Game Onboarding Guide Modal */}
      <GamerOnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onCompleteToTeamSelect={handleCompleteToTeamSelect}
      />

      {/* Cinematic Game Loading Screen */}
      {mounted && showLoading && (
        <GameLoadingScreen
          onComplete={handleLoadingComplete}
        />
      )}

    </div>
  )
}
