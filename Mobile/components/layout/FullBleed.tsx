import React from "react";
import { View } from "react-native";
import { CONTAINER } from "@/constants/spacing";

// Hace que una sección se “escape” del gutter del screen.
export default function FullBleed({ children }: { children: React.ReactNode }) {
  return <View style={{ marginHorizontal: -CONTAINER.horizontal }}>{children}</View>;
}
