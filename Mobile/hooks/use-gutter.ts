import { useWindowDimensions } from "react-native";

export function useGutter() {
  const { width } = useWindowDimensions();
  const gutter = Math.max(4, Math.min(20, Math.round(width * 0.00)));
  return gutter;
}
