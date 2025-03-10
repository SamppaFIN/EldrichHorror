import { WeatherCondition } from '@/lib/weatherService';

// Game types
export type Screen = 'welcome' | 'game' | 'cutscene' | 'gameover' | 'debug';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type Stage = 'start' | '1' | '2' | '3' | 'final';
export type LocationType = {
  id: string;
  name: string;
  type: 'story' | 'secret' | 'cutscene';
  lat: number;
  lng: number;
  radius: number;
  stage: Stage;
  narrative?: string;
  itemId?: string;
  cutscene?: Cutscene;
};

export type GeoPosition = {
  lat: number;
  lng: number;
};

export type StoryChoice = {
  id: string;
  title: string;
  description: string;
  affects: 'health' | 'sanity';
  cost: number;
  outcomeText: string;
  nextLocationHint?: string;
};

export type Cutscene = {
  id: string;
  title: string;
  text: string;
  additionalText?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  audioUrl?: string;
};

export type StageInfo = {
  title: string;
  narrative: string;
  objective: string;
};

export type InventoryItem = {
  id: string;
  name: string;
  description: string;
  icon: string;
};

export type GameState = {
  screen: Screen;
  health: number;
  sanity: number;
  stage: Stage;
  inventory: InventoryItem[];
  inventoryItems: string[];
  visitedLocations: string[];
  discoveredSecrets: string[];
  difficulty: Difficulty;
  weatherEffects?: {
    condition: 'clear' | 'clouds' | 'rain' | 'thunderstorm' | 'snow' | 'mist' | 'fog';
    sanityModifier: number;
    difficultyModifier: number;
    visibilityRange: number;
    narrativeModifier: string;
    audioModifier: number;
  };
};

export type HighScore = {
  id?: number;
  stagesCompleted: number;
  artifactsFound: number;
  finalHealth: number;
  finalSanity: number;
  difficulty: Difficulty;
  date?: string;
};
