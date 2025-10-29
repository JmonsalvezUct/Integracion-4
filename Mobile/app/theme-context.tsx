import React, { createContext, useContext, useEffect, useState } from "react";
import { Appearance } from "react-native";

type ThemeMode = "light" | "dark";

type Ctx = { theme: ThemeMode; toggleTheme: () => void };
const ThemeContext = createContext<Ctx>({ theme: "light", toggleTheme: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // inicia respetando el tema del sistema
  const [theme, setTheme] = useState<ThemeMode>((Appearance.getColorScheme() ?? "light") as ThemeMode);

  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export function useThemeMode() {
  return useContext(ThemeContext);
}
