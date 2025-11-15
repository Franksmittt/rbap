'use client';

import { getNumberTags } from '@/utils/numberTags';
import { getRouletteColor } from '@/utils/rouletteColors';

interface NumberTagsProps {
  number: number | null;
}

export default function NumberTags({ number }: NumberTagsProps) {
  if (number === null) {
    return (
      <div className="rounded-lg border-2 border-gray-300 bg-gray-50 p-4">
        <h3 className="mb-3 text-lg font-semibold text-gray-800">Number Tags</h3>
        <p className="text-sm text-gray-500">Click a number on the table to see its tags</p>
      </div>
    );
  }

  const tags = getNumberTags(number);
  const color = getRouletteColor(number);
  const bgColor = color === 'red' ? 'bg-red-600' : color === 'black' ? 'bg-black' : 'bg-green-600';

  return (
    <div className="rounded-lg border-2 border-gray-300 bg-white p-4 shadow-md">
      <h3 className="mb-3 text-lg font-semibold text-gray-800">Number Tags</h3>
      <div className="flex items-center gap-3 flex-wrap">
        <div className={`${bgColor} flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white shadow-md`}>
          {number}
        </div>
        <span className="px-2 py-1 rounded bg-gray-100 text-sm font-medium text-gray-800">{tags.color}</span>
        <span className="px-2 py-1 rounded bg-gray-100 text-sm font-medium text-gray-800">{tags.parity}</span>
        <span className="px-2 py-1 rounded bg-gray-100 text-sm font-medium text-gray-800">{tags.range}</span>
        <span className="px-2 py-1 rounded bg-gray-100 text-sm font-medium text-gray-800">{tags.dozen}</span>
        <span className="px-2 py-1 rounded bg-gray-100 text-sm font-medium text-gray-800">{tags.column}</span>
        <span className="px-2 py-1 rounded bg-gray-100 text-sm font-medium text-gray-800">{tags.street}</span>
      </div>
    </div>
  );
}

