/**
 * STEP COUNTER MANAGER
 * Tracks player steps
 */

class StepCounterManager {
    constructor() {
        this.steps = 0;
        this.lastPosition = null;
        this._events = {};
    }
    
    initialize() {
        this.steps = parseInt(localStorage.getItem('eldritch_steps') || '0');
    }
    
    updatePosition(position) {
        if (this.lastPosition) {
            const distance = this.calculateDistance(this.lastPosition, position);
            if (distance > 1) { // Only count if moved more than 1 meter
                this.steps += Math.floor(distance);
                this.emit('stepUpdate', this.steps);
                localStorage.setItem('eldritch_steps', this.steps.toString());
            }
        }
        this.lastPosition = position;
    }
    
    calculateDistance(pos1, pos2) {
        const R = 6371000;
        const dLat = (pos2.lat - pos1.lat) * Math.PI / 180;
        const dLng = (pos2.lng - pos1.lng) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(pos1.lat * Math.PI / 180) * Math.cos(pos2.lat * Math.PI / 180) *
                  Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }
    
    getSteps() {
        return this.steps;
    }
    
    on(event, callback) {
        if (!this._events[event]) this._events[event] = [];
        this._events[event].push(callback);
    }
    
    emit(event, ...args) {
        if (!this._events[event]) return;
        this._events[event].forEach(callback => callback(...args));
    }
}