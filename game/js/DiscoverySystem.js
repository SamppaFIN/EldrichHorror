/**
 * DISCOVERY SYSTEM
 * Auto-collecting proximity-based discoveries that reward exploration
 * 
 * BRDC Ticket: BRDC-DISCOVERY-SYSTEM-005
 * Status: GREEN PHASE - Implementation
 */

class DiscoverySystem extends EventTarget {
    constructor(gameState, mapManager, consciousnessEngine, loreSystem) {
        super();
        
        this.gameState = gameState;
        this.mapManager = mapManager;
        this.consciousness = consciousnessEngine;
        this.lore = loreSystem;
        
        this.activeDiscoveries = new Map(); // id -> discovery
        this.collectedDiscoveries = new Set(); // Set of collected IDs
        
        // Configuration
        this.config = {
            collectionRange: 10, // meters
            spawnRadius: { min: 50, max: 200 }, // meters from player
            spawnCount: { min: 5, max: 10 },
            rarityWeights: {
                common: 0.70,    // 70%
                uncommon: 0.20,  // 20%
                rare: 0.08,      // 8%
                epic: 0.02       // 2%
            }
        };
        
        // Discovery types
        this.discoveryTypes = {
            COSMIC_FRAGMENT: {
                name: 'Cosmic Fragment',
                icon: '✨',
                xpReward: 50,
                rarity: 'common',
                loreCategory: 'cosmic'
            },
            SACRED_SIGIL: {
                name: 'Sacred Sigil',
                icon: '🌟',
                xpReward: 100,
                rarity: 'uncommon',
                loreCategory: 'sacred'
            },
            ELDRITCH_RUNE: {
                name: 'Eldritch Rune',
                icon: '🔮',
                xpReward: 150,
                rarity: 'rare',
                loreCategory: 'eldritch'
            },
            CONSCIOUSNESS_ORB: {
                name: 'Consciousness Orb',
                icon: '💫',
                xpReward: 200,
                rarity: 'epic',
                loreCategory: 'consciousness'
            }
        };
        
        this.log('DiscoverySystem initialized');
    }
    
    /**
     * Initialize discovery system
     */
    initialize(playerPosition) {
        if (!playerPosition) {
            this.log('Warning: No player position, cannot spawn discoveries');
            return;
        }
        
        this.spawnDiscoveries(playerPosition);
        this.log('DiscoverySystem ready');
    }
    
    /**
     * Spawn discoveries around player
     */
    spawnDiscoveries(centerPosition) {
        const count = Math.floor(
            Math.random() * (this.config.spawnCount.max - this.config.spawnCount.min) 
            + this.config.spawnCount.min
        );
        
        this.log(`Spawning ${count} discoveries...`);
        
        for (let i = 0; i < count; i++) {
            const discovery = this.generateDiscovery(centerPosition);
            this.activeDiscoveries.set(discovery.id, discovery);
            
            // Add marker to map
            if (this.mapManager && typeof this.mapManager.addDiscoveryMarker === 'function') {
                this.mapManager.addDiscoveryMarker(discovery);
            }
        }
        
        this.log(`✓ Spawned ${count} discoveries`);
        this.dispatchEvent(new CustomEvent('discoveriesspawned', { 
            detail: { count } 
        }));
    }
    
