import { useEffect, useState } from 'react';
import { useGameContext } from '@/context/GameContext';
import MapComponent from '@/components/map/MapComponent';
import { GameOverlays, ProgressBar, PixelButton, ChoiceButton, InventoryItem, SanityEffect } from '@/components/GameComponents';
import { LocationType, StoryChoice } from '@/types/gameTypes';

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
    isChoicesShown
  } = useGameContext();

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
      
      <div className="flex h-full flex-col lg:flex-row p-4">
        {/* Left Panel - Map & Status */}
        <div className="w-full lg:w-2/3 h-1/2 lg:h-full flex flex-col pr-0 lg:pr-4 pb-4 lg:pb-0">
          {/* Status Bar */}
          <div className="flex items-center mb-4 justify-between">
            {/* Health Meter */}
            <div className="flex items-center space-x-4 w-1/2">
              <div className="flex flex-col w-full">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-header text-sm text-[#e8e0c9]">HEALTH</span>
                  <span className="font-interface text-sm text-[#e8e0c9]">{healthMeterValue}%</span>
                </div>
                <ProgressBar type="health" value={healthMeterValue} />
              </div>
            </div>
            
            {/* Sanity Meter */}
            <div className="flex items-center space-x-4 w-1/2 ml-4">
              <div className="flex flex-col w-full">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-header text-sm text-[#e8e0c9]">SANITY</span>
                  <span className="font-interface text-sm text-[#e8e0c9]">{sanityMeterValue}%</span>
                </div>
                <ProgressBar type="sanity" value={sanityMeterValue} />
              </div>
            </div>
          </div>
          
          {/* Map Area */}
          <MapComponent onTriggerLocation={handleLocationTrigger} />
        </div>
        
        {/* Right Panel - Narrative, Choices, Inventory */}
        <div className="w-full lg:w-1/3 h-1/2 lg:h-full flex flex-col space-y-4">
          {/* Narrative Display */}
          <div className="bg-[#2d1b2d]/95 backdrop-blur-md rounded border-2 border-[#1a3a3a] shadow-[0_0_10px_rgba(0,0,0,0.7)] 
                        flex-grow overflow-y-auto p-4 text-[#e8e0c9]">
            <h2 className="font-header text-xl mb-4 border-b border-[#e8e0c9] pb-2">{currentStageInfo.title}</h2>
            <p className="mb-4">{currentNarrative}</p>
          </div>
          
          {/* Action Choices */}
          {isChoicesShown && (
            <div className="choices-panel">
              <h3 className="font-header text-lg mb-3 text-[#e8e0c9]">What will you do?</h3>
              <div className="flex flex-col space-y-3">
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
          
          {/* Inventory */}
          <div className="inventory-panel text-[#e8e0c9]">
            <h3 className="font-header text-lg mb-3 flex justify-between items-center">
              <span>ARTIFACTS COLLECTED</span>
              <span className="text-sm font-interface">{inventoryItems.length}/3</span>
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <InventoryItem
                name="Ancient Wisdom"
                iconPath='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="text-neutral-light w-8 h-8"><path d="M3 19a9 9 0 0 1 9 0a9 9 0 0 1 9 0M3 6a9 9 0 0 1 9 0a9 9 0 0 1 9 0M3 6v13m9-13v13m9-13v13" /></svg>'
                discovered={inventoryItems.includes('wisdom')}
              />
              <InventoryItem
                name="Trinket"
                iconPath='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="text-neutral-light w-8 h-8"><circle cx="12" cy="12" r="7" /><path d="M12 5V3M12 21v-2M5 12H3M21 12h-2M18.4 18.4l-1.4-1.4M7 7L5.6 5.6M16.4 7.6L18 6M6 18l1.6-1.6" /></svg>'
                discovered={inventoryItems.includes('trinket')}
              />
              <InventoryItem
                name="Weapon"
                iconPath='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="text-neutral-light w-8 h-8"><path d="M14.5 17.5L3 6V3h3l11.5 11.5M13 19l6-6M9.5 4.5L11 3l10 10-1.5 1.5M16 16l-4-4" /></svg>'
                discovered={inventoryItems.includes('weapon')}
              />
            </div>
          </div>
          
          {/* Stage Info */}
          <div className="stage-info flex justify-between items-center px-1 text-[#e8e0c9]">
            <div className="location-info">
              <span className="text-sm text-[#999999]">Current Stage:</span>
              <span className="font-header ml-2">
                {gameState.stage === 'start' ? 'Beginning' : 
                 gameState.stage === 'final' ? 'Final Stage' : 
                 `Stage ${gameState.stage}`}
              </span>
            </div>
            <div className="hint-toggle">
              <button 
                className="text-sm underline text-[#999999] hover:text-[#e8e0c9]"
                onClick={toggleHint}
              >
                {showHint ? 'Hide Hint' : 'Show Hint'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameScreen;
