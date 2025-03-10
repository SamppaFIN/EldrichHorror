import { useState, useEffect } from 'react';
import { useGameContext } from '@/context/GameContext';
import { GameOverlays, DebugButton } from '@/components/GameComponents';
import { Stage, LocationType } from '@/types/gameTypes';
import { InitAudio, PlaySound, StopSound, StopAllSounds, ResumeAudioContext, ApplySanityAudioEffects } from '@/lib/audioUtils';

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
  
  // Audio test states
  const [testAudioVolume, setTestAudioVolume] = useState(0.5);
  const [testSanityLevel, setTestSanityLevel] = useState(sanityMeterValue);
  
  // Audio initialization state
  const [audioInitialized, setAudioInitialized] = useState(false);
  
  // Initialize audio system when debug screen mounts
  useEffect(() => {
    const initAudio = async () => {
      try {
        InitAudio();
        const success = await ResumeAudioContext();
        if (success) {
          setAudioInitialized(true);
          console.log('[DEBUG] Audio system initialized for testing');
        }
      } catch (err) {
        console.warn('[DEBUG] Failed to initialize audio system:', err);
      }
    };
    
    // Try to initialize, but this might fail due to autoplay policies
    initAudio();
    
    // Clean up when debug screen unmounts
    return () => {
      StopAllSounds();
    };
  }, []);
  
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
          
          {/* Audio Testing Section */}
          <div className="control-section md:col-span-2">
            <h3 className="font-interface text-lg mb-3">Audio Testing</h3>
            
            {/* Audio Initialization Warning and Button */}
            {!audioInitialized && (
              <div className="bg-yellow-900/40 border border-yellow-600/50 p-3 rounded mb-3 flex flex-col items-center">
                <p className="text-yellow-200 text-sm mb-2">
                  Audio requires user interaction to initialize due to browser policies. 
                  Click the button below to unlock audio features.
                </p>
                <DebugButton 
                  onClick={async () => {
                    try {
                      InitAudio();
                      const success = await ResumeAudioContext();
                      if (success) {
                        setAudioInitialized(true);
                        
                        // Play a silent sound to fully unlock audio
                        const silentOscillator = new (window.AudioContext || (window as any).webkitAudioContext)();
                        const oscillator = silentOscillator.createOscillator();
                        const gainNode = silentOscillator.createGain();
                        gainNode.gain.value = 0.001; // Nearly silent
                        oscillator.connect(gainNode);
                        gainNode.connect(silentOscillator.destination);
                        oscillator.start(0);
                        oscillator.stop(0.5);
                      }
                    } catch (e) {
                      console.warn("Failed to initialize audio:", e);
                    }
                  }}
                  className="bg-yellow-700 hover:bg-yellow-600 text-center px-4 py-2"
                >
                  Initialize Audio System
                </DebugButton>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-black/30 p-3 rounded border border-[#444]">
              {/* Sanity Audio Effects */}
              <div className="flex flex-col space-y-2">
                <h4 className="font-interface text-sm mb-1">Sanity Audio Effects</h4>
                <div className="flex items-center">
                  <label className="font-interface text-xs w-28">Test Sanity Level:</label>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={testSanityLevel} 
                    className="w-40 mr-2"
                    onChange={(e) => {
                      const value = parseInt(e.target.value, 10);
                      setTestSanityLevel(value);
                      // Apply audio effects directly (without changing game state)
                      if (audioInitialized) {
                        ApplySanityAudioEffects(value);
                      }
                    }}
                  />
                  <span className="font-interface text-xs">{testSanityLevel}%</span>
                </div>
                <div className="flex space-x-2 mt-2">
                  <DebugButton 
                    onClick={async () => {
                      if (audioInitialized) {
                        await ResumeAudioContext();
                        ApplySanityAudioEffects(testSanityLevel);
                      }
                    }}
                    className={`text-xs ${!audioInitialized ? 'opacity-50' : ''}`}
                    disabled={!audioInitialized}
                  >
                    Apply Effects
                  </DebugButton>
                  <DebugButton 
                    onClick={() => {
                      setTestSanityLevel(100);
                      if (audioInitialized) {
                        ApplySanityAudioEffects(100);
                      }
                    }}
                    className={`text-xs ${!audioInitialized ? 'opacity-50' : ''}`}
                    disabled={!audioInitialized}
                  >
                    Reset Effects
                  </DebugButton>
                </div>
              </div>
              
              {/* Sound Testing */}
              <div className="flex flex-col space-y-2">
                <h4 className="font-interface text-sm mb-1">Test Sounds</h4>
                <div className="flex items-center">
                  <label className="font-interface text-xs w-28">Volume:</label>
                  <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.1"
                    value={testAudioVolume} 
                    className="w-40 mr-2"
                    onChange={(e) => setTestAudioVolume(parseFloat(e.target.value))}
                  />
                  <span className="font-interface text-xs">{Math.round(testAudioVolume * 100)}%</span>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <DebugButton 
                    onClick={() => {
                      if (audioInitialized) {
                        ResumeAudioContext();
                        // Use browser's built-in oscillator instead of external URL
                        try {
                          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
                          const oscillator = ctx.createOscillator();
                          const gainNode = ctx.createGain();
                          gainNode.gain.value = testAudioVolume;
                          oscillator.type = 'sine';
                          oscillator.frequency.value = 440; // A note
                          oscillator.connect(gainNode);
                          gainNode.connect(ctx.destination);
                          oscillator.start();
                          setTimeout(() => {
                            oscillator.stop();
                            ctx.close();
                          }, 1000);
                        } catch (e) {
                          console.warn('Error playing oscillator:', e);
                        }
                      }
                    }}
                    className={`text-xs ${!audioInitialized ? 'opacity-50' : ''}`}
                    disabled={!audioInitialized}
                  >
                    Play Test Tone
                  </DebugButton>
                  <DebugButton 
                    onClick={() => {
                      if (audioInitialized) {
                        // Create a short series of beeps
                        try {
                          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
                          const playBeep = (freq: number, start: number, duration: number) => {
                            const osc = ctx.createOscillator();
                            const gain = ctx.createGain();
                            osc.type = 'sine';
                            osc.frequency.value = freq;
                            gain.gain.value = testAudioVolume;
                            osc.connect(gain);
                            gain.connect(ctx.destination);
                            osc.start(ctx.currentTime + start);
                            osc.stop(ctx.currentTime + start + duration);
                          };
                          
                          playBeep(660, 0, 0.1);
                          playBeep(770, 0.2, 0.1);
                          playBeep(880, 0.4, 0.1);
                          
                          setTimeout(() => {
                            ctx.close();
                          }, 1000);
                        } catch(e) {
                          console.warn('Error playing beeps:', e);
                        }
                      }
                    }}
                    className={`text-xs ${!audioInitialized ? 'opacity-50' : ''}`}
                    disabled={!audioInitialized}
                  >
                    Play Beeps
                  </DebugButton>
                  <DebugButton 
                    onClick={() => {
                      if (audioInitialized) {
                        // Create white noise
                        try {
                          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
                          const bufferSize = 2 * ctx.sampleRate;
                          const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
                          const output = noiseBuffer.getChannelData(0);
                          
                          for (let i = 0; i < bufferSize; i++) {
                            output[i] = Math.random() * 2 - 1;
                          }
                          
                          const whiteNoise = ctx.createBufferSource();
                          whiteNoise.buffer = noiseBuffer;
                          
                          const gainNode = ctx.createGain();
                          gainNode.gain.value = testAudioVolume * 0.1; // Lower gain for noise
                          
                          whiteNoise.connect(gainNode);
                          gainNode.connect(ctx.destination);
                          whiteNoise.start();
                          
                          setTimeout(() => {
                            whiteNoise.stop();
                            ctx.close();
                          }, 1000);
                        } catch(e) {
                          console.warn('Error playing noise:', e);
                        }
                      }
                    }}
                    className={`text-xs ${!audioInitialized ? 'opacity-50' : ''}`}
                    disabled={!audioInitialized}
                  >
                    Play Noise
                  </DebugButton>
                  <DebugButton 
                    onClick={() => {
                      if (audioInitialized) {
                        // Low frequency rumble/pulsing effect
                        try {
                          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
                          const oscillator = ctx.createOscillator();
                          const gainNode = ctx.createGain();
                          
                          oscillator.type = 'sine';
                          oscillator.frequency.value = 40; // Very low frequency
                          
                          // Add LFO for pulsing effect
                          const lfo = ctx.createOscillator();
                          const lfoGain = ctx.createGain();
                          lfo.type = 'sine';
                          lfo.frequency.value = 8; // 8 Hz modulation
                          lfoGain.gain.value = testAudioVolume * 0.5;
                          
                          // Connect LFO to gain node for tremolo effect
                          lfo.connect(lfoGain);
                          lfoGain.connect(gainNode.gain);
                          
                          // Set base volume
                          gainNode.gain.value = testAudioVolume * 0.3;
                          
                          // Connect main signal path
                          oscillator.connect(gainNode);
                          gainNode.connect(ctx.destination);
                          
                          // Start both oscillators
                          lfo.start();
                          oscillator.start();
                          
                          // Stop after 2 seconds
                          setTimeout(() => {
                            oscillator.stop();
                            lfo.stop();
                            ctx.close();
                          }, 2000);
                        } catch(e) {
                          console.warn('Error playing rumble:', e);
                        }
                      }
                    }}
                    className={`text-xs ${!audioInitialized ? 'opacity-50' : ''}`}
                    disabled={!audioInitialized}
                  >
                    Play Rumble
                  </DebugButton>
                </div>
                <DebugButton 
                  onClick={() => {
                    StopAllSounds();
                  }}
                  className="text-xs mt-2"
                >
                  Stop All Sounds
                </DebugButton>
                
                {audioInitialized && (
                  <div className="mt-2 text-green-300 text-xs text-center">
                    Audio system initialized and ready
                  </div>
                )}
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
              <div className="log-entry">[DEBUG] Audio test controls active</div>
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
