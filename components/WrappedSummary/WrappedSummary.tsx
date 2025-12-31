'use client';

import { Trip, TripStats } from '@/types/trip';
import { calculateStats } from '@/lib/utils';

interface WrappedSummaryProps {
  trips: Trip[];
}

export default function WrappedSummary({ trips }: WrappedSummaryProps) {
  if (trips.length === 0) {
    return null;
  }

  const stats: TripStats = calculateStats(trips);

  return (
    <div className="bg-gradient-to-br from-purple-600 to-blue-600 p-6 rounded-lg shadow-lg text-white">
      <h2 className="text-2xl font-bold mb-4">🌍 Your Travel Wrapped 2024</h2>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white/20 backdrop-blur p-4 rounded-lg text-center">
          <p className="text-3xl font-bold">{stats.totalTrips}</p>
          <p className="text-sm opacity-90">Total Trips</p>
        </div>
        <div className="bg-white/20 backdrop-blur p-4 rounded-lg text-center">
          <p className="text-3xl font-bold">{stats.totalDistance.toLocaleString()}</p>
          <p className="text-sm opacity-90">Kilometers</p>
        </div>
        <div className="bg-white/20 backdrop-blur p-4 rounded-lg text-center col-span-2">
          <p className="text-3xl font-bold">{stats.citiesVisited.length}</p>
          <p className="text-sm opacity-90">Cities Visited</p>
        </div>
      </div>

      {stats.topRoutes.length > 0 && (
        <div>
          <h3 className="font-semibold mb-2">🔥 Top Routes</h3>
          <ul className="space-y-1">
            {stats.topRoutes.slice(0, 3).map((route, index) => (
              <li key={route.route} className="text-sm opacity-90">
                {index + 1}. {route.route} ({route.count}x)
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-white/30">
        <p className="text-sm opacity-75 text-center">
          You&apos;re in the top 5% of travelers! 🏆
        </p>
      </div>
    </div>
  );
}