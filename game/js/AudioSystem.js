/**
 * AUDIO SYSTEM
 * Handles game audio
 */

class AudioSystem {
    constructor() {
        this.audioContext = null;
        this.sounds = {};
        this._events = {};
    }
    
    initialize() {
        this.log('AudioSystem initialized');
        this.initializeAudioContext();
    }
    
    initializeAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.log('✓ Audio context initialized');
        } catch (error) {
            this.log('Audio context initialization failed:', error);
        }
    }
    
    playDiscoveryCollection() {
        // Simple beep sound
        if (this.audioContext) {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
            oscillator.frequency.setValueAtTime(1200, this.audioContext.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.2);
        }
    }
    
    on(event, callback) {
        if (!this._events[event]) this._events[event] = [];
        this._events[event].push(callback);
    }
    
    emit(event, ...args) {
        if (!this._events[event]) return;
        this._events[event].forEach(callback => callback(...args));
    }
    
    log(...args) {
        console.log('[AudioSystem]', ...args);
    }
}