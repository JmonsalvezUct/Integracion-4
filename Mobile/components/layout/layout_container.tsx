import React from "react";
import { View, ScrollView, StyleSheet, ViewStyle } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { CONTAINER, SPACING } from "@/constants/spacing";


// - scroll: por defecto true -> ScrollView. Si lo pones en false usa un View fijo.
// - contentStyle: estilos extra para el contenido interno
// - style: estilos extra para el contenedor externo (poco común)
// - children: contenido de la pantalla
type Props = {
  scroll?: boolean;
  contentStyle?: ViewStyle | ViewStyle[];
  style?: ViewStyle | ViewStyle[];
  children: React.ReactNode;
};

export default function LayoutContainer({
  scroll = true,
  contentStyle,
  style,
  children,
}: Props) {
  const insets = useSafeAreaInsets();

  const baseContent: ViewStyle = {
    paddingHorizontal: CONTAINER.horizontal,
    paddingTop: CONTAINER.top,
    paddingBottom: CONTAINER.bottom + insets.bottom, // evita solaparse con gestos/barras
  };

  if (scroll) {
    return (
      <SafeAreaView style={[styles.safe, style]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.content, baseContent, contentStyle]}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Variante sin scroll (para pantallas muy simples)
  return (
    <SafeAreaView style={[styles.safe, style]}>
      <View style={[styles.content, baseContent, contentStyle]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    gap: SPACING.md, // separación vertical entre bloques por defecto
  },
});
