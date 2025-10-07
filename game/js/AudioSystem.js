/**
 * AudioSystem - Cosmic Sound Effects & Game Audio
 * BRDC Ticket: BRDC-AUDIO-SYSTEM-010
 * Status: GREEN PHASE - Implementation
 * 
 * Handles all game audio including:
 * - Discovery detection sounds
 * - Level-up notifications
 * - Proximity change effects
 * - Cosmic ambient sounds
 * - System notifications
 */

class AudioSystem extends EventTarget {
    constructor() {
        super();
        
        this.audioContext = null;
        this.sounds = new Map();
        this.isEnabled = true;
        this.volume = 0.7;
        this.masterVolume = 0.8;
        
        // Audio settings
        this.config = {
            discoveryRange: {
                far: { volume: 0.3, frequency: 220 },    // Low hum
                near: { volume: 0.5, frequency: 440 },     // Higher tone
                close: { volume: 0.7, frequency: 660 },    // Bright chime
                ready: { volume: 0.9, frequency: 880 }     // Crystal clear
            },
            notifications: {
                xp: { volume: 0.6, frequency: 523 },      // C5 note
                levelup: { volume: 0.8, frequency: 659 }, // E5 note
                discovery: { volume: 0.7, frequency: 392 }, // G4 note
                error: { volume: 0.5, frequency: 185 }     // Low warning
            },
            ambient: {
                cosmic: { volume: 0.2, frequency: 55 },   // Deep cosmic hum
                ethereal: { volume: 0.15, frequency: 110 } // Ethereal presence
            }
        };
        
        this.log('AudioSystem initialized');
    }
    
