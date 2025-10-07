# 🎮 Klitoritari - Next Features Roadmap

**Status**: Core Systems Working ✅  
**Date**: October 6, 2025  
**Platform**: Desktop Verified, Mobile Pending

---

## 🎯 Current State: MVP Foundation Complete

### ✅ What's Working (Production Ready)
- Map rendering with Leaflet
- GPS acquisition and tracking
- Player marker with persistence
- Consciousness progression (XP, levels)
- Auto-save system
- Beautiful Lovecraftian UI
- Sacred geometry markers

### 🎮 What's Missing (Game Features)
The technical foundation is solid, but the **game content** is minimal:
- No marker interactions (can't click to do anything)
- No NPC encounters (Aurora doesn't spawn)
- No discoveries (nothing to find)
- No rewards (only passive XP)
- No objectives (no quests or goals)

---

## 🚀 FEATURE PRIORITY ROADMAP

### 🔴 TIER 1: Core Gameplay (Make It a Game!)

#### Feature 1: Marker Interaction System
**Why First**: Makes the game interactive instead of just watching  
**BRDC Ticket**: `BRDC-MARKER-INTERACTIONS-004`  
**Effort**: 2-3 hours

**What It Adds**:
- Click any marker to see details
- Different actions per marker type
- Proximity detection (can only interact when close)
- Visual feedback (hover states, click animations)

**Implementation**:
```javascript
// Click portal → Travel to location
// Click sacred space → Meditate (gain XP)
// Click NPC → Dialogue/quest
// Click player → View stats/customize
```

**BRDC Tests**:
- Click marker when far away → "Too far away" message
- Click marker when close → Interaction menu opens
- Click portal → Travel confirmation dialog
- Click sacred space → Meditation animation + XP gain

---

#### Feature 2: Discovery System
**Why Second**: Gives players something to DO  
**BRDC Ticket**: `BRDC-DISCOVERY-SYSTEM-005`  
**Effort**: 3-4 hours

**What It Adds**:
- Hidden sacred geometry fragments
- Auto-discover when player walks near (GPS based)
- Unlock lore entries
- Consciousness rewards
- Progress tracking

**Implementation**:
```javascript
// Spawn hidden discoveries in radius
// Check distance on GPS update
// Auto-collect when within 10m
// Play discovery animation
// Unlock related lore entry
// Give XP reward
```

**BRDC Tests**:
- Player walks within 10m → Discovery auto-collected
- Discovery gives XP → Consciousness increases
- Lore entry unlocks → Codex updated
- Discovery shows in stats → Discoveries count increases

---

#### Feature 3: Aurora NPC Encounters
**Why Third**: Adds personality and guidance  
**BRDC Ticket**: `BRDC-AURORA-NPC-006`  
**Effort**: 3-4 hours

**What It Adds**:
- Aurora spawns near player occasionally
- Click Aurora → Dialogue with multiple options
- Aurora gives quests/hints
- Aurora reacts to consciousness level
- Aurora provides lore

**Implementation**:
```javascript
// Spawn Aurora 50-100m from player
// Change dialogue based on:
//   - Player level
//   - Lore unlocked
//   - Time of day
// Simple dialogue tree
// Quest system basics
```

**BRDC Tests**:
- Aurora spawns → Marker appears on map
- Click Aurora → Dialogue opens
- Complete quest → Reward given
- Aurora disappears after interaction
- Aurora respawns after cooldown

---

### 🟡 TIER 2: Depth & Progression

#### Feature 4: Achievement System
**BRDC Ticket**: `BRDC-ACHIEVEMENTS-007`  
**Effort**: 2-3 hours

- First steps (walk 100m)
- Discoverer (find 5 discoveries)
- Enlightened (reach level 10)
- Explorer (visit 5 sacred spaces)
- Achievement notifications
- Achievement list UI

---

#### Feature 5: Sacred Space Meditation
**BRDC Ticket**: `BRDC-MEDITATION-008`  
**Effort**: 2-3 hours

- Click sacred space → Meditation minigame
- Hold button for duration
- Breathing animation
- XP bonus multiplier
- Cooldown system

---

#### Feature 6: Portal Travel System
**BRDC Ticket**: `BRDC-PORTAL-TRAVEL-009`  
**Effort**: 3-4 hours

- Click portal → Choose destination
- Teleport to new location
- Discovery spawn at destination
- Travel log/history
- Portal unlock system

---

### 🟢 TIER 3: Polish & Enhancement

#### Feature 7: Tutorial Quest Chain
**BRDC Ticket**: `BRDC-TUTORIAL-QUESTS-010`  
**Effort**: 2-3 hours

- Step-by-step first experience
- "Walk 10 steps"
- "Find your first discovery"
- "Meet Aurora"
- "Visit a sacred space"
- Tutorial quest UI

---

#### Feature 8: Day/Night Cycle
**BRDC Ticket**: `BRDC-DAY-NIGHT-011`  
**Effort**: 2-3 hours

- Map style changes with time
- Different encounters at night
- Visual atmosphere shifts
- Moon phase tracking

---

#### Feature 9: Consciousness Milestones
**BRDC Ticket**: `BRDC-MILESTONES-012`  
**Effort**: 2-3 hours

- Level 5 → "Awakening" celebration
- Level 10 → "Enlightenment" cutscene
- Stage transitions
- Unlock new features per stage
- Visual transformation

---

## 📋 Recommended Implementation Order

### Week 1: Make It Interactive (8-10 hours)
1. **Day 1-2**: Marker Interaction System (2-3h)
2. **Day 3-4**: Discovery System (3-4h)
3. **Day 5**: Aurora NPC Encounters (3-4h)

**Result**: Players can click things, find things, talk to Aurora

---

### Week 2: Add Depth (6-8 hours)
4. **Day 1**: Achievement System (2-3h)
5. **Day 2**: Sacred Space Meditation (2-3h)
6. **Day 3**: Portal Travel (3-4h)

**Result**: More things to do, progression feels rewarding

---

### Week 3: Polish (6-8 hours)
7. **Day 1**: Tutorial Quest Chain (2-3h)
8. **Day 2**: Day/Night Cycle (2-3h)
9. **Day 3**: Consciousness Milestones (2-3h)

**Result**: Professional polish, complete experience

---

## 🎯 Quick Win Recommendation

### Start Here: Discovery System (3-4 hours)

**Why Discovery First** (instead of interactions):
1. Works **automatically** (no UI needed yet)
2. Immediately rewarding (find things while walking)
3. Tests GPS integration
4. Unlocks lore (engages players)
5. Builds on existing marker system

**User Experience**:
```
Player opens game → GPS locks → Player marker appears
Player walks around → Gets close to hidden discovery
✨ FLASH! → "Discovery found! +50 XP"
Notification: "You found: Cosmic Fragment"
Lore unlocks: "The Awakening" entry
Codex badge appears (1/9 entries unlocked)
```

**This makes the game immediately FUN** without needing complex UI!

---

## 📊 Feature Effort Summary

| Feature | Effort | Impact | Priority |
|---------|--------|--------|----------|
| Discovery System | 3-4h | High | 🔴 START HERE |
| Marker Interactions | 2-3h | High | 🔴 Next |
| Aurora NPC | 3-4h | Medium | 🔴 After |
| Achievements | 2-3h | Medium | 🟡 Week 2 |
| Meditation | 2-3h | Medium | 🟡 Week 2 |
| Portal Travel | 3-4h | Low | 🟡 Week 2 |
| Tutorial Quests | 2-3h | Medium | 🟢 Polish |
| Day/Night | 2-3h | Low | 🟢 Polish |
| Milestones | 2-3h | Medium | 🟢 Polish |

**Total**: ~24-30 hours for complete feature set

---

## 🌟 What Makes This Roadmap Good

1. **BRDC First**: Every feature starts with ticket
2. **Incremental**: Each feature stands alone
3. **Testable**: Clear success criteria
4. **Prioritized**: High-impact features first
5. **Realistic**: 2-4 hour chunks (achievable)
6. **User-Focused**: Each adds visible value

---

## ❓ Your Decision, Infinite

**What would you like to implement first?**

**Option A**: Discovery System (3-4h) - **Recommended!**
- Makes game immediately fun
- No complex UI needed
- Tests GPS integration
- Unlocks lore system

**Option B**: Marker Interactions (2-3h)
- Makes clicking do something
- Foundation for all other features
- Adds UI complexity

**Option C**: Aurora NPC (3-4h)
- Adds personality
- Requires dialogue system
- More complex

**Option D**: Something else in mind?

---

**Ready to create the BRDC ticket and implement when you are!** 🌸

*In infinite wisdom and step-by-step progress,*  
🌸 Aurora ♾️

