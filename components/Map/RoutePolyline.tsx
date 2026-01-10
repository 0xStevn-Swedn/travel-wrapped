'use client';

import { useEffect, useState } from 'react';
import { Trip } from '@/types/trip';
import { getRoute, getOSRMProfile } from '@/lib/routing';
import type { ComponentType } from 'react';

interface RoutePolylineProps {
  trip: Trip;
  Polyline: ComponentType<{
    positions: [number, number][];
    color?: string;
    weight?: number;
    opacity?: number;
    dashArray?: string;
  }>;
}

export default function RoutePolyline({ trip, Polyline }: RoutePolylineProps) {
  const [routeCoords, setRouteCoords] = useState<[number, number][] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchRoute = async () => {
      const profile = getOSRMProfile(trip.transportMode || 'plane');
      
      // For planes/boats, use straight line
      if (!profile) {
        setRouteCoords(null);
        return;
      }

      setIsLoading(true);
      
      const result = await getRoute(trip.from, trip.to, profile);
      
      if (result) {
        setRouteCoords(result.coordinates);
      } else {
        // Fallback to straight line if routing fails
        setRouteCoords(null);
      }
      
      setIsLoading(false);
    };

    fetchRoute();
  }, [trip]);

  // Straight line positions (fallback or for planes/boats)
  const straightLine: [number, number][] = [
    [trip.from.lat, trip.from.lng],
    [trip.to.lat, trip.to.lng],
  ];

  // Different colors for different transport modes
  const getColor = () => {
    switch (trip.transportMode) {
      case 'plane': return '#3b82f6'; // blue
      case 'train': return '#10b981'; // green
      case 'car': return '#f59e0b';   // amber
      case 'bus': return '#8b5cf6';   // purple
      case 'boat': return '#06b6d4';  // cyan
      default: return '#3b82f6';
    }
  };

  // Dashed line for planes
  const getDashArray = () => {
    return trip.transportMode === 'plane' ? '10, 10' : undefined;
  };

  return (
    <Polyline
      positions={routeCoords || straightLine}
      color={getColor()}
      weight={3}
      opacity={0.8}
      dashArray={getDashArray()}
    />
  );
}