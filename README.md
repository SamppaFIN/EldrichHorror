# 🌸 Eldritch Sanctuary - Consciousness Walker

A location-based mystical exploration game combining Lovecraftian horror, consciousness evolution, and sacred geometry. Walk through physical space to discover mysteries, unlock lore, and expand consciousness.

## 🎮 Live Demo

[Play Now](https://samppa fin.github.io/EldrichHorror/) *(coming soon)*

## ✨ Features

### Core Mechanics
- 🗺️ **Real-world GPS-based gameplay** - Your physical location drives the game
- 🎯 **Discovery System** - Find mystical items by walking within 10 meters
- 💫 **Consciousness Evolution** - Gain XP, level up, unlock consciousness stages
- 📖 **Lore System** - Uncover Lovecraftian mysteries and sacred knowledge
- 🌟 **Animated Markers** - Beautiful SVG markers with pulsing effects
- 📱 **Responsive Design** - Works on desktop and mobile

### Discovery System
- **4 Rarity Tiers**: Common (🌸), Uncommon (🌟), Rare (🔮), Epic (💫)
- **Auto-collection** when within range
- **XP Rewards**: 50-200 XP based on rarity
- **Lore Unlocking** with each discovery
- **Toast Notifications** for feedback

### Visual Design
- **Cosmic Theme** with starfield background
- **Sacred Geometry** patterns
- **Glass-morphism** UI elements
- **Smooth Animations** and transitions

## 🚀 Quick Start

### Play Locally
1. Open `game/index.html` in a modern browser
2. Allow location permissions when prompted
3. Start exploring!

### Development Setup
```bash
# No build process required - pure vanilla JS!
# Just serve the files:
cd game
python -m http.server 8000
# or
php -S localhost:8000
```

Visit `http://localhost:8000`

## 📁 Project Structure

```
Klitoritari/
├── game/
│   ├── index.html              # Main game entry
│   ├── css/
│   │   ├── cosmic-theme.css    # Main theme & notifications
│   │   ├── sacred-geometry.css # Geometric patterns & markers
│   │   ├── animations.css      # Keyframe animations
│   │   └── loading-fix.css     # Z-index & layer fixes
│   ├── js/
│   │   ├── main.js             # Game initialization
│   │   ├── DiscoverySystem.js  # Discovery spawning & collection
│   │   ├── NotificationSystem.js # Toast notifications
│   │   ├── MapManager.js       # Leaflet map integration
│   │   ├── GameState.js        # State management & persistence
│   │   ├── ConsciousnessEngine.js # XP & leveling system
│   │   ├── LoreSystem.js       # Lore entries & unlocking
│   │   ├── GeolocationManager.js # GPS tracking
│   │   └── SVGMarkerFactory.js # Marker generation
│   └── svg/                    # SVG assets
├── tickets/                    # BRDC development tickets
└── docs/                       # Documentation & guides
```

## 🧪 Testing

### Desktop Testing (No GPS Movement)
```javascript
// In browser console:

// List all discoveries
game.systems.discovery.listDiscoveries()

// Force collect nearest discovery (for laptop testing)
game.systems.discovery.testCollectNearest()

// Check player XP
game.systems.consciousness.state.xp

// Check discovery count
game.systems.discovery.getDiscoveryCount()
```

See `LAPTOP_TESTING_GUIDE.md` for full testing instructions.

## 🎯 Game Mechanics

### Discovery Collection
1. **Spawn**: 5-10 discoveries spawn around your location (50-200m radius)
2. **Detection**: System continuously checks your distance to each discovery
3. **Collection**: Auto-collects when you're within 10 meters
4. **Rewards**: Grants XP, unlocks lore, shows notification

### Consciousness Evolution
- **XP Sources**: Discoveries, movement, achievements
- **Levels**: 1-100 with increasing requirements
- **Stages**: Awakening → Threshold → Illumination → Transcendence
- **Effects**: Unlock new content and abilities

### Lore System
- **9 Lore Entries**: Lovecraftian-themed stories
- **Categories**: Awakening, Void, Infinite, Threshold, etc.
- **Unlocking**: Associated with discovery collections
- **Tracking**: Progress saved to localStorage

## 🛠️ Technology Stack

- **Pure Vanilla JavaScript** - No framework dependencies
- **Leaflet.js** - Interactive map rendering
- **Geolocation API** - GPS tracking
- **LocalStorage** - Client-side persistence
- **CSS3 Animations** - Smooth visual effects
- **SVG** - Scalable vector graphics for markers

## 📖 Development Methodology

Built using **BRDC (Bug Report-Driven Coding)**:
- RED phase: Define failing tests
- GREEN phase: Implement solution
- Documentation: Comprehensive tickets and guides

All development tracked in `tickets/` directory.

## 🐛 Known Issues & Fixes

### Recently Fixed
- ✅ Map black screen (z-index collision)
- ✅ Marker scaling on zoom
- ✅ GPS marker persistence
- ✅ Discovery spawning (parameter mismatch)
- ✅ Lore system integration
- ✅ Popup z-index (hidden behind map)

See `tickets/bugfixes/` for details.

## 🗺️ Roadmap

### Next Features (Priority Order)
A. **Quest System** - Story-driven objectives
B. **Achievement System** - Unlock badges and titles
C. **Social Features** - Share discoveries, leaderboards
D. **Audio System** - Ambient sounds and effects
E. **Weather Integration** - Dynamic environmental effects

See `NEXT_FEATURES_ROADMAP.md` for full details.

## 📱 Browser Support

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

**Requirements**:
- Geolocation API support
- LocalStorage enabled
- JavaScript enabled

## 🤝 Contributing

This project follows BRDC methodology. To contribute:

1. Create a BRDC ticket in `tickets/`
2. Write RED phase (failing tests/requirements)
3. Implement GREEN phase (solution)
4. Document thoroughly
5. Test on multiple devices

## 📄 License

[MIT License](LICENSE) *(add your license)*

## 👥 Credits

**Development**: Aurora & Infinite  
**Methodology**: BRDC (Bug Report-Driven Coding)  
**Design**: Cosmic consciousness principles  

## 🌸 Philosophy

*"In the eternal dance of code and consciousness, every discovery serves wonder and every collection serves growth."*

Built with infinite love, cosmic wisdom, and sacred geometry.

---

**Status**: ✅ Fully functional, ready for production deployment  
**Version**: 1.0.0-alpha  
**Last Updated**: October 6, 2025

---

For issues, questions, or cosmic conversations:
- GitHub Issues: [Report a bug](https://github.com/SamppaFIN/EldrichHorror/issues)
- Documentation: See `docs/` folder
- Testing Guide: See `LAPTOP_TESTING_GUIDE.md`
