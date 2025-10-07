/**
 * ELDRITCH SANCTUARY - MAIN GAME
 * Initializes all systems and manages game loop
 */

class EldritchSanctuary {
    constructor() {
        this.isInitialized = false;
        this.systems = {};
        
        this.log('🌸 Eldritch Sanctuary initializing...');
    }
    
    /**
     * Initialize all game systems
     */
    async initialize() {
        try {
            // Show loading screen
            this.showLoadingScreen();
            
            // Initialize core systems
            this.log('Initializing core systems...');
            
            // Game State (must be first - handles saves)
            this.systems.gameState = new GameState();
            await this.systems.gameState.initialize();
            
            // Consciousness Engine
            this.systems.consciousness = new ConsciousnessEngine();
            const savedConsciousness = JSON.parse(
                localStorage.getItem(GameConfig.storage.achievements) || 'null'
            );
            this.systems.consciousness.initialize(savedConsciousness);
            
            // Lore System
            this.systems.lore = new LoreSystem();
            const savedLore = JSON.parse(
                localStorage.getItem(GameConfig.storage.loreUnlocked) || '[]'
            );
            this.systems.lore.initialize(savedLore);
            
            // Geolocation Manager
            this.systems.geolocation = new GeolocationManager(GameConfig.geolocation);
            const gpsInitialized = await this.systems.geolocation.initialize();
            
            if (!gpsInitialized) {
                this.log('⚠️ GPS initialization failed, but continuing with simulator/fallback');
            }
            
            // Map Manager (with initial position if available)
            let initialPosition = this.systems.geolocation.getPosition();
            
            // Try to load saved position if no GPS position yet
            this.systems.map = new MapManager('map', GameConfig);
            if (!initialPosition) {
                initialPosition = this.systems.map.loadPlayerPosition();
                if (initialPosition) {
                    this.log('Using saved player position from localStorage');
                }
            }
            
            this.systems.map.initialize(initialPosition);
            
            // Force map to resize after DOM is ready
            setTimeout(() => {
                if (this.systems.map.map) {
                    this.systems.map.map.invalidateSize();
                    this.log('✓ Map resized');
                }
            }, 100);
            
            // Notification System - BRDC-DISCOVERY-SYSTEM-005
            this.systems.notifications = new NotificationSystem();
            this.log('✓ NotificationSystem initialized');
            
            // Audio System - BRDC-AUDIO-SYSTEM-010
            this.systems.audio = new AudioSystem();
            const audioInitialized = await this.systems.audio.initialize();
            if (audioInitialized) {
                this.log('✓ AudioSystem initialized');
                // BRDC-010-CALM: Start calming ambient after initialization
                this.systems.audio.startCalmingAmbient();
            } else {
                this.log('⚠️ AudioSystem failed to initialize, continuing without sound');
            }
            
            // Discovery System - BRDC-DISCOVERY-SYSTEM-005
            this.systems.discovery = new DiscoverySystem(
                this.systems.gameState,
                this.systems.map,
                this.systems.consciousness,
                this.systems.lore,
                this.systems.geolocation, // BRDC-007: Add geolocation reference
                this.systems.audio // BRDC-010: Add audio system reference
            );
            
            // Initialize with player position (reuse initialPosition from above)
            if (initialPosition) {
                this.systems.discovery.initialize(initialPosition);
            }
            this.log('✓ DiscoverySystem initialized');
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Start tracking
            this.systems.geolocation.startTracking();
            
            // Initial game state
            if (initialPosition) {
                this.log(`📍 Initial position: ${initialPosition.lat}, ${initialPosition.lng}`);
                this.systems.map.updatePlayerMarker(initialPosition, this.systems.consciousness.state.level);
                this.systems.map.spawnMarkersAroundPlayer(8); // Spawn initial markers
            } else {
                this.log('⚠️ No initial position available - waiting for GPS');
            }
            
            // Update HUD
            this.updateHUD();
            
            // Hide loading screen and show game
            this.hideLoadingScreen();
            document.getElementById('game-container')?.classList.remove('hidden');
            
            // Force center on player after a short delay (ensure map is fully rendered)
            setTimeout(() => {
                const currentPos = this.systems.geolocation.getPosition();
                if (currentPos) {
                    this.log(`🎯 Centering map on player: ${currentPos.lat}, ${currentPos.lng}`);
                    this.systems.map.centerOnPlayer(16); // Zoom level 16
                    this.systems.map.map.invalidateSize(); // Force map refresh
                }
            }, 500);
            
            // Show welcome message
            if (this.systems.gameState.getState().player.totalPlayTime === 0) {
                this.showWelcomeModal();
            }
            
            this.isInitialized = true;
            this.log('✓ All systems initialized successfully!');
            
            // Start game loop
            this.startGameLoop();
            
        } catch (error) {
            this.log('ERROR during initialization:', error);
            this.showError('Failed to initialize game. Please refresh and try again.');
        }
    }
    
