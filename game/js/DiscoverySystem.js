/**
 * DISCOVERY SYSTEM
 * Manages spawning, detection, and collection of discoveries
 */

class DiscoverySystem {
    constructor() {
        this.discoveries = new Map();
        this.playerPosition = null;
        this.collectionRadius = GameConfig.discovery.collectionRadius;
        this.spawnRadius = GameConfig.discovery.spawnRadius;
        this.maxDiscoveries = GameConfig.discovery.maxDiscoveries;
        this.audio = null;
        this.gameState = null;
        this.notifications = null;
    }
    
    /**
     * Initialize discovery system
     */
    initialize() {
        this.log('DiscoverySystem initialized');
        this.audio = window.game?.systems?.audio;
        this.gameState = window.game?.systems?.gameState;
        this.notifications = window.game?.systems?.notifications;
        
        // Don't spawn discoveries immediately - wait for player position
        this.log('Waiting for player position before spawning discoveries...');
    }
    
    /**
     * Spawn discoveries around player
     */
    spawnDiscoveries() {
        if (!this.playerPosition) {
            this.log('❌ Cannot spawn discoveries - no player position available');
            // Try to get player position from geolocation system
            if (window.game?.systems?.geolocation) {
                const pos = window.game.systems.geolocation.getPosition();
                if (pos) {
                    this.log('Got player position from geolocation system:', pos);
                    this.playerPosition = pos;
                } else {
                    this.log('❌ No player position available from geolocation system either');
                    return;
                }
            } else {
                return;
            }
        }
        
        const count = Math.min(this.maxDiscoveries, 6); // Start with 6
        this.log(`Spawning ${count} discoveries around player at ${this.playerPosition.lat}, ${this.playerPosition.lng}...`);
        
        for (let i = 0; i < count; i++) {
            this.spawnDiscovery();
        }
        
        this.log('✓ Spawned discoveries');
    }
    
