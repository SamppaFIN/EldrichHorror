import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from './ui/dialog';
import { PixelButton } from './GameComponents';

interface StoryDialogProps {
  title: string;
  text: string;
  isOpen: boolean;
  onClose: () => void;
  onContinue?: () => void;
  showContinueButton?: boolean;
}

const StoryDialog: React.FC<StoryDialogProps> = ({
  title,
  text,
  isOpen,
  onClose,
  onContinue,
  showContinueButton = true
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // Text typing effect
  useEffect(() => {
    if (!isOpen) {
      setDisplayedText('');
      return;
    }
    
    setIsTyping(true);
    let index = 0;
    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(prev => prev + text.charAt(index));
        index++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 25); // Typing speed
    
    return () => clearInterval(interval);
  }, [isOpen, text]);

  // Handle continue action
  const handleContinue = () => {
    if (isTyping) {
      // If still typing, show all text immediately
      setDisplayedText(text);
      setIsTyping(false);
    } else if (onContinue) {
      // Text finished, call onContinue handler
      onContinue();
    } else {
      // No continue handler, just close
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-black border-2 border-amber-500 text-amber-300 max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl font-bold font-mono">
            {title}
          </DialogTitle>
        </DialogHeader>
        
        <DialogDescription className="text-amber-200 font-mono whitespace-pre-line leading-relaxed text-base sm:text-lg">
          {displayedText}
        </DialogDescription>
        
        <div className="flex justify-end mt-4">
          {showContinueButton && (
            <PixelButton onClick={handleContinue}>
              {isTyping ? "Skip" : "Continue"}
            </PixelButton>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StoryDialog;