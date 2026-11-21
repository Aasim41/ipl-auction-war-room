export interface TeamThemeConfig {
  id: string
  name: string
  short: string
  primary: string        // Hex
  secondary: string      // Hex
  accent: string         // Hex
  contrastText: string   // Crisp text color (#000000 or #FFFFFF) on top of primary
  bgDeep: string         // Deep solid dark team backdrop
  bgMid: string          // Intermediate atmospheric shade
  bgSurface: string      // Surface tint
  cardBg: string         // Solid team card color with subtle light gradient
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
    primary: '#FF5500',
    secondary: '#FF6E40',
    accent: '#FBBF24',
    contrastText: '#FFFFFF',
    bgDeep: '#180700',
    bgMid: '#2B0E03',
    bgSurface: '#FF5500',
    cardBg: 'linear-gradient(180deg, #F4511E 0%, #D84315 100%)',
    cardBorder: '#FF7043',
    cardGlow: '0 6px 24px rgba(244, 81, 30, 0.45)',
    pillBg: '#FF5500',
    pillText: '#FFFFFF',
    glowPrimary: 'rgba(255, 85, 0, 0.55)',
    glowSecondary: 'rgba(255, 110, 64, 0.35)',
    stadiumName: 'Rajiv Gandhi Stadium',
    city: 'Hyderabad',
    motto: 'ORANGE ARMY • FIRE & PASSION',
  },
  csk: {
    id: 'csk',
    name: 'Chennai Super Kings',
    short: 'CSK',
    primary: '#FFC000',
    secondary: '#FACC15',
    accent: '#3B82F6',
    contrastText: '#000000',
    bgDeep: '#1A1400',
    bgMid: '#2E2202',
    bgSurface: '#FFC000',
    cardBg: 'linear-gradient(180deg, #EAB308 0%, #CA8A04 100%)',
    cardBorder: '#FDE047',
    cardGlow: '0 6px 24px rgba(234, 179, 8, 0.45)',
    pillBg: '#FFC000',
    pillText: '#000000',
    glowPrimary: 'rgba(255, 192, 0, 0.55)',
    glowSecondary: 'rgba(250, 204, 21, 0.35)',
    stadiumName: 'M. A. Chidambaram Stadium',
    city: 'Chennai',
    motto: 'WHISTLE PODU • YELLOVE',
  },
  mi: {
    id: 'mi',
    name: 'Mumbai Indians',
    short: 'MI',
    primary: '#0055FF',
    secondary: '#1D4ED8',
    accent: '#EAB308',
    contrastText: '#FFFFFF',
    bgDeep: '#000E29',
    bgMid: '#051B44',
    bgSurface: '#0055FF',
    cardBg: 'linear-gradient(180deg, #1D4ED8 0%, #172554 100%)',
    cardBorder: '#60A5FA',
    cardGlow: '0 6px 24px rgba(29, 78, 216, 0.45)',
    pillBg: '#0055FF',
    pillText: '#FFFFFF',
    glowPrimary: 'rgba(0, 85, 255, 0.55)',
    glowSecondary: 'rgba(96, 165, 250, 0.35)',
    stadiumName: 'Wankhede Stadium',
    city: 'Mumbai',
    motto: 'DUNIYA HILA DENGE • ONE FAMILY',
  },
  rcb: {
    id: 'rcb',
    name: 'Royal Challengers Bengaluru',
    short: 'RCB',
    primary: '#E60000',
    secondary: '#DC2626',
    accent: '#FBBF24',
    contrastText: '#FFFFFF',
    bgDeep: '#1F0004',
    bgMid: '#36050C',
    bgSurface: '#E60000',
    cardBg: 'linear-gradient(180deg, #DC2626 0%, #7F1D1D 100%)',
    cardBorder: '#F87171',
    cardGlow: '0 6px 24px rgba(220, 38, 38, 0.45)',
    pillBg: '#E60000',
    pillText: '#FFFFFF',
    glowPrimary: 'rgba(230, 0, 0, 0.55)',
    glowSecondary: 'rgba(248, 113, 113, 0.35)',
    stadiumName: 'M. Chinnaswamy Stadium',
    city: 'Bengaluru',
    motto: 'PLAY BOLD • EE SALA CUP NAMDE',
  },
  kkr: {
    id: 'kkr',
    name: 'Kolkata Knight Riders',
    short: 'KKR',
    primary: '#8B14D9',
    secondary: '#7C3AED',
    accent: '#F59E0B',
    contrastText: '#FFFFFF',
    bgDeep: '#160029',
    bgMid: '#2B044D',
    bgSurface: '#8B14D9',
    cardBg: 'linear-gradient(180deg, #7C3AED 0%, #4C1D95 100%)',
    cardBorder: '#C084FC',
    cardGlow: '0 6px 24px rgba(124, 58, 237, 0.45)',
    pillBg: '#8B14D9',
    pillText: '#FFFFFF',
    glowPrimary: 'rgba(139, 20, 217, 0.55)',
    glowSecondary: 'rgba(192, 132, 252, 0.35)',
    stadiumName: 'Eden Gardens',
    city: 'Kolkata',
    motto: 'KORBO LORBO JEETBO RE • PURPLE & GOLD',
  },
  rr: {
    id: 'rr',
    name: 'Rajasthan Royals',
    short: 'RR',
    primary: '#FF1493',
    secondary: '#EC4899',
    accent: '#2563EB',
    contrastText: '#FFFFFF',
    bgDeep: '#260017',
    bgMid: '#420329',
    bgSurface: '#FF1493',
    cardBg: 'linear-gradient(180deg, #EC4899 0%, #9D174D 100%)',
    cardBorder: '#F472B6',
    cardGlow: '0 6px 24px rgba(236, 72, 153, 0.45)',
    pillBg: '#FF1493',
    pillText: '#FFFFFF',
    glowPrimary: 'rgba(255, 20, 147, 0.55)',
    glowSecondary: 'rgba(244, 114, 182, 0.35)',
    stadiumName: 'Sawai Mansingh Stadium',
    city: 'Jaipur',
    motto: 'HALLA BOL • ROYAL HERITAGE',
  },
  dc: {
    id: 'dc',
    name: 'Delhi Capitals',
    short: 'DC',
    primary: '#00A2FF',
    secondary: '#0284C7',
    accent: '#DC2626',
    contrastText: '#FFFFFF',
    bgDeep: '#00182E',
    bgMid: '#032B4F',
    bgSurface: '#00A2FF',
    cardBg: 'linear-gradient(180deg, #0284C7 0%, #075985 100%)',
    cardBorder: '#38BDF8',
    cardGlow: '0 6px 24px rgba(2, 132, 199, 0.45)',
    pillBg: '#00A2FF',
    pillText: '#FFFFFF',
    glowPrimary: 'rgba(0, 162, 255, 0.55)',
    glowSecondary: 'rgba(56, 189, 248, 0.35)',
    stadiumName: 'Arun Jaitley Stadium',
    city: 'Delhi',
    motto: 'ROAR MACHA • CAPITAL PRIDE',
  },
  pbks: {
    id: 'pbks',
    name: 'Punjab Kings',
    short: 'PBKS',
    primary: '#C80000',
    secondary: '#B91C1C',
    accent: '#E2E8F0',
    contrastText: '#FFFFFF',
    bgDeep: '#1F0000',
    bgMid: '#380505',
    bgSurface: '#C80000',
    cardBg: 'linear-gradient(180deg, #B91C1C 0%, #701010 100%)',
    cardBorder: '#EF4444',
    cardGlow: '0 6px 24px rgba(185, 28, 28, 0.45)',
    pillBg: '#C80000',
    pillText: '#FFFFFF',
    glowPrimary: 'rgba(200, 0, 0, 0.55)',
    glowSecondary: 'rgba(239, 68, 68, 0.35)',
    stadiumName: 'Maharaja Yadavindra Stadium',
    city: 'Mullanpur',
    motto: 'SADDA PUNJAB • JAZBAA & PASSION',
  },
  lsg: {
    id: 'lsg',
    name: 'Lucknow Super Giants',
    short: 'LSG',
    primary: '#00C2CB',
    secondary: '#0891B2',
    accent: '#F97316',
    contrastText: '#000000',
    bgDeep: '#001C20',
    bgMid: '#02333A',
    bgSurface: '#00C2CB',
    cardBg: 'linear-gradient(180deg, #0891B2 0%, #155E75 100%)',
    cardBorder: '#22D3EE',
    cardGlow: '0 6px 24px rgba(8, 145, 178, 0.45)',
    pillBg: '#00C2CB',
    pillText: '#000000',
    glowPrimary: 'rgba(0, 194, 203, 0.55)',
    glowSecondary: 'rgba(34, 211, 238, 0.35)',
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
    bgDeep: '#001A18',
    bgMid: '#032E2A',
    bgSurface: '#0D9488',
    cardBg: 'linear-gradient(180deg, #0F766E 0%, #134E4A 100%)',
    cardBorder: '#2DD4BF',
    cardGlow: '0 6px 24px rgba(15, 118, 110, 0.45)',
    pillBg: '#0D9488',
    pillText: '#FFFFFF',
    glowPrimary: 'rgba(13, 148, 136, 0.55)',
    glowSecondary: 'rgba(45, 212, 191, 0.35)',
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
      background: `${t.bgDeep}`,
      borderColor: t.cardBorder,
      color: t.contrastText,
    }
  }
  return {
    backgroundColor: t.pillBg,
    color: t.pillText,
    borderColor: t.cardBorder,
    boxShadow: `0 2px 10px ${t.glowPrimary}`,
  }
}
