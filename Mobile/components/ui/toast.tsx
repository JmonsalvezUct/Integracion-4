import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, Pressable, StyleSheet, Text, ViewStyle } from "react-native";

// ==== Tipos ====
export type ToastType = "success" | "info" | "warning" | "error";
type ToastInput = { message: string; type?: ToastType; durationMs?: number };

// ==== Mini “event bus” (sin dependencias) ====
const subscribers = new Set<(t: ToastInput) => void>();
export function showToast(message: string, type: ToastType = "info", durationMs = 2500) {
  subscribers.forEach((fn) => fn({ message, type, durationMs }));
}

// ==== Host global (montar una sola vez) ====
export function ToastHost({ position = "bottom" }: { position?: "top" | "bottom" }) {
  const [toast, setToast] = useState<ToastInput | null>(null);
  const [visible, setVisible] = useState(false);
  const translate = useRef(new Animated.Value(40)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onToast = (t: ToastInput) => {
      // si hay uno visible, lo reemplazamos suavemente
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      setToast(t);
      setVisible(true);
      // animar entrada
      translate.setValue(40);
      opacity.setValue(0);
      Animated.parallel([
        Animated.timing(translate, { toValue: 0, duration: 180, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      ]).start();

      // auto-cerrar
      timerRef.current = setTimeout(() => {
        Animated.parallel([
          Animated.timing(translate, { toValue: 40, duration: 160, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0, duration: 160, useNativeDriver: true }),
        ]).start(() => {
          setVisible(false);
          setToast(null);
        });
      }, t.durationMs ?? 2500);
    };

    subscribers.add(onToast);
    return () => {
      subscribers.delete(onToast);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [opacity, translate]);

  if (!visible || !toast) return null;

  const { message, type = "info" } = toast;
  const colors: Record<ToastType, ViewStyle["backgroundColor"]> = {
    success: "#16a34a",
    info: "#0a7ea4",
    warning: "#f59e0b",
    error: "#dc2626",
  };

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.wrapper,
        position === "top" ? { top: 20 } : { bottom: 20 },
        { opacity, transform: [{ translateY: translate }] },
      ]}
    >
      <Pressable
        onPress={() => {
          // cerrar al tocar
          Animated.parallel([
            Animated.timing(translate, { toValue: 40, duration: 120, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 0, duration: 120, useNativeDriver: true }),
          ]).start(() => {
            setVisible(false);
            setToast(null);
          });
        }}
        style={[styles.toast, { backgroundColor: colors[type] }]}
      >
        <Text style={styles.text}>{message}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 9999,
  },
  toast: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
    maxWidth: "92%",
  },
  text: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
});
