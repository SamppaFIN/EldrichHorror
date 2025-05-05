import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import BlogPage from "@/pages/blog";
import { GameProvider, useGameContext } from "@/context/GameContext";
import { useEffect, useRef } from "react";

// FPS counter component
function FPSCounter() {
  const fpsRef = useRef<HTMLDivElement>(null);
  const frameCountRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(performance.now());
  
  useEffect(() => {
    let animationFrameId: number;
    
    const updateFPS = () => {
      const now = performance.now();
      frameCountRef.current++;
      
      if (now - lastTimeRef.current >= 1000) {
        if (fpsRef.current) {
          const fps = Math.round((frameCountRef.current * 1000) / (now - lastTimeRef.current));
          fpsRef.current.textContent = `${fps} FPS`;
        }
        frameCountRef.current = 0;
        lastTimeRef.current = now;
      }
      
      animationFrameId = requestAnimationFrame(updateFPS);
    };
    
    updateFPS();
    
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);
  
  return (
    <div 
      ref={fpsRef} 
      className="fixed top-0 left-0 z-50 bg-black/70 text-white text-xs px-2 py-1 rounded-br"
    >
      0 FPS
    </div>
  );
}

function PerformanceModeManager() {
  const { gameState } = useGameContext();
  
  // Apply performance mode class to body when it's enabled
  useEffect(() => {
    if (gameState.performanceMode) {
      document.body.classList.add('performance-mode');
      
      // Additional performance optimizations for mobile
      if (window.innerWidth < 768) {
        // Reduce animation frames for background processes
        const style = document.createElement('style');
        style.id = 'performance-mode-styles';
        style.innerHTML = `
          * {
            animation-duration: 0s !important;
            transition-duration: 0s !important;
          }
          .map-container {
            transform: translate3d(0,0,0);
            backface-visibility: hidden;
            perspective: 1000;
          }
          .player-marker, .location-marker {
            animation: none !important;
          }
        `;
        document.head.appendChild(style);
      }
    } else {
      document.body.classList.remove('performance-mode');
      
      // Remove additional styles when disabling performance mode
      const performanceStyles = document.getElementById('performance-mode-styles');
      if (performanceStyles) {
        performanceStyles.remove();
      }
    }
  }, [gameState.performanceMode]);
  
  return null;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home}/>
      <Route path="/blog" component={BlogPage}/>
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <GameProvider>
        <FPSCounter />
        <PerformanceModeManager />
        <Router />
        <Toaster />
      </GameProvider>
    </QueryClientProvider>
  );
}

export default App;
