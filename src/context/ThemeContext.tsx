import React, { createContext, useContext, useState, useEffect } from 'react';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  isFaceIDEnabled: boolean;
  toggleFaceID: () => void;
  isPushEnabled: boolean;
  togglePush: () => void;
  isWeeklyReportsEnabled: boolean;
  toggleWeeklyReports: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [isFaceIDEnabled, setIsFaceIDEnabled] = useState(() => {
    const saved = localStorage.getItem('faceID');
    return saved ? JSON.parse(saved) : true;
  });

  const [isPushEnabled, setIsPushEnabled] = useState(() => {
    const saved = localStorage.getItem('pushNotifications');
    return saved ? JSON.parse(saved) : false;
  });

  const [isWeeklyReportsEnabled, setIsWeeklyReportsEnabled] = useState(() => {
    const saved = localStorage.getItem('weeklyReports');
    return saved ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('faceID', JSON.stringify(isFaceIDEnabled));
  }, [isFaceIDEnabled]);

  useEffect(() => {
    localStorage.setItem('pushNotifications', JSON.stringify(isPushEnabled));
    if (isPushEnabled && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [isPushEnabled]);

  useEffect(() => {
    localStorage.setItem('weeklyReports', JSON.stringify(isWeeklyReportsEnabled));
  }, [isWeeklyReportsEnabled]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);
  const toggleFaceID = () => setIsFaceIDEnabled(!isFaceIDEnabled);
  const togglePush = () => setIsPushEnabled(!isPushEnabled);
  const toggleWeeklyReports = () => setIsWeeklyReportsEnabled(!isWeeklyReportsEnabled);

  return (
    <ThemeContext.Provider value={{ 
      isDarkMode, toggleDarkMode, 
      isFaceIDEnabled, toggleFaceID, 
      isPushEnabled, togglePush,
      isWeeklyReportsEnabled, toggleWeeklyReports
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
