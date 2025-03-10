import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useGeolocation } from '@/hooks/useGeolocation';
import { calculateDistance } from '@/lib/locationUtils';
import { PlaySound, StopSound, ApplySanityAudioEffects } from '@/lib/audioUtils';
import { useToast } from '@/hooks/use-toast';
import { getWeatherEffects } from '@/lib/weatherService';
import {
  GameState,
  Screen,
  Difficulty,
  LocationType,
  GeoPosition,
  StoryChoice,
  Cutscene,
  Stage,
  HighScore,
  StageInfo
} from '@/types/gameTypes';

// Default values for different difficulty levels
const DIFFICULTY_SETTINGS = {
  easy: { health: 100, sanity: 100 },
  medium: { health: 80, sanity: 80 },
  hard: { health: 60, sanity: 60 }
};

// Initial game state
const initialGameState: GameState = {
  screen: 'welcome',
  health: 80,
  sanity: 80,
  stage: 'start',
  inventory: [],
  inventoryItems: [],
  visitedLocations: [],
  discoveredSecrets: [],
  difficulty: 'medium',
};

// Stage information
const STAGE_INFO: Record<Stage, StageInfo> = {
  start: {
    title: 'THE CALL OF THE DEEP',
    narrative: 'The salty breeze carries an undeniable stench of decay as you approach the coastal town of Innsmouth. Your research into the ancient Esoteric Order of Dagon has led you here, where locals speak in hushed whispers about strange occurrences near the abandoned lighthouse.',
    objective: 'Your first objective: Find the old harbor master\'s office to collect information about the offshore disturbances reported by fishermen in recent months.'
  },
  '1': {
    title: 'WHISPERS FROM THE DEEP',
    narrative: 'The harbor master\'s logs reveal disturbing accounts of strange lights beneath the waves and bizarre, misshapen creatures sighted near the offshore reefs.',
    objective: 'Travel to the Esoteric Order of Dagon\'s temple to investigate their connection to these sightings.'
  },
  '2': {
    title: 'FORBIDDEN KNOWLEDGE',
    narrative: 'The temple\'s hidden chamber contains ancient scrolls depicting hybrid fish-human entities and rituals to summon something from the ocean depths.',
    objective: 'Head to the lighthouse where ritual activity has been reported.'
  },
  '3': {
    title: 'KEEPER OF THE LIGHT',
    narrative: 'The lighthouse keeper\'s quarters are abandoned, but signs of recent activity suggest the rituals have moved to the sea caves below.',
    objective: 'Descend into the caves to stop the ritual before it\'s too late.'
  },
  final: {
    title: 'THE AWAKENING',
    narrative: 'Deep in the caves, you discover cultists attempting to awaken an ancient entity. The walls rumble as something massive stirs beneath the waves.',
    objective: 'Escape the caves before the rising water traps you with whatever is emerging from the depths.'
  }
};

