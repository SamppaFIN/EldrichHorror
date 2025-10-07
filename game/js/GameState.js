/**
 * GAME STATE MANAGER
 * 
 * FIXES: Player data persistence (BRDC-PLAYER-001)
 * - Proper localStorage handling
 * - Auto-save intervals
 * - Data validation
 * - Backup/restore
 */

class GameState extends EventTarget {
    constructor() {
        super();
        
        this.state = {
            player: {
                id: this.generatePlayerId(),
                name: 'Consciousness Walker',
                createdAt: Date.now(),
                lastSaveAt: null,
                totalPlayTime: 0,
                // BRDC: BRDC-DISCOVERY-SYSTEM-005
                totalDiscoveries: 0,
                discoveryHistory: []
            },
            consciousness: null, // Will be set by ConsciousnessEngine
            position: null, // Will be set by GeolocationManager
            journey: {
                startPosition: null,
                totalDistance: 0,
                steps: 0,
                placesVisited: []
            },
            encounters: {
                aurora: [],
                cthulhu: [],
                sacredSpaces: [],
                portals: []
            },
            settings: {
                theme: 'cosmic',
                soundEnabled: true,
                musicEnabled: true,
                notificationsEnabled: true,
                mapStyle: 'cosmic'
            }
        };
        
        this.autoSaveInterval = null;
        this.sessionStartTime = Date.now();
        this.isDirty = false; // Has unsaved changes
        
        this.log('GameState initialized');
    }
    
    /**
     * Initialize and load from localStorage
     */
    async initialize() {
        this.log('Loading game state...');
        
        try {
            const loaded = this.load();
            
            if (loaded) {
                this.log('✓ Game state loaded from localStorage');
                
                this.dispatchEvent(new CustomEvent('loaded', {
                    detail: { state: this.state, isNew: false }
                }));
            } else {
                this.log('No saved game found, starting fresh');
                
                this.dispatchEvent(new CustomEvent('loaded', {
                    detail: { state: this.state, isNew: true }
                }));
            }
            
            // Start auto-save
            this.startAutoSave();
            
            return true;
        } catch (error) {
            this.log('ERROR loading state:', error);
            return false;
        }
    }
    
    /**
     * Load from localStorage
     */
    load() {
        try {
            const savedPlayer = localStorage.getItem(GameConfig.storage.playerData);
            const savedState = localStorage.getItem(GameConfig.storage.gameState);
            const savedLore = localStorage.getItem(GameConfig.storage.loreUnlocked);
            const savedSettings = localStorage.getItem(GameConfig.storage.settings);
            
            if (!savedPlayer || !savedState) {
                return false; // No save found
            }
            
            // Parse and validate
            const playerData = JSON.parse(savedPlayer);
            const stateData = JSON.parse(savedState);
            
            // Merge into current state
            this.state.player = { ...this.state.player, ...playerData };
            this.state.journey = { ...this.state.journey, ...stateData.journey };
            this.state.encounters = { ...this.state.encounters, ...stateData.encounters };
            
            if (savedSettings) {
                this.state.settings = { ...this.state.settings, ...JSON.parse(savedSettings) };
            }
            
            // Consciousness data will be loaded separately by ConsciousnessEngine
            
            this.log(`Loaded player: ${this.state.player.name} (${this.state.player.id})`);
            
            return true;
        } catch (error) {
            this.log('ERROR parsing saved data:', error);
            return false;
        }
    }
    
    /**
     * Save to localStorage
     */
    save() {
        try {
            // Update save timestamp and playtime
            const now = Date.now();
            const sessionTime = now - this.sessionStartTime;
            this.state.player.totalPlayTime += sessionTime;
            this.state.player.lastSaveAt = now;
            this.sessionStartTime = now; // Reset for next interval
            
            // Save player data
            localStorage.setItem(
                GameConfig.storage.playerData,
                JSON.stringify(this.state.player)
            );
            
            // Save game state
            localStorage.setItem(
                GameConfig.storage.gameState,
                JSON.stringify({
                    journey: this.state.journey,
                    encounters: this.state.encounters
                })
            );
            
            // Save settings
            localStorage.setItem(
                GameConfig.storage.settings,
                JSON.stringify(this.state.settings)
            );
            
            this.isDirty = false;
            
            this.log('✓ Game saved');
            
            this.dispatchEvent(new CustomEvent('saved', {
                detail: { timestamp: now }
            }));
            
            return true;
        } catch (error) {
            this.log('ERROR saving:', error);
            
            // Check if localStorage is full
            if (error.name === 'QuotaExceededError') {
                this.log('LocalStorage quota exceeded!');
                
                this.dispatchEvent(new CustomEvent('saveerror', {
                    detail: { error: 'quota_exceeded' }
                }));
            }
            
            return false;
        }
    }
    
