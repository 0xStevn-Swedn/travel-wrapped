'use client';

import { useRef } from 'react';
import { Trip, TripStats } from '@/types/trip';
import { calculateStats } from '@/lib/utils';
import { useDownloadImage } from '@/hooks/useDownloadImage';

interface WrappedSummaryProps {
  trips: Trip[];
}

export default function WrappedSummary({ trips }: WrappedSummaryProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const { downloadImage } = useDownloadImage();

  if (trips.length === 0) {
    return null;
  }

  const stats: TripStats = calculateStats(trips);
  const currentYear = new Date().getFullYear();

  const handleDownload = () => {
    downloadImage(cardRef, `travel-wrapped-${currentYear}.png`);
  };

  return (
    <div className="space-y-4">
      {/* The card that will be captured as image - using inline styles for html2canvas compatibility */}
      <div
        ref={cardRef}
        style={{
          background: 'linear-gradient(to bottom right, #9333ea, #2563eb)',
          padding: '24px',
          borderRadius: '8px',
          color: 'white',
        }}
      >
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
          🌍 Your Travel Wrapped {currentYear}
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          <div style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
            <p style={{ fontSize: '30px', fontWeight: 'bold' }}>{stats.totalTrips}</p>
            <p style={{ fontSize: '14px', opacity: 0.9 }}>Total Trips</p>
          </div>
          <div style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
            <p style={{ fontSize: '30px', fontWeight: 'bold' }}>{stats.totalDistance.toLocaleString()}</p>
            <p style={{ fontSize: '14px', opacity: 0.9 }}>Kilometers</p>
          </div>
          <div style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '16px', borderRadius: '8px', textAlign: 'center', gridColumn: 'span 2' }}>
            <p style={{ fontSize: '30px', fontWeight: 'bold' }}>{stats.citiesVisited.length}</p>
            <p style={{ fontSize: '14px', opacity: 0.9 }}>Cities Visited</p>
          </div>
        </div>

        {stats.topRoutes.length > 0 && (
          <div>
            <h3 style={{ fontWeight: '600', marginBottom: '8px' }}>🔥 Top Routes</h3>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {stats.topRoutes.slice(0, 3).map((route, index) => (
                <li key={route.route} style={{ fontSize: '14px', opacity: 0.9 }}>
                  {index + 1}. {route.route} ({route.count}x)
                </li>
              ))}
            </ul>
          </div>
        )}

        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.3)' }}>
          <p style={{ fontSize: '14px', opacity: 0.75, textAlign: 'center' }}>
            You&apos;re in the top 5% of travelers! 🏆
          </p>
        </div>

        {/* Branding for shared image */}
        <div style={{ marginTop: '16px', textAlign: 'center' }}>
          <p style={{ fontSize: '12px', opacity: 0.5 }}>✈️ Travel Wrapped</p>
        </div>
      </div>

      {/* Download button */}
      <button
        onClick={handleDownload}
        className="w-full bg-white text-purple-600 font-medium py-3 px-4 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 shadow-md"
      >
        <span>📥</span>
        Download & Share
      </button>
    </div>
  );
}