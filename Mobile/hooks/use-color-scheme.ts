import { useColorScheme as useRNColorScheme } from "react-native";
import { useThemeMode } from "@/app/theme-context";

/**
 * Hook que devuelve el modo de color actual ("light" o "dark").
 * - Prioriza el valor global del ThemeContext (definido por el switch del perfil)
 * - Si no hay contexto disponible, usa el tema del sistema (React Native)
 */
function useColorScheme(): "light" | "dark" {
  //Intentar leer el valor del contexto (switch del perfil)
  try {
    const { theme } = useThemeMode();
    if (theme) return theme;
  } catch {
    // Si el ThemeProvider aún no está montado, se ignora
  }

  //Si no hay contexto, usar el tema del sistema
  const system = useRNColorScheme();
  return (system ?? "light") as "light" | "dark";
}

export { useColorScheme };   // export nombrado (mantiene compatibilidad con Expo)
export default useColorScheme; // export default (por si se importa directamente)