    /**
     * Set up event listeners across all systems
     */
    setupEventListeners() {
        // Geolocation events
        this.systems.geolocation.addEventListener('positionupdate', (e) => {
            const { position, distance } = e.detail;
            
            // Update map
            this.systems.map.updatePlayerMarker(position, this.systems.consciousness.state.level);
            
            // Update game state
            this.systems.gameState.updatePosition(position);
            
            // Update discovery system (proximity detection) - BRDC-DISCOVERY-SYSTEM-005
            if (this.systems.discovery) {
                this.systems.discovery.update(position);
            }
            
            // Check for steps
            if (distance >= GameConfig.movement.stepThreshold) {
                this.handleStep(distance);
            }
            
            // Check for nearby interactions
            this.checkNearbyInteractions(position);
        });
        
        this.systems.geolocation.addEventListener('error', (e) => {
            this.log('GPS Error:', e.detail.error);
            this.showNotification('GPS signal lost. Using last known position.', 'warning');
        });
        
        // Consciousness events
        this.systems.consciousness.addEventListener('levelup', (e) => {
            const { level, stage, stageChanged } = e.detail;
            
            this.showNotification(`✨ Level Up! You are now level ${level}`, 'success');
            
            if (stageChanged) {
                this.showStageTransitionModal(stage);
            }
            
            this.updateHUD();
        });
        
        this.systems.consciousness.addEventListener('xpgain', (e) => {
            this.updateHUD();
        });
        
        this.systems.consciousness.addEventListener('achievementunlocked', (e) => {
            const { name, description } = e.detail;
            this.showNotification(`🏆 Achievement: ${name}`, 'success');
        });
        
        // Lore events
        this.systems.lore.addEventListener('loreunlocked', (e) => {
            const entry = e.detail;
            this.showLoreModal(entry);
        });
        
        // Map events
        this.systems.map.addEventListener('mapclick', (e) => {
            this.log('Map clicked:', e.detail.latlng);
        });
        
        // Game state events
        this.systems.gameState.addEventListener('saved', () => {
            this.log('✓ Game saved');
        });
        
        // UI Events
        this.setupUIEventListeners();
    }
    
    /**
     * Set up UI event listeners
     */
    setupUIEventListeners() {
        // Center on player button
        document.getElementById('center-map-btn')?.addEventListener('click', () => {
            this.systems.map.centerOnPlayer();
        });
        
        // BRDC-007: Manual proximity check button
        document.getElementById('check-proximity-btn')?.addEventListener('click', () => {
            if (this.systems.discovery) {
                this.systems.discovery.manualProximityCheck();
            }
        });
        
        // BRDC-007: Reshuffle discoveries button
        document.getElementById('reshuffle-discoveries-btn')?.addEventListener('click', () => {
            if (this.systems.discovery) {
                this.systems.discovery.reshuffleDiscoveries();
            }
        });
        
        // Codex button
        document.getElementById('codex-btn')?.addEventListener('click', () => {
            this.showModal('codex-modal');
        });
        
        // Settings button
        document.getElementById('settings-btn')?.addEventListener('click', () => {
            this.toggleSettings();
        });
        
        // Modal close buttons
        document.getElementById('codex-close')?.addEventListener('click', () => {
            this.hideModal('codex-modal');
        });
        
        document.getElementById('start-journey-btn')?.addEventListener('click', () => {
            this.hideModal('tutorial-modal');
            document.getElementById('game-container')?.classList.remove('hidden');
        });
    }
    
    /**
     * Handle player step (movement)
     */
    handleStep(distance) {
        // Award movement XP
        const xp = Math.floor(distance / GameConfig.movement.stepThreshold);
        this.systems.consciousness.awardXP(xp, 'walking');
        
        // Record in game state
        this.systems.gameState.recordStep(distance);
        
        // Update HUD
        this.updateHUD();
    }
    
    /**
     * Check for nearby interactions
     */
    checkNearbyInteractions(position) {
        const nearbyMarkers = this.systems.map.getMarkersInRadius(
            position,
            50, // 50 meters
            null // All types
        );
        
        for (const marker of nearbyMarkers) {
            // Auto-interact or show notification
            this.log(`Nearby: ${marker.type} at ${marker.distance.toFixed(0)}m`);
        }
    }
    
