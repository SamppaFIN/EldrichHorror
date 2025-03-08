# Lovecraftian Adventure Game - Project Overview

## Features Implemented

### Core Mechanics
- Location-based gameplay that triggers story events at physical locations
- Health and sanity dual-meter system for player status
- Inventory system for collecting artifacts
- Stage-based progression (5 stages: start, 1, 2, 3, final)
- Difficulty settings (easy, medium, hard)
- Choice-based narrative with consequences to health or sanity
- Persistent game state with localStorage

### Map Features
- Real-time geolocation tracking
- Interactive map showing player position
- Custom map markers for story locations, secret locations, and cutscenes
- Distance-based trigger system for narrative events
- Tampere, Finland map focus (61.47285420785464, 23.72609861270144)

### Narrative Elements
- Lovecraftian storyline with cosmic horror themes
- Multiple narrative branches based on player choices
- Stage-specific story arcs and objectives
- Secrets and hidden artifacts to discover
- Cutscene system for major story moments

### Audio/Visual
- Ambient sound system for atmosphere
- Sound effects for discoveries, choices, and events
- Visual styling matching Lovecraftian theme
- Sanity effect system with visual distortions

### Technical Features
- React frontend with TypeScript
- Express backend API for data persistence
- Leaflet.js for map functionality
- In-memory storage for game data
- RESTful API endpoints for game state

### Debug & Testing Features
- Debug window to inspect game state
- Stage editor in debug mode
- Custom location testing
- Game over simulation button
- Highscore system backend

## Technologies Used
- React (Frontend framework)
- TypeScript (Type safety)
- Express (Backend server)
- Leaflet.js (Map visualization)
- Tailwind CSS (Styling)
- Zod (Schema validation)
- Drizzle ORM (Database operations)
- React Query (Data fetching)
- Web Audio API (Sound system)
- localStorage (Client-side persistence)

## Game Flow
1. Welcome screen with difficulty selection
2. Map-based gameplay showing player's location
3. Navigation to story locations in Tampere
4. Story events with narrative choices
5. Consequences affecting health/sanity meters
6. Stage progression as story locations are completed
7. Game over when health or sanity reaches zero
8. Highscore recording based on progress

## Future Enhancements
- Additional story branches and locations
- More detailed environment descriptions
- Enhanced visual effects for sanity loss
- Weather integration affecting gameplay
- Multiplayer event tracking