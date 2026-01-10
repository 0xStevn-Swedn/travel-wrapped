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

// CO2 emissions in grams per km per passenger
const CO2_PER_KM: Record<string, number> = {
  plane: 255,    // Average flight
  train: 41,     // Electric train
  car: 171,      // Average car
  bus: 89,       // Coach bus
  boat: 245,     // Ferry
};

export function calculateCarbonFootprint(trips: Trip[]): {
  totalCO2: number;
  byTransport: Record<string, number>;
  equivalents: {
    trees: number;
    drivingKm: number;
  };
} {
  const byTransport: Record<string, number> = {};
  let totalCO2 = 0;

  trips.forEach(trip => {
    const distance = calculateDistance(trip.from, trip.to);
    const mode = trip.transportMode || 'plane';
    const co2 = distance * (CO2_PER_KM[mode] || CO2_PER_KM.plane);
    
    totalCO2 += co2;
    byTransport[mode] = (byTransport[mode] || 0) + co2;
  });

  // Convert grams to kg
  totalCO2 = Math.round(totalCO2 / 1000);
  Object.keys(byTransport).forEach(key => {
    byTransport[key] = Math.round(byTransport[key] / 1000);
  });

  return {
    totalCO2,
    byTransport,
    equivalents: {
      trees: Math.round(totalCO2 / 21), // 1 tree absorbs ~21kg CO2/year
      drivingKm: Math.round(totalCO2 / 0.171), // Convert back to driving equivalent
    },
  };
}