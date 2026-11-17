import React from 'react';

interface TeamLogoProps {
  teamId: string;
  size?: number;
  className?: string;
  showShadow?: boolean;
}

export default function TeamLogo({
  teamId = 'mi',
  size = 28,
  className = '',
  showShadow = true
}: TeamLogoProps) {
  const tid = (teamId || 'mi').toLowerCase().trim();

  // Return specific team SVG crest
  switch (tid) {
    // 1. MUMBAI INDIANS (MI) - Blue & Gold Sudarshan Chakra Whirlwind Shield
    case 'mi':
    case 'mumbai':
    case 'mumbai indians':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 64 64"
          className={`shrink-0 ${showShadow ? 'drop-shadow-[0_2px_8px_rgba(0,75,160,0.5)]' : ''} ${className}`}
        >
          <defs>
            <linearGradient id="miShield" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#004ba0" />
              <stop offset="60%" stopColor="#002d62" />
              <stop offset="100%" stopColor="#001838" />
            </linearGradient>
            <linearGradient id="miGold" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#d4af37" />
              <stop offset="100%" stopColor="#996515" />
            </linearGradient>
          </defs>
          {/* Outer Shield */}
          <path d="M32 3 L57 12 C57 38 46 54 32 61 C18 54 7 38 7 12 Z" fill="url(#miShield)" stroke="url(#miGold)" strokeWidth="2.5" />
          {/* Inner Gold Pinwheel / Sudarshan Chakra Blades */}
          <g transform="translate(32, 28)">
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
              <path
                key={i}
                d="M0 0 L4 -14 L7 -12 Z"
                fill="url(#miGold)"
                transform={`rotate(${angle})`}
              />
            ))}
            <circle cx="0" cy="0" r="4.5" fill="#fef08a" stroke="#002d62" strokeWidth="1" />
          </g>
          {/* Official "MI" Monogram banner */}
          <rect x="18" y="44" width="28" height="11" rx="3" fill="#001f4d" stroke="url(#miGold)" strokeWidth="1.2" />
          <text x="32" y="52.5" textAnchor="middle" fill="#ffffff" fontWeight="900" fontSize="8" fontFamily="Arial Black, Impact, sans-serif" letterSpacing="0.8">
            MI
          </text>
        </svg>
      );

    // 2. CHENNAI SUPER KINGS (CSK) - Roaring Golden Lion Shield
    case 'csk':
    case 'chennai':
    case 'chennai super kings':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 64 64"
          className={`shrink-0 ${showShadow ? 'drop-shadow-[0_2px_8px_rgba(250,204,21,0.5)]' : ''} ${className}`}
        >
          <defs>
            <linearGradient id="cskYellow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fde047" />
              <stop offset="70%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#ca8a04" />
            </linearGradient>
            <linearGradient id="cskBlue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#1e3a8a" />
            </linearGradient>
          </defs>
          {/* Outer Shield */}
          <path d="M32 3 L57 12 C57 38 46 54 32 61 C18 54 7 38 7 12 Z" fill="url(#cskYellow)" stroke="#1e3a8a" strokeWidth="2.5" />
          {/* Roaring Lion Head in Royal Blue */}
          <g transform="translate(18, 14)">
            {/* Crown */}
            <path d="M9 3 L12 0 L15 3 L18 0 L21 3 L20 7 L10 7 Z" fill="#1e3a8a" />
            {/* Lion Mane & Face */}
            <path d="M8 8 C14 5 22 5 24 10 C27 15 26 21 21 24 C17 26 12 26 9 23 L9 18 L15 18 L12 15 L7 15 Z" fill="#1e3a8a" />
            {/* Roaring Jaw & Fangs */}
            <path d="M11 20 L15 20 L13 23 Z" fill="#fde047" />
            {/* Eye */}
            <circle cx="16" cy="12" r="1.5" fill="#fde047" />
          </g>
          {/* CSK Banner */}
          <rect x="16" y="44" width="32" height="11" rx="3" fill="url(#cskBlue)" stroke="#ffffff" strokeWidth="1" />
          <text x="32" y="52.5" textAnchor="middle" fill="#fef08a" fontWeight="900" fontSize="8" fontFamily="Arial Black, Impact, sans-serif" letterSpacing="0.8">
            CSK
          </text>
        </svg>
      );

    // 3. ROYAL CHALLENGERS BENGALURU (RCB) - Rampant Royal Lion & Crown
    case 'rcb':
    case 'bengaluru':
    case 'royal challengers':
    case 'royal challengers bengaluru':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 64 64"
          className={`shrink-0 ${showShadow ? 'drop-shadow-[0_2px_8px_rgba(220,38,38,0.5)]' : ''} ${className}`}
        >
          <defs>
            <linearGradient id="rcbRed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#dc2626" />
              <stop offset="60%" stopColor="#991b1b" />
              <stop offset="100%" stopColor="#18181b" />
            </linearGradient>
            <linearGradient id="rcbGold" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fde047" />
              <stop offset="60%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
          </defs>
          <path d="M32 3 L57 12 C57 38 46 54 32 61 C18 54 7 38 7 12 Z" fill="url(#rcbRed)" stroke="url(#rcbGold)" strokeWidth="2.5" />
          {/* Royal Crown */}
          <path d="M22 17 L25 12 L32 15 L39 12 L42 17 L39 19 L25 19 Z" fill="url(#rcbGold)" />
          {/* Rampant Standing Lion */}
          <path d="M30 22 C34 22 36 24 36 27 C36 29 34 30 36 32 C38 34 39 37 38 40 L35 40 L34 35 L30 35 L30 40 L27 40 C27 34 28 30 29 27 C28 25 27 24 26 25 L25 22 Z" fill="url(#rcbGold)" />
          {/* RCB Banner */}
          <rect x="16" y="44" width="32" height="11" rx="3" fill="#18181b" stroke="url(#rcbGold)" strokeWidth="1.2" />
          <text x="32" y="52.5" textAnchor="middle" fill="#fde047" fontWeight="900" fontSize="8" fontFamily="Arial Black, Impact, sans-serif" letterSpacing="0.8">
            RCB
          </text>
        </svg>
      );

    // 4. KOLKATA KNIGHT RIDERS (KKR) - Corinthian Knight Helmet & Flame
    case 'kkr':
    case 'kolkata':
    case 'kolkata knight riders':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 64 64"
          className={`shrink-0 ${showShadow ? 'drop-shadow-[0_2px_8px_rgba(88,28,135,0.5)]' : ''} ${className}`}
        >
          <defs>
            <linearGradient id="kkrPurple" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6b21a8" />
              <stop offset="60%" stopColor="#3b0764" />
              <stop offset="100%" stopColor="#1e0538" />
            </linearGradient>
            <linearGradient id="kkrGold" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#a16207" />
            </linearGradient>
          </defs>
          <path d="M32 3 L57 12 C57 38 46 54 32 61 C18 54 7 38 7 12 Z" fill="url(#kkrPurple)" stroke="url(#kkrGold)" strokeWidth="2.5" />
          {/* Knight Helmet & Crest */}
          <g transform="translate(20, 13)">
            {/* Gold Plume / Flame */}
            <path d="M12 0 C16 3 18 8 16 12 L8 12 C6 8 8 3 12 0 Z" fill="url(#kkrGold)" />
            {/* Corinthian Visor & Cheekguards */}
            <path d="M7 12 L17 12 L19 22 L15 25 L12 20 L9 25 L5 22 Z" fill="url(#kkrGold)" stroke="#3b0764" strokeWidth="1" />
            <rect x="9" y="15" width="6" height="2" fill="#3b0764" />
          </g>
          {/* KKR Banner */}
          <rect x="16" y="44" width="32" height="11" rx="3" fill="#2e0854" stroke="url(#kkrGold)" strokeWidth="1.2" />
          <text x="32" y="52.5" textAnchor="middle" fill="#ffffff" fontWeight="900" fontSize="8" fontFamily="Arial Black, Impact, sans-serif" letterSpacing="0.8">
            KKR
          </text>
        </svg>
      );

    // 5. SUNRISERS HYDERABAD (SRH) - Rising Phoenix & Radiant Sun
    case 'srh':
    case 'hyderabad':
    case 'sunrisers hyderabad':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 64 64"
          className={`shrink-0 ${showShadow ? 'drop-shadow-[0_2px_8px_rgba(234,88,12,0.5)]' : ''} ${className}`}
        >
          <defs>
            <linearGradient id="srhOrange" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="60%" stopColor="#ea580c" />
              <stop offset="100%" stopColor="#1c1917" />
            </linearGradient>
            <linearGradient id="srhYellow" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
          </defs>
          <path d="M32 3 L57 12 C57 38 46 54 32 61 C18 54 7 38 7 12 Z" fill="url(#srhOrange)" stroke="#fef08a" strokeWidth="2.5" />
          {/* Rising Sunburst & Eagle Wings */}
          <g transform="translate(14, 15)">
            <circle cx="18" cy="14" r="8" fill="url(#srhYellow)" />
            {/* Eagle Wings Left */}
            <path d="M18 14 L4 6 C6 14 10 20 18 22 Z" fill="#1c1917" />
            {/* Eagle Wings Right */}
            <path d="M18 14 L32 6 C30 14 26 20 18 22 Z" fill="#1c1917" />
          </g>
          {/* SRH Banner */}
          <rect x="16" y="44" width="32" height="11" rx="3" fill="#0c0a09" stroke="#f97316" strokeWidth="1.2" />
          <text x="32" y="52.5" textAnchor="middle" fill="#fde047" fontWeight="900" fontSize="8" fontFamily="Arial Black, Impact, sans-serif" letterSpacing="0.8">
            SRH
          </text>
        </svg>
      );

    // 6. RAJASTHAN ROYALS (RR) - Royal Pink Crown & Elephants
    case 'rr':
    case 'rajasthan':
    case 'rajasthan royals':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 64 64"
          className={`shrink-0 ${showShadow ? 'drop-shadow-[0_2px_8px_rgba(236,72,153,0.5)]' : ''} ${className}`}
        >
          <defs>
            <linearGradient id="rrPink" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" />
              <stop offset="60%" stopColor="#db2777" />
              <stop offset="100%" stopColor="#1e3a8a" />
            </linearGradient>
            <linearGradient id="rrGold" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="60%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#ca8a04" />
            </linearGradient>
          </defs>
          <path d="M32 3 L57 12 C57 38 46 54 32 61 C18 54 7 38 7 12 Z" fill="url(#rrPink)" stroke="url(#rrGold)" strokeWidth="2.5" />
          {/* Crown & Royal Elephants */}
          <path d="M22 17 L25 11 L32 14 L39 11 L42 17 L38 21 L26 21 Z" fill="url(#rrGold)" />
          {/* Golden Star */}
          <polygon points="32,23 34,29 40,29 35,33 37,39 32,35 27,39 29,33 24,29 30,29" fill="#ffffff" />
          {/* RR Banner */}
          <rect x="18" y="44" width="28" height="11" rx="3" fill="#1e3a8a" stroke="url(#rrGold)" strokeWidth="1.2" />
          <text x="32" y="52.5" textAnchor="middle" fill="#ffffff" fontWeight="900" fontSize="8" fontFamily="Arial Black, Impact, sans-serif" letterSpacing="0.8">
            RR
          </text>
        </svg>
      );

    // 7. GUJARAT TITANS (GT) - Navy Apex Lightning Shield
    case 'gt':
    case 'gujarat':
    case 'gujarat titans':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 64 64"
          className={`shrink-0 ${showShadow ? 'drop-shadow-[0_2px_8px_rgba(56,189,248,0.5)]' : ''} ${className}`}
        >
          <defs>
            <linearGradient id="gtNavy" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="60%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#020617" />
            </linearGradient>
            <linearGradient id="gtGold" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="100%" stopColor="#eab308" />
            </linearGradient>
          </defs>
          <path d="M32 3 L57 12 C57 38 46 54 32 61 C18 54 7 38 7 12 Z" fill="url(#gtNavy)" stroke="#38bdf8" strokeWidth="2.5" />
          {/* Geometric Apex Pyramid & Lightning Bolt */}
          <polygon points="32,12 46,34 36,34 38,40 22,28 30,28" fill="url(#gtGold)" />
          {/* GT Banner */}
          <rect x="18" y="44" width="28" height="11" rx="3" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.2" />
          <text x="32" y="52.5" textAnchor="middle" fill="#38bdf8" fontWeight="900" fontSize="8" fontFamily="Arial Black, Impact, sans-serif" letterSpacing="0.8">
            GT
          </text>
        </svg>
      );

    // 8. LUCKNOW SUPER GIANTS (LSG) - Soaring Tricolor Eagle Wings
    case 'lsg':
    case 'lucknow':
    case 'lucknow super giants':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 64 64"
          className={`shrink-0 ${showShadow ? 'drop-shadow-[0_2px_8px_rgba(14,165,233,0.5)]' : ''} ${className}`}
        >
          <defs>
            <linearGradient id="lsgCyan" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0284c7" />
              <stop offset="60%" stopColor="#0369a1" />
              <stop offset="100%" stopColor="#082f49" />
            </linearGradient>
          </defs>
          <path d="M32 3 L57 12 C57 38 46 54 32 61 C18 54 7 38 7 12 Z" fill="url(#lsgCyan)" stroke="#f97316" strokeWidth="2.5" />
          {/* Wing Feathers in Tricolor */}
          <g transform="translate(16, 14)">
            {/* Left Wing Feathers */}
            <path d="M16 14 C10 8 4 10 2 16 C6 18 12 18 16 14 Z" fill="#f97316" />
            <path d="M16 16 C11 12 6 15 4 20 C8 21 12 20 16 16 Z" fill="#ffffff" />
            <path d="M16 18 C12 16 8 19 6 24 C10 24 13 22 16 18 Z" fill="#10b981" />
            {/* Right Wing Feathers */}
            <path d="M16 14 C22 8 28 10 30 16 C26 18 20 18 16 14 Z" fill="#f97316" />
            <path d="M16 16 C21 12 26 15 28 20 C24 21 20 20 16 16 Z" fill="#ffffff" />
            <path d="M16 18 C20 16 24 19 26 24 C22 24 19 22 16 18 Z" fill="#10b981" />
            {/* Cricket Ball Center */}
            <circle cx="16" cy="14" r="5" fill="#f97316" stroke="#ffffff" strokeWidth="1" />
          </g>
          {/* LSG Banner */}
          <rect x="16" y="44" width="32" height="11" rx="3" fill="#082f49" stroke="#ffffff" strokeWidth="1" />
          <text x="32" y="52.5" textAnchor="middle" fill="#ffffff" fontWeight="900" fontSize="8" fontFamily="Arial Black, Impact, sans-serif" letterSpacing="0.8">
            LSG
          </text>
        </svg>
      );

    // 9. DELHI CAPITALS (DC) - Triple Roaring Tiger Crest
    case 'dc':
    case 'delhi':
    case 'delhi capitals':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 64 64"
          className={`shrink-0 ${showShadow ? 'drop-shadow-[0_2px_8px_rgba(29,78,216,0.5)]' : ''} ${className}`}
        >
          <defs>
            <linearGradient id="dcBlue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="60%" stopColor="#1d4ed8" />
              <stop offset="100%" stopColor="#dc2626" />
            </linearGradient>
            <linearGradient id="dcGold" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="100%" stopColor="#eab308" />
            </linearGradient>
          </defs>
          <path d="M32 3 L57 12 C57 38 46 54 32 61 C18 54 7 38 7 12 Z" fill="url(#dcBlue)" stroke="url(#dcGold)" strokeWidth="2.5" />
          {/* Triple Roaring Tiger Profile */}
          <g transform="translate(18, 14)">
            <circle cx="14" cy="12" r="9" fill="url(#dcGold)" />
            <path d="M7 12 C7 8 11 5 14 5 C17 5 21 8 21 12 C18 10 10 10 7 12 Z" fill="#1d4ed8" />
            {/* Roar Teeth */}
            <polygon points="11,15 13,12 15,15" fill="#dc2626" />
          </g>
          {/* DC Banner */}
          <rect x="18" y="44" width="28" height="11" rx="3" fill="#dc2626" stroke="url(#dcGold)" strokeWidth="1.2" />
          <text x="32" y="52.5" textAnchor="middle" fill="#ffffff" fontWeight="900" fontSize="8" fontFamily="Arial Black, Impact, sans-serif" letterSpacing="0.8">
            DC
          </text>
        </svg>
      );

    // 10. PUNJAB KINGS (PBKS) - Roaring Proud Lion Shield
    case 'pbks':
    case 'punjab':
    case 'punjab kings':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 64 64"
          className={`shrink-0 ${showShadow ? 'drop-shadow-[0_2px_8px_rgba(220,38,38,0.5)]' : ''} ${className}`}
        >
          <defs>
            <linearGradient id="pbksRed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="60%" stopColor="#dc2626" />
              <stop offset="100%" stopColor="#7f1d1d" />
            </linearGradient>
            <linearGradient id="pbksGold" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
          </defs>
          <path d="M32 3 L57 12 C57 38 46 54 32 61 C18 54 7 38 7 12 Z" fill="url(#pbksRed)" stroke="url(#pbksGold)" strokeWidth="2.5" />
          {/* Golden Shield Lion Crest */}
          <g transform="translate(18, 14)">
            <path d="M14 2 C8 4 6 10 8 16 C10 22 14 24 14 24 C14 24 18 22 20 16 C22 10 20 4 14 2 Z" fill="url(#pbksGold)" />
            <circle cx="14" cy="9" r="2.5" fill="#7f1d1d" />
          </g>
          {/* PBKS Banner */}
          <rect x="14" y="44" width="36" height="11" rx="3" fill="#7f1d1d" stroke="url(#pbksGold)" strokeWidth="1.2" />
          <text x="32" y="52.5" textAnchor="middle" fill="#fde047" fontWeight="900" fontSize="7.5" fontFamily="Arial Black, Impact, sans-serif" letterSpacing="0.8">
            PBKS
          </text>
        </svg>
      );

    default:
      return (
        <div 
          className={`rounded-xl flex items-center justify-center font-black text-white bg-slate-800 border border-white/20 shrink-0 ${className}`}
          style={{ width: size, height: size, fontSize: Math.floor(size * 0.4) }}
        >
          {tid.slice(0, 3).toUpperCase()}
        </div>
      );
  }
}
