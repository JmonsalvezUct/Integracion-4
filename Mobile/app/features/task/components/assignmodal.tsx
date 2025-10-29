import React from "react";
import { Modal, View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";

// 🎨 Hook de tema
import { useThemedColors } from "@/hooks/use-theme-color";

interface AssignModalProps {
  visible: boolean;
  onClose: () => void;
  users: { id: number; name: string }[];
  onAssign: (userId: number) => void;
}

export function AssignModal({ visible, onClose, users, onAssign }: AssignModalProps) {
  const { CARD_BG, CARD_BORDER, TEXT, SUBTEXT, isDark } = useThemedColors();

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View
          style={[
            styles.container,
            { backgroundColor: CARD_BG, borderColor: CARD_BORDER, borderWidth: 1 },
          ]}
        >
          <Text style={[styles.title, { color: TEXT }]}>Asignar tarea</Text>
          <Text style={[styles.subtitle, { color: SUBTEXT }]}>Selecciona un usuario:</Text>

          <FlatList
            data={users}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.userItem,
                  { borderBottomColor: isDark ? "#2a2a2a" : "#eee" },
                ]}
                onPress={() => onAssign(item.id)}
              >
                <Text style={[styles.userName, { color: TEXT }]}>{item.name}</Text>
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
    borderRadius: 16,
    padding: 20,
    elevation: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    marginBottom: 10,
    textAlign: "center",
  },
  userItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  userName: {
    fontSize: 16,
    textAlign: "center",
  },
  cancel: {
    marginTop: 14,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#E74C3C", // 🔴 se mantiene el color original
  },
  cancelText: {
    color: "#fff",
    fontWeight: "600",
    textAlign: "center",
  },
});
