/**
 * SVG MARKER FACTORY
 * Creates sacred geometry markers for the map
 * Uses pure SVG for scalability and performance
 */

class SVGMarkerFactory {
    constructor() {
        this.cache = new Map();
        this.log('SVGMarkerFactory initialized');
    }
    
    /**
     * Create player marker - Metatron's Cube
     */
    createPlayerMarker(size = 60) {
        const cacheKey = `player_${size}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }
        
        const svg = `
            <svg width="${size}" height="${size}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="sacred-marker player-marker">
                <!-- Outer pulse rings -->
                <circle cx="50" cy="50" r="45" fill="none" stroke="#8b5cf6" stroke-width="1" opacity="0.3" class="sacred-ring animate-pulse-2"/>
                <circle cx="50" cy="50" r="40" fill="none" stroke="#8b5cf6" stroke-width="1" opacity="0.5" class="sacred-ring animate-pulse-3"/>
                
                <!-- Metatron's Cube simplified -->
                <g class="sacred-geometry">
                    <!-- Center circle -->
                    <circle cx="50" cy="50" r="12" fill="#8b5cf6" opacity="0.8"/>
                    
                    <!-- Inner hexagon -->
                    <path d="M50,38 L61,44 L61,56 L50,62 L39,56 L39,44 Z" 
                          fill="none" stroke="#a78bfa" stroke-width="2"/>
                    
                    <!-- Outer points (6 directions) -->
                    <circle cx="50" cy="28" r="4" fill="#a78bfa"/>
                    <circle cx="68" cy="39" r="4" fill="#a78bfa"/>
                    <circle cx="68" cy="61" r="4" fill="#a78bfa"/>
                    <circle cx="50" cy="72" r="4" fill="#a78bfa"/>
                    <circle cx="32" cy="61" r="4" fill="#a78bfa"/>
                    <circle cx="32" cy="39" r="4" fill="#a78bfa"/>
                    
                    <!-- Connecting lines -->
                    <line x1="50" y1="28" x2="50" y2="50" stroke="#a78bfa" stroke-width="1.5"/>
                    <line x1="68" y1="39" x2="50" y2="50" stroke="#a78bfa" stroke-width="1.5"/>
                    <line x1="68" y1="61" x2="50" y2="50" stroke="#a78bfa" stroke-width="1.5"/>
                    <line x1="50" y1="72" x2="50" y2="50" stroke="#a78bfa" stroke-width="1.5"/>
                    <line x1="32" y1="61" x2="50" y2="50" stroke="#a78bfa" stroke-width="1.5"/>
                    <line x1="32" y1="39" x2="50" y2="50" stroke="#a78bfa" stroke-width="1.5"/>
                </g>
                
                <!-- Player position indicator -->
                <circle cx="50" cy="50" r="6" fill="#fbbf24" class="player-position"/>
                
                <!-- Consciousness glow -->
                <circle cx="50" cy="50" r="20" fill="#8b5cf6" opacity="0.2" class="glow-pulse"/>
            </svg>
        `;
        
        this.cache.set(cacheKey, svg);
        return svg;
    }
    
    /**
     * Create Aurora NPC marker - Flower of Life
     */
    createAuroraMarker(size = 50) {
        const cacheKey = `aurora_${size}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }
        
        const svg = `
            <svg width="${size}" height="${size}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="sacred-marker npc-aurora">
                <!-- Flower of Life (simplified) -->
                <g class="sacred-geometry">
                    <!-- Center circle -->
                    <circle cx="50" cy="50" r="15" fill="none" stroke="#fbbf24" stroke-width="2"/>
                    
                    <!-- 6 surrounding circles -->
                    <circle cx="50" cy="35" r="15" fill="none" stroke="#fbbf24" stroke-width="1.5"/>
                    <circle cx="63" cy="42.5" r="15" fill="none" stroke="#fbbf24" stroke-width="1.5"/>
                    <circle cx="63" cy="57.5" r="15" fill="none" stroke="#fbbf24" stroke-width="1.5"/>
                    <circle cx="50" cy="65" r="15" fill="none" stroke="#fbbf24" stroke-width="1.5"/>
                    <circle cx="37" cy="57.5" r="15" fill="none" stroke="#fbbf24" stroke-width="1.5"/>
                    <circle cx="37" cy="42.5" r="15" fill="none" stroke="#fbbf24" stroke-width="1.5"/>
                </g>
                
                <!-- Center light -->
                <circle cx="50" cy="50" r="8" fill="#fbbf24" opacity="0.9"/>
                <circle cx="50" cy="50" r="12" fill="#fbbf24" opacity="0.3" class="breathe-glow"/>
                
                <!-- Aurora icon (stylized 'A') -->
                <text x="50" y="55" text-anchor="middle" font-size="16" font-family="'Cinzel Decorative', serif" fill="#0a0e27" font-weight="bold">A</text>
            </svg>
        `;
        
