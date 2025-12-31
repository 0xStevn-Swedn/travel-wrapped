'use client';

import { useState } from 'react';
import { Location, Trip } from '@/types/trip';
import { SAMPLE_CITIES } from '@/hooks/useTrips';

interface TripFormProps {
  onAddTrip: (from: Location, to: Location, date: string, transportMode?: Trip['transportMode']) => void;
}

export default function TripForm({ onAddTrip }: TripFormProps) {
  const [fromCity, setFromCity] = useState('');
  const [toCity, setToCity] = useState('');
  const [date, setDate] = useState('');
  const [transportMode, setTransportMode] = useState<Trip['transportMode']>('plane');

  const cities = Object.keys(SAMPLE_CITIES);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fromCity || !toCity || !date || fromCity === toCity) {
      return;
    }

    const from = SAMPLE_CITIES[fromCity];
    const to = SAMPLE_CITIES[toCity];

    if (from && to) {
      onAddTrip(from, to, date, transportMode);
      setFromCity('');
      setToCity('');
      setDate('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg space-y-4">
      <h2 className="text-xl font-bold text-gray-800">Add a Trip</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
          <select
            value={fromCity}
            onChange={(e) => setFromCity(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Select city...</option>
            {cities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
          <select
            value={toCity}
            onChange={(e) => setToCity(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Select city...</option>
            {cities.filter(c => c !== fromCity).map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Transport</label>
          <select
            value={transportMode}
            onChange={(e) => setTransportMode(e.target.value as Trip['transportMode'])}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="plane">✈️ Plane</option>
            <option value="train">🚄 Train</option>
            <option value="car">🚗 Car</option>
            <option value="bus">🚌 Bus</option>
            <option value="boat">🚢 Boat</option>
          </select>
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
      >
        Add Trip
      </button>
    </form>
  );
}