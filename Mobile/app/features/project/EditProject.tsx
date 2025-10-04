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
    import { useLocalSearchParams, useRouter } from "expo-router";

    export default function EditProjectScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState("active");
    const [projectTitle, setProjectTitle] = useState(""); 
    const [loading, setLoading] = useState(true);

    const API_BASE = "https://integracion-4.onrender.com";

    useEffect(() => {
        const loadProject = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/projects/1`);
            const data = await res.json();
            setName(data.name);
            setDescription(data.description || "");
            setStatus(data.status);
            setProjectTitle(data.name); 
        } catch (error) {
            Alert.alert("Error", "No se pudo cargar el proyecto");
        } finally {
            setLoading(false);
        }
        };

        loadProject();
    }, [id]);

    const handleSave = async () => {
        try {
        const res = await fetch(`${API_BASE}/api/projects/1`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, description, status }),
        });

        if (!res.ok) throw new Error("Error HTTP");
        Alert.alert(" Éxito", "Proyecto actualizado correctamente");
        router.back();
        } catch (error) {
        Alert.alert("Error", "No se pudo actualizar");
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

    const PRIMARY_COLOR = "#3B34FF";

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
