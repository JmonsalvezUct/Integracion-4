import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useProjectInvitations } from "../hooks/useProjectInvitations";
import { InviteModal } from "../components/InviteModal";
import { useThemedColors } from "@/hooks/use-theme-color";

const statuses = ["Pendiente", "Aceptado", "Rechazado"];
const statusMap: Record<string, string> = {
  Pendiente: "PENDING",
  Aceptado: "ACCEPTED",
  Rechazado: "REJECTED",
};

interface Props {
  projectId: number;
}

export default function ProjectInvitationsScreen({ projectId }: Props) {
  const [filter, setFilter] = useState("PENDING");
  const [showInvite, setShowInvite] = useState(false);

  const {
    BG,
    BRAND,
    CARD_BG,
    CARD_BORDER,
    TEXT,
    SUBTEXT,
    SUCCESS,
    WARNING,
    DANGER,
  } = useThemedColors();

  const { invitations, loading, error, refetch } = useProjectInvitations(
    Number(projectId),
    filter
  );

  return (
    <View style={[styles.container, { backgroundColor: BG }]}>
      <InviteModal
        visible={showInvite}
        onClose={() => setShowInvite(false)}
        projectId={Number(projectId)}
        onCreated={refetch}
      />

      {/* STATUS TABS */}
      <View style={styles.tabsRow}>
        {statuses.map((s) => {
          
          const active = filter === statusMap[s];
          return (
            <TouchableOpacity
              key={s}
              onPress={() => setFilter(statusMap[s])}
              style={[
                styles.tabBtn,
                {
                  backgroundColor: active ? BRAND : "transparent",
                  borderColor: active ? BRAND : CARD_BORDER,
                },
              ]}
            >
              <Text
                style={{
                  color: active ? "#fff" : TEXT,
                  fontWeight: "600",
                }}
              >
                {s}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* CONTENT LIST */}
      {loading ? (
        <ActivityIndicator size="large" color={BRAND} style={{ marginTop: 20 }} />
      ) : error ? (
        <Text style={{ color: DANGER }}>Error: {error}</Text>
      ) : invitations.length === 0 ? (
        <View style={{ marginTop: 30, alignItems: "center" }}>
          <Text style={{ color: SUBTEXT }}>No hay invitaciones.</Text>
        </View>
      ) : (
        <FlatList
          data={invitations}
          keyExtractor={(i) => String(i.id)}
          refreshing={loading}
          onRefresh={refetch}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => {
          const statusColor =
            item.status === "PENDING"
              ? WARNING
              : item.status === "ACCEPTED"
              ? SUCCESS
              : DANGER;

          const statusLabel =
            item.status === "PENDING"
              ? "Pendiente"
              : item.status === "ACCEPTED"
              ? "Aceptado"
              : "Rechazado";

          return (
            <View
              style={{
                backgroundColor: CARD_BG,
                borderRadius: 10,
                padding: 14,
                marginBottom: 10,
                borderWidth: 1,
                borderColor: CARD_BORDER,
              }}
            >
              <Text style={{ color: TEXT, fontSize: 16, fontWeight: "600" }}>
                {item.email}
              </Text>

              <Text style={{ color: SUBTEXT, marginTop: 4 }}>
                Rol: {item.role}
              </Text>

              <Text style={{ color: statusColor, marginTop: 2, fontWeight: "600" }}>
                Estado: {statusLabel}
              </Text>
            </View>


            );
          }}
        />
      )}

      {/* FAB BUTTON */}
      <TouchableOpacity
        style={[
          styles.fab,
          {
            backgroundColor: BRAND,
          },
        ]}
        onPress={() => setShowInvite(true)}
      >
        <Text style={{ color: "#fff", fontSize: 20 }}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

/* ============================
   STYLES
============================ */
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  /* ▌ TABS ▌*/
  tabsRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 12,
    marginBottom: 10,
  },
  tabBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 10,
  },

  /* ▌ CARD ▌*/
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  cardEmail: {
    fontSize: 16,
    fontWeight: "600",
  },

  /* ▌ FLOATING BUTTON ▌*/
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    padding: 16,
    borderRadius: 999,
    elevation: 8,
  },
});
