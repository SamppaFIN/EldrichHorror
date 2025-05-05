import { useEffect, useRef, useState } from 'react';
import { useGameContext } from '@/context/GameContext';
import { useGeolocation } from '@/hooks/useGeolocation';
import { calculateDistance } from '@/lib/locationUtils';
import { LocationType } from '@/types/gameTypes';
import { WeatherCondition } from '@/lib/weatherService';
import { Cloud, CloudRain, CloudSnow, CloudFog, Sun, CloudLightning } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Import Leaflet dynamically (for SSR compatibility)
let L: any;

type MapComponentProps = {
  onTriggerLocation?: (location: LocationType) => void;
  performanceMode?: boolean;
  updateInterval?: number;
};

const MapComponent = ({ 
  onTriggerLocation, 
  performanceMode = false,
  updateInterval = 1000 
}: MapComponentProps) => {
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
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 768);
  
  // Check for mobile view
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', checkIfMobile);
    checkIfMobile();
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);
  
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
        mapInstanceRef.current = L.map(mapRef.current, {
          zoomControl: !isMobile, // Disable zoom controls on mobile
          attributionControl: !performanceMode, // Hide attribution in performance mode
          fadeAnimation: !performanceMode,
          markerZoomAnimation: !performanceMode,
          zoom: isMobile ? 16 : 15, // Closer zoom on mobile
        }).setView(
          [initialPosition.lat, initialPosition.lng], 
          isMobile ? 16 : 15
        );
        
        // Add dark theme map tiles with reduced detail in performance mode
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: performanceMode ? 17 : 19,
          maxNativeZoom: performanceMode ? 16 : 19,
          updateWhenIdle: performanceMode, // Only update when map is idle in performance mode
          updateWhenZooming: !performanceMode, // Don't update while zooming in performance mode
        }).addTo(mapInstanceRef.current);
        
        // Create player marker with simplified style in performance mode
        const playerIcon = L.divIcon({
          className: 'player-marker',
          iconSize: [24, 24], // Smaller size for better performance
          html: performanceMode ? 
            `<div class="w-[24px] h-[24px] rounded-full bg-[#1565c0] border-2 border-white"></div>` :
            `<div class="w-[28px] h-[28px] rounded-full bg-[#e8e0c9] border-[4px] border-[#1565c0] 
                shadow-[0_0_15px_rgba(21,101,192,0.9)] relative z-20">
                <div class="absolute inset-0 rounded-full bg-[#1565c0] animate-ping opacity-70"></div>
                <div class="absolute -inset-2 rounded-full border-4 border-[#1565c0]/30 animate-pulse"></div>
                </div>`
        });
        
        playerMarkerRef.current = L.marker(
          [initialPosition.lat, initialPosition.lng], 
          { icon: playerIcon }
        ).addTo(mapInstanceRef.current);
        
        // Add simplified accuracy circle in performance mode
        accuracyCircleRef.current = L.circle([initialPosition.lat, initialPosition.lng], {
          radius: 15,
          className: 'accuracy-circle',
          fillOpacity: performanceMode ? 0.1 : 0.15,
          fillColor: '#1565c0',
          color: '#1565c0',
          weight: performanceMode ? 1 : 2,
          dashArray: performanceMode ? null : '4,8'
        }).addTo(mapInstanceRef.current);
        
        // Add location markers
        addLocationMarkers();
        
        // Set initial update time
        setLastUpdateTime(new Date().toLocaleTimeString());
        
        // Disable dragging on mobile in performance mode to improve FPS
        if (isMobile && performanceMode) {
          mapInstanceRef.current.dragging.disable();
          mapInstanceRef.current.touchZoom.disable();
        }
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
  }, [performanceMode, isMobile]);
  
  // Update map with less frequent intervals in performance mode
  useEffect(() => {
    let updateTimer: number;
    
    const updateMap = () => {
      if (mapInstanceRef.current && playerMarkerRef.current && playerPosition) {
        // Update player marker position with no animation in performance mode
        playerMarkerRef.current.setLatLng([playerPosition.lat, playerPosition.lng]);
        
        // Update accuracy circle
        if (accuracyCircleRef.current) {
          // Update circle position
          accuracyCircleRef.current.setLatLng([playerPosition.lat, playerPosition.lng]);
          
          // Update circle radius based on actual accuracy data (or use default)
          const currentAccuracy = accuracy || 15; // Default to 15m if accuracy is null
          accuracyCircleRef.current.setRadius(currentAccuracy);
          
          // Simplified styling in performance mode
          if (performanceMode) {
            accuracyCircleRef.current.setStyle({
              fillColor: '#4CAF50',
              color: '#4CAF50',
              fillOpacity: 0.1,
              weight: 1
            });
          } else {
            // Better accuracy = more green
            if (accuracy) {
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
        }
        
        // Always center map on player, but only animate in normal mode
        mapInstanceRef.current.setView(
          [playerPosition.lat, playerPosition.lng], 
          mapInstanceRef.current.getZoom(), 
          performanceMode ? { animate: false } : { animate: true, duration: 0.5, noMoveStart: true }
        );
        
        // Record update time
        const now = Date.now();
        const timeSinceLastUpdate = now - lastPositionUpdateRef.current;
        lastPositionUpdateRef.current = now;
        
        // Update last update time display
        setLastUpdateTime(new Date().toLocaleTimeString());
        
        // Check for proximity triggers
        checkProximityTriggers();
        
        // Only log in normal mode
        if (!performanceMode) {
          console.log(`Position updated at ${new Date().toLocaleTimeString()}, accuracy: ${accuracy}m, Δt: ${Math.round(timeSinceLastUpdate)}ms`);
        }
      }
      
      // Schedule next update with longer interval in performance mode
      updateTimer = window.setTimeout(updateMap, updateInterval);
    };
    
    // Start the update cycle
    updateMap();
    
    // Cleanup
    return () => {
      window.clearTimeout(updateTimer);
    };
  }, [playerPosition, accuracy, performanceMode, updateInterval]);
  
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
  
  // Get a cryptic hint based on direction and distance - simplified in performance mode
  const getDirectionalHint = (direction: string, distance: number): string => {
    if (performanceMode) {
      return `${direction.toUpperCase()} ${Math.round(distance)}m`;
    }
    
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
  
  // Add location markers to map - simplified in performance mode
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
      
      // Create marker with appropriate icon - simpler in performance mode
      const markerIcon = L.divIcon({
        className: `location-marker ${location.type}`,
        iconSize: [16, 16], // Smaller for better performance
        html: performanceMode ? 
          `<div class="w-[16px] h-[16px] rounded-full bg-[#1a3a3a] border border-[#e8e0c9]"></div>` :
          `<div class="w-[20px] h-[20px] rounded-full border-2 border-[#e8e0c9] 
               ${location.type === 'story' ? 'bg-[#1a3a3a]/90' : 
                 location.type === 'secret' ? 'bg-[#2d1b2d]/90' : 
                 location.type === 'startgame' ? 'bg-[#8b0000]/90' : 
                 'bg-[#8b0000]/90'} 
               flex items-center justify-center shadow-[0_0_10px_rgba(0,0,0,0.5)]">
               <div class="inner-marker"></div>
               </div>`
      });
      
      const marker = L.marker([location.lat, location.lng], {
        icon: markerIcon
      }).addTo(mapInstanceRef.current);
      
      // Add radius circle - simpler in performance mode
      const circleOptions = performanceMode ? 
        {
          radius: location.radius,
          className: 'location-radius',
          fillOpacity: 0,
          color: '#1a3a3a',
          weight: 1
        } : 
        {
          radius: location.radius,
          className: 'location-radius',
          fillOpacity: 0,
          color: location.type === 'story' ? '#1a3a3a' : 
                location.type === 'secret' ? '#2d1b2d' : 
                location.type === 'startgame' ? '#8b0000' : '#8b0000',
          weight: 2,
          dashArray: '5,10'
        };
      
      const circle = L.circle([location.lat, location.lng], circleOptions).addTo(mapInstanceRef.current);
      
      // Only add popups in normal mode and not on mobile
      if (!performanceMode && !isMobile) {
        marker.bindPopup(`<b>${location.name}</b><br>${location.type.charAt(0).toUpperCase() + location.type.slice(1)} Point`);
      }
      
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

  // Get GPS status indicator based on permission state - simplified in performance mode
  const getGpsStatusIndicator = () => {
    if (performanceMode) {
      // Simple colored dot in performance mode
      switch (locationPermissionState) {
        case 'granted': return <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>;
        case 'denied': return <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>;
        case 'prompt': return <div className="w-2 h-2 bg-yellow-500 rounded-full mr-1"></div>;
        default: return <div className="w-2 h-2 bg-gray-500 rounded-full mr-1"></div>;
      }
    }
    
    // Full indicator in normal mode
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

  // Get GPS status text - simplified in performance mode
  const getGpsStatusText = () => {
    if (performanceMode) {
      // Simplified text in performance mode
      if (!playerPosition) return "GPS";
      return `GPS ${Math.round(accuracy || 0)}m`;
    }
    
    // Full text in normal mode
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

  // Get simplified weather icon in performance mode
  const getWeatherIcon = () => {
    if (performanceMode) return null; // No weather icon in performance mode
    
    if (!gameState.weatherEffects) return <Sun className="w-4 h-4 text-amber-300" />;
    
    switch (gameState.weatherEffects.condition) {
      case 'thunderstorm':
        return <CloudLightning className="w-4 h-4 text-purple-300 animate-pulse" />;
      case 'rain':
        return <CloudRain className="w-4 h-4 text-blue-300" />;
      case 'snow':
        return <CloudSnow className="w-4 h-4 text-white" />;
      case 'fog':
      case 'mist':
        return <CloudFog className="w-4 h-4 text-gray-300" />;
      case 'clouds':
        return <Cloud className="w-4 h-4 text-gray-400" />;
      default:
        return <Sun className="w-4 h-4 text-amber-300" />;
    }
  };

  return (
    <div className="map-container h-full rounded-md overflow-hidden relative border-2 border-[#2d1b2d] shadow-[0_0_15px_rgba(0,0,0,0.5)]">
      <div id="map" ref={mapRef} className="h-full w-full z-[1]"></div>
      
      {/* Weather effect overlay - hide in performance mode */}
      {gameState.weatherEffects && !performanceMode && (
        <div 
          className="absolute inset-0 z-[2] pointer-events-none"
          style={{
            backgroundColor: gameState.weatherEffects.condition === 'fog' || 
                            gameState.weatherEffects.condition === 'mist'
              ? 'rgba(200, 200, 200, 0.3)'
              : gameState.weatherEffects.condition === 'clouds'
              ? 'rgba(100, 100, 100, 0.2)'
              : 'transparent',
            opacity: 1 - (gameState.weatherEffects.visibilityRange || 1)
          }}
        />
      )}
      
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
              
              {/* Debug Mode Button - Use for dev environments */}
              <div className="mt-4 pt-4 border-t border-[#e8e0c9]/20">
                <p className="text-xs text-[#e8e0c9]/60 mb-2">Developer Options:</p>
                <button 
                  onClick={() => {
                    // Set Tampere location by default
                    const debugLocation = {
                      lat: 61.4978, 
                      lng: 23.7610
                    };
                    localStorage.setItem('debug_location', JSON.stringify(debugLocation));
                    window.location.reload();
                  }}
                  className="bg-[#8b0000] text-[#e8e0c9] px-4 py-2 rounded-md hover:bg-[#a50000] transition-colors flex items-center justify-center gap-2 w-full"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Use Debug Location
                </button>
                <div className="text-[10px] text-[#e8e0c9]/40 mt-1 text-center">
                  This will simulate location in Tampere, Finland
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Position update indicator - simplified in performance mode */}
      <div className="absolute top-3 left-3 flex flex-col gap-2 z-30">
        {/* Weather status - hide in performance mode */}
        {!performanceMode && (
          <div className="bg-[#1a3a3a]/90 backdrop-blur-sm px-3 py-1.5 text-xs text-[#e8e0c9] rounded-md flex items-center border border-[#e8e0c9]/30 shadow-md">
            {getWeatherIcon()}
            <span className="ml-2">{gameState.weatherEffects ? `Weather: ${gameState.weatherEffects.condition.charAt(0).toUpperCase() + gameState.weatherEffects.condition.slice(1)}` : "Weather: Clear"}</span>
          </div>
        )}
        
        {/* Position update indicator - simplified in performance mode */}
        <div 
          className={`${playerPosition ? 'bg-[#1a3a3a]/90' : 'bg-[#8b0000]/90'} ${!performanceMode ? 'backdrop-blur-sm' : ''} px-3 py-1.5 text-xs text-[#e8e0c9] rounded-md flex items-center border border-[#e8e0c9]/30 shadow-md`}
          onClick={locationPermissionState !== 'granted' ? requestLocationPermission : undefined}
          style={locationPermissionState !== 'granted' ? {cursor: 'pointer'} : {}}
        >
          {getGpsStatusIndicator()}
          <span>{getGpsStatusText()}</span>
        </div>
      </div>
      
      {/* Distance meter and directional hint - hide in performance mode on mobile */}
      {selectedLocation && playerPosition && (!performanceMode || !isMobile) && (
        <div className={`absolute ${isMobile ? 'bottom-3 left-3 right-3' : 'top-14 left-3 right-3 md:left-3 md:right-auto md:w-[280px]'} ${performanceMode ? 'bg-[#2d1b2d]' : 'bg-[#2d1b2d]/90 backdrop-blur-md'} rounded-md p-3 text-[#e8e0c9] font-interface z-10 border border-[#1a3a3a] shadow-md`}>
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-sm font-bold text-[#e8e0c9]">
              {selectedLocation.name}
            </h3>
            <span className="text-xs bg-[#1a3a3a] px-2 py-1 rounded-full">
              {Math.round(distance)}m
            </span>
          </div>
          
          {!performanceMode && (
            <div className="text-sm italic opacity-90">
              {getDirectionalHint(direction, distance)}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MapComponent;
