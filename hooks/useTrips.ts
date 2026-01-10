'use client';

import { useState, useCallback } from 'react';
import { Trip, Location } from '@/types/trip';
import { generateId } from '@/lib/utils';

// Sample cities with coordinates for the demo
export const SAMPLE_CITIES: Record<string, Location> = {
  'Paris': { name: 'Paris', lat: 48.8566, lng: 2.3522 },
  'London': { name: 'London', lat: 51.5074, lng: -0.1278 },
  'New York': { name: 'New York', lat: 40.7128, lng: -74.0060 },
  'Tokyo': { name: 'Tokyo', lat: 35.6762, lng: 139.6503 },
  'Berlin': { name: 'Berlin', lat: 52.5200, lng: 13.4050 },
  'Rome': { name: 'Rome', lat: 41.9028, lng: 12.4964 },
  'Barcelona': { name: 'Barcelona', lat: 41.3851, lng: 2.1734 },
  'Amsterdam': { name: 'Amsterdam', lat: 52.3676, lng: 4.9041 },
  'Dubai': { name: 'Dubai', lat: 25.2048, lng: 55.2708 },
  'Singapore': { name: 'Singapore', lat: 1.3521, lng: 103.8198 },
  'Sydney': { name: 'Sydney', lat: -33.8688, lng: 151.2093 },
  'Los Angeles': { name: 'Los Angeles', lat: 34.0522, lng: -118.2437 },
  'Zurich': { name: 'Zurich', lat: 47.3769, lng: 8.5417 },
  'Vienna': { name: 'Vienna', lat: 48.2082, lng: 16.3738 },
  'Prague': { name: 'Prague', lat: 50.0755, lng: 14.4378 },
};

export function useTrips() {
  const [trips, setTrips] = useState<Trip[]>([]);

  const addTrip = useCallback((from: Location, to: Location, date: string, transportMode?: Trip['transportMode']) => {
    const newTrip: Trip = {
      id: generateId(),
      from,
      to,
      date,
      transportMode,
    };
    setTrips(prev => [...prev, newTrip]);
  }, []);

  const removeTrip = useCallback((id: string) => {
    setTrips(prev => prev.filter(trip => trip.id !== id));
  }, []);

  const clearTrips = useCallback(() => {
    setTrips([]);
  }, []);

  const importTrips = useCallback((newTrips: Trip[]) => {
    setTrips(prev => [...prev, ...newTrips]);
  }, []);

  return { trips, addTrip, removeTrip, clearTrips, importTrips };
}