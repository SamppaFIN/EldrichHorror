/**
 * ELDRITCH SANCTUARY - GAME CONFIGURATION
 * Sacred constants and settings
 */

const GameConfig = {
    version: '1.0.0-alpha',
    
    // Game Modes
    offlineMode: false,
    testingMode: false,
    
    // Storage Keys
    storage: {
        gameState: 'eldritch_game_state',
        achievements: 'eldritch_achievements',
        loreUnlocked: 'eldritch_lore_unlocked',
        playerPosition: 'eldritch_player_position',
        settings: 'eldritch_settings'
    },
    
    // Discovery System
    discovery: {
        spawnRadius: 200, // meters
        maxDiscoveries: 10,
        collectionRadius: 5, // meters
        respawnTime: 300000, // 5 minutes
        types: [
            { name: 'Cosmic Fragment', rarity: 'common', xp: 10 },
            { name: 'Eldritch Rune', rarity: 'uncommon', xp: 25 },
            { name: 'Sacred Sigil', rarity: 'rare', xp: 50 },
            { name: 'Void Crystal', rarity: 'epic', xp: 100 },
            { name: 'Reality Shard', rarity: 'legendary', xp: 250 }
        ]
    },
    
    // Consciousness System
    consciousness: {
        baseXP: 1000,
        levelMultiplier: 1.5,
        passiveXPRate: 1, // XP per minute
        encounterXP: 50
    },
    
    // Geolocation
    geolocation: {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
        simulator: {
            enabled: false,
            walkingSpeed: 1.4, // m/s
            updateInterval: 1000, // ms
            patterns: ['straight', 'curve', 'random', 'stop'],
            accuracy: 7 // meters
        }
    },
    
    // Map Settings
    map: {
        defaultZoom: 16,
        minZoom: 10,
        maxZoom: 20,
        tileLayer: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '© OpenStreetMap contributors'
    },
    
    // Audio
    audio: {
        masterVolume: 0.7,
        musicVolume: 0.5,
        sfxVolume: 0.8,
        ambientVolume: 0.6
    },
    
    // UI
    ui: {
        notificationDuration: 3000,
        loadingTimeout: 10000,
        animationDuration: 300
    }
};

// Freeze config to prevent modification
Object.freeze(GameConfig);