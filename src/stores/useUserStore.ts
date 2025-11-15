import { create } from 'zustand';

interface UserState {
  currentUser: 'Frank' | 'Rudi';
  setCurrentUser: (user: 'Frank' | 'Rudi') => void;
}

// Load from localStorage on init
const getStoredUser = (): 'Frank' | 'Rudi' => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('roulette-user');
    if (stored === 'Frank' || stored === 'Rudi') {
      return stored;
    }
  }
  return 'Frank';
};

export const useUserStore = create<UserState>((set) => ({
  currentUser: getStoredUser(),
  setCurrentUser: (user) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('roulette-user', user);
    }
    set({ currentUser: user });
  },
}));