// Story choices for each stage
const STAGE_CHOICES: Record<Stage, StoryChoice[]> = {
  start: [
    {
      id: 'start_1',
      title: 'Explore the decrepit buildings',
      description: 'The structures look unstable, but might contain valuable clues.',
      affects: 'health',
      cost: 10,
      outcomeText: 'As you navigate through the rotting timbers and collapsing floors, you find an old journal but injure yourself on rusted nails.',
      nextLocationHint: 'The harbor master\'s office is located near the old docks.'
    },
    {
      id: 'start_2',
      title: 'Consult your forbidden tome',
      description: 'The ancient text contains knowledge, but reading it strains your mind.',
      affects: 'sanity',
      cost: 15,
      outcomeText: 'The tome\'s pages reveal connections between Innsmouth and ancient underwater cities that challenge your understanding of reality.',
      nextLocationHint: 'Look for the harbor master\'s office near the eastern pier.'
    }
  ],
  '1': [
    {
      id: '1_1',
      title: 'Search through the damaged records',
      description: 'The water-damaged records might contain valuable information.',
      affects: 'health',
      cost: 15,
      outcomeText: 'You contract a strange rash from the mold-infested papers, but discover coordinates for the Esoteric Order\'s meeting locations.',
      nextLocationHint: 'The Esoteric Order\'s temple is disguised as an old warehouse in the southern part of town.'
    },
    {
      id: '1_2',
      title: 'Decipher the strange symbols',
      description: 'The symbols appear to be some form of cipher used by the cult.',
      affects: 'sanity',
      cost: 20,
      outcomeText: 'Your mind struggles to comprehend the non-Euclidean geometry represented in the symbols, revealing a hidden truth about the Order\'s inhuman allies.',
      nextLocationHint: 'Look for a building marked with a subtle fish-like sigil near the southern docks.'
    }
  ],
  '2': [
    {
      id: '2_1',
      title: 'Participate in the strange ritual',
      description: 'Following the instructions might reveal what the cult is trying to accomplish.',
      affects: 'sanity',
      cost: 25,
      outcomeText: 'As you speak the words from the ritual, visions of vast underwater cities and monstrous beings flood your mind.',
      nextLocationHint: 'The lighthouse stands on the rocky promontory east of town.'
    },
    {
      id: '2_2',
      title: 'Force open the sealed door',
      description: 'Something valuable appears to be hidden behind this heavy door.',
      affects: 'health',
      cost: 20,
      outcomeText: 'You strain your muscles breaking through the door, finding evidence linking the lighthouse keeper to the cult.',
      nextLocationHint: 'Make your way to the lighthouse on the eastern cliffs.'
    }
  ],
  '3': [
    {
      id: '3_1',
      title: 'Climb down the treacherous path',
      description: 'The narrow path down to the caves looks dangerous but direct.',
      affects: 'health',
      cost: 25,
      outcomeText: 'Loose rocks give way beneath your feet, causing you to fall and injure yourself on the jagged rocks below.',
      nextLocationHint: 'The cave entrance is visible at low tide beneath the lighthouse.'
    },
    {
      id: '3_2',
      title: 'Read the lighthouse keeper\'s journal',
      description: 'The journal contains disturbing accounts of what dwells in the caves.',
      affects: 'sanity',
      cost: 30,
      outcomeText: 'The detailed descriptions of transformations and underwater cities inhabited by fish-human hybrids shake your grasp on reality.',
      nextLocationHint: 'Access the sea caves through the hidden trapdoor in the lighthouse basement.'
    }
  ],
  final: [
    {
      id: 'final_1',
      title: 'Attempt to disrupt the ritual',
      description: 'You might be able to stop the awakening by interrupting the chanting.',
      affects: 'health',
      cost: 35,
      outcomeText: 'The cultists attack you with ceremonial daggers as you try to overturn their altar. The cave starts to collapse as something massive shifts beneath.',
      nextLocationHint: 'Find the exit tunnel on the north side of the main cavern.'
    },
    {
      id: 'final_2',
      title: 'Witness the summoning',
      description: 'Something is emerging from the depths. You might learn crucial information.',
      affects: 'sanity',
      cost: 40,
      outcomeText: 'The sight of the ancient entity rising from the black waters - a mass of eyes, tentacles, and impossible geometry - shatters something fundamental in your mind.',
      nextLocationHint: 'Escape through the tunnel behind the cultists before the water rises completely.'
    }
  ]
};

// Create context
type GameContextType = {
  gameState: GameState;
  playerPosition: GeoPosition | null;
  gameLocations: LocationType[];
  healthMeterValue: number;
  sanityMeterValue: number;
  inventoryItems: string[];
  currentStageInfo: StageInfo;
  currentNarrative: string;
  currentChoices: StoryChoice[];
  isChoicesShown: boolean;
  showHint: boolean;
  currentCutscene: Cutscene | null;
  locationPermissionState: PermissionState | null;
  
  startGame: () => void;
  restartGame: () => void;
  resetGame: () => void;
  setDifficulty: (difficulty: Difficulty) => void;
  setHealth: (value: number) => void;
  setSanity: (value: number) => void;
  setStage: (stage: Stage) => void;
  triggerLocation: (location: LocationType) => void;
  triggerStory: (locationId: string) => void;
  triggerSecret: (secretId: string) => void;
  makeChoice: (choice: StoryChoice) => void;
  toggleHint: () => void;
  completeCutscene: () => void;
  showDebugScreen: () => void;
  closeDebugScreen: (returnScreen?: Screen) => void;
  showHighscores: () => void;
  requestLocationPermission: () => void;
};

