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
  const locationMarkersRef = useRef<any[]>([]);
  const locationCirclesRef = useRef<any[]>([]);
  
  // Initialize Leaflet map when component mounts
  useEffect(() => {
    const initMap = async () => {
      // Dynamic import of Leaflet for client-side only
      if (!L) {
        L = await import('leaflet');
      }
      
      if (mapRef.current && !mapInstanceRef.current) {
        // Default to NYC coordinates if player position not available yet
        const initialPosition = playerPosition || { lat: 40.7128, lng: -74.0060 };
        
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
        
        // Create player marker
        const playerIcon = L.divIcon({
          className: 'player-marker',
          iconSize: [15, 15],
          html: '<div class="w-[15px] h-[15px] rounded-full bg-[#e8e0c9] border-[3px] border-[#1565c0] shadow-[0_0_10px_rgba(21,101,192,0.7)]"></div>'
        });
        
        playerMarkerRef.current = L.marker(
          [initialPosition.lat, initialPosition.lng], 
          { icon: playerIcon }
        ).addTo(mapInstanceRef.current);
        
        // Add location markers
        addLocationMarkers();
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
      // Update player marker position
      playerMarkerRef.current.setLatLng([playerPosition.lat, playerPosition.lng]);
      
      // Center map on player
      mapInstanceRef.current.panTo([playerPosition.lat, playerPosition.lng]);
      
      // Check for proximity triggers
      checkProximityTriggers();
    }
  }, [playerPosition]);
  
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
  
  return (
    <div className="map-container h-full rounded-md overflow-hidden relative border-4 border-[#2d1b2d] shadow-[0_0_15px_rgba(0,0,0,0.5)]">
      <div id="map" ref={mapRef} className="h-full w-full z-[1]"></div>
    </div>
  );
};

export default MapComponent;
