'use client';

import { useEffect, useState } from 'react';
import { Trip } from '@/types/trip';

interface TravelMapProps {
  trips: Trip[];
}

export default function TravelMap({ trips }: TravelMapProps) {
  const [mapComponents, setMapComponents] = useState<{
    MapContainer: any;
    TileLayer: any;
    Polyline: any;
    CircleMarker: any;
    Tooltip: any;
  } | null>(null);

  useEffect(() => {
    // Dynamic import for client-side only (Leaflet doesn't work with SSR)
    Promise.all([
      import('react-leaflet'),
      import('leaflet/dist/leaflet.css'),
    ]).then(([reactLeaflet]) => {
      setMapComponents({
        MapContainer: reactLeaflet.MapContainer,
        TileLayer: reactLeaflet.TileLayer,
        Polyline: reactLeaflet.Polyline,
        CircleMarker: reactLeaflet.CircleMarker,
        Tooltip: reactLeaflet.Tooltip,
      });
    });
  }, []);

  if (!mapComponents) {
    return (
      <div className="w-full h-[500px] bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Loading map...</p>
      </div>
    );
  }

  const { MapContainer, TileLayer, Polyline, CircleMarker, Tooltip } = mapComponents;

  // Get all unique locations for markers
  const locations = new Map<string, { lat: number; lng: number; count: number }>();
  trips.forEach(trip => {
    const fromKey = trip.from.name;
    const toKey = trip.to.name;
    
    if (!locations.has(fromKey)) {
      locations.set(fromKey, { lat: trip.from.lat, lng: trip.from.lng, count: 0 });
    }
    if (!locations.has(toKey)) {
      locations.set(toKey, { lat: trip.to.lat, lng: trip.to.lng, count: 0 });
    }
    locations.get(fromKey)!.count++;
    locations.get(toKey)!.count++;
  });

  // Calculate center based on trips or default to Europe
  const defaultCenter: [number, number] = [48.8566, 2.3522];
  
  return (
    <MapContainer
      center={defaultCenter}
      zoom={4}
      className="w-full h-[500px] rounded-lg shadow-lg"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* Draw trip lines */}
      {trips.map((trip) => (
        <Polyline
          key={trip.id}
          positions={[
            [trip.from.lat, trip.from.lng],
            [trip.to.lat, trip.to.lng],
          ]}
          color="#3b82f6"
          weight={2}
          opacity={0.7}
        />
      ))}

      {/* Draw city markers */}
      {Array.from(locations.entries()).map(([name, loc]) => (
        <CircleMarker
          key={name}
          center={[loc.lat, loc.lng]}
          radius={Math.min(8 + loc.count * 2, 20)}
          fillColor="#ef4444"
          color="#ffffff"
          weight={2}
          fillOpacity={0.8}
        >
          <Tooltip>{name} ({loc.count} trips)</Tooltip>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}