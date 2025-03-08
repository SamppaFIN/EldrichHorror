import { GameState, Difficulty, Stage } from '@/types/gameTypes';

// Difficulty settings
export const DIFFICULTY_SETTINGS = {
  easy: { health: 100, sanity: 100 },
  medium: { health: 80, sanity: 80 },
  hard: { health: 60, sanity: 60 }
};

// Initial game state
export const getInitialGameState = (difficulty: Difficulty = 'medium'): GameState => {
  return {
    screen: 'welcome',
    health: DIFFICULTY_SETTINGS[difficulty].health,
    sanity: DIFFICULTY_SETTINGS[difficulty].sanity,
    stage: 'start',
    inventory: [],
    inventoryItems: [],
    visitedLocations: [],
    discoveredSecrets: [],
    difficulty
  };
};

// Calculate score based on game state
export const calculateScore = (gameState: GameState): number => {
  // Points for stage completion
  const stagePoints = gameState.stage === 'start' ? 0 : 
                     gameState.stage === '1' ? 100 :
                     gameState.stage === '2' ? 200 :
                     gameState.stage === '3' ? 300 :
                     gameState.stage === 'final' ? 400 : 0;
  
  // Points for secrets discovered (100 each)
  const secretPoints = gameState.discoveredSecrets.length * 100;
  
  // Points for remaining health and sanity
  const healthPoints = Math.max(0, gameState.health) * 2;
  const sanityPoints = Math.max(0, gameState.sanity) * 2;
  
  // Difficulty multiplier
  const difficultyMultiplier = 
    gameState.difficulty === 'easy' ? 1 :
    gameState.difficulty === 'medium' ? 1.5 :
    gameState.difficulty === 'hard' ? 2 : 1;
  
  // Calculate total score
  const rawScore = stagePoints + secretPoints + healthPoints + sanityPoints;
  return Math.round(rawScore * difficultyMultiplier);
};

// Determine if the player has completed the game
export const isGameCompleted = (gameState: GameState): boolean => {
  // Game is complete if player reaches the final stage and survives
  return gameState.stage === 'final' && 
         gameState.health > 0 && 
         gameState.sanity > 0 &&
         // Check if all final stage locations are visited
         gameState.visitedLocations.length >= 8; // Assuming 8 total locations
};

// Random event generation for low health/sanity effects
export const shouldTriggerRandomEvent = (health: number, sanity: number): boolean => {
  // Higher chance of random events with lower health/sanity
  const healthFactor = Math.max(0, 1 - (health / 100));
  const sanityFactor = Math.max(0, 1 - (sanity / 100));
  
  // Combined probability (0-0.8)
  const eventProbability = (healthFactor * 0.4) + (sanityFactor * 0.4);
  
  // Random check
  return Math.random() < eventProbability;
};

// Stage progression logic
export const getNextStage = (currentStage: Stage): Stage => {
  switch (currentStage) {
    case 'start': return '1';
    case '1': return '2';
    case '2': return '3';
    case '3': return 'final';
    case 'final': return 'final'; // No further stages
    default: return 'start';
  }
};
