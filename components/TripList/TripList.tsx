'use client';

import { Trip } from '@/types/trip';
import { calculateDistance } from '@/lib/utils';

interface TripListProps {
  trips: Trip[];
  onRemove: (id: string) => void;
}

const transportIcons: Record<string, string> = {
  plane: '✈️',
  train: '🚄',
  car: '🚗',
  bus: '🚌',
  boat: '🚢',
};

export default function TripList({ trips, onRemove }: TripListProps) {
  if (trips.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg text-center text-gray-500">
        No trips yet. Add your first trip above!
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Your Trips ({trips.length})</h2>
      <ul className="space-y-3 max-h-[300px] overflow-y-auto">
        {trips.map(trip => (
          <li 
            key={trip.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{transportIcons[trip.transportMode || 'plane']}</span>
              <div>
                <p className="font-medium text-gray-800">
                  {trip.from.name} → {trip.to.name}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(trip.date).toLocaleDateString()} · {calculateDistance(trip.from, trip.to)} km
                </p>
              </div>
            </div>
            <button
              onClick={() => onRemove(trip.id)}
              className="text-red-500 hover:text-red-700 p-1"
              aria-label="Remove trip"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}