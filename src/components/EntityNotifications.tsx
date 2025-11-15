'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useEntityStore } from '@/stores/useEntityStore';
import { useSessionStore } from '@/stores/useSessionStore';
import { getRouletteColor } from '@/utils/rouletteColors';
import { playAlertSound } from '@/utils/soundNotification';

export default function EntityNotifications() {
  const entities = useEntityStore((state) => state.entities);
  const gapMap = useEntityStore((state) => state.gapMap);
  const initializeEntities = useEntityStore((state) => state.initializeEntities);
  const getActiveAlerts = useEntityStore((state) => state.getActiveAlerts);
  const processSpinHistory = useEntityStore((state) => state.processSpinHistory);
  const spinHistory = useSessionStore((state) => state.spinHistory);
  const isInitialized = useEntityStore((state) => state.isInitialized);
  const previousAlertCountRef = useRef(0);

  // Initialize entities on mount
  useEffect(() => {
    if (!isInitialized) {
      initializeEntities();
    }
  }, [isInitialized, initializeEntities]);

  // Process spin history through the Gap Analysis Engine
  useEffect(() => {
    if (isInitialized) {
      // Process history (even if empty - this will reset gaps)
      processSpinHistory(spinHistory);
    }
  }, [spinHistory.length, isInitialized, processSpinHistory, spinHistory]);

  // Get active alerts (entities with score <= 6 that have exceeded threshold)
  // Use useMemo to cache the result and avoid infinite loops
  const activeAlerts = useMemo(() => {
    return entities.filter(
      (entity) => entity.score <= 6 && entity.lastSeenAgo >= entity.threshold
    );
  }, [entities]);

  // Play sound when new alerts appear
  useEffect(() => {
    const currentAlertCount = activeAlerts.length;
    if (currentAlertCount > previousAlertCountRef.current && currentAlertCount > 0) {
      // New alert appeared - play screaming sound
      playAlertSound();
    }
    previousAlertCountRef.current = currentAlertCount;
  }, [activeAlerts.length]);

  // Sort alerts by score (lowest first = most pinpointed) then by gap (highest first)
  const sortedAlerts = [...activeAlerts].sort((a, b) => {
    if (a.score !== b.score) {
      return a.score - b.score; // Lower score first
    }
    return b.lastSeenAgo - a.lastSeenAgo; // Higher gap first
  });

  if (sortedAlerts.length === 0) {
    return (
      <div className="rounded-lg border-2 border-gray-300 bg-gray-50 p-4">
        <h3 className="mb-3 text-lg font-semibold text-gray-800">Entity Notifications</h3>
        <p className="text-sm text-gray-500">No active alerts. All entities are within expected ranges.</p>
        <p className="mt-2 text-xs text-gray-400">
          Tracking {entities.length} entities. Alerts trigger when entities with 6 or fewer numbers exceed 3x their expected gap.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border-2 border-red-500 bg-red-50 p-4 shadow-lg">
      <h3 className="mb-3 text-lg font-semibold text-red-800">
        ⚠️ Active Alerts ({sortedAlerts.length})
      </h3>
      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {sortedAlerts.map((entity) => (
          <div
            key={entity.id}
            className="rounded-lg border-2 border-red-300 bg-white p-3 shadow-sm"
          >
            <div className="mb-2">
              <h4 className="font-bold text-red-700">{entity.name}</h4>
              <p className="text-xs text-gray-600">
                Score: {entity.score} numbers | Expected gap: ~{entity.expectedGap.toFixed(1)} spins | Threshold: {entity.threshold.toFixed(0)} spins
              </p>
            </div>
            <div className="mb-2">
              <p className="text-sm font-semibold text-red-600">
                ⚠️ Has not hit in <span className="text-lg">{entity.lastSeenAgo}</span> spins
                {entity.lastSeenAgo >= entity.threshold && (
                  <span className="ml-2 text-xs">({((entity.lastSeenAgo / entity.expectedGap).toFixed(1))}x expected)</span>
                )}
              </p>
            </div>
            <div className="flex flex-wrap gap-1">
              <span className="text-xs text-gray-600 mr-1">Numbers:</span>
              {entity.numbers.map((num) => {
                const color = getRouletteColor(num);
                const bgColor = color === 'red' ? 'bg-red-600' : color === 'black' ? 'bg-black' : 'bg-green-600';
                return (
                  <div
                    key={num}
                    className={`${bgColor} flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm`}
                  >
                    {num}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

