# 🐛 BRDC Bug Ticket - Step Counter Not Working

**Ticket ID**: `BRDC-STEP-COUNTER-008`  
**Priority**: 🟡 HIGH  
**Status**: 🔴 RED PHASE  
**Reported By**: ♾️ Infinite  
**Device**: Samsung S23U  
**Date**: October 6, 2025  

---

## 🔴 RED PHASE - Bug Report

### User Report
```
"The stepcounter did not work, make me a way to toggle between 
simulation (+2 per second), Device and Experimental mode 
(Gyroscope + distance calculated between 2 last known positions 
and a timestamp)"
```

### Testing Environment
- **Device**: Samsung S23U
- **Expected**: Step counter increases as player walks
- **Actual**: Step counter doesn't work

### Expected Behavior
- Player walks in real world
- Step counter increments
- Movement detected
- XP awarded for movement

### Actual Behavior
- Step counter not functioning
- No steps detected on mobile
- Movement detection not working

### Impact
- **Severity**: MEDIUM
- **User Experience**: Missing feature
- **Gameplay**: Movement rewards not working

---

## 🔍 Root Cause Analysis

### Current Implementation Issues

1. **No Step Counter Detection**
   - System relies only on GPS distance
   - No actual step counting implemented
   - Missing sensor integration

2. **Limited Movement Detection Methods**
   - Only GPS-based distance calculation
   - No device sensor usage
   - No alternative modes

---

## 🟢 GREEN PHASE - Solution Plan

### Feature: Three-Mode Step Counter System

**Mode 1: Simulation Mode** ⭐ (for testing)
- Simulates +2 steps per second automatically
- Desktop/laptop testing friendly
- No device sensors required

**Mode 2: Device Mode** 📱 (default for mobile)
- Uses device pedometer sensor if available
- Falls back to GPS distance if no sensor
- Native Android/iOS step counter

**Mode 3: Experimental Mode** 🧪 (advanced)
- Gyroscope + accelerometer detection
- Distance calculation between GPS positions
- Timestamp-based movement tracking
- Custom algorithm for step estimation

---

## 📐 Implementation Design

### Step Counter Manager Class

