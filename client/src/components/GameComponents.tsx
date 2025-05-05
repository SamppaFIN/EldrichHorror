import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";

// Visual Overlays - conditionally render for performance mode
export const GameOverlays = ({ performanceMode = false }) => {
  if (performanceMode) {
    // Simple solid background in performance mode
    return <div className="absolute top-0 left-0 w-full h-full bg-[#1a1a1a] opacity-20 pointer-events-none z-[100]"></div>;
  }
  
  return (
    <>
      <div className="absolute top-0 left-0 w-full h-full bg-[repeating-linear-gradient(rgba(0,0,0,0.1),rgba(0,0,0,0.1)_1px,transparent_1px,transparent_2px)] pointer-events-none z-[100] opacity-30"></div>
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-[101] opacity-5 mix-blend-overlay bg-[url('data:image/png;base64,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')]"></div>
      <div className="absolute top-0 left-0 w-full h-full shadow-[inset_0_0_150px_rgba(0,0,0,0.7)] pointer-events-none z-[102]"></div>
    </>
  );
};

// FPS Meter Component
export const FPSMeter = () => {
  const [fps, setFps] = useState<number>(0);
  const frameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(performance.now());
  
  useEffect(() => {
    let animationFrameId: number;
    
    const updateFPS = () => {
      frameRef.current++;
      const now = performance.now();
      const elapsed = now - lastTimeRef.current;
      
      if (elapsed >= 1000) {
        setFps(Math.round((frameRef.current * 1000) / elapsed));
        frameRef.current = 0;
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
    <div className="fixed bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-sm z-50">
      {fps} FPS
    </div>
  );
};

// Progress Bars
type ProgressBarProps = {
  type: 'health' | 'sanity';
  value: number;
  performanceMode?: boolean;
};

export const ProgressBar = ({ type, value, performanceMode = false }: ProgressBarProps) => {
  // In performance mode, use solid colors instead of gradients
  const fillClass = performanceMode
    ? type === 'health' 
      ? 'bg-red-600' 
      : 'bg-purple-700'
    : type === 'health' 
      ? 'bg-gradient-to-r from-[#b71c1c] via-[#f57f17] to-[#2e7d32] bg-[length:200%_100%]'
      : 'bg-gradient-to-r from-[#4a148c] via-[#6a1b9a] to-[#1565c0] bg-[length:200%_100%]';
  
  // Calculate background position based on value (100% - value to invert direction)
  const bgPosition = performanceMode ? '0 0' : `${100 - value}% 0`;
  
  return (
    <div className="relative h-4 w-full rounded overflow-hidden bg-black/30 shadow-[inset_0_0_5px_rgba(0,0,0,0.5)]">
      <div 
        className={cn("h-full", performanceMode ? "" : "transition-all duration-300 ease-in-out", fillClass)} 
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
  performanceMode?: boolean;
};

export const PixelButton = ({ 
  children, 
  onClick, 
  className, 
  disabled = false,
  size = 'md',
  performanceMode = false
}: PixelButtonProps) => {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <button
      className={cn(
        "font-header bg-[#1a3a3a] border-2 border-[#e8e0c9] text-[#e8e0c9] uppercase tracking-wider relative overflow-hidden",
        !performanceMode && "transition-all duration-200 hover:bg-[#2d1b2d] hover:-translate-y-0.5 hover:shadow-[0_5px_15px_rgba(0,0,0,0.3)] active:translate-y-0.5",
        disabled && "opacity-50 cursor-not-allowed",
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
  performanceMode?: boolean;
};

export const ChoiceButton = ({ title, description, affects, cost, onClick, performanceMode = false }: ChoiceButtonProps) => {
  const isHazardous = cost > 20;
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 768);
  
  // Check for mobile view
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', checkIfMobile);
    checkIfMobile();
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);
  
  return (
    <button 
      className={`
        w-full text-left rounded border px-2 py-1.5
        ${affects === 'health' 
          ? 'border-red-700/50 bg-red-900/30 hover:bg-red-900/50' 
          : 'border-purple-700/50 bg-purple-900/30 hover:bg-purple-900/50'
        }
        ${performanceMode ? '' : 'backdrop-blur-sm transition-colors duration-200'}
      `}
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-1">
        <h4 className="font-header text-xs text-[#e8e0c9]">{title}</h4>
        <span className={`
          text-[10px] rounded-full px-1.5 py-0.5 
          ${isHazardous ? 'bg-red-900/80 text-red-100' : 'bg-gray-800/70 text-gray-300'}
          ${affects === 'health' ? 'border-red-700/50' : 'border-purple-700/50'}
        `}>
          {affects === 'health' ? 'HEALTH' : 'SANITY'} -{cost}
        </span>
      </div>
      {/* Only show description in normal mode or if screen is large enough */}
      {(!performanceMode || !isMobile) && (
        <p className="text-[10px] text-[#e8e0c9]/90 italic">{description}</p>
      )}
    </button>
  );
};

type InventoryItemProps = {
  name: string;
  iconPath: string;
  discovered: boolean;
  performanceMode?: boolean;
};

export const InventoryItem = ({ name, iconPath, discovered, performanceMode = false }: InventoryItemProps) => {
  return (
    <div 
      className={`
        inventory-item p-1.5 rounded 
        ${discovered 
          ? 'bg-[#1a3a3a]/60 border border-[#e8e0c9]/40' 
          : 'bg-[#1a1a1a]/40 border border-[#e8e0c9]/10'
        }
        ${performanceMode ? '' : 'transition-all duration-200 hover:bg-[#1a3a3a]/80'}
      `}
      title={name}
    >
      <div className="flex flex-col items-center justify-center">
        <div 
          className={`icon-container w-8 h-8 flex items-center justify-center
            ${discovered 
              ? 'text-[#e8e0c9]' 
              : 'text-[#e8e0c9]/20'
            }
          `}
          dangerouslySetInnerHTML={{ __html: iconPath }}
        />
        <div className={`
          mt-1 text-[10px] text-center
          ${discovered 
            ? 'text-[#e8e0c9]' 
            : 'text-[#e8e0c9]/20'
          }
        `}>
          {discovered ? name : '???'}
        </div>
      </div>
    </div>
  );
};

// Import audio utilities
import { ApplySanityAudioEffects, ResumeAudioContext } from '@/lib/audioUtils';

// Sanity Effect
export const SanityEffect = ({ sanity, performanceMode = false }: { sanity: number, performanceMode?: boolean }) => {
  // Skip rendering entirely in performance mode for low sanity
  if (performanceMode && sanity > 30) return null;
  
  const intensity = Math.max(0, (100 - sanity) / 100);
  
  // Simplified effect in performance mode
  if (performanceMode) {
    return (
      <div 
        className="sanity-effect fixed inset-0 pointer-events-none z-40"
        style={{
          opacity: intensity * 0.4,
          backgroundColor: 'rgba(0,0,0,0.5)',
        }}
      />
    );
  }
  
  return (
    <div 
      className="sanity-effect fixed inset-0 pointer-events-none z-40"
      style={{
        opacity: intensity * 0.6,
        background: `
          radial-gradient(circle at center, rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 100%),
          url('/images/sanity_texture.png')
        `,
        backgroundSize: '100% 100%, cover',
        filter: `blur(${intensity * 3}px)`,
        mixBlendMode: 'multiply'
      }}
    />
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
        "px-2 py-1 bg-[#1a3a3a] font-interface text-xs hover:bg-[#2d1b2d] transition-colors",
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

// Map Toggle Button
type MapToggleProps = {
  isVisible: boolean;
  onClick: () => void;
  className?: string;
};

export const MapToggle = ({ isVisible, onClick, className }: MapToggleProps) => {
  return (
    <button
      className={cn(
        "text-[#e8e0c9] text-sm px-3 py-1.5 rounded border border-[#e8e0c9]/30 shadow-md flex items-center",
        isVisible ? "bg-[#1a3a3a]" : "bg-[#2d1b2d]",
        className
      )}
      onClick={onClick}
      aria-label={isVisible ? "Hide Map" : "Show Map"}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        {isVisible ? (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 0 1 3 16.382V5.618a1 1 0 0 1 1.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0 0 21 18.382V7.618a1 1 0 0 0-.553-.894L15 4m0 13V4m0 0L9 7" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 0 1 3 16.382V5.618a1 1 0 0 1 1.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0 0 21 18.382V7.618a1 1 0 0 0-.553-.894L15 4m0 13V4m0 0L9 7" />
        )}
      </svg>
      {isVisible ? 'Hide Map' : 'Show Map'}
    </button>
  );
};
