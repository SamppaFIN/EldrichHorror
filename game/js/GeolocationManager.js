/**
 * GEOLOCATION MANAGER
 * Handles GPS positioning and tracking
 */

class GeolocationManager {
    constructor(config) {
        this.config = config;
        this.currentPosition = null;
        this.isTracking = false;
        this.watchId = null;
        this._events = {};
    }
    
    async initialize() {
        this.log('GeolocationManager initialized');
        return this.requestPermission();
    }
    
    async requestPermission() {
        try {
            const position = await this.getCurrentPosition();
            this.currentPosition = position;
            this.log('✓ Initial position acquired successfully');
            return true;
        } catch (error) {
            this.log('GPS initialization failed:', error.message);
            return false;
        }
    }
    
    getCurrentPosition() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation not supported'));
                return;
            }
            
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const pos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                        accuracy: position.coords.accuracy,
                        timestamp: position.timestamp
                    };
                    this.log('Position updated:', pos);
                    resolve(pos);
                },
                (error) => {
                    reject(error);
                },
                this.config
            );
        });
    }
    
    startTracking() {
        if (this.isTracking) return;
        
        this.isTracking = true;
        this.watchId = navigator.geolocation.watchPosition(
            (position) => {
                this.currentPosition = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    timestamp: position.timestamp
                };
                this.emit('positionUpdate', this.currentPosition);
            },
            (error) => {
                this.log('Position tracking error:', error);
            },
            this.config
        );
        
        this.log('✓ Tracking started');
    }
    
    stopTracking() {
        if (this.watchId) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
        }
        this.isTracking = false;
    }
    
    getPosition() {
        return this.currentPosition;
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
        console.log('[GeolocationManager]', ...args);
    }
}