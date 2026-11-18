/**
 * Player Name Formatter Utility
 * Formats full names to proper cricket broadcast display names with first initial + last name:
 * e.g. "Virat Kohli" -> "V. Kohli"
 * e.g. "MS Dhoni" -> "M.S. Dhoni"
 * e.g. "Jasprit Bumrah" -> "J. Bumrah"
 * e.g. "Ruturaj Gaikwad" -> "R. Gaikwad"
 * e.g. "Ravi Bishnoi" -> "R. Bishnoi"
 * e.g. "KL Rahul" -> "K.L. Rahul"
 * e.g. "AB de Villiers" -> "A.B. de Villiers"
 */

export function formatPlayerInitial(fullName?: string): string {
  if (!fullName) return '';
  const trimmed = fullName.trim();
  const parts = trimmed.split(/\s+/);
  if (parts.length <= 1) return trimmed;

  // Already formatted with initial like "V. Kohli"
  if (/^[A-Z]\.?$/i.test(parts[0])) {
    return `${parts[0].replace('.', '')}. ${parts.slice(1).join(' ')}`;
  }

  // Double/Triple uppercase initial like "MS Dhoni" -> "M.S. Dhoni" or "KL Rahul" -> "K.L. Rahul"
  if (/^[A-Z]{2,3}$/.test(parts[0])) {
    const initials = parts[0].split('').join('.') + '.';
    return `${initials} ${parts.slice(1).join(' ')}`;
  }

  // Multi-initial like "A.B. de Villiers"
  if (parts[0].includes('.')) {
    return `${parts[0]} ${parts.slice(1).join(' ')}`;
  }

  // Standard first name -> First Initial + Rest of Name
  const initial = parts[0][0].toUpperCase() + '.';
  return `${initial} ${parts.slice(1).join(' ')}`;
}
