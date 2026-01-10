'use client';

import { useRef, useState } from 'react';
import { Trip } from '@/types/trip';
import { parseGoogleTimeline, validateTimelineFile } from '@/lib/timeline';

interface TimelineImportProps {
  onImport: (trips: Trip[]) => void;
}

export default function TimelineImport({ onImport }: TimelineImportProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importedCount, setImportedCount] = useState<number | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setError(null);
    setImportedCount(null);

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (!validateTimelineFile(data)) {
        throw new Error('Invalid Google Timeline format. Please export from Google Takeout.');
      }

      const trips = parseGoogleTimeline(data);

      if (trips.length === 0) {
        throw new Error('No trips found in the file. Make sure you have location history with travel segments.');
      }

      onImport(trips);
      setImportedCount(trips.length);
    } catch (err) {
      if (err instanceof SyntaxError) {
        setError('Invalid JSON file. Please select a valid Google Timeline export.');
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to import timeline.');
      }
    } finally {
      setIsProcessing(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg">
      <h3 className="font-semibold text-gray-800 mb-2">📍 Import from Google Timeline</h3>
      <p className="text-sm text-gray-500 mb-3">
        Export your location history from{' '}
        <a 
          href="https://takeout.google.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          Google Takeout
        </a>
        {' '}and import it here.
      </p>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileSelect}
        className="hidden"
      />

      <button
        onClick={handleClick}
        disabled={isProcessing}
        className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium disabled:opacity-50"
      >
        {isProcessing ? 'Processing...' : 'Select Timeline JSON'}
      </button>

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}

      {importedCount !== null && (
        <p className="mt-2 text-sm text-green-600">
          ✅ Successfully imported {importedCount} trips!
        </p>
      )}
    </div>
  );
}