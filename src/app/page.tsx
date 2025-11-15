'use client';

import RouletteTable from '@/components/RouletteTable';
import SpinHistory from '@/components/SpinHistory';
import TrackerGrid from '@/components/TrackerGrid';
import StrategyIntersection from '@/components/StrategyIntersection';
import NumberTags from '@/components/NumberTags';
import NumberNeighbors from '@/components/NumberNeighbors';
import EntityNotifications from '@/components/EntityNotifications';
import IntersectionNotification from '@/components/IntersectionNotification';
import ChatBox from '@/components/ChatBox';
import DataSync from '@/components/DataSync';
import { useSessionStore } from '@/stores/useSessionStore';
import { useUserStore } from '@/stores/useUserStore';
import { useAutoThreshold } from '@/hooks/useAutoThreshold';

export default function Home() {
  const lastSelectedNumber = useSessionStore((state) => state.lastSelectedNumber);
  const currentUser = useUserStore((state) => state.currentUser);
  const setCurrentUser = useUserStore((state) => state.setCurrentUser);

  // Enable auto-threshold learning system
  useAutoThreshold();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Roulette Gap Tracker</h1>
              <p className="mt-2 text-gray-600">Track spins and get notified when your numbers haven't hit in a while</p>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-700">You are:</label>
              <select
                value={currentUser}
                onChange={(e) => setCurrentUser(e.target.value as 'Frank' | 'Rudi')}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Frank">Frank</option>
                <option value="Rudi">Rudi</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Intersection Notification Popup */}
      <IntersectionNotification />

      {/* Data Sync & Import/Export */}
      <DataSync currentUser={currentUser} />

      {/* Live Chat */}
      <ChatBox currentUser={currentUser} />

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Input & History Section */}
        <section className="mb-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Left: Interactive Roulette Table */}
            <div>
              <RouletteTable />
            </div>

            {/* Right: Spin History */}
            <div>
              <SpinHistory />
            </div>
          </div>
        </section>

        {/* Number Tags & Neighbors Section */}
        <section className="mb-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Left: Number Tags */}
            <div>
              <NumberTags number={lastSelectedNumber} />
            </div>

            {/* Right: Number Neighbors */}
            <div>
              <NumberNeighbors number={lastSelectedNumber} />
            </div>
          </div>
        </section>

        {/* Entity Notifications Section */}
        <section className="mb-8">
          <EntityNotifications />
        </section>

        {/* Strategy Intersection Section */}
        <section className="mb-12">
          <StrategyIntersection />
        </section>

        {/* Tracker Grid Section */}
        <section>
          <TrackerGrid />
        </section>
      </main>
    </div>
  );
}
