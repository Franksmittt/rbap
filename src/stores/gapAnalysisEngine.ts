/**
 * The "Gap Analysis Engine" - The Core Logic
 * Uses "Map-Then-Analyze" design pattern
 * Runs on every spin and updates status of every entity
 */

export interface EntityGapData {
  lastSeenAgo: number; // Spins since last hit
  longestGap: number; // Longest streak without a hit in history
  hitMissHistory: number[]; // Binary history: 1 = hit, 0 = miss
}

export interface GapMap {
  [entityId: string]: EntityGapData;
}

/**
 * Map spin history to binary hit/miss for a specific entity
 * This is the "MAP" step in Map-Then-Analyze
 */
function mapHistoryToBinary(spinHistory: number[], entityNumbers: number[]): number[] {
  return spinHistory.map((spin) => (entityNumbers.includes(spin) ? 1 : 0));
}

/**
 * Analyze binary history to calculate gaps
 * This is the "ANALYZE" step in Map-Then-Analyze
 */
function analyzeGaps(binaryHistory: number[]): { lastSeenAgo: number; longestGap: number } {
  let lastSeenAgo = -1; // Use -1 to distinguish "not found yet" from "found at position 0"
  let longestGap = 0;
  let currentGap = 0;

  // Work backwards from most recent spin
  for (let i = binaryHistory.length - 1; i >= 0; i--) {
    if (binaryHistory[i] === 1) {
      // Found a hit
      longestGap = Math.max(longestGap, currentGap);
      if (lastSeenAgo === -1) {
        // This is the most recent hit
        lastSeenAgo = binaryHistory.length - 1 - i;
      }
      currentGap = 0;
    } else {
      // Miss - increment current gap
      currentGap++;
    }
  }

  // Check if current gap extends to the beginning
  longestGap = Math.max(longestGap, currentGap);

  // If no hit found in entire history, lastSeenAgo = total history length
  if (lastSeenAgo === -1) {
    lastSeenAgo = binaryHistory.length;
  }

  return { lastSeenAgo, longestGap };
}

/**
 * Process a single entity through the Map-Then-Analyze pipeline
 */
function processEntity(
  entityId: string,
  entityNumbers: number[],
  spinHistory: number[],
  existingGapData?: EntityGapData
): EntityGapData {
  // MAP: Transform spin history to binary hit/miss
  const binaryHistory = mapHistoryToBinary(spinHistory, entityNumbers);

  // If we have existing data, merge with new history
  const fullBinaryHistory = existingGapData
    ? [...existingGapData.hitMissHistory, ...binaryHistory]
    : binaryHistory;

  // ANALYZE: Calculate gaps from binary history
  const { lastSeenAgo, longestGap } = analyzeGaps(fullBinaryHistory);

  return {
    lastSeenAgo,
    longestGap,
    hitMissHistory: fullBinaryHistory,
  };
}

/**
 * The Gap Analysis Engine
 * Processes all entities and produces the gap map
 */
export class GapAnalysisEngine {
  private gapMap: GapMap = {};

  /**
   * Process all entities and update the gap map
   * This runs on every spin
   * Processes the ENTIRE history fresh (no merging with existing data)
   */
  processAllEntities(
    entities: Array<{ id: string; numbers: number[] }>,
    spinHistory: number[]
  ): GapMap {
    const newGapMap: GapMap = {};

    entities.forEach((entity) => {
      // Process fresh - don't merge with existing data since we're processing entire history
      newGapMap[entity.id] = processEntity(
        entity.id,
        entity.numbers,
        spinHistory,
        undefined // Don't use existing data - process entire history fresh
      );
    });

    this.gapMap = newGapMap;
    return this.gapMap;
  }

  /**
   * Get the current gap map
   */
  getGapMap(): GapMap {
    return this.gapMap;
  }

  /**
   * Reset the engine (clear all gap data)
   */
  reset(): void {
    this.gapMap = {};
  }

  /**
   * Process only new spins (incremental update)
   * More efficient than reprocessing entire history
   */
  processNewSpins(
    entities: Array<{ id: string; numbers: number[] }>,
    newSpins: number[]
  ): GapMap {
    // For incremental updates, we append to existing binary history
    entities.forEach((entity) => {
      const existing = this.gapMap[entity.id] || {
        lastSeenAgo: 0,
        longestGap: 0,
        hitMissHistory: [],
      };

      // Map new spins to binary
      const newBinary = mapHistoryToBinary(newSpins, entity.numbers);
      const fullBinaryHistory = [...existing.hitMissHistory, ...newBinary];

      // Re-analyze
      const { lastSeenAgo, longestGap } = analyzeGaps(fullBinaryHistory);

      this.gapMap[entity.id] = {
        lastSeenAgo,
        longestGap,
        hitMissHistory: fullBinaryHistory,
      };
    });

    return this.gapMap;
  }
}

