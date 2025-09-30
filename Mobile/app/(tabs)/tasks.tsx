import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Header from "../../components/ui/header";
const PRIMARY = "#3B34FF";

export default function TasksScreen() {
  const router = useRouter();

  return (
      <SafeAreaView style={styles.container}>
      <Header title="Tareas" />




      <View style={{ flex: 1, padding: 16, backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24 }}>
        <Text style={{ color: "#666" }}>Listado de tareas…</Text>
      </View>

     
      <TouchableOpacity style={styles.fab} onPress={() => router.push("/task/new")}  activeOpacity={0.9}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PRIMARY,
  },
  content: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 28,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#5B55FF",
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
});
