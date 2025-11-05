import React, { useState } from "react";
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useProjectInvitations } from "../hooks/useProjectInvitations";
import { InviteModal } from "../components/InviteModal";

const statuses = ["PENDING", "ACCEPTED", "REJECTED"];


export default function ProjectInvitationsScreen() {
  const { projectId } = useLocalSearchParams();
  const [filter, setFilter] = useState("PENDING");
  const [showInvite, setShowInvite] = useState(false);
  const { invitations, loading, error, refetch } = useProjectInvitations(
    Number(projectId),
    filter
  );

  return (
    <View style={{ flex: 1 }}>
      <InviteModal
        visible={showInvite}
        onClose={() => setShowInvite(false)}
        projectId={Number(projectId)}
        onCreated={refetch}
      />
      {/* Status tabs */}

      <View style={{ flexDirection: "row" }}>
        {statuses.map((s) => (
          <TouchableOpacity key={s} onPress={() => setFilter(s)} style={{ padding: 10 }}>
            <Text style={{ fontWeight: s === filter ? "bold" : "normal" }}>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>
          <TouchableOpacity
    style={{
      position: "absolute",
      right: 20,
      bottom: 20,
      backgroundColor: "#3B82F6",
      padding: 14,
      borderRadius: 999,
    }}
    onPress={() => setShowInvite(true)}
  >
    <Text style={{ color: "white", fontSize: 18 }}>+</Text>
  </TouchableOpacity>

      {/* Content */}
      {loading ? (
        <ActivityIndicator size="large" />
      ) : error ? (
        <Text>Error: {error}</Text>
      ) : (
        <FlatList
          data={invitations}
          keyExtractor={(i) => String(i.id)}
          onRefresh={refetch}
          refreshing={loading}
          renderItem={({ item }) => (
            <View style={{ padding: 12, borderBottomWidth: 1 }}>
              <Text>Email: {item.email}</Text>
              <Text>Role: {item.role}</Text>
              <Text>Status: {item.status}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}
