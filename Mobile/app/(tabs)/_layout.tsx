import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "@/hooks/use-color-scheme";

function TabBarIcon(props: { name: React.ComponentProps<typeof Ionicons>["name"]; color: string }) {
  return <Ionicons size={24} style={{ marginBottom: -2 }} {...props} />;
}

export default function TabLayout() {
  const theme = useColorScheme();
  const isDark = theme === "dark";

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: isDark ? "#ffffff" : "#0a7ea4",
          tabBarInactiveTintColor: isDark ? "#b0b3b8" : "#6b7280",
          tabBarStyle: {
            backgroundColor: isDark ? "#0c0c0c" : "#ffffff",
            borderTopColor: isDark ? "#1f1f1f" : "#e5e7eb",
          },
          tabBarLabelStyle: { fontSize: 12 },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon name={focused ? "home" : "home-outline"} color={color} />
            ),
          }}
        />

        
        <Tabs.Screen
          name="explore"
          options={{
            href: null, 
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            title: "profile",
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon name={focused ? "person" : "person-outline"} color={color} />
            ),
          }}
        />
      </Tabs>
    </>
  );
}
