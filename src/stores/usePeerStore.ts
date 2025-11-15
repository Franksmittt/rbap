import { create } from 'zustand';

interface PeerState {
  dataChannel: RTCDataChannel | null;
  setDataChannel: (channel: RTCDataChannel | null) => void;
}

export const usePeerStore = create<PeerState>((set) => ({
  dataChannel: null,
  setDataChannel: (channel) => set({ dataChannel: channel }),
}));

