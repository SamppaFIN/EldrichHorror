import { useEffect, useRef, useState } from 'react';
import { useGameContext } from '@/context/GameContext';
import { calculateDistance } from '@/lib/locationUtils';
import { LocationType } from '@/types/gameTypes';
import 'leaflet/dist/leaflet.css';

// Import Leaflet dynamically (for SSR compatibility)
let L: any;

type MapComponentProps = {
  onTriggerLocation?: (location: LocationType) => void;
};

const MapComponent = ({ onTriggerLocation }: MapComponentProps) => {
  const { gameState, playerPosition, gameLocations } = useGameContext();
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
        
        // Create player marker with pulsing effect
        const playerIcon = L.divIcon({
          className: 'player-marker',
          iconSize: [20, 20],
          html: `<div class="w-[20px] h-[20px] rounded-full bg-[#e8e0c9] border-[3px] border-[#1565c0] 
                shadow-[0_0_10px_rgba(21,101,192,0.7)] relative z-10">
                <div class="absolute inset-0 rounded-full bg-[#1565c0] animate-ping opacity-50"></div>
                </div>`
        });
        
        playerMarkerRef.current = L.marker(
          [initialPosition.lat, initialPosition.lng], 
          { icon: playerIcon }
        ).addTo(mapInstanceRef.current);
        
        // Add accuracy circle around player (with 10m default radius)
        accuracyCircleRef.current = L.circle([initialPosition.lat, initialPosition.lng], {
          radius: 10,
          className: 'accuracy-circle',
          fillOpacity: 0.1,
          fillColor: '#1565c0',
          color: '#1565c0',
          weight: 1
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
      
      // Update accuracy circle
      if (accuracyCircleRef.current) {
        accuracyCircleRef.current.setLatLng([playerPosition.lat, playerPosition.lng]);
      }
      
      // Center map on player with smooth animation
      mapInstanceRef.current.panTo([playerPosition.lat, playerPosition.lng], {
        animate: true,
        duration: 0.5
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
      console.log(`Position updated at ${new Date().toLocaleTimeString()}, Δt: ${Math.round(timeSinceLastUpdate)}ms`);
    }
  }, [playerPosition]);
  
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

  return (
    <div className="map-container h-full rounded-md overflow-hidden relative border-4 border-[#2d1b2d] shadow-[0_0_15px_rgba(0,0,0,0.5)]">
      <div id="map" ref={mapRef} className="h-full w-full z-[1]"></div>
      
      {/* Position update indicator */}
      <div className="absolute top-3 right-3 bg-black/70 px-2 py-1 text-[10px] text-[#e8e0c9] rounded-sm z-10 flex items-center">
        <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
        <span>Updated: {lastUpdateTime}</span>
      </div>
      
      {/* Distance meter and directional hint */}
      {selectedLocation && (
        <div className="absolute bottom-3 left-3 right-3 bg-black/80 border border-[#2d1b2d] rounded-md p-3 text-[#e8e0c9] font-interface z-10">
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-sm font-bold text-[#e8e0c9]">
              {selectedLocation.name}
            </h3>
            <span className="text-xs bg-[#1a3a3a] px-2 py-1 rounded-full">
              {Math.round(distance)}m
            </span>
          </div>
          
          <div className="text-sm italic opacity-80">
            {getDirectionalHint(direction, distance)}
          </div>
        </div>
      )}
    </div>
  );
};

export default MapComponent;
