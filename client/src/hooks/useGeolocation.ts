import { useState, useEffect } from 'react';
import { GeoPosition } from '@/types/gameTypes';

type GeolocationHookReturn = {
  position: GeoPosition | null;
  error: string | null;
  isLoading: boolean;
};

export const useGeolocation = (): GeolocationHookReturn => {
  const [position, setPosition] = useState<GeoPosition | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check for debug location first (for debugging)
    const debugLocation = localStorage.getItem('debug_location');
    if (debugLocation) {
      try {
        const parsedLocation = JSON.parse(debugLocation);
        if (parsedLocation?.lat && parsedLocation?.lng) {
          setPosition({
            lat: parsedLocation.lat,
            lng: parsedLocation.lng
          });
          setIsLoading(false);
          return;
        }
      } catch (e) {
        console.error('Failed to parse debug location');
      }
    }

    // Check if geolocation is supported
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setIsLoading(false);
      return;
    }

    // Success handler
    const handleSuccess = (position: GeolocationPosition) => {
      setPosition({
        lat: position.coords.latitude,
        lng: position.coords.longitude
      });
      setError(null);
      setIsLoading(false);
    };

    // Error handler - use default Tampere position if geolocation fails
    const handleError = (error: GeolocationPositionError) => {
      // Set default position in Tampere, Finland - slightly offset from the story point
      setPosition({
        lat: 61.47422624340799 + 0.001, // Slight offset for testing distance meter
        lng: 23.727072093722093 + 0.002
      });
      
      // Still report the error
      setError(
        error.code === 1
          ? 'Permission denied. Using default position in Tampere, Finland.'
          : error.code === 2
          ? 'Position unavailable. Using default position in Tampere, Finland.'
          : error.code === 3
          ? 'Timeout. Using default position in Tampere, Finland.'
          : 'An unknown error occurred. Using default position in Tampere, Finland.'
      );
      setIsLoading(false);
    };

    // Watch position with options
    const options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    };

    const watchId = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      options
    );

    // Cleanup
    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  return { position, error, isLoading };
};
