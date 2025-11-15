import { create } from 'zustand';

interface SessionState {
  spinHistory: number[];
  historyPointer: number; // Points to current position in history (for undo/redo)
  lastSelectedNumber: number | null; // Last number clicked on the table
  selectedNumbersHistory: number[]; // History of all selected numbers (for tags/neighbors display)
  addSpin: (number: number) => void;
  setSpinHistory: (history: number[]) => void; // For syncing from peer
  clearHistory: () => void;
  undoLastSpin: () => void;
  redoLastSpin: () => void;
}

const MAX_HISTORY_LENGTH = 50; // Keep last 50 numbers as requested

export const useSessionStore = create<SessionState>((set, get) => ({
  spinHistory: [],
  historyPointer: -1, // -1 means at the end (showing all history)
  lastSelectedNumber: null,
  selectedNumbersHistory: [],
  addSpin: (number) =>
    set((state) => {
      // If we're not at the end (have undone), truncate history from pointer
      let newHistory =
        state.historyPointer >= 0 && state.historyPointer < state.spinHistory.length - 1
          ? state.spinHistory.slice(0, state.historyPointer + 1)
          : state.spinHistory;
      
      // Add new number
      newHistory = [...newHistory, number];
      
      // Keep only the last 50 numbers
      if (newHistory.length > MAX_HISTORY_LENGTH) {
        newHistory = newHistory.slice(-MAX_HISTORY_LENGTH);
      }
      
      // Update selected numbers history
      const newSelectedHistory = [...state.selectedNumbersHistory, number];
      
      return {
        spinHistory: newHistory,
        historyPointer: -1, // Now at the end
        lastSelectedNumber: number, // Update last selected number
        selectedNumbersHistory: newSelectedHistory,
      };
    }),
  setSpinHistory: (history: number[]) => {
    // Only keep last 50 numbers as requested
    const limitedHistory = history.slice(-50);
    set({
      spinHistory: limitedHistory,
      historyPointer: -1,
      lastSelectedNumber: limitedHistory.length > 0 ? limitedHistory[limitedHistory.length - 1] : null,
      selectedNumbersHistory: limitedHistory,
    });
  },
  clearHistory: () => set({ spinHistory: [], historyPointer: -1, lastSelectedNumber: null, selectedNumbersHistory: [] }),
  undoLastSpin: () =>
    set((state) => {
      if (state.spinHistory.length === 0) return state;
      
      // If at the end, move pointer to second-to-last
      if (state.historyPointer === -1) {
        return { historyPointer: state.spinHistory.length - 2 };
      }
      // Otherwise, move pointer back one more
      if (state.historyPointer > 0) {
        return { historyPointer: state.historyPointer - 1 };
      }
      return state;
    }),
  redoLastSpin: () =>
    set((state) => {
      if (state.spinHistory.length === 0) return state;
      
      // If we can move forward
      if (state.historyPointer < state.spinHistory.length - 1) {
        const newPointer = state.historyPointer + 1;
        // If we reach the end, set to -1
        return { historyPointer: newPointer >= state.spinHistory.length - 1 ? -1 : newPointer };
      }
      return state;
    }),
}));

