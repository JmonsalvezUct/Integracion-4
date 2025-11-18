// hooks/useThemedColors.ts
import { useThemeMode } from "@/app/theme-context";
import { Colors } from "@/constants/theme";

export function useThemedColors() {
  const { theme } = useThemeMode(); // 'light' | 'dark'
  const isDark = theme === "dark";

  return {
    theme,
    isDark,

    MODAL_BG: isDark ? "#1f1f1f" : "#ffffff",

    // Colores base del tema (de tu paleta central)
    BG: Colors[theme].background,
    TEXT: Colors[theme].text,
    BRAND: Colors.light.tint || "#3B34FF",


    // Tokens reutilizables (antes hardcodeados en cada archivo)
    CARD_BG: isDark ? "#1c1c1c" : "#ffffff",
    CARD_BORDER: isDark ? "#2a2a2a" : "#e5e5e5",
    INPUT_BG: isDark ? "#2a2a2a" : "#f9f9f9",
    INPUT_BORDER: isDark ? "#3a3a3a" : "#ddd",
    PLACEHOLDER: isDark ? "#9aa0a6" : "#666",
    SUBTEXT: isDark ? "#b3b3b3" : "#666",
    CHART_BG: isDark ? "#3a3a3a" : "#ffffff", // BG de tu paleta

    // Extras útiles para badges/listas
    LIST_DIVIDER: isDark ? "#222" : "#f0f0f0",
    MUTED_BG: isDark ? "#252525" : "#f8f9fa",

    // States
    SUCCESS: "#1a8f2e",
    WARNING: "#FFA500",
    DANGER: "#E74C3C",
  };
}

