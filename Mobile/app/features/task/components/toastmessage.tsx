    import React, { useEffect, useRef } from "react";
    import { Animated, Text, StyleSheet } from "react-native";


    interface ToastMessageProps {
    visible: boolean;
    message: string;
    type: "success" | "error";
    onHide: () => void;
    }


    export function ToastMessage({ visible, message, type, onHide }: ToastMessageProps) {
    const translateY = useRef(new Animated.Value(-80)).current;

    useEffect(() => {
        if (visible) {
        Animated.timing(translateY, { toValue: 0, duration: 180, useNativeDriver: true }).start(() => {
            setTimeout(() => {
            Animated.timing(translateY, { toValue: -80, duration: 180, useNativeDriver: true }).start(onHide);
            }, 1800);
        });
        }
    }, [visible]);

    if (!visible) return null;

    return (
        <Animated.View
        style={[
            styles.toast,
            { transform: [{ translateY }], backgroundColor: type === "error" ? "#E74C3C" : "#2ECC71" },
        ]}
        >
        <Text style={styles.text}>{message}</Text>
        </Animated.View>
    );
    }

    const styles = StyleSheet.create({
    toast: {
        position: "absolute",
        top: 8,
        left: 16,
        right: 16,
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 10,
        zIndex: 999,
        elevation: 6,
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
    },
    text: { color: "#fff", fontWeight: "600", textAlign: "center" },
    });
