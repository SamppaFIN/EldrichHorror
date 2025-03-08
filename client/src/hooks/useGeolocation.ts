import { useState, useEffect, useRef, useCallback } from 'react';
import { GeoPosition } from '@/types/gameTypes';
import { useToast } from '@/hooks/use-toast';

type GeolocationHookReturn = {
  position: GeoPosition | null;
  error: string | null;
  isLoading: boolean;
  requestPermission: () => void;
  permissionState: PermissionState | null;
};

export const useGeolocation = (): GeolocationHookReturn => {
  const [position, setPosition] = useState<GeoPosition | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [permissionState, setPermissionState] = useState<PermissionState | null>(null);
  const [permissionRequested, setPermissionRequested] = useState<boolean>(false);
  
  const lastUpdateRef = useRef<number>(Date.now());
  const positionRef = useRef<GeoPosition | null>(null);
  const toastShownRef = useRef<boolean>(false);
  const permissionToastRef = useRef<boolean>(false);
  const watchIdRef = useRef<number | null>(null);
  
  const { toast } = useToast();

  // Check permissions status
  const checkPermissions = useCallback(async () => {
    if (!navigator.permissions) {
      return null;
    }
    
    try {
      const permissionStatus = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
      setPermissionState(permissionStatus.state);
      
      // Listen for permission changes
      permissionStatus.addEventListener('change', () => {
        setPermissionState(permissionStatus.state);
        
        if (permissionStatus.state === 'granted' && !watchIdRef.current) {
          startWatchingPosition();
        }
      });
      
      return permissionStatus.state;
    } catch (e) {
      console.error('Error checking permissions:', e);
      return null;
    }
  }, []);

  // Function to start watching position
  const startWatchingPosition = useCallback(() => {
    // Skip if geolocation is not supported
    if (!navigator.geolocation) {
      return;
    }
    
    // Clear any existing watch
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
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
      
      // Show toast only once when position is successfully obtained
      if (!toastShownRef.current) {
        toast({
          title: "GPS Location Activated",
          description: "Using your real-world location for gameplay",
          duration: 3000
        });
        toastShownRef.current = true;
      }
      
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
      let errorMessage = '';
      
      if (error.code === 1) { // Permission denied
        errorMessage = 'Location permission denied. Using default position in Tampere, Finland.';
        if (!permissionToastRef.current) {
          toast({
            title: "Location Permission Required",
            description: "Please enable location permissions for the full game experience.",
            variant: "destructive",
            duration: 5000
          });
          permissionToastRef.current = true;
        }
      } else if (error.code === 2) {
        errorMessage = 'Position unavailable. Using default position in Tampere, Finland.';
      } else if (error.code === 3) {
        errorMessage = 'Location request timed out. Using default position in Tampere, Finland.';
      } else {
        errorMessage = 'An unknown location error occurred. Using default position in Tampere, Finland.';
      }
      
      setError(errorMessage);
      setIsLoading(false);
      console.warn('Geolocation error:', errorMessage);
    };

    // Watch options with high accuracy
    const options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    };

    // Start watching position with 3-second updates
    watchIdRef.current = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      options
    );
  }, [toast]);

  // Function to request permission explicitly - can be called from UI
  const requestPermission = useCallback(() => {
    setPermissionRequested(true);
    
    // If permissions API is available, check status
    if (navigator.permissions) {
      checkPermissions().then((state) => {
        if (state === 'granted') {
          startWatchingPosition();
        } else {
          // If not granted, try to get a position which will trigger the permission prompt
          navigator.geolocation.getCurrentPosition(
            () => startWatchingPosition(),
            (error) => {
              console.warn('Permission request failed:', error);
              toast({
                title: "Location Access Required",
                description: "Please allow location access in your browser settings to play this game with real-world tracking.",
                variant: "destructive",
                duration: 5000
              });
            }
          );
        }
      });
    } else {
      // If permissions API not available, just try to get position
      navigator.geolocation.getCurrentPosition(
        () => startWatchingPosition(),
        (error) => {
          console.warn('Permission request failed:', error);
        }
      );
    }
  }, [checkPermissions, startWatchingPosition, toast]);

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

    // Check permissions first
    checkPermissions().then((state) => {
      if (state === 'granted') {
        // If permission is already granted, start watching
        startWatchingPosition();
      } else if (state === 'prompt') {
        // Show a prompt to the user suggesting they enable location
        toast({
          title: "Location Access Needed",
          description: "This game uses your real-world location. Allow access when prompted for the best experience.",
          duration: 5000
        });
        
        // We'll wait for the user to click a button to request permission
        if (permissionRequested) {
          requestPermission();
        }
      }
    });

    // Cleanup
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [checkPermissions, startWatchingPosition, permissionRequested, requestPermission, toast]);

  return { 
    position, 
    error, 
    isLoading, 
    requestPermission,
    permissionState
  };
};
