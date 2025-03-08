import { 
  users, type User, type InsertUser,
  locations, type Location, type InsertLocation,
  gameProgress, type GameProgress, type InsertGameProgress,
  highscores, type Highscore, type InsertHighscore
} from "@shared/schema";

// Default game locations
const DEFAULT_LOCATIONS: InsertLocation[] = [
  {
    id: "harbor_master",
    name: "Harbor Master's Office",
    type: "story",
    latitude: "40.7138",
    longitude: "-74.0070",
    radius: 20,
    stage: "start",
    narrative: "The harbor master's office is in disarray. Salt-crusted logbooks and strange symbols drawn on nautical charts hint at unusual activity offshore. A journal mentions 'deep ones' sighted near the lighthouse."
  },
  {
    id: "hidden_tome",
    name: "Ancient Wisdom",
    type: "secret",
    latitude: "40.7118",
    longitude: "-74.0050",
    radius: 10,
    stage: "start",
    itemId: "wisdom",
    narrative: "Hidden beneath floorboards, you discover an ancient leather-bound tome. Its pages contain forbidden knowledge about aquatic deities and their half-human servants."
  },
  {
    id: "esoteric_temple",
    name: "Esoteric Order Temple",
    type: "story",
    latitude: "40.7158",
    longitude: "-74.0080",
    radius: 20,
    stage: "1",
    narrative: "The abandoned temple is adorned with bizarre fish-like iconography. Hidden chambers reveal ceremonial robes and altars stained with what appears to be blood mixed with seawater."
  },
  {
    id: "ritual_dagger",
    name: "Ceremonial Weapon",
    type: "secret",
    latitude: "40.7162",
    longitude: "-74.0085",
    radius: 10,
    stage: "1",
    itemId: "weapon",
    narrative: "Behind a loose stone in the altar, you find an ornate dagger with a handle carved from bone to resemble tentacles. Its blade gleams with an unnatural iridescence."
  },
  {
    id: "lighthouse",
    name: "Abandoned Lighthouse",
    type: "story",
    latitude: "40.7180",
    longitude: "-74.0060",
    radius: 20,
    stage: "2",
    narrative: "The lighthouse keeper's quarters contain star charts marking strange celestial alignments. A trapdoor leads down to sea caves where the sound of chanting echoes from below."
  },
  {
    id: "strange_amulet",
    name: "Elder Sign Trinket",
    type: "secret",
    latitude: "40.7185",
    longitude: "-74.0065",
    radius: 10,
    stage: "2",
    itemId: "trinket",
    narrative: "In a locked drawer, you find a five-pointed star amulet made of an unknown green stone. It feels oddly warm to the touch and seems to repel the shadows around it."
  },
  {
    id: "sea_caves",
    name: "Submerged Caves",
    type: "story",
    latitude: "40.7195",
    longitude: "-74.0050",
    radius: 20,
    stage: "3",
    narrative: "The sea caves are illuminated by bioluminescent algae revealing ancient carvings depicting fish-human hybrids. Water slowly rises as you hear chanting growing louder from the central chamber."
  },
  {
    id: "ritual_chamber",
    name: "Ritual Chamber",
    type: "story",
    latitude: "40.7210",
    longitude: "-74.0040",
    radius: 20,
    stage: "final",
    narrative: "Robed cultists surround an ancient altar where a grotesque ceremony is underway. Beyond them, the cave opens to the sea where massive shapes move beneath the dark waters."
  },
  {
    id: "deep_one_encounter",
    name: "Deep One Encounter",
    type: "cutscene",
    latitude: "40.7205",
    longitude: "-74.0045",
    radius: 15,
    stage: "3",
    cutsceneData: {
      id: "deep_one_reveal",
      title: "The Revelation",
      text: "As you peer deeper into the cave, the shadows part to reveal a humanoid figure with bulging eyes and glistening scaled skin. It regards you with ancient malice before slipping back into the darkness.",
      additionalText: "You know with certainty that whatever these creatures are, they are not entirely of this world."
    }
  },
  {
    id: "cthulhu_rising",
    name: "The Ancient One Stirs",
    type: "cutscene",
    latitude: "40.7215",
    longitude: "-74.0035",
    radius: 15,
    stage: "final",
    cutsceneData: {
      id: "cthulhu_awakens",
      title: "That Which Sleeps",
      text: "The water churns violently as something of impossible size begins to rise from the depths. For a brief, sanity-shattering moment, you glimpse a mass of tentacles, eyes, and geometries that defy comprehension.",
      additionalText: "The very fabric of reality seems to warp around this cosmic entity. You know instinctively that to witness its full form would destroy your mind completely."
    }
  }
];

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  // User methods (original)
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Game location methods
  getLocations(): Promise<Location[]>;
  getLocationById(id: string): Promise<Location | undefined>;
  createLocation(location: InsertLocation): Promise<Location>;
  
  // Game progress methods
  getGameProgress(userId: number): Promise<GameProgress | undefined>;
  saveGameProgress(progress: InsertGameProgress): Promise<GameProgress>;
  
  // Highscore methods
  getHighscores(): Promise<Highscore[]>;
  getHighscoresByUser(userId: number): Promise<Highscore[]>;
  saveHighscore(highscore: InsertHighscore): Promise<Highscore>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private locations: Map<string, Location>;
  private progresses: Map<number, GameProgress>;
  private highscores: Highscore[];
  private userCurrentId: number;
  private highscoreCurrentId: number;
  private progressCurrentId: number;

  constructor() {
    this.users = new Map();
    this.locations = new Map();
    this.progresses = new Map();
    this.highscores = [];
    this.userCurrentId = 1;
    this.highscoreCurrentId = 1;
    this.progressCurrentId = 1;
    
    // Initialize default locations
    this.initializeDefaultData();
  }
  
  private initializeDefaultData() {
    // Add default game locations
    DEFAULT_LOCATIONS.forEach(location => {
      this.locations.set(location.id, {
        ...location,
        cutsceneData: location.cutsceneData || null
      });
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Game location methods
  async getLocations(): Promise<Location[]> {
    return Array.from(this.locations.values());
  }
  
  async getLocationById(id: string): Promise<Location | undefined> {
    return this.locations.get(id);
  }
  
  async createLocation(location: InsertLocation): Promise<Location> {
    const newLocation: Location = {
      ...location,
      cutsceneData: location.cutsceneData || null
    };
    this.locations.set(location.id, newLocation);
    return newLocation;
  }
  
  // Game progress methods
  async getGameProgress(userId: number): Promise<GameProgress | undefined> {
    return this.progresses.get(userId);
  }
  
  async saveGameProgress(progress: InsertGameProgress): Promise<GameProgress> {
    const id = this.progressCurrentId++;
    const now = new Date();
    
    const savedProgress: GameProgress = {
      ...progress,
      id,
      lastUpdated: now
    };
    
    this.progresses.set(progress.userId, savedProgress);
    return savedProgress;
  }
  
  // Highscore methods
  async getHighscores(): Promise<Highscore[]> {
    // Sort by stages completed (desc), then by artifacts (desc)
    return [...this.highscores].sort((a, b) => {
      if (a.stagesCompleted !== b.stagesCompleted) {
        return b.stagesCompleted - a.stagesCompleted;
      }
      return b.artifactsFound - a.artifactsFound;
    });
  }
  
  async getHighscoresByUser(userId: number): Promise<Highscore[]> {
    return this.highscores.filter(score => score.userId === userId);
  }
  
  async saveHighscore(highscore: InsertHighscore): Promise<Highscore> {
    const id = this.highscoreCurrentId++;
    const now = new Date();
    
    const newHighscore: Highscore = {
      ...highscore,
      id,
      date: now
    };
    
    this.highscores.push(newHighscore);
    return newHighscore;
  }
}

export const storage = new MemStorage();
