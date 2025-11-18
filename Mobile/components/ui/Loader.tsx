import React from "react";
import { View, Text, StyleSheet, useColorScheme } from "react-native";
// @ts-ignore
import { BallIndicator } from "react-native-indicators"; 
import { useThemedColors } from "@/hooks/use-theme-color";
type LoaderProps = {
  text?: string;
  color?: string;
  size?: number;
};

export default function Loader({ color = "#0a7ea4", size = 40 }: LoaderProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { CARD_BG} = useThemedColors();
  return (
    <View style={[styles.container, { backgroundColor: CARD_BG }]}>
      <BallIndicator color={color} size={size} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "500",
  },
});
