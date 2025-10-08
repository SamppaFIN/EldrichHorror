/**
 * MAP MANAGER
 * Handles Leaflet map operations
 */

class MapManager {
    constructor(mapId, config) {
        this.mapId = mapId;
        this.config = config;
        this.map = null;
        this.playerMarker = null;
        this.discoveryMarkers = new Map();
        this._events = {};
        this.markerFactory = new SVGMarkerFactory();
    }
    
    initialize(initialPosition) {
        this.map = L.map(this.mapId).setView([61.469491, 23.730586], this.config.map.defaultZoom);
        
        L.tileLayer(this.config.map.tileLayer, {
            attribution: this.config.map.attribution
        }).addTo(this.map);
        
        if (initialPosition) {
            this.map.setView([initialPosition.lat, initialPosition.lng], this.config.map.defaultZoom);
            this.createPlayerMarker(initialPosition);
        }
        
        this.map.on('click', (e) => {
            this.emit('mapClick', e);
        });
        
        this.log('✓ Map initialized');
    }
    
    createPlayerMarker(position) {
        if (this.playerMarker) {
            this.map.removeLayer(this.playerMarker);
        }
        
        const icon = this.markerFactory.createPlayerMarker();
        this.log('Creating player marker with icon:', icon);
        
        this.playerMarker = L.marker([position.lat, position.lng], {
            icon: icon,
            zIndexOffset: 1000  // Ensure player marker is on top
        }).addTo(this.map);
        
        this.log('✓ Player marker created at', position.lat, position.lng);
        this.log('Player marker element:', this.playerMarker.getElement());
    }
    
    updatePlayerPosition(position) {
        if (this.playerMarker) {
            this.playerMarker.setLatLng([position.lat, position.lng]);
        }
    }
    
    addDiscoveryMarker(discovery) {
        try {
            const icon = this.markerFactory.createDiscoveryMarker(discovery.type);
            this.log(`Creating marker for ${discovery.type} with icon:`, icon);
            
            const marker = L.marker([discovery.position.lat, discovery.position.lng], {
                icon: icon
            }).addTo(this.map);
            
            // Add click event to show discovery details
            marker.on('click', () => {
                this.log(`Discovery marker clicked: ${discovery.type}`);
                this.showDiscoveryDetails(discovery);
            });
            
            this.discoveryMarkers.set(discovery.id, marker);
            this.log(`✓ Discovery marker added: ${discovery.id} (${discovery.type}) at ${discovery.position.lat}, ${discovery.position.lng}`);
        } catch (error) {
            this.log('❌ Error creating discovery marker:', error);
        }
    }
    
    /**
     * Show discovery details popup
     */
    showDiscoveryDetails(discovery) {
        // Create popup content
        const popupContent = `
            <div class="discovery-popup">
                <h3>${discovery.type}</h3>
                <p><strong>Rarity:</strong> ${discovery.rarity}</p>
                <p><strong>XP Value:</strong> ${discovery.xp}</p>
                <p><strong>Distance:</strong> ${this.calculateDistance(discovery.position)}m</p>
                <button class="collect-btn" onclick="window.game?.systems?.discovery?.collectDiscovery('${discovery.id}')">
                    Collect Discovery
                </button>
            </div>
        `;
        
        // Close any existing popups first
        this.map.closePopup();
        
        // Show popup at the exact discovery position
        const popup = L.popup({
            closeButton: true,
            autoClose: false,
            closeOnClick: false,
            className: 'discovery-popup-container'
        })
        .setLatLng([discovery.position.lat, discovery.position.lng])
        .setContent(popupContent);
        
        // Open popup and ensure it's visible
        popup.openOn(this.map);
        
        // Force the popup to be visible and positioned correctly
        setTimeout(() => {
            const popupElement = document.querySelector('.leaflet-popup');
            if (popupElement) {
                popupElement.style.zIndex = '10000';
                popupElement.style.display = 'block';
                popupElement.style.visibility = 'visible';
                popupElement.style.opacity = '1';
            }
        }, 100);
            
        this.log(`Discovery popup shown for ${discovery.type} at ${discovery.position.lat}, ${discovery.position.lng}`);
    }
    
    /**
     * Calculate distance to discovery
     */
    calculateDistance(discoveryPosition) {
        // Get current player position from the game
        if (window.game?.systems?.geolocation) {
            const playerPosition = window.game.systems.geolocation.getPosition();
            if (playerPosition) {
                return this.haversineDistance(
                    playerPosition.lat, playerPosition.lng,
                    discoveryPosition.lat, discoveryPosition.lng
                );
            }
        }
        
        // Fallback to random distance if player position not available
        return Math.round(Math.random() * 100);
    }
    
    /**
     * Calculate distance between two points using Haversine formula
     */
    haversineDistance(lat1, lng1, lat2, lng2) {
        const R = 6371000; // Earth's radius in meters
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return Math.round(R * c);
    }
    
    removeDiscoveryMarker(id) {
        const marker = this.discoveryMarkers.get(id);
        if (marker) {
            this.map.removeLayer(marker);
            this.discoveryMarkers.delete(id);
        }
    }
    
    clearDiscoveryMarkers() {
        this.discoveryMarkers.forEach(marker => this.map.removeLayer(marker));
        this.discoveryMarkers.clear();
    }
    
    on(event, callback) {
        if (!this._events[event]) this._events[event] = [];
        this._events[event].push(callback);
    }
    
    emit(event, ...args) {
        if (!this._events[event]) return;
        this._events[event].forEach(callback => callback(...args));
    }
    
    log(...args) {
            console.log('[MapManager]', ...args);
        }
    }