import { create } from 'zustand';
import { PREBUILT_STRATEGIES } from '@/data/prebuiltStrategies';

export interface Tracker {
  id: string;
  name: string;
  numbers: number[];
  threshold: number;
  useAutoThreshold?: boolean; // If true, threshold auto-updates based on longest gap
}

interface TrackerState {
  trackers: Tracker[];
  isInitialized: boolean;
  initializeTrackers: (defaultThreshold: number) => void;
  addTracker: (tracker: Omit<Tracker, 'id'>) => void;
  updateTracker: (id: string, updates: Partial<Tracker>) => void;
  deleteTracker: (id: string) => void;
}

const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

export const useTrackerStore = create<TrackerState>((set, get) => ({
  trackers: [],
  isInitialized: false,
  initializeTrackers: (defaultThreshold: number = 6) => {
    if (get().isInitialized) return;
    
    const initializedTrackers: Tracker[] = PREBUILT_STRATEGIES.map((strategy) => ({
      ...strategy,
      id: generateId(),
      threshold: strategy.threshold, // Use preset threshold from strategy definition
      useAutoThreshold: false, // Disable auto-threshold - use preset values
    }));
    
    set({
      trackers: initializedTrackers,
      isInitialized: true,
    });
  },
  addTracker: (tracker) =>
    set((state) => ({
      trackers: [
        ...state.trackers,
        {
          ...tracker,
          id: generateId(),
        },
      ],
    })),
  updateTracker: (id, updates) =>
    set((state) => ({
      trackers: state.trackers.map((tracker) =>
        tracker.id === id ? { ...tracker, ...updates } : tracker
      ),
    })),
  deleteTracker: (id) =>
    set((state) => ({
      trackers: state.trackers.filter((tracker) => tracker.id !== id),
    })),
}));

