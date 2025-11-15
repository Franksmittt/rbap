'use client';

import { useTrackerStore } from '@/stores/useTrackerStore';
import { useSessionStore } from '@/stores/useSessionStore';
import { calculateSpinsSinceHit } from '@/utils/gapAnalysis';
import { getRouletteColor } from '@/utils/rouletteColors';

export default function StrategyIntersection() {
  const trackers = useTrackerStore((state) => state.trackers);
  const spinHistory = useSessionStore((state) => state.spinHistory);
  const historyPointer = useSessionStore((state) => state.historyPointer);

  // Get current history based on pointer
  const currentHistory =
    historyPointer === -1
      ? spinHistory
      : spinHistory.slice(0, historyPointer + 1);

  // Find all triggered strategies
  const triggeredStrategies = trackers.filter((tracker) => {
    const spinsSinceHit = calculateSpinsSinceHit(currentHistory, tracker.numbers);
    return spinsSinceHit > tracker.threshold;
  });

  // Count how many triggered strategies contain each number
  const numberCounts = new Map<number, number>();
  
  triggeredStrategies.forEach((strategy) => {
    strategy.numbers.forEach((num) => {
      numberCounts.set(num, (numberCounts.get(num) || 0) + 1);
    });
  });

  // Find numbers that appear in at least 4 triggered strategies
  const commonNumbers = Array.from(numberCounts.entries())
    .filter(([_, count]) => count >= 4)
    .map(([num, count]) => ({ num, count }))
    .sort((a, b) => b.count - a.count); // Sort by count descending

  return (
    <div className="rounded-lg border-2 border-blue-500 bg-blue-50 p-4 shadow-lg">
      <h3 className="mb-3 text-lg font-bold text-gray-800">
        Common Numbers (≥4 Strategies)
      </h3>
      {triggeredStrategies.length === 0 ? (
        <p className="text-sm text-gray-600">No strategies triggered yet.</p>
      ) : triggeredStrategies.length < 4 ? (
        <p className="text-sm text-gray-600">
          {triggeredStrategies.length} strategy/strategies triggered. Need at least 4 to show common numbers.
        </p>
      ) : commonNumbers.length === 0 ? (
        <p className="text-sm text-gray-600">
          {triggeredStrategies.length} strategies triggered, but no numbers appear in 4+ strategies.
        </p>
      ) : (
        <div>
          <p className="mb-2 text-xs text-gray-600">
            {triggeredStrategies.length} strategies triggered. Numbers appearing in 4+ strategies:
          </p>
          <div className="flex flex-wrap gap-2">
            {commonNumbers.map(({ num, count }) => {
              const color = getRouletteColor(num);
              const bgColor = color === 'red' ? 'bg-red-600' : color === 'black' ? 'bg-black' : 'bg-green-600';
              
              return (
                <div
                  key={num}
                  className={`${bgColor} flex h-10 w-10 items-center justify-center rounded-full text-white shadow-md`}
                  title={`Appears in ${count} triggered strategies`}
                >
                  <span className="text-lg font-bold">{num}</span>
                </div>
              );
            })}
          </div>
          {commonNumbers.length > 0 && (
            <p className="mt-2 text-xs text-gray-500">
              Hover over numbers to see how many strategies contain them
            </p>
          )}
        </div>
      )}
    </div>
  );
}

