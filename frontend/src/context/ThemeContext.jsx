import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("ah_tema") === "escuro";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.setAttribute("data-bs-theme", "dark");
      root.setAttribute("data-tema", "escuro");
      localStorage.setItem("ah_tema", "escuro");
    } else {
      root.setAttribute("data-bs-theme", "light");
      root.setAttribute("data-tema", "claro");
      localStorage.setItem("ah_tema", "claro");
    }
  }, [darkMode]);

  return (
    <ThemeContext.Provider value={{ darkMode, setDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTema() {
  return useContext(ThemeContext);
}
