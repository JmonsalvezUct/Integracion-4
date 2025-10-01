import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import { login } from "@/services/auth";
import { Alert } from "react-native";
import { API_URL } from "@/constants/api";



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


export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  // dentro del componente:
const onSubmit = async () => {
  try {
    console.log("[Login] Intentando login contra:", `${API_URL}/auth/login`);
    const emailOk = email.trim();
    const passOk = pass;

    if (!emailOk || !passOk) {
      Alert.alert("Faltan datos", "Ingresa email y contraseña.");
      return;
    }

    setLoading(true); // activar loading

    await login(emailOk, passOk); // hace fetch y guarda tokens
    console.log("[Login] Exitoso, navegando a tabs");
    router.replace("/(tabs)");
  } catch (e: any) {
    console.log("[Login] Error:", e?.message, e);
    Alert.alert("No se pudo iniciar sesión", e?.message ?? "Revisa tus credenciales o conexión.");
  } finally {
    setLoading(false); // desactivar loading 
  }
};



  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#1E2BFF" }} 
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          {/* Logo*/}
          <View style={{ alignItems: "center", marginBottom: 8 }}>
            {/*logo en assets */}
            <Image source={require("@/assets/images/fastplanner-logo.png")} style={styles.logo} />
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
          <TouchableOpacity
            style={[styles.button, { opacity: loading ? 0.6 : 1 }]}
            activeOpacity={0.9}
            onPress={onSubmit}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Entrando..." : "Entrar"}
            </Text>
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
  logo: { width: 160, height: 80, resizeMode: "contain", marginBottom: 6 },
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
    backgroundColor: "#3F48FF", 
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  buttonText: { color: "#FFFFFF", fontWeight: "700", fontSize: 16 },
  registerText: { textAlign: "center", marginTop: 14, color: "#6B7280" },
  registerLink: { color: "#3F48FF", fontWeight: "700" },
});