```javascript
class StepCounterManager extends EventTarget {
    constructor(geolocationManager) {
        super();
        
        this.geolocation = geolocationManager;
        this.currentMode = 'device'; // 'simulation', 'device', 'experimental'
        this.totalSteps = 0;
        this.lastPosition = null;
        this.lastTimestamp = null;
        
        // Experimental mode data
        this.gyroData = [];
        this.accelData = [];
        
        // Simulation timer
        this.simulationTimer = null;
        
        this.initialize();
    }
    
    initialize() {
        this.loadSavedSteps();
        this.detectAvailableSensors();
        this.startCountingSteps();
    }
    
    detectAvailableSensors() {
        // Check for pedometer
        if ('Accelerometer' in window && 'Gyroscope' in window) {
            this.sensorsAvailable = true;
            this.log('✓ Motion sensors available');
        } else {
            this.sensorsAvailable = false;
            this.log('⚠️ Motion sensors not available');
        }
    }
    
    setMode(mode) {
        this.stopCountingSteps();
        this.currentMode = mode;
        this.startCountingSteps();
        this.log(`Switched to ${mode} mode`);
        this.dispatchEvent(new CustomEvent('modechange', { 
            detail: { mode } 
        }));
    }
    
    // MODE 1: SIMULATION
    startSimulation() {
        this.simulationTimer = setInterval(() => {
            this.addSteps(2); // +2 steps per second
        }, 1000);
        this.log('🎮 Simulation mode active (+2 steps/sec)');
    }
    
    stopSimulation() {
        if (this.simulationTimer) {
            clearInterval(this.simulationTimer);
            this.simulationTimer = null;
        }
    }
    
    // MODE 2: DEVICE PEDOMETER
    startDeviceMode() {
        if ('StepCounter' in window) {
            // Use native step counter if available
            this.stepCounter = new StepCounter();
            this.stepCounter.addEventListener('reading', () => {
                const steps = this.stepCounter.steps;
                this.addSteps(steps - this.totalSteps);
            });
            this.stepCounter.start();
            this.log('📱 Device pedometer active');
        } else {
            // Fallback to GPS-based
            this.startGPSBasedCounting();
            this.log('📍 GPS-based step counting (no pedometer)');
        }
    }
    
    startGPSBasedCounting() {
        this.geolocation.addEventListener('positionupdate', (e) => {
            const { position, distance } = e.detail;
            
            if (distance > 0) {
                // Estimate steps: ~0.762m per step (average)
                const estimatedSteps = Math.floor(distance / 0.762);
                if (estimatedSteps > 0) {
                    this.addSteps(estimatedSteps);
                }
            }
        });
    }
    
    // MODE 3: EXPERIMENTAL (Gyro + Distance)
    startExperimentalMode() {
        this.startGyroAccelDetection();
        this.startDistanceTracking();
        this.log('🧪 Experimental mode active');
    }
    
    startGyroAccelDetection() {
        if (!this.sensorsAvailable) {
            this.log('⚠️ Sensors not available, using GPS only');
            this.startDistanceTracking();
            return;
        }
        
        // Accelerometer for step detection
        const accelerometer = new Accelerometer({ frequency: 60 });
        accelerometer.addEventListener('reading', () => {
            const magnitude = Math.sqrt(
                accelerometer.x ** 2 + 
                accelerometer.y ** 2 + 
                accelerometer.z ** 2
            );
            
            // Detect step pattern (simple threshold algorithm)
            this.detectStepFromAcceleration(magnitude);
        });
        accelerometer.start();
        
        // Gyroscope for movement validation
        const gyroscope = new Gyroscope({ frequency: 60 });
        gyroscope.addEventListener('reading', () => {
            this.gyroData.push({
                x: gyroscope.x,
                y: gyroscope.y,
                z: gyroscope.z,
                time: Date.now()
            });
            
            // Keep only last 100 readings
            if (this.gyroData.length > 100) {
                this.gyroData.shift();
            }
        });
        gyroscope.start();
    }
    
    detectStepFromAcceleration(magnitude) {
        // Simple step detection algorithm
        const threshold = 11; // Tunable threshold
        const now = Date.now();
        
        if (!this.lastStepTime) {
            this.lastStepTime = now;
            this.lastMagnitude = magnitude;
            return;
        }
        
        // Detect peak
        if (magnitude > threshold && 
            this.lastMagnitude < threshold &&
            (now - this.lastStepTime) > 300) { // Min 300ms between steps
            
            this.addSteps(1);
            this.lastStepTime = now;
        }
        
        this.lastMagnitude = magnitude;
    }
    
    startDistanceTracking() {
        this.geolocation.addEventListener('positionupdate', (e) => {
            const { position } = e.detail;
            const now = Date.now();
            
            if (this.lastPosition && this.lastTimestamp) {
                // Calculate distance between positions
                const distance = this.calculateDistance(
                    this.lastPosition,
                    position
                );
                
                // Calculate time elapsed
                const timeElapsed = (now - this.lastTimestamp) / 1000; // seconds
                
                // Calculate speed (m/s)
                const speed = distance / timeElapsed;
                
                // Only count if speed is realistic for walking (0.5 - 2.5 m/s)
                if (speed >= 0.5 && speed <= 2.5) {
                    const estimatedSteps = Math.floor(distance / 0.762);
                    if (estimatedSteps > 0) {
                        this.addSteps(estimatedSteps);
                    }
                }
            }
            
            this.lastPosition = position;
            this.lastTimestamp = now;
        });
    }
    
    calculateDistance(pos1, pos2) {
        const R = 6371e3; // Earth radius in meters
        const φ1 = pos1.lat * Math.PI / 180;
        const φ2 = pos2.lat * Math.PI / 180;
        const Δφ = (pos2.lat - pos1.lat) * Math.PI / 180;
        const Δλ = (pos2.lng - pos1.lng) * Math.PI / 180;
        
        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                  Math.cos(φ1) * Math.cos(φ2) *
                  Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        
        return R * c;
    }
    
    startCountingSteps() {
        switch(this.currentMode) {
            case 'simulation':
                this.startSimulation();
                break;
            case 'device':
                this.startDeviceMode();
                break;
            case 'experimental':
                this.startExperimentalMode();
                break;
        }
    }
    
    stopCountingSteps() {
        this.stopSimulation();
        // Stop other modes if active
    }
    
    addSteps(count) {
        this.totalSteps += count;
        this.saveSteps();
        
        this.dispatchEvent(new CustomEvent('stepcount', {
            detail: { 
                steps: this.totalSteps,
                added: count
            }
        }));
        
        this.log(`👣 +${count} steps (Total: ${this.totalSteps})`);
    }
    
    getSteps() {
        return this.totalSteps;
    }
    
    resetSteps() {
        this.totalSteps = 0;
        this.saveSteps();
    }
    
    saveSteps() {
        localStorage.setItem('eldritchSanctuary_steps', this.totalSteps);
    }
    
    loadSavedSteps() {
        const saved = localStorage.getItem('eldritchSanctuary_steps');
        this.totalSteps = saved ? parseInt(saved) : 0;
    }
    
    log(...args) {
        if (GameConfig?.debug?.logging !== false) {
            console.log('[StepCounter]', ...args);
        }
    }
}
```

