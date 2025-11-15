/**
 * Calculates the number of spins since a number in the target group was last seen
 */
export function calculateSpinsSinceHit(
  spinHistory: number[],
  targetNumbers: number[]
): number {
  if (spinHistory.length === 0) {
    return 0;
  }

  // Start from the most recent spin and work backwards
  for (let i = spinHistory.length - 1; i >= 0; i--) {
    if (targetNumbers.includes(spinHistory[i])) {
      // Found a hit, return the number of spins since then
      return spinHistory.length - 1 - i;
    }
  }

  // No hit found in history, return the full length
  return spinHistory.length;
}

/**
 * Calculates the longest gap (streak without a hit) for the target numbers
 */
export function calculateLongestGap(
  spinHistory: number[],
  targetNumbers: number[]
): number {
  if (spinHistory.length === 0) {
    return 0;
  }

  let longestGap = 0;
  let currentGap = 0;

  for (let i = spinHistory.length - 1; i >= 0; i--) {
    if (targetNumbers.includes(spinHistory[i])) {
      // Found a hit, reset current gap
      longestGap = Math.max(longestGap, currentGap);
      currentGap = 0;
    } else {
      // No hit, increment gap
      currentGap++;
    }
  }

  // Check if the current gap extends to the beginning
  longestGap = Math.max(longestGap, currentGap);

  return longestGap;
}

/**
 * Parses a comma-separated string of numbers into an array
 */
export function parseNumbers(input: string): number[] {
  return input
    .split(',')
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => !isNaN(n) && n >= 0 && n <= 36);
}

