import { 
  users, type User, type InsertUser,
  locations, type Location, type InsertLocation,
  gameProgress, type GameProgress, type InsertGameProgress,
  highscores, type Highscore, type InsertHighscore,
  blogPosts, type BlogPost, type InsertBlogPost
} from "@shared/schema";

// Default game locations in Tampere, Finland
const DEFAULT_LOCATIONS: InsertLocation[] = [
  {
    id: "start_tavern",
    name: "The Beginning",
    type: "story",
    latitude: "61.47288226220107",
    longitude: "23.726044568064356",
    radius: 50,
    stage: "start",
    narrative: "You stagger out of the tavern, the air heavy with a vile, unspeakable miasma that clogs your lungs like a festering shroud of despair. As you paw through your belongings, your trembling fingers graze a brittle, wretched scrap of parchment—older than sin, and twice as cursed. The ink writhes like a nest of dying worms, twisting into shapes that defy reason and mock your feeble attempts to read them. This is no mere map; it's a sinister enigma that gnaws at your soul with icy dread. How it slithered into your possession is a riddle wrapped in a nightmare—as if it clawed its way from some godforsaken abyss, whispering your name with a grin full of jagged teeth."
  },
  {
    id: "lake_stage1",
    name: "The Lake",
    type: "story",
    latitude: "61.47587935136278",
    longitude: "23.72405562866823", 
    radius: 50,
    stage: "1",
    narrative: "At last, you stumble upon the spot etched into that accursed map—a place of twisted, unnatural beauty, where gnarled trees loom like grim sentinels, guarding a lake so dark and still it might as well be a mirror to hell. The air hangs thick, heavy with a stench that prickles your nostrils, and a shiver claws its way down your spine as a sickly green mist oozes from the lake's surface, curling and slithering like it's plotting your demise with every tendril. A suffocating dread coils around your chest, and you can't shake the feeling that something ancient—older than the trees, older than the dirt beneath your boots—is sizing you up with unseen, pitiless eyes. Then, out of nowhere, a sharp crack rips through the silence, reverberating in the oppressive air like a skull splitting open on a butcher's block. Heart hammering like a trapped rat, you whirl around, a cold pool of terror sloshing in your gut."
  },
  {
    id: "lake_stage1_part2",
    name: "The Burning Tree",
    type: "story",
    latitude: "61.47587935136278",
    longitude: "23.72405562866823", 
    radius: 50,
    stage: "1",
    narrative: "Before you stands an ancient tree, its gnarled branches engulfed in strange, otherworldly flames that dance in shades of sickly green and pale blue. As the fire consumes it, a ghastly sound fills the air—a low, haunting wail that rises and falls, an agonized keening as if the very soul of the tree were crying out in torment. The sound burrows into your mind, clawing at your sanity with each ghostly note. A cold dread roots you in place, yet a dark curiosity tugs at you. Do you dare draw closer to this wretched spectacle, or do you flee, abandoning the anguished sentinel to its fiery fate?"
  },
  {
    id: "secret_trinket",
    name: "The Trinket",
    type: "secret",
    latitude: "61.47587380330282",
    longitude: "23.724338540905865",
    radius: 30,
    stage: "1",
    itemId: "mysterious_trinket",
    narrative: "As you claw your way up the slick, muddy incline from the lake's festering edge, your foot skids, nearly sending you tumbling back into the mire. But then, something catches your eye—a faint gleam in the sludge, a small, glinting trinket winking up at you, practically begging to be noticed. It's oddly mesmerizing, like it was planted there by some sly, invisible bastard with a sick sense of humor. Without a second thought, your grubby fingers snatch it up, closing around its cold metal surface. A heartbeat later, your senses snap into focus, the fog clouding your mind peeling back like a rotting curtain. But in its place, a queasy unease slithers in, coiling around your guts. Whatever this thing is, it feels wrong—like you've pocketed a curse that's already sizing up your soul for dinner."
  },
  {
    id: "birds_cutscene",
    name: "Strange Birds",
    type: "cutscene",
    latitude: "61.474013955184944",
    longitude: "23.731024269600276",
    radius: 50,
    stage: "1",
    cutsceneData: {
      title: "Unnatural Patterns",
      text: "The birds move strangely—flitting and wheeling in a pattern that defies the usual order of nature, as if gripped by some unseen dread. Their cries, usually bright and lively, are now twisted into shrill, discordant notes that scrape against your mind, each sound dragging your thoughts toward a lurking madness. An oppressive fear presses upon you, an echo of some nameless horror that only they can perceive.",
      sanityEffect: -10
    }
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

// Default blog posts for eldritch chronicles
const DEFAULT_BLOG_POSTS: InsertBlogPost[] = [
  {
    title: "The Forgotten History of Tampere's Eldritch Past",
    content: `
<h2>Whispers from the Past: Tampere's Eldritch History</h2>

<p>Deep in the archives of Tampere's oldest library, documents speak of strange phenomena that occurred around the city's lakes and forests centuries ago. Before industrialization transformed Tampere into Finland's manufacturing center, the region was known for unexplained disappearances and peculiar folklore.</p>

<p>In 1789, a series of journals from local residents described "lights dancing beneath the waters of Näsijärvi" and "voices that spoke in unknown tongues from the mist." These accounts coincided with unusually cold summers and reports of "shadowy figures" seen at the edges of forests.</p>

<p>The most intriguing account comes from Reverend Mikael Särkilahti, who documented his encounter with what he described as "ancient stone formations bearing symbols not made by human hands" discovered in what is now Pyynikki Ridge. His drawings of these symbols bear striking resemblance to pictographs found in much older civilizations across Northern Europe.</p>

<p>Perhaps most disturbing was his final entry: "The symbols speak to those who listen. They tell of Those Who Wait Below, ancient entities that sleep beneath the waters and earth, dreaming of their return. I fear I have learned too much, and now they know my thoughts."</p>

<p>Reverend Särkilahti disappeared shortly after this entry, and local authorities attributed his disappearance to drowning, though his body was never recovered.</p>

<p>As you explore Tampere's landmarks during your adventure, remember that the boundaries between our world and others may be thinner in certain places, especially those marked on ancient maps...</p>
`,
    author: "Professor H. Armitage",
    summary: "Exploring the mysterious historical accounts of strange phenomena in Tampere, Finland before industrialization transformed the region."
  },
  {
    title: "The Algorithm That Glimpsed Between Worlds",
    content: `
<h2>The Algorithm That Glimpsed Between Worlds</h2>

<p>In the sterile corridors of Quantum Computing Research Division, few spoke of Dr. Elena Karishov's final project. Official records indicate only equipment malfunction and data corruption, but those who worked closest to her whispered of something far more disturbing.</p>

<p>Dr. Karishov had developed an algorithm designed to process multiple dimensional mathematics - calculations beyond conventional understanding. Her notes, partially redacted in official archives, spoke of "mathematical spaces where our reality's rules bend" and "computational gateways to realms governed by alien geometries."</p>

<p>The algorithm was activated on October 17th. For exactly 3.4 seconds, every monitor in the facility displayed patterns that, according to surviving documentation, "responded to observers" and "depicted structures impossible to represent in three-dimensional space." Three researchers present during the activation reported hearing voices "from inside the mathematical spaces," though psychological evaluations were quick to dismiss these claims.</p>

<p>The central processing unit was found partially transformed into an unknown crystalline material that defied analysis. More concerning were Dr. Karishov's final notes, written in increasingly erratic handwriting:</p>

<blockquote>"It sees us. The algorithm didn't create a window—it created a mirror. What gazes back has always been watching, separated only by the thinnest mathematical membrane. They exist in the angles between dimensions, in the spaces our minds cannot perceive. And now they've seen our technological searching, reaching out across the void. The algorithm isn't dangerous because it allows us to see them. It's dangerous because it allowed them to finally see us clearly."</blockquote>

<p>The project was immediately terminated. Equipment was dismantled, research confiscated. Dr. Karishov resigned her position and was last reported living in isolation in Northern Finland, refusing all contact with former colleagues.</p>

<p>Perhaps some knowledge is better left undiscovered, some doors better left unopened. In your pursuit of ancient mysteries around Tampere, remember that curiosity has its price, and some truths cannot be unlearned once discovered...</p>
`,
    author: "Dr. William West",
    summary: "The chilling account of a quantum computing experiment that may have briefly connected with entities from beyond our dimensional understanding."
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
  
  // Blog post methods
  getBlogPosts(): Promise<BlogPost[]>;
  getBlogPostById(id: number): Promise<BlogPost | undefined>;
  createBlogPost(blogPost: InsertBlogPost): Promise<BlogPost>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private locations: Map<string, Location>;
  private progresses: Map<number, GameProgress>;
  private highscores: Highscore[];
  private blogPosts: Map<number, BlogPost>;
  private userCurrentId: number;
  private highscoreCurrentId: number;
  private progressCurrentId: number;
  private blogPostCurrentId: number;

  constructor() {
    this.users = new Map();
    this.locations = new Map();
    this.progresses = new Map();
    this.highscores = [];
    this.blogPosts = new Map();
    this.userCurrentId = 1;
    this.highscoreCurrentId = 1;
    this.progressCurrentId = 1;
    this.blogPostCurrentId = 1;
    
    // Initialize default locations
    this.initializeDefaultData();
  }
  
  private initializeDefaultData() {
    // Add default game locations
    DEFAULT_LOCATIONS.forEach(location => {
      this.locations.set(location.id, {
        ...location,
        narrative: location.narrative || null,
        itemId: location.itemId || null,
        cutsceneData: location.cutsceneData || null
      });
    });
    
    // Add default blog posts
    DEFAULT_BLOG_POSTS.forEach(blogPost => {
      const id = this.blogPostCurrentId++;
      const now = new Date();
      
      const newBlogPost: BlogPost = {
        ...blogPost,
        id,
        createdAt: now
      };
      
      this.blogPosts.set(id, newBlogPost);
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
      narrative: location.narrative || null,
      itemId: location.itemId || null,
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
  
  // Blog post methods
  async getBlogPosts(): Promise<BlogPost[]> {
    return Array.from(this.blogPosts.values()).sort((a, b) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    );
  }
  
  async getBlogPostById(id: number): Promise<BlogPost | undefined> {
    return this.blogPosts.get(id);
  }
  
  async createBlogPost(blogPost: InsertBlogPost): Promise<BlogPost> {
    const id = this.blogPostCurrentId++;
    const now = new Date();
    
    const newBlogPost: BlogPost = {
      ...blogPost,
      id,
      createdAt: now
    };
    
    this.blogPosts.set(id, newBlogPost);
    return newBlogPost;
  }
}

export const storage = new MemStorage();
