/**
 * CONSCIOUSNESS ENGINE
 * Tracks player progression and awakening
 * Sacred Principles: Consciousness-First Design
 */

class ConsciousnessEngine extends EventTarget {
    constructor(config = {}) {
        super();
        
        this.config = config.consciousness || GameConfig.consciousness;
        
        // Player consciousness state
        this.state = {
            level: this.config.startingLevel,
            currentXP: 0,
            totalXP: 0,
            stage: this.getStage(this.config.startingLevel),
            achievements: [],
            loreUnlocked: []
        };
        
        this.log('ConsciousnessEngine initialized');
    }
    
    /**
     * Initialize from saved data
     */
    initialize(savedState = null) {
        if (savedState) {
            this.state = { ...this.state, ...savedState };
            this.log('State loaded from save');
        }
        
        this.dispatchEvent(new CustomEvent('initialized', {
            detail: { state: this.state }
        }));
        
        return this.state;
    }
    
    /**
     * Award experience points
     */
    awardXP(amount, source = 'unknown') {
        if (amount <= 0) return;
        
        this.log(`+${amount} XP from ${source}`);
        
        const oldLevel = this.state.level;
        
        this.state.currentXP += amount;
        this.state.totalXP += amount;
        
        // Check for level up
        const xpNeeded = this.getXPForNextLevel();
        
        if (this.state.currentXP >= xpNeeded) {
            this.levelUp();
        }
        
        // Dispatch XP gain event
        this.dispatchEvent(new CustomEvent('xpgain', {
            detail: {
                amount,
                source,
                currentXP: this.state.currentXP,
                totalXP: this.state.totalXP,
                level: this.state.level
            }
        }));
    }
    
    /**
     * Level up!
     */
    levelUp() {
        const xpNeeded = this.getXPForNextLevel();
        this.state.currentXP -= xpNeeded;
        this.state.level++;
        
        const oldStage = this.state.stage;
        this.state.stage = this.getStage(this.state.level);
        
        const stageChanged = oldStage.name !== this.state.stage.name;
        
        this.log(`✨ LEVEL UP! Now level ${this.state.level} - ${this.state.stage.name}`);
        
        // Dispatch level up event
        this.dispatchEvent(new CustomEvent('levelup', {
            detail: {
                level: this.state.level,
                stage: this.state.stage,
                stageChanged
            }
        }));
        
        // Check if entered new stage
        if (stageChanged) {
            this.log(`🌟 STAGE TRANSITION: ${oldStage.name} → ${this.state.stage.name}`);
            
            this.dispatchEvent(new CustomEvent('stagechange', {
                detail: {
                    oldStage,
                    newStage: this.state.stage
                }
            }));
        }
        
        // Check for multiple level ups (overflow XP)
        const nextXpNeeded = this.getXPForNextLevel();
        if (this.state.currentXP >= nextXpNeeded) {
            this.levelUp(); // Recursive level up
        }
    }
    
    /**
     * Calculate XP needed for next level
     */
    getXPForNextLevel() {
        return Math.floor(
            this.config.xpPerLevel * Math.pow(this.state.level, this.config.xpCurve - 1)
        );
    }
    
    /**
     * Get total XP needed to reach a specific level
     */
    getTotalXPForLevel(level) {
        let total = 0;
        for (let i = this.config.startingLevel; i < level; i++) {
            total += Math.floor(
                this.config.xpPerLevel * Math.pow(i, this.config.xpCurve - 1)
            );
        }
        return total;
    }
    
    /**
     * Get consciousness stage for level
     */
    getStage(level) {
        let currentStage = this.config.stages[0];
        
        for (const stage of this.config.stages) {
            if (level >= stage.level) {
                currentStage = stage;
            }
        }
        
        return { ...currentStage };
    }
    
    /**
     * Get progress to next level (0-1)
     */
    getLevelProgress() {
        const xpNeeded = this.getXPForNextLevel();
        return Math.min(this.state.currentXP / xpNeeded, 1);
    }
    
