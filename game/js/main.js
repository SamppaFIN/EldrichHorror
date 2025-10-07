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
                // BRDC-010-CALM: Start calming ambient if audio is ready
                if (this.systems.audio.isEnabled) {
                    this.systems.audio.startCalmingAmbient();
                } else {
                    this.log('⚠️ Audio suspended - will start after user interaction');
                }
            } else {
                this.log('⚠️ AudioSystem failed to initialize, continuing without sound');
            }
            
            // Step Counter Manager - BRDC-STEP-COUNTER-008
            this.systems.steps = new StepCounterManager({
                defaultMode: 'device',
                stepLengthMeters: GameConfig?.movement?.stepLengthMeters || 0.78,
                simStepsPerSecond: 2
            });
            this.systems.steps.initialize();
            this.systems.steps.start();
            this.systems.steps.addEventListener('step', (e) => {
                const { stepsAdded, totalSteps } = e.detail;
                // Record steps in game state
                this.systems.gameState.recordStep(stepsAdded * (GameConfig?.movement?.stepLengthMeters || 0.78));
                // Update HUD
                this.updateHUD();
            });

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
            
            // BRDC-010-CALM: Add map click handler for audio resume
            this.setupMapAudioResume();
            
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
            
            // Steps via StepCounterManager (device/experimental)
            if (this.systems.steps) {
                this.systems.steps.handlePositionUpdate(distance);
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
            // BRDC-010-CALM: Resume audio on user interaction
            this.resumeAudioIfNeeded();
        });
        
        // BRDC-007: Manual proximity check button
        document.getElementById('check-proximity-btn')?.addEventListener('click', () => {
            if (this.systems.discovery) {
                this.systems.discovery.manualProximityCheck();
            }
            // BRDC-010-CALM: Resume audio on user interaction
            this.resumeAudioIfNeeded();
        });
        
        // BRDC-007: Reshuffle discoveries button
        document.getElementById('reshuffle-discoveries-btn')?.addEventListener('click', () => {
            if (this.systems.discovery) {
                this.systems.discovery.reshuffleDiscoveries();
            }
            // BRDC-010-CALM: Resume audio on user interaction
            this.resumeAudioIfNeeded();
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
        
        document.getElementById('settings-close')?.addEventListener('click', () => {
            this.hideModal('settings-modal');
        });
        
        document.getElementById('start-journey-btn')?.addEventListener('click', () => {
            this.hideModal('tutorial-modal');
            document.getElementById('game-container')?.classList.remove('hidden');
        });
        
        // Settings event listeners
        this.setupSettingsListeners();
        
        // Testing panel event listeners (only if testing mode enabled)
        if (GameConfig.testingMode) {
            this.setupTestingPanelListeners();
            this.showTestingPanel();
        }
    }
    
    /**
     * Set up testing panel event listeners
     */
    setupTestingPanelListeners() {
        // Close/minimize button
        const testingClose = document.getElementById('testing-close');
        if (testingClose) {
            testingClose.addEventListener('click', () => {
                this.toggleTestingPanel(false);
            });
        }
        
        // GPS Simulator controls
        const simStart = document.getElementById('sim-start');
        const simPause = document.getElementById('sim-pause');
        const simStop = document.getElementById('sim-stop');
        
        if (simStart) {
            simStart.addEventListener('click', () => {
                this.startGPSSimulator();
            });
        }
        
        if (simPause) {
            simPause.addEventListener('click', () => {
                this.pauseGPSSimulator();
            });
        }
        
        if (simStop) {
            simStop.addEventListener('click', () => {
                this.stopGPSSimulator();
            });
        }
        
        // Manual direction controls
        document.getElementById('dir-north')?.addEventListener('click', () => {
            this.moveSimulator(0); // North
        });
        
        document.getElementById('dir-east')?.addEventListener('click', () => {
            this.moveSimulator(90); // East
        });
        
        document.getElementById('dir-south')?.addEventListener('click', () => {
            this.moveSimulator(180); // South
        });
        
        document.getElementById('dir-west')?.addEventListener('click', () => {
            this.moveSimulator(270); // West
        });
        
        // Speed slider
        const speedSlider = document.getElementById('speed-slider');
        const speedValue = document.getElementById('speed-value');
        
        if (speedSlider && speedValue) {
            speedSlider.addEventListener('input', (e) => {
                const speed = parseFloat(e.target.value);
                speedValue.textContent = `${speed.toFixed(1)} m/s`;
                if (this.gpsSimulator) {
                    this.gpsSimulator.setSpeed(speed);
                }
            });
        }
    }
    
    /**
     * Show testing panel (for desktop testing)
     */
    showTestingPanel() {
        const panel = document.getElementById('testing-panel');
        if (!panel) return;
        
        panel.style.display = 'block';
        panel.classList.remove('hidden');
    }
    
    /**
     * Toggle testing panel visibility
     */
    toggleTestingPanel(show = null) {
        const panel = document.getElementById('testing-panel');
        if (!panel) return;
        
        if (show === null) {
            // Toggle
            panel.classList.toggle('hidden');
        } else if (show) {
            // Show
            panel.style.display = 'block';
            panel.classList.remove('hidden');
        } else {
            // Hide and stop simulator
            panel.style.display = 'none';
            panel.classList.add('hidden');
            
            // Stop simulator if running
            if (this.gpsSimulator && this.gpsSimulator.isMoving) {
                this.stopGPSSimulator();
            }
            
            this.showNotification('Testing panel closed', 'info');
        }
    }
    
    /**
     * Start GPS Simulator
     */
    startGPSSimulator() {
        // Create simulator if it doesn't exist
        if (!this.gpsSimulator) {
            this.gpsSimulator = new GPSSimulator(GameConfig.geolocation.simulator);
            
            // Listen to simulator position updates
            this.gpsSimulator.addEventListener('positionupdate', (e) => {
                const positionData = e.detail;
                const position = {
                    lat: positionData.coords.latitude,
                    lng: positionData.coords.longitude
                };
                
                // Dispatch as if from real geolocation
                const distance = this.calculateDistanceFromPrevious(position);
                this.systems.geolocation.dispatchEvent(new CustomEvent('positionupdate', {
                    detail: { position, distance }
                }));
            });
        }
        
        // Get current position or use default
        const startPos = this.systems.geolocation.getPosition() || {
            lat: GameConfig.map.defaultCenter[0],
            lng: GameConfig.map.defaultCenter[1]
        };
        
        this.gpsSimulator.start(startPos);
        this.showNotification('🚶 Auto-walk started', 'success');
        this.log('GPS Simulator started');
    }
    
    /**
     * Pause GPS Simulator
     */
    pauseGPSSimulator() {
        if (!this.gpsSimulator) return;
        
        const isPaused = this.gpsSimulator.togglePause();
        this.showNotification(isPaused ? '⏸️ Paused' : '▶️ Resumed', 'info');
    }
    
    /**
     * Stop GPS Simulator
     */
    stopGPSSimulator() {
        if (!this.gpsSimulator) return;
        
        this.gpsSimulator.stop();
        this.showNotification('⏹️ Auto-walk stopped', 'info');
        this.log('GPS Simulator stopped');
    }
    
    /**
     * Move simulator in specific direction
     */
    moveSimulator(direction) {
        if (!this.gpsSimulator) {
            // Create and start simulator if not exists
            this.startGPSSimulator();
        }
        
        if (this.gpsSimulator && !this.gpsSimulator.isMoving) {
            this.startGPSSimulator();
        }
        
        if (this.gpsSimulator) {
            this.gpsSimulator.moveDirection(direction);
        }
    }
    
    /**
     * Calculate distance from previous position
     */
    calculateDistanceFromPrevious(newPosition) {
        const prevPos = this.systems.geolocation.previousPosition;
        if (!prevPos) return 0;
        
        return this.haversineDistance(
            prevPos.lat, prevPos.lng,
            newPosition.lat, newPosition.lng
        );
    }
    
    /**
     * Haversine distance calculation
     */
    haversineDistance(lat1, lng1, lat2, lng2) {
        const R = 6371000; // Earth's radius in meters
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lng2 - lng1) * Math.PI / 180;
        
        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                  Math.cos(φ1) * Math.cos(φ2) *
                  Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        
        return R * c;
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
        // Award XP and unlock lore
        this.systems.consciousness.awardXP(25, 'aurora_encounter', this.systems.audio);
        this.systems.lore.unlock('aurora-first-meeting');
        this.systems.gameState.recordEncounter('aurora', { id, timestamp: Date.now() });
        
        // Increment discovery count for Aurora encounter
        this.systems.gameState.incrementDiscoveryCount();
        
        // Show notification
        this.showNotification('✨ Aurora shares her wisdom with you', 'success');
        
        // Show chat dialog
        this.showNPCDialog({
            npc: 'aurora',
            name: '✨ Aurora, The Dawn Bringer',
            portrait: this.systems.map.markerFactory.createAuroraMarker(150),
            dialog: [
                'Greetings, Consciousness Walker...',
                'I sense you are awakening to the sacred patterns that weave through reality.',
                'Your journey has only just begun. Walk the paths of wisdom, and you shall discover truths hidden in plain sight.',
                'May the light guide your steps and illuminate the darkness within and without.'
            ],
            rewards: [
                { icon: '✨', text: '+25 XP' },
                { icon: '📖', text: 'Lore Entry Unlocked' },
                { icon: '🌟', text: '+1 Discovery' }
            ],
            onClose: () => {
                // Remove marker after dialog closes
                this.systems.map.removeMarker(id);
            }
        });
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
        // Use notification system if available
        if (window.notificationSystem) {
            window.notificationSystem.show(message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
            // Fallback for critical messages
            if (type === 'error') {
                alert(message);
            }
        }
    }
    
    /**
     * Show NPC Chat Dialog
     * @param {Object} options - Dialog configuration
     * @param {string} options.npc - NPC type identifier
     * @param {string} options.name - NPC display name
     * @param {string} options.portrait - SVG string for portrait
     * @param {Array<string>} options.dialog - Array of dialog paragraphs
     * @param {Array<Object>} options.rewards - Array of reward items {icon, text}
     * @param {Function} options.onClose - Callback when dialog closes
     */
    showNPCDialog(options) {
        const modal = document.getElementById('npc-chat-modal');
        const portrait = document.getElementById('npc-portrait');
        const nameEl = document.getElementById('npc-name');
        const dialogEl = document.getElementById('npc-dialog');
        const rewardsEl = document.getElementById('npc-rewards');
        const continueBtn = document.getElementById('npc-continue-btn');
        
        if (!modal) return;
        
        // Set portrait SVG
        if (portrait && options.portrait) {
            portrait.innerHTML = options.portrait;
        }
        
        // Set name
        if (nameEl && options.name) {
            nameEl.textContent = options.name;
        }
        
        // Set dialog text
        if (dialogEl && options.dialog) {
            dialogEl.innerHTML = options.dialog.map(text => `<p>${text}</p>`).join('');
        }
        
        // Set rewards
        if (rewardsEl && options.rewards) {
            rewardsEl.innerHTML = options.rewards.map(reward => 
                `<div class="npc-reward-item">
                    <span class="npc-reward-icon">${reward.icon}</span>
                    <span>${reward.text}</span>
                </div>`
            ).join('');
        }
        
        // Show modal
        modal.classList.remove('hidden');
        
        // Handle continue button
        const handleClose = () => {
            modal.classList.add('hidden');
            continueBtn.removeEventListener('click', handleClose);
            if (options.onClose) {
                options.onClose();
            }
        };
        
        continueBtn.addEventListener('click', handleClose);
        
        this.log(`NPC Dialog shown: ${options.npc}`);
    }
    
    /**
     * Show error
     */
    showError(message) {
        alert(`ERROR: ${message}`);
    }
    
    /**
     * Set up settings event listeners
     */
    setupSettingsListeners() {
        // Debug movement toggle
        const debugToggle = document.getElementById('debug-movement-toggle');
        const simulatorControls = document.getElementById('simulator-controls');
        
        if (debugToggle) {
            debugToggle.addEventListener('change', (e) => {
                if (e.target.checked) {
                    // Enable debug movement
                    this.startGPSSimulator();
                    if (simulatorControls) {
                        simulatorControls.style.display = 'flex';
                    }
                    this.showNotification('🎮 Debug movement enabled', 'success');
                } else {
                    // Disable debug movement
                    this.stopGPSSimulator();
                    if (simulatorControls) {
                        simulatorControls.style.display = 'none';
                    }
                    this.showNotification('🎮 Debug movement disabled', 'info');
                }
            });
        }
        
        // Mini direction controls in settings
        document.getElementById('mini-dir-north')?.addEventListener('click', () => {
            this.moveSimulator(0);
        });
        
        document.getElementById('mini-dir-east')?.addEventListener('click', () => {
            this.moveSimulator(90);
        });
        
        document.getElementById('mini-dir-south')?.addEventListener('click', () => {
            this.moveSimulator(180);
        });
        
        document.getElementById('mini-dir-west')?.addEventListener('click', () => {
            this.moveSimulator(270);
        });
        
        // Sound toggle
        document.getElementById('sound-toggle')?.addEventListener('change', (e) => {
            this.systems.gameState.updateSettings({ soundEnabled: e.target.checked });
            this.showNotification(`Sound ${e.target.checked ? 'enabled' : 'disabled'}`, 'info');
        });
        
        // Music toggle
        document.getElementById('music-toggle')?.addEventListener('change', (e) => {
            this.systems.gameState.updateSettings({ musicEnabled: e.target.checked });
            if (e.target.checked) {
                // Resume ambient if enabled
                if (this.systems.audio) {
                    this.systems.audio.startAmbient('calmAlpha');
                }
            } else {
                // Stop ambient
                if (this.systems.audio) {
                    this.systems.audio.stopAmbient();
                }
            }
            this.showNotification(`Music ${e.target.checked ? 'enabled' : 'disabled'}`, 'info');
        });
        
        // Notifications toggle
        document.getElementById('notifications-toggle')?.addEventListener('change', (e) => {
            this.systems.gameState.updateSettings({ notificationsEnabled: e.target.checked });
            this.showNotification(`Notifications ${e.target.checked ? 'enabled' : 'disabled'}`, 'info');
        });
    }
    
    /**
     * Toggle settings panel
     */
    toggleSettings() {
        this.showModal('settings-modal');
    }
    
    /**
     * Setup map click handler for audio resume
     * BRDC-010-CALM: Handle autoplay policy
     */
    setupMapAudioResume() {
        // Add click handler to map container
        const mapContainer = document.getElementById('map');
        if (mapContainer) {
            mapContainer.addEventListener('click', () => {
                this.resumeAudioIfNeeded();
            });
        }
    }
    
    /**
     * Resume audio if needed after user interaction
     * BRDC-010-CALM: Handle autoplay policy
     */
    async resumeAudioIfNeeded() {
        if (this.systems.audio && !this.systems.audio.isEnabled) {
            const resumed = await this.systems.audio.resumeAudio();
            if (resumed) {
                this.log('🎵 Audio resumed after user interaction');
            }
        }
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

