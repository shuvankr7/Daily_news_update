import { useState, useEffect } from "react";
import { Newspaper } from "lucide-react";
import { Link } from "wouter";
import { SUPPORTED_LANGUAGES } from "@/lib/constants";
import { useLanguage } from "@/lib/LanguageContext";
import { ChevronDown, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  darkMode?: boolean;
}

export default function Header({ darkMode = false }: HeaderProps) {
  const { currentLanguage, setCurrentLanguage } = useLanguage();
  const [languageName, setLanguageName] = useState<string>("English");
  
  // Update language name when language changes
  useEffect(() => {
    const language = SUPPORTED_LANGUAGES.find(lang => lang.code === currentLanguage);
    if (language) {
      setLanguageName(language.name);
    }
  }, [currentLanguage]);
  
  // Handle language selection
  const handleLanguageSelect = (code: string) => {
    setCurrentLanguage(code);
  };
  
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <Newspaper className="text-primary h-6 w-6 mr-2" />
          <h1 className="text-xl md:text-2xl font-semibold text-gray-800 dark:text-gray-100">VoiceNews</h1>
        </Link>
        
        <div className="flex items-center space-x-4">
          {/* Language Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary focus:outline-none transition">
                <span className="mr-1 text-sm md:text-base">{languageName}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Select Language</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {SUPPORTED_LANGUAGES.map((language) => (
                <DropdownMenuItem 
                  key={language.code}
                  className={currentLanguage === language.code ? "bg-gray-100 dark:bg-gray-700" : ""}
                  onClick={() => handleLanguageSelect(language.code)}
                >
                  {language.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button variant="ghost" size="icon" className="text-gray-600 dark:text-gray-300">
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
