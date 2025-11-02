    import React, { useState } from "react";
    import {
    View, Text, TouchableOpacity, TextInput, FlatList, Modal, ActivityIndicator, Alert, StyleSheet
    } from "react-native";
    import { Ionicons } from "@expo/vector-icons";
    import { useRouter, useLocalSearchParams } from "expo-router";
    import { useSprints } from "../hooks/useSprints";
    import { useSprintForm } from "../hooks/useSprintForm";

    export default function SprintsScreen() {
    const params = useLocalSearchParams();
    const projectId = Number(Array.isArray(params.projectId) ? params.projectId[0] : params.projectId);
    const router = useRouter();
    const { sprints, loading, fetchSprints, deleteSprint, finalizeSprint } = useSprints(projectId);
    const {
    newSprint,
    setNewSprint,
    dateErrors,
    setDateErrors, 
    formatDateInput,
    validateDate,
    createSprint,
    } = useSprintForm(projectId, fetchSprints);


    const [modalVisible, setModalVisible] = useState(false);

    return (
        <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerText}>Sprints del Proyecto</Text>
        </View>

        {/* Encabezado */}
        <View style={styles.topRow}>
            <Text style={styles.sectionTitle}>Sprints</Text>
            <TouchableOpacity style={styles.newButton} onPress={() => setModalVisible(true)}>
            <Text style={styles.newButtonText}>+ Nuevo</Text>
            </TouchableOpacity>
        </View>

        {/* Lista */}
        {loading ? (
            <ActivityIndicator size="large" color="#3B34FF" style={{ marginTop: 20 }} />
        ) : (
            <FlatList
            data={sprints}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ padding: 16 }}
            renderItem={({ item }) => (
                <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>{item.name}</Text>
                    <View style={styles.cardActions}>
                    <TouchableOpacity onPress={() => finalizeSprint(item.id)}>
                        <Ionicons
                        name="checkmark-circle"
                        size={22}
                        color={item.isActive ? "#009688" : "#999"}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => deleteSprint(item.id)}>
                        <Ionicons name="trash-outline" size={22} color="#FF4D4D" />
                    </TouchableOpacity>
                    </View>
                </View>
                <Text style={styles.cardDesc}>{item.description || "Sin descripción"}</Text>
                <Text style={styles.cardDate}>
                    {new Date(item.startDate).toLocaleDateString()} →{" "}
                    {item.endDate ? new Date(item.endDate).toLocaleDateString() : "En curso"}
                </Text>
                </View>
            )}
            />
        )}

        {/* Botón flotante */}
        <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
            <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>

        {/* Modal del formulario */}
        <Modal visible={modalVisible} transparent animationType="slide">
            <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
                <Text style={styles.modalTitle}>Nuevo Sprint</Text>

                <TextInput
                placeholder="Nombre"
                style={styles.input}
                value={newSprint.name}
                onChangeText={(t) => setNewSprint({ ...newSprint, name: t })}
                />
                <TextInput
                placeholder="Descripción (opcional)"
                style={styles.input}
                value={newSprint.description}
                onChangeText={(t) => setNewSprint({ ...newSprint, description: t })}
                />

            {(["startDate", "endDate"] as const).map((field) => (
            <View key={field}>
                <TextInput
                placeholder={`Fecha ${field === "startDate" ? "inicio" : "fin"} (DD/MM/YYYY)`}
                style={[styles.input, dateErrors[field] && { borderColor: "red" }]}
                value={newSprint[field]}
                keyboardType="numeric"
                maxLength={10}
                onChangeText={(t) => {
                    const formatted = formatDateInput(t);
                    setNewSprint({ ...newSprint, [field]: formatted });
                    setDateErrors((prev: { startDate: string; endDate: string }) => ({
                    ...prev,
                    [field]: formatted.length === 10 ? validateDate(formatted) : "",
                    }));

                }}
                />
                {dateErrors[field] ? <Text style={styles.errorText}>{dateErrors[field]}</Text> : null}
            </View>
            ))}


                <View style={styles.modalActions}>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Text style={styles.cancelText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                style={styles.createButton}
                onPress={async () => {
                    const success = await createSprint();
                    if (success) setModalVisible(false); 
                }}
                >
                <Text style={styles.createText}>Crear</Text>
                </TouchableOpacity>

                </View>
            </View>
            </View>
        </Modal>
        </View>
    );
    }
    const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F8F9FF" },
    header: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#0097A7",
        padding: 16,
    },
    headerText: { color: "#fff", fontSize: 18, fontWeight: "600", marginLeft: 10 },
    topRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
    },
    sectionTitle: { fontSize: 20, fontWeight: "700", color: "#1A1A1A" },
    newButton: {
        backgroundColor: "#3B34FF",
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    newButtonText: { color: "#fff", fontWeight: "600" },
    card: {
        backgroundColor: "#fff",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E6E6E6",
        padding: 16,
        marginBottom: 12,
    },
    cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    cardTitle: { fontSize: 16, fontWeight: "700", color: "#1A1A1A" },
    cardDesc: { color: "#666", marginTop: 4 },
    cardDate: { color: "#999", fontSize: 13, marginTop: 4 },
    cardActions: { flexDirection: "row", gap: 10 },
    fab: {
        position: "absolute",
        right: 24,
        bottom: 24,
        backgroundColor: "#3B34FF",
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: "center",
        justifyContent: "center",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalBox: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 20,
        width: "90%",
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#1A1A1A",
        textAlign: "center",
        marginBottom: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: "#E6E6E6",
        borderRadius: 8,
        padding: 10,
        marginBottom: 10,
    },
    errorText: {
        color: "red",
        fontSize: 12,
        marginBottom: 6,
        marginLeft: 4,
    },
    modalActions: {
        flexDirection: "row",
        justifyContent: "flex-end",
        marginTop: 10,
        gap: 10,
    },
    cancelText: { color: "#666", fontWeight: "500" },
    createButton: {
        backgroundColor: "#3B34FF",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 10,
    },
    createText: { color: "#fff", fontWeight: "600" },
    });
