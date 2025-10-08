/**
 * GPS SIMULATOR
 * Simulates GPS movement for testing
 */

class GPSSimulator {
    constructor() {
        this.isRunning = false;
        this.isPaused = false;
        this.currentPosition = null;
        this.direction = 0;
        this.speed = GameConfig.geolocation.simulator.walkingSpeed;
        this.interval = null;
        this._events = {};
    }
    
    /**
     * Start simulator
     */
    start(lat, lng) {
        this.currentPosition = { lat, lng };
        this.isRunning = true;
        this.isPaused = false;
        
        this.interval = setInterval(() => {
            if (!this.isPaused) {
                this.updatePosition();
            }
        }, GameConfig.geolocation.simulator.updateInterval);
        
        this.emit('started');
    }
    
    /**
     * Pause simulator
     */
    pause() {
        this.isPaused = true;
        this.emit('paused');
    }
    
    /**
     * Resume simulator
     */
    resume() {
        this.isPaused = false;
        this.emit('resumed');
    }
    
    /**
     * Stop simulator
     */
    stop() {
        this.isRunning = false;
        this.isPaused = false;
        
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        
        this.emit('stopped');
    }
    
    /**
     * Move in direction
     */
    move(direction) {
        const directions = {
            up: 0,
            right: 90,
            down: 180,
            left: 270
        };
        
        this.direction = directions[direction] || this.direction;
    }
    
    /**
     * Set speed
     */
    setSpeed(speed) {
        this.speed = speed;
    }
    
    /**
     * Update position
     */
    updatePosition() {
        if (!this.currentPosition) return;
        
        // Move in current direction
        const distance = this.speed * (GameConfig.geolocation.simulator.updateInterval / 1000);
        const lat = this.currentPosition.lat + (distance * Math.cos(this.direction * Math.PI / 180)) / 111000;
        const lng = this.currentPosition.lng + (distance * Math.sin(this.direction * Math.PI / 180)) / (111000 * Math.cos(this.currentPosition.lat * Math.PI / 180));
        
        // Add GPS noise
        const noise = (Math.random() - 0.5) * GameConfig.geolocation.simulator.accuracy;
        const noisyLat = lat + noise / 111000;
        const noisyLng = lng + noise / (111000 * Math.cos(lat * Math.PI / 180));
        
        this.currentPosition = { lat: noisyLat, lng: noisyLng };
        
        // Emit position update
        this.emit('positionUpdate', {
            lat: noisyLat,
            lng: noisyLng,
            accuracy: GameConfig.geolocation.simulator.accuracy,
            timestamp: Date.now()
        });
    }
    
    /**
     * Get current position
     */
    getPosition() {
        return this.currentPosition;
    }
    
    /**
     * Event emitter methods
     */
    on(event, callback) {
        if (!this._events[event]) this._events[event] = [];
        this._events[event].push(callback);
    }
    
    emit(event, ...args) {
        if (!this._events[event]) return;
        this._events[event].forEach(callback => callback(...args));
    }
}