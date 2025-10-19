import React from "react";
import { Modal, View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";


interface AssignModalProps {
  visible: boolean;
  onClose: () => void;
  users: { id: number; name: string }[];
  onAssign: (userId: number) => void;
}

export function AssignModal({ visible, onClose, users, onAssign }: AssignModalProps) {
    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
        <View style={styles.overlay}>
            <View style={styles.container}>
            <Text style={styles.title}>Asignar tarea</Text>
            <Text style={styles.subtitle}>Selecciona un usuario:</Text>

            <FlatList
                data={users}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                <TouchableOpacity style={styles.userItem} onPress={() => onAssign(item.id)}>
                    <Text style={styles.userName}>{item.name}</Text>
                </TouchableOpacity>
                )}
            />

            <TouchableOpacity style={styles.cancel} onPress={onClose}>
                <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
            </View>
        </View>
        </Modal>
    );
    }


    const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "center",
        alignItems: "center",
    },
    container: {
        width: "85%",
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 20,
        elevation: 10,
    },
    title: { fontSize: 18, fontWeight: "700", marginBottom: 10, textAlign: "center" },
    subtitle: { color: "#666", marginBottom: 10, textAlign: "center" },
    userItem: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#eee" },
    userName: { fontSize: 16, textAlign: "center", color: "#333" },
    cancel: {
        marginTop: 14,
        paddingVertical: 10,
        borderRadius: 8,
        backgroundColor: "#E74C3C",
    },
    cancelText: { color: "#fff", fontWeight: "600", textAlign: "center" },
    });
