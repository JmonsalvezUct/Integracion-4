import { View, Text, FlatList, ActivityIndicator } from "react-native";
import { InvitationItem } from "../components/InvitationItem";
import { useInvitations } from "../hooks/useinvitations";

export default function MyInvitationsScreen() {
  const { invitations, loading, handleAccept, handleReject } = useInvitations();

  if (loading) {
    return <ActivityIndicator size="large" />;
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 12 }}>
        Mis Invitaciones
      </Text>

      <FlatList
        data={invitations}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <InvitationItem
            item={item}
            onAccept={handleAccept}
            onReject={handleReject}
          />
        )}
        ListEmptyComponent={<Text>No tienes invitaciones</Text>}
      />
    </View>
  );
}