    /**
     * Initialize audio context
     */
    async initialize() {
        try {
            // Create audio context
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Resume context if suspended (required for user interaction)
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }
            
            this.log('✓ Audio context initialized');
            return true;
        } catch (error) {
            this.log('❌ Audio initialization failed:', error);
            this.isEnabled = false;
            return false;
        }
    }
    
    /**
     * Play discovery proximity sound
     */
    playDiscoveryProximity(proximityType) {
        if (!this.isEnabled || !this.audioContext) return;
        
        const config = this.config.discoveryRange[proximityType];
        if (!config) return;
        
        this.playTone({
            frequency: config.frequency,
            duration: 0.3,
            volume: config.volume * this.volume * this.masterVolume,
            type: 'sine',
            envelope: {
                attack: 0.05,
                decay: 0.1,
                sustain: 0.7,
                release: 0.15
            }
        });
        
        this.log(`🔊 Discovery proximity: ${proximityType} (${config.frequency}Hz)`);
    }
    
    /**
     * Play XP gain sound
     */
    playXPGain(amount = 1) {
        if (!this.isEnabled || !this.audioContext) return;
        
        const config = this.config.notifications.xp;
        const frequency = config.frequency + (amount * 10); // Higher XP = higher pitch
        
        this.playTone({
            frequency: frequency,
            duration: 0.2,
            volume: config.volume * this.volume * this.masterVolume,
            type: 'triangle',
            envelope: {
                attack: 0.02,
                decay: 0.05,
                sustain: 0.8,
                release: 0.13
            }
        });
        
        this.log(`🔊 XP gained: ${amount} (${frequency}Hz)`);
    }
    
    /**
     * Play level up sound
     */
    playLevelUp() {
        if (!this.isEnabled || !this.audioContext) return;
        
        const config = this.config.notifications.levelup;
        
        // Play ascending chord
        const frequencies = [config.frequency, config.frequency * 1.25, config.frequency * 1.5];
        
        frequencies.forEach((freq, index) => {
            setTimeout(() => {
                this.playTone({
                    frequency: freq,
                    duration: 0.6,
                    volume: config.volume * this.volume * this.masterVolume,
                    type: 'sine',
                    envelope: {
                        attack: 0.1,
                        decay: 0.2,
                        sustain: 0.6,
                        release: 0.3
                    }
                });
            }, index * 100);
        });
        
        this.log(`🔊 Level up! (${frequencies.join(', ')}Hz)`);
    }
    
    /**
     * Play discovery collection sound
     */
    playDiscoveryCollection(discoveryType) {
        if (!this.isEnabled || !this.audioContext) return;
        
        const config = this.config.notifications.discovery;
        
        // Play magical chime sequence
        const frequencies = [config.frequency, config.frequency * 1.2, config.frequency * 1.4];
        
        frequencies.forEach((freq, index) => {
            setTimeout(() => {
                this.playTone({
                    frequency: freq,
                    duration: 0.4,
                    volume: config.volume * this.volume * this.masterVolume,
                    type: 'sine',
                    envelope: {
                        attack: 0.05,
                        decay: 0.1,
                        sustain: 0.7,
                        release: 0.25
                    }
                });
            }, index * 150);
        });
        
        this.log(`🔊 Discovery collected: ${discoveryType}`);
    }
    
    /**
     * Play notification sound
     */
    playNotification(type = 'info') {
        if (!this.isEnabled || !this.audioContext) return;
        
        const config = this.config.notifications[type] || this.config.notifications.discovery;
        
        this.playTone({
            frequency: config.frequency,
            duration: 0.3,
            volume: config.volume * this.volume * this.masterVolume,
            type: 'sine',
            envelope: {
                attack: 0.05,
                decay: 0.1,
                sustain: 0.6,
                release: 0.15
            }
        });
        
        this.log(`🔊 Notification: ${type}`);
    }
    
    /**
     * Play cosmic ambient sound
     */
    playCosmicAmbient() {
        if (!this.isEnabled || !this.audioContext) return;
        
        const config = this.config.ambient.cosmic;
        
        // Create a slow, deep cosmic hum
        this.playTone({
            frequency: config.frequency,
            duration: 2.0,
            volume: config.volume * this.volume * this.masterVolume,
            type: 'sine',
            envelope: {
                attack: 1.0,
                decay: 0.5,
                sustain: 0.3,
                release: 0.5
            }
        });
        
        this.log(`🔊 Cosmic ambient`);
    }
    
    /**
     * Play ethereal presence sound
     */
    playEtherealPresence() {
        if (!this.isEnabled || !this.audioContext) return;
        
        const config = this.config.ambient.ethereal;
        
        // Create ethereal, otherworldly sound
        this.playTone({
            frequency: config.frequency,
            duration: 1.5,
            volume: config.volume * this.volume * this.masterVolume,
            type: 'triangle',
            envelope: {
                attack: 0.3,
                decay: 0.2,
                sustain: 0.4,
                release: 1.0
            }
        });
        
        this.log(`🔊 Ethereal presence`);
    }
    
    /**
     * Core tone generation
     */
    playTone(options) {
        if (!this.audioContext) return;
        
        const {
            frequency = 440,
            duration = 0.5,
            volume = 0.5,
            type = 'sine',
            envelope = {
                attack: 0.1,
                decay: 0.1,
                sustain: 0.7,
                release: 0.2
            }
        } = options;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        // Connect nodes
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // Set oscillator properties
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.type = type;
        
        // Set envelope
        const now = this.audioContext.currentTime;
        const attackTime = envelope.attack;
        const decayTime = envelope.decay;
        const sustainLevel = envelope.sustain;
        const releaseTime = envelope.release;
        
        // ADSR envelope
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(volume, now + attackTime);
        gainNode.gain.linearRampToValueAtTime(volume * sustainLevel, now + attackTime + decayTime);
        gainNode.gain.setValueAtTime(volume * sustainLevel, now + duration - releaseTime);
        gainNode.gain.linearRampToValueAtTime(0, now + duration);
        
        // Start and stop oscillator
        oscillator.start(now);
        oscillator.stop(now + duration);
    }
    
    /**
     * Play error/warning sound
     */
    playError() {
        if (!this.isEnabled || !this.audioContext) return;
        
        const config = this.config.notifications.error;
        
        // Play descending warning tone
        const frequencies = [config.frequency * 2, config.frequency];
        
        frequencies.forEach((freq, index) => {
            setTimeout(() => {
                this.playTone({
                    frequency: freq,
                    duration: 0.4,
                    volume: config.volume * this.volume * this.masterVolume,
                    type: 'sawtooth',
                    envelope: {
                        attack: 0.05,
                        decay: 0.1,
                        sustain: 0.8,
                        release: 0.25
                    }
                });
            }, index * 200);
        });
        
        this.log(`🔊 Error sound`);
    }
    
    /**
     * Set master volume
     */
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        this.log(`Volume set to: ${Math.round(this.masterVolume * 100)}%`);
    }
    
    /**
     * Set sound effects volume
     */
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        this.log(`SFX volume set to: ${Math.round(this.volume * 100)}%`);
    }
    
    /**
     * Enable/disable audio
     */
    setEnabled(enabled) {
        this.isEnabled = enabled;
        this.log(`Audio ${enabled ? 'enabled' : 'disabled'}`);
    }
    
    /**
     * Get audio status
     */
    getStatus() {
        return {
            enabled: this.isEnabled,
            contextState: this.audioContext?.state || 'not initialized',
            volume: this.volume,
            masterVolume: this.masterVolume
        };
    }
    
    /**
     * Logging
     */
    log(...args) {
        if (GameConfig?.debug?.logging !== false) {
            console.log('[AudioSystem]', ...args);
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AudioSystem;
}
