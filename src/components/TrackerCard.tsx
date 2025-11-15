'use client';

import { useState } from 'react';
import { Tracker } from '@/stores/useTrackerStore';
import { useTrackerStore } from '@/stores/useTrackerStore';
import { useSessionStore } from '@/stores/useSessionStore';
import { calculateSpinsSinceHit, calculateLongestGap, parseNumbers } from '@/utils/gapAnalysis';

interface TrackerCardProps {
  tracker: Tracker;
}

export default function TrackerCard({ tracker }: TrackerCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(tracker.name);
  const [numbersInput, setNumbersInput] = useState(tracker.numbers.join(', '));
  const [threshold, setThreshold] = useState(tracker.threshold);

  const updateTracker = useTrackerStore((state) => state.updateTracker);
  const deleteTracker = useTrackerStore((state) => state.deleteTracker);
  const spinHistory = useSessionStore((state) => state.spinHistory);

  // Calculate current stats
  const spinsSinceHit = calculateSpinsSinceHit(spinHistory, tracker.numbers);
  const longestGap = calculateLongestGap(spinHistory, tracker.numbers);
  const isTriggered = spinsSinceHit > tracker.threshold;

  const handleSave = () => {
    const parsedNumbers = parseNumbers(numbersInput);
    if (parsedNumbers.length > 0) {
      updateTracker(tracker.id, {
        name,
        numbers: parsedNumbers,
        threshold,
      });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setName(tracker.name);
    setNumbersInput(tracker.numbers.join(', '));
    setThreshold(tracker.threshold);
    setIsEditing(false);
  };

  return (
    <div
      className={`rounded-lg border-2 p-4 shadow-lg transition-all ${
        isTriggered
          ? 'border-red-500 bg-red-50 shadow-red-200 ring-2 ring-red-200'
          : 'border-gray-300 bg-white shadow-gray-200'
      }`}
    >
      {isEditing ? (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm"
              placeholder="e.g., My 3s"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700">Numbers</label>
            <input
              type="text"
              value={numbersInput}
              onChange={(e) => setNumbersInput(e.target.value)}
              className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm"
              placeholder="3, 4, 5"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700">Trigger</label>
            <input
              type="number"
              value={threshold}
              onChange={(e) => setThreshold(parseInt(e.target.value, 10) || 0)}
              min="1"
              className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm"
            />
            <span className="mt-1 block text-xs text-gray-500">spins</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex-1 rounded bg-blue-500 px-2 py-1 text-xs text-white transition-colors hover:bg-blue-600"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 rounded bg-gray-300 px-2 py-1 text-xs text-gray-700 transition-colors hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-800 truncate">{tracker.name}</h3>
            <div className="flex gap-1">
              <button
                onClick={() => setIsEditing(true)}
                className="rounded bg-gray-200 px-2 py-1 text-xs text-gray-700 transition-colors hover:bg-gray-300"
              >
                Edit
              </button>
              <button
                onClick={() => deleteTracker(tracker.id)}
                className="rounded bg-red-500 px-2 py-1 text-xs text-white transition-colors hover:bg-red-600"
              >
                Del
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-600">Tracking Numbers:</p>
              <p className="text-sm font-semibold text-gray-800 truncate">{tracker.numbers.join(', ')}</p>
            </div>

            <div>
              <p className="text-xs text-gray-600">
                Trigger After: {tracker.useAutoThreshold !== false && (
                  <span className="text-green-600">(Auto)</span>
                )}
              </p>
              <p className="text-sm font-semibold text-gray-800">{tracker.threshold} spins</p>
              {tracker.useAutoThreshold !== false && spinHistory.length < 30 && (
                <p className="text-xs text-gray-500">Will auto-update after 30 spins</p>
              )}
            </div>

            <div className="rounded-lg bg-gray-100 p-3">
              <div className="mb-2">
                <p className="text-xs text-gray-600">Spins Since Hit:</p>
                <p className={`text-2xl font-bold ${isTriggered ? 'text-red-600' : 'text-gray-800'}`}>
                  {spinsSinceHit}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Longest Gap:</p>
                <p className="text-lg font-semibold text-gray-800">{longestGap}</p>
              </div>
            </div>

            {isTriggered && (
              <div className="rounded-lg bg-red-100 p-2 text-center">
                <p className="text-xs font-bold text-red-700">⚠️ TRIGGERED</p>
                <p className="text-xs text-red-600">
                  {spinsSinceHit} &gt; {tracker.threshold}
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

