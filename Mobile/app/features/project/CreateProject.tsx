    import React, { useState } from "react";
    import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView } from "react-native";
    import { useRouter } from "expo-router";
    import { getAccessToken, getUserId } from "@/lib/secure-store";

    import { apiFetch } from "@/lib/api-fetch";

    export default function CreateProject() {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [status, setStatus] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleCreate = async () => {
        if (name.trim().length < 2) {
        Alert.alert("Nombre inválido", "Debe tener al menos 2 caracteres.");
        return;
        }

        const token = await getAccessToken();
        const userId = await getUserId(); 

        if (!token) {
        Alert.alert("Error", "No se encontró token de autenticación.");
        return;
        }
        if (!userId) {
            Alert.alert("Error", "No se encontró el ID del usuario autenticado.");
            return;
        }
        const projectPayload = {
        name,
        description: description || undefined,
        startDate: startDate ? new Date(startDate).toISOString() : undefined,
        endDate: endDate ? new Date(endDate).toISOString() : undefined,
        status: status || undefined,
        userId: Number(userId),
        };

        setLoading(true);
        try {
        const res = await apiFetch(`/projects`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, 
        },
        body: JSON.stringify(projectPayload),
        });

        if (res.ok) {
            Alert.alert("Proyecto creado exitosamente");
            router.back()
        } else {
            const error = await res.text();
            Alert.alert("Error al crear proyecto", error || "Error desconocido");
        }
        } catch (error) {
        Alert.alert("Error", "No se pudo conectar con el servidor.");
        console.error("Error creando proyecto:", error);
        } finally {
        setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>

        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backArrow}>←</Text>
            <Text style={styles.backText}>Volver</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Crear Proyecto</Text>
        <Text style={styles.subtitle}>Completa la información para continuar</Text>

        <TextInput
            placeholder="Nombre del proyecto *"
            value={name}
            onChangeText={setName}
            style={styles.input}
            placeholderTextColor="#999"
        />

        <TextInput
            placeholder="Descripción (opcional)"
            value={description}
            onChangeText={setDescription}
            style={[styles.input, styles.multilineInput]}
            placeholderTextColor="#999"
            multiline
        />

        <TextInput
            placeholder="Fecha de inicio (YYYY-MM-DD)"
            value={startDate}
            onChangeText={setStartDate}
            style={styles.input}
            placeholderTextColor="#999"
        />

        <TextInput
            placeholder="Fecha de fin (YYYY-MM-DD)"
            value={endDate}
            onChangeText={setEndDate}
            style={styles.input}
            placeholderTextColor="#999"
        />

        <TextInput
            placeholder="Estado (opcional)"
            value={status}
            onChangeText={setStatus}
            style={styles.input}
            placeholderTextColor="#999"
        />

        <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.7 }]}
            onPress={handleCreate}
            disabled={loading}
        >
            <Text style={styles.buttonText}>
            {loading ? "Creando..." : "GUARDAR CAMBIOS"}
            </Text>
        </TouchableOpacity>
        </ScrollView>
    );
    }

    const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: "#fff",
        padding: 24,
        paddingTop: 50, 
    },
    backButton: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
    },
    backArrow: {
        fontSize: 22,
        color: "#3f3df8",
        marginRight: 4,
    },
    backText: {
        color: "#3f3df8",
        fontSize: 16,
        fontWeight: "500",
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: "#999",
        textAlign: "center",
        marginBottom: 24,
    },
    input: {
        borderWidth: 1,
        borderColor: "#e0e0e0",
        borderRadius: 10,
        padding: 12,
        fontSize: 15,
        marginBottom: 12,
        backgroundColor: "#f9f9f9",
    },
    multilineInput: {
        minHeight: 70,
        textAlignVertical: "top",
    },
    button: {
        backgroundColor: "#3f3df8",
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 8,
    },
    buttonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 15,
        textTransform: "uppercase",
    },
    });
