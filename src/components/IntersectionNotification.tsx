'use client';

import { useState, useMemo } from 'react';
import { useEntityStore } from '@/stores/useEntityStore';
import { getRouletteColor } from '@/utils/rouletteColors';

export default function IntersectionNotification() {
  const entities = useEntityStore((state) => state.entities);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Get active alerts (entities with score <= 6 that have exceeded threshold)
  const activeAlerts = useMemo(() => {
    return entities.filter(
      (entity) => entity.score <= 6 && entity.lastSeenAgo >= entity.threshold
    );
  }, [entities]);

  // Find numbers that appear in 3 or more active notifications
  const intersectionNumbers = useMemo(() => {
    // Need at least 3 active alerts
    if (activeAlerts.length < 3) {
      return [];
    }

    // Count how many times each number appears across all active alerts
    const numberCounts = new Map<number, number>();
    
    activeAlerts.forEach((alert) => {
      alert.numbers.forEach((num) => {
        numberCounts.set(num, (numberCounts.get(num) || 0) + 1);
      });
    });

    // Find numbers that appear in 3 or more alerts
    const intersection: Array<{ number: number; count: number }> = [];
    numberCounts.forEach((count, number) => {
      if (count >= 3) {
        intersection.push({ number, count });
      }
    });

    // Sort by count (highest first), then by number
    return intersection.sort((a, b) => {
      if (b.count !== a.count) {
        return b.count - a.count;
      }
      return a.number - b.number;
    });
  }, [activeAlerts]);

  // Don't show if dismissed, minimized, or no intersection numbers
  if (isDismissed || intersectionNumbers.length === 0) {
    return null;
  }

  return (
    <div className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
      isMinimized ? 'w-64' : 'w-96'
    }`}>
      <div className="rounded-lg border-4 border-yellow-500 bg-yellow-50 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between bg-yellow-500 px-4 py-3 rounded-t-lg">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            <h3 className="font-bold text-white text-lg">
              Intersection Alert
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-white hover:text-yellow-100 transition-colors"
              title={isMinimized ? 'Expand' : 'Minimize'}
            >
              {isMinimized ? '⬆️' : '⬇️'}
            </button>
            <button
              onClick={() => setIsDismissed(true)}
              className="text-white hover:text-yellow-100 transition-colors font-bold"
              title="Dismiss"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        {!isMinimized && (
          <div className="p-4">
            <p className="text-sm text-gray-700 mb-3">
              <span className="font-bold text-yellow-700">{activeAlerts.length}</span> active notifications.
              The following number{intersectionNumbers.length > 1 ? 's' : ''} appear in{' '}
              <span className="font-bold text-yellow-700">3 or more</span> of them:
            </p>
            
            <div className="space-y-2">
              {intersectionNumbers.map(({ number, count }) => {
                const color = getRouletteColor(number);
                const bgColor = color === 'red' ? 'bg-red-600' : color === 'black' ? 'bg-black' : 'bg-green-600';
                
                return (
                  <div
                    key={number}
                    className="flex items-center justify-between bg-white rounded-lg p-3 border-2 border-yellow-300 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`${bgColor} flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold text-white shadow-md`}>
                        {number}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">Number {number}</p>
                        <p className="text-xs text-gray-600">
                          Appears in <span className="font-bold text-yellow-700">{count}</span> active notification{count > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 p-3 bg-yellow-100 rounded-lg border border-yellow-300">
              <p className="text-xs text-yellow-800 font-medium">
                💡 These numbers are "pinpointed" by multiple cold entities. Consider monitoring them closely.
              </p>
            </div>
          </div>
        )}

        {/* Minimized view */}
        {isMinimized && (
          <div className="p-3">
            <p className="text-sm text-gray-700">
              <span className="font-bold">{intersectionNumbers.length}</span> number{intersectionNumbers.length > 1 ? 's' : ''} in intersection
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

