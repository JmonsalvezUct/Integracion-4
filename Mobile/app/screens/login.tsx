import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Image,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [show, setShow] = useState(false);

  const onSubmit = () => {
    // TODO: validación + llamada a tu API
    // router.replace("(tabs)");
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#1E2BFF" }} // azul de fondo
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          {/* Logo + título */}
          <View style={{ alignItems: "center", marginBottom: 8 }}>
            {/* Coloca tu logo en assets y descomenta la línea de abajo */}
            {/* <Image source={require("@/assets/fastplanner-logo.png")} style={styles.logo} /> */}
            <Text style={styles.brand}>FastPlanner</Text>
          </View>

          <Text style={styles.title}>Inicia sesión</Text>

          {/* Input correo */}
          <View style={styles.inputWrap}>
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

          {/* Input contraseña */}
          <View style={[styles.inputWrap, { marginTop: 12 }]}>
            <Ionicons name="lock-closed-outline" size={18} color="#6B7280" style={styles.leftIcon} />
            <TextInput
              placeholder="Contraseña"
              placeholderTextColor="#9CA3AF"
              value={pass}
              onChangeText={setPass}
              secureTextEntry={!show}
              style={styles.input}
            />
            <TouchableOpacity onPress={() => setShow((s) => !s)}>
              <Ionicons
                name={show ? "eye-off-outline" : "eye-outline"}
                size={20}
                color="#6B7280"
                style={{ marginRight: 8 }}
              />
            </TouchableOpacity>
          </View>

          {/* Botón Entrar */}
          <TouchableOpacity style={styles.button} activeOpacity={0.9} onPress={onSubmit}>
            <Text style={styles.buttonText}>Entrar</Text>
          </TouchableOpacity>

          {/* Link registro */}
          <Text style={styles.registerText}>
            ¿No tienes cuenta?{" "}
            <Link href="/screens/register" style={styles.registerLink}>
              Regístrate
            </Link>
          </Text>
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
  logo: { width: 42, height: 42, resizeMode: "contain", marginBottom: 6 },
  brand: { fontWeight: "800", fontSize: 16, color: "#111827" },
  title: {
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
    color: "#111827",
    marginVertical: 10,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    marginTop: 8,
  },
  leftIcon: { marginLeft: 14, marginRight: 6 },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
    paddingHorizontal: 8,
  },
  button: {
    height: 50,
    borderRadius: 25,
    backgroundColor: "#3F48FF", // botón azul
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  buttonText: { color: "#FFFFFF", fontWeight: "700", fontSize: 16 },
  registerText: { textAlign: "center", marginTop: 14, color: "#6B7280" },
  registerLink: { color: "#3F48FF", fontWeight: "700" },
});
