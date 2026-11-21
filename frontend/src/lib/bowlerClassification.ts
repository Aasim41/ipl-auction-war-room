/**
 * Bowler Style & Role Classification Utilities
 * Accurately identifies Fast Bowlers vs Spin Bowlers across all tournament rosters.
 */

const KNOWN_SPINNERS = new Set([
  'Rashid Khan',
  'Ravi Bishnoi',
  'Yuzvendra Chahal',
  'Kuldeep Yadav',
  'Varun Chakaravarthy',
  'Axar Patel',
  'Ravindra Jadeja',
  'Sunil Narine',
  'R. Ashwin',
  'Ravichandran Ashwin',
  'Krunal Pandya',
  'Suyash Sharma',
  'Rahul Chahar',
  'Noor Ahmad',
  'Maheesh Theekshana',
  'Wanindu Hasaranga',
  'Washington Sundar',
  'Glenn Maxwell',
  'Moeen Ali',
  'Sai Kishore',
  'R. Sai Kishore',
  'Swapnil Singh',
  'Shreyas Gopal',
  'Karn Sharma',
  'Manav Suthar',
  'Kumar Kartikeya',
  'Mayank Markande',
  'Mitchell Santner',
  'Adam Zampa',
  'Tabraiz Shamsi',
  'Allah Ghazanfar',
  'Mujeeb Ur Rahman',
  'Digvesh Rathi',
  'Harpreet Brar',
  'Tanush Kotian',
  'Liam Livingstone',
  'Will Jacks',
  'Vichitra'
])

export function isPlayerSpinner(player: { name?: string; bowlingStyle?: string; statsSummary?: string; role?: string } | null | undefined): boolean {
  if (!player) return false

  const name = player.name || ''
  for (const s of KNOWN_SPINNERS) {
    if (name.toLowerCase().includes(s.toLowerCase())) return true
  }

  const style = (player.bowlingStyle || '').toLowerCase()
  if (
    style.includes('spin') || 
    style.includes('legbreak') || 
    style.includes('orthodox') || 
    style.includes('offbreak') || 
    style.includes('googly') || 
    style.includes('slow')
  ) {
    return true
  }

  const summary = (player.statsSummary || '').toLowerCase()
  if (
    summary.includes('spin') || 
    summary.includes('leg-spin') || 
    summary.includes('off-spin') || 
    summary.includes('wrist-spin') || 
    summary.includes('mystery spin') || 
    summary.includes('turner') || 
    summary.includes('tweaker')
  ) {
    return true
  }

  return false
}

/**
 * Returns formatted role with explicit Fast/Spin Bowler details instead of generic 'BOWL'
 * e.g. "Fast Bowler", "Spin Bowler", "Pace All-Rounder", "Spin All-Rounder", "Wicketkeeper", "Batter"
 */
export function getDetailedPlayerRole(player: { name?: string; role?: string; bowlingStyle?: string; statsSummary?: string } | null | undefined): string {
  if (!player) return 'Squad Player'

  const role = (player.role || '').toUpperCase()
  const isSpin = isPlayerSpinner(player)

  if (role === 'BOWL' || role === 'BOWLER') {
    return isSpin ? 'Spin Bowler' : 'Fast Bowler'
  }

  if (role === 'AR' || role === 'ALL-ROUNDER') {
    return isSpin ? 'Spin All-Rounder' : 'Pace All-Rounder'
  }

  if (role === 'WK' || role === 'WICKETKEEPER') {
    return 'Wicketkeeper'
  }

  return 'Batter'
}

/**
 * Returns compact role badge text (e.g. "Spin", "Fast", "Pace AR", "Spin AR", "WK", "BAT")
 */
export function getCompactRoleBadge(player: { name?: string; role?: string; bowlingStyle?: string; statsSummary?: string } | null | undefined): string {
  if (!player) return 'PLY'

  const role = (player.role || '').toUpperCase()
  const isSpin = isPlayerSpinner(player)

  if (role === 'BOWL' || role === 'BOWLER') {
    return isSpin ? 'Spin' : 'Fast'
  }

  if (role === 'AR' || role === 'ALL-ROUNDER') {
    return isSpin ? 'Spin AR' : 'Pace AR'
  }

  if (role === 'WK' || role === 'WICKETKEEPER') {
    return 'WK'
  }

  return 'BAT'
}
