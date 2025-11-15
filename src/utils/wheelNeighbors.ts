/**
 * European Roulette Wheel Sequence (Racetrack)
 * The complete sequence in clockwise order on the physical wheel
 */
const WHEEL_SEQUENCE = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20,
  14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26,
];

/**
 * Gets the 3 neighbors on each side of a number (7 numbers total)
 * Returns an array: [left3, left2, left1, center, right1, right2, right3]
 */
export function getNeighbors(num: number): number[] {
  const index = WHEEL_SEQUENCE.indexOf(num);
  if (index === -1) {
    return []; // Number not found
  }

  const neighbors: number[] = [];
  const sequenceLength = WHEEL_SEQUENCE.length;

  // Get 3 numbers to the left (counter-clockwise)
  for (let i = 3; i >= 1; i--) {
    const leftIndex = (index - i + sequenceLength) % sequenceLength;
    neighbors.push(WHEEL_SEQUENCE[leftIndex]);
  }

  // Add the center number
  neighbors.push(num);

  // Get 3 numbers to the right (clockwise)
  for (let i = 1; i <= 3; i++) {
    const rightIndex = (index + i) % sequenceLength;
    neighbors.push(WHEEL_SEQUENCE[rightIndex]);
  }

  return neighbors;
}

