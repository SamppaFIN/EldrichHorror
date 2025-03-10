import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

// Visual Overlays
export const GameOverlays = () => {
  return (
    <>
      <div className="absolute top-0 left-0 w-full h-full bg-[repeating-linear-gradient(rgba(0,0,0,0.1),rgba(0,0,0,0.1)_1px,transparent_1px,transparent_2px)] pointer-events-none z-[100] opacity-30"></div>
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-[101] opacity-5 mix-blend-overlay bg-[url('data:image/png;base64,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')]"></div>
      <div className="absolute top-0 left-0 w-full h-full shadow-[inset_0_0_150px_rgba(0,0,0,0.7)] pointer-events-none z-[102]"></div>
    </>
  );
};

// Progress Bars
type ProgressBarProps = {
  type: 'health' | 'sanity';
  value: number;
};

export const ProgressBar = ({ type, value }: ProgressBarProps) => {
  const fillClass = type === 'health' 
    ? 'bg-gradient-to-r from-[#b71c1c] via-[#f57f17] to-[#2e7d32] bg-[length:200%_100%]'
    : 'bg-gradient-to-r from-[#4a148c] via-[#6a1b9a] to-[#1565c0] bg-[length:200%_100%]';
  
  // Calculate background position based on value (100% - value to invert direction)
  const bgPosition = `${100 - value}% 0`;
  
  return (
    <div className="relative h-5 w-full rounded overflow-hidden bg-black/30 shadow-[inset_0_0_5px_rgba(0,0,0,0.5)]">
      <div 
        className={cn("h-full transition-all duration-300 ease-in-out", fillClass)} 
        style={{ 
          width: `${value}%`,
          backgroundPosition: bgPosition
        }}
      ></div>
    </div>
  );
};

// Buttons
type PixelButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
};

