import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from "react-native";
import { useMyInvitations } from "../hooks/useMyInvitations";

export default function MyInvitationsScreen() {
  const { invitations, loading, handleAccept, handleReject } = useMyInvitations();

  if (loading) return <ActivityIndicator size="large" />;

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 12 }}>
        Mis Invitaciones
      </Text>

      <FlatList
        data={invitations}
        keyExtractor={(i) => String(i.id)}
        renderItem={({ item }) => (
          <View style={{ padding: 12, borderBottomWidth: 1 }}>
            <Text>Email: {item.email}</Text>
            <Text>Role: {item.role}</Text>
            <Text>Status: {item.status}</Text>

            {item.status === "PENDING" && (
              <View style={{ flexDirection: "row", marginTop: 10, gap: 10 }}>
                <TouchableOpacity
                  style={{ backgroundColor: "green", padding: 10, borderRadius: 6 }}
                  onPress={() => handleAccept(item.id)}
                >
                  <Text style={{ color: "white" }}>Aceptar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{ backgroundColor: "red", padding: 10, borderRadius: 6 }}
                  onPress={() => handleReject(item.id)}
                >
                  <Text style={{ color: "white" }}>Rechazar</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
        ListEmptyComponent={<Text>No tienes invitaciones pendientes</Text>}
      />
    </View>
  );
}
