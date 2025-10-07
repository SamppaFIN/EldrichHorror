/**
 * ELDRITCH SANCTUARY - GAME CONFIGURATION
 * Sacred constants and settings
 */

const GameConfig = {
    // Game Version
    version: '1.0.0-alpha',
    
    // OFFLINE/TESTING MODE - Set true to play without internet
    offlineMode: false, // Auto-detected if no connection
    testingMode: false,  // Manual override for full testing features
    
    // Map Settings
    map: {
        initialZoom: 16,
        minZoom: 10,
        maxZoom: 19,
        defaultCenter: [60.1699, 24.9384], // Helsinki (fallback)
        
        // Map Styles (using free OpenStreetMap)
        tileLayerUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '© OpenStreetMap contributors | Eldritch Sanctuary',
        
        // Dark theme - CartoDB Dark Matter (free, no API key)
        cosmicTileUrl: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        cosmicAttribution: '© OpenStreetMap © CartoDB | Eldritch Sanctuary',
        
        // OFFLINE FALLBACK: Canvas-rendered map (no internet required)
        offlineFallback: {
            enabled: true,
            backgroundColor: '#0a0e27',
            gridColor: '#8b5cf6',
            labelColor: '#fbbf24'
        }
    },
    
    // Geolocation Settings
    geolocation: {
        enableHighAccuracy: true,
        timeout: 10000, // 10 seconds
        maximumAge: 5000, // 5 seconds
        retryAttempts: 3,
        retryDelay: 2000, // 2 seconds
        
        // Simulator mode (for testing without GPS/internet)
        simulator: {
            enabled: false, // Auto-enabled in offline/testing mode
            startPosition: null, // null = use default or last known
            
            // Realistic walking simulation
            walkingSpeed: 1.4, // meters per second (normal human walking)
            updateInterval: 1000, // Update position every 1 second
            
            // Movement patterns
            patterns: {
                straight: { enabled: true, changeInterval: 30000 }, // 30s straight walks
                curve: { enabled: true, turnRate: 5 }, // degrees per update
                random: { enabled: true, probability: 0.1 }, // 10% chance to change direction
                stop: { enabled: true, probability: 0.05, duration: 5000 } // 5% chance to stop for 5s
            },
            
            // GPS accuracy simulation
            accuracy: {
                base: 7, // meters (typical smartphone GPS)
                variation: 3, // ±3m random variance
                degradation: false // Simulate signal loss
            }
        }
    },
    
    // Consciousness System
    consciousness: {
        startingLevel: 1,
        maxLevel: 100,
        xpPerLevel: 100,
        xpCurve: 1.2, // Exponential growth
        
        // XP Sources
        xpGains: {
            walking: 1, // per step
            discovery: 10, // finding new location
            encounter: 25, // NPC interaction
            quest: 50, // completing quest
            achievement: 100 // unlocking achievement
        },
        
        // Consciousness stages
        stages: [
            { level: 1, name: 'Dormant', color: '#8b5cf6' },
            { level: 25, name: 'Awakening', color: '#14b8a6' },
            { level: 50, name: 'Aware', color: '#fbbf24' },
            { level: 75, name: 'Enlightened', color: '#10b981' },
            { level: 100, name: 'Transcendent', color: '#f8fafc' }
        ]
    },
    
    // Movement & Steps
    movement: {
        stepThreshold: 10, // meters per step
        updateInterval: 5000, // Check position every 5 seconds
        maxSpeed: 50 // meters/second (sanity check)
    },
    
    // Markers & Entities
    markers: {
        // Spawn distances
        spawnDistance: {
            aurora: 500, // meters
            cthulhu: 1000, // meters
            portal: 2000, // meters
            sacredSpace: 300 // meters
        },
        
        // Spawn rates (0-1 probability)
        spawnRate: {
            aurora: 0.3,
            cthulhu: 0.1,
            portal: 0.05,
            sacredSpace: 0.2
        },
        
        // Interaction distances
        interactionDistance: {
            aurora: 20, // meters
            cthulhu: 30, // meters
            portal: 10, // meters
            sacredSpace: 15 // meters
        }
    },
    
    // Lore System
    lore: {
        entries: [
            {
                id: 'awakening',
                title: 'The Awakening',
                unlockCondition: 'tutorial_complete',
                consciousnessReward: 10
            },
            {
                id: 'aurora-first-meeting',
                title: 'Aurora, The Dawn Bringer',
                unlockCondition: 'meet_aurora',
                consciousnessReward: 15
            },
            {
                id: 'cthulhu-first-encounter',
                title: 'The Dreaming Deep',
                unlockCondition: 'encounter_cthulhu',
                consciousnessReward: 25
            },
            {
                id: 'sacred-space-discovery',
                title: 'Sacred Geometry Revealed',
                unlockCondition: 'enter_sacred_space',
                consciousnessReward: 20
            },
            {
                id: 'portal-transit',
                title: 'Between Dimensions',
                unlockCondition: 'use_portal',
                consciousnessReward: 30
            }
        ]
    },
    
    // Local Storage Keys
    storage: {
        playerData: 'klitoritari_player',
        gameState: 'klitoritari_state',
        achievements: 'klitoritari_achievements',
        loreUnlocked: 'klitoritari_lore',
        settings: 'klitoritari_settings'
    },
    
    // UI Settings
    ui: {
        notificationDuration: 3000, // ms
        modalAnimationSpeed: 300, // ms
        hudUpdateInterval: 1000, // ms
        
        // Themes
        themes: ['cosmic', 'eldritch', 'sacred', 'void'],
        defaultTheme: 'cosmic'
    },
    
    // Performance
    performance: {
        maxMarkers: 100, // Max markers on map at once
        markerCulling: true, // Remove markers outside viewport
        animationQuality: 'high', // 'low', 'medium', 'high'
        particleEffects: true,
        reducedMotion: false // Auto-detect from system
    },
    
    // Debug
    debug: {
        enabled: false, // Set true for development
        logging: true,
        showCoordinates: false,
        simulatorControls: false,
        skipTutorial: false
    },
    
    // Sacred Principles (for consciousness validation)
    sacredPrinciples: {
        consciousnessFirst: true,
        communityHealing: true,
        spatialWisdom: true,
        infiniteCollaboration: true
    }
};

// Auto-detect reduced motion preference
if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    GameConfig.performance.reducedMotion = true;
    GameConfig.performance.animationQuality = 'low';
}

// Freeze config to prevent accidental modifications
Object.freeze(GameConfig);

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameConfig;
}

