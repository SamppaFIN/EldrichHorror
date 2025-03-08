import { useEffect, useState } from 'react';
import { useGameContext } from '@/context/GameContext';
import { GameOverlays } from '@/components/GameComponents';

const CutsceneScreen = () => {
  const { 
    currentCutscene, 
    completeCutscene
  } = useGameContext();
  
  const [canSkip, setCanSkip] = useState(false);
  
  // Allow skipping after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setCanSkip(true);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [currentCutscene]);
  
  // Listen for ESC key to skip cutscene
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && canSkip) {
        completeCutscene();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [canSkip, completeCutscene]);

  // Auto-advance cutscene after a set time if no media
  useEffect(() => {
    if (!currentCutscene?.mediaUrl) {
      const timer = setTimeout(() => {
        completeCutscene();
      }, 10000); // 10 seconds
      
      return () => clearTimeout(timer);
    }
  }, [currentCutscene, completeCutscene]);
  
  // Handle click to advance cutscene
  const handleClick = () => {
    if (canSkip) {
      completeCutscene();
    }
  };
  
  if (!currentCutscene) return null;
  
  return (
    <div 
      className="screen bg-black flex flex-col h-screen"
      onClick={handleClick}
    >
      <GameOverlays />
      
      <div className="media-container flex-grow flex items-center justify-center">
        {currentCutscene.mediaType === 'image' && (
          <img 
            src={currentCutscene.mediaUrl} 
            alt={currentCutscene.title} 
            className="max-h-full max-w-full"
          />
        )}
        {currentCutscene.mediaType === 'video' && (
          <video 
            src={currentCutscene.mediaUrl} 
            className="max-h-full max-w-full" 
            autoPlay 
            muted
          />
        )}
        {!currentCutscene.mediaUrl && (
          <div className="w-full h-full bg-gradient-to-b from-[#1a1a1a] to-black flex items-center justify-center">
            <div className="text-[#e8e0c9] text-4xl font-header tracking-wider opacity-30">
              {currentCutscene.title}
            </div>
          </div>
        )}
      </div>
      
      <div className="bg-[#2d1b2d]/95 backdrop-blur-md p-6 relative text-[#e8e0c9]">
        <div className="absolute right-4 top-2 text-sm text-[#999999]">
          {canSkip ? 'Press ESC to skip' : 'Loading...'}
        </div>
        <p className="text-lg mb-4">{currentCutscene.text}</p>
        {currentCutscene.additionalText && (
          <p>{currentCutscene.additionalText}</p>
        )}
      </div>
    </div>
  );
};

export default CutsceneScreen;
