'use client';

import { TravelMap } from '@/components/Map';
import { TripForm } from '@/components/TripForm';
import { TripList } from '@/components/TripList';
import { WrappedSummary } from '@/components/WrappedSummary';
import { TimelineImport } from '@/components/Import';
import { useTrips } from '@/hooks/useTrips';

export default function Home() {
  const { trips, addTrip, removeTrip, clearTrips, importTrips } = useTrips();

  return (
    <main className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            ✈️ Travel Wrapped
          </h1>
          <p className="text-gray-600">
            Track your journeys and get your personalized travel summary
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Form and List */}
          <div className="space-y-6">
            <TripForm onAddTrip={addTrip} />
            <TimelineImport onImport={importTrips} />
            <TripList trips={trips} onRemove={removeTrip} />
            
            {trips.length > 0 && (
              <button
                onClick={clearTrips}
                className="w-full text-red-600 hover:text-red-700 text-sm py-2"
              >
                Clear all trips
              </button>
            )}
          </div>

          {/* Right Column - Map and Summary */}
          <div className="lg:col-span-2 space-y-6">
            <TravelMap trips={trips} />
            <WrappedSummary trips={trips} />
          </div>
        </div>
      </div>
    </main>
  );
}