    /**
     * Interact with game element
     */
    interact(type, id) {
        this.log(`Interacting with ${type}: ${id}`);
        
        const marker = this.systems.map.markers.get(id);
        if (!marker) return;
        
        const position = this.systems.geolocation.getPosition();
        if (!position) return;
        
        const markerPos = marker.marker.getLatLng();
        const distance = this.systems.map.calculateDistance(
            position.lat,
            position.lng,
            markerPos.lat,
            markerPos.lng
        );
        
        // Check if in range
        const maxDistance = GameConfig.markers.interactionDistance[type] || 20;
        if (distance > maxDistance) {
            this.showNotification(`You're too far away (${distance.toFixed(0)}m). Get within ${maxDistance}m.`, 'warning');
            return;
        }
        
        // Handle interaction by type
        switch (type) {
            case 'aurora':
                this.interactWithAurora(id);
                break;
            case 'cthulhu':
                this.interactWithCthulhu(id);
                break;
            case 'sacredSpace':
                this.interactWithSacredSpace(id);
                break;
            case 'portal':
                this.interactWithPortal(id);
                break;
        }
    }
    
    /**
     * Interact with Aurora
     */
    interactWithAurora(id) {
        this.systems.consciousness.awardXP(25, 'aurora_encounter');
        this.systems.lore.unlock('aurora-first-meeting');
        this.systems.gameState.recordEncounter('aurora', { id, timestamp: Date.now() });
        
        this.showNotification('✨ Aurora shares her wisdom with you', 'success');
        
        // Remove marker after interaction
        setTimeout(() => {
            this.systems.map.removeMarker(id);
        }, 3000);
    }
    
    /**
     * Interact with Cthulhu
     */
    interactWithCthulhu(id) {
        // Requires higher consciousness
        if (this.systems.consciousness.state.level < 10) {
            this.showNotification('👁️ Your mind reels... you are not ready to perceive this entity.', 'warning');
            return;
        }
        
        this.systems.consciousness.awardXP(50, 'cthulhu_encounter');
        this.systems.lore.unlock('cthulhu-first-encounter');
        this.systems.gameState.recordEncounter('cthulhu', { id, timestamp: Date.now() });
        
        this.showNotification('🐙 You peer into the abyss... and it peers back', 'success');
        
        setTimeout(() => {
            this.systems.map.removeMarker(id);
        }, 5000);
    }
    
    /**
     * Interact with Sacred Space
     */
    interactWithSacredSpace(id) {
        this.systems.consciousness.awardXP(20, 'sacred_space');
        this.systems.lore.unlock('sacred-space-discovery');
        this.systems.gameState.recordEncounter('sacredSpaces', { id, timestamp: Date.now() });
        
        this.showNotification('🕉 Sacred geometry resonates with your consciousness', 'success');
    }
    
    /**
     * Interact with Portal
     */
    interactWithPortal(id) {
        if (this.systems.consciousness.state.level < 25) {
            this.showNotification('🌀 The portal resists... you need higher consciousness', 'warning');
            return;
        }
        
        this.systems.consciousness.awardXP(30, 'portal_travel');
        this.systems.lore.unlock('portal-transit');
        this.systems.gameState.recordEncounter('portals', { id, timestamp: Date.now() });
        
        // Teleport player to random nearby location
        const newPosition = this.systems.map.generateRandomPosition(500);
        if (newPosition) {
            this.systems.map.centerOnPlayer();
            this.showNotification('🌀 Reality shifts... you emerge elsewhere', 'success');
        }
        
        this.systems.map.removeMarker(id);
    }
    
    /**
     * Meditate action
     */
    meditate() {
        this.log('Meditating...');
        
        const position = this.systems.geolocation.getPosition();
        if (!position) return;
        
        // Check if in sacred space
        const nearbySpaces = this.systems.map.getMarkersInRadius(position, 15, 'sacredSpace');
        const inSacredSpace = nearbySpaces.length > 0;
        
        const xp = inSacredSpace ? 20 : 10;
        this.systems.consciousness.awardXP(xp, 'meditation');
        
        this.showNotification(
            inSacredSpace 
                ? '🧘 Deep meditation in sacred space... consciousness expands' 
                : '🧘 Meditation brings clarity',
            'success'
        );
    }
    
    /**
     * Observe action
     */
    observe() {
        this.log('Observing...');
        
        const position = this.systems.geolocation.getPosition();
        if (!position) return;
        
        const nearby = this.systems.map.getMarkersInRadius(position, 100, null);
        
        if (nearby.length === 0) {
            this.showNotification('👁️ You sense nothing unusual nearby', 'info');
        } else {
            const types = nearby.map(m => m.type).join(', ');
            this.showNotification(`👁️ You sense: ${types}`, 'info');
        }
    }
    
