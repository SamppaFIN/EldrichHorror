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
  source?: MediaElementAudioSourceNode,
  gainNode?: GainNode,
  filterNode?: BiquadFilterNode,
  pannerNode?: StereoPannerNode
}> = {};

// Store effects nodes
let masterGainNode: GainNode | null = null;
let masterFilterNode: BiquadFilterNode | null = null;
let sanityEffectsActive: boolean = false;

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
        
        // Create a filter node for effects
        const filterNode = audioContext.createBiquadFilter();
        filterNode.type = 'lowpass';
        filterNode.frequency.value = 22050; // Default to maximum frequency (no filtering)
        
        // Create a stereo panner for spatial effects
        const pannerNode = audioContext.createStereoPanner();
        pannerNode.pan.value = 0; // Center panning by default
        
        // Connect the audio nodes
        source.connect(gainNode);
        gainNode.connect(filterNode);
        filterNode.connect(pannerNode);
        
        // If sanity effects are active, connect to master effects chain
        // Otherwise connect directly to destination
        if (sanityEffectsActive && masterFilterNode && masterGainNode) {
          pannerNode.connect(masterFilterNode);
        } else {
          pannerNode.connect(audioContext.destination);
        }
        
        // Store all nodes
        activeSounds[id] = { 
          element: audioElement, 
          source: source,
          gainNode: gainNode,
          filterNode: filterNode,
          pannerNode: pannerNode
        };
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
 * Apply audio effects based on sanity level to create an immersive experience
 * @param sanity Player's sanity level (0-100)
 */
export const ApplySanityAudioEffects = (sanity: number): void => {
  if (!audioContext || audioContext.state !== 'running') {
    return; // Audio context isn't ready
  }
  
  // Define thresholds (should match the visual effects)
  const MILD_THRESHOLD = 60;
  const MODERATE_THRESHOLD = 40;
  const SEVERE_THRESHOLD = 20;
  const CRITICAL_THRESHOLD = 10;
  
  try {
    // Initialize master effect nodes if they don't exist
    if (!masterGainNode && audioContext) {
      masterGainNode = audioContext.createGain();
      masterGainNode.gain.value = 1.0;
    }
    
    if (!masterFilterNode && audioContext && masterGainNode) {
      masterFilterNode = audioContext.createBiquadFilter();
      masterFilterNode.type = 'lowpass';
      masterFilterNode.frequency.value = 22050; // Default to maximum (no filtering)
      
      // Connect the master effects chain
      masterFilterNode.connect(masterGainNode);
      masterGainNode.connect(audioContext.destination);
    }
    
    // Apply effects based on sanity level
    if (sanity <= MILD_THRESHOLD && audioContext) {
      // Enable sanity effects if not already active
      if (!sanityEffectsActive) {
        sanityEffectsActive = true;
        
        // Reconnect all active sounds to the master effects chain
        Object.values(activeSounds).forEach(sound => {
          if (sound.pannerNode && masterFilterNode) {
            // Disconnect from destination first
            try {
              sound.pannerNode.disconnect();
              // Connect to master effects chain
              sound.pannerNode.connect(masterFilterNode);
            } catch (e) {
              // Might already be connected or disconnected
            }
          }
        });
      }
      
      const currentTime = audioContext.currentTime;
      
      // Mild effects (60-41%)
      if (sanity > MODERATE_THRESHOLD) {
        // Subtle frequency filtering
        if (masterFilterNode) {
          masterFilterNode.frequency.setTargetAtTime(20000, currentTime, 0.5);
        }
        
        // Random subtle panning
        Object.values(activeSounds).forEach(sound => {
          if (sound.pannerNode) {
            const randomPan = (Math.random() * 0.2) - 0.1; // -0.1 to 0.1
            sound.pannerNode.pan.setTargetAtTime(randomPan, currentTime, 1);
          }
        });
      } 
      // Moderate effects (40-21%)
      else if (sanity > SEVERE_THRESHOLD) {
        // More noticeable frequency filtering
        if (masterFilterNode) {
          masterFilterNode.frequency.setTargetAtTime(15000, currentTime, 0.5);
        }
        
        // More pronounced random panning
        Object.values(activeSounds).forEach(sound => {
          if (sound.pannerNode) {
            const randomPan = (Math.random() * 0.4) - 0.2; // -0.2 to 0.2
            sound.pannerNode.pan.setTargetAtTime(randomPan, currentTime, 0.8);
          }
        });
        
        // Play whisper effect occasionally
        if (Math.random() < 0.05) { // 5% chance every time this function is called
          playWhisperEffect();
        }
      }
      // Severe effects (20-11%)
      else if (sanity > CRITICAL_THRESHOLD) {
        // Heavy filtering
        if (masterFilterNode) {
          masterFilterNode.frequency.setTargetAtTime(10000, currentTime, 0.3);
        }
        
        // Dramatic panning
        Object.values(activeSounds).forEach(sound => {
          if (sound.pannerNode) {
            const randomPan = (Math.random() * 0.8) - 0.4; // -0.4 to 0.4
            sound.pannerNode.pan.setTargetAtTime(randomPan, currentTime, 0.5);
          }
        });
        
        // Play whisper effect more frequently
        if (Math.random() < 0.15) { // 15% chance
          playWhisperEffect();
        }
      }
      // Critical effects (10-0%)
      else {
        // Extreme filtering and distortion
        if (masterFilterNode) {
          masterFilterNode.frequency.setTargetAtTime(6000, currentTime, 0.2);
        }
        
        // Extreme panning
        Object.values(activeSounds).forEach(sound => {
          if (sound.pannerNode) {
            const randomPan = (Math.random() * 1.6) - 0.8; // -0.8 to 0.8
            sound.pannerNode.pan.setTargetAtTime(randomPan, currentTime, 0.3);
          }
        });
        
        // Play whisper effects very frequently
        if (Math.random() < 0.3) { // 30% chance
          playWhisperEffect();
        }
      }
    } else if (audioContext) {
      // Reset effects if sanity is above threshold
      if (sanityEffectsActive) {
        sanityEffectsActive = false;
        
        // Reset filter
        if (masterFilterNode) {
          masterFilterNode.frequency.setTargetAtTime(22050, audioContext.currentTime, 0.5);
        }
        
        // Reset all panners and reconnect to destination
        Object.values(activeSounds).forEach(sound => {
          if (sound.pannerNode && audioContext) {
            try {
              // Reset panning
              sound.pannerNode.pan.setTargetAtTime(0, audioContext.currentTime, 0.5);
              
              // Reconnect to destination
              sound.pannerNode.disconnect();
              sound.pannerNode.connect(audioContext.destination);
            } catch (e) {
              // Might already be connected or disconnected
            }
          }
        });
      }
    }
  } catch (error) {
    console.warn('Error applying sanity audio effects:', error);
  }
};

