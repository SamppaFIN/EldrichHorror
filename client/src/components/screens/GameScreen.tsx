import { useEffect, useState, useCallback, useRef } from 'react';
import { useGameContext } from '@/context/GameContext';
import MapComponent from '@/components/map/MapComponent';
import { GameOverlays, ProgressBar, PixelButton, ChoiceButton, InventoryItem, SanityEffect, DebugButton, MapToggle } from '@/components/GameComponents';
import { LocationType, StoryChoice } from '@/types/gameTypes';
import { Link } from 'wouter';
import { InitAudio, PlaySound, StopSound, ResumeAudioContext } from '@/lib/audioUtils';

// Constants for landscape scaling
const UI_SCALE = {
  DEFAULT: 'scale-100',
  LARGE: 'scale-110',
  XLARGE: 'scale-125',
  HD: 'scale-100',
  FULLHD: 'scale-100',
  '4K': 'scale-150',
};

const GameScreen = () => {
  const { 
    gameState, 
    playerPosition,
    triggerLocation,
    makeChoice,
    toggleHint,
    showHint,
    healthMeterValue,
    sanityMeterValue,
    inventoryItems,
    currentStageInfo,
    currentNarrative,
    currentChoices,
    isChoicesShown,
    showDebugScreen,
    closeDebugScreen,
    setHealth,
    setSanity,
    togglePerformanceMode,
    requestLocationPermission,
    locationPermissionState
  } = useGameContext();

  // State for FPS counter
  const [fps, setFps] = useState<number>(0);
  const fpsRef = useRef<number>(0);
  const frameTimeRef = useRef<number>(performance.now());
  const frameCountRef = useRef<number>(0);

  // State for map visibility and size
  const [showMap, setShowMap] = useState<boolean>(true);
  const [mapSize, setMapSize] = useState<'full' | 'split'>('split');
  
  // State for UI scale based on resolution
  const [uiScale, setUiScale] = useState<string>(UI_SCALE.DEFAULT);
  
  // State for inventory panel visibility
  const [showInventory, setShowInventory] = useState<boolean>(false);

  // Detect screen size and set appropriate UI scaling
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Set UI scale based on resolution
      if (width >= 3840) { // 4K
        setUiScale(UI_SCALE['4K']);
      } else if (width >= 1920) { // Full HD
        setUiScale(UI_SCALE.FULLHD);
      } else if (width >= 1280) { // HD
        setUiScale(UI_SCALE.HD);
      } else {
        setUiScale(UI_SCALE.DEFAULT);
      }
      
      // Adjust map size based on aspect ratio
      if (width / height >= 1.7) { // Wide screen (16:9 or wider)
        setMapSize('split');
      } else {
        setMapSize('full');
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Memoize the map update interval based on performance mode
  const mapUpdateInterval = gameState.performanceMode ? 5000 : 1000; // 5 seconds in performance mode, 1 second in normal mode

  // FPS counter implementation
  useEffect(() => {
    let animationFrameId: number;
    
    const updateFPS = () => {
      frameCountRef.current++;
      const now = performance.now();
      const elapsed = now - frameTimeRef.current;
      
      if (elapsed >= 1000) {
        fpsRef.current = Math.round((frameCountRef.current * 1000) / elapsed);
        setFps(fpsRef.current);
        frameTimeRef.current = now;
        frameCountRef.current = 0;
      }
      
      animationFrameId = requestAnimationFrame(updateFPS);
    };
    
    updateFPS();
    
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Initialize audio system on component mount
  useEffect(() => {
    // Initialize audio context on first user interaction
    const initAudioOnInteraction = async () => {
      InitAudio();
      await ResumeAudioContext();
      
      // Play ambient background sound when game starts
      // Set lower volume in performance mode
      const volume = gameState.performanceMode ? 0.1 : 0.3;
      PlaySound('ambient', '/sounds/ambient_lovecraft.mp3', true, volume);
      
      // Remove event listeners once audio is initialized
      document.removeEventListener('click', initAudioOnInteraction);
      document.removeEventListener('touchstart', initAudioOnInteraction);
    };
    
    // Add event listeners for user interaction to initialize audio
    document.addEventListener('click', initAudioOnInteraction, { once: true });
    document.addEventListener('touchstart', initAudioOnInteraction, { once: true });
    
    // Clean up on component unmount
    return () => {
      document.removeEventListener('click', initAudioOnInteraction);
      document.removeEventListener('touchstart', initAudioOnInteraction);
      StopSound('ambient');
    };
  }, [gameState.performanceMode]);
  
  // Game Effects - Low sanity visualization - Only apply when not in performance mode
  useEffect(() => {
    const body = document.querySelector('body');
    if (body) {
      if (sanityMeterValue < 30 && !gameState.performanceMode) {
        body.classList.add('low-sanity');
      } else {
        body.classList.remove('low-sanity');
      }
    }
  }, [sanityMeterValue, gameState.performanceMode]);

  // Handle location trigger from map
  const handleLocationTrigger = (location: LocationType) => {
    triggerLocation(location);
  };

  // Toggle map visibility
  const toggleMapVisibility = () => {
    setShowMap(prev => !prev);
  };
  
  // Toggle inventory panel
  const toggleInventory = () => {
    setShowInventory(prev => !prev);
  };

  // Add a debug trigger for the Pilot Statue location
  const triggerPilotStatueLocation = () => {
    const pilotStatue: LocationType = {
      id: "pilot_statue",
      name: "The Pilot Statue",
      type: "startgame",
      lat: 61.49312,
      lng: 23.76182,
      radius: 20,
      stage: "start",
      narrative: "Standing before you is the imposing bronze figure known as 'The Pilot'..."
    };
    
    triggerLocation(pilotStatue);
  };

  return (
    <div className={`screen ${gameState.performanceMode ? 'bg-[#1a1a1a]' : 'bg-[#333333]'} h-screen w-screen overflow-hidden`}>
      <GameOverlays performanceMode={gameState.performanceMode} />
      
      {/* Only show sanity effect when not in performance mode */}
      {!gameState.performanceMode && <SanityEffect sanity={sanityMeterValue} />}
      
      {/* Main Header with game info and meters - optimized for landscape */}
      <div className={`fixed top-0 left-0 right-0 z-30 px-4 py-3 bg-black/70 backdrop-blur-sm ${uiScale}`}>
        <div className="flex justify-between items-center max-w-[1800px] mx-auto">
          {/* Left section: Stage info */}
          <div className="flex-shrink-0 w-1/4">
            <h2 className="font-header text-lg text-yellow-300">{currentStageInfo?.title || 'UNKNOWN STAGE'}</h2>
            <p className="text-[#e8e0c9] text-xs line-clamp-1">{currentStageInfo?.objective || ''}</p>
          </div>
          
          {/* Center section: Health and Sanity meters */}
          <div className="flex justify-center items-center gap-4 w-1/2">
            {/* Health Meter */}
            <div className="flex flex-col w-1/2 max-w-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="font-header text-sm text-[#e8e0c9]">HEALTH</span>
                <span className="font-interface text-sm text-[#e8e0c9]">{healthMeterValue}%</span>
              </div>
              <ProgressBar type="health" value={healthMeterValue} performanceMode={gameState.performanceMode} />
            </div>
            
            {/* Sanity Meter */}
            <div className="flex flex-col w-1/2 max-w-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="font-header text-sm text-[#e8e0c9]">SANITY</span>
                <span className="font-interface text-sm text-[#e8e0c9]">{sanityMeterValue}%</span>
              </div>
              <ProgressBar type="sanity" value={sanityMeterValue} performanceMode={gameState.performanceMode} />
            </div>
          </div>
          
          {/* Right section: Controls */}
          <div className="flex items-center justify-end gap-2 w-1/4">
            <div className="bg-black/50 rounded px-2 py-1 text-[#e8e0c9] text-sm">
              FPS: {fps}
            </div>
            
            <button 
              onClick={togglePerformanceMode}
              className={`text-[#e8e0c9] text-sm px-3 py-1.5 rounded border border-[#e8e0c9]/30 shadow-md flex items-center ${gameState.performanceMode ? 'bg-[#8b0000]' : 'bg-[#1a3a3a]'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              {gameState.performanceMode ? 'High Quality' : 'Performance'}
            </button>
            
            <MapToggle isVisible={showMap} onClick={toggleMapVisibility} />
            
            <button 
              onClick={toggleInventory}
              className="text-[#e8e0c9] text-sm px-3 py-1.5 rounded border border-[#e8e0c9]/30 shadow-md flex items-center bg-[#1a3a3a]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              Inventory
            </button>
          </div>
        </div>
      </div>
      
      {/* Location Permission Button - only show if permission isn't granted */}
      {locationPermissionState !== 'granted' && (
        <div className="fixed top-20 left-4 z-20">
          <button 
            onClick={requestLocationPermission}
            className="bg-[#1565c0] text-[#e8e0c9] text-sm py-2 px-4 rounded-md flex items-center space-x-2 shadow-md border border-[#e8e0c9]/30 animate-pulse"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Enable Location
          </button>
        </div>
      )}
      
      {/* Debug Controls - moved to an organized menu */}
      <div className="fixed top-16 right-4 z-30">
        <div className="bg-[#1a1a1a]/70 backdrop-blur-sm p-2 rounded-md flex gap-2">
          <DebugButton onClick={showDebugScreen}>Debug</DebugButton>
          <DebugButton onClick={() => closeDebugScreen('gameover')}>End Game</DebugButton>
          <Link href="/blog">
            <div className="bg-[#2d1b2d] text-[#e8e0c9] text-sm px-3 py-1 rounded border border-[#e8e0c9]/30 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              Blog
            </div>
          </Link>
        </div>
      </div>
      
      {/* Main Content Area - Optimized for landscape layout */}
      <div className="flex h-[calc(100vh-76px)] w-full mt-16">
        {/* Map Section - Conditionally sized based on story state */}
        {showMap && (
          <div className={`relative ${isChoicesShown || showInventory ? 'w-1/2 border-r border-black/30' : 'w-full'} h-full transition-all duration-300 ease-in-out`}>
            <MapComponent 
              onTriggerLocation={handleLocationTrigger} 
              performanceMode={gameState.performanceMode}
              updateInterval={mapUpdateInterval}
            />
          </div>
        )}
        
        {/* Story and Choices Panel - Positioned based on screen layout */}
        <div 
          className={`
            ${showMap && !isChoicesShown && !showInventory ? 'absolute bottom-0 right-0 w-full md:w-1/3 h-1/3' : 'relative w-1/2 h-full'} 
            bg-[#1a1a1a]/80 backdrop-blur-md transition-all duration-300 ease-in-out overflow-auto
            ${!showMap ? 'w-full' : ''}
            ${!showMap && !isChoicesShown && !showInventory ? 'max-h-[30vh]' : ''}
          `}
        >
          {/* Story Content */}
          <div className="p-6 h-full flex flex-col">
            {/* Stage Info */}
            <div className="mb-6">
              <h3 className="font-header text-2xl text-yellow-300 mb-2">
                {currentStageInfo?.title || 'UNKNOWN LOCATION'}
              </h3>
              <p className="text-[#e8e0c9] mb-4 text-lg">{currentNarrative || currentStageInfo?.narrative || ''}</p>
              
              {/* Objective */}
              <div className="bg-[#2d1b2d]/50 border border-[#e8e0c9]/20 p-3 rounded-md mb-6">
                <h4 className="font-header text-sm text-yellow-300 mb-1">OBJECTIVE</h4>
                <p className="text-[#e8e0c9] text-sm">{currentStageInfo?.objective || ''}</p>
              </div>
            </div>
            
            {/* Choices Section */}
            {isChoicesShown && (
              <div className="mt-auto">
                <h4 className="font-header text-lg text-yellow-300 mb-3">WHAT WILL YOU DO?</h4>
                <div className="space-y-3 mb-4">
                  {currentChoices.map((choice, index) => (
                    <ChoiceButton
                      key={index}
                      title={choice.title}
                      description={choice.description}
                      affects={choice.affects}
                      cost={choice.cost}
                      onClick={() => makeChoice(choice)}
                      performanceMode={gameState.performanceMode}
                    />
                  ))}
                </div>
                
                {/* Hint Button */}
                <div className="flex justify-center mt-4">
                  <PixelButton 
                    onClick={toggleHint}
                    size="sm"
                    performanceMode={gameState.performanceMode}
                  >
                    {showHint ? 'Hide Hint' : 'Show Hint'}
                  </PixelButton>
                </div>
                
                {/* Hint Text */}
                {showHint && currentChoices[0]?.nextLocationHint && (
                  <div className="mt-4 bg-[#1a3a3a]/50 border border-[#e8e0c9]/20 p-3 rounded-md">
                    <p className="text-[#e8e0c9] text-sm italic">{currentChoices[0].nextLocationHint}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Inventory Panel - Slides in when active */}
        {showInventory && (
          <div className={`relative ${showMap ? 'w-1/2' : 'w-full'} h-full bg-[#1a1a1a]/80 backdrop-blur-md border-l border-black/30 overflow-auto`}>
            <div className="p-6 h-full">
              <h3 className="font-header text-2xl text-yellow-300 mb-4">INVENTORY</h3>
              
              {inventoryItems.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {inventoryItems.map((item, index) => (
                    <InventoryItem
                      key={index}
                      name={item}
                      iconPath={`/images/items/${item.toLowerCase().replace(/\s+/g, '_')}.png`}
                      discovered={true}
                      performanceMode={gameState.performanceMode}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[50vh]">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-[#e8e0c9]/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                  <p className="text-[#e8e0c9]/50 mt-4 text-lg">Your inventory is empty</p>
                  <p className="text-[#e8e0c9]/30 text-sm">Explore locations to find items</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Test Pilot Statue Button - only in development */}
      {process.env.NODE_ENV !== 'production' && (
        <div className="fixed bottom-4 right-4 z-50">
          <button
            onClick={triggerPilotStatueLocation}
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded-md text-sm font-medium flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Test Pilot Statue
          </button>
        </div>
      )}
    </div>
  );
};

export default GameScreen;
