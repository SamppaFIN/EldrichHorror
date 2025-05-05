import React from 'react';
import { useGameContext } from '@/context/GameContext';
import { GameOverlays, PixelButton } from '@/components/GameComponents';
import { PlaySound } from '@/lib/audioUtils';

const StartGameScreen: React.FC = () => {
  const { startGame } = useGameContext();

  // Play a sound effect when the component mounts
  React.useEffect(() => {
    PlaySound('effect', '/sounds/game_start.mp3');
  }, []);

  return (
    <div className="screen flex flex-col items-center justify-center z-50 bg-black h-screen">
      <GameOverlays />
      
      <div className="bg-[#2d1b2d]/95 backdrop-blur-md rounded-lg border-2 border-[#1a3a3a] shadow-[0_0_20px_rgba(0,0,0,0.8)] p-6 max-w-md w-full">
        <h1 className="font-header text-3xl mb-4 text-center text-yellow-300">THE JOURNEY BEGINS</h1>
        
        <p className="text-[#e8e0c9] mb-6 text-center">
          You stand at the threshold of a dark and mysterious world. Ancient horrors await in the shadows, but so too does knowledge beyond mortal comprehension.
        </p>
        
        <div className="flex justify-center">
          <PixelButton onClick={startGame}>
            Begin Your Journey
          </PixelButton>
        </div>
      </div>
    </div>
  );
};

export default StartGameScreen; 