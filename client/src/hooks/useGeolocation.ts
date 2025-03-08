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

    // Error handler
    const handleError = (error: GeolocationPositionError) => {
      setError(
        error.code === 1
          ? 'Permission denied. Please allow location access to play.'
          : error.code === 2
          ? 'Position unavailable. Please try again later.'
          : error.code === 3
          ? 'Timeout. Please try again.'
          : 'An unknown error occurred.'
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
