// Define window.AudioContext or webkitAudioContext as a fallback
interface AudioContextConstructor {
  new (): AudioContext;
}

// Declare type for browser audio context
type BrowserAudioContext = AudioContext;

// Audio context for more control
let audioContext: BrowserAudioContext | null = null;

// Store active sound sources
const activeSounds: Record<string, { 
  element: HTMLAudioElement, 
  source?: MediaElementAudioSourceNode 
}> = {};

/**
 * Initialize audio context (must be called after user interaction)
 */
export const InitAudio = (): void => {
  if (!audioContext) {
    try {
      // Modern browsers
      if (window.AudioContext) {
        audioContext = new window.AudioContext();
      } 
      // Safari and older browsers
      else if ((window as any).webkitAudioContext) {
        const WebkitAudioContext = (window as any).webkitAudioContext as AudioContextConstructor;
        audioContext = new WebkitAudioContext();
      }
      // If neither exists, log an error
      else {
        console.warn('Web Audio API is not supported in this browser');
      }
    } catch (e) {
      console.warn('Failed to initialize audio context:', e);
    }
  }
};

/**
 * Play a sound effect or ambient sound
 * @param id Unique identifier for the sound
 * @param url URL of the sound file
 * @param loop Whether to loop the sound
 * @param volume Volume level (0-1)
 */
export const PlaySound = (
  id: string, 
  url: string, 
  loop: boolean = false, 
  volume: number = 1.0
): void => {
  // Ensure audio context is initialized first - try to handle autoplay restrictions
  if (!audioContext) {
    try {
      InitAudio();
    } catch (e) {
      console.warn('Could not initialize audio context:', e);
      return; // Exit gracefully without playing sound
    }
  }
  
  // Audio might need user interaction first - handle suspended state
  if (audioContext && audioContext.state === 'suspended') {
    console.log('Audio context suspended. Waiting for user interaction.');
    
    // Add a one-time event listener to resume on next user interaction
    const resumeAudioOnInteraction = () => {
      ResumeAudioContext();
      document.removeEventListener('click', resumeAudioOnInteraction);
      document.removeEventListener('touchstart', resumeAudioOnInteraction);
      document.removeEventListener('keydown', resumeAudioOnInteraction);
    };
    
    document.addEventListener('click', resumeAudioOnInteraction);
    document.addEventListener('touchstart', resumeAudioOnInteraction);
    document.addEventListener('keydown', resumeAudioOnInteraction);
    
    // For now, just silently return without error
    return;
  }
  
  // Stop any existing sound with the same ID
  StopSound(id);
  
  try {
    // Create audio element
    const audioElement = new Audio();
    
    // Set up event listeners for errors before setting src
    audioElement.addEventListener('error', (e) => {
      console.warn(`Error loading audio file for ${id}:`, e);
      delete activeSounds[id];
    });
    
    // Configure audio properties
    audioElement.src = url;
    audioElement.loop = loop;
    audioElement.volume = volume;
    audioElement.crossOrigin = 'anonymous'; // Try to avoid CORS issues
    
    // Store reference
    activeSounds[id] = { element: audioElement };
    
    // Set up with audio context if available - do this before playing
    if (audioContext && audioContext.state === 'running') {
      try {
        const source = audioContext.createMediaElementSource(audioElement);
        const gainNode = audioContext.createGain();
        gainNode.gain.value = volume;
        
        source.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        activeSounds[id].source = source;
      } catch (error) {
        console.warn(`Could not connect audio to context for ${id}:`, error);
        // Continue anyway with basic HTML5 Audio
      }
    }
    
    // Play the sound
    const playPromise = audioElement.play();
    
    // Handle play promise (required for modern browsers)
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        // This is common due to autoplay restrictions, so downgrade to warning
        console.warn(`Could not play sound ${id} (likely due to browser autoplay policy):`, error);
        delete activeSounds[id];
      });
    }
  } catch (error) {
    console.warn(`Error setting up sound ${id}:`, error);
  }
};

/**
 * Stop a currently playing sound
 * @param id Identifier of the sound to stop
 */
export const StopSound = (id: string): void => {
  if (activeSounds[id]) {
    try {
      activeSounds[id].element.pause();
      activeSounds[id].element.currentTime = 0;
      delete activeSounds[id];
    } catch (error) {
      console.error(`Error stopping sound ${id}:`, error);
    }
  }
};

/**
 * Adjust volume of a playing sound
 * @param id Identifier of the sound
 * @param volume New volume level (0-1)
 */
export const SetVolume = (id: string, volume: number): void => {
  if (activeSounds[id]) {
    try {
      activeSounds[id].element.volume = volume;
    } catch (error) {
      console.error(`Error setting volume for ${id}:`, error);
    }
  }
};

/**
 * Stop all currently playing sounds
 */
export const StopAllSounds = (): void => {
  Object.keys(activeSounds).forEach(id => {
    StopSound(id);
  });
};

/**
 * Check if audio context is running, and resume if suspended
 * @returns Promise resolving to true if resume was successful or not needed, false otherwise
 */
export const ResumeAudioContext = async (): Promise<boolean> => {
  if (!audioContext) {
    try {
      InitAudio();
      console.log('Audio context created in ResumeAudioContext');
    } catch (e) {
      console.warn('Failed to initialize audio context:', e);
      return false;
    }
  }
  
  if (audioContext && audioContext.state === 'suspended') {
    try {
      await audioContext.resume();
      console.log('Audio context resumed successfully');
      return true;
    } catch (error) {
      console.warn('Could not resume audio context:', error);
      return false;
    }
  }
  
  return true; // Context is already running or not needed
};
