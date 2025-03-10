import { useEffect, useState } from 'react';
import { useGameContext } from '@/context/GameContext';
import MapComponent from '@/components/map/MapComponent';
import { GameOverlays, ProgressBar, PixelButton, ChoiceButton, InventoryItem, SanityEffect, DebugButton } from '@/components/GameComponents';
import { LocationType, StoryChoice } from '@/types/gameTypes';
import { Link } from 'wouter';
import { InitAudio, PlaySound, StopSound, ResumeAudioContext } from '@/lib/audioUtils';

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
    requestLocationPermission,
    locationPermissionState
  } = useGameContext();

  // Initialize audio system on component mount
  useEffect(() => {
    // Initialize audio context on first user interaction
    const initAudioOnInteraction = async () => {
      InitAudio();
      await ResumeAudioContext();
      
      // Play ambient background sound when game starts
      PlaySound('ambient', '/sounds/ambient_lovecraft.mp3', true, 0.3);
      
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
  }, []);
  
  // Game Effects - Low sanity visualization
  useEffect(() => {
    const body = document.querySelector('body');
    if (body) {
      if (sanityMeterValue < 30) {
        body.classList.add('low-sanity');
      } else {
        body.classList.remove('low-sanity');
      }
    }
  }, [sanityMeterValue]);

  // Handle location trigger from map
  const handleLocationTrigger = (location: LocationType) => {
    triggerLocation(location);
  };

  return (
    <div className="screen bg-[#333333] h-screen overflow-hidden">
      <GameOverlays />
      <SanityEffect sanity={sanityMeterValue} />
      
      {/* Location Permission Button - only show if permission isn't granted */}
      {locationPermissionState !== 'granted' && (
        <div className="absolute top-4 left-4 z-20">
          <button 
            onClick={requestLocationPermission}
            className="bg-[#1565c0] text-[#e8e0c9] text-sm py-1.5 px-3 rounded-md flex items-center space-x-1 shadow-md border border-[#e8e0c9]/30 animate-pulse"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Enable GPS Location
          </button>
        </div>
      )}
      
      {/* Debug Button */}
      <div className="absolute top-4 right-4 z-10">
        <DebugButton onClick={showDebugScreen}>Debug</DebugButton>
      </div>
      
      {/* Game Over Button */}
      <div className="absolute top-4 right-24 z-10">
        <DebugButton onClick={() => closeDebugScreen('gameover')}>Game Over</DebugButton>
      </div>
      
      {/* Blog Link */}
      <div className="absolute top-4 right-[160px] z-10">
        <Link href="/blog">
          <div className="bg-[#2d1b2d] text-[#e8e0c9] text-xs px-3 py-1 rounded border border-[#e8e0c9]/30 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            Eldritch Chronicle
          </div>
        </Link>
      </div>
      
      {/* Mobile Layout: Map takes full screen with overlay panels */}
      <div className="flex h-full flex-col md:flex-row p-2 md:p-4">
        {/* Status Bar - Fixed on top */}
        <div className="flex items-center mb-2 md:mb-4 justify-between z-10">
          {/* Health Meter */}
          <div className="flex items-center space-x-2 md:space-x-4 w-1/2">
            <div className="flex flex-col w-full">
              <div className="flex items-center justify-between mb-1">
                <span className="font-header text-xs md:text-sm text-[#e8e0c9]">HEALTH</span>
                <span className="font-interface text-xs md:text-sm text-[#e8e0c9]">{healthMeterValue}%</span>
              </div>
              <ProgressBar type="health" value={healthMeterValue} />
            </div>
          </div>
          
          {/* Sanity Meter */}
          <div className="flex items-center space-x-2 md:space-x-4 w-1/2 ml-2 md:ml-4">
            <div className="flex flex-col w-full">
              <div className="flex items-center justify-between mb-1">
                <span className="font-header text-xs md:text-sm text-[#e8e0c9]">SANITY</span>
                <span className="font-interface text-xs md:text-sm text-[#e8e0c9]">{sanityMeterValue}%</span>
              </div>
              <ProgressBar type="sanity" value={sanityMeterValue} />
            </div>
          </div>
        </div>
        
        {/* Main Content Area: Map and Overlaying Panels */}
        <div className="relative flex-grow h-[calc(100%-3rem)] md:h-[calc(100%-4rem)]">
          {/* Full Screen Map */}
          <div className="absolute inset-0 z-0">
            <MapComponent onTriggerLocation={handleLocationTrigger} />
          </div>
          
          {/* Overlaying Panels - Narrative and Others */}
          <div className="absolute bottom-0 right-0 left-0 z-10 max-h-[40%] md:max-h-[50%] md:w-[300px] md:right-4 md:left-auto md:bottom-4 flex flex-col space-y-2 p-2">
            {/* Narrative Display - Collapsible */}
            <div className="bg-[#2d1b2d]/95 backdrop-blur-md rounded border-2 border-[#1a3a3a] shadow-[0_0_10px_rgba(0,0,0,0.7)] 
                          overflow-y-auto max-h-[150px] md:max-h-[250px] p-3 text-[#e8e0c9]">
              <h2 className="font-header text-lg md:text-xl mb-2 border-b border-[#e8e0c9] pb-1">{currentStageInfo.title}</h2>
              <p className="text-sm md:text-base">{currentNarrative}</p>
            </div>
            
            {/* Action Choices - When displayed */}
            {isChoicesShown && (
              <div className="choices-panel bg-[#2d1b2d]/90 backdrop-blur-md p-2 rounded border border-[#1a3a3a]">
                <h3 className="font-header text-base md:text-lg mb-2 text-[#e8e0c9]">What will you do?</h3>
                <div className="flex flex-col space-y-2">
                  {currentChoices.map((choice: StoryChoice, index: number) => (
                    <ChoiceButton
                      key={index}
                      title={choice.title}
                      description={choice.description}
                      affects={choice.affects}
                      cost={choice.cost}
                      onClick={() => makeChoice(choice)}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {/* Stage Info - Small bar */}
            <div className="stage-info flex justify-between items-center px-2 py-1 bg-[#1a3a3a]/80 backdrop-blur-sm text-[#e8e0c9] rounded">
              <div className="location-info">
                <span className="text-xs text-[#999999]">Stage:</span>
                <span className="font-header ml-2 text-sm">
                  {gameState.stage === 'start' ? 'Beginning' : 
                   gameState.stage === 'final' ? 'Final' : 
                   `${gameState.stage}`}
                </span>
              </div>
              <div className="hint-toggle">
                <button 
                  className="text-xs underline text-[#999999] hover:text-[#e8e0c9]"
                  onClick={toggleHint}
                >
                  {showHint ? 'Hide Hint' : 'Show Hint'}
                </button>
              </div>
            </div>
            
            {/* Inventory - Icon-only on mobile, full on desktop */}
            <div className="inventory-panel text-[#e8e0c9] bg-[#2d1b2d]/80 backdrop-blur-sm p-2 rounded border border-[#1a3a3a] hidden md:block">
              <h3 className="font-header text-base mb-2 flex justify-between items-center">
                <span>ARTIFACTS</span>
                <span className="text-xs font-interface">{inventoryItems.length}/3</span>
              </h3>
              <div className="grid grid-cols-3 gap-2">
                <InventoryItem
                  name="Ancient Wisdom"
                  iconPath='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="text-neutral-light w-6 h-6 md:w-8 md:h-8"><path d="M3 19a9 9 0 0 1 9 0a9 9 0 0 1 9 0M3 6a9 9 0 0 1 9 0a9 9 0 0 1 9 0M3 6v13m9-13v13m9-13v13" /></svg>'
                  discovered={inventoryItems.includes('wisdom')}
                />
                <InventoryItem
                  name="Trinket"
                  iconPath='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="text-neutral-light w-6 h-6 md:w-8 md:h-8"><circle cx="12" cy="12" r="7" /><path d="M12 5V3M12 21v-2M5 12H3M21 12h-2M18.4 18.4l-1.4-1.4M7 7L5.6 5.6M16.4 7.6L18 6M6 18l1.6-1.6" /></svg>'
                  discovered={inventoryItems.includes('trinket')}
                />
                <InventoryItem
                  name="Weapon"
                  iconPath='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="text-neutral-light w-6 h-6 md:w-8 md:h-8"><path d="M14.5 17.5L3 6V3h3l11.5 11.5M13 19l6-6M9.5 4.5L11 3l10 10-1.5 1.5M16 16l-4-4" /></svg>'
                  discovered={inventoryItems.includes('weapon')}
                />
              </div>
            </div>
            
            {/* Mobile-only inventory quick view */}
            <div className="md:hidden flex justify-around items-center bg-[#2d1b2d]/80 backdrop-blur-sm p-1 rounded border border-[#1a3a3a]">
              <div className={`w-6 h-6 rounded-full ${inventoryItems.includes('wisdom') ? 'bg-[#e8e0c9]' : 'bg-gray-700'} flex items-center justify-center`}>
                <span className="text-[8px] text-[#2d1b2d]">1</span>
              </div>
              <div className={`w-6 h-6 rounded-full ${inventoryItems.includes('trinket') ? 'bg-[#e8e0c9]' : 'bg-gray-700'} flex items-center justify-center`}>
                <span className="text-[8px] text-[#2d1b2d]">2</span>
              </div>
              <div className={`w-6 h-6 rounded-full ${inventoryItems.includes('weapon') ? 'bg-[#e8e0c9]' : 'bg-gray-700'} flex items-center justify-center`}>
                <span className="text-[8px] text-[#2d1b2d]">3</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameScreen;
