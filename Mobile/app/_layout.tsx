import "react-native-gesture-handler"; // 🟩 debe estar arriba de todo
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Stack } from "expo-router";
import React from "react";

export default function RootLayout() {
  return (
    // 🟩 Este contenedor soluciona el error del GestureHandler
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </GestureHandlerRootView>
  );
}