    /**
     * Spawn a single discovery
     */
    spawnDiscovery() {
        if (!this.playerPosition) return;
        
        const type = this.getRandomDiscoveryType();
        const position = this.getRandomPosition();
        
        const discovery = {
            id: `discovery_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: type.name,
            rarity: type.rarity,
            xp: type.xp,
            position: position,
            collected: false,
            spawnTime: Date.now()
        };
        
        this.discoveries.set(discovery.id, discovery);
        
        // Add to map
        if (window.game?.systems?.map) {
            window.game.systems.map.addDiscoveryMarker(discovery);
        }
        
        this.log(`Generated ${type.name} at ${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}`);
    }
    
    /**
     * Get random discovery type
     */
    getRandomDiscoveryType() {
        const types = GameConfig.discovery.types;
        const weights = {
            common: 50,
            uncommon: 30,
            rare: 15,
            epic: 4,
            legendary: 1
        };
        
        const totalWeight = types.reduce((sum, type) => sum + weights[type.rarity], 0);
        let random = Math.random() * totalWeight;
        
        for (const type of types) {
            random -= weights[type.rarity];
            if (random <= 0) {
                return type;
            }
        }
        
        return types[0]; // Fallback
    }
    
    /**
     * Get random position within spawn radius
     */
    getRandomPosition() {
        if (!this.playerPosition) {
            this.log('❌ No player position available for discovery spawning');
            return null;
        }
        
        this.log(`Player position: ${this.playerPosition.lat}, ${this.playerPosition.lng}`);
        this.log(`Spawn radius: ${this.spawnRadius}m`);
        
        const angle = Math.random() * 2 * Math.PI;
        
        // Use square root to create better distribution (avoid clustering near center)
        // This ensures discoveries are more evenly spread across the spawn area
        const distance = Math.sqrt(Math.random()) * this.spawnRadius;
        
        // Add minimum distance to prevent discoveries from spawning too close to player
        const minDistance = 20; // 20 meters minimum
        const adjustedDistance = Math.max(distance, minDistance);
        
        // More accurate coordinate conversion
        const R = 6371000; // Earth's radius in meters
        const latOffset = (adjustedDistance * Math.cos(angle)) / R * (180 / Math.PI);
        const lngOffset = (adjustedDistance * Math.sin(angle)) / (R * Math.cos(this.playerPosition.lat * Math.PI / 180)) * (180 / Math.PI);
        
        const lat = this.playerPosition.lat + latOffset;
        const lng = this.playerPosition.lng + lngOffset;
        
        this.log(`Generated position: ${lat.toFixed(6)}, ${lng.toFixed(6)} (distance: ${adjustedDistance.toFixed(1)}m, angle: ${(angle * 180 / Math.PI).toFixed(1)}°)`);
        
        return { lat, lng };
    }
    
    /**
     * Update player position
     */
    updatePlayerPosition(position) {
        this.log(`Player position updated: ${position.lat}, ${position.lng}`);
        const wasFirstPosition = !this.playerPosition;
        this.playerPosition = position;
        
        // If this is the first position update, spawn initial discoveries
        if (wasFirstPosition) {
            this.log('First player position received - spawning initial discoveries...');
            this.spawnDiscoveries();
        }
        
        this.checkCollection();
    }
    
    /**
     * Get color for distance display
     */
    getDistanceColor(distance) {
        if (distance > 50) {
            return '🔴'; // Red for >50m
        } else if (distance > 20) {
            return '🟡'; // Yellow for 20-50m
        } else {
            return '🟢'; // Green for <20m
        }
    }
    
    /**
     * Get color text for distance display
     */
    getDistanceColorText(distance) {
        if (distance > 50) {
            return '(RED)'; // Red for >50m
        } else if (distance > 20) {
            return '(YELLOW)'; // Yellow for 20-50m
        } else {
            return '(GREEN)'; // Green for <20m
        }
    }
    
    /**
     * Check for collection opportunities
     */
    checkCollection() {
        if (!this.playerPosition) return;
        
        this.log('📱 Update - checking discoveries');
        
        const nearbyDiscoveries = [];
        
        for (const [id, discovery] of this.discoveries) {
            if (discovery.collected) continue;
            
            const distance = this.calculateDistance(this.playerPosition, discovery.position);
            const color = this.getDistanceColor(distance);
            const colorText = this.getDistanceColorText(distance);
            
            this.log(`📏 ${discovery.type}: ${distance.toFixed(1)}m away ${colorText}`);
            
            // Add to nearby discoveries for UI display
            nearbyDiscoveries.push({
                type: discovery.type,
                distance: distance,
                color: color,
                colorText: colorText
            });
            
            if (distance <= this.collectionRadius) {
                this.collectDiscovery(discovery, this.playerPosition);
            }
        }
        
        // Update proximity indicator
        this.updateProximityIndicator(nearbyDiscoveries);
    }
    
    /**
     * Update proximity indicator in UI
     */
    updateProximityIndicator(discoveries) {
        // Sort by distance (closest first)
        discoveries.sort((a, b) => a.distance - b.distance);
        
        // Show only the 3 closest discoveries
        const closest = discoveries.slice(0, 3);
        
        // Update or create proximity indicator
        let indicator = document.getElementById('proximity-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'proximity-indicator';
            indicator.className = 'proximity-indicator glass-panel';
            document.body.appendChild(indicator);
        }
        
        if (closest.length > 0) {
            indicator.innerHTML = `
                <div class="proximity-header">📍 Nearby Discoveries</div>
                ${closest.map(discovery => `
                    <div class="proximity-item">
                        <span class="proximity-color">${discovery.color}</span>
                        <span class="proximity-type">${discovery.type}</span>
                        <span class="proximity-distance">${discovery.distance.toFixed(1)}m</span>
                    </div>
                `).join('')}
            `;
            indicator.style.display = 'block';
        } else {
            indicator.style.display = 'none';
        }
    }
    
    /**
     * Collect a discovery
     */
    collectDiscovery(discovery, playerPosition) {
        if (discovery.collected) return;
        
        discovery.collected = true;
        
        // Play sound
        if (this.audio) {
            this.audio.playDiscoveryCollection();
        }
        
        // Update game state
        if (this.gameState) {
            this.gameState.incrementDiscoveryCount();
        }
        
        // Show notification
        if (this.notifications) {
            this.showDiscoveryNotification(discovery);
        }
        
        // Remove from map
        if (window.game?.systems?.map) {
            window.game.systems.map.removeDiscoveryMarker(discovery.id);
        }
        
        // Remove from discoveries map
        this.discoveries.delete(discovery.id);
        
        this.log(`Collected ${discovery.type} (+${discovery.xp} XP)`);
        
        // Emit event
        this.emit('discoveryCollected', discovery);
        
        // Spawn new discovery after a delay
        setTimeout(() => {
            this.spawnDiscovery();
        }, 2000);
    }
    
    /**
     * Show discovery notification
     */
    showDiscoveryNotification(discovery) {
        if (!this.notifications) return;
        
        const message = `Discovered ${discovery.type}! (+${discovery.xp} XP)`;
        this.notifications.show(message, 'success');
    }
    
    /**
     * Calculate distance between two points
     */
    calculateDistance(pos1, pos2) {
        const R = 6371000; // Earth's radius in meters
        const dLat = (pos2.lat - pos1.lat) * Math.PI / 180;
        const dLng = (pos2.lng - pos1.lng) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(pos1.lat * Math.PI / 180) * Math.cos(pos2.lat * Math.PI / 180) *
                  Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }
    
    /**
     * Update discovery system
     */
    update() {
        // Check for collection opportunities
        this.checkCollection();
        
        // Clean up old discoveries
        this.cleanupOldDiscoveries();
    }
    
    /**
     * Clean up old discoveries
     */
    cleanupOldDiscoveries() {
        const now = Date.now();
        const maxAge = GameConfig.discovery.respawnTime;
        
        for (const [id, discovery] of this.discoveries) {
            if (now - discovery.spawnTime > maxAge) {
                this.discoveries.delete(id);
                if (window.game?.systems?.map) {
                    window.game.systems.map.removeDiscoveryMarker(id);
                }
            }
        }
    }
    
    /**
     * Get all discoveries
     */
    getDiscoveries() {
        return Array.from(this.discoveries.values());
    }
    
    /**
     * Clear all discoveries
     */
    clearDiscoveries() {
        this.discoveries.clear();
        if (window.game?.systems?.map) {
            window.game.systems.map.clearDiscoveryMarkers();
        }
    }
    
    /**
     * Logging
     */
    log(...args) {
        console.log('[DiscoverySystem]', ...args);
    }
}

// Event emitter mixin
Object.assign(DiscoverySystem.prototype, {
    on: function(event, callback) {
        if (!this._events) this._events = {};
        if (!this._events[event]) this._events[event] = [];
        this._events[event].push(callback);
    },
    
    emit: function(event, ...args) {
        if (!this._events || !this._events[event]) return;
        this._events[event].forEach(callback => callback(...args));
    }
});