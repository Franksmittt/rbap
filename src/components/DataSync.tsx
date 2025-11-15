'use client';

import { useState, useEffect, useRef } from 'react';
import { useSessionStore } from '@/stores/useSessionStore';
import { usePeerStore } from '@/stores/usePeerStore';
import { useChatStore } from '@/stores/useChatStore';

interface DataSyncProps {
  currentUser: 'Frank' | 'Rudi';
}

export default function DataSync({ currentUser }: DataSyncProps) {
  const spinHistory = useSessionStore((state) => state.spinHistory);
  const addSpin = useSessionStore((state) => state.addSpin);
  const setSpinHistory = useSessionStore((state) => state.setSpinHistory);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [peerId, setPeerId] = useState<string>('');
  const [remotePeerId, setRemotePeerId] = useState<string>('');
  const [isHost, setIsHost] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const peerRef = useRef<any>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const lastSyncedLengthRef = useRef(0);
  const setDataChannel = usePeerStore((state) => state.setDataChannel);
  const addChatMessage = useChatStore((state) => state.addMessage);
  const connectionRef = useRef<any>(null); // Store the PeerJS connection

  // Initialize WebRTC peer connection
  useEffect(() => {
    // Dynamically import PeerJS only on client side
    if (typeof window !== 'undefined') {
      import('peerjs').then((PeerJS) => {
        const Peer = PeerJS.default;
        const peer = new Peer({
          host: '0.peerjs.com',
          port: 443,
          path: '/',
          secure: true,
        });

        peer.on('open', (id) => {
          setPeerId(id);
          setConnectionStatus('disconnected');
        });

        peer.on('connection', (conn) => {
          setIsHost(false);
          setConnectionStatus('connected');
          
          conn.on('open', () => {
            connectionRef.current = conn;
            dataChannelRef.current = conn as any;
            setDataChannel(conn as any);
            // Send current history to the new connection
            if (spinHistory.length > 0) {
              conn.send(JSON.stringify({ type: 'sync', data: spinHistory }));
            }
          });

          conn.on('data', (data: unknown) => {
            try {
              const message = JSON.parse(data as string);
              if (message.type === 'spin') {
                // Add spin from remote user
                addSpin(message.number);
              } else if (message.type === 'sync') {
                // Sync entire history - use the longer one (they have more recent data)
                const remoteHistory = message.data as number[];
                if (remoteHistory.length > spinHistory.length) {
                  setSpinHistory(remoteHistory);
                }
              } else if (message.type === 'chat') {
                // Forward chat message to chat store
                addChatMessage(message.user as 'Frank' | 'Rudi', message.message);
              }
            } catch (error) {
              console.error('Error processing peer data:', error);
            }
          });

          conn.on('close', () => {
            setConnectionStatus('disconnected');
            dataChannelRef.current = null;
            setDataChannel(null);
          });
        });

        peer.on('error', (err: Error) => {
          console.error('Peer error:', err);
          setConnectionStatus('disconnected');
        });

        peerRef.current = peer;
      });
    }

    return () => {
      if (peerRef.current) {
        peerRef.current.destroy();
      }
    };
  }, []);

  // Sync spins when history changes
  useEffect(() => {
    if (dataChannelRef.current && dataChannelRef.current.readyState === 'open') {
      // Only send new spins (not the entire history every time)
      if (spinHistory.length > lastSyncedLengthRef.current) {
        const newSpins = spinHistory.slice(lastSyncedLengthRef.current);
        newSpins.forEach((num) => {
          dataChannelRef.current?.send(JSON.stringify({ type: 'spin', number: num }));
        });
        lastSyncedLengthRef.current = spinHistory.length;
      }
    }
  }, [spinHistory.length, addSpin]);

  const handleConnect = () => {
    if (!peerRef.current || !remotePeerId) return;

    const conn = peerRef.current.connect(remotePeerId);
    setIsHost(true);
    setConnectionStatus('connecting');

    conn.on('open', () => {
      setConnectionStatus('connected');
      connectionRef.current = conn;
      dataChannelRef.current = conn as any;
      setDataChannel(conn as any);
      // Send current history
      if (spinHistory.length > 0) {
        conn.send(JSON.stringify({ type: 'sync', data: spinHistory }));
      }
    });

    conn.on('data', (data: unknown) => {
      try {
        const message = JSON.parse(data as string);
        if (message.type === 'spin') {
          addSpin(message.number);
        } else if (message.type === 'sync') {
          const remoteHistory = message.data as number[];
          if (remoteHistory.length > spinHistory.length) {
            setSpinHistory(remoteHistory);
          }
        } else if (message.type === 'chat') {
          // Forward chat message to chat store
          addChatMessage(message.user as 'Frank' | 'Rudi', message.message);
        }
      } catch (error) {
        console.error('Error processing peer data:', error);
      }
    });

    conn.on('close', () => {
      setConnectionStatus('disconnected');
      dataChannelRef.current = null;
      setDataChannel(null);
    });

    conn.on('error', (err: Error) => {
      console.error('Connection error:', err);
      setConnectionStatus('disconnected');
    });
  };

  const handleExport = () => {
    const data = JSON.stringify(spinHistory, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `roulette-history-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (Array.isArray(data) && data.every((n) => typeof n === 'number' && n >= 0 && n <= 36)) {
          // Clear current history and import
          data.forEach((num) => addSpin(num));
          alert(`Imported ${data.length} numbers successfully!`);
        } else {
          alert('Invalid file format. Expected array of numbers 0-36.');
        }
      } catch (error) {
        alert('Error reading file. Please check the format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed top-4 left-4 bg-white rounded-lg shadow-lg border-2 border-gray-300 z-50 max-w-sm">
      {/* Header with minimize button */}
      <div className="bg-blue-600 text-white px-4 py-2 rounded-t-lg flex items-center justify-between">
        <h3 className="font-bold">Data Sync & Export</h3>
        <button
          onClick={() => setIsMinimized(!isMinimized)}
          className="text-white hover:bg-blue-700 rounded px-2 py-1 transition-colors"
          title={isMinimized ? 'Expand' : 'Minimize'}
        >
          {isMinimized ? '▲' : '▼'}
        </button>
      </div>
      
      {!isMinimized && (
        <div className="p-4">
          {/* WebRTC Connection */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="mb-2">
          <p className="text-xs text-gray-600 mb-1">Your ID (share this):</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={peerId}
              readOnly
              className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded bg-white"
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(peerId);
                alert('Copied to clipboard!');
              }}
              className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
            >
              Copy
            </button>
          </div>
        </div>

        <div className="mb-2">
          <p className="text-xs text-gray-600 mb-1">Connect to friend's ID:</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={remotePeerId}
              onChange={(e) => setRemotePeerId(e.target.value)}
              placeholder="Enter peer ID"
              className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
            />
            <button
              onClick={handleConnect}
              disabled={!remotePeerId || connectionStatus === 'connected'}
              className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Connect
            </button>
          </div>
        </div>

        <div className="text-xs">
          Status:{' '}
          <span
            className={`font-semibold ${
              connectionStatus === 'connected'
                ? 'text-green-600'
                : connectionStatus === 'connecting'
                ? 'text-yellow-600'
                : 'text-red-600'
            }`}
          >
            {connectionStatus === 'connected'
              ? '✓ Connected'
              : connectionStatus === 'connecting'
              ? 'Connecting...'
              : 'Disconnected'}
          </span>
        </div>
      </div>

          {/* Import/Export */}
          <div className="space-y-2">
            <button
              onClick={handleExport}
              className="w-full px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
            >
              📥 Export Numbers
            </button>
            <label className="block w-full px-3 py-2 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors text-center cursor-pointer">
              📤 Import Numbers
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );
}

