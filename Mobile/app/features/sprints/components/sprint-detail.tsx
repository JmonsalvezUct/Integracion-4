import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, FlatList, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useThemedColors } from "@/hooks/use-theme-color";
import { useSprintDetail } from "../hooks/useSprintDetail";

export default function SprintDetailScreen() {
  const { projectId, sprintId } = useLocalSearchParams();
  const router = useRouter();

  const {
    BG,
    TEXT,
    SUBTEXT,
    BRAND,
    CARD_BG,
    CARD_BORDER,
    isDark,
  } = useThemedColors();

  const {
    sprint,
    loading,
    tasks,
    assigning,
    toggleTask,
    changeState,
    deleteSprint,
  } = useSprintDetail(Number(projectId), Number(sprintId));

  if (loading)
    return <ActivityIndicator size="large" color={BRAND} style={{ marginTop: 50 }} />;

  return (
    <View style={[styles.container, { backgroundColor: BG }]}>
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={{ color: BRAND, fontWeight: "600", marginBottom: 20 }}>← Volver</Text>
      </TouchableOpacity>

      <Text style={[styles.title, { color: TEXT }]}>{sprint.name}</Text>
      <Text style={[styles.desc, { color: SUBTEXT }]}>
        {sprint.description || "Sin descripción"}
      </Text>

      <Text style={[styles.date, { color: SUBTEXT }]}>
        {new Date(sprint.startDate).toLocaleDateString()} →
        {sprint.endDate ? new Date(sprint.endDate).toLocaleDateString() : "En curso"}
      </Text>

      {/* BOTONES */}
      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={[styles.buttonPrimary, { backgroundColor: BRAND }]}
          onPress={changeState}
        >
          <Text style={styles.buttonText}>
            {sprint.isActive ? "Finalizar Sprint" : "Reactivar Sprint"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonDanger} onPress={() => deleteSprint(router)}>
          <Text style={styles.buttonText}>Eliminar</Text>
        </TouchableOpacity>
      </View>

      {/* LISTA DE TAREAS */}
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => {
          const isAssigned = item.sprintId === Number(sprintId);

          return (
            <TouchableOpacity
              disabled={assigning}
              onPress={() => toggleTask(item)}
              style={[
                styles.taskCard,
                {
                  backgroundColor: CARD_BG,
                  borderColor: CARD_BORDER,
                },
                isAssigned && {
                  borderColor: BRAND,
                  backgroundColor: isDark ? "#2A2A55" : "#E8EAF6",
                },
              ]}
            >
              <Text style={[styles.taskTitle, { color: TEXT }]}>{item.title}</Text>
              <Text style={[styles.taskStatus, { color: SUBTEXT }]}>{item.status}</Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 6 },
  desc: { marginBottom: 6 },
  date: { marginBottom: 25 },
  buttonGroup: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  buttonPrimary: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonDanger: {
    flex: 1,
    backgroundColor: "#FF4D4D",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "600" },
  taskCard: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  taskTitle: { fontWeight: "600" },
  taskStatus: { fontSize: 12 },
});
