import { useEffect, useRef } from 'react';
import { useTrackerStore } from '@/stores/useTrackerStore';
import { useSessionStore } from '@/stores/useSessionStore';
import { calculateLongestGap } from '@/utils/gapAnalysis';

const MIN_SPINS_FOR_AUTO_THRESHOLD = 30;

/**
 * Hook that automatically updates tracker thresholds based on longest gap
 * Only activates after 30 spins have been recorded
 */
export function useAutoThreshold() {
  const trackers = useTrackerStore((state) => state.trackers);
  const updateTracker = useTrackerStore((state) => state.updateTracker);
  const spinHistory = useSessionStore((state) => state.spinHistory);
  const historyPointer = useSessionStore((state) => state.historyPointer);

  // Use refs to store stable references
  const trackersRef = useRef(trackers);
  const updateTrackerRef = useRef(updateTracker);
  const spinHistoryRef = useRef(spinHistory);

  // Update refs when values change
  useEffect(() => {
    trackersRef.current = trackers;
    updateTrackerRef.current = updateTracker;
    spinHistoryRef.current = spinHistory;
  }, [trackers, updateTracker, spinHistory]);

  useEffect(() => {
    // Get current history based on pointer
    const currentHistory =
      historyPointer === -1
        ? spinHistoryRef.current
        : spinHistoryRef.current.slice(0, historyPointer + 1);

    // Only start auto-updating after we have at least 30 spins
    if (currentHistory.length < MIN_SPINS_FOR_AUTO_THRESHOLD) {
      return;
    }

    // Update thresholds for all trackers based on their longest gap
    trackersRef.current.forEach((tracker) => {
      // Only auto-update if useAutoThreshold is true (default to true for prebuilt strategies)
      const shouldAutoUpdate = tracker.useAutoThreshold !== false;

      if (shouldAutoUpdate) {
        const longestGap = calculateLongestGap(currentHistory, tracker.numbers);

        // Only update if the longest gap is greater than current threshold
        // Threshold can only go up, never down
        if (longestGap > tracker.threshold && longestGap > 0) {
          updateTrackerRef.current(tracker.id, { threshold: longestGap });
        }
      }
    });
  }, [spinHistory.length, historyPointer]);
}

