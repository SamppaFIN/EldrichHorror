/**
 * GAME STATE MANAGER
 * Handles player data, persistence, and game state
 */

class GameState {
    constructor() {
        this.state = {
            player: {
                id: null,
                name: 'Consciousness Walker',
                consciousnessLevel: 1,
                totalDiscoveries: 0,
                totalEncounters: 0,
                totalSteps: 0,
                xp: 0,
                lastPosition: null,
                lastActive: Date.now()
            },
            settings: {
                debugMovement: false,
                soundEnabled: true,
                musicEnabled: true,
                notificationsEnabled: true
            },
            game: {
                version: GameConfig.version,
                firstPlay: true,
                lastSave: null
            }
        };
        
        this.autoSaveInterval = null;
    }
    
    /**
     * Initialize game state
     */
    async initialize() {
        this.log('GameState initialized');
        await this.load();
        this.startAutoSave();
    }
    
    /**
     * Load game state from localStorage
     */
    async load() {
        try {
            this.log('Loading game state...');
            
            const saved = localStorage.getItem(GameConfig.storage.gameState);
            if (saved) {
                const parsed = JSON.parse(saved);
                this.state = { ...this.state, ...parsed };
                this.log('✓ Game state loaded from localStorage');
            } else {
                this.log('No saved game state found, using defaults');
            }
            
            // Load settings
            this.loadSettings();
            
            // Generate player ID if needed
            if (!this.state.player.id) {
                this.state.player.id = this.generatePlayerID();
            }
            
            this.log('Loaded player:', this.state.player.name);
            
        } catch (error) {
            console.error('Failed to load game state:', error);
        }
    }
    
    /**
     * Save game state to localStorage
     */
    save() {
        try {
            this.state.game.lastSave = Date.now();
            localStorage.setItem(GameConfig.storage.gameState, JSON.stringify(this.state));
            this.log('Game state saved');
        } catch (error) {
            console.error('Failed to save game state:', error);
        }
    }
    
    /**
     * Load settings from localStorage
     */
    loadSettings() {
        try {
            const saved = localStorage.getItem(GameConfig.storage.settings);
            if (saved) {
                const parsed = JSON.parse(saved);
                this.state.settings = { ...this.state.settings, ...parsed };
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
        }
    }
    
    /**
     * Save settings to localStorage
     */
    saveSettings() {
        try {
            localStorage.setItem(GameConfig.storage.settings, JSON.stringify(this.state.settings));
        } catch (error) {
            console.error('Failed to save settings:', error);
        }
    }
    
    /**
     * Update settings
     */
    updateSettings(updates) {
        this.state.settings = { ...this.state.settings, ...updates };
        this.saveSettings();
        this.save();
    }
    
    /**
     * Increment discovery count
     */
    incrementDiscoveryCount() {
        this.state.player.totalDiscoveries++;
        this.save();
        
        // Update HUD
        const achievementsEl = document.getElementById('achievements-count');
        if (achievementsEl) {
            achievementsEl.textContent = this.state.player.totalDiscoveries;
        }
        
        this.log(`Discovery count: ${this.state.player.totalDiscoveries}`);
    }
    
    /**
     * Increment encounter count
     */
    incrementEncounterCount() {
        this.state.player.totalEncounters++;
        this.save();
    }
    
    /**
     * Update player position
     */
    updatePosition(lat, lng) {
        this.state.player.lastPosition = { lat, lng };
        this.state.player.lastActive = Date.now();
        this.save();
    }
    
    /**
     * Get player position
     */
    getPosition() {
        return this.state.player.lastPosition;
    }
    
    /**
     * Generate unique player ID
     */
    generatePlayerID() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 9);
        return `player_${timestamp}_${random}`;
    }
    
    /**
     * Start auto-save
     */
    startAutoSave() {
        this.autoSaveInterval = setInterval(() => {
            this.save();
        }, 30000); // Save every 30 seconds
        this.log('Auto-save started (30s interval)');
    }
    
    /**
     * Stop auto-save
     */
    stopAutoSave() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
        }
    }
    
    /**
     * Get game state
     */
    getState() {
        return this.state;
    }
    
    /**
     * Reset game state
     */
    reset() {
        this.state.player = {
            id: this.generatePlayerID(),
            name: 'Consciousness Walker',
            consciousnessLevel: 1,
            totalDiscoveries: 0,
            totalEncounters: 0,
            totalSteps: 0,
            xp: 0,
            lastPosition: null,
            lastActive: Date.now()
        };
        this.save();
    }
    
    /**
     * Logging
     */
    log(...args) {
        console.log('[GameState]', ...args);
    }
}