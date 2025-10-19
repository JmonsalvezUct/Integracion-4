// hooks/use-color-scheme.ts
import { useColorScheme as useRNColorScheme } from "react-native";
import { useThemeMode } from "@/app/theme-context";

// Devuelve "light" | "dark"
export default function useColorScheme(): "light" | "dark" {
  // 1) override del usuario (switch del perfil)
  try {
    const { theme } = useThemeMode();
    if (theme) return theme;
  } catch {
    // si ThemeProvider aún no está montado, ignoramos y seguimos
  }

  // 2) fallback: tema del sistema
  const system = useRNColorScheme();
  return (system ?? "light") as "light" | "dark";
}
