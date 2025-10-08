/**
 * SVG MARKER FACTORY
 * Creates custom SVG markers for Leaflet
 */

class SVGMarkerFactory {
    constructor() {
        this.log('SVGMarkerFactory initialized');
    }
    
    createPlayerMarker() {
        return L.divIcon({
            className: 'player-marker',
            html: '🧙‍♂️',
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });
    }
    
    createDiscoveryMarker(type) {
        const icons = {
            'Cosmic Fragment': '✨',
            'Eldritch Rune': '🔮',
            'Sacred Sigil': '🕉️',
            'Void Crystal': '💎',
            'Reality Shard': '🌟'
        };
        
        const iconHtml = icons[type] || '✨';
        this.log(`Creating discovery marker for ${type} with icon: ${iconHtml}`);
        
        return L.divIcon({
            className: 'discovery-marker',
            html: iconHtml,
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        });
    }
    
    log(...args) {
        console.log('[SVGMarkerFactory]', ...args);
    }
}