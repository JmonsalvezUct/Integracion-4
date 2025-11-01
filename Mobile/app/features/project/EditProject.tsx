import React, { useEffect, useState } from "react";
import { View, Text, Alert, StyleSheet} from "react-native";
import { useRouter } from "expo-router";
import { getAccessToken } from "@/lib/secure-store";
import { apiFetch } from "@/lib/api-fetch";
import { useThemedColors } from "@/hooks/use-theme-color"; 
import LayoutContainer from "@/components/layout/layout_container"; //Layout y márgenes globales
import { CONTAINER } from "@/constants/spacing";
import Loader from "@/components/ui/Loader";

//Componentes reutilizables
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";

export default function EditProjectScreen({ projectId }: { projectId: string }) {
  const id = projectId;
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("active");
  const [projectTitle, setProjectTitle] = useState("");
  const [loading, setLoading] = useState(true);

  // Tokens del tema
  const { BG, TEXT, BRAND, PLACEHOLDER, SUBTEXT } = useThemedColors();

  useEffect(() => {
    const loadProject = async () => {
      try {
        const token = await getAccessToken();
        if (!token) {
          Alert.alert("No autorizado", "Debes iniciar sesión nuevamente.");
          return;
        }

        const res = await apiFetch(`/projects/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "Error al obtener proyecto");
        }

        const data = await res.json();
        setName(data.name);
        setDescription(data.description || "");
        setStatus(data.status || "active");
        setProjectTitle(data.name);
      } catch (error) {
        console.error("Error al cargar proyecto:", error);
        Alert.alert("Error", "No se pudo cargar el proyecto.");
      } finally {
        setLoading(false);
      }
    };

    if (id) loadProject();
  }, [id]);

  const handleSave = async () => {
    try {
      const token = await getAccessToken();
      if (!token) {
        Alert.alert("No autorizado", "Debes iniciar sesión nuevamente.");
        return;
      }

      const body = {
        ...(name && { name }),
        ...(description && { description }),
        ...(status && { status }),
      };

      const res = await apiFetch(`/projects/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      await res.text();
      if (!res.ok) throw new Error(`Error HTTP (${res.status})`);

      Alert.alert("Éxito", "Proyecto actualizado correctamente");
      router.back();
    } catch (error) {
      console.error("Error al guardar proyecto:", error);
      Alert.alert("Error", "No se pudo actualizar el proyecto.");
    }
  };

  if (loading) {
  return (
    <LayoutContainer scroll={false} style={{ backgroundColor: BG }}>
      <Loader />
    </LayoutContainer>
  );
}

  return (
    <LayoutContainer scroll={false} style={{ backgroundColor: BG }}>
      <View
        style={{
          flex: 1,
          width: "100%",
          paddingHorizontal: CONTAINER.horizontal,
          paddingTop: CONTAINER.top,
          paddingBottom: CONTAINER.bottom,
          alignItems: "center",
        }}
      >
        <Text style={[styles.title, { color: TEXT }]}>Editar Proyecto</Text>
        <Text style={[styles.projectName, { color: SUBTEXT }]}>{projectTitle}</Text>

        {/* Inputs con relleno gris del tema (Colors.card) y borde que usa Colors.primary al foco */}
        <Input
          placeholder="Nuevo nombre"
          placeholderTextColor={PLACEHOLDER}
          value={name}
          onChangeText={setName}
          variant="surface"
          containerStyle={{ width: "100%", marginBottom: 16 }}
          autoCapitalize="sentences"
          returnKeyType="next"
        />

        <Input
          placeholder="Descripción"
          placeholderTextColor={PLACEHOLDER}
          value={description}
          onChangeText={setDescription}
          multiline
          variant="surface"
          containerStyle={{ width: "100%", marginBottom: 24 }}
          inputStyle={{ height: 100, textAlignVertical: "top" }}
        />

        <Button title="GUARDAR CAMBIOS" onPress={handleSave} fullWidth />
      </View>
    </LayoutContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  projectName: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: "center",
  },
});
