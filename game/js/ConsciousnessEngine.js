/**
 * CONSCIOUSNESS ENGINE
 * Manages player consciousness level and XP
 */

class ConsciousnessEngine {
    constructor() {
        this.level = 1;
        this.xp = 0;
        this.baseXP = GameConfig.consciousness.baseXP;
        this._events = {};
    }
    
    initialize(savedData) {
        if (savedData) {
            this.level = savedData.level || 1;
            this.xp = savedData.xp || 0;
        }
    }
    
    addXP(amount) {
        this.xp += amount;
        this.checkLevelUp();
    }
    
    checkLevelUp() {
        const requiredXP = this.getRequiredXP();
        if (this.xp >= requiredXP) {
            this.level++;
            this.emit('levelUp', this.level);
        }
    }
    
    getRequiredXP() {
        return Math.floor(this.baseXP * Math.pow(this.level, GameConfig.consciousness.levelMultiplier));
    }
    
    update() {
        // Passive XP gain
        this.addXP(GameConfig.consciousness.passiveXPRate);
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