    /**
     * Generate a single discovery
     */
    generateDiscovery(centerPosition) {
        const position = this.generateRandomPosition(centerPosition);
        const typeKey = this.selectDiscoveryType();
        const type = this.discoveryTypes[typeKey];
        const loreEntry = this.selectLoreEntry(type.loreCategory);
        
        const discovery = {
            id: `discovery_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            typeKey: typeKey,
            type: type,
            position: position,
            loreId: loreEntry?.id || null,
            collected: false,
            spawnTime: Date.now()
        };
        
        this.log(`Generated ${type.name} at ${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}`);
        
        return discovery;
    }
    
    /**
     * Generate random position within spawn radius
     */
    generateRandomPosition(centerPosition) {
        const { min, max } = this.config.spawnRadius;
        
        // Random distance and angle
        const distance = Math.random() * (max - min) + min;
        const angle = Math.random() * 2 * Math.PI;
        
        // Convert to lat/lng offset (approximate)
        // 1 degree ≈ 111km at equator
        const latOffset = (distance * Math.cos(angle)) / 111000;
        const lngOffset = (distance * Math.sin(angle)) / (111000 * Math.cos(centerPosition.lat * Math.PI / 180));
        
        return {
            lat: centerPosition.lat + latOffset,
            lng: centerPosition.lng + lngOffset
        };
    }
    
    /**
     * Select discovery type based on rarity weights
     */
    selectDiscoveryType() {
        const rand = Math.random();
        const weights = this.config.rarityWeights;
        
        if (rand < weights.common) {
            return 'COSMIC_FRAGMENT';
        } else if (rand < weights.common + weights.uncommon) {
            return 'SACRED_SIGIL';
        } else if (rand < weights.common + weights.uncommon + weights.rare) {
            return 'ELDRITCH_RUNE';
        } else {
            return 'CONSCIOUSNESS_ORB';
        }
    }
    
    /**
     * Select lore entry for discovery
     */
    selectLoreEntry(category) {
        if (!this.lore || !this.lore.entries) return null;
        
        // Get all lore entries from the entries property
        const allLore = this.lore.entries;
        if (!allLore || allLore.length === 0) return null;
        
        // Filter by category if possible, otherwise random
        const categoryLore = allLore.filter(entry => 
            entry.category === category || entry.tags?.includes(category)
        );
        
        const availableLore = categoryLore.length > 0 ? categoryLore : allLore;
        
        // Return random entry
        return availableLore[Math.floor(Math.random() * availableLore.length)];
    }
    
    /**
     * Update system - check for nearby discoveries
     */
    update(playerPosition) {
        if (!playerPosition) return;
        
        // Check each active discovery
        this.activeDiscoveries.forEach(discovery => {
            if (!discovery.collected) {
                const distance = this.calculateDistance(playerPosition, discovery.position);
                
                // Within collection range?
                if (distance <= this.config.collectionRange) {
                    this.collectDiscovery(discovery, playerPosition);
                }
            }
        });
    }
    
    /**
     * Collect a discovery
     */
    collectDiscovery(discovery, playerPosition) {
        if (discovery.collected) return;
        
        this.log(`🎉 Collecting: ${discovery.type.name}`);
        
        // Mark as collected
        discovery.collected = true;
        discovery.collectionTime = Date.now();
        discovery.collectionPosition = playerPosition;
        
        // Add to collected set
        this.collectedDiscoveries.add(discovery.id);
        
        // Grant XP
        if (this.consciousness) {
            this.consciousness.addXP(discovery.type.xpReward, 'discovery');
            this.log(`+${discovery.type.xpReward} XP from discovery`);
        }
        
        // Unlock lore
        if (discovery.loreId && this.lore) {
            const unlocked = this.lore.unlock(discovery.loreId);
            if (unlocked) {
                this.log(`Lore unlocked: ${discovery.loreId}`);
            }
        }
        
        // Update game state
        if (this.gameState) {
            this.gameState.incrementDiscoveryCount();
        }
        
        // Remove marker from map
        if (this.mapManager && typeof this.mapManager.removeDiscoveryMarker === 'function') {
            this.mapManager.removeDiscoveryMarker(discovery.id);
        }
        
        // Show notification
        this.showDiscoveryNotification(discovery);
        
        // Play collection sound (optional - implement later)
        // this.playCollectionSound();
        
        // Remove from active discoveries
        this.activeDiscoveries.delete(discovery.id);
        
        // Dispatch event
        this.dispatchEvent(new CustomEvent('discoverycollected', {
            detail: { discovery }
        }));
        
        this.log(`✓ Discovery collected successfully`);
    }
    
    /**
     * Calculate distance between two positions (Haversine formula)
     */
    calculateDistance(pos1, pos2) {
        const R = 6371000; // Earth's radius in meters
        const φ1 = pos1.lat * Math.PI / 180;
        const φ2 = pos2.lat * Math.PI / 180;
        const Δφ = (pos2.lat - pos1.lat) * Math.PI / 180;
        const Δλ = (pos2.lng - pos1.lng) * Math.PI / 180;
        
        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                  Math.cos(φ1) * Math.cos(φ2) *
                  Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        
        return R * c; // Distance in meters
    }
    
    /**
     * Show discovery notification
     */
    showDiscoveryNotification(discovery) {
        const message = `✨ Discovery found!\n${discovery.type.icon} ${discovery.type.name}\n+${discovery.type.xpReward} XP`;
        
        // Use notification system if available
        if (window.notificationSystem) {
            window.notificationSystem.show(message, 'success', 4000);
        } else {
            // Fallback to console
            this.log(message);
        }
        
        // Show lore unlock notification if applicable
        if (discovery.loreId) {
            setTimeout(() => {
                const loreMessage = `📖 Lore entry unlocked!\nCheck your Codex`;
                if (window.notificationSystem) {
                    window.notificationSystem.show(loreMessage, 'info', 3000);
                }
            }, 500);
        }
    }
    
    /**
     * Get all active discoveries
     */
    getActiveDiscoveries() {
        return Array.from(this.activeDiscoveries.values());
    }
    
    /**
     * Get discovery count
     */
    getDiscoveryCount() {
        return this.collectedDiscoveries.size;
    }
    
    /**
     * Get discovery by ID
     */
    getDiscovery(id) {
        return this.activeDiscoveries.get(id);
    }
    
    /**
     * TESTING HELPER: Force collect nearest discovery
     * Usage in console: game.systems.discovery.testCollectNearest()
     */
    testCollectNearest() {
        const discoveries = this.getActiveDiscoveries();
        if (discoveries.length === 0) {
            this.log('No active discoveries to collect');
            return;
        }
        
        const nearest = discoveries[0];
        this.log(`🧪 TEST: Force collecting ${nearest.type.name}`);
        this.collectDiscovery(nearest);
    }
    
    /**
     * TESTING HELPER: List all active discoveries with distances
     * Usage in console: game.systems.discovery.listDiscoveries()
     */
    listDiscoveries() {
        const discoveries = this.getActiveDiscoveries();
        console.log(`\n📍 Active Discoveries (${discoveries.length}):\n`);
        
        discoveries.forEach((d, index) => {
            console.log(`${index + 1}. ${d.type.icon} ${d.type.name} (${d.type.rarity})`);
            console.log(`   Position: ${d.position.lat.toFixed(6)}, ${d.position.lng.toFixed(6)}`);
            console.log(`   XP Reward: ${d.type.xpReward}`);
            console.log('');
        });
        
        console.log('💡 To collect nearest: game.systems.discovery.testCollectNearest()');
    }
    
    /**
     * Logging
     */
    log(...args) {
        if (GameConfig?.debug?.logging !== false) {
            console.log('[DiscoverySystem]', ...args);
        }
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DiscoverySystem;
}