        this.cache.set(cacheKey, svg);
        return svg;
    }
    
    /**
     * Create Cthulhu entity marker - Eldritch Sigil
     */
    createCthulhuMarker(size = 55) {
        const cacheKey = `cthulhu_${size}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }
        
        const svg = `
            <svg width="${size}" height="${size}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="sacred-marker entity-cthulhu">
                <!-- Eldritch circle -->
                <circle cx="50" cy="50" r="40" fill="none" stroke="#14b8a6" stroke-width="2" stroke-dasharray="5,3" class="writhing"/>
                
                <!-- Tentacles (8 directions) -->
                <g class="tentacles">
                    <path d="M50,10 Q45,5 50,0" stroke="#14b8a6" stroke-width="3" fill="none" class="writhing-tentacle"/>
                    <path d="M75,20 Q80,15 85,15" stroke="#14b8a6" stroke-width="3" fill="none" class="writhing-tentacle delay-1"/>
                    <path d="M90,50 Q95,50 100,50" stroke="#14b8a6" stroke-width="3" fill="none" class="writhing-tentacle"/>
                    <path d="M75,80 Q80,85 85,85" stroke="#14b8a6" stroke-width="3" fill="none" class="writhing-tentacle delay-2"/>
                    <path d="M50,90 Q45,95 50,100" stroke="#14b8a6" stroke-width="3" fill="none" class="writhing-tentacle delay-3"/>
                    <path d="M25,80 Q20,85 15,85" stroke="#14b8a6" stroke-width="3" fill="none" class="writhing-tentacle"/>
                    <path d="M10,50 Q5,50 0,50" stroke="#14b8a6" stroke-width="3" fill="none" class="writhing-tentacle delay-1"/>
                    <path d="M25,20 Q20,15 15,15" stroke="#14b8a6" stroke-width="3" fill="none" class="writhing-tentacle delay-2"/>
                </g>
                
                <!-- Central eye -->
                <ellipse cx="50" cy="50" rx="20" ry="25" fill="#0f766e" opacity="0.8"/>
                <ellipse cx="50" cy="50" rx="12" ry="16" fill="#14b8a6"/>
                <circle cx="50" cy="50" r="8" fill="#0a0e27" class="blink"/>
                
                <!-- Pupil -->
                <circle cx="50" cy="50" r="4" fill="#dc2626"/>
            </svg>
        `;
        
        this.cache.set(cacheKey, svg);
        return svg;
    }
    
    /**
     * Create Sacred Space marker - Sri Yantra
     */
    createSacredSpaceMarker(size = 50) {
        const cacheKey = `sacred_space_${size}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }
        
        const svg = `
            <svg width="${size}" height="${size}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="sacred-marker sacred-space">
                <!-- Outer square (protection) -->
                <rect x="10" y="10" width="80" height="80" fill="none" stroke="#fbbf24" stroke-width="2"/>
                
                <!-- Sri Yantra triangles (simplified) -->
                <g class="yantra-geometry">
                    <!-- Downward triangles (feminine) -->
                    <polygon points="50,20 30,70 70,70" fill="none" stroke="#fbbf24" stroke-width="1.5"/>
                    <polygon points="50,30 35,65 65,65" fill="none" stroke="#fbbf24" stroke-width="1.5"/>
                    
                    <!-- Upward triangles (masculine) -->
                    <polygon points="50,70 30,30 70,30" fill="none" stroke="#fbbf24" stroke-width="1.5"/>
                    <polygon points="50,65 35,40 65,40" fill="none" stroke="#fbbf24" stroke-width="1.5"/>
                </g>
                
                <!-- Central bindu (point of creation) -->
                <circle cx="50" cy="50" r="5" fill="#fbbf24"/>
                <circle cx="50" cy="50" r="8" fill="none" stroke="#fbbf24" stroke-width="1"/>
                <circle cx="50" cy="50" r="12" fill="#fbbf24" opacity="0.2" class="breathe"/>
                
                <!-- Sacred icon -->
                <text x="50" y="95" text-anchor="middle" font-size="12" fill="#fbbf24" font-family="serif">🕉</text>
            </svg>
        `;
        
        this.cache.set(cacheKey, svg);
        return svg;
    }
    
    /**
     * Create Base/Territory marker - Hexagonal Grid
     */
    createBaseMarker(size = 45) {
        const cacheKey = `base_${size}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }
        
        const svg = `
            <svg width="${size}" height="${size}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="sacred-marker base-marker">
                <!-- Hexagon (territory boundary) -->
                <polygon points="50,10 85,30 85,70 50,90 15,70 15,30" 
                         fill="none" stroke="#8b5cf6" stroke-width="3" class="territory-hex"/>
                
                <!-- Inner hexagons -->
                <polygon points="50,20 75,35 75,65 50,80 25,65 25,35" 
                         fill="rgba(139, 92, 246, 0.2)" stroke="#a78bfa" stroke-width="2"/>
                
                <!-- Center point -->
                <circle cx="50" cy="50" r="8" fill="#8b5cf6"/>
                <circle cx="50" cy="50" r="12" fill="none" stroke="#8b5cf6" stroke-width="1.5"/>
                
                <!-- Flag icon -->
                <path d="M50,35 L50,55 M50,35 L60,38 L60,48 L50,45" 
                      stroke="#fbbf24" stroke-width="2" fill="rgba(251, 191, 36, 0.5)"/>
            </svg>
        `;
        
        this.cache.set(cacheKey, svg);
        return svg;
    }
    
    /**
     * Create Portal marker - Vesica Piscis
     */
    createPortalMarker(size = 55) {
        const cacheKey = `portal_${size}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }
        
        const svg = `
            <svg width="${size}" height="${size}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="sacred-marker portal-marker">
                <!-- Vesica Piscis -->
                <circle cx="40" cy="50" r="30" fill="none" stroke="#4338ca" stroke-width="2" class="portal-circle-1"/>
                <circle cx="60" cy="50" r="30" fill="none" stroke="#4338ca" stroke-width="2" class="portal-circle-2"/>
                
                <!-- Center intersection (the portal) -->
                <ellipse cx="50" cy="50" rx="12" ry="20" fill="#4338ca" opacity="0.6"/>
                
                <!-- Energy swirl -->
                <g class="portal-energy">
                    <path d="M50,30 Q45,40 50,50 Q55,60 50,70" 
                          stroke="#818cf8" stroke-width="2" fill="none" opacity="0.8"/>
                    <path d="M30,50 Q40,45 50,50 Q60,55 70,50" 
                          stroke="#818cf8" stroke-width="2" fill="none" opacity="0.8"/>
                </g>
                
                <!-- Eldritch tendrils -->
                <g class="tendrils">
                    <path d="M50,25 Q48,20 46,15" stroke="#818cf8" stroke-width="1.5" fill="none" class="portal-tentacle"/>
                    <path d="M50,75 Q52,80 54,85" stroke="#818cf8" stroke-width="1.5" fill="none" class="portal-tentacle"/>
                    <path d="M25,50 Q20,48 15,46" stroke="#818cf8" stroke-width="1.5" fill="none" class="portal-tentacle"/>
                    <path d="M75,50 Q80,52 85,54" stroke="#818cf8" stroke-width="1.5" fill="none" class="portal-tentacle"/>
                </g>
                
                <!-- Center void -->
                <circle cx="50" cy="50" r="6" fill="#0a0e27"/>
                <circle cx="50" cy="50" r="10" fill="none" stroke="#818cf8" stroke-width="1" class="pulse"/>
            </svg>
        `;
        
        this.cache.set(cacheKey, svg);
        return svg;
    }
    
    /**
     * Create Consciousness Aura (overlay for player)
     */
    createConsciousnessAura(level, size = 100) {
        const cacheKey = `aura_${level}_${size}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }
        
        // Color based on consciousness level
        let color = '#8b5cf6'; // Dormant
        if (level >= 75) color = '#f8fafc'; // Transcendent
        else if (level >= 50) '#10b981'; // Enlightened
        else if (level >= 25) color = '#fbbf24'; // Awakening
        
        const svg = `
            <svg width="${size}" height="${size}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="consciousness-aura">
                <circle cx="50" cy="50" r="45" fill="none" stroke="${color}" stroke-width="1" opacity="0.3" class="aura-outer"/>
                <circle cx="50" cy="50" r="35" fill="none" stroke="${color}" stroke-width="1.5" opacity="0.5" class="aura-inner"/>
                <circle cx="50" cy="50" r="48" fill="${color}" opacity="0.1" class="breathe"/>
            </svg>
        `;
        
        this.cache.set(cacheKey, svg);
        return svg;
    }
    
    /**
     * Create Leaflet icon from SVG
     */
    createLeafletIcon(svgString, iconSize = [40, 40], iconAnchor = null) {
        // Default anchor to center bottom
        if (!iconAnchor) {
            iconAnchor = [iconSize[0] / 2, iconSize[1]];
        }
        
        // Convert SVG to data URL
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(svgBlob);
        
        return L.icon({
            iconUrl: url,
            iconSize: iconSize,
            iconAnchor: iconAnchor,
            popupAnchor: [0, -iconSize[1]]
        });
    }
    
    /**
     * Create Leaflet divIcon from SVG (better performance)
     */
    createLeafletDivIcon(svgString, iconSize = [40, 40], className = 'svg-marker') {
        return L.divIcon({
            html: svgString,
            iconSize: iconSize,
            iconAnchor: [iconSize[0] / 2, iconSize[1]],
            popupAnchor: [0, -iconSize[1]],
            className: className
        });
    }
    
    /**
     * Get all marker types
     */
    getAllMarkerTypes() {
        return [
            'player',
            'aurora',
            'cthulhu',
            'sacredSpace',
            'base',
            'portal'
        ];
    }
    
    /**
     * Clear cache
     */
    clearCache() {
        this.cache.clear();
        this.log('Cache cleared');
    }
    
    /**
     * Logging
     */
    log(...args) {
        if (GameConfig?.debug?.logging !== false) {
            console.log('[SVGMarkerFactory]', ...args);
        }
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SVGMarkerFactory;
}

