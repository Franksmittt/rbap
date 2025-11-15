'use client';

import { useState, useRef, useEffect } from 'react';
import { useChatStore } from '@/stores/useChatStore';
import { usePeerStore } from '@/stores/usePeerStore';

interface ChatBoxProps {
  currentUser: 'Frank' | 'Rudi';
}

export default function ChatBox({ currentUser }: ChatBoxProps) {
  const messages = useChatStore((state) => state.messages);
  const addMessage = useChatStore((state) => state.addMessage);
  const dataChannel = usePeerStore((state) => state.dataChannel);
  const [inputMessage, setInputMessage] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastMessageIdRef = useRef<string>('');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Chat messages are handled by DataSync component via PeerJS connection
  // No need to listen here since messages come through the chat store

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      const messageId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      addMessage(currentUser, inputMessage);
      
      // Send to peer if connected (via PeerJS connection stored in peer store)
      if (dataChannel) {
        // PeerJS connection uses send() method directly
        try {
          (dataChannel as any).send(JSON.stringify({
            type: 'chat',
            id: messageId,
            user: currentUser,
            message: inputMessage.trim(),
          }));
        } catch (error) {
          console.error('Error sending chat message:', error);
        }
      }
      
      setInputMessage('');
      lastMessageIdRef.current = messageId;
    }
  };

  return (
    <div className={`fixed bottom-4 right-4 w-80 bg-white rounded-lg shadow-2xl border-2 border-gray-300 flex flex-col z-40 ${isMinimized ? '' : 'h-96'}`}>
      {/* Header */}
      <div className="bg-blue-600 text-white px-4 py-2 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-bold">Live Chat</h3>
          <div className="text-xs">
            You: <span className="font-semibold">{currentUser}</span>
          </div>
        </div>
        <button
          onClick={() => setIsMinimized(!isMinimized)}
          className="text-white hover:bg-blue-700 rounded px-2 py-1 transition-colors"
          title={isMinimized ? 'Expand' : 'Minimize'}
        >
          {isMinimized ? '▲' : '▼'}
        </button>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50">
            {messages.length === 0 ? (
              <p className="text-sm text-gray-500 text-center">No messages yet. Start chatting!</p>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.user === currentUser ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 ${
                      msg.user === currentUser
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-800'
                    }`}
                  >
                    <div className="text-xs font-semibold mb-1 opacity-80">{msg.user}</div>
                    <div className="text-sm">{msg.message}</div>
                    <div className="text-xs opacity-70 mt-1">
                      {msg.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="border-t border-gray-300 p-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
              >
                Send
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}