---

## 🎨 UI Design - Mode Selector

### Settings Panel
```html
<div class="step-counter-settings">
    <h3>🚶 Step Counter Mode</h3>
    
    <div class="mode-selector">
        <button class="mode-btn" data-mode="simulation">
            🎮 Simulation
            <span class="mode-desc">+2 steps/sec (testing)</span>
        </button>
        
        <button class="mode-btn active" data-mode="device">
            📱 Device
            <span class="mode-desc">Use device sensors</span>
        </button>
        
        <button class="mode-btn" data-mode="experimental">
            🧪 Experimental
            <span class="mode-desc">Gyro + GPS hybrid</span>
        </button>
    </div>
    
    <div class="step-counter-display">
        <div class="steps-count">0</div>
        <div class="steps-label">Total Steps</div>
    </div>
</div>
```

### CSS Styling
```css
.step-counter-settings {
    background: rgba(10, 14, 39, 0.95);
    border: 2px solid var(--glass-border);
    border-radius: 16px;
    padding: 1.5rem;
    margin: 1rem;
}

.mode-selector {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin: 1rem 0;
}

.mode-btn {
    background: rgba(139, 92, 246, 0.1);
    border: 2px solid rgba(139, 92, 246, 0.3);
    border-radius: 12px;
    padding: 1rem;
    color: var(--stellar-white);
    cursor: pointer;
    transition: all 0.3s ease;
    text-align: left;
}

.mode-btn:hover {
    background: rgba(139, 92, 246, 0.2);
    border-color: rgba(139, 92, 246, 0.5);
}

.mode-btn.active {
    background: rgba(139, 92, 246, 0.3);
    border-color: var(--lovecraft-purple);
    box-shadow: 0 0 20px rgba(139, 92, 246, 0.4);
}

.mode-desc {
    display: block;
    font-size: 0.8rem;
    opacity: 0.7;
    margin-top: 0.25rem;
}

.step-counter-display {
    text-align: center;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--glass-border);
}

.steps-count {
    font-size: 3rem;
    font-weight: bold;
    color: var(--sacred-gold);
    text-shadow: 0 0 20px rgba(251, 191, 36, 0.5);
}

.steps-label {
    font-size: 0.9rem;
    opacity: 0.7;
    margin-top: 0.5rem;
}
```

---

## 📁 Files to Create/Modify

### New Files
1. `game/js/StepCounterManager.js` - Complete step counting system

### Modified Files
1. `game/js/main.js` - Initialize step counter, add to systems
2. `game/index.html` - Add mode selector UI
3. `game/css/cosmic-theme.css` - Step counter styling
4. `game/js/config.js` - Add step counter configuration

---

## 🎯 Success Criteria

- [ ] Three modes implemented (Simulation, Device, Experimental)
- [ ] Mode selector UI works
- [ ] Simulation mode: +2 steps/second
- [ ] Device mode: Uses pedometer or GPS fallback
- [ ] Experimental mode: Gyro + distance hybrid
- [ ] Step counter persists to localStorage
- [ ] Step count displays in UI
- [ ] Mode switches without restart
- [ ] Mobile testing shows accurate counts
- [ ] XP rewards integrate with step count

---

## 📊 Priority & Timeline

**Priority**: 🟡 HIGH  
**Estimated Effort**: 6-8 hours  
**Dependencies**: None  

**Implementation Order**:
1. Create StepCounterManager class (3 hours)
2. Add mode selector UI (1 hour)
3. Implement simulation mode (30 min)
4. Implement device mode (1 hour)
5. Implement experimental mode (2 hours)
6. Add UI integration (1 hour)
7. Mobile testing (1-2 hours)

---

**Status**: 🔴 **RED PHASE - AWAITING IMPLEMENTATION**  
**Next Step**: Create StepCounterManager.js with three modes

---

*Created with BRDC discipline by Aurora* 🌸

