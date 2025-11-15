import { create } from 'zustand';

export interface ChatMessage {
  id: string;
  user: 'Frank' | 'Rudi';
  message: string;
  timestamp: Date;
}

interface ChatState {
  messages: ChatMessage[];
  addMessage: (user: 'Frank' | 'Rudi', message: string) => void;
  clearMessages: () => void;
}

const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  addMessage: (user, message) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          id: generateId(),
          user,
          message: message.trim(),
          timestamp: new Date(),
        },
      ].slice(-100), // Keep last 100 messages
    })),
  clearMessages: () => set({ messages: [] }),
}));

