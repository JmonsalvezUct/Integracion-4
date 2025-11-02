import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Image, ScrollView, View, Text, TouchableOpacity } from "react-native";
import { API_URL } from "@/constants/api";
import { login, refreshTokens } from "@/services/auth";
import { clearAuth, getRefreshToken } from "@/lib/secure-store";

// 🎨 Tema (usamos solo la paleta clara aquí)
import { Colors } from "@/constants/theme";
// 🧩 Componentes reutilizables
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  const PRIMARY = Colors.light.tint; // #0a7ea4
  const TEXT_DARK = "#111827";
  const MUTED = "#6B7280";

  // Al momento de abrir el login comprueba si hay refresh token y permite entrar sin volver a loguearse
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const refresh = await getRefreshToken();
        if (!mounted) return;
        if (refresh) {
          try {
            await refreshTokens();
            if (!mounted) return;
            router.replace("/(tabs)");
            return;
          } catch (e) {
            // fallo al renovar -> limpiar tokens
            await clearAuth();
          }
        }
      } catch {
        // ignore
      } finally {
        if (mounted) setChecking(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

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
      style={{ flex: 1, backgroundColor: PRIMARY }} // fondo superior de marca
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          {/* Logo */}
          <View style={{ alignItems: "center", marginBottom: 8 }}>
            <Image source={require("@/assets/images/fastplanner-logo.png")} style={styles.logo} />
          </View>

          <Text style={[styles.title, { color: TEXT_DARK }]}>
            {checking ? "Comprobando sesión..." : "Inicia sesión"}
          </Text>

          {/* Input correo */}
          <Input
            placeholder="Correo"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            variant="surface"
            // forzamos blanco porque aquí no usamos dark mode
            backgroundOverride="#FFFFFF"
            leftIcon={<Ionicons name="person-outline" size={18} color={MUTED} />}
            containerStyle={{ marginTop: 8 }}
            fieldStyle={{
              height: 50,
              borderRadius: 25,
              borderWidth: 1,
              borderColor: "#E5E7EB",
            }}
            inputStyle={{ fontSize: 16, color: TEXT_DARK, paddingHorizontal: 8 }}
          />

          {/* Input contraseña */}
          <Input
            placeholder="Contraseña"
            placeholderTextColor="#9CA3AF"
            value={pass}
            onChangeText={setPass}
            secureTextEntry={!show}
            secureToggle={false} 
            variant="surface"
            backgroundOverride="#FFFFFF"
            leftIcon={<Ionicons name="lock-closed-outline" size={18} color={MUTED} />}
            rightIcon={
                <TouchableOpacity onPress={() => setShow((s) => !s)}>
                  <Ionicons name={show ? "eye-outline" : "eye-off-outline"} size={20} color={MUTED} />
                </TouchableOpacity>
            }
            containerStyle={{ marginTop: 12 }}
            fieldStyle={{
              height: 50,
              borderRadius: 25,
              borderWidth: 1,
              borderColor: "#E5E7EB",
            }}
            inputStyle={{ fontSize: 16, color: TEXT_DARK, paddingHorizontal: 8 }}
          />

          {/* Botón Entrar */}
          <Button
            title={loading ? "Entrando..." : "Entrar"}
            onPress={onSubmit}
            disabled={loading}
            fullWidth
            style={{ height: 50, borderRadius: 25, marginTop: 16, opacity: loading ? 0.6 : 1 }}
            textStyle={{ fontWeight: "700", fontSize: 16 }}
          />

          {/* Link registro */}
          <Text style={styles.registerText}>
            ¿No tienes cuenta?{" "}
            <Link href="/auth/register" style={[styles.registerLink, { color: PRIMARY }]}>
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
  title: {
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
    marginVertical: 10,
  },
  registerText: { textAlign: "center", marginTop: 14, color: "#6B7280" },
  registerLink: { fontWeight: "700" },
});
