'use client';

import { useTrackerStore } from '@/stores/useTrackerStore';
import { useSessionStore } from '@/stores/useSessionStore';
import { calculateSpinsSinceHit, calculateLongestGap } from '@/utils/gapAnalysis';
import TrackerCard from './TrackerCard';
import { useState, useMemo } from 'react';

export default function TrackerGrid() {
  const trackers = useTrackerStore((state) => state.trackers);
  const addTracker = useTrackerStore((state) => state.addTracker);
  const spinHistory = useSessionStore((state) => state.spinHistory);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newNumbers, setNewNumbers] = useState('');
  const [newThreshold, setNewThreshold] = useState(6);

  const handleAddTracker = () => {
    if (newName.trim() && newNumbers.trim()) {
      const numbers = newNumbers
        .split(',')
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => !isNaN(n) && n >= 0 && n <= 36);

      if (numbers.length > 0) {
        addTracker({
          name: newName.trim(),
          numbers,
          threshold: newThreshold,
        });
        setNewName('');
        setNewNumbers('');
        setNewThreshold(6);
        setShowAddForm(false);
      }
    }
  };

  // Show all strategies - no limit
  const canAddMore = true; // Always allow adding more

  // Sort trackers: prioritize strategies where spins since hit equals longest gap
  // (they're currently in their longest gap period), then by spins since hit descending
  const sortedTrackers = useMemo(() => {
    return [...trackers].sort((a, b) => {
      const spinsSinceHitA = calculateSpinsSinceHit(spinHistory, a.numbers);
      const spinsSinceHitB = calculateSpinsSinceHit(spinHistory, b.numbers);
      const longestGapA = calculateLongestGap(spinHistory, a.numbers);
      const longestGapB = calculateLongestGap(spinHistory, b.numbers);
      
      // Check if each is in its longest gap (spins since hit equals longest gap)
      const isInLongestGapA = spinsSinceHitA === longestGapA;
      const isInLongestGapB = spinsSinceHitB === longestGapB;
      
      // Prioritize strategies in their longest gap
      if (isInLongestGapA && !isInLongestGapB) return -1; // A comes first
      if (!isInLongestGapA && isInLongestGapB) return 1; // B comes first
      
      // If both or neither are in longest gap, sort by spins since hit descending
      return spinsSinceHitB - spinsSinceHitA;
    });
  }, [trackers, spinHistory]);

  // Create array with all trackers plus one slot for add button
  const totalSlots = sortedTrackers.length + (showAddForm ? 0 : 1);
  const gridSlots = Array.from({ length: totalSlots }, (_, index) => {
    if (index < sortedTrackers.length) {
      return { type: 'tracker' as const, tracker: sortedTrackers[index] };
    } else if (index === sortedTrackers.length && showAddForm) {
      return { type: 'addForm' as const };
    } else if (index === sortedTrackers.length && canAddMore) {
      return { type: 'addButton' as const };
    } else {
      return { type: 'empty' as const };
    }
  });

  return (
    <div className="w-full">
      <h2 className="mb-6 text-2xl font-bold text-gray-800">
        My Tracker Strategies ({trackers.length})
      </h2>
      <div className="grid grid-cols-4 gap-4">
        {gridSlots.map((slot, index) => {
          if (slot.type === 'tracker') {
            return <TrackerCard key={slot.tracker.id} tracker={slot.tracker} />;
          } else if (slot.type === 'addForm') {
            return (
              <div key="add-form" className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-4">
                <h3 className="mb-3 text-sm font-semibold text-gray-800">Add New Tracker</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm"
                      placeholder="e.g., My 3s"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700">Numbers</label>
                    <input
                      type="text"
                      value={newNumbers}
                      onChange={(e) => setNewNumbers(e.target.value)}
                      className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm"
                      placeholder="3, 4, 5"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700">Trigger</label>
                    <input
                      type="number"
                      value={newThreshold}
                      onChange={(e) => setNewThreshold(parseInt(e.target.value, 10) || 6)}
                      min="1"
                      className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm"
                    />
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={handleAddTracker}
                      className="flex-1 rounded bg-blue-500 px-2 py-1 text-xs text-white transition-colors hover:bg-blue-600"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => {
                        setShowAddForm(false);
                        setNewName('');
                        setNewNumbers('');
                        setNewThreshold(6);
                      }}
                      className="flex-1 rounded bg-gray-300 px-2 py-1 text-xs text-gray-700 transition-colors hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            );
          } else if (slot.type === 'addButton') {
            return (
              <button
                key="add-button"
                onClick={() => setShowAddForm(true)}
                className="flex min-h-[180px] items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 text-gray-600 transition-colors hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600"
              >
                <div className="text-center">
                  <div className="mb-1 text-3xl">+</div>
                  <div className="text-sm font-semibold">Add Tracker</div>
                </div>
              </button>
            );
          } else {
            return <div key={`empty-${index}`} className="rounded-lg border-2 border-transparent" />;
          }
        })}
      </div>
    </div>
  );
}

