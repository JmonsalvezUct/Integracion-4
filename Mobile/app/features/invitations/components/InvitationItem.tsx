import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export function InvitationItem({ item, onAccept, onReject }: any) {
  return (
    <View style={styles.card}>
      <Text style={styles.email}>{item.email}</Text>
      <Text>Proyecto: {item.project?.name ?? item.projectId}</Text>
      <Text style={styles.role}>Rol: {item.role}</Text>
      <Text style={styles.status}>Estado: {item.status}</Text>

      <View style={styles.row}>
        {item.status === "PENDING" && (
          <>
            <TouchableOpacity style={styles.acceptBtn} onPress={() => onAccept(item.id)}>
              <Text style={styles.btnText}>Aceptar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.rejectBtn} onPress={() => onReject(item.id)}>
              <Text style={styles.btnText}>Rechazar</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 10,
    borderColor: "#ddd",
    borderWidth: 1,
  },
  email: { fontSize: 16, fontWeight: "600" },
  project: { fontSize: 14 },
  role: { fontSize: 14 },
  status: { fontSize: 14, marginBottom: 6 },
  row: { flexDirection: "row", gap: 10 },
  acceptBtn: { backgroundColor: "green", padding: 8, borderRadius: 6 },
  rejectBtn: { backgroundColor: "red", padding: 8, borderRadius: 6 },
  btnText: { color: "#fff", fontWeight: "600" },
});
