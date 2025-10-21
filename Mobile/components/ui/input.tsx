import React, { useMemo, useState, forwardRef } from "react";
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  StyleSheet,
  Pressable,
} from "react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors as Theme } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";

type Variant = "surface" | "flat";

export interface InputProps extends Omit<TextInputProps, "style"> {
  label?: string;
  helperText?: string;
  error?: string | boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;

  /** Estilo del wrapper externo (no pinta la caja del input) */
  containerStyle?: any;

  /** Estilo del contenedor INTERNO del campo (sí pinta la caja del input) */
  fieldStyle?: any;

  /** Estilo del TextInput en sí */
  inputStyle?: any;

  secureToggle?: boolean;
  variant?: Variant;             // "surface" (default) o "flat"
  backgroundOverride?: string;   // fuerza el fondo del contenedor del input
}

/**
 * Usamos forwardRef para que <Input ref={...} /> funcione
 */
const Input = forwardRef<TextInput, InputProps>(function Input(
  {
    label,
    helperText,
    error,
    leftIcon,
    rightIcon,
    containerStyle,
    fieldStyle,
    inputStyle,
    secureTextEntry,
    secureToggle = true,
    variant = "surface",
    backgroundOverride,
    ...props
  },
  ref
) {
  const scheme = useColorScheme();
  const Colors = (Theme as any)?.[scheme] ?? {};

  // Tokens desde el tema (con respaldos defensivos)
  const text = Colors.text ?? (scheme === "dark" ? "#f3f4f6" : "#111827");
  const muted = Colors.muted ?? (scheme === "dark" ? "#9ca3af" : "#6b7280");
  const surface = Colors.surface ?? (scheme === "dark" ? "#1E1E1E" : "#f3f3f3");
  const bg = Colors.background ?? (scheme === "dark" ? "#151718" : "#ffffff");
  const border = Colors.border ?? "rgba(0,0,0,0.15)";
  const primary = Colors.primary ?? "#0a7ea4";
  const danger = Colors.danger ?? "#E74C3C";

  const [isFocused, setIsFocused] = useState(false);
  const [hidden, setHidden] = useState<boolean>(!!secureTextEntry);

  const showError = !!error;

  // Color del borde según estado (sin hardcode)
  const borderColor = useMemo(() => {
    if (showError) return danger;
    if (isFocused) return primary;
    return border;
  }, [showError, isFocused, primary, border, danger]);

  // Grosor del borde: más visible en foco
  const borderWidth = isFocused ? 2 : StyleSheet.hairlineWidth;

  // Fondo de la caja del input:
  // - backgroundOverride → manda
  // - variant="flat" → usa bg (fondo global)
  // - variant="surface" → usa surface (relleno gris del tema)
  const containerBg =
    backgroundOverride ?? (variant === "flat" ? bg : surface);

  return (
    <View style={[{ width: "100%" }, containerStyle]}>
      {label ? (
        <Text
          style={{
            marginBottom: 6,
            color: muted,
            fontSize: 14,
            fontWeight: "600",
          }}
        >
          {label}
        </Text>
      ) : null}

      <View
        style={[
          styles.field,
          {
            backgroundColor: containerBg,
            borderColor,
            borderWidth,
          },
          fieldStyle,
        ]}
      >
        {leftIcon ? <View style={{ marginRight: 8 }}>{leftIcon}</View> : null}

        <TextInput
          ref={ref}
          {...props}
          secureTextEntry={hidden}
          placeholderTextColor={muted}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          style={[
            styles.input,
            {
              color: text,
              backgroundColor: "transparent",
            },
            inputStyle,
          ]}
        />

        {secureToggle && secureTextEntry ? (
          <Pressable
            onPress={() => setHidden((v) => !v)}
            hitSlop={8}
            style={{ paddingLeft: 6, paddingRight: rightIcon ? 0 : 6 }}
          >
            <Ionicons
              name={hidden ? "eye-off-outline" : "eye-outline"}
              size={20}
              color={muted}
            />
          </Pressable>
        ) : null}

        {rightIcon ? <View style={{ marginLeft: 8 }}>{rightIcon}</View> : null}
      </View>

      {showError ? (
        <Text style={{ marginTop: 6, color: danger, fontSize: 12 }}>
          {typeof error === "string" ? error : "Campo inválido"}
        </Text>
      ) : helperText ? (
        <Text style={{ marginTop: 6, color: muted, fontSize: 12 }}>
          {helperText}
        </Text>
      ) : null}
    </View>
  );
});

export default Input;

const styles = StyleSheet.create({
  field: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 2,
  },
});
