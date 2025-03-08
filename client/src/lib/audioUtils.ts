// Audio context for more control
let audioContext: AudioContext | null = null;

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
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
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
  // Stop any existing sound with the same ID
  StopSound(id);
  
  try {
    // Create audio element
    const audioElement = new Audio(url);
    audioElement.loop = loop;
    audioElement.volume = volume;
    
    // Store reference
    activeSounds[id] = { element: audioElement };
    
    // Play the sound
    const playPromise = audioElement.play();
    
    // Handle play promise (required for modern browsers)
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.error(`Error playing sound ${id}:`, error);
        // Remove from active sounds if it failed to play
        delete activeSounds[id];
      });
    }
    
    // Set up with audio context if available
    if (audioContext) {
      const source = audioContext.createMediaElementSource(audioElement);
      const gainNode = audioContext.createGain();
      gainNode.gain.value = volume;
      
      source.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      activeSounds[id].source = source;
    }
  } catch (error) {
    console.error(`Error setting up sound ${id}:`, error);
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
 */
export const ResumeAudioContext = async (): Promise<void> => {
  if (audioContext && audioContext.state === 'suspended') {
    try {
      await audioContext.resume();
    } catch (error) {
      console.error('Error resuming audio context:', error);
    }
  }
};
