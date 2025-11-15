'use client';

import { useSessionStore } from '@/stores/useSessionStore';
import { getNumberTags } from '@/utils/numberTags';
import { getNeighbors } from '@/utils/wheelNeighbors';
import { getRouletteColor } from '@/utils/rouletteColors';

export default function SpinHistory() {
  const spinHistory = useSessionStore((state) => state.spinHistory);
  const historyPointer = useSessionStore((state) => state.historyPointer);
  const clearHistory = useSessionStore((state) => state.clearHistory);
  const undoLastSpin = useSessionStore((state) => state.undoLastSpin);
  const redoLastSpin = useSessionStore((state) => state.redoLastSpin);

  // Get the current history based on pointer (for undo/redo)
  const currentHistory =
    historyPointer === -1
      ? spinHistory
      : spinHistory.slice(0, historyPointer + 1);

  // Reverse to show most recent first
  const displayHistory = [...currentHistory].reverse();

  const canUndo = currentHistory.length > 0;
  const canRedo = historyPointer >= 0 && historyPointer < spinHistory.length - 1;

  return (
    <div className="flex flex-col">
      <h2 className="mb-4 text-xl font-semibold text-gray-800">
        Spin History ({currentHistory.length})
      </h2>
      <div className="h-[500px] overflow-y-auto rounded-lg border-2 border-gray-300 bg-gray-50">
        {currentHistory.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-center text-gray-500">No spins yet. Click numbers on the table to start tracking.</p>
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead className="bg-gray-200 sticky top-0">
              <tr>
                <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-gray-800">History</th>
                <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-gray-800">B</th>
                <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-gray-800">C</th>
                <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-gray-800">D</th>
                <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-gray-800">E</th>
                <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-gray-800">F</th>
                <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-gray-800">G</th>
                <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-gray-800">H</th>
                <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-gray-800">I</th>
                <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-gray-800">J</th>
                <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-gray-800">K</th>
                <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-gray-800">L</th>
                <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-gray-800">M</th>
                <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-gray-800">N</th>
              </tr>
            </thead>
            <tbody>
              {displayHistory.map((number, index) => {
                const tags = getNumberTags(number);
                const neighbors = getNeighbors(number);
                const color = getRouletteColor(number);
                const bgColor = color === 'red' ? 'bg-red-600' : color === 'black' ? 'bg-black' : 'bg-green-600';

                return (
                  <tr
                    key={`${number}-${currentHistory.length - index - 1}`}
                    className="bg-white hover:bg-gray-50"
                  >
                    {/* Column A: History (Number) */}
                    <td className="border border-gray-300 px-3 py-2">
                      <div className={`${bgColor} inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white shadow-md`}>
                        {number}
                      </div>
                    </td>
                    {/* Columns B-H: Neighbors */}
                    {neighbors.map((num, neighborIndex) => {
                      const neighborColor = getRouletteColor(num);
                      const neighborBgColor = neighborColor === 'red' ? 'bg-red-600' : neighborColor === 'black' ? 'bg-black' : 'bg-green-600';
                      const isCenter = neighborIndex === 3;
                      
                      return (
                        <td
                          key={`neighbor-${neighborIndex}`}
                          className={`border border-gray-300 px-3 py-2 ${isCenter ? 'bg-blue-50' : ''}`}
                        >
                          <div className={`${neighborBgColor} inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white shadow-md`}>
                            {num}
                          </div>
                        </td>
                      );
                    })}
                    {/* Columns I-N: Tags */}
                    <td className="border border-gray-300 px-3 py-2 text-sm text-gray-800">{tags.color}</td>
                    <td className="border border-gray-300 px-3 py-2 text-sm text-gray-800">{tags.parity}</td>
                    <td className="border border-gray-300 px-3 py-2 text-sm text-gray-800">{tags.range}</td>
                    <td className="border border-gray-300 px-3 py-2 text-sm text-gray-800">{tags.dozen}</td>
                    <td className="border border-gray-300 px-3 py-2 text-sm text-gray-800">{tags.column}</td>
                    <td className="border border-gray-300 px-3 py-2 text-sm text-gray-800">{tags.street}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      <div className="mt-4 flex gap-2">
        <button
          onClick={undoLastSpin}
          disabled={!canUndo}
          className="flex-1 rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Undo
        </button>
        <button
          onClick={redoLastSpin}
          disabled={!canRedo}
          className="flex-1 rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Redo
        </button>
        <button
          onClick={clearHistory}
          disabled={currentHistory.length === 0}
          className="flex-1 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
