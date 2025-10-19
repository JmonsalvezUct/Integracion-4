// hooks/use-color-scheme.web.ts
import { useThemeMode } from "@/app/theme-context";

export default function useColorScheme(): "light" | "dark" {
  try {
    const { theme } = useThemeMode();
    if (theme) return theme;
  } catch {
    // sin provider -> fallback
  }
  // En web, si no hay provider, se asume claro
  return "light";
}
