import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertHighscoreSchema, insertBlogPostSchema } from "@shared/schema";
import { ValidationError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Game Locations API
  app.get("/api/locations", async (req, res) => {
    try {
      const locations = await storage.getLocations();
      
      // Transform DB data to front-end format
      const formattedLocations = locations.map(loc => ({
        id: loc.id,
        name: loc.name,
        type: loc.type,
        lat: parseFloat(loc.latitude),
        lng: parseFloat(loc.longitude),
        radius: loc.radius,
        stage: loc.stage,
        narrative: loc.narrative,
        itemId: loc.itemId,
        cutscene: loc.cutsceneData
      }));
      
      res.json(formattedLocations);
    } catch (error) {
      console.error("Error fetching locations:", error);
      res.status(500).json({ message: "Failed to fetch locations" });
    }
  });

  // Game Progress API
  app.get("/api/progress/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId, 10);
      const progress = await storage.getGameProgress(userId);
      
      if (!progress) {
        return res.status(404).json({ message: "No saved game found" });
      }
      
      res.json(progress);
    } catch (error) {
      console.error("Error fetching game progress:", error);
      res.status(500).json({ message: "Failed to fetch game progress" });
    }
  });

  app.post("/api/progress", async (req, res) => {
    try {
      const progress = await storage.saveGameProgress(req.body);
      res.status(201).json(progress);
    } catch (error) {
      console.error("Error saving game progress:", error);
      res.status(500).json({ message: "Failed to save game progress" });
    }
  });

  // Highscores API
  app.get("/api/highscores", async (req, res) => {
    try {
      const highscores = await storage.getHighscores();
      res.json(highscores);
    } catch (error) {
      console.error("Error fetching highscores:", error);
      res.status(500).json({ message: "Failed to fetch highscores" });
    }
  });

  app.post("/api/highscores", async (req, res) => {
    try {
      // Validate request body
      const validationResult = insertHighscoreSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        const validationError = new ValidationError(validationResult.error);
        return res.status(400).json({ message: validationError.message });
      }
      
      const highscore = await storage.saveHighscore(req.body);
      res.status(201).json(highscore);
    } catch (error) {
      console.error("Error saving highscore:", error);
      res.status(500).json({ message: "Failed to save highscore" });
    }
  });
  
  // Blog Posts API
  app.get("/api/blog-posts", async (req, res) => {
    try {
      const blogPosts = await storage.getBlogPosts();
      res.json(blogPosts);
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      res.status(500).json({ message: "Failed to fetch blog posts" });
    }
  });
  
  app.get("/api/blog-posts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const blogPost = await storage.getBlogPostById(id);
      
      if (!blogPost) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      
      res.json(blogPost);
    } catch (error) {
      console.error("Error fetching blog post:", error);
      res.status(500).json({ message: "Failed to fetch blog post" });
    }
  });
  
  app.post("/api/blog-posts", async (req, res) => {
    try {
      // Validate request body
      const validationResult = insertBlogPostSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        const validationError = new ValidationError(validationResult.error);
        return res.status(400).json({ message: validationError.message });
      }
      
      const blogPost = await storage.createBlogPost(req.body);
      res.status(201).json(blogPost);
    } catch (error) {
      console.error("Error creating blog post:", error);
      res.status(500).json({ message: "Failed to create blog post" });
    }
  });

  // Initialize the HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
