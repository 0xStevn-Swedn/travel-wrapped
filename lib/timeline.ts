import { Location, Trip } from '@/types/trip';
import { generateId } from './utils';

interface GoogleTimelineLocation {
  latitudeE7?: number;
  longitudeE7?: number;
  latLng?: string;
  timestamp?: string;
  startTimestamp?: string;
  endTimestamp?: string;
}

interface GoogleTimelineActivity {
  activityType?: string;
  probability?: number;
}

interface GoogleTimelinePlaceVisit {
  location?: {
    latitudeE7?: number;
    longitudeE7?: number;
    name?: string;
    address?: string;
  };
  duration?: {
    startTimestamp?: string;
    endTimestamp?: string;
  };
}

interface GoogleTimelineSegment {
  activitySegment?: {
    startLocation?: GoogleTimelineLocation;
    endLocation?: GoogleTimelineLocation;
    duration?: {
      startTimestamp?: string;
      endTimestamp?: string;
    };
    activityType?: string;
    distance?: number;
  };
  placeVisit?: GoogleTimelinePlaceVisit;
}

interface GoogleTimelineData {
  timelineObjects?: GoogleTimelineSegment[];
  semanticSegments?: GoogleTimelineSegment[];
}

// Convert E7 format to decimal degrees
function e7ToDegrees(e7: number): number {
  return e7 / 1e7;
}

// Map Google activity types to our transport modes
function mapActivityType(activityType?: string): Trip['transportMode'] {
  if (!activityType) return 'car';
  
  const type = activityType.toUpperCase();
  
  if (type.includes('FLY') || type.includes('PLANE')) return 'plane';
  if (type.includes('TRAIN') || type.includes('RAIL')) return 'train';
  if (type.includes('BUS')) return 'bus';
  if (type.includes('BOAT') || type.includes('FERRY')) return 'boat';
  if (type.includes('CAR') || type.includes('DRIVE') || type.includes('VEHICLE')) return 'car';
  
  return 'car';
}

// Get city name from coordinates (simplified - uses nearest known city)
function getLocationName(lat: number, lng: number, address?: string, name?: string): string {
  if (name) return name;
  if (address) {
    // Extract city from address (usually after first comma)
    const parts = address.split(',');
    if (parts.length >= 2) {
      return parts[parts.length - 2].trim();
    }
    return address;
  }
  // Fallback to coordinates
  return `${lat.toFixed(2)}, ${lng.toFixed(2)}`;
}

export function parseGoogleTimeline(jsonData: GoogleTimelineData): Trip[] {
  const trips: Trip[] = [];
  
  // Handle different Google Timeline export formats
  const segments = jsonData.timelineObjects || jsonData.semanticSegments || [];
  
  for (const segment of segments) {
    const activity = segment.activitySegment;
    
    if (!activity) continue;
    
    const startLoc = activity.startLocation;
    const endLoc = activity.endLocation;
    
    if (!startLoc || !endLoc) continue;
    
    // Get coordinates
    let startLat: number | undefined;
    let startLng: number | undefined;
    let endLat: number | undefined;
    let endLng: number | undefined;
    
    if (startLoc.latitudeE7 && startLoc.longitudeE7) {
      startLat = e7ToDegrees(startLoc.latitudeE7);
      startLng = e7ToDegrees(startLoc.longitudeE7);
    }
    
    if (endLoc.latitudeE7 && endLoc.longitudeE7) {
      endLat = e7ToDegrees(endLoc.latitudeE7);
      endLng = e7ToDegrees(endLoc.longitudeE7);
    }
    
    if (!startLat || !startLng || !endLat || !endLng) continue;
    
    // Skip very short trips (less than 10km)
    const distance = activity.distance || 0;
    if (distance < 10000) continue;
    
    // Get date from timestamp
    const timestamp = activity.duration?.startTimestamp || activity.duration?.endTimestamp;
    const date = timestamp ? timestamp.split('T')[0] : new Date().toISOString().split('T')[0];
    
    const from: Location = {
      name: getLocationName(startLat, startLng),
      lat: startLat,
      lng: startLng,
    };
    
    const to: Location = {
      name: getLocationName(endLat, endLng),
      lat: endLat,
      lng: endLng,
    };
    
    trips.push({
      id: generateId(),
      from,
      to,
      date,
      transportMode: mapActivityType(activity.activityType),
    });
  }
  
  return trips;
}

export function validateTimelineFile(data: unknown): data is GoogleTimelineData {
  if (typeof data !== 'object' || data === null) return false;
  
  const obj = data as Record<string, unknown>;
  
  // Check for known Google Timeline formats
  return Array.isArray(obj.timelineObjects) || Array.isArray(obj.semanticSegments);
}