'use client';

import { getNeighbors } from '@/utils/wheelNeighbors';
import { getRouletteColor } from '@/utils/rouletteColors';

interface NumberNeighborsProps {
  number: number | null;
}

export default function NumberNeighbors({ number }: NumberNeighborsProps) {
  if (number === null) {
    return (
      <div className="rounded-lg border-2 border-gray-300 bg-gray-50 p-4">
        <h3 className="mb-3 text-lg font-semibold text-gray-800">3 Neighbors</h3>
        <p className="text-sm text-gray-500">Click a number on the table to see its neighbors</p>
      </div>
    );
  }

  const neighbors = getNeighbors(number);

  return (
    <div className="rounded-lg border-2 border-gray-300 bg-white p-4 shadow-md">
      <h3 className="mb-3 text-lg font-semibold text-gray-800">3 Neighbors</h3>
      <div className="flex items-center gap-2 flex-wrap">
        {neighbors.map((num, index) => {
          const color = getRouletteColor(num);
          const bgColor = color === 'red' ? 'bg-red-600' : color === 'black' ? 'bg-black' : 'bg-green-600';
          const isCenter = index === 3;
          
          return (
            <div
              key={`${num}-${index}`}
              className={`${bgColor} flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white shadow-md ${
                isCenter ? 'ring-2 ring-blue-400 ring-offset-2' : ''
              }`}
              title={isCenter ? 'Selected number' : index < 3 ? `Left neighbor ${3 - index}` : `Right neighbor ${index - 3}`}
            >
              {num}
            </div>
          );
        })}
      </div>
    </div>
  );
}

