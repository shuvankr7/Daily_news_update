import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import ArticleDetail from "@/pages/ArticleDetail";
import { useEffect, useState } from "react";
import { LanguageProvider } from "@/lib/LanguageContext";

function App() {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Check for user's preferred color scheme
  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(prefersDark);
  }, []);

  // Apply dark mode class when it changes
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <LanguageProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/article/:id" component={ArticleDetail} />
          <Route component={NotFound} />
        </Switch>
        <Toaster />
      </div>
    </LanguageProvider>
  );
}

export default App;
