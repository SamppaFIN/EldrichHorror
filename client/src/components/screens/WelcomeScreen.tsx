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
      
      <div className="w-2/3 mb-12 text-center space-y-4">
        <p className="text-xl italic">The ancient ones stir beneath the waves...</p>
        <p className="text-lg">Explore the cursed locations in this location-based Lovecraftian adventure. Navigate through a world where reality and madness blur, uncovering secrets that may shatter your sanity.</p>
      </div>
      
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
