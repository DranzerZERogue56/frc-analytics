import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface ThemeContextType {
  isPinkMode: boolean;
  togglePinkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType>({ isPinkMode: false, togglePinkMode: () => {} });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isPinkMode, setIsPinkMode] = useState(false);

  useEffect(() => {
    if (isPinkMode) {
      document.documentElement.classList.add('pink-mode');
    } else {
      document.documentElement.classList.remove('pink-mode');
    }
  }, [isPinkMode]);

  return (
    <ThemeContext.Provider value={{ isPinkMode, togglePinkMode: () => setIsPinkMode(p => !p) }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
