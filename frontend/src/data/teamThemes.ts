export interface TeamThemeConfig {
  id: string
  name: string
  short: string
  primary: string        // Hex
  secondary: string      // Hex
  accent: string         // Hex
  contrastText: string   // Crisp text color (#000 or #fff) on top of primary
  bgDeep: string         // Deepest dark team shade
  bgMid: string          // Intermediate atmospheric shade
  bgSurface: string      // Glass card surface tint
  cardBg: string         // Rich card gradient background
  cardBorder: string     // Card border color
  cardGlow: string       // Box shadow glow
  pillBg: string         // Pill background
  pillText: string       // Pill text
  glowPrimary: string    // rgba string
  glowSecondary: string  // rgba string
  stadiumName: string
  city: string
  motto: string
}

export const TEAM_THEMES: Record<string, TeamThemeConfig> = {
  srh: {
    id: 'srh',
    name: 'Sunrisers Hyderabad',
    short: 'SRH',
    primary: '#EA580C',
    secondary: '#F97316',
    accent: '#FBBF24',
    contrastText: '#FFFFFF',
    bgDeep: '#140602',
    bgMid: '#2e0f04',
    bgSurface: 'rgba(46, 15, 4, 0.75)',
    cardBg: 'linear-gradient(145deg, rgba(234, 88, 12, 0.32) 0%, rgba(234, 88, 12, 0.12) 50%, rgba(18, 8, 3, 0.92) 100%)',
    cardBorder: 'rgba(234, 88, 12, 0.55)',
    cardGlow: '0 8px 30px rgba(234, 88, 12, 0.22)',
    pillBg: '#EA580C',
    pillText: '#FFFFFF',
    glowPrimary: 'rgba(234, 88, 12, 0.45)',
    glowSecondary: 'rgba(249, 115, 22, 0.28)',
    stadiumName: 'Rajiv Gandhi Stadium',
    city: 'Hyderabad',
    motto: 'ORANGE ARMY • FIRE & PASSION',
  },
  csk: {
    id: 'csk',
    name: 'Chennai Super Kings',
    short: 'CSK',
    primary: '#F59E0B',
    secondary: '#FBBF24',
    accent: '#3B82F6',
    contrastText: '#000000',
    bgDeep: '#120e02',
    bgMid: '#2b1f04',
    bgSurface: 'rgba(43, 31, 4, 0.75)',
    cardBg: 'linear-gradient(145deg, rgba(245, 158, 11, 0.30) 0%, rgba(245, 158, 11, 0.10) 50%, rgba(18, 14, 2, 0.92) 100%)',
    cardBorder: 'rgba(245, 158, 11, 0.55)',
    cardGlow: '0 8px 30px rgba(245, 158, 11, 0.22)',
    pillBg: '#F59E0B',
    pillText: '#000000',
    glowPrimary: 'rgba(245, 158, 11, 0.45)',
    glowSecondary: 'rgba(251, 191, 36, 0.28)',
    stadiumName: 'M. A. Chidambaram Stadium',
    city: 'Chennai',
    motto: 'WHISTLE PODU • YELLOVE',
  },
  mi: {
    id: 'mi',
    name: 'Mumbai Indians',
    short: 'MI',
    primary: '#1D4ED8',
    secondary: '#2563EB',
    accent: '#EAB308',
    contrastText: '#FFFFFF',
    bgDeep: '#020c1c',
    bgMid: '#061c3d',
    bgSurface: 'rgba(6, 28, 61, 0.75)',
    cardBg: 'linear-gradient(145deg, rgba(29, 78, 216, 0.32) 0%, rgba(29, 78, 216, 0.12) 50%, rgba(2, 12, 28, 0.92) 100%)',
    cardBorder: 'rgba(29, 78, 216, 0.55)',
    cardGlow: '0 8px 30px rgba(29, 78, 216, 0.22)',
    pillBg: '#1D4ED8',
    pillText: '#FFFFFF',
    glowPrimary: 'rgba(29, 78, 216, 0.45)',
    glowSecondary: 'rgba(56, 189, 248, 0.25)',
    stadiumName: 'Wankhede Stadium',
    city: 'Mumbai',
    motto: 'DUNIYA HILA DENGE • ONE FAMILY',
  },
  rcb: {
    id: 'rcb',
    name: 'Royal Challengers Bengaluru',
    short: 'RCB',
    primary: '#DC2626',
    secondary: '#991B1B',
    accent: '#FBBF24',
    contrastText: '#FFFFFF',
    bgDeep: '#120204',
    bgMid: '#28060c',
    bgSurface: 'rgba(40, 6, 12, 0.75)',
    cardBg: 'linear-gradient(145deg, rgba(220, 38, 38, 0.32) 0%, rgba(220, 38, 38, 0.12) 50%, rgba(18, 2, 4, 0.92) 100%)',
    cardBorder: 'rgba(220, 38, 38, 0.55)',
    cardGlow: '0 8px 30px rgba(220, 38, 38, 0.22)',
    pillBg: '#DC2626',
    pillText: '#FFFFFF',
    glowPrimary: 'rgba(220, 38, 38, 0.45)',
    glowSecondary: 'rgba(251, 191, 36, 0.25)',
    stadiumName: 'M. Chinnaswamy Stadium',
    city: 'Bengaluru',
    motto: 'PLAY BOLD • EE SALA CUP NAMDE',
  },
  kkr: {
    id: 'kkr',
    name: 'Kolkata Knight Riders',
    short: 'KKR',
    primary: '#7C3AED',
    secondary: '#6D28D9',
    accent: '#F59E0B',
    contrastText: '#FFFFFF',
    bgDeep: '#0f031c',
    bgMid: '#24083f',
    bgSurface: 'rgba(36, 8, 63, 0.75)',
    cardBg: 'linear-gradient(145deg, rgba(124, 58, 237, 0.32) 0%, rgba(124, 58, 237, 0.12) 50%, rgba(15, 3, 28, 0.92) 100%)',
    cardBorder: 'rgba(124, 58, 237, 0.55)',
    cardGlow: '0 8px 30px rgba(124, 58, 237, 0.22)',
    pillBg: '#7C3AED',
    pillText: '#FFFFFF',
    glowPrimary: 'rgba(124, 58, 237, 0.45)',
    glowSecondary: 'rgba(245, 158, 11, 0.22)',
    stadiumName: 'Eden Gardens',
    city: 'Kolkata',
    motto: 'KORBO LORBO JEETBO RE • PURPLE & GOLD',
  },
  rr: {
    id: 'rr',
    name: 'Rajasthan Royals',
    short: 'RR',
    primary: '#DB2777',
    secondary: '#BE185D',
    accent: '#2563EB',
    contrastText: '#FFFFFF',
    bgDeep: '#160310',
    bgMid: '#310624',
    bgSurface: 'rgba(49, 6, 36, 0.75)',
    cardBg: 'linear-gradient(145deg, rgba(219, 39, 119, 0.32) 0%, rgba(219, 39, 119, 0.12) 50%, rgba(22, 3, 16, 0.92) 100%)',
    cardBorder: 'rgba(219, 39, 119, 0.55)',
    cardGlow: '0 8px 30px rgba(219, 39, 119, 0.22)',
    pillBg: '#DB2777',
    pillText: '#FFFFFF',
    glowPrimary: 'rgba(219, 39, 119, 0.45)',
    glowSecondary: 'rgba(37, 99, 235, 0.25)',
    stadiumName: 'Sawai Mansingh Stadium',
    city: 'Jaipur',
    motto: 'HALLA BOL • ROYAL HERITAGE',
  },
  dc: {
    id: 'dc',
    name: 'Delhi Capitals',
    short: 'DC',
    primary: '#0284C7',
    secondary: '#0369A1',
    accent: '#DC2626',
    contrastText: '#FFFFFF',
    bgDeep: '#020f1a',
    bgMid: '#062036',
    bgSurface: 'rgba(6, 32, 54, 0.75)',
    cardBg: 'linear-gradient(145deg, rgba(2, 132, 199, 0.32) 0%, rgba(2, 132, 199, 0.12) 50%, rgba(2, 15, 26, 0.92) 100%)',
    cardBorder: 'rgba(2, 132, 199, 0.55)',
    cardGlow: '0 8px 30px rgba(2, 132, 199, 0.22)',
    pillBg: '#0284C7',
    pillText: '#FFFFFF',
    glowPrimary: 'rgba(2, 132, 199, 0.45)',
    glowSecondary: 'rgba(220, 38, 38, 0.25)',
    stadiumName: 'Arun Jaitley Stadium',
    city: 'Delhi',
    motto: 'ROAR MACHA • CAPITAL PRIDE',
  },
  pbks: {
    id: 'pbks',
    name: 'Punjab Kings',
    short: 'PBKS',
    primary: '#B91C1C',
    secondary: '#991B1B',
    accent: '#CBD5E1',
    contrastText: '#FFFFFF',
    bgDeep: '#140303',
    bgMid: '#2d0606',
    bgSurface: 'rgba(45, 6, 6, 0.75)',
    cardBg: 'linear-gradient(145deg, rgba(185, 28, 28, 0.32) 0%, rgba(185, 28, 28, 0.12) 50%, rgba(20, 3, 3, 0.92) 100%)',
    cardBorder: 'rgba(185, 28, 28, 0.55)',
    cardGlow: '0 8px 30px rgba(185, 28, 28, 0.22)',
    pillBg: '#B91C1C',
    pillText: '#FFFFFF',
    glowPrimary: 'rgba(185, 28, 28, 0.45)',
    glowSecondary: 'rgba(239, 68, 68, 0.25)',
    stadiumName: 'Maharaja Yadavindra Stadium',
    city: 'Mullanpur',
    motto: 'SADDA PUNJAB • JAZBAA & PASSION',
  },
  lsg: {
    id: 'lsg',
    name: 'Lucknow Super Giants',
    short: 'LSG',
    primary: '#0891B2',
    secondary: '#0E7490',
    accent: '#F97316',
    contrastText: '#FFFFFF',
    bgDeep: '#021014',
    bgMid: '#05232c',
    bgSurface: 'rgba(5, 35, 44, 0.75)',
    cardBg: 'linear-gradient(145deg, rgba(8, 145, 178, 0.32) 0%, rgba(8, 145, 178, 0.12) 50%, rgba(2, 16, 20, 0.92) 100%)',
    cardBorder: 'rgba(8, 145, 178, 0.55)',
    cardGlow: '0 8px 30px rgba(8, 145, 178, 0.22)',
    pillBg: '#0891B2',
    pillText: '#FFFFFF',
    glowPrimary: 'rgba(8, 145, 178, 0.45)',
    glowSecondary: 'rgba(6, 182, 212, 0.25)',
    stadiumName: 'BRSABV Ekana Stadium',
    city: 'Lucknow',
    motto: 'ADAB SE HARAYENGE • SUPER GIANTS',
  },
  gt: {
    id: 'gt',
    name: 'Gujarat Titans',
    short: 'GT',
    primary: '#0D9488',
    secondary: '#0F766E',
    accent: '#EAB308',
    contrastText: '#FFFFFF',
    bgDeep: '#02110f',
    bgMid: '#052522',
    bgSurface: 'rgba(5, 37, 34, 0.75)',
    cardBg: 'linear-gradient(145deg, rgba(13, 148, 136, 0.32) 0%, rgba(13, 148, 136, 0.12) 50%, rgba(2, 17, 15, 0.92) 100%)',
    cardBorder: 'rgba(13, 148, 136, 0.55)',
    cardGlow: '0 8px 30px rgba(13, 148, 136, 0.22)',
    pillBg: '#0D9488',
    pillText: '#FFFFFF',
    glowPrimary: 'rgba(13, 148, 136, 0.45)',
    glowSecondary: 'rgba(20, 184, 166, 0.25)',
    stadiumName: 'Narendra Modi Stadium',
    city: 'Ahmedabad',
    motto: 'AAVA DE • TITANS COURAGE',
  },
}

export function getTeamTheme(teamId?: string): TeamThemeConfig {
  const normalized = (teamId || 'rcb').toLowerCase().trim()
  return TEAM_THEMES[normalized] || TEAM_THEMES.rcb
}

export function getTeamCardStyle(teamId?: string) {
  const t = getTeamTheme(teamId)
  return {
    background: t.cardBg,
    borderColor: t.cardBorder,
    boxShadow: t.cardGlow,
  }
}

export function getTeamPillStyle(teamId?: string, isOutline = false) {
  const t = getTeamTheme(teamId)
  if (isOutline) {
    return {
      background: `${t.primary}20`,
      borderColor: `${t.primary}60`,
      color: t.contrastText === '#000000' ? '#fbbf24' : '#ffffff',
    }
  }
  return {
    backgroundColor: t.pillBg,
    color: t.pillText,
    borderColor: t.primary,
    boxShadow: `0 0 12px ${t.primary}50`,
  }
}