const GameContext = createContext<GameContextType | undefined>(undefined);

// Provider component
export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [gameState, setGameState] = useState<GameState>(() => {
    const savedState = localStorage.getItem('eldritchGame');
    return savedState ? JSON.parse(savedState) : initialGameState;
  });
  
  const [showHint, setShowHint] = useState(false);
  const [currentCutscene, setCurrentCutscene] = useState<Cutscene | null>(null);
  const [currentNarrative, setCurrentNarrative] = useState('');
  const [isChoicesShown, setIsChoicesShown] = useState(false);
  
  const { toast } = useToast();
  
  // Fetch player position using geolocation hook
  const { position: playerPosition, error: geoError, requestPermission, permissionState } = useGeolocation();
  
  // Fetch game locations from API
  const { data: gameLocations = [] } = useQuery<LocationType[]>({
    queryKey: ['/api/locations'],
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
  
  // Computed values
  const healthMeterValue = Math.max(0, Math.min(100, gameState.health));
  const sanityMeterValue = Math.max(0, Math.min(100, gameState.sanity));
  const inventoryItems = gameState.inventoryItems;
  const currentStageInfo = STAGE_INFO[gameState.stage];
  const currentChoices = STAGE_CHOICES[gameState.stage];
  
  // Save game state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('eldritchGame', JSON.stringify(gameState));
  }, [gameState]);
  
  // Check for game over conditions
  useEffect(() => {
    if ((gameState.screen === 'game' || gameState.screen === 'cutscene') && 
        (gameState.health <= 0 || gameState.sanity <= 0)) {
      setGameState(prev => ({ ...prev, screen: 'gameover' }));
      
      // Save score
      submitHighScore();
    }
  }, [gameState.health, gameState.sanity, gameState.screen]);
  
  // Update narrative when stage changes
  useEffect(() => {
    if (gameState.stage && STAGE_INFO[gameState.stage]) {
      const stageInfo = STAGE_INFO[gameState.stage];
      setCurrentNarrative(`${stageInfo.narrative} ${stageInfo.objective}`);
    }
  }, [gameState.stage]);

  // Fetch and update weather effects
  useEffect(() => {
    const updateWeatherEffects = async () => {
      if (playerPosition && gameState.screen === 'game') {
        const effects = await getWeatherEffects(playerPosition.lat, playerPosition.lng);
        if (effects) {
          setGameState(prev => ({ ...prev, weatherEffects: effects }));
          
          // Apply audio effects based on sanity and weather
          const audioModifier = effects.audioModifier || 1;
          ApplySanityAudioEffects(sanityMeterValue * audioModifier);
          
          // Show weather effect notification
          toast({
            title: "Weather Changes",
            description: effects.narrativeModifier,
          });
        }
      }
    };

    // Update weather every 5 minutes
    updateWeatherEffects();
    const interval = setInterval(updateWeatherEffects, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [playerPosition, gameState.screen]);
  
  // Mutation for saving highscore
  const { mutate: saveHighScore } = useMutation({
    mutationFn: async (score: HighScore) => {
      return await apiRequest('POST', '/api/highscores', score);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/highscores'] });
    }
  });
  
  // Game control functions
  const submitHighScore = async () => {
    const stageValue = gameState.stage === 'start' ? 0 : 
                      gameState.stage === 'final' ? 4 : 
                      parseInt(gameState.stage as string, 10);
    
    const score = {
      stagesCompleted: stageValue,
      artifactsFound: gameState.inventoryItems.length,
      finalHealth: gameState.health,
      finalSanity: gameState.sanity,
      difficulty: gameState.difficulty
    };
    
    saveHighScore(score);
  };
  
  const startGame = () => {
    // Load initial stats based on difficulty
    const initialStats = DIFFICULTY_SETTINGS[gameState.difficulty];
    
    setGameState(prev => ({
      ...prev,
      screen: 'game',
      health: initialStats.health,
      sanity: initialStats.sanity
    }));
    
    // Play ambient sounds
    PlaySound('ambient', 'https://freesound.org/data/previews/468/468407_8874611-lq.mp3', true, 0.3);
  };
  
  const restartGame = () => {
    const difficulty = gameState.difficulty; // Keep selected difficulty
    
    setGameState({
      ...initialGameState,
      difficulty,
      health: DIFFICULTY_SETTINGS[difficulty].health,
      sanity: DIFFICULTY_SETTINGS[difficulty].sanity,
      screen: 'welcome'
    });
    
    // Stop all sounds
    StopSound('ambient');
    StopSound('effect');
  };
  
  const resetGame = () => {
    localStorage.removeItem('eldritchGame');
    setGameState(initialGameState);
    
    // Stop all sounds
    StopSound('ambient');
    StopSound('effect');
    
    toast({
      title: "Game Reset",
      description: "All progress has been reset.",
    });
  };
  
  const setDifficulty = (difficulty: Difficulty) => {
    setGameState(prev => ({ 
      ...prev, 
      difficulty,
      health: DIFFICULTY_SETTINGS[difficulty].health,
      sanity: DIFFICULTY_SETTINGS[difficulty].sanity
    }));
  };
  
  const setHealth = (value: number) => {
    setGameState(prev => ({ ...prev, health: value }));
  };
  
  const setSanity = (value: number) => {
    setGameState(prev => ({ ...prev, sanity: value }));
  };
  
  const setStage = (stage: Stage) => {
    setGameState(prev => ({ ...prev, stage }));
    setCurrentNarrative(`${STAGE_INFO[stage].narrative} ${STAGE_INFO[stage].objective}`);
  };
  
  const triggerLocation = (location: LocationType) => {
    // Don't trigger already visited locations (except cutscenes)
    if (gameState.visitedLocations.includes(location.id) && location.type !== 'cutscene') {
      return;
    }
    
    switch (location.type) {
      case 'story':
        triggerStory(location.id);
        break;
      case 'secret':
        triggerSecret(location.id);
        break;
      case 'cutscene':
        triggerCutscene(location.id);
        break;
    }
  };
  
  const triggerStory = (locationId: string) => {
    // Find location details
    const location = gameLocations.find(loc => loc.id === locationId);
    if (!location) return;
    
    // Mark as visited
    if (!gameState.visitedLocations.includes(locationId)) {
      setGameState(prev => ({
        ...prev,
        visitedLocations: [...prev.visitedLocations, locationId]
      }));
    }
    
    // Update narrative with location-specific content
    if (location.narrative) {
      setCurrentNarrative(location.narrative);
    }
    
    // Show choices
    setIsChoicesShown(true);
    
    // Play discovery sound
    PlaySound('effect', 'https://freesound.org/data/previews/331/331912_3248244-lq.mp3');
  };
  
  const triggerSecret = (secretId: string) => {
    // Find secret details
    const secret = gameLocations.find(loc => loc.id === secretId);
    if (!secret) return;
    
    // Don't trigger already discovered secrets
    if (gameState.discoveredSecrets.includes(secretId)) {
      return;
    }
    
    // Mark as discovered
    setGameState(prev => ({
      ...prev,
      discoveredSecrets: [...prev.discoveredSecrets, secretId],
      inventoryItems: [...prev.inventoryItems, secret.itemId || '']
    }));
    
    // Show toast notification
    toast({
      title: "Secret Discovered!",
      description: `You found: ${secret.name}`,
    });
    
    // Play discovery sound
    PlaySound('effect', 'https://freesound.org/data/previews/320/320655_5260872-lq.mp3');
  };
  
  const triggerCutscene = (cutsceneId: string) => {
    // Find cutscene details
    const cutscene = gameLocations.find(loc => loc.id === cutsceneId);
    if (!cutscene || !cutscene.cutscene) return;
    
    // Play cutscene sound
    PlaySound('effect', 'https://freesound.org/data/previews/325/325647_5865517-lq.mp3');
    
    // Set cutscene and switch to cutscene screen
    setCurrentCutscene(cutscene.cutscene);
    setGameState(prev => ({ ...prev, screen: 'cutscene' }));
  };
  
  const makeChoice = (choice: StoryChoice) => {
    // Apply consequences to health or sanity with weather effects
    const weatherEffects = gameState.weatherEffects || {
      sanityModifier: 1,
      difficultyModifier: 1,
      visibilityRange: 1,
      narrativeModifier: '',
      audioModifier: 1
    };

    const modifiedCost = Math.ceil(choice.cost * weatherEffects.difficultyModifier);
    
    if (choice.affects === 'health') {
      setGameState(prev => ({ ...prev, health: Math.max(0, prev.health - modifiedCost) }));
    } else {
      const sanityCost = Math.ceil(modifiedCost * weatherEffects.sanityModifier);
      setGameState(prev => ({ ...prev, sanity: Math.max(0, prev.sanity - sanityCost) }));
      
      // Apply updated audio effects
      ApplySanityAudioEffects(Math.max(0, gameState.sanity - sanityCost));
    }
    
    // Update narrative with outcome and weather effects
    const weatherNarrative = weatherEffects.narrativeModifier ? 
      `\n\n${weatherEffects.narrativeModifier}` : '';
    setCurrentNarrative(choice.outcomeText + weatherNarrative);
    
    // Hide choices
    setIsChoicesShown(false);
    
    // Show hint if it's relevant
    if (choice.nextLocationHint) {
      setShowHint(true);
      setTimeout(() => {
        toast({
          title: "Hint Available",
          description: "A new hint has been revealed",
        });
      }, 1500);
    }
    
    // Play choice sound
    PlaySound('effect', 'https://freesound.org/data/previews/244/244954_4486188-lq.mp3');
    
    // Advance stage if appropriate (based on completed story points)
    const currentStageStoryPoints = gameLocations
      .filter(loc => loc.stage === gameState.stage && loc.type === 'story')
      .map(loc => loc.id);
    
    const allStoryPointsVisited = currentStageStoryPoints.every(id => 
      gameState.visitedLocations.includes(id)
    );
    
    if (allStoryPointsVisited) {
      // Advance to next stage
      if (gameState.stage === 'start') {
        setStage('1');
      } else if (gameState.stage === '1') {
        setStage('2');
      } else if (gameState.stage === '2') {
        setStage('3');
      } else if (gameState.stage === '3') {
        setStage('final');
      }
      
      toast({
        title: "Stage Complete",
        description: "You've advanced to the next stage of your journey.",
      });
    }
  };
  
  const toggleHint = () => {
    setShowHint(prev => !prev);
  };
  
  const completeCutscene = () => {
    setCurrentCutscene(null);
    setGameState(prev => ({ ...prev, screen: 'game' }));
  };
  
  const showDebugScreen = () => {
    setGameState(prev => ({ ...prev, screen: 'debug' }));
  };
  
  const closeDebugScreen = (returnScreen?: Screen) => {
    if (returnScreen) {
      setGameState(prev => ({ ...prev, screen: returnScreen }));
    } else if (gameState.screen === 'debug') {
      setGameState(prev => ({ ...prev, screen: 'welcome' }));
    }
  };
  
  const showHighscores = () => {
    // Placeholder for future implementation
    toast({
      title: "Highscores",
      description: "Highscore feature coming soon!",
    });
  };
  
  // Function to request location permission
  const requestLocationPermission = () => {
    requestPermission();
    toast({
      title: "Requesting Location",
      description: "Please allow access to your location for the best gameplay experience.",
      duration: 3000
    });
  };

  return (
    <GameContext.Provider value={{
      gameState,
      playerPosition,
      gameLocations,
      healthMeterValue,
      sanityMeterValue,
      inventoryItems,
      currentStageInfo,
      currentNarrative,
      currentChoices,
      isChoicesShown,
      showHint,
      currentCutscene,
      locationPermissionState: permissionState,
      
      startGame,
      restartGame,
      resetGame,
      setDifficulty,
      setHealth,
      setSanity,
      setStage,
      triggerLocation,
      triggerStory,
      triggerSecret,
      makeChoice,
      toggleHint,
      completeCutscene,
      showDebugScreen,
      closeDebugScreen,
      showHighscores,
      requestLocationPermission
    }}>
      {children}
    </GameContext.Provider>
  );
};

// Hook for consuming context
export const useGameContext = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
};
