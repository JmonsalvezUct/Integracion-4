import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Alert } from "react-native";
import { registerUser, login } from "@/services/auth";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ScrollView,
} from "react-native";


export default function RegisterScreen() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
  try {
    if (!name || !email || !pass) {
      Alert.alert("Completa los campos", "Nombre, correo y contraseña.");
      return;
    }

    setLoading(true);
    const data = await registerUser({
      name,
      email,
      password: pass,
    });

    if (!data?.accessToken) {
      await login(email, pass);
    }

    router.replace("/(tabs)");
  } catch (e: any) {
    Alert.alert("No se pudo registrar", e?.message ?? "Intenta de nuevo.");
  } finally {
    setLoading(false);
  }
};


  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#1E2BFF" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <Text style={styles.title}>Crear cuenta</Text>

          {/* Nombre */}
          <View style={styles.inputWrap}>
            <Ionicons name="person-outline" size={18} color="#6B7280" style={styles.leftIcon} />
            <TextInput
              placeholder="Nombre"
              placeholderTextColor="#9CA3AF"
              value={name}
              onChangeText={setName}
              style={styles.input}
            />
          </View>

          {/* Correo */}
          <View style={[styles.inputWrap, { marginTop: 12 }]}>
            <Ionicons name="person-outline" size={18} color="#6B7280" style={styles.leftIcon} />
            <TextInput
              placeholder="Correo"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.input}
            />
          </View>

          {/* Contraseña */}
          <View style={[styles.inputWrap, { marginTop: 12 }]}>
            <Ionicons name="lock-closed-outline" size={18} color="#6B7280" style={styles.leftIcon} />
            <TextInput
              placeholder="Contraseña"
              placeholderTextColor="#9CA3AF"
              value={pass}
              onChangeText={setPass}
              secureTextEntry
              style={styles.input}
            />
          </View>

          {/* Botón */}
          <TouchableOpacity
            style={[styles.button, { opacity: loading ? 0.6 : 1 }]}
            activeOpacity={0.9}
            onPress={onSubmit}
            disabled={loading} // lo deshabilita mientras loading = true
          >
            <Text style={styles.buttonText}>
              {loading ? "Creando..." : "Registrarme"} 
            </Text>
          </TouchableOpacity>

          {/* Volver a login */}
          <TouchableOpacity onPress={() => router.replace("/auth/login")} style={{ marginTop: 12 }}>
            <Text style={styles.backToLogin}>Volver a iniciar sesión</Text>
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
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  leftIcon: { marginLeft: 14, marginRight: 6 },
  input: { flex: 1, fontSize: 16, color: "#111827", paddingHorizontal: 8 },
  button: {
    height: 50,
    borderRadius: 25,
    backgroundColor: "#3F48FF",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  buttonText: { color: "#FFFFFF", fontWeight: "700", fontSize: 16 },
  backToLogin: { textAlign: "center", color: "#3F48FF", fontWeight: "700" },
});
