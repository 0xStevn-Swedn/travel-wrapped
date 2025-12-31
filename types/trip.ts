export interface Location {
  name: string;
  lat: number;
  lng: number;
}

export interface Trip {
  id: string;
  from: Location;
  to: Location;
  date: string;
  transportMode?: 'plane' | 'train' | 'car' | 'bus' | 'boat';
}

export interface TripStats {
  totalTrips: number;
  totalDistance: number;
  citiesVisited: string[];
  topRoutes: { route: string; count: number }[];
}