    /**
     * Start auto-save interval
     */
    startAutoSave(intervalMs = 30000) { // Default 30 seconds
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }
        
        this.autoSaveInterval = setInterval(() => {
            if (this.isDirty) {
                this.log('Auto-saving...');
                this.save();
            }
        }, intervalMs);
        
        this.log(`Auto-save started (${intervalMs / 1000}s interval)`);
    }
    
    /**
     * Stop auto-save
     */
    stopAutoSave() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
            this.log('Auto-save stopped');
        }
    }
    
    /**
     * Mark state as dirty (has unsaved changes)
     */
    markDirty() {
        this.isDirty = true;
    }
    
    /**
     * Update player data
     */
    updatePlayer(updates) {
        this.state.player = { ...this.state.player, ...updates };
        this.markDirty();
        
        this.dispatchEvent(new CustomEvent('playerupdated', {
            detail: { player: this.state.player }
        }));
    }
    
    /**
     * Update consciousness data
     */
    updateConsciousness(consciousnessData) {
        this.state.consciousness = consciousnessData;
        this.markDirty();
    }
    
    /**
     * Update position
     */
    updatePosition(position) {
        // Set start position if first time
        if (!this.state.journey.startPosition) {
            this.state.journey.startPosition = {
                lat: position.lat,
                lng: position.lng,
                timestamp: Date.now()
            };
        }
        
        this.state.position = position;
        this.markDirty();
    }
    
    /**
     * Record step (movement)
     */
    recordStep(distance) {
        this.state.journey.steps++;
        this.state.journey.totalDistance += distance;
        this.markDirty();
        
        this.dispatchEvent(new CustomEvent('step', {
            detail: {
                steps: this.state.journey.steps,
                distance: this.state.journey.totalDistance
            }
        }));
    }
    
    /**
     * Record place visit
     */
    visitPlace(placeId, type, position) {
        const visit = {
            placeId,
            type,
            position: { lat: position.lat, lng: position.lng },
            timestamp: Date.now()
        };
        
        this.state.journey.placesVisited.push(visit);
        this.markDirty();
        
        this.dispatchEvent(new CustomEvent('placevisited', {
            detail: visit
        }));
    }
    
    /**
     * Record encounter
     */
    recordEncounter(type, data) {
        const encounter = {
            ...data,
            timestamp: Date.now()
        };
        
        if (this.state.encounters[type]) {
            this.state.encounters[type].push(encounter);
        }
        
        this.markDirty();
        
        this.dispatchEvent(new CustomEvent('encounter', {
            detail: { type, encounter }
        }));
    }
    
    /**
     * Update settings
     */
    updateSettings(updates) {
        this.state.settings = { ...this.state.settings, ...updates };
        this.markDirty();
        this.save(); // Save immediately for settings
        
        this.dispatchEvent(new CustomEvent('settingsupdated', {
            detail: { settings: this.state.settings }
        }));
    }
    
    /**
     * Get current state
     */
    getState() {
        return { ...this.state };
    }
    
    /**
     * Get player stats
     */
    getStats() {
        return {
            playTime: this.formatPlayTime(this.state.player.totalPlayTime),
            distance: this.formatDistance(this.state.journey.totalDistance),
            steps: this.state.journey.steps,
            placesVisited: this.state.journey.placesVisited.length,
            totalEncounters: Object.values(this.state.encounters).reduce((sum, arr) => sum + arr.length, 0)
        };
    }
    
    /**
     * Export save data (for backup)
     */
    exportSave() {
        const saveData = {
            version: GameConfig.version,
            exportedAt: Date.now(),
            player: this.state.player,
            journey: this.state.journey,
            encounters: this.state.encounters,
            consciousness: this.state.consciousness,
            settings: this.state.settings
        };
        
        const json = JSON.stringify(saveData, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        return { url, filename: `klitoritari_save_${Date.now()}.json` };
    }
    
    /**
     * Import save data (from backup)
     */
    async importSave(jsonData) {
        try {
            const saveData = JSON.parse(jsonData);
            
            // Validate version (basic check)
            if (!saveData.version || !saveData.player) {
                throw new Error('Invalid save data');
            }
            
            // Restore state
            this.state.player = saveData.player;
            this.state.journey = saveData.journey;
            this.state.encounters = saveData.encounters;
            this.state.consciousness = saveData.consciousness;
            this.state.settings = saveData.settings || this.state.settings;
            
            // Save to localStorage
            this.save();
            
            this.log('✓ Save imported successfully');
            
            this.dispatchEvent(new CustomEvent('imported'));
            
            return true;
        } catch (error) {
            this.log('ERROR importing save:', error);
            return false;
        }
    }
    
    /**
     * Reset game (delete all progress)
     */
    reset() {
        if (!confirm('⚠️ This will delete ALL your progress. Are you sure?')) {
            return false;
        }
        
        // Clear localStorage
        localStorage.removeItem(GameConfig.storage.playerData);
        localStorage.removeItem(GameConfig.storage.gameState);
        localStorage.removeItem(GameConfig.storage.achievements);
        localStorage.removeItem(GameConfig.storage.loreUnlocked);
        
        this.log('Game reset');
        
        // Reload page
        window.location.reload();
        
        return true;
    }
    
    /**
     * Generate unique player ID
     */
    generatePlayerId() {
        return `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    /**
     * Format playtime
     */
    formatPlayTime(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes % 60}m`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds % 60}s`;
        } else {
            return `${seconds}s`;
        }
    }
    
    /**
     * Format distance
     */
    formatDistance(meters) {
        if (meters >= 1000) {
            return `${(meters / 1000).toFixed(2)} km`;
        } else {
            return `${Math.floor(meters)} m`;
        }
    }
    
    /**
     * Increment discovery count
     * BRDC: BRDC-DISCOVERY-SYSTEM-005
     */
    incrementDiscoveryCount() {
        this.state.player.totalDiscoveries++;
        this.markDirty();
        
        // Update HUD
        const discoveryCounter = document.getElementById('achievements-count');
        if (discoveryCounter) {
            discoveryCounter.textContent = this.state.player.totalDiscoveries;
        }
        
        this.log(`Discovery count: ${this.state.player.totalDiscoveries}`);
        
        this.dispatchEvent(new CustomEvent('discoveryincremented', {
            detail: { total: this.state.player.totalDiscoveries }
        }));
    }
    
    /**
     * Add discovery to history
     * BRDC: BRDC-DISCOVERY-SYSTEM-005
     */
    addDiscoveryToHistory(discoveryId, discoveryType) {
        this.state.player.discoveryHistory.push({
            id: discoveryId,
            type: discoveryType,
            timestamp: Date.now()
        });
        this.markDirty();
    }
    
    /**
     * Get discovery stats
     * BRDC: BRDC-DISCOVERY-SYSTEM-005
     */
    getDiscoveryStats() {
        return {
            total: this.state.player.totalDiscoveries,
            history: this.state.player.discoveryHistory
        };
    }
    
    /**
     * Cleanup on unload
     */
    cleanup() {
        this.log('Cleaning up...');
        this.stopAutoSave();
        this.save(); // Final save
    }
    
    /**
     * Logging
     */
    log(...args) {
        if (GameConfig?.debug?.logging !== false) {
            console.log('[GameState]', ...args);
        }
    }
}

// Auto-save on page unload
window.addEventListener('beforeunload', () => {
    if (window.gameState) {
        window.gameState.cleanup();
    }
});

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameState;
}

