import { useState, useEffect, useRef } from 'react';
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
  const lastUpdateRef = useRef<number>(Date.now());
  const positionRef = useRef<GeoPosition | null>(null);

  // Function to get the current position
  const getCurrentPosition = () => {
    // Skip if geolocation is not supported
    if (!navigator.geolocation) {
      return;
    }

    // Success handler
    const handleSuccess = (position: GeolocationPosition) => {
      const newPosition = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      
      // Update the position state and ref
      setPosition(newPosition);
      positionRef.current = newPosition;
      
      // Clear any previous errors
      setError(null);
      setIsLoading(false);
      
      // Update timestamp
      lastUpdateRef.current = Date.now();
      console.log(`Position updated at ${new Date().toLocaleTimeString()}: ${newPosition.lat}, ${newPosition.lng}`);
    };

    // Error handler - use default Tampere position if geolocation fails
    const handleError = (error: GeolocationPositionError) => {
      // Only set default position if we don't already have one
      if (!positionRef.current) {
        const defaultPosition = {
          lat: 61.47422624340799 + 0.001, // Slight offset for testing distance meter
          lng: 23.727072093722093 + 0.002
        };
        
        setPosition(defaultPosition);
        positionRef.current = defaultPosition;
      }
      
      // Report the error
      const errorMessage = error.code === 1
        ? 'Permission denied. Using default position in Tampere, Finland.'
        : error.code === 2
        ? 'Position unavailable. Using default position in Tampere, Finland.'
        : error.code === 3
        ? 'Timeout. Using default position in Tampere, Finland.'
        : 'An unknown error occurred. Using default position in Tampere, Finland.';
      
      setError(errorMessage);
      setIsLoading(false);
      console.warn('Geolocation error:', errorMessage);
    };

    // Get current position with options
    const options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
      handleSuccess,
      handleError,
      options
    );
  };

  useEffect(() => {
    // Check for debug location first (for debugging)
    const debugLocation = localStorage.getItem('debug_location');
    if (debugLocation) {
      try {
        const parsedLocation = JSON.parse(debugLocation);
        if (parsedLocation?.lat && parsedLocation?.lng) {
          const debugPosition = {
            lat: parsedLocation.lat,
            lng: parsedLocation.lng
          };
          setPosition(debugPosition);
          positionRef.current = debugPosition;
          setIsLoading(false);
          console.log('Using debug location:', debugPosition);
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

    // Get initial position
    getCurrentPosition();

    // Set up 3-second interval for updating position
    const positionInterval = setInterval(() => {
      getCurrentPosition();
    }, 3000); // 3 seconds refresh interval

    // Cleanup
    return () => {
      clearInterval(positionInterval);
    };
  }, []);

  return { position, error, isLoading };
};
