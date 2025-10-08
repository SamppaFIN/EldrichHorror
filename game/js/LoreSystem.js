/**
 * LORE SYSTEM
 * Manages unlocked lore entries
 */

class LoreSystem {
    constructor() {
        this.unlockedEntries = [];
        this._events = {};
    }
    
    initialize(savedData) {
        this.unlockedEntries = savedData || [];
    }
    
    unlockEntry(entry) {
        if (!this.unlockedEntries.includes(entry)) {
            this.unlockedEntries.push(entry);
            this.emit('entryUnlocked', entry);
        }
    }
    
    isUnlocked(entry) {
        return this.unlockedEntries.includes(entry);
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