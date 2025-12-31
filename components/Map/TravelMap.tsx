'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Trip } from '@/types/trip';
import type { ComponentType, ReactNode } from 'react';

interface TravelMapProps {
  trips: Trip[];
}

interface LeafletMap {
  fitBounds: (bounds: [[number, number], [number, number]], options?: { padding: [number, number] }) => void;
  invalidateSize: () => void;
}

interface DivIconOptions {
  className?: string;
  html?: string;
  iconSize?: [number, number];
  iconAnchor?: [number, number];
}

// Component to fit bounds - runs inside MapContainer
function MapController({ 
  trips, 
  useMap, 
  shouldFit,
  onFitComplete 
}: { 
  trips: Trip[]; 
  useMap: () => LeafletMap;
  shouldFit: boolean;
  onFitComplete: () => void;
}) {
  const map = useMap();

  useEffect(() => {
    if (trips.length === 0) return;

    const allPoints: [number, number][] = [];
    trips.forEach(trip => {
      allPoints.push([trip.from.lat, trip.from.lng]);
      allPoints.push([trip.to.lat, trip.to.lng]);
    });

    if (allPoints.length > 0) {
      const lats = allPoints.map(p => p[0]);
      const lngs = allPoints.map(p => p[1]);
      
      const bounds: [[number, number], [number, number]] = [
        [Math.min(...lats), Math.min(...lngs)],
        [Math.max(...lats), Math.max(...lngs)],
      ];
      
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, trips]);

  // Fit when download is triggered
  useEffect(() => {
    if (!shouldFit || trips.length === 0) return;

    const allPoints: [number, number][] = [];
    trips.forEach(trip => {
      allPoints.push([trip.from.lat, trip.from.lng]);
      allPoints.push([trip.to.lat, trip.to.lng]);
    });

    if (allPoints.length > 0) {
      const lats = allPoints.map(p => p[0]);
      const lngs = allPoints.map(p => p[1]);
      
      const bounds: [[number, number], [number, number]] = [
        [Math.min(...lats), Math.min(...lngs)],
        [Math.max(...lats), Math.max(...lngs)],
      ];
      
      map.invalidateSize();
      map.fitBounds(bounds, { padding: [50, 50] });
      
      // Wait for animation then signal complete
      setTimeout(onFitComplete, 500);
    }
  }, [map, trips, shouldFit, onFitComplete]);

  return null;
}

export default function TravelMap({ trips }: TravelMapProps) {
  const [MapContainer, setMapContainer] = useState<ComponentType<{
    center: [number, number];
    zoom: number;
    className?: string;
    children?: ReactNode;
    preferCanvas?: boolean;
  }> | null>(null);
  const [TileLayer, setTileLayer] = useState<ComponentType<{
    attribution: string;
    url: string;
  }> | null>(null);
  const [Polyline, setPolyline] = useState<ComponentType<{
    positions: [number, number][];
    color?: string;
    weight?: number;
    opacity?: number;
  }> | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [Marker, setMarker] = useState<ComponentType<any> | null>(null);
  const [Tooltip, setTooltip] = useState<ComponentType<{
    children?: ReactNode;
  }> | null>(null);
  const [useMapHook, setUseMapHook] = useState<(() => LeafletMap) | null>(null);
  const [divIcon, setDivIcon] = useState<((options: DivIconOptions) => unknown) | null>(null);
  
  const mapRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [shouldFit, setShouldFit] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    Promise.all([
      import('react-leaflet'),
      import('leaflet')
    ]).then(([reactLeaflet, leaflet]) => {
      setMapContainer(() => reactLeaflet.MapContainer);
      setTileLayer(() => reactLeaflet.TileLayer);
      setPolyline(() => reactLeaflet.Polyline);
      setMarker(() => reactLeaflet.Marker);
      setTooltip(() => reactLeaflet.Tooltip);
      setUseMapHook(() => reactLeaflet.useMap);
      setDivIcon(() => (options: DivIconOptions) => new leaflet.DivIcon(options));
      setIsLoaded(true);
    });
  }, []);

  const captureMap = useCallback(async () => {
    if (!mapRef.current) return;
    
    // Wait for tiles to load
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    try {
      const html2canvas = (await import('html2canvas')).default;
      
      const canvas = await html2canvas(mapRef.current, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
      });

      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `travel-map-${new Date().getFullYear()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        setIsDownloading(false);
        setShouldFit(false);
      }, 'image/png');
    } catch (error) {
      console.error('Failed to generate image:', error);
      setIsDownloading(false);
      setShouldFit(false);
    }
  }, []);

  const handleDownload = useCallback(() => {
    setIsDownloading(true);
    setShouldFit(true);
  }, []);

  const onFitComplete = useCallback(() => {
    captureMap();
  }, [captureMap]);

  if (!isLoaded || !MapContainer || !TileLayer || !Polyline || !Marker || !Tooltip || !useMapHook || !divIcon) {
    return (
      <div className="w-full h-[500px] bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Loading map...</p>
      </div>
    );
  }

  // Calculate location visit counts
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

  const defaultCenter: [number, number] = [30, 0];

  // Create HTML-based marker icon
  const createMarkerIcon = (count: number) => {
    const size = Math.min(16 + count * 4, 32);
    return divIcon({
      className: '',
      html: `<div style="
        width: ${size}px;
        height: ${size}px;
        background-color: #ef4444;
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      "></div>`,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
  };

  return (
    <div className="space-y-4">
      <div ref={mapRef} className="rounded-lg overflow-hidden shadow-lg">
        <MapContainer
          center={defaultCenter}
          zoom={2}
          className="w-full h-[500px]"
          preferCanvas={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <MapController 
            trips={trips} 
            useMap={useMapHook} 
            shouldFit={shouldFit}
            onFitComplete={onFitComplete}
          />
          
          {/* Draw lines */}
          {trips.map((trip) => (
            <Polyline
              key={trip.id}
              positions={[
                [trip.from.lat, trip.from.lng],
                [trip.to.lat, trip.to.lng],
              ]}
              color="#3b82f6"
              weight={3}
              opacity={0.8}
            />
          ))}

          {/* Draw markers */}
          {Array.from(locations.entries()).map(([name, loc]) => (
            <Marker
              key={name}
              position={[loc.lat, loc.lng]}
              icon={createMarkerIcon(loc.count)}
            >
              <Tooltip>{name} ({loc.count} trips)</Tooltip>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {trips.length > 0 && (
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="w-full bg-blue-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>🗺️</span>
          {isDownloading ? 'Centering & Capturing...' : 'Download Map'}
        </button>
      )}
    </div>
  );
}