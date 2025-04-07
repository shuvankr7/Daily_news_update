import { useState, useEffect, useRef } from "react";
import { Play, Pause, X, Volume2, Languages } from "lucide-react";
import { NewsArticle } from "@/lib/types";
import { useLanguage } from "@/lib/LanguageContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { SUPPORTED_LANGUAGES } from "@/lib/constants";

interface AudioPlayerProps {
  article: NewsArticle;
  isPlaying: boolean;
  onClose: () => void;
  onPlayPause: () => void;
}

export default function AudioPlayer({
  article,
  isPlaying,
  onClose,
  onPlayPause,
}: AudioPlayerProps) {
  const { currentLanguage, setCurrentLanguage } = useLanguage();
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [audioText, setAudioText] = useState<string>("");
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize speech synthesis
  useEffect(() => {
    // Create speech synthesis utterance with article summary or description
    const text = article.summary || article.description || article.title;
    setAudioText(text);
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Try to find a voice for the selected language
    if (window.speechSynthesis) {
      const voices = window.speechSynthesis.getVoices();
      
      // Wait for voices to load if they're not available yet
      if (voices.length === 0) {
        window.speechSynthesis.onvoiceschanged = () => {
          const availableVoices = window.speechSynthesis.getVoices();
          const voice = availableVoices.find(voice => 
            voice.lang.startsWith(currentLanguage) || 
            (currentLanguage === 'en' && voice.lang.startsWith('en-'))
          );
          
          if (voice) {
            utterance.voice = voice;
          }
        };
      } else {
        const voice = voices.find(voice => 
          voice.lang.startsWith(currentLanguage) || 
          (currentLanguage === 'en' && voice.lang.startsWith('en-'))
        );
        
        if (voice) {
          utterance.voice = voice;
        }
      }
    }
    
    // Set duration (approximation as speech synthesis doesn't provide accurate duration)
    // Using a rough estimate of 150 words per minute
    const wordCount = text.split(/\s+/).length;
    const estimatedDuration = (wordCount / 150) * 60;
    setDuration(estimatedDuration);
    
    speechSynthesisRef.current = utterance;
    
    // Setup event handlers
    utterance.onend = () => {
      if (isPlaying) {
        onPlayPause(); // Use onPlayPause to update parent state
      }
      setCurrentTime(0);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
    
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [article, currentLanguage, isPlaying, onPlayPause]);

  // Play or pause speech synthesis
  useEffect(() => {
    if (window.speechSynthesis && speechSynthesisRef.current) {
      if (isPlaying) {
        // Cancel any existing speech
        window.speechSynthesis.cancel();
        
        // Update the text if needed for language
        const text = audioText;
        speechSynthesisRef.current.text = text;
        
        // Start new speech
        window.speechSynthesis.speak(speechSynthesisRef.current);
        
        // Start progress tracking
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        
        intervalRef.current = setInterval(() => {
          setCurrentTime(prev => {
            const newTime = prev + 0.1;
            return newTime > duration ? duration : newTime;
          });
        }, 100);
      } else {
        window.speechSynthesis.pause();
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPlaying, audioText, duration, onPlayPause]);

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle language change
  const handleLanguageChange = (language: string) => {
    // Stop current playback
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    
    // Change language
    setCurrentLanguage(language);
    
    // Reset playback
    setCurrentTime(0);
    
    // Restart if it was playing
    if (isPlaying) {
      onPlayPause();
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg z-30">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1">
            <Button 
              className={`p-2 rounded-full ${isPlaying ? 'bg-primary' : 'bg-primary hover:bg-primary/90'} text-white`}
              size="icon"
              onClick={onPlayPause}
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
            
            <div className="flex-1">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200 line-clamp-1">
                  {article.title}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>
              <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full">
                <div 
                  className="bg-primary h-1.5 rounded-full" 
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 ml-4">
            <Button variant="ghost" size="icon" className="text-gray-600 dark:text-gray-300">
              <Volume2 className="h-4 w-4" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-gray-600 dark:text-gray-300">
                  <Languages className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {SUPPORTED_LANGUAGES.map((language) => (
                  <DropdownMenuItem 
                    key={language.code}
                    className={currentLanguage === language.code ? "bg-gray-100 dark:bg-gray-700" : ""}
                    onClick={() => handleLanguageChange(language.code)}
                  >
                    {language.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-gray-600 dark:text-gray-300"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
