import { createContext, useEffect, useState, useContext } from "react";

const ThemeContext = createContext();

export const ThemeContextProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    // Load theme from localStorage on initialization
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  // Apply dark/light mode class to <html> whenever darkMode changes
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    // Save preference to localStorage
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  return useContext(ThemeContext);
};
