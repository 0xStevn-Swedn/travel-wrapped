'use client';

import { useEffect, useState } from 'react';
import { Trip } from '@/types/trip';
import type { ComponentType } from 'react';

interface TravelMapProps {
  trips: Trip[];
}

// Types for react-leaflet components
interface MapComponents {
  MapContainer: ComponentType<{
    center: [number, number];
    zoom: number;
    className?: string;
    children?: React.ReactNode;
  }>;
  TileLayer: ComponentType<{
    attribution: string;
    url: string;
  }>;
  Polyline: ComponentType<{
    positions: [number, number][];
    color?: string;
    weight?: number;
    opacity?: number;
  }>;
  CircleMarker: ComponentType<{
    center: [number, number];
    radius?: number;
    fillColor?: string;
    color?: string;
    weight?: number;
    fillOpacity?: number;
    children?: React.ReactNode;
  }>;
  Tooltip: ComponentType<{
    children?: React.ReactNode;
  }>;
}

export default function TravelMap({ trips }: TravelMapProps) {
  const [mapComponents, setMapComponents] = useState<MapComponents | null>(null);

  useEffect(() => {
    // Dynamic import for client-side only (Leaflet doesn't work with SSR)
    import('react-leaflet').then((mod) => {
      setMapComponents({
        MapContainer: mod.MapContainer,
        TileLayer: mod.TileLayer,
        Polyline: mod.Polyline,
        CircleMarker: mod.CircleMarker,
        Tooltip: mod.Tooltip,
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

  // Default center on Europe
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