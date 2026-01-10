import { Location } from '@/types/trip';

interface RouteResult {
  coordinates: [number, number][];
  distance: number;
  duration: number;
}

// OSRM public demo server (free, no API key)
const OSRM_BASE_URL = 'https://router.project-osrm.org/route/v1';

export async function getRoute(
  from: Location,
  to: Location,
  mode: 'driving' | 'foot' | 'bike' = 'driving'
): Promise<RouteResult | null> {
  try {
    // OSRM expects: /route/v1/{profile}/{lng},{lat};{lng},{lat}
    const url = `${OSRM_BASE_URL}/${mode}/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`;

    const response = await fetch(url);
    
    if (!response.ok) {
      console.error('OSRM request failed:', response.status);
      return null;
    }

    const data = await response.json();

    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      console.error('No route found');
      return null;
    }

    const route = data.routes[0];
    
    // Convert GeoJSON coordinates [lng, lat] to Leaflet format [lat, lng]
    const coordinates: [number, number][] = route.geometry.coordinates.map(
      (coord: [number, number]) => [coord[1], coord[0]]
    );

    return {
      coordinates,
      distance: route.distance, // meters
      duration: route.duration, // seconds
    };
  } catch (error) {
    console.error('Failed to fetch route:', error);
    return null;
  }
}

// Map our transport modes to OSRM profiles
export function getOSRMProfile(transportMode: string): 'driving' | 'foot' | 'bike' | null {
  switch (transportMode) {
    case 'car':
    case 'bus':
      return 'driving';
    case 'train':
      // OSRM doesn't have train, use driving as approximation
      return 'driving';
    case 'boat':
    case 'plane':
      // No road routing for these
      return null;
    default:
      return 'driving';
  }
}