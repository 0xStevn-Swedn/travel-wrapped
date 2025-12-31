import { Trip, TripStats, Location } from '@/types/trip';

// Haversine formula to calculate distance between two coordinates
export function calculateDistance(from: Location, to: Location): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(to.lat - from.lat);
  const dLng = toRad(to.lng - from.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(from.lat)) * Math.cos(toRad(to.lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export function calculateStats(trips: Trip[]): TripStats {
  const cities = new Set<string>();
  const routeCounts: Record<string, number> = {};
  let totalDistance = 0;

  trips.forEach(trip => {
    cities.add(trip.from.name);
    cities.add(trip.to.name);
    totalDistance += calculateDistance(trip.from, trip.to);
    
    const route = `${trip.from.name} → ${trip.to.name}`;
    routeCounts[route] = (routeCounts[route] || 0) + 1;
  });

  const topRoutes = Object.entries(routeCounts)
    .map(([route, count]) => ({ route, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    totalTrips: trips.length,
    totalDistance,
    citiesVisited: Array.from(cities),
    topRoutes,
  };
}