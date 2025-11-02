import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { KeyboardAvoidingView, Platform, StyleSheet, ScrollView, View, Text, TouchableOpacity } from "react-native";
import { registerUser, login } from "@/services/auth";
import { showToast } from "@/components/ui/toast";

// 🎨 Paleta
import { Colors } from "@/constants/theme";
// 🧩 Componentes reutilizables
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";

export default function RegisterScreen() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);

  const PRIMARY = Colors.light.tint; // #0a7ea4
  const TEXT_DARK = "#111827";
  const MUTED = "#6B7280";

  const onSubmit = async () => {
    try {
      if (!name && !email && !pass) {
        showToast("Por favor, completa todos los campos para registrarte", "warning");
        return;
      }

      if (!name || !email || !pass) {
        showToast("Faltan campos por completar", "warning");
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showToast("El correo debe tener un formato válido (ejemplo@correo.com)", "warning");
        return;
      }

      if (pass.length < 8) {
        showToast("La contraseña debe tener al menos 8 caracteres", "warning");
        return;
  }

      setLoading(true);
      const data = await registerUser({ name, email, password: pass });

      // Si el backend no devolvió accessToken, iniciamos sesión con lo recién registrado
      if (!data?.accessToken) {
        await login(email, pass);
      }

      showToast("Cuenta creada con éxito", "success");
      router.replace("/(tabs)");
    } catch (e: any) {
      showToast(e?.message ?? "No se pudo crear la cuenta. Intenta de nuevo.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: PRIMARY }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <Text style={styles.title}>Crear cuenta</Text>

          {/* Nombre */}
          <Input
            placeholder="Nombre"
            placeholderTextColor="#9CA3AF"
            value={name}
            onChangeText={setName}
            variant="surface"
            backgroundOverride="#FFFFFF"
            leftIcon={<Ionicons name="person-outline" size={18} color={MUTED} />}
            containerStyle={{ marginTop: 4 }}
            fieldStyle={{
              height: 50,
              borderRadius: 25,
              borderWidth: 1,
              borderColor: "#E5E7EB",
            }}
            inputStyle={{ fontSize: 16, color: TEXT_DARK, paddingHorizontal: 8 }}
          />

          {/* Correo */}
          <Input
            placeholder="Correo"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            variant="surface"
            backgroundOverride="#FFFFFF"
            leftIcon={<Ionicons name="mail-outline" size={18} color={MUTED} />}
            containerStyle={{ marginTop: 12 }}
            fieldStyle={{
              height: 50,
              borderRadius: 25,
              borderWidth: 1,
              borderColor: "#E5E7EB",
            }}
            inputStyle={{ fontSize: 16, color: TEXT_DARK, paddingHorizontal: 8 }}
          />

          {/* Contraseña */}
          <Input
            placeholder="Contraseña"
            placeholderTextColor="#9CA3AF"
            value={pass}
            onChangeText={setPass}
            secureTextEntry
            variant="surface"
            backgroundOverride="#FFFFFF"
            leftIcon={<Ionicons name="lock-closed-outline" size={18} color={MUTED} />}
            containerStyle={{ marginTop: 12 }}
            fieldStyle={{
              height: 50,
              borderRadius: 25,
              borderWidth: 1,
              borderColor: "#E5E7EB",
            }}
            inputStyle={{ fontSize: 16, color: TEXT_DARK, paddingHorizontal: 8 }}
          />

          {/* Botón de registro */}
          <Button
            title={loading ? "Creando..." : "Registrarme"}
            onPress={onSubmit}
            disabled={loading}
            fullWidth
            style={{ height: 50, borderRadius: 25, marginTop: 16, opacity: loading ? 0.6 : 1 }}
            textStyle={{ fontWeight: "700", fontSize: 16 }}
          />

          {/* Volver a login */}
          <TouchableOpacity onPress={() => router.replace("/auth/login")} style={{ marginTop: 12 }}>
            <Text style={[styles.backToLogin, { color: PRIMARY }]}>Volver a iniciar sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    padding: 20,
    justifyContent: "center",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
    color: "#111827",
    marginBottom: 12,
  },
  backToLogin: { textAlign: "center", fontWeight: "700" },
});
