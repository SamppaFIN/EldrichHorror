import { useState } from 'react';
import { useGameContext } from '@/context/GameContext';
import { GameOverlays } from '@/components/GameComponents';
import { PixelButton } from '@/components/GameComponents';
import { Difficulty } from '@/types/gameTypes';

const WelcomeScreen = () => {
  const { startGame, setDifficulty, showDebugScreen, requestLocationPermission, locationPermissionState } = useGameContext();
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('medium');

  const handleDifficultySelect = (difficulty: Difficulty) => {
    setSelectedDifficulty(difficulty);
    setDifficulty(difficulty);
  };

  return (
    <div className="screen flex flex-col items-center justify-center z-50 bg-[#1a3a3a] h-screen">
      <GameOverlays />
      
      <h1 className="font-header text-5xl mb-8 text-[#e8e0c9] tracking-widest">ELDRITCH WANDERER</h1>
      
      <div className="w-2/3 mb-8 text-center space-y-4">
        <p className="text-xl italic">The ancient ones stir beneath the waves...</p>
        <p className="text-lg">Explore the cursed locations in this location-based Lovecraftian adventure. Navigate through a world where reality and madness blur, uncovering secrets that may shatter your sanity.</p>
      </div>
      
      {/* Location Permission Button */}
      {locationPermissionState !== 'granted' && (
        <div className="mb-8 flex flex-col items-center">
          <button 
            onClick={requestLocationPermission}
            className="bg-[#2c5a5a] text-[#e8e0c9] py-2 px-4 rounded-md flex items-center space-x-2 border border-[#e8e0c9]/30 hover:bg-[#1a3a3a] transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Grant Location Access
          </button>
          <p className="text-sm mt-2 text-[#e8e0c9]/70">This game uses your location to enhance gameplay</p>
        </div>
      )}
      
      {locationPermissionState === 'granted' && (
        <div className="mb-8 flex items-center text-[#8bc34a]">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Location access granted
        </div>
      )}
      
      <div className="mb-8 w-1/2">
        <h2 className="font-header text-xl mb-4 text-center">DIFFICULTY</h2>
        <div className="flex justify-between">
          <PixelButton 
            className={`w-1/3 mx-2 ${selectedDifficulty === 'easy' ? 'bg-[#8b0000]' : ''}`}
            onClick={() => handleDifficultySelect('easy')}
          >
            Curious
          </PixelButton>
          <PixelButton 
            className={`w-1/3 mx-2 ${selectedDifficulty === 'medium' ? 'bg-[#8b0000]' : ''}`}
            onClick={() => handleDifficultySelect('medium')}
          >
            Brave
          </PixelButton>
          <PixelButton 
            className={`w-1/3 mx-2 ${selectedDifficulty === 'hard' ? 'bg-[#8b0000]' : ''}`}
            onClick={() => handleDifficultySelect('hard')}
          >
            Foolhardy
          </PixelButton>
        </div>
      </div>
      
      <PixelButton 
        className="w-64 text-xl py-4"
        onClick={startGame}
        size="lg"
      >
        BEGIN JOURNEY
      </PixelButton>
      
      <button 
        className="absolute bottom-4 right-4 text-sm opacity-50 hover:opacity-100 text-[#e8e0c9]"
        onClick={showDebugScreen}
      >
        Debug Mode
      </button>
    </div>
  );
};

export default WelcomeScreen;
