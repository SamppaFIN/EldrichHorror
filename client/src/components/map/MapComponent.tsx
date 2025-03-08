import { useEffect, useRef, useState } from 'react';
import { useGameContext } from '@/context/GameContext';
import { useGeolocation } from '@/hooks/useGeolocation';
import { calculateDistance } from '@/lib/locationUtils';
import { LocationType } from '@/types/gameTypes';
import 'leaflet/dist/leaflet.css';

// Import Leaflet dynamically (for SSR compatibility)
let L: any;

type MapComponentProps = {
  onTriggerLocation?: (location: LocationType) => void;
};

const MapComponent = ({ onTriggerLocation }: MapComponentProps) => {
  const { gameState, playerPosition, gameLocations, locationPermissionState, requestLocationPermission } = useGameContext();
  const { accuracy } = useGeolocation();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const playerMarkerRef = useRef<any>(null);
  const accuracyCircleRef = useRef<any>(null);
  const locationMarkersRef = useRef<any[]>([]);
  const locationCirclesRef = useRef<any[]>([]);
  const lastPositionUpdateRef = useRef<number>(Date.now());
  
  // State for distance meter and directional hints
  const [selectedLocation, setSelectedLocation] = useState<LocationType | null>(null);
  const [distance, setDistance] = useState<number>(0);
  const [direction, setDirection] = useState<string>('');
  const [lastUpdateTime, setLastUpdateTime] = useState<string>('');
  
  // Initialize Leaflet map when component mounts
  useEffect(() => {
    const initMap = async () => {
      // Dynamic import of Leaflet for client-side only
      if (!L) {
        L = await import('leaflet');
      }
      
      if (mapRef.current && !mapInstanceRef.current) {
        // Default to Tampere, Finland coordinates if player position not available yet
        const initialPosition = playerPosition || { lat: 61.47285420785464, lng: 23.72609861270144 };
        
        // Create map
        mapInstanceRef.current = L.map(mapRef.current).setView(
          [initialPosition.lat, initialPosition.lng], 
          15
        );
        
        // Add dark theme map tiles
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19
        }).addTo(mapInstanceRef.current);
        
        // Create player marker with enhanced pulsing effect
        const playerIcon = L.divIcon({
          className: 'player-marker',
          iconSize: [28, 28],
          html: `<div class="w-[28px] h-[28px] rounded-full bg-[#e8e0c9] border-[4px] border-[#1565c0] 
                shadow-[0_0_15px_rgba(21,101,192,0.9)] relative z-20">
                <div class="absolute inset-0 rounded-full bg-[#1565c0] animate-ping opacity-70"></div>
                <div class="absolute -inset-2 rounded-full border-4 border-[#1565c0]/30 animate-pulse"></div>
                </div>`
        });
        
        playerMarkerRef.current = L.marker(
          [initialPosition.lat, initialPosition.lng], 
          { icon: playerIcon }
        ).addTo(mapInstanceRef.current);
        
        // Add enhanced accuracy circle around player (with 15m default radius)
        accuracyCircleRef.current = L.circle([initialPosition.lat, initialPosition.lng], {
          radius: 15,
          className: 'accuracy-circle',
          fillOpacity: 0.15,
          fillColor: '#1565c0',
          color: '#1565c0',
          weight: 2,
          dashArray: '4,8'
        }).addTo(mapInstanceRef.current);
        
        // Add location markers
        addLocationMarkers();
        
        // Set initial update time
        setLastUpdateTime(new Date().toLocaleTimeString());
      }
    };
    
    initMap();
    
    // Cleanup on unmount
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);
  
  // Update player position on map
  useEffect(() => {
    if (mapInstanceRef.current && playerMarkerRef.current && playerPosition) {
      // Update player marker position with smooth animation
      playerMarkerRef.current.setLatLng([playerPosition.lat, playerPosition.lng]);
      
      // Update accuracy circle with real accuracy data when available
      if (accuracyCircleRef.current) {
        // Update circle position
        accuracyCircleRef.current.setLatLng([playerPosition.lat, playerPosition.lng]);
        
        // Update circle radius based on actual accuracy data (or use default)
        const currentAccuracy = accuracy || 15; // Default to 15m if accuracy is null
        accuracyCircleRef.current.setRadius(currentAccuracy);
        
        // Update circle styling based on accuracy
        if (accuracy) {
          // Better accuracy = more green
          if (accuracy < 20) {
            accuracyCircleRef.current.setStyle({
              fillColor: '#4CAF50', // Green for good accuracy
              color: '#4CAF50',
              fillOpacity: 0.15,
              weight: 2
            });
          } else if (accuracy < 50) {
            accuracyCircleRef.current.setStyle({
              fillColor: '#FFC107', // Yellow for medium accuracy
              color: '#FFC107',
              fillOpacity: 0.15,
              weight: 2
            });
          } else {
            accuracyCircleRef.current.setStyle({
              fillColor: '#F44336', // Red for poor accuracy
              color: '#F44336',
              fillOpacity: 0.15,
              weight: 2
            });
          }
        }
      }
      
      // Always center map on player with smooth animation
      mapInstanceRef.current.setView([playerPosition.lat, playerPosition.lng], 
        mapInstanceRef.current.getZoom(), {
        animate: true,
        duration: 0.5,
        noMoveStart: true
      });
      
      // Record update time
      const now = Date.now();
      const timeSinceLastUpdate = now - lastPositionUpdateRef.current;
      lastPositionUpdateRef.current = now;
      
      // Update last update time display
      setLastUpdateTime(new Date().toLocaleTimeString());
      
      // Check for proximity triggers
      checkProximityTriggers();
      
      // Log position update in console
      console.log(`Position updated at ${new Date().toLocaleTimeString()}, accuracy: ${accuracy}m, Δt: ${Math.round(timeSinceLastUpdate)}ms`);
    }
  }, [playerPosition, accuracy]);
  
  // Calculate direction between player and target
  const calculateDirection = (playerLat: number, playerLng: number, targetLat: number, targetLng: number): string => {
    const latDiff = targetLat - playerLat;
    const lngDiff = targetLng - playerLng;
    
    // Calculate angle in degrees
    let angle = Math.atan2(latDiff, lngDiff) * 180 / Math.PI;
    
    // Convert angle to compass direction
    const directions = [
      "east", "northeast", "north", "northwest",
      "west", "southwest", "south", "southeast", "east"
    ];
    
    // Normalize angle to 0-360
    if (angle < 0) angle += 360;
    
    // Convert angle to direction index (divide by 45 degrees)
    const index = Math.round(angle / 45) % 8;
    
    return directions[index];
  };
  
  // Get a cryptic hint based on direction and distance
  const getDirectionalHint = (direction: string, distance: number): string => {
    let distanceDescription = '';
    
    if (distance < 100) {
      distanceDescription = "very close";
    } else if (distance < 300) {
      distanceDescription = "close";
    } else if (distance < 800) {
      distanceDescription = "at a moderate distance";
    } else {
      distanceDescription = "far away";
    }
    
    const hints = {
      north: [
        "The whispers grow stronger from the north",
        "An unsettling pull draws you northward",
        "The ancient symbols on your map glow faintly when pointed north"
      ],
      northeast: [
        "Something beckons from the northeast",
        "The shadows seem to point northeast",
        "Your compass needle trembles toward the northeast"
      ],
      east: [
        "The air feels heavier to the east",
        "Strange sounds echo from the east",
        "The eastward path feels significant"
      ],
      southeast: [
        "An unnatural chill emanates from the southeast",
        "Your vision blurs slightly when looking southeast",
        "Whispered fragments of forgotten languages come from the southeast"
      ],
      south: [
        "The air grows colder toward the south",
        "Ancient energies pull you southward",
        "Your shadow stretches unnaturally to the south"
      ],
      southwest: [
        "The mists swirl more thickly to the southwest",
        "A presence makes itself known from the southwest",
        "You feel watched from the southwest"
      ],
      west: [
        "Something ancient awaits to the west",
        "The westward path seems to distort slightly",
        "The marks on your skin tingle when facing west"
      ],
      northwest: [
        "The wind carries strange scents from the northwest",
        "Your dreams pointed to the northwest",
        "Something calls silently from the northwest"
      ]
    };
    
    const directionHints = hints[direction as keyof typeof hints] || ["You sense something in that direction"];
    const randomIndex = Math.floor(Math.random() * directionHints.length);
    
    return `${directionHints[randomIndex]} (${distanceDescription}, ${Math.round(distance)} meters)`;
  };
  
  // Add location markers to map
  const addLocationMarkers = () => {
    if (!mapInstanceRef.current || !L) return;
    
    // Clear existing markers and circles
    locationMarkersRef.current.forEach(marker => marker.remove());
    locationCirclesRef.current.forEach(circle => circle.remove());
    locationMarkersRef.current = [];
    locationCirclesRef.current = [];
    
    // Add new markers for each location
    gameLocations.forEach(location => {
      if (gameState.visitedLocations.includes(location.id) && location.type !== 'cutscene') {
        return; // Skip already visited locations except cutscenes
      }
      
      // Create marker with appropriate icon
      const markerIcon = L.divIcon({
        className: `location-marker ${location.type}`,
        iconSize: [20, 20],
        html: `<div class="w-[20px] h-[20px] rounded-full border-2 border-[#e8e0c9] 
               ${location.type === 'story' ? 'bg-[#1a3a3a]/90' : 
                 location.type === 'secret' ? 'bg-[#2d1b2d]/90' : 
                 'bg-[#8b0000]/90'} 
               flex items-center justify-center shadow-[0_0_10px_rgba(0,0,0,0.5)]">
               <div class="inner-marker"></div>
               </div>`
      });
      
      const marker = L.marker([location.lat, location.lng], {
        icon: markerIcon
      }).addTo(mapInstanceRef.current);
      
      // Add radius circle
      const circle = L.circle([location.lat, location.lng], {
        radius: location.radius,
        className: 'location-radius',
        fillOpacity: 0,
        color: location.type === 'story' ? '#1a3a3a' : 
               location.type === 'secret' ? '#2d1b2d' : '#8b0000',
        weight: 2,
        dashArray: '5,10'
      }).addTo(mapInstanceRef.current);
      
      // Add popup with location information
      marker.bindPopup(`<b>${location.name}</b><br>${location.type.charAt(0).toUpperCase() + location.type.slice(1)} Point`);
      
      // Add click handler for location selection
      marker.on('click', () => {
        if (playerPosition) {
          setSelectedLocation(location);
          const dist = calculateDistance(
            playerPosition.lat, 
            playerPosition.lng, 
            location.lat, 
            location.lng
          );
          setDistance(dist);
          const dir = calculateDirection(
            playerPosition.lat, 
            playerPosition.lng, 
            location.lat, 
            location.lng
          );
          setDirection(dir);
        }
      });
      
      // Store references
      locationMarkersRef.current.push(marker);
      locationCirclesRef.current.push(circle);
    });
  };
  
  // Check if player is close enough to trigger any locations
  const checkProximityTriggers = () => {
    if (!playerPosition) return;
    
    gameLocations.forEach(location => {
      // Skip already visited locations (but allow cutscenes to be triggered again)
      if (gameState.visitedLocations.includes(location.id) && location.type !== 'cutscene') {
        return;
      }
      
      // Calculate distance between player and location
      const distance = calculateDistance(
        playerPosition.lat, 
        playerPosition.lng, 
        location.lat, 
        location.lng
      );
      
      // Check if player is within trigger radius
      if (distance <= location.radius && onTriggerLocation) {
        onTriggerLocation(location);
      }
    });
  };
  
  // Update map when game locations change
  useEffect(() => {
    if (mapInstanceRef.current) {
      addLocationMarkers();
    }
  }, [gameLocations, gameState.visitedLocations, gameState.discoveredSecrets]);
  
  // Update distance and direction when player position changes
  useEffect(() => {
    if (playerPosition && selectedLocation) {
      const dist = calculateDistance(
        playerPosition.lat, 
        playerPosition.lng, 
        selectedLocation.lat, 
        selectedLocation.lng
      );
      setDistance(dist);
      const dir = calculateDirection(
        playerPosition.lat, 
        playerPosition.lng, 
        selectedLocation.lat, 
        selectedLocation.lng
      );
      setDirection(dir);
    }
  }, [playerPosition, selectedLocation]);

  // On component mount, try to set the initial location as the ancient map location
  useEffect(() => {
    if (gameLocations && gameLocations.length > 0 && playerPosition) {
      const startLocation = gameLocations.find(loc => loc.id === 'ancient_map');
      if (startLocation) {
        setSelectedLocation(startLocation);
        const dist = calculateDistance(
          playerPosition.lat, 
          playerPosition.lng, 
          startLocation.lat, 
          startLocation.lng
        );
        setDistance(dist);
        const dir = calculateDirection(
          playerPosition.lat, 
          playerPosition.lng, 
          startLocation.lat, 
          startLocation.lng
        );
        setDirection(dir);
      }
    }
  }, [gameLocations?.length]);

  // Get GPS status indicator based on permission state
  const getGpsStatusIndicator = () => {
    switch (locationPermissionState) {
      case 'granted':
        return (
          <div className="w-2.5 h-2.5 bg-green-500 rounded-full mr-2 animate-pulse"></div>
        );
      case 'denied':
        return (
          <div className="w-2.5 h-2.5 bg-red-500 rounded-full mr-2"></div>
        );
      case 'prompt':
        return (
          <div className="w-2.5 h-2.5 bg-yellow-500 rounded-full mr-2 animate-pulse"></div>
        );
      default:
        return (
          <div className="w-2.5 h-2.5 bg-gray-500 rounded-full mr-2"></div>
        );
    }
  };

  // Get GPS status text based on permission state
  const getGpsStatusText = () => {
    if (!playerPosition && locationPermissionState !== 'granted') {
      return "GPS: Unavailable";
    } else if (playerPosition) {
      // Add accuracy information when available
      return accuracy 
        ? `GPS: ${lastUpdateTime} (±${Math.round(accuracy)}m)` 
        : `GPS: ${lastUpdateTime}`;
    } else {
      return "GPS: Waiting...";
    }
  };

  return (
    <div className="map-container h-full rounded-md overflow-hidden relative border-2 border-[#2d1b2d] shadow-[0_0_15px_rgba(0,0,0,0.5)]">
      <div id="map" ref={mapRef} className="h-full w-full z-[1]"></div>
      
      {/* Location permission overlay - show only when permission is denied or prompt */}
      {(locationPermissionState === 'denied' || !playerPosition) && (
        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center z-20 backdrop-blur-sm">
          <div className="bg-[#2d1b2d] rounded-md p-4 max-w-[300px] text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-3 text-[#e8e0c9]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <h3 className="text-[#e8e0c9] text-lg font-bold mb-2">Location Access Required</h3>
            <p className="text-[#e8e0c9]/80 mb-4">
              This game uses your location to find nearby points of interest and enhance your gameplay experience.
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={requestLocationPermission}
                className="bg-[#1565c0] text-[#e8e0c9] px-4 py-2 rounded-md hover:bg-[#1976d2] transition-colors w-full"
              >
                Enable GPS Location
              </button>
              
              {/* Device Settings Button */}
              <button 
                onClick={() => {
                  // Check device type and open appropriate settings
                  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
                  
                  if (isMobile) {
                    // For iOS, Android devices
                    if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
                      // iOS devices - open Settings app
                      alert('Please open your device Settings app → Privacy → Location Services and enable for this app');
                    } else {
                      // Android devices - try to open location settings
                      window.open('https://support.google.com/android/answer/3467281', '_blank');
                    }
                  } else {
                    // For desktop browsers
                    if (navigator.userAgent.indexOf('Chrome') !== -1) {
                      window.open('chrome://settings/content/location', '_blank');
                    } else if (navigator.userAgent.indexOf('Firefox') !== -1) {
                      window.open('about:preferences#privacy', '_blank');
                    } else if (navigator.userAgent.indexOf('Safari') !== -1) {
                      alert('Please open Safari Preferences → Websites → Location and allow for this website');
                    } else {
                      alert('Please check your browser settings to enable location permissions for this website');
                    }
                  }
                }}
                className="bg-[#1a3a3a] text-[#e8e0c9] px-4 py-2 rounded-md hover:bg-[#264d4d] transition-colors flex items-center justify-center gap-2 w-full"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Open Device Settings
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Position update indicator - more visible */}
      <div 
        className={`absolute top-3 left-3 ${playerPosition ? 'bg-[#1a3a3a]/90' : 'bg-[#8b0000]/90'} backdrop-blur-sm px-3 py-1.5 text-xs text-[#e8e0c9] rounded-md z-30 flex items-center border border-[#e8e0c9]/30 shadow-md`}
        onClick={locationPermissionState !== 'granted' ? requestLocationPermission : undefined}
        style={locationPermissionState !== 'granted' ? {cursor: 'pointer'} : {}}
      >
        {getGpsStatusIndicator()}
        <span>{getGpsStatusText()}</span>
      </div>
      
      {/* Distance meter and directional hint - moved away from bottom for mobile */}
      {selectedLocation && playerPosition && (
        <div className="absolute top-14 left-3 right-3 md:left-3 md:right-auto md:w-[280px] bg-[#2d1b2d]/90 backdrop-blur-md rounded-md p-3 text-[#e8e0c9] font-interface z-10 border border-[#1a3a3a] shadow-md">
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-sm font-bold text-[#e8e0c9]">
              {selectedLocation.name}
            </h3>
            <span className="text-xs bg-[#1a3a3a] px-2 py-1 rounded-full">
              {Math.round(distance)}m
            </span>
          </div>
          
          <div className="text-sm italic opacity-90">
            {getDirectionalHint(direction, distance)}
          </div>
        </div>
      )}
    </div>
  );
};

export default MapComponent;
