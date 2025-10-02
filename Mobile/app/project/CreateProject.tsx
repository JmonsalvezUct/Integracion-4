    import React, { useState } from "react";
    import { View, Text, TextInput, Button, Alert } from "react-native";
    import { useRouter } from "expo-router";
    import { getAccessToken } from "@/lib/secure-store";


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
        if (!token) {
        Alert.alert("Error", "No se encontró token de autenticación.");
        return;
        }

        const projectPayload = {
        name,
        description: description || undefined,
        startDate: startDate ? new Date(startDate).toISOString() : undefined,
        endDate: endDate ? new Date(endDate).toISOString() : undefined,
        status: status || undefined,
        userId: 1, 
        };
        const API_BASE = "https://integracion-4.onrender.com";
        setLoading(true);
        try {
        const res = await fetch(`${API_BASE}/api/projects`, {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(projectPayload),
        });

        if (res.ok) {
            Alert.alert("Proyecto creado exitosamente");
            router.replace("/"); 
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
        <View style={{ flex: 1, padding: 20, backgroundColor: "#fff", justifyContent: "center" }}>
        <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 16 }}>
            Crear nuevo proyecto
        </Text>

        <TextInput
            placeholder="Nombre del proyecto *"
            value={name}
            onChangeText={setName}
            style={styles.input}
        />

        <TextInput
            placeholder="Descripción (opcional)"
            value={description}
            onChangeText={setDescription}
            style={styles.input}
        />

        <TextInput
            placeholder="Fecha de inicio (YYYY-MM-DD)"
            value={startDate}
            onChangeText={setStartDate}
            style={styles.input}
        />

        <TextInput
            placeholder="Fecha de fin (YYYY-MM-DD)"
            value={endDate}
            onChangeText={setEndDate}
            style={styles.input}
        />

        <TextInput
            placeholder="Estado (opcional)"
            value={status}
            onChangeText={setStatus}
            style={styles.input}
        />

        <Button
            title={loading ? "Creando..." : "Crear Proyecto"}
            onPress={handleCreate}
            disabled={loading}
            color="#3f3df8"
        />
        </View>
    );
    }

    const styles = {
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
    },
    };