/**
 * Play a whisper sound effect for low sanity
 */
const playWhisperEffect = (): void => {
  if (!audioContext) return;
  
  try {
    // Create oscillator for a spooky tone
    const oscillator = audioContext.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.value = 300 + Math.random() * 200; // 300-500Hz
    
    // Create gain node for volume
    const gainNode = audioContext.createGain();
    gainNode.gain.value = 0;
    
    // Create filter for tone shaping
    const filterNode = audioContext.createBiquadFilter();
    filterNode.type = 'bandpass';
    filterNode.frequency.value = 1000 + Math.random() * 1000; // 1000-2000Hz
    filterNode.Q.value = 10; // Narrow band for ghostly effect
    
    // Create panner for spatial effect
    const pannerNode = audioContext.createStereoPanner();
    pannerNode.pan.value = Math.random() * 2 - 1; // -1 to 1
    
    // Connect nodes
    oscillator.connect(gainNode);
    gainNode.connect(filterNode);
    filterNode.connect(pannerNode);
    
    // Only connect to destination if audioContext exists
    if (audioContext) {
      pannerNode.connect(audioContext.destination);
      
      // Schedule parameter changes
      const now = audioContext.currentTime;
      const duration = 1 + Math.random() * 2; // 1-3 seconds
      
      // Fade in
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.05, now + 0.1); // Very quiet
      
      // Random frequency modulation
      const freqChanges = Math.floor(Math.random() * 5) + 3; // 3-7 changes
      for (let i = 0; i < freqChanges; i++) {
        const time = now + (duration * i / freqChanges);
        const freq = 200 + Math.random() * 300;
        oscillator.frequency.exponentialRampToValueAtTime(freq, time);
      }
      
      // Fade out
      gainNode.gain.linearRampToValueAtTime(0, now + duration);
      
      // Start and stop
      oscillator.start(now);
      oscillator.stop(now + duration);
    }
  } catch (error) {
    console.warn('Error playing whisper effect:', error);
  }
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