    /**
     * Get progress to next stage (0-1)
     */
    getStageProgress() {
        const currentStage = this.state.stage;
        const stages = this.config.stages;
        const currentIndex = stages.findIndex(s => s.name === currentStage.name);
        
        if (currentIndex === stages.length - 1) {
            return 1; // Max stage reached
        }
        
        const nextStage = stages[currentIndex + 1];
        const levelRange = nextStage.level - currentStage.level;
        const levelProgress = this.state.level - currentStage.level;
        
        return Math.min(levelProgress / levelRange, 1);
    }
    
    /**
     * Unlock achievement
     */
    unlockAchievement(achievementId, name, description, xpReward = 0) {
        if (this.state.achievements.includes(achievementId)) {
            return false; // Already unlocked
        }
        
        this.state.achievements.push(achievementId);
        
        this.log(`🏆 ACHIEVEMENT UNLOCKED: ${name}`);
        
        if (xpReward > 0) {
            this.awardXP(xpReward, `achievement:${achievementId}`);
        }
        
        this.dispatchEvent(new CustomEvent('achievementunlocked', {
            detail: {
                id: achievementId,
                name,
                description,
                xpReward
            }
        }));
        
        return true;
    }
    
    /**
     * Unlock lore entry
     */
    unlockLore(loreId, title, content, consciousnessReward = 0) {
        if (this.state.loreUnlocked.includes(loreId)) {
            return false; // Already unlocked
        }
        
        this.state.loreUnlocked.push(loreId);
        
        this.log(`📖 LORE UNLOCKED: ${title}`);
        
        if (consciousnessReward > 0) {
            this.awardXP(consciousnessReward, `lore:${loreId}`);
        }
        
        this.dispatchEvent(new CustomEvent('loreunlocked', {
            detail: {
                id: loreId,
                title,
                content,
                consciousnessReward
            }
        }));
        
        return true;
    }
    
    /**
     * Check if achievement is unlocked
     */
    hasAchievement(achievementId) {
        return this.state.achievements.includes(achievementId);
    }
    
    /**
     * Check if lore is unlocked
     */
    hasLore(loreId) {
        return this.state.loreUnlocked.includes(loreId);
    }
    
    /**
     * Get current state
     */
    getState() {
        return {
            ...this.state,
            levelProgress: this.getLevelProgress(),
            stageProgress: this.getStageProgress(),
            xpToNextLevel: this.getXPForNextLevel()
        };
    }
    
    /**
     * Get state for saving
     */
    getSaveData() {
        return {
            level: this.state.level,
            currentXP: this.state.currentXP,
            totalXP: this.state.totalXP,
            achievements: [...this.state.achievements],
            loreUnlocked: [...this.state.loreUnlocked]
        };
    }
    
    /**
     * Get consciousness color based on level
     */
    getConsciousnessColor() {
        return this.state.stage.color;
    }
    
    /**
     * Calculate consciousness influence radius (meters)
     * Higher consciousness = wider influence
     */
    getInfluenceRadius() {
        const baseRadius = 50; // meters
        const levelBonus = this.state.level * 2;
        return baseRadius + levelBonus;
    }
    
    /**
     * Calculate reality distortion strength (0-1)
     * Higher consciousness = stronger distortion
     */
    getRealityDistortion() {
        return Math.min(this.state.level / this.config.maxLevel, 1);
    }
    
    /**
     * Get available actions based on consciousness level
     */
    getAvailableActions() {
        const actions = ['walk', 'interact', 'observe'];
        
        if (this.state.level >= 10) actions.push('meditate');
        if (this.state.level >= 25) actions.push('portal_travel');
        if (this.state.level >= 50) actions.push('reality_shift');
        if (this.state.level >= 75) actions.push('transcend');
        
        return actions;
    }
    
    /**
     * Reset consciousness (for testing or special events)
     */
    reset() {
        this.state = {
            level: this.config.startingLevel,
            currentXP: 0,
            totalXP: 0,
            stage: this.getStage(this.config.startingLevel),
            achievements: [],
            loreUnlocked: []
        };
        
        this.log('Consciousness reset');
        
        this.dispatchEvent(new CustomEvent('reset'));
    }
    
    /**
     * Logging
     */
    log(...args) {
        if (GameConfig?.debug?.logging !== false) {
            console.log('[ConsciousnessEngine]', ...args);
        }
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ConsciousnessEngine;
}

