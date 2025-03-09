import { useState } from 'react';
import { useGameContext } from '@/context/GameContext';
import { GameOverlays, DebugButton } from '@/components/GameComponents';
import { Stage, LocationType } from '@/types/gameTypes';

const DebugScreen = () => {
  const { 
    gameState,
    setHealth,
    setSanity,
    setStage,
    triggerStory,
    triggerSecret,
    resetGame,
    closeDebugScreen,
    gameLocations
  } = useGameContext();
  
  // Use gameState values directly to ensure reactivity
  const healthMeterValue = gameState.health;
  const sanityMeterValue = gameState.sanity;
  
  const [simLat, setSimLat] = useState('40.7128');
  const [simLng, setSimLng] = useState('-74.0060');
  
  // Filtered locations by type
  const storyPoints = gameLocations.filter(loc => loc.type === 'story');
  const secretPoints = gameLocations.filter(loc => loc.type === 'secret');
  
  return (
    <div className="screen bg-[#333333] z-50 h-screen">
      <GameOverlays />
      
      <div className="bg-black/80 border border-[#999999] text-[#e8e0c9] font-interface h-full p-4 overflow-auto">
        <h2 className="font-interface text-xl mb-4 border-b border-[#999999] pb-2">DEBUG CONTROLS</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Game State Controls */}
          <div className="control-section">
            <h3 className="font-interface text-lg mb-3">Game State</h3>
            <div className="flex flex-col space-y-2">
              <div className="flex items-center">
                <DebugButton onClick={() => closeDebugScreen('welcome')} className="mr-2">Show Welcome</DebugButton>
                <DebugButton onClick={() => closeDebugScreen('game')} className="mr-2">Show Game</DebugButton>
                <DebugButton onClick={() => closeDebugScreen('cutscene')} className="mr-2">Show Cutscene</DebugButton>
                <DebugButton onClick={() => closeDebugScreen('gameover')} className="mr-2">Show Game Over</DebugButton>
              </div>
              
              <div className="flex items-center mt-4">
                <label className="font-interface text-sm w-20">Health:</label>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={healthMeterValue} 
                  className="w-40 mr-2"
                  onChange={(e) => setHealth(parseInt(e.target.value, 10))}
                />
                <span className="font-interface text-sm">{healthMeterValue}%</span>
              </div>
              
              <div className="flex items-center">
                <label className="font-interface text-sm w-20">Sanity:</label>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={sanityMeterValue} 
                  className="w-40 mr-2"
                  onChange={(e) => setSanity(parseInt(e.target.value, 10))}
                />
                <span className="font-interface text-sm">{sanityMeterValue}%</span>
              </div>
            </div>
          </div>
          
          {/* Stage Controls */}
          <div className="control-section">
            <h3 className="font-interface text-lg mb-3">Stage Controls</h3>
            <div className="grid grid-cols-5 gap-2">
              <DebugButton onClick={() => setStage('start')} data-stage="start">Start</DebugButton>
              <DebugButton onClick={() => setStage('1')} data-stage="1">Stage 1</DebugButton>
              <DebugButton onClick={() => setStage('2')} data-stage="2">Stage 2</DebugButton>
              <DebugButton onClick={() => setStage('3')} data-stage="3">Stage 3</DebugButton>
              <DebugButton onClick={() => setStage('final')} data-stage="final">Final</DebugButton>
            </div>
          </div>
          
          {/* Trigger Story Controls */}
          <div className="control-section">
            <h3 className="font-interface text-lg mb-3">Trigger Story Points</h3>
            <div className="grid grid-cols-2 gap-3">
              {storyPoints.map((location, idx) => (
                <DebugButton 
                  key={`story-${idx}`}
                  onClick={() => triggerStory(location.id)}
                  className="bg-[#2d1b2d]"
                >
                  {location.name}
                </DebugButton>
              ))}
            </div>
          </div>
          
          {/* Secret Controls */}
          <div className="control-section">
            <h3 className="font-interface text-lg mb-3">Trigger Secrets</h3>
            <div className="grid grid-cols-2 gap-3">
              {secretPoints.map((secret, idx) => (
                <DebugButton 
                  key={`secret-${idx}`}
                  onClick={() => triggerSecret(secret.id)}
                  className="bg-[#8b0000]"
                >
                  {secret.name}
                </DebugButton>
              ))}
            </div>
          </div>
          
          {/* Location Simulation */}
          <div className="control-section md:col-span-2">
            <h3 className="font-interface text-lg mb-3">Simulate Location</h3>
            <div className="flex flex-col space-y-2">
              <div className="flex items-center">
                <label className="font-interface text-sm w-20">Latitude:</label>
                <input 
                  type="text" 
                  value={simLat} 
                  onChange={(e) => setSimLat(e.target.value)}
                  className="bg-[#1a3a3a] p-1 w-40 font-interface"
                />
              </div>
              <div className="flex items-center">
                <label className="font-interface text-sm w-20">Longitude:</label>
                <input 
                  type="text" 
                  value={simLng}
                  onChange={(e) => setSimLng(e.target.value)}
                  className="bg-[#1a3a3a] p-1 w-40 font-interface"
                />
              </div>
              <div className="flex items-center mt-2 space-x-2">
                <DebugButton 
                  className="w-40"
                  onClick={() => {
                    try {
                      const lat = parseFloat(simLat);
                      const lng = parseFloat(simLng);
                      if (!isNaN(lat) && !isNaN(lng)) {
                        // This would call a function to update location
                        window.localStorage.setItem('debug_location', JSON.stringify({ lat, lng }));
                        // Reload to apply simulation
                        window.location.reload();
                      }
                    } catch (e) {
                      console.error('Invalid coordinates');
                    }
                  }}
                >
                  Update Location
                </DebugButton>
                
                <DebugButton 
                  onClick={() => {
                    window.localStorage.removeItem('debug_location');
                    window.location.reload();
                  }}
                >
                  Clear Simulation
                </DebugButton>
              </div>
              
              <div className="mt-3">
                <h4 className="font-interface text-sm mb-2">Preset Locations:</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  <DebugButton 
                    onClick={() => {
                      // Tampere, Finland center
                      setSimLat('61.4978');
                      setSimLng('23.7610');
                    }}
                  >
                    Tampere Center
                  </DebugButton>
                  <DebugButton 
                    onClick={() => {
                      // Near first story point (slightly adjusted)
                      setSimLat('61.4758');
                      setSimLng('23.7239');
                    }}
                  >
                    Story Point 1
                  </DebugButton>
                  <DebugButton 
                    onClick={() => {
                      // Near first secret (slightly adjusted)
                      setSimLat('61.4759');
                      setSimLng('23.7244');
                    }}
                  >
                    Secret Point 1
                  </DebugButton>
                  <DebugButton 
                    onClick={() => {
                      // Default location near Pyynikki
                      setSimLat('61.4950');
                      setSimLng('23.7412');
                    }}
                  >
                    Pyynikki Area
                  </DebugButton>
                  <DebugButton 
                    onClick={() => {
                      // Apply the currently entered coordinates directly
                      const lat = parseFloat(simLat);
                      const lng = parseFloat(simLng);
                      if (!isNaN(lat) && !isNaN(lng)) {
                        window.localStorage.setItem('debug_location', JSON.stringify({ lat, lng }));
                        window.location.reload();
                      }
                    }}
                    className="md:col-span-2"
                  >
                    Use Current Coordinates
                  </DebugButton>
                </div>
              </div>
            </div>
          </div>
          
          {/* Log Section */}
          <div className="control-section md:col-span-2">
            <h3 className="font-interface text-lg mb-3">Game Log</h3>
            <div className="h-40 bg-black bg-opacity-50 p-2 overflow-y-auto font-interface text-sm">
              <div className="log-entry">[INFO] Game initialized</div>
              <div className="log-entry">[INFO] Geolocation API available</div>
              <div className="log-entry">[DEBUG] Player position: {simLat}, {simLng}</div>
              <div className="log-entry">[DEBUG] Current stage: {gameState.stage}</div>
              <div className="log-entry">[DEBUG] Health: {healthMeterValue}%, Sanity: {sanityMeterValue}%</div>
              <div className="log-entry">[DEBUG] Inventory items: {gameState.inventoryItems.join(', ') || 'none'}</div>
              <div className="log-entry">[DEBUG] Visited locations: {gameState.visitedLocations.join(', ') || 'none'}</div>
              <div className="log-entry">[DEBUG] Discovered secrets: {gameState.discoveredSecrets.join(', ') || 'none'}</div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex justify-between">
          <DebugButton onClick={resetGame}>Reset Game</DebugButton>
          <DebugButton onClick={() => closeDebugScreen()}>Close Debug Panel</DebugButton>
        </div>
      </div>
    </div>
  );
};

export default DebugScreen;
