import { useState, useEffect } from 'react';
import { useGameContext } from '@/context/GameContext';
import WelcomeScreen from '@/components/screens/WelcomeScreen';
import GameScreen from '@/components/screens/GameScreen';
import GameOverScreen from '@/components/screens/GameOverScreen';
import CutsceneScreen from '@/components/screens/CutsceneScreen';
import DebugScreen from '@/components/screens/DebugScreen';
import { useToast } from '@/hooks/use-toast';
import { ResumeAudioContext } from '@/lib/audioUtils';

const Home = () => {
  const { gameState } = useGameContext();
  const { toast } = useToast();
  const [geolocationWarningShown, setGeolocationWarningShown] = useState(false);
  
  // Setup audio context on first interaction
  useEffect(() => {
    const handleInteraction = () => {
      ResumeAudioContext();
      // Remove listener after first interaction
      document.removeEventListener('click', handleInteraction);
    };
    
    document.addEventListener('click', handleInteraction);
    
    return () => {
      document.removeEventListener('click', handleInteraction);
    };
  }, []);
  
  // Check for geolocation permission
  useEffect(() => {
    if (!geolocationWarningShown) {
      navigator.permissions?.query({ name: 'geolocation' }).then((result) => {
        if (result.state === 'denied') {
          toast({
            title: "Location Access Required",
            description: "This game uses your location to trigger story events. Please enable location access in your browser settings.",
            duration: 10000,
          });
          setGeolocationWarningShown(true);
        }
      }).catch(() => {
        // Fallback for browsers that don't support permissions API
        console.log("Couldn't check geolocation permission status");
      });
    }
  }, [toast, geolocationWarningShown]);
  
  // Add custom classes to body
  useEffect(() => {
    document.body.classList.add('font-narrative', 'bg-[#1a1a1a]', 'text-[#e8e0c9]', 'overflow-hidden');
    
    // Custom CSS for animations
    const style = document.createElement('style');
    style.textContent = `
      @keyframes sheen {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }
      
      @keyframes pulse {
        0% { opacity: 0.05; }
        100% { opacity: 0.2; }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.body.classList.remove('font-narrative', 'bg-[#1a1a1a]', 'text-[#e8e0c9]', 'overflow-hidden');
      document.head.removeChild(style);
    };
  }, []);
  
  // Render appropriate screen based on game state
  const renderScreen = () => {
    switch (gameState.screen) {
      case 'welcome':
        return <WelcomeScreen />;
      case 'game':
        return <GameScreen />;
      case 'cutscene':
        return <CutsceneScreen />;
      case 'gameover':
        return <GameOverScreen />;
      case 'debug':
        return <DebugScreen />;
      default:
        return <WelcomeScreen />;
    }
  };
  
  return (
    <div className="game-container max-w-[1920px] max-h-[1080px] mx-auto relative overflow-hidden h-screen">
      {renderScreen()}
    </div>
  );
};

export default Home;
