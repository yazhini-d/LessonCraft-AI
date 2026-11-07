import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const THEMES = [
  { id: 'default', label: 'Default Color', icon: '🎨', description: 'Vibrant indigo & modern educational palette' },
  { id: 'bw-light', label: 'Black & White (Light)', icon: '⚪', description: 'Clean monochrome paper style, high-contrast e-ink aesthetic' },
  { id: 'bw-dark', label: 'Black & White (Dark)', icon: '🖤', description: 'Deep noir stark contrast, pitch black & pure white' },
];

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem('lessoncraft-theme') || 'default';
  });

  const setTheme = (newTheme) => {
    setThemeState(newTheme);
    localStorage.setItem('lessoncraft-theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const cycleTheme = () => {
    const currentIndex = THEMES.findIndex(t => t.id === theme);
    const nextIndex = (currentIndex + 1) % THEMES.length;
    setTheme(THEMES[nextIndex].id);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, cycleTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export default ThemeContext;

