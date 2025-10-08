/**
 * ELDRITCH SANCTUARY - MAIN GAME CLASS
 * Consciousness-aware mobile exploration game
 */

class EldritchSanctuary {
    constructor() {
        this.systems = {};
        this.isInitialized = false;
        this.gameLoop = null;
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
            
            // Step Counter
            this.systems.stepCounter = new StepCounterManager();
            this.systems.stepCounter.initialize();
            
            // Notification System
            this.systems.notifications = new NotificationSystem();
            this.systems.notifications.initialize();
            this.log('✓ NotificationSystem initialized');
            
            // Audio System
            this.systems.audio = new AudioSystem();
            this.systems.audio.initialize();
                this.log('✓ AudioSystem initialized');
            
            // Discovery System
            this.systems.discovery = new DiscoverySystem();
            this.systems.discovery.initialize();
            this.log('✓ DiscoverySystem initialized');
            
            // Start position tracking
            this.systems.geolocation.startTracking();
            this.log('📍 Initial position:', this.systems.geolocation.getPosition());
            
            // Initialize UI
            this.initializeUI();
            
            // Start game loop
            this.startGameLoop();
            
            this.isInitialized = true;
            this.log('✓ All systems initialized successfully!');
            
            // Hide loading screen
            this.hideLoadingScreen();
            
            // Force show game after a short delay as backup
            setTimeout(() => {
                this.hideLoadingScreen();
            }, 1000);
            
        } catch (error) {
            console.error('Initialization failed:', error);
            this.hideLoadingScreen();
            throw error;
        }
    }
    
    /**
     * Initialize UI elements and event listeners
     */
    initializeUI() {
        this.setupUIEventListeners();
        this.updateHUD();
        this.restoreSettingsUI();
    }
    
    /**
     * Setup all UI event listeners
     */
    setupUIEventListeners() {
        // Map click handler
        this.systems.map.on('mapClick', (e) => {
            this.log('Map clicked:', e.latlng);
        });
        
        // Discovery collection
        this.systems.discovery.on('discoveryCollected', (discovery) => {
            this.log('Discovery collected:', discovery);
                this.updateHUD();
            });

        // Position updates
        this.systems.geolocation.on('positionUpdate', (position) => {
            this.systems.map.updatePlayerPosition(position);
            this.systems.discovery.updatePlayerPosition(position);
        });
        
        // Step counter updates
        this.systems.stepCounter.on('stepUpdate', (steps) => {
            this.updateHUD();
        });
        
        // Consciousness updates
        this.systems.consciousness.on('levelUp', (level) => {
            this.systems.notifications.show(`Level Up! Now level ${level}`, 'success');
            this.updateHUD();
        });
        
        // Begin Journey button - with multiple approaches
        this.setupBeginJourneyButton();
        
        // Setup all footer buttons
        this.setupFooterButtons();
        
        // Setup testing panel listeners
        this.setupTestingPanelListeners();
        
        // Setup settings listeners
        this.setupSettingsListeners();
    }
    
    /**
     * Setup Begin Journey button with multiple approaches
     */
    setupBeginJourneyButton() {
        const startJourneyBtn = document.getElementById('start-journey-btn');
        
        if (startJourneyBtn) {
            this.log('Setting up Begin Journey button');
            
            // Remove any existing listeners
            startJourneyBtn.removeEventListener('click', this.handleBeginJourney);
            
            // Add new listener
            startJourneyBtn.addEventListener('click', this.handleBeginJourney.bind(this));
            
            // Also add onclick as backup
            startJourneyBtn.onclick = this.handleBeginJourney.bind(this);
            
    // Make it globally accessible
    window.beginJourney = this.handleBeginJourney.bind(this);
    window.forceShowGame = this.forceShowGame.bind(this);
    window.testMarkers = this.testMarkers.bind(this);
    window.testCodex = this.showCodex.bind(this);
    window.testSettings = this.showSettings.bind(this);
    window.closeCodex = this.hideCodex.bind(this);
    window.closeSettings = this.hideSettings.bind(this);
    window.forceShowCodex = this.forceShowCodex.bind(this);
    window.testCloseCodex = this.testCloseCodex.bind(this);
    window.testCloseSettings = this.testCloseSettings.bind(this);
    window.testPlayerMarker = this.testPlayerMarker.bind(this);
    window.testDiscoveryClick = this.testDiscoveryClick.bind(this);
    window.testReshuffle = this.testReshuffle.bind(this);
    window.testPopupPosition = this.testPopupPosition.bind(this);
    window.testMarkerPositions = this.testMarkerPositions.bind(this);
    window.testPlayerPositionTiming = this.testPlayerPositionTiming.bind(this);
            
            this.log('Begin Journey button setup complete');
        } else {
            this.log('Begin Journey button not found, retrying...');
            // Retry after a short delay
            setTimeout(() => this.setupBeginJourneyButton(), 1000);
        }
    }
    
    /**
     * Handle Begin Journey button click
     */
    handleBeginJourney() {
        this.log('Starting journey...');
        
        // Use the same aggressive approach as forceShowGame
        this.forceShowGame();
        
        // Show welcome notification
        if (this.systems.notifications) {
            this.systems.notifications.show('Welcome to Eldritch Sanctuary! Begin your cosmic exploration.', 'success');
        }
        
        // Start GPS tracking if not already started
        if (this.systems.geolocation && !this.systems.geolocation.isTracking) {
            this.systems.geolocation.startTracking();
        }
        
        // Don't spawn discoveries here - let them spawn when player position is received
        this.log('Journey started - discoveries will spawn when GPS position is available');
        
        this.log('✓ Journey started successfully!');
    }
    
    /**
     * Setup all footer buttons
     */
    setupFooterButtons() {
        // Center Map Button
        const centerMapBtn = document.getElementById('center-map-btn');
        if (centerMapBtn) {
            centerMapBtn.addEventListener('click', () => {
                this.log('Centering map on player');
                if (this.systems.geolocation) {
                    const position = this.systems.geolocation.getPosition();
                    if (position && this.systems.map) {
                        this.systems.map.map.setView([position.lat, position.lng], this.systems.map.map.getZoom());
                        this.systems.notifications.show('Map centered on your location', 'info');
                    }
                }
            });
        }
        
        // Check Proximity Button
        const checkProximityBtn = document.getElementById('check-proximity-btn');
        if (checkProximityBtn) {
            checkProximityBtn.addEventListener('click', () => {
                this.log('Checking proximity to discoveries');
                if (this.systems.discovery) {
                    this.systems.discovery.checkCollection();
                    this.systems.notifications.show('Checking nearby discoveries...', 'info');
                }
            });
        }
        
        // Reshuffle Discoveries Button
        const reshuffleBtn = document.getElementById('reshuffle-discoveries-btn');
        if (reshuffleBtn) {
            reshuffleBtn.addEventListener('click', () => {
                this.log('Reshuffling discoveries');
                if (this.systems.discovery) {
                    this.systems.discovery.clearDiscoveries();
                    this.systems.discovery.spawnDiscoveries();
                    this.systems.notifications.show('Discoveries reshuffled!', 'success');
                }
            });
        }
        
        // Codex Button
        const codexBtn = document.getElementById('codex-btn');
        if (codexBtn) {
            this.log('Setting up codex button');
            codexBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.log('Codex button clicked!');
                this.showCodex();
            });
            // Also add onclick as backup
            codexBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.log('Codex button clicked (onclick)!');
                this.showCodex();
            };
        } else {
            this.log('⚠️ Codex button not found!');
        }
        
        // Settings Button
        const settingsBtn = document.getElementById('settings-btn');
        if (settingsBtn) {
            this.log('Setting up settings button');
            settingsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.log('Settings button clicked!');
                this.showSettings();
            });
            // Also add onclick as backup
            settingsBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.log('Settings button clicked (onclick)!');
                this.showSettings();
            };
        } else {
            this.log('⚠️ Settings button not found!');
        }
        
        // Codex Close Button
        const codexCloseBtn = document.getElementById('codex-close');
        if (codexCloseBtn) {
            this.log('Setting up codex close button');
            
            // Remove any existing listeners first
            codexCloseBtn.removeEventListener('click', this.handleCodexClose);
            
            // Create bound function for proper removal
            this.handleCodexClose = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.log('Codex close button clicked!');
                this.hideCodex();
            };
            
            codexCloseBtn.addEventListener('click', this.handleCodexClose);
            
            // Also add onclick as backup
            codexCloseBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.log('Codex close button clicked (onclick)!');
                this.hideCodex();
            };
            
            // Test if button is clickable
            this.log('Codex close button setup complete');
        } else {
            this.log('⚠️ Codex close button not found!');
        }
        
        // Settings Close Button
        const settingsCloseBtn = document.getElementById('settings-close');
        if (settingsCloseBtn) {
            this.log('Setting up settings close button');
            
            // Remove any existing listeners first
            settingsCloseBtn.removeEventListener('click', this.handleSettingsClose);
            
            // Create bound function for proper removal
            this.handleSettingsClose = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.log('Settings close button clicked!');
                this.hideSettings();
            };
            
            settingsCloseBtn.addEventListener('click', this.handleSettingsClose);
            
            // Also add onclick as backup
            settingsCloseBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.log('Settings close button clicked (onclick)!');
                this.hideSettings();
            };
            
            // Test if button is clickable
            this.log('Settings close button setup complete');
        } else {
            this.log('⚠️ Settings close button not found!');
        }
        
        // NPC Continue Button
        const npcContinueBtn = document.getElementById('npc-continue-btn');
        if (npcContinueBtn) {
            npcContinueBtn.addEventListener('click', () => {
                this.hideNPCDialog();
            });
        }
        
        this.log('✓ Footer buttons setup complete');
        
        // Test button functionality
        setTimeout(() => {
            this.log('Testing button functionality...');
            const testButtons = ['center-map-btn', 'check-proximity-btn', 'reshuffle-discoveries-btn', 'codex-btn', 'settings-btn'];
            testButtons.forEach(btnId => {
                const btn = document.getElementById(btnId);
                if (btn) {
                    this.log(`✓ Button ${btnId} found and ready`);
                    // Test if button is clickable
                    const rect = btn.getBoundingClientRect();
                    this.log(`  - Position: ${rect.left}, ${rect.top}`);
                    this.log(`  - Size: ${rect.width}x${rect.height}`);
                    this.log(`  - Visible: ${rect.width > 0 && rect.height > 0}`);
                } else {
                    this.log(`⚠️ Button ${btnId} not found`);
                }
            });
        }, 1000);
    }
    
    /**
     * Show codex modal
     */
    showCodex() {
        const codexModal = document.getElementById('codex-modal');
        if (codexModal) {
            this.log('🔍 DEBUGGING CODEX MODAL');
            this.log('Before changes - Modal classes:', codexModal.className);
            this.log('Before changes - Modal style:', codexModal.style.cssText);
            this.log('Before changes - Modal computed style:', window.getComputedStyle(codexModal).display);
            
            // Force remove hidden class
            codexModal.classList.remove('hidden');
            
            // Force show with multiple approaches
            codexModal.style.setProperty('display', 'flex', 'important');
            codexModal.style.setProperty('visibility', 'visible', 'important');
            codexModal.style.setProperty('opacity', '1', 'important');
            codexModal.style.setProperty('z-index', '9999', 'important');
            codexModal.style.setProperty('position', 'fixed', 'important');
            codexModal.style.setProperty('top', '0', 'important');
            codexModal.style.setProperty('left', '0', 'important');
            codexModal.style.setProperty('width', '100%', 'important');
            codexModal.style.setProperty('height', '100%', 'important');
            
            // Also ensure modal content is visible
            const modalContent = codexModal.querySelector('.modal-content');
            if (modalContent) {
                modalContent.style.setProperty('display', 'block', 'important');
                modalContent.style.setProperty('visibility', 'visible', 'important');
                modalContent.style.setProperty('opacity', '1', 'important');
                modalContent.classList.remove('hidden');
            }
            
            // Inject emergency CSS to force modal visibility
            const emergencyModalCSS = `
                <style id="emergency-modal-css">
                    #codex-modal { 
                        display: flex !important; 
                        visibility: visible !important; 
                        opacity: 1 !important; 
                        z-index: 99999 !important;
                        position: fixed !important;
                        top: 0 !important;
                        left: 0 !important;
                        width: 100% !important;
                        height: 100% !important;
                        background: rgba(0, 0, 0, 0.8) !important;
                    }
                    #codex-modal .modal-content {
                        display: block !important;
                        visibility: visible !important;
                        opacity: 1 !important;
                    }
                </style>
            `;
            document.head.insertAdjacentHTML('beforeend', emergencyModalCSS);
            
            // Add click-outside-to-close functionality
            codexModal.addEventListener('click', (e) => {
                if (e.target === codexModal) {
                    this.log('Codex modal clicked outside - closing');
                    this.hideCodex();
                }
            });
            
            // Force show with setTimeout to override any conflicting styles
            setTimeout(() => {
                codexModal.style.setProperty('display', 'flex', 'important');
                codexModal.style.setProperty('visibility', 'visible', 'important');
                codexModal.style.setProperty('opacity', '1', 'important');
                this.log('After timeout - Modal computed style:', window.getComputedStyle(codexModal).display);
            }, 100);
            
            this.log('After changes - Modal classes:', codexModal.className);
            this.log('After changes - Modal style:', codexModal.style.cssText);
            this.log('After changes - Modal computed style:', window.getComputedStyle(codexModal).display);
        } else {
            this.log('⚠️ Codex modal not found');
        }
    }
    
    /**
     * Hide codex modal
     */
    hideCodex() {
        this.log('🔍 HIDING CODEX MODAL');
        const codexModal = document.getElementById('codex-modal');
        if (codexModal) {
            this.log('Before hide - Modal classes:', codexModal.className);
            this.log('Before hide - Modal style:', codexModal.style.cssText);
            
            // Force hide with multiple approaches
            codexModal.style.setProperty('display', 'none', 'important');
            codexModal.style.setProperty('visibility', 'hidden', 'important');
            codexModal.style.setProperty('opacity', '0', 'important');
            codexModal.classList.add('hidden');
            
            // Also set directly
            codexModal.style.cssText = 'display: none !important; visibility: hidden !important; opacity: 0 !important;';
            
            this.log('After hide - Modal classes:', codexModal.className);
            this.log('After hide - Modal style:', codexModal.style.cssText);
            this.log('After hide - Modal computed style:', window.getComputedStyle(codexModal).display);
            this.log('✓ Codex modal hidden');
        } else {
            this.log('⚠️ Codex modal not found for hiding');
        }
    }
    
    /**
     * Show settings modal
     */
    showSettings() {
        const settingsModal = document.getElementById('settings-modal');
        if (settingsModal) {
            // Force remove hidden class
            settingsModal.classList.remove('hidden');
            
            // Force show with multiple approaches
            settingsModal.style.setProperty('display', 'flex', 'important');
            settingsModal.style.setProperty('visibility', 'visible', 'important');
            settingsModal.style.setProperty('opacity', '1', 'important');
            settingsModal.style.setProperty('z-index', '9999', 'important');
            
            // Also ensure modal content is visible
            const modalContent = settingsModal.querySelector('.modal-content');
            if (modalContent) {
                modalContent.style.setProperty('display', 'block', 'important');
                modalContent.style.setProperty('visibility', 'visible', 'important');
                modalContent.style.setProperty('opacity', '1', 'important');
                modalContent.classList.remove('hidden');
            }
            
            // Add click-outside-to-close functionality
            settingsModal.addEventListener('click', (e) => {
                if (e.target === settingsModal) {
                    this.log('Settings modal clicked outside - closing');
                    this.hideSettings();
                }
            });
            
            // Also try setting attributes
            settingsModal.setAttribute('style', 'display: flex !important; visibility: visible !important; opacity: 1 !important; z-index: 9999 !important;');
            
            this.log('Settings modal shown with force');
            this.log('Modal classes:', settingsModal.className);
            this.log('Modal style:', settingsModal.style.cssText);
            this.log('Modal content:', modalContent);
        } else {
            this.log('⚠️ Settings modal not found');
        }
    }
    
    /**
     * Hide settings modal
     */
    hideSettings() {
        this.log('🔍 HIDING SETTINGS MODAL');
        const settingsModal = document.getElementById('settings-modal');
        if (settingsModal) {
            this.log('Before hide - Modal classes:', settingsModal.className);
            this.log('Before hide - Modal style:', settingsModal.style.cssText);
            
            // Force hide with multiple approaches
            settingsModal.style.setProperty('display', 'none', 'important');
            settingsModal.style.setProperty('visibility', 'hidden', 'important');
            settingsModal.style.setProperty('opacity', '0', 'important');
            settingsModal.classList.add('hidden');
            
            // Also set directly
            settingsModal.style.cssText = 'display: none !important; visibility: hidden !important; opacity: 0 !important;';
            
            this.log('After hide - Modal classes:', settingsModal.className);
            this.log('After hide - Modal style:', settingsModal.style.cssText);
            this.log('After hide - Modal computed style:', window.getComputedStyle(settingsModal).display);
            this.log('✓ Settings modal hidden');
        } else {
            this.log('⚠️ Settings modal not found for hiding');
        }
    }
    
    /**
     * Hide NPC dialog
     */
    hideNPCDialog() {
        const npcModal = document.getElementById('npc-chat-modal');
        if (npcModal) {
            npcModal.style.display = 'none';
            npcModal.classList.add('hidden');
        }
    }
    
    /**
     * Setup testing panel event listeners
     */
    setupTestingPanelListeners() {
        if (!GameConfig.testingMode) return;
        
        const startBtn = document.getElementById('start-simulator');
        const pauseBtn = document.getElementById('pause-simulator');
        const stopBtn = document.getElementById('stop-simulator');
        const closeBtn = document.getElementById('close-testing-panel');
        
        if (startBtn) {
            startBtn.addEventListener('click', () => this.startGPSSimulator());
        }
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => this.pauseGPSSimulator());
        }
        if (stopBtn) {
            stopBtn.addEventListener('click', () => this.stopGPSSimulator());
        }
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.toggleTestingPanel(false));
        }
        
        // Direction controls
        const directions = ['up', 'down', 'left', 'right'];
        directions.forEach(dir => {
            const btn = document.getElementById(`move-${dir}`);
            if (btn) {
                btn.addEventListener('click', () => this.moveSimulator(dir));
            }
        });
        
        // Speed slider
        const speedSlider = document.getElementById('simulator-speed');
        if (speedSlider) {
            speedSlider.addEventListener('input', (e) => {
                const speed = parseFloat(e.target.value);
                if (this.gpsSimulator) {
                    this.gpsSimulator.setSpeed(speed);
                }
            });
        }
    }
    
    /**
     * Setup settings event listeners
     */
    setupSettingsListeners() {
        this.log('Setting up settings listeners...');
        
        // Debug movement toggle
        const debugToggle = document.getElementById('debug-movement-toggle');
        if (debugToggle) {
            this.log('Setting up debug movement toggle');
            debugToggle.addEventListener('change', (e) => {
                const enabled = e.target.checked;
                this.log('Debug movement toggled:', enabled);
                this.systems.gameState.updateSettings({ debugMovement: enabled });
                this.toggleSimulatorControls(enabled);
            });
        } else {
            this.log('⚠️ Debug movement toggle not found');
        }
        
        // Sound toggles
        const soundToggle = document.getElementById('sound-toggle');
        if (soundToggle) {
            this.log('Setting up sound toggle');
            soundToggle.addEventListener('change', (e) => {
                this.log('Sound toggled:', e.target.checked);
                this.systems.gameState.updateSettings({ soundEnabled: e.target.checked });
            });
        } else {
            this.log('⚠️ Sound toggle not found');
        }
        
        const musicToggle = document.getElementById('music-toggle');
        if (musicToggle) {
            this.log('Setting up music toggle');
            musicToggle.addEventListener('change', (e) => {
                this.log('Music toggled:', e.target.checked);
                this.systems.gameState.updateSettings({ musicEnabled: e.target.checked });
            });
        } else {
            this.log('⚠️ Music toggle not found');
        }
        
        const notificationsToggle = document.getElementById('notifications-toggle');
        if (notificationsToggle) {
            this.log('Setting up notifications toggle');
            notificationsToggle.addEventListener('change', (e) => {
                this.log('Notifications toggled:', e.target.checked);
                this.systems.gameState.updateSettings({ notificationsEnabled: e.target.checked });
            });
        } else {
            this.log('⚠️ Notifications toggle not found');
        }
        
        // Mini simulator direction controls
        const miniNorth = document.getElementById('mini-dir-north');
        const miniWest = document.getElementById('mini-dir-west');
        const miniEast = document.getElementById('mini-dir-east');
        const miniSouth = document.getElementById('mini-dir-south');
        
        if (miniNorth) {
            this.log('Setting up mini direction controls');
            miniNorth.addEventListener('click', () => {
                this.log('Mini north clicked');
                this.moveSimulator('north');
            });
            miniWest.addEventListener('click', () => {
                this.log('Mini west clicked');
                this.moveSimulator('west');
            });
            miniEast.addEventListener('click', () => {
                this.log('Mini east clicked');
                this.moveSimulator('east');
            });
            miniSouth.addEventListener('click', () => {
                this.log('Mini south clicked');
                this.moveSimulator('south');
            });
        } else {
            this.log('⚠️ Mini direction controls not found');
        }
        
        this.log('✓ Settings listeners setup complete');
    }
    
    /**
     * Restore settings UI from saved state
     */
    restoreSettingsUI() {
        const settings = this.systems.gameState.state.settings;
        
        // Update toggles
        const debugToggle = document.getElementById('debug-movement-toggle');
        if (debugToggle) {
            debugToggle.checked = settings.debugMovement || false;
        }
        
        const soundToggle = document.getElementById('sound-toggle');
        if (soundToggle) {
            soundToggle.checked = settings.soundEnabled !== false;
        }
        
        const musicToggle = document.getElementById('music-toggle');
        if (musicToggle) {
            musicToggle.checked = settings.musicEnabled !== false;
        }
        
        const notificationsToggle = document.getElementById('notifications-toggle');
        if (notificationsToggle) {
            notificationsToggle.checked = settings.notificationsEnabled !== false;
        }
        
        // Update simulator controls visibility
        this.toggleSimulatorControls(settings.debugMovement || false);
    }
    
    /**
     * Toggle simulator controls visibility
     */
    toggleSimulatorControls(show) {
        const simulatorControls = document.getElementById('simulator-controls');
        if (simulatorControls) {
            simulatorControls.style.display = show ? 'block' : 'none';
            this.log(`Simulator controls ${show ? 'shown' : 'hidden'}`);
        } else {
            this.log('⚠️ Simulator controls element not found');
        }
    }
    
    /**
     * Start GPS simulator
     */
    startGPSSimulator() {
        if (!this.gpsSimulator) {
            this.gpsSimulator = new GPSSimulator();
            this.gpsSimulator.on('positionUpdate', (position) => {
                // Dispatch as if from GeolocationManager
                this.systems.geolocation.emit('positionUpdate', position);
            });
        }
        
        const currentPos = this.systems.geolocation.getPosition();
        if (currentPos) {
            this.gpsSimulator.start(currentPos.lat, currentPos.lng);
            this.log('GPS Simulator started');
        }
    }
    
    /**
     * Pause GPS simulator
     */
    pauseGPSSimulator() {
        if (this.gpsSimulator) {
            this.gpsSimulator.pause();
            this.log('GPS Simulator paused');
        }
    }
    
    /**
     * Stop GPS simulator
     */
    stopGPSSimulator() {
        if (this.gpsSimulator) {
            this.gpsSimulator.stop();
            this.log('GPS Simulator stopped');
        }
    }
    
    /**
     * Move simulator in direction
     */
    moveSimulator(direction) {
        if (this.gpsSimulator) {
            this.gpsSimulator.move(direction);
        }
    }
    
    /**
     * Toggle testing panel visibility
     */
    toggleTestingPanel(show) {
        const panel = document.getElementById('testing-panel');
        if (panel) {
            if (show) {
                panel.style.display = 'block';
                panel.classList.remove('hidden');
            } else {
                panel.style.display = 'none';
                panel.classList.add('hidden');
                this.stopGPSSimulator();
            }
        }
    }
    
    /**
     * Show testing panel
     */
    showTestingPanel() {
        const panel = document.getElementById('testing-panel');
        if (panel) {
            panel.style.display = 'block';
            panel.classList.remove('hidden');
        }
    }
    
    
    /**
     * Interact with Aurora NPC
     */
    interactWithAurora(id) {
        const auroraDialog = {
            name: 'Aurora',
            portrait: '🌸',
            dialog: 'Greetings, consciousness walker. I sense your journey has brought you here. The cosmic fragments you collect are pieces of a greater puzzle. Continue your exploration, and perhaps you will discover the true nature of this reality.',
            rewards: {
                xp: 50,
                lore: 'Aurora\'s Wisdom'
            }
        };
        
        this.showNPCDialog(auroraDialog);
    }
    
    /**
     * Show NPC dialog modal
     */
    showNPCDialog(options) {
        const modal = document.getElementById('npc-chat-modal');
        if (!modal) return;
        
        // Update content
        const portrait = modal.querySelector('.npc-portrait');
        const name = modal.querySelector('.npc-name');
        const dialog = modal.querySelector('.npc-dialog');
        const rewards = modal.querySelector('.npc-rewards');
        
        if (portrait) portrait.textContent = options.portrait || '👤';
        if (name) name.textContent = options.name || 'Mysterious Entity';
        if (dialog) dialog.textContent = options.dialog || '...';
        
        if (options.rewards && rewards) {
            rewards.innerHTML = '';
            if (options.rewards.xp) {
                const xpReward = document.createElement('div');
                xpReward.textContent = `+${options.rewards.xp} XP`;
                xpReward.className = 'reward-xp';
                rewards.appendChild(xpReward);
            }
            if (options.rewards.lore) {
                const loreReward = document.createElement('div');
                loreReward.textContent = `Unlocked: ${options.rewards.lore}`;
                loreReward.className = 'reward-lore';
                rewards.appendChild(loreReward);
            }
        }
        
        // Show modal
        modal.style.display = 'flex';
        modal.classList.remove('hidden');
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            this.hideNPCDialog();
        }, 5000);
        
        // Apply rewards
        if (options.rewards) {
            if (options.rewards.xp) {
                this.systems.consciousness.addXP(options.rewards.xp);
            }
            if (options.rewards.lore) {
                this.systems.lore.unlockEntry(options.rewards.lore);
            }
        }
    }
    
    /**
     * Hide NPC dialog modal
     */
    hideNPCDialog() {
        const modal = document.getElementById('npc-chat-modal');
        if (modal) {
            modal.style.display = 'none';
            modal.classList.add('hidden');
        }
    }
    
    /**
     * Start the main game loop
     */
    startGameLoop() {
        this.gameLoop = setInterval(() => {
            this.update();
        }, 1000);
        this.log('✓ Game loop started');
    }
    
    /**
     * Main game update loop
     */
    update() {
            if (!this.isInitialized) return;
        
        // Update consciousness (passive XP)
        this.systems.consciousness.update();
        
        // Update discovery system
        this.systems.discovery.update();
            
            // Update HUD
            this.updateHUD();
    }
    
    /**
     * Update HUD elements
     */
    updateHUD() {
        if (!this.systems.gameState) return;
        
        const stats = this.systems.gameState.state.player;
        
        // Update consciousness level
        const consciousnessEl = document.getElementById('consciousness-level');
        if (consciousnessEl) {
            consciousnessEl.textContent = stats.consciousnessLevel || 1;
        }
        
        // Update discoveries count
        const achievementsEl = document.getElementById('achievements-count');
        if (achievementsEl) {
            achievementsEl.textContent = stats.totalDiscoveries || 0;
        }
        
        // Update steps count
        const stepsEl = document.getElementById('steps-count');
        if (stepsEl && this.systems.stepCounter) {
            stepsEl.textContent = this.systems.stepCounter.getSteps() || 0;
        }
    }
    
    /**
     * Show loading screen
     */
    showLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        const gameContainer = document.getElementById('game-container');
        
        if (loadingScreen) {
            loadingScreen.classList.remove('hidden');
        }
        if (gameContainer) {
            gameContainer.classList.add('hidden');
        }
    }
    
    /**
     * Hide loading screen
     */
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        const gameContainer = document.getElementById('game-container');
        
        console.log('Hiding loading screen...', { loadingScreen, gameContainer });
        
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
            loadingScreen.style.visibility = 'hidden';
            loadingScreen.style.opacity = '0';
                loadingScreen.classList.add('hidden');
        }
        
        if (gameContainer) {
            // Force remove hidden class and show
            gameContainer.classList.remove('hidden');
            gameContainer.style.display = 'block';
            gameContainer.style.visibility = 'visible';
            gameContainer.style.opacity = '1';
            gameContainer.style.position = 'relative';
            gameContainer.style.zIndex = '1';
        }
        
        // Force show game if elements don't exist
        if (!loadingScreen && !gameContainer) {
            console.log('Loading screen elements not found, forcing game display');
            document.body.style.overflow = 'auto';
        }
        
        console.log('Loading screen hidden, game should be visible now');
        console.log('Game container classes:', gameContainer?.className);
        console.log('Game container style:', gameContainer?.style.display);
    }
    
    /**
     * Force show game (emergency function)
     */
    forceShowGame() {
        console.log('🚨 FORCE SHOWING GAME');
        
        // Hide ALL modals and overlays
        const allModals = document.querySelectorAll('.modal, .modal-content, .tutorial-content, .loading-screen');
        allModals.forEach(modal => {
            modal.style.display = 'none !important';
            modal.style.visibility = 'hidden !important';
            modal.style.opacity = '0 !important';
            modal.classList.add('hidden');
            console.log('Hidden element:', modal.className);
        });
        
        // Force show game container
        const gameContainer = document.getElementById('game-container');
        if (gameContainer) {
            gameContainer.style.display = 'block !important';
            gameContainer.style.visibility = 'visible !important';
            gameContainer.style.opacity = '1 !important';
            gameContainer.style.position = 'relative !important';
            gameContainer.style.zIndex = '9999 !important';
            gameContainer.style.width = '100% !important';
            gameContainer.style.height = '100% !important';
            gameContainer.classList.remove('hidden');
            console.log('Game container forced visible');
        }
        
        // Force body styles
        document.body.style.overflow = 'auto !important';
        document.body.style.position = 'relative !important';
        document.documentElement.style.overflow = 'auto !important';
        
        // Force show map container
        const mapContainer = document.getElementById('map');
        if (mapContainer) {
            mapContainer.style.display = 'block !important';
            mapContainer.style.visibility = 'visible !important';
            mapContainer.style.opacity = '1 !important';
            mapContainer.style.width = '100% !important';
            mapContainer.style.height = '100% !important';
            console.log('Map container forced visible');
        }
        
        // Inject emergency CSS
        const emergencyCSS = `
            <style id="emergency-css">
                .game-container { display: block !important; visibility: visible !important; opacity: 1 !important; z-index: 9999 !important; }
                .map-container { display: block !important; visibility: visible !important; opacity: 1 !important; }
                .modal, .modal-content, .tutorial-content, .loading-screen { display: none !important; visibility: hidden !important; opacity: 0 !important; }
                body { overflow: auto !important; }
            </style>
        `;
        document.head.insertAdjacentHTML('beforeend', emergencyCSS);
        
        // Also inject modal CSS
        const modalCSS = `
            <style id="modal-emergency-css">
                .modal:not(.hidden) { display: flex !important; visibility: visible !important; opacity: 1 !important; z-index: 9999 !important; }
                .modal-content:not(.hidden) { display: block !important; visibility: visible !important; opacity: 1 !important; }
                .modal-body { display: block !important; visibility: visible !important; opacity: 1 !important; }
            </style>
        `;
        document.head.insertAdjacentHTML('beforeend', modalCSS);
        
        console.log('🚨 GAME SHOULD NOW BE VISIBLE!');
        console.log('Game container:', gameContainer);
        console.log('Map container:', mapContainer);
    }
    
    /**
     * Force show codex modal (emergency function)
     */
    forceShowCodex() {
        this.log('🚨 FORCE SHOWING CODEX MODAL');
        
        const codexModal = document.getElementById('codex-modal');
        if (codexModal) {
            // Remove all classes that might hide it
            codexModal.className = 'modal';
            
            // Set all styles directly
            codexModal.style.cssText = `
                display: flex !important;
                visibility: visible !important;
                opacity: 1 !important;
                z-index: 99999 !important;
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                width: 100% !important;
                height: 100% !important;
                background: rgba(0, 0, 0, 0.8) !important;
                align-items: center !important;
                justify-content: center !important;
            `;
            
            // Force content visibility
            const modalContent = codexModal.querySelector('.modal-content');
            if (modalContent) {
                modalContent.style.cssText = `
                    display: block !important;
                    visibility: visible !important;
                    opacity: 1 !important;
                    background: white !important;
                    color: black !important;
                    padding: 20px !important;
                    border-radius: 10px !important;
                    max-width: 600px !important;
                    max-height: 80vh !important;
                    overflow-y: auto !important;
                `;
            }
            
            this.log('🚨 CODEX MODAL FORCE SHOWN!');
            this.log('Modal element:', codexModal);
            this.log('Modal computed style:', window.getComputedStyle(codexModal).display);
        } else {
            this.log('❌ Codex modal not found');
        }
    }
    
    /**
     * Test close codex function
     */
    testCloseCodex() {
        this.log('🧪 Testing codex close button...');
        const codexCloseBtn = document.getElementById('codex-close');
        if (codexCloseBtn) {
            this.log('Codex close button found, simulating click');
            codexCloseBtn.click();
        } else {
            this.log('❌ Codex close button not found');
        }
    }
    
    /**
     * Test close settings function
     */
    testCloseSettings() {
        this.log('🧪 Testing settings close button...');
        const settingsCloseBtn = document.getElementById('settings-close');
        if (settingsCloseBtn) {
            this.log('Settings close button found, simulating click');
            settingsCloseBtn.click();
        } else {
            this.log('❌ Settings close button not found');
        }
    }
    
    /**
     * Test player marker function
     */
    testPlayerMarker() {
        this.log('🧪 Testing player marker...');
        
        if (this.systems.map) {
            const testPosition = { lat: 61.469491, lng: 23.730586 };
            this.systems.map.createPlayerMarker(testPosition);
            this.log('✓ Player marker test created');
        } else {
            this.log('❌ Map not available');
        }
    }
    
    /**
     * Test discovery click function
     */
    testDiscoveryClick() {
        this.log('🧪 Testing discovery click...');
        
        if (this.systems.map && this.systems.discovery) {
            const testDiscovery = {
                id: 'test_click_marker',
                type: 'Cosmic Fragment',
                rarity: 'Common',
                xp: 10,
                position: { lat: 61.469491, lng: 23.730586 }
            };
            
            this.systems.map.addDiscoveryMarker(testDiscovery);
            this.log('✓ Test discovery marker created - try clicking it!');
        } else {
            this.log('❌ Map or discovery system not available');
        }
    }
    
    /**
     * Test reshuffle function
     */
    testReshuffle() {
        this.log('🧪 Testing reshuffle...');
        
        if (this.systems.discovery) {
            this.log('Before reshuffle - discoveries count:', this.systems.discovery.discoveries.size);
            this.systems.discovery.clearDiscoveries();
            this.log('After clear - discoveries count:', this.systems.discovery.discoveries.size);
            this.systems.discovery.spawnDiscoveries();
            this.log('After spawn - discoveries count:', this.systems.discovery.discoveries.size);
            this.log('✓ Reshuffle test completed');
        } else {
            this.log('❌ Discovery system not available');
        }
    }
    
    /**
     * Test popup positioning
     */
    testPopupPosition() {
        this.log('🧪 Testing popup positioning...');
        
        if (this.systems.map) {
            const testDiscovery = {
                id: 'test_popup_position',
                type: 'Void Crystal',
                rarity: 'Epic',
                xp: 100,
                position: { lat: 61.469491, lng: 23.730586 }
            };
            
            this.log('Creating test discovery at:', testDiscovery.position);
            this.systems.map.addDiscoveryMarker(testDiscovery);
            
            // Wait a moment then show popup
            setTimeout(() => {
                this.systems.map.showDiscoveryDetails(testDiscovery);
                this.log('✓ Test popup should appear at the marker location');
            }, 500);
        } else {
            this.log('❌ Map system not available');
        }
    }
    
    /**
     * Test marker positions
     */
    testMarkerPositions() {
        this.log('🧪 Testing marker positions...');
        
        if (this.systems.discovery && this.systems.map) {
            // Get current player position
            const playerPos = this.systems.geolocation?.getPosition();
            if (playerPos) {
                this.log('Current player position:', playerPos);
                
                // Create test discoveries at known positions
                const testPositions = [
                    { lat: playerPos.lat + 0.001, lng: playerPos.lng, name: 'North' },
                    { lat: playerPos.lat - 0.001, lng: playerPos.lng, name: 'South' },
                    { lat: playerPos.lat, lng: playerPos.lng + 0.001, name: 'East' },
                    { lat: playerPos.lat, lng: playerPos.lng - 0.001, name: 'West' }
                ];
                
                testPositions.forEach((pos, index) => {
                    const testDiscovery = {
                        id: `test_position_${index}`,
                        type: 'Test Marker',
                        rarity: 'Common',
                        xp: 1,
                        position: pos
                    };
                    
                    this.log(`Creating ${pos.name} test marker at:`, pos);
                    this.systems.map.addDiscoveryMarker(testDiscovery);
                });
                
                this.log('✓ Test markers created - check if they appear in correct positions relative to player');
            } else {
                this.log('❌ No player position available');
            }
        } else {
            this.log('❌ Discovery or map system not available');
        }
    }
    
    /**
     * Test player position timing
     */
    testPlayerPositionTiming() {
        this.log('🧪 Testing player position timing...');
        
        if (this.systems.geolocation) {
            const playerPos = this.systems.geolocation.getPosition();
            if (playerPos) {
                this.log('Current player position:', playerPos);
                this.log('Discovery system player position:', this.systems.discovery?.playerPosition);
                this.log('Number of discoveries:', this.systems.discovery?.discoveries?.size || 0);
                
                if (this.systems.discovery?.discoveries?.size === 0) {
                    this.log('No discoveries spawned yet - this is correct if position was just received');
                } else {
                    this.log('Discoveries already spawned - checking positions...');
                }
            } else {
                this.log('❌ No player position available from geolocation');
            }
        } else {
            this.log('❌ Geolocation system not available');
        }
    }
    
    /**
     * Test markers function
     */
    testMarkers() {
        this.log('🧪 Testing marker creation...');
        
        if (this.systems.map && this.systems.map.markerFactory) {
            const testDiscovery = {
                id: 'test_marker',
                type: 'Cosmic Fragment',
                position: { lat: 61.469491, lng: 23.730586 }
            };
            
            this.systems.map.addDiscoveryMarker(testDiscovery);
            this.log('✓ Test marker created');
        } else {
            this.log('❌ Map or marker factory not available');
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
    
    // Force show game immediately as fallback
    setTimeout(() => {
        if (game) {
            game.hideLoadingScreen();
        }
    }, 2000);
    
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
        game.hideLoadingScreen();
    }
});

// Handle page visibility (pause when hidden)
document.addEventListener('visibilitychange', () => {
    if (game && game.gameLoop) {
    if (document.hidden) {
            clearInterval(game.gameLoop);
            game.gameLoop = null;
    } else {
            game.startGameLoop();
        }
    }
});