    import React, { useState } from "react";
    import {
    View, Text, TouchableOpacity, TextInput, FlatList, Modal, ActivityIndicator, Alert, StyleSheet
    } from "react-native";
    import { Ionicons } from "@expo/vector-icons";
    import { useRouter, useLocalSearchParams } from "expo-router";
    import { useSprints } from "../hooks/useSprints";
    import { useSprintForm } from "../hooks/useSprintForm";
    import { useThemedColors } from "@/hooks/use-theme-color";
 


    export default function SprintsScreen({ projectId }: { projectId: string }) {
    const router = useRouter();
    const { sprints, loading, fetchSprints, deleteSprint, finalizeSprint } = useSprints(Number(projectId));
    const {
    BG,
    CARD_BG,
    CARD_BORDER,
    TEXT,
    SUBTEXT,
    MODAL_BG,
    INPUT_BG,
    INPUT_BORDER,
    PLACEHOLDER,
    } = useThemedColors();

    const {
        newSprint,
        setNewSprint,
        dateErrors,
        setDateErrors,
        formatDateInput,
        validateDate,
        createSprint,
    } = useSprintForm(Number(projectId), fetchSprints);


    const [modalVisible, setModalVisible] = useState(false);

    return (
        <View style={[styles.container, { backgroundColor: BG }]}>



        {/* Encabezado */}
        <View style={styles.topRow}>
            <Text style={[styles.sectionTitle, { color: TEXT }]}>Sprints</Text>

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
            <TouchableOpacity
            onPress={() =>
                router.push({
                pathname: "/features/task/components/sprint-detail",
                params: { projectId, sprintId: item.id },
                })
            }
            activeOpacity={0.8}
            >
            <View
                style={[
                styles.card,
                { backgroundColor: CARD_BG, borderColor: CARD_BORDER }
                ]}
            >
                <View style={styles.cardHeader}>
                <Text style={[styles.cardTitle, { color: TEXT }]}>{item.name}</Text>

                <Text
                    style={{
                    color: item.isActive ? "#009688" : SUBTEXT,
                    fontWeight: "600",
                    }}
                >
                    {item.isActive ? "Activo" : "Finalizado"}
                </Text>
                </View>

                <Text style={[styles.cardDesc, { color: SUBTEXT }]}>
                {item.description || "Sin descripción"}
                </Text>

                <Text style={[styles.cardDate, { color: SUBTEXT }]}>
                {new Date(item.startDate).toLocaleDateString()} →
                {item.endDate ? new Date(item.endDate).toLocaleDateString() : "En curso"}
                </Text>
            </View>
            </TouchableOpacity>
        )}
        />
        )}

            <Modal visible={modalVisible} transparent animationType="slide">
            <View style={styles.modalOverlay}>
                <View style={[styles.modalBox, { backgroundColor: MODAL_BG }]}>
                <Text style={[styles.modalTitle, { color: TEXT }]}>Nuevo Sprint</Text>

                {/* Nombre */}
                <TextInput
                    placeholder="Nombre"
                    placeholderTextColor={PLACEHOLDER}
                    style={[
                    styles.input,
                    {
                        backgroundColor: INPUT_BG,
                        borderColor: INPUT_BORDER,
                        color: TEXT,
                    },
                    ]}
                    value={newSprint.name}
                    onChangeText={(t) => setNewSprint({ ...newSprint, name: t })}
                />

                {/* Descripción */}
                <TextInput
                    placeholder="Descripción (opcional)"
                    placeholderTextColor={PLACEHOLDER}
                    style={[
                    styles.input,
                    {
                        backgroundColor: INPUT_BG,
                        borderColor: INPUT_BORDER,
                        color: TEXT,
                    },
                    ]}
                    value={newSprint.description}
                    onChangeText={(t) => setNewSprint({ ...newSprint, description: t })}
                />

                {/* Fechas */}
                {(["startDate", "endDate"] as const).map((field) => (
                    <View key={field}>
                    <TextInput
                        placeholder={`Fecha ${
                        field === "startDate" ? "inicio" : "fin"
                        } (DD/MM/YYYY)`}
                        placeholderTextColor={PLACEHOLDER}
                        style={[
                        styles.input,
                        {
                            backgroundColor: INPUT_BG,
                            borderColor: dateErrors[field] ? "red" : INPUT_BORDER,
                            color: TEXT,
                        },
                        ]}
                        value={newSprint[field]}
                        keyboardType="numeric"
                        maxLength={10}
                        onChangeText={(t) => {
                        const formatted = formatDateInput(t);
                        setNewSprint({ ...newSprint, [field]: formatted });
                        setDateErrors((prev) => ({
                            ...prev,
                            [field]:
                            formatted.length === 10 ? validateDate(formatted) : "",
                        }));
                        }}
                    />
                    {dateErrors[field] ? (
                        <Text style={styles.errorText}>{dateErrors[field]}</Text>
                    ) : null}
                    </View>
                ))}

                {/* Acciones */}
                <View style={styles.modalActions}>
                    <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Text style={[styles.cancelText, { color: SUBTEXT }]}>
                        Cancelar
                    </Text>
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
    container: { flex: 1 },

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
        backgroundColor: "#0097A7",
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
        backgroundColor: "#0097A7",
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

    stateButton: {
    backgroundColor: "#E3F2FD",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignSelf: "flex-start",
    },

    stateButtonText: {
    color: "#1565C0",
    fontWeight: "600",
    fontSize: 13,
    },

    
    });