export const PixelButton = ({ 
  children, 
  onClick, 
  className, 
  disabled = false,
  size = 'md'
}: PixelButtonProps) => {
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-5 py-2.5',
    lg: 'px-6 py-3 text-xl'
  };

  return (
    <button
      className={cn(
        "font-header bg-[#1a3a3a] border-2 border-[#e8e0c9] text-[#e8e0c9] uppercase tracking-wider transition-all duration-200 relative overflow-hidden",
        "hover:bg-[#2d1b2d] hover:-translate-y-0.5 hover:shadow-[0_5px_15px_rgba(0,0,0,0.3)]",
        "active:translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none",
        sizeClasses[size],
        className
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

type ChoiceButtonProps = {
  title: string;
  description: string;
  affects: 'health' | 'sanity';
  cost: number;
  onClick: () => void;
};

export const ChoiceButton = ({ title, description, affects, cost, onClick }: ChoiceButtonProps) => {
  return (
    <button
      className="bg-[#2d1b2d]/80 border border-[#e8e0c9] p-3 text-left transition-all duration-300 relative overflow-hidden
                hover:bg-[#1a3a3a]/90 hover:shadow-[0_0_15px_rgba(139,0,0,0.5)]
                hover:after:content-[''] hover:after:absolute hover:after:inset-0 hover:after:bg-gradient-to-r hover:after:from-transparent hover:after:via-white/10 hover:after:to-transparent 
                hover:after:animate-sheen"
      onClick={onClick}
      data-affects={affects}
      data-cost={cost}
    >
      <span className="font-bold block">{title}</span>
      <span className="block text-sm opacity-80">{description} (Costs {affects === 'health' ? 'Health' : 'Sanity'})</span>
    </button>
  );
};

type InventoryItemProps = {
  name: string;
  iconPath: string;
  discovered: boolean;
};

export const InventoryItem = ({ name, iconPath, discovered }: InventoryItemProps) => {
  return (
    <div className={cn(
      "inventory-item p-2 aspect-square flex flex-col items-center justify-center", 
      !discovered && "opacity-30"
    )}>
      <div className="w-10 h-10 flex items-center justify-center mb-1">
        <span className="text-[#e8e0c9] w-8 h-8" dangerouslySetInnerHTML={{ __html: iconPath }} />
      </div>
      <span className="text-xs text-center">{name}</span>
    </div>
  );
};

// Import audio utilities
import { ApplySanityAudioEffects, ResumeAudioContext } from '@/lib/audioUtils';

// Sanity Effect
export const SanityEffect = ({ sanity }: { sanity: number }) => {
  
  // Define sanity thresholds
  const MILD_THRESHOLD = 60;
  const MODERATE_THRESHOLD = 40;
  const SEVERE_THRESHOLD = 20;
  const CRITICAL_THRESHOLD = 10;
  
  // State for visual effects
  const [vignette, setVignette] = useState<string>('');
  const [blurAmount, setBlurAmount] = useState<string>('');
  const [saturation, setSaturation] = useState<string>('');
  const [pulseSpeed, setPulseSpeed] = useState<string>('');
  const [hallucinations, setHallucinations] = useState<boolean>(false);
  const [tiltEffect, setTiltEffect] = useState<boolean>(false);
  const [hallucinationText, setHallucinationText] = useState<string[]>([]);
  const [distortionEffect, setDistortionEffect] = useState<boolean>(false);
  
  // Random positions for hallucination elements
  const [randomPositions, setRandomPositions] = useState<{top: string, left: string, rotate: string}[]>([]);
  
  // Creepy whispers that can appear at low sanity
  const creepyWhispers = [
    "they're watching",
    "don't look behind you",
    "it knows your name",
    "the walls have eyes",
    "the shadows move",
    "they're coming",
    "run while you can",
    "there's no escape",
    "it follows you",
    "listen closely",
    "something crawls",
    "see it yet?",
    "in your head",
    "secrets below",
    "ancient whispers"
  ];
  
  // Resume audio context when component mounts
  useEffect(() => {
    const initAudio = async () => {
      await ResumeAudioContext();
    };
    
    initAudio();
  }, []);
  
  // Update effects based on sanity level
  useEffect(() => {
    // Apply audio effects
    ApplySanityAudioEffects(sanity);
    
    // Reset all effects
    if (sanity > MILD_THRESHOLD) {
      setVignette('');
      setBlurAmount('');
      setSaturation('');
      setPulseSpeed('');
      setHallucinations(false);
      setTiltEffect(false);
      setDistortionEffect(false);
      return;
    }
    
    // Apply mild effects (60-41%)
    if (sanity <= MILD_THRESHOLD && sanity > MODERATE_THRESHOLD) {
      setVignette('0 0 100px 40px rgba(74, 20, 140, 0.25) inset');
      setBlurAmount('0px');
      setSaturation('90%');
      setPulseSpeed('animate-pulse-slow');
      setHallucinations(false);
      setTiltEffect(false);
      setDistortionEffect(false);
    }
    
    // Apply moderate effects (40-21%)
    else if (sanity <= MODERATE_THRESHOLD && sanity > SEVERE_THRESHOLD) {
      setVignette('0 0 120px 60px rgba(74, 20, 140, 0.4) inset');
      setBlurAmount('0.5px');
      setSaturation('70%');
      setPulseSpeed('animate-pulse-medium');
      setHallucinations(true);
      setTiltEffect(false);
      setDistortionEffect(false);
      
      // Generate random hallucination text at this level
      const textCount = Math.floor((MODERATE_THRESHOLD - sanity) / 5) + 1; // 1-4 whispers
      const newWhispers = Array(textCount).fill(0).map(() => 
        creepyWhispers[Math.floor(Math.random() * creepyWhispers.length)]
      );
      setHallucinationText(newWhispers);
      
      // Generate random positions for hallucinations
      generateRandomPositions(textCount);
    }
    
    // Apply severe effects (20-11%)
    else if (sanity <= SEVERE_THRESHOLD && sanity > CRITICAL_THRESHOLD) {
      setVignette('0 0 140px 80px rgba(74, 20, 140, 0.6) inset');
      setBlurAmount('1px');
      setSaturation('50%');
      setPulseSpeed('animate-pulse-fast');
      setHallucinations(true);
      setTiltEffect(true);
      setDistortionEffect(false);
      
      // Generate more random hallucination text at this level
      const textCount = Math.floor((SEVERE_THRESHOLD - sanity) / 3) + 3; // 3-6 whispers
      const newWhispers = Array(textCount).fill(0).map(() => 
        creepyWhispers[Math.floor(Math.random() * creepyWhispers.length)]
      );
      setHallucinationText(newWhispers);
      
      // Generate random positions for hallucinations
      generateRandomPositions(textCount);
    }
    
    // Apply critical effects (10-0%)
    else if (sanity <= CRITICAL_THRESHOLD) {
      setVignette('0 0 160px 100px rgba(74, 20, 140, 0.8) inset');
      setBlurAmount('2px');
      setSaturation('30%');
      setPulseSpeed('animate-pulse-very-fast');
      setHallucinations(true);
      setTiltEffect(true);
      setDistortionEffect(true);
      
      // Generate even more random hallucination text at this level
      const textCount = Math.floor((CRITICAL_THRESHOLD - sanity) / 2) + 5; // 5-10 whispers
      const newWhispers = Array(textCount).fill(0).map(() => 
        creepyWhispers[Math.floor(Math.random() * creepyWhispers.length)]
      );
      setHallucinationText(newWhispers);
      
      // Generate random positions for hallucinations
      generateRandomPositions(textCount);
    }
  }, [sanity, ApplySanityAudioEffects]);
  
  // Generate random positions for hallucination elements
  const generateRandomPositions = (count: number) => {
    const positions = [];
    for (let i = 0; i < count; i++) {
      positions.push({
        top: `${Math.random() * 80 + 10}%`,
        left: `${Math.random() * 80 + 10}%`,
        rotate: `${Math.random() * 40 - 20}deg`
      });
    }
    setRandomPositions(positions);
  };
  
  // If no effects should be applied, return null
  if (!vignette) return null;
  
  return (
    <>
      {/* Main filter overlay */}
      <div 
        className={`fixed inset-0 pointer-events-none z-[103] ${pulseSpeed}`}
        style={{
          boxShadow: vignette,
          filter: `blur(${blurAmount}) saturate(${saturation})`,
          backgroundImage: 'radial-gradient(circle, transparent 60%, rgba(74, 20, 140, 0.1) 100%)'
        }}
      />
      
      {/* Screen tilt effect for severe conditions */}
      {tiltEffect && (
        <div 
          className="fixed inset-0 pointer-events-none z-[102] animate-slow-tilt"
          style={{
            backgroundImage: 'linear-gradient(135deg, rgba(74, 20, 140, 0.1), transparent, rgba(74, 20, 140, 0.1))',
          }}
        />
      )}
      
      {/* Visual distortion effect for critical sanity */}
      {distortionEffect && (
        <div 
          className="fixed inset-0 pointer-events-none z-[101] animate-distortion"
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.05\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' opacity=\'0.1\'/%3E%3C/svg%3E")',
            opacity: 0.15
          }}
        />
      )}
      
      {/* Edge distortion effect for critical sanity */}
      {distortionEffect && (
        <div className="fixed inset-0 pointer-events-none z-[100]">
          <div className="absolute top-0 left-0 w-full h-[10px] bg-purple-900/10 animate-warp-top"></div>
          <div className="absolute bottom-0 left-0 w-full h-[10px] bg-purple-900/10 animate-warp-bottom"></div>
          <div className="absolute top-0 left-0 h-full w-[10px] bg-purple-900/10 animate-warp-left"></div>
          <div className="absolute top-0 right-0 h-full w-[10px] bg-purple-900/10 animate-warp-right"></div>
        </div>
      )}
      
      {/* Hallucination text */}
      {hallucinations && hallucinationText.map((text, index) => (
        <div 
          key={index}
          className="fixed pointer-events-none z-[104] text-[#4a148c] opacity-70 font-horror animate-fade-in-out"
          style={{
            top: randomPositions[index]?.top || '50%',
            left: randomPositions[index]?.left || '50%',
            transform: `translate(-50%, -50%) rotate(${randomPositions[index]?.rotate || '0deg'})`,
            textShadow: '0 0 5px rgba(0, 0, 0, 0.7)',
            fontSize: `${Math.random() * 1.5 + 1}rem`
          }}
        >
          {text}
        </div>
      ))}
    </>
  );
};

// Debug Button
type DebugButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
};

export const DebugButton = ({ children, onClick, className, disabled }: DebugButtonProps) => {
  return (
    <button
      className={cn(
        "px-3 py-1 bg-[#1a3a3a] font-interface text-sm hover:bg-[#2d1b2d] transition-colors",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
