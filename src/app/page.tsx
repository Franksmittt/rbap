'use client';

import RouletteTable from '@/components/RouletteTable';
import SpinHistory from '@/components/SpinHistory';
import TrackerGrid from '@/components/TrackerGrid';
import StrategyIntersection from '@/components/StrategyIntersection';
import NumberTags from '@/components/NumberTags';
import NumberNeighbors from '@/components/NumberNeighbors';
import EntityNotifications from '@/components/EntityNotifications';
import IntersectionNotification from '@/components/IntersectionNotification';
import { useSessionStore } from '@/stores/useSessionStore';
import { useAutoThreshold } from '@/hooks/useAutoThreshold';

export default function Home() {
  const lastSelectedNumber = useSessionStore((state) => state.lastSelectedNumber);

  // Enable auto-threshold learning system
  useAutoThreshold();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Roulette Gap Tracker</h1>
          <p className="mt-2 text-gray-600">Track spins and get notified when your numbers haven't hit in a while</p>
        </div>
      </header>

      {/* Intersection Notification Popup */}
      <IntersectionNotification />

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