    /**
     * Update HUD
     */
    updateHUD() {
        const state = this.systems.consciousness.getState();
        const stats = this.systems.gameState.getStats();
        
        // Consciousness level
        const levelEl = document.getElementById('consciousness-level');
        if (levelEl) levelEl.textContent = state.level;
        
        // XP Progress  
        const xpPercent = (state.levelProgress * 100).toFixed(0);
        const xpBarEl = document.getElementById('consciousness-bar');
        if (xpBarEl) xpBarEl.style.width = `${xpPercent}%`;
        
        const xpTextEl = document.getElementById('consciousness-xp');
        if (xpTextEl) xpTextEl.textContent = `${state.currentXP}/${state.xpToNextLevel} XP`;
        
        // Stats
        const stepsEl = document.getElementById('steps-count');
        if (stepsEl) stepsEl.textContent = stats.steps;
        
        const achievementsEl = document.getElementById('achievements-count');
        if (achievementsEl) achievementsEl.textContent = stats.totalEncounters;
    }
    
    /**
     * Game loop (runs every second)
     */
    startGameLoop() {
        setInterval(() => {
            if (!this.isInitialized) return;
            
            // Update HUD
            this.updateHUD();
            
            // Passive consciousness gain (very slow)
            if (Math.random() < 0.1) { // 10% chance per second
                this.systems.consciousness.awardXP(1, 'passive');
            }
        }, 1000);
        
        this.log('✓ Game loop started');
    }
    
    /**
     * Show loading screen
     */
    showLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.remove('hidden');
        }
    }
    
    /**
     * Hide loading screen
     */
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.classList.add('hidden');
                loadingScreen.style.opacity = '1';
            }, 500);
        }
        
        // BRDC-007: Ensure game container is visible
        const gameContainer = document.getElementById('game-container');
        if (gameContainer) {
            gameContainer.classList.remove('hidden');
            gameContainer.style.display = 'block';
        }
    }
    
    /**
     * Show welcome modal
     */
    showWelcomeModal() {
        document.getElementById('welcome-modal').classList.remove('hidden');
        
        // Unlock awakening lore
        this.systems.lore.unlock('awakening');
    }
    
    /**
     * Show lore modal
     */
    showLoreModal(entry) {
        document.getElementById('lore-title').textContent = entry.title;
        document.getElementById('lore-content').innerHTML = entry.content;
        document.getElementById('lore-modal').classList.remove('hidden');
        
        // Save lore unlock
        const unlocked = this.systems.lore.getSaveData();
        localStorage.setItem(GameConfig.storage.loreUnlocked, JSON.stringify(unlocked));
    }
    
    /**
     * Show stage transition modal
     */
    showStageTransitionModal(stage) {
        alert(`🌟 STAGE TRANSITION\n\nYou have reached: ${stage.name}\n\nYour consciousness expands...`);
    }
    
    /**
     * Show modal
     */
    showModal(modalId) {
        document.getElementById(modalId)?.classList.remove('hidden');
    }
    
    /**
     * Hide modal
     */
    hideModal(modalId) {
        document.getElementById(modalId)?.classList.add('hidden');
    }
    
    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        // Simple implementation - can be enhanced with toast library
        console.log(`[${type.toUpperCase()}] ${message}`);
        
        // TODO: Create beautiful notification UI
        alert(message);
    }
    
    /**
     * Show error
     */
    showError(message) {
        alert(`ERROR: ${message}`);
    }
    
    /**
     * Toggle settings panel
     */
    toggleSettings() {
        // TODO: Implement settings panel
        this.log('Settings panel (TODO)');
    }
    
    /**
     * Logging
     */
    log(...args) {
        console.log('[EldritchSanctuary]', ...args);
    }
}

// ============================================
// INITIALIZATION
// ============================================

let game;

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🌸 Eldritch Sanctuary - Consciousness Walker');
    console.log('Version:', GameConfig.version);
    
    // Create and initialize game
    game = new EldritchSanctuary();
    window.game = game; // Make available globally for onclick handlers
    
    // BRDC-007: Fallback timeout to ensure game shows
    const fallbackTimeout = setTimeout(() => {
        console.log('⚠️ Fallback: Forcing game to show after 10 seconds');
        const loadingScreen = document.getElementById('loading-screen');
        const gameContainer = document.getElementById('game-container');
        if (loadingScreen) loadingScreen.classList.add('hidden');
        if (gameContainer) {
            gameContainer.classList.remove('hidden');
            gameContainer.style.display = 'block';
        }
    }, 10000);
    
    try {
        await game.initialize();
        clearTimeout(fallbackTimeout); // Clear fallback if initialization succeeds
    } catch (error) {
        console.error('Initialization failed:', error);
        clearTimeout(fallbackTimeout);
        // Force show game even on error
        const loadingScreen = document.getElementById('loading-screen');
        const gameContainer = document.getElementById('game-container');
        if (loadingScreen) loadingScreen.classList.add('hidden');
        if (gameContainer) {
            gameContainer.classList.remove('hidden');
            gameContainer.style.display = 'block';
        }
    }
});

// Handle page visibility (pause when hidden)
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log('Game paused (tab hidden)');
        if (game?.systems?.geolocation) {
            game.systems.gameState.save(); // Save before pause
        }
    } else {
        console.log('Game resumed');
    }
});

