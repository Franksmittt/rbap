'use client';

import { useSessionStore } from '@/stores/useSessionStore';
import { getRouletteColor } from '@/utils/rouletteColors';

// Sequential layout: 0 at top, then 1-36 in rows of 3
// 1, 2, 3
// 4, 5, 6
// etc.
const ROULETTE_NUMBERS: number[] = [];
for (let i = 1; i <= 36; i++) {
  ROULETTE_NUMBERS.push(i);
}

export default function RouletteTable() {
  const addSpin = useSessionStore((state) => state.addSpin);

  const handleNumberClick = (number: number) => {
    addSpin(number);
  };

  return (
    <div className="w-full max-w-md">
      <h2 className="mb-3 text-lg font-semibold text-gray-800">Interactive Roulette Table</h2>
      <div className="rounded-lg border-2 border-gray-300 bg-green-800 p-3">
        {/* Zero pocket at the top */}
        <div className="mb-1.5 flex justify-center">
          <button
            onClick={() => handleNumberClick(0)}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-green-700 text-lg font-bold text-white shadow-lg transition-all hover:scale-110 hover:bg-green-600 active:scale-95"
          >
            0
          </button>
        </div>

        {/* Main grid: 3 columns x 12 rows */}
        <div className="grid grid-cols-3 gap-0.5">
          {ROULETTE_NUMBERS.map((num) => {
            const color = getRouletteColor(num);
            const bgColor = color === 'red' ? 'bg-red-600' : color === 'black' ? 'bg-black' : 'bg-green-600';
            const hoverColor = color === 'red' ? 'hover:bg-red-500' : color === 'black' ? 'hover:bg-gray-800' : 'hover:bg-green-500';

            return (
              <button
                key={num}
                onClick={() => handleNumberClick(num)}
                className={`${bgColor} ${hoverColor} flex h-8 items-center justify-center rounded text-sm font-semibold text-white shadow-md transition-all hover:scale-105 active:scale-95`}
              >
                {num}
              </button>
            );
          })}
        </div>
      </div>
      <p className="mt-1.5 text-xs text-gray-600">Click a number to add it to your spin history</p>
    </div>
  );
}

