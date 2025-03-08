import { 
  users, type User, type InsertUser,
  locations, type Location, type InsertLocation,
  gameProgress, type GameProgress, type InsertGameProgress,
  highscores, type Highscore, type InsertHighscore
} from "@shared/schema";

// Default game locations in Tampere, Finland
const DEFAULT_LOCATIONS: InsertLocation[] = [
  {
    id: "ancient_map",
    name: "Ancient Map Discovery",
    type: "story",
    latitude: "61.47422624340799",
    longitude: "23.727072093722093",
    radius: 50,
    stage: "start",
    narrative: "As you explore the area, a glint of something metallic catches your eye. You dig through the soil to uncover an old metal container. Inside, you find a weathered map of Tampere with strange markings. The parchment feels unnaturally cold to the touch, and the ink seems to shimmer slightly in the light. The markings appear to be in some ancient language, but as you trace your fingers over them, whispered words fill your mind. The map reveals two locations of particular interest, marked with symbols that burn themselves into your memory."
  },
  {
    id: "first_stage_point",
    name: "Mysterious Shrine",
    type: "story",
    latitude: "61.47582680415461",
    longitude: "23.723975072631173", 
    radius: 50,
    stage: "start",
    narrative: "The map leads you to what appears to be an ancient shrine hidden among the trees. The stone structure is covered in moss and strange symbols that match those on your map. You feel a strange buzzing sensation at the base of your skull as you approach."
  },
  {
    id: "first_secret_point",
    name: "Hidden Artifacts",
    type: "secret",
    latitude: "61.475960400531555",
    longitude: "23.72449172100575",
    radius: 30,
    stage: "start",
    itemId: "ancient_relic",
    narrative: "Behind the shrine, partially buried beneath roots and soil, you discover a small stone box. Inside is an artifact of unknown origin - a small figurine carved from some black stone that seems to absorb light. It depicts a creature with too many limbs and features that don't quite make sense to the human eye."
  },
  {
    id: "pyynikki_tower",
    name: "Pyynikki Observation Tower",
    type: "story",
    latitude: "61.4954",
    longitude: "23.7271",
    radius: 50,
    stage: "1",
    narrative: "At the top of the historic Pyynikki Observation Tower, you find a weathered journal hidden behind a loose panel. It contains bizarre sketches of the nearby lake Näsijärvi and references to 'ancient dwellers beneath the dark waters' and strange sounds from Tammerkoski rapids."
  },
  {
    id: "hidden_tome",
    name: "Ancient Finnish Text",
    type: "secret",
    latitude: "61.4965",
    longitude: "23.7295",
    radius: 30,
    stage: "start",
    itemId: "wisdom",
    narrative: "In a forgotten maintenance room of the observation tower, you discover a leather-bound tome written in archaic Finnish. The pages contain folk legends about water spirits and forest deities that predate Christianity in the region."
  },
  {
    id: "tampere_cathedral",
    name: "Tampere Cathedral",
    type: "story",
    latitude: "61.5016",
    longitude: "23.7605",
    radius: 40,
    stage: "1",
    narrative: "The normally serene Tampere Cathedral feels different today. You notice strange symbols etched into the woodwork, hidden among Hugo Simberg's famous frescoes. The 'Garden of Death' painting seems to move slightly when no one is looking directly at it."
  },
  {
    id: "strange_relic",
    name: "Carved Stone Relic",
    type: "secret",
    latitude: "61.5018",
    longitude: "23.7610",
    radius: 25,
    stage: "1",
    itemId: "relic",
    narrative: "Hidden in a dark corner of the cathedral basement, you find a small stone carving that doesn't match the Christian imagery. It depicts a tentacled entity rising from lake waters. The stone feels unnaturally cold to the touch."
  },
  {
    id: "finlayson_area",
    name: "Finlayson Factory Complex",
    type: "story",
    latitude: "61.5009",
    longitude: "23.7450",
    radius: 45,
    stage: "2",
    narrative: "The historic factory buildings by Tammerkoski rapids hide a network of tunnels beneath. Old factory workers' journals speak of strange sounds from below the water and mysterious disappearances during the industrial revolution."
  },
  {
    id: "ancient_key",
    name: "Factory Master's Key",
    type: "secret",
    latitude: "61.5014",
    longitude: "23.7460",
    radius: 30,
    stage: "2",
    itemId: "key",
    narrative: "In a rusted old locker, you find an ornate brass key with tentacle-like protrusions. Inscribed with symbols similar to those you've seen before, it feels heavy with dread significance."
  },
  {
    id: "underground_tunnels",
    name: "Tammerkoski Tunnels",
    type: "story",
    latitude: "61.4980",
    longitude: "23.7590",
    radius: 40,
    stage: "3",
    narrative: "The underground tunnels near Tammerkoski are illuminated by strange bioluminescent growths. Ancient stone carvings depict human-like figures transforming into aquatic creatures. The rushing water seems to carry whispers in an unknown language."
  },
  {
    id: "ritual_chamber",
    name: "Subterranean Chamber",
    type: "story",
    latitude: "61.4953",
    longitude: "23.7610",
    radius: 40,
    stage: "final",
    narrative: "A vast chamber opens beneath the city, predating human settlement. Robed figures perform an ancient ritual around a pool that seems to drop endlessly into darkness. The walls are carved with scenes of cosmic entities and human supplication."
  },
  {
    id: "entity_vision",
    name: "Näsijärvi Vision",
    type: "cutscene",
    latitude: "61.5030",
    longitude: "23.7520",
    radius: 35,
    stage: "3",
    cutsceneData: {
      id: "lake_vision",
      title: "Visions from the Finnish Deep",
      text: "Standing by the shore of Näsijärvi, the lake water becomes unnaturally still. Your reflection distorts, replaced by visions of an ancient time when strange beings rose from the waters to interact with early Finnish settlers.",
      additionalText: "The visions show rituals performed on these shores for centuries, and how the entities beneath the lake influenced Finnish mythology. You realize with horror that the tales of 'Näkki' water spirits were based on real encounters."
    }
  },
  {
    id: "final_revelation",
    name: "The Awakening",
    type: "cutscene",
    latitude: "61.4940",
    longitude: "23.7615",
    radius: 35,
    stage: "final",
    cutsceneData: {
      id: "cosmic_horror",
      title: "Horror from Cosmic Depths",
      text: "The ritual reaches its peak as the pool's water parts to reveal something ancient rising from below. Your mind struggles to comprehend the vast, alien form - a mass of scales, eyes, and appendages that should not exist in our reality.",
      additionalText: "As your sanity threatens to break, you understand that Finnish folklore wasn't metaphorical. The entities venerated as nature deities by ancient Finns were glimpses of cosmic beings that existed long before humans and will remain long after our civilization ends."
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
