import React, { useEffect, useState } from "react";
import { View, Text, TextInput, StyleSheet, ScrollView, Alert, Image } from "react-native";
import { useRouter } from "expo-router";
import { getSavedUser } from "@/services/auth";
import { apiFetch } from "@/lib/api-fetch";
import * as SecureStore from "expo-secure-store";
import Button from "@/components/ui/button";
import { Ionicons } from "@expo/vector-icons";

export default function EditProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {

      const u = await getSavedUser();
      if (u) {
        const res = await apiFetch("/user/me");
        const data = await res.json();
        setUser(data);
        setName(data.name || "");
        setEmail(data.email || "");

      }
    })();
  }, []);

  const handleSave = async () => {
    try {
      setLoading(true);

      const res = await apiFetch("/user/me", {
        method: "PUT",
        body: JSON.stringify({ name }),
        headers: { "Content-Type": "application/json" },
      });

      const updatedUser = await res.json();

      await SecureStore.setItemAsync("user", JSON.stringify(updatedUser));
      Alert.alert("Éxito", "Perfil actualizado correctamente");
      router.back();
    } catch (err) {
      console.error("Error actualizando perfil:", err);
      Alert.alert("Error", "No se pudo actualizar el perfil");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Editar perfil</Text>

      <View style={styles.avatarContainer}>
        {user?.profilePicture ? (
          <Image source={{ uri: user.profilePicture }} style={styles.avatar} />
        ) : (
          <Ionicons name="person-circle-outline" size={100} color="#888" />
        )}
      </View>

      <Text style={styles.label}>Nombre</Text>
      <TextInput value={name} onChangeText={setName} style={styles.input} />

      <Text style={styles.label}>Correo electrónico</Text>
      <TextInput value={email} editable={false} style={[styles.input, { opacity: 0.6 }]} />

      <Button fullWidth onPress={handleSave} disabled={loading}>
        {loading ? "Guardando..." : "Guardar cambios"}
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  avatarContainer: { alignItems: "center", marginBottom: 20 },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  label: { fontWeight: "600", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
});
