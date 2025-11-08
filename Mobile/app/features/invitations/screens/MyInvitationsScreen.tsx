import { SafeAreaView } from "react-native";
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useInvitations } from "../hooks/useinvitations";
import { useThemedColors } from "@/hooks/use-theme-color";

export default function MyInvitationsScreen() {
  const { invitations, loading, handleAccept, handleReject } = useInvitations();
  const insets = useSafeAreaInsets();
  const { BG, TEXT, SUBTEXT, BRAND, CARD_BG, CARD_BORDER, SUCCESS, DANGER } = useThemedColors();

  if (loading) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: BG, paddingTop: insets.top }]} >
        <ActivityIndicator size="large" color={BRAND} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: BG, paddingTop: Math.max(12, insets.top) }]}>
      <Text style={[styles.title, { color: TEXT }]}>Mis Invitaciones</Text>

      <FlatList
        data={invitations}
        keyExtractor={(item) => String(item.id)}

        contentContainerStyle={{ paddingTop: 8, paddingBottom: 24, paddingHorizontal: 16 }}
        renderItem={({ item }) => {
          const statusColor =
            item.status === "PENDING" ? BRAND : item.status === "ACCEPTED" ? SUCCESS : DANGER;

          return (
            <View style={[styles.card, { backgroundColor: CARD_BG, borderColor: CARD_BORDER }]}>
              <Text style={[styles.cardTitle, { color: TEXT }]}>
                {item.project?.name ?? "Proyecto sin nombre"}
              </Text>
              <Text style={{ color: SUBTEXT, marginTop: 4 }}>Rol: {item.role}</Text>
              <Text style={{ color: statusColor, marginTop: 2, fontWeight: "600" }}>
                Estado: {item.status}
              </Text>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={{ color: SUBTEXT }}>No tienes invitaciones</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,  
    paddingHorizontal: 16,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
});
