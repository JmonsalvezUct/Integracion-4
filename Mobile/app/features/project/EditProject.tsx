    import React, { useEffect, useState } from "react";
    import {
    View,
    TextInput,
    TouchableOpacity,
    Text,
    Alert,
    StyleSheet,
    ActivityIndicator,
    } from "react-native";
    import {  useRouter } from "expo-router";
    import { getAccessToken } from "@/lib/secure-store"; 


    const PRIMARY_COLOR = "#3B34FF";
    import { apiFetch } from "@/lib/api-fetch";

    export default function EditProjectScreen({ projectId }: { projectId: string }) {

    const id = projectId;
    const router = useRouter();

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState("active");
    const [projectTitle, setProjectTitle] = useState("");
    const [loading, setLoading] = useState(true);

    

    useEffect(() => {
        const loadProject = async () => {
        try {
            console.log("🧠 ID del proyecto:", id);

            const token = await getAccessToken();
            if (!token) {
            console.warn("⚠️ No hay token guardado");
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
            console.error(" Error al cargar proyecto:", error);
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

        const text = await res.text();

        if (!res.ok) throw new Error(`Error HTTP (${res.status})`);

        Alert.alert("Éxito", "Proyecto actualizado correctamente");
        router.back();
        } catch (error) {
        console.error(" Error al guardar proyecto:", error);
        Alert.alert("Error", "No se pudo actualizar el proyecto.");
        }
    };

    if (loading) {
        return (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={PRIMARY_COLOR} />
        </View>
        );
    }

    return (
        <View style={styles.container}>
        <Text style={styles.title}>Editar Proyecto</Text>

        <Text style={styles.projectName}>{projectTitle}</Text>

        <TextInput
            placeholder="Nuevo nombre"
            placeholderTextColor="#999"
            value={name}
            onChangeText={setName}
            style={styles.input}
        />

        <TextInput
            placeholder="Descripción"
            placeholderTextColor="#999"
            value={description}
            onChangeText={setDescription}
            style={[styles.input, styles.textArea]}
            multiline
        />

        <TouchableOpacity style={styles.button} onPress={handleSave}>
            <Text style={styles.buttonText}>GUARDAR CAMBIOS</Text>
        </TouchableOpacity>
        </View>
    );
    }

    const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 24,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#000",
        marginBottom: 8,
        textAlign: "center",
    },
    projectName: {
        fontSize: 16,
        color: "#666",
        marginBottom: 24,
        textAlign: "center",
    },
    input: {
        width: "100%",
        backgroundColor: "#f9f9f9",
        borderColor: "#ddd",
        borderWidth: 1,
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
        fontSize: 16,
        marginBottom: 16,
    },
    textArea: {
        height: 100,
        textAlignVertical: "top",
    },
    button: {
        width: "100%",
        backgroundColor: PRIMARY_COLOR,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: "center",
        marginTop: 8,
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    });
