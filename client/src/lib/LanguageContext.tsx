import { createContext, useState, useContext, ReactNode } from "react";
import { languages } from "@shared/schema";
import { LanguageContextType } from "./types";

const defaultLanguageContext: LanguageContextType = {
  currentLanguage: 'en',
  setCurrentLanguage: () => {},
  getLanguageName: () => 'English'
};

export const LanguageContext = createContext<LanguageContextType>(defaultLanguageContext);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState<string>('en');
  
  const getLanguageName = (code: string): string => {
    const language = languages.find(lang => lang.code === code);
    return language ? language.name : 'English';
  };
  
  const contextValue: LanguageContextType = { 
    currentLanguage, 
    setCurrentLanguage, 
    getLanguageName 
  };
  
  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}