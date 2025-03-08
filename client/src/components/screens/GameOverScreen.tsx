import { useGameContext } from '@/context/GameContext';
import { GameOverlays, PixelButton } from '@/components/GameComponents';

const GameOverScreen = () => {
  const { 
    gameState, 
    restartGame, 
    showHighscores,
    healthMeterValue,
    sanityMeterValue,
    inventoryItems
  } = useGameContext();

  // Get completion stats
  const stagesCompleted = gameState.stage === 'start' ? 0 : 
                          gameState.stage === 'final' ? 4 : 
                          parseInt(gameState.stage as string, 10);

  // Calculate what led to game over
  const diedFromHealth = healthMeterValue <= 0;
  
  return (
    <div className="screen bg-[#2d1b2d] bg-opacity-95 flex flex-col items-center justify-center h-screen">
      <GameOverlays />
      
      <h1 className="font-header text-5xl mb-6 text-[#8b0000]">
        {diedFromHealth ? 'MORTAL WOUNDS' : 'MADNESS CONSUMES'}
      </h1>
      
      <p className="text-center text-xl mb-8 w-2/3 text-[#e8e0c9]">
        {diedFromHealth 
          ? 'Your investigation has come to a grisly end. Your body has succumbed to the physical horrors of this eldritch world.'
          : 'Your investigation has come to a grisly end. The secrets of the deep have proven too much for your mortal mind to withstand.'}
      </p>
      
      <div className="stats-panel w-1/2 mb-10">
        <h2 className="font-header text-xl mb-4 text-center text-[#e8e0c9]">YOUR JOURNEY</h2>
        <div className="grid grid-cols-2 gap-4 bg-[#1a3a3a] bg-opacity-70 p-4 rounded">
          <div className="text-center">
            <p className="text-[#999999] text-sm">STAGES COMPLETED</p>
            <p className="text-2xl font-interface text-[#e8e0c9]">{stagesCompleted}/5</p>
          </div>
          <div className="text-center">
            <p className="text-[#999999] text-sm">ARTIFACTS FOUND</p>
            <p className="text-2xl font-interface text-[#e8e0c9]">{inventoryItems.length}/3</p>
          </div>
          <div className="text-center">
            <p className="text-[#999999] text-sm">FINAL HEALTH</p>
            <p className={`text-2xl font-interface ${
                healthMeterValue > 60 ? 'text-[#2e7d32]' : 
                healthMeterValue > 30 ? 'text-[#f57f17]' : 
                'text-[#b71c1c]'
              }`}>
              {healthMeterValue}%
            </p>
          </div>
          <div className="text-center">
            <p className="text-[#999999] text-sm">FINAL SANITY</p>
            <p className={`text-2xl font-interface ${
                sanityMeterValue > 60 ? 'text-[#1565c0]' : 
                sanityMeterValue > 30 ? 'text-[#6a1b9a]' : 
                'text-[#4a148c]'
              }`}>
              {sanityMeterValue}%
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex space-x-6">
        <PixelButton onClick={restartGame}>
          TRY AGAIN
        </PixelButton>
        <PixelButton onClick={showHighscores}>
          VIEW HIGHSCORES
        </PixelButton>
      </div>
    </div>
  );
};

export default GameOverScreen;
