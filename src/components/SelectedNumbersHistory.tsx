'use client';

import { useSessionStore } from '@/stores/useSessionStore';
import { getNumberTags } from '@/utils/numberTags';
import { getNeighbors } from '@/utils/wheelNeighbors';
import { getRouletteColor } from '@/utils/rouletteColors';

export default function SelectedNumbersHistory() {
  const selectedNumbersHistory = useSessionStore((state) => state.selectedNumbersHistory);

  if (selectedNumbersHistory.length === 0) {
    return (
      <div className="rounded-lg border-2 border-gray-300 bg-gray-50 p-4">
        <h3 className="mb-3 text-lg font-semibold text-gray-800">Selected Numbers History</h3>
        <p className="text-sm text-gray-500">No numbers selected yet</p>
      </div>
    );
  }

  // Show last 20 selections (most recent first)
  const recentSelections = selectedNumbersHistory.slice(-20).reverse();

  return (
    <div className="rounded-lg border-2 border-gray-300 bg-white p-4 shadow-md">
      <h3 className="mb-4 text-lg font-semibold text-gray-800">
        Selected Numbers History ({selectedNumbersHistory.length} total)
      </h3>
      <div className="space-y-4 max-h-[600px] overflow-y-auto">
        {recentSelections.map((number, index) => {
          const tags = getNumberTags(number);
          const neighbors = getNeighbors(number);
          const color = getRouletteColor(number);
          const bgColor = color === 'red' ? 'bg-red-600' : color === 'black' ? 'bg-black' : 'bg-green-600';

          return (
            <div key={`${number}-${selectedNumbersHistory.length - recentSelections.length + index}`} className="border-b border-gray-200 pb-3 last:border-b-0">
              <div className="mb-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className={`${bgColor} flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white shadow-md`}>
                    {number}
                  </div>
                  <span className="px-2 py-1 rounded bg-gray-100 text-xs font-medium text-gray-800">{tags.color}</span>
                  <span className="px-2 py-1 rounded bg-gray-100 text-xs font-medium text-gray-800">{tags.parity}</span>
                  <span className="px-2 py-1 rounded bg-gray-100 text-xs font-medium text-gray-800">{tags.range}</span>
                  <span className="px-2 py-1 rounded bg-gray-100 text-xs font-medium text-gray-800">{tags.dozen}</span>
                  <span className="px-2 py-1 rounded bg-gray-100 text-xs font-medium text-gray-800">{tags.column}</span>
                  <span className="px-2 py-1 rounded bg-gray-100 text-xs font-medium text-gray-800">{tags.street}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {neighbors.map((num, neighborIndex) => {
                  const neighborColor = getRouletteColor(num);
                  const neighborBgColor = neighborColor === 'red' ? 'bg-red-600' : neighborColor === 'black' ? 'bg-black' : 'bg-green-600';
                  const isCenter = neighborIndex === 3;
                  
                  return (
                    <div
                      key={`${num}-${neighborIndex}`}
                      className={`${neighborBgColor} flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white shadow-md ${
                        isCenter ? 'ring-2 ring-blue-400 ring-offset-1' : ''
                      }`}
                    >
                      {num}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

