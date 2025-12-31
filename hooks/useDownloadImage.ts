'use client';

import { useCallback, RefObject } from 'react';

export function useDownloadImage() {
  const downloadImage = useCallback(async (
    elementRef: RefObject<HTMLElement | null>,
    filename: string = 'travel-wrapped.png'
  ) => {
    if (!elementRef.current) return;

    try {
      // Dynamic import to avoid SSR issues
      const html2canvas = (await import('html2canvas')).default;
      
      const canvas = await html2canvas(elementRef.current, {
        backgroundColor: null,
        scale: 2, // Higher resolution
        logging: false,
        useCORS: true,
      });

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (!blob) return;
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 'image/png');
    } catch (error) {
      console.error('Failed to generate image:', error);
    }
  }, []);

  return { downloadImage };
}