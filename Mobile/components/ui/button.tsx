import React from "react";
import {
  ActivityIndicator,
  GestureResponderEvent,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors as Theme } from "@/constants/theme";

type Variant = "solid" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

export interface ButtonProps {
  title?: string;
  children?: React.ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  testID?: string;
}

export default function Button({
  title,
  children,
  onPress,
  variant = "solid",
  size = "md",
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  style,
  textStyle,
  testID,
}: ButtonProps) {
  const scheme = useColorScheme();
  const Colors = (Theme as any)?.[scheme] ?? {};

  const primary = Colors.primary ?? "#0a7ea4";
  const onPrimary = Colors.onPrimary ?? "#ffffff";
  const text = Colors.text ?? (scheme === "dark" ? "#f3f4f6" : "#111827");
  const bg = Colors.background ?? (scheme === "dark" ? "#292a2dff" : "#ffffff");
  const disabledBg = Colors.disabledBg ?? (scheme === "dark" ? "#1f2937" : "#e5e7eb");
  const disabledText = Colors.disabledText ?? (scheme === "dark" ? "#9ca3af" : "#6b7280");

  const { padY, padX, fontSize } =
    size === "sm"
      ? { padY: 8, padX: 12, fontSize: 14 }
      : size === "lg"
      ? { padY: 14, padX: 18, fontSize: 18 }
      : { padY: 12, padX: 16, fontSize: 16 };

  const getVariantStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (variant) {
      case "outline":
        return {
          container: {
            backgroundColor: "transparent",
            borderWidth: 1.5,
            borderColor: primary,
          },
          text: { color: primary },
        };
      case "ghost":
        return {
          container: {
            backgroundColor: "transparent",
          },
          text: { color: primary },
        };
      default:
        return {
          container: { backgroundColor: primary },
          text: { color: onPrimary },
        };
    }
  };

  const variantStyles = getVariantStyles();

  const baseContainer: ViewStyle = {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: padY,
    paddingHorizontal: padX,
    borderRadius: 10,
  };

  const disabledContainer: ViewStyle =
    disabled || loading
      ? {
          backgroundColor: variant === "solid" ? disabledBg : "transparent",
          opacity: 0.7,
        }
      : {};

  return (
    <Pressable
      testID={testID}
      onPress={disabled || loading ? undefined : onPress}
      android_ripple={
        variant === "solid"
          ? { color: bg }
          : { color: scheme === "dark" ? "#1f2937" : "#e5e7eb" }
      }
      style={({ pressed }) => [
        {
          width: fullWidth ? "100%" : undefined,
          opacity: pressed && !(disabled || loading) ? 0.9 : 1,
        },
        baseContainer,
        variantStyles.container,
        disabledContainer,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variant === "solid" ? onPrimary : text} />
      ) : (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 as any }}>
          {leftIcon}
          <Text
            style={[
              {
                fontSize,
                fontWeight: "600",
                color:
                  disabled || loading
                    ? disabledText
                    : (variantStyles.text?.color as string) ?? text,
              },
              textStyle,
            ]}
          >
            {title ?? children}
          </Text>
          {rightIcon}
        </View>
      )}
    </Pressable>
  );
}
