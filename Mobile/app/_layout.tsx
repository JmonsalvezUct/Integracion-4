import "react-native-gesture-handler"; // debe estar arriba de todo
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Stack } from "expo-router";
import React from "react";
import { StatusBar } from "expo-status-bar";
import { ThemeProvider } from "@/app/theme-context"; // tu provider
import { useColorScheme } from "@/hooks/use-color-scheme"; // 'light' | 'dark'

// Tema de React Navigation para que headers/gestos tomen dark-mode
import {
  ThemeProvider as NavThemeProvider,
  DarkTheme,
  DefaultTheme,
} from "@react-navigation/native";

export default function RootLayout() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  return (
    // Mantengo tu ThemeProvider exactamente igual
    <ThemeProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        {/* Barra de estado acorde al tema */}
        <StatusBar style={isDark ? "light" : "dark"} />

        {/* Solo se agrega el ThemeProvider de React Navigation */}
        <NavThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
          <Stack
            screenOptions={{
              headerShown: false,
              // Fondo global para TODAS las pantallas
              contentStyle: { backgroundColor: isDark ? "#0c0c0c" : "#ffffff" },
            }}
          />
        </NavThemeProvider>
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}

