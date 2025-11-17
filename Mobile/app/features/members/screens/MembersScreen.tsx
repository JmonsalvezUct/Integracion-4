import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Alert } from "react-native";
import { useThemedColors } from "@/hooks/use-theme-color";
import { useProjectMembers } from "@/app/features/members/hooks/useProjectMembers";
import { usePermissions } from "@/app/features/invitations/hooks/usePermissions";
import * as SecureStore from "expo-secure-store";
import { StorageKey } from "@/lib/secure-store";

export default function MembersScreen({ projectId }: { projectId: number }) {
  const { members, loading, updateRole, removeMember } = useProjectMembers(projectId);
  const { can } = usePermissions(projectId);
  const { TEXT, BRAND } = useThemedColors();

  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [openRoleMenu, setOpenRoleMenu] = useState<number | null>(null);


  useEffect(() => {
    const loadUser = async () => {
      const raw = await SecureStore.getItemAsync(StorageKey.userId);
      if (raw) setCurrentUserId(Number(raw));
    };
    loadUser();
  }, []);

  if (loading) return <Text style={{ color: TEXT }}>Cargando miembros...</Text>;


  const confirmDelete = (memberId: number, name: string) => {
    Alert.alert(
      "Confirmar eliminación",
      `¿Estás seguro de eliminar al usuario:\n\n${name}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => removeMember(memberId),
        },
      ]
    );
  };

  return (
    <FlatList
      data={members}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => {
        const isMe = item.userId === currentUserId;
        const isMenuOpen = openRoleMenu === item.userId;

        return (
          <View
            style={{
              padding: 14,
              marginBottom: 8,
              borderRadius: 10,
              backgroundColor: "#1E1E1E", 
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.08)",
            }}
          >
            {/* Nombre + (Tú) */}
            <Text style={{ color: TEXT, fontSize: 16, fontWeight: "700" }}>
              {item.user.name} {isMe && <Text style={{ color: BRAND }}>(Tú)</Text>}
            </Text>

            <Text style={{ color: TEXT, marginBottom: 4 }}>{item.user.email}</Text>

            <Text style={{ color: BRAND, fontWeight: "600" }}>
              Rol actual: {item.role}
            </Text>

            {/* Acciones de administración */}
            {can("project", "manageMembers") && (
              <View style={{ marginTop: 10 }}>

                {/* Botón para abrir menú de roles */}
                {!isMe && (
                  <TouchableOpacity
                    onPress={() =>
                      setOpenRoleMenu(isMenuOpen ? null : item.userId)
                    }
                  >
                    <Text style={{ color: BRAND, fontWeight: "700" }}>
                      Cambiar Rol ▾
                    </Text>
                  </TouchableOpacity>
                )}

               {/* Menú desplegable de roles */}
              {isMenuOpen && !isMe && (
                <View style={{ marginTop: 8, paddingLeft: 10, gap: 10 }}>
                  <TouchableOpacity
                    onPress={() => {
                      updateRole(item.userId, "admin");
                      setOpenRoleMenu(null);
                    }}
                  >
                    <Text style={{ color: TEXT }}>Hacer Admin</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      updateRole(item.userId, "developer");
                      setOpenRoleMenu(null);
                    }}
                  >
                    <Text style={{ color: TEXT }}>Hacer Developer</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      updateRole(item.userId, "guest");
                      setOpenRoleMenu(null);
                    }}
                  >
                    <Text style={{ color: TEXT }}>Hacer Invitado</Text>
                  </TouchableOpacity>
                </View>
              )}


                {/* Botón eliminar con confirmación */}

                {!isMe && (
                  <TouchableOpacity
                    style={{ marginTop: 10 }}
                    onPress={() =>
                      Alert.alert(
                        "Confirmar eliminación",
                        `¿Estás seguro de que quieres eliminar a ${item.user.name}?`,
                        [
                          { text: "Cancelar", style: "cancel" },
                          {
                            text: "Eliminar",
                            style: "destructive",
                            onPress: () => removeMember(item.userId),
                          },
                        ]
                      )
                    }
                  >
                    <Text style={{ color: "red" }}>Eliminar</Text>
                  </TouchableOpacity>
                )}


                {/* Si es el propio usuario */}
                {isMe && (
                  <Text style={{ marginTop: 10, color: "gray", fontStyle: "italic" }}>
                    No puedes modificar tu propio rol.
                  </Text>
                )}
              </View>
            )}
          </View>
        );
      }}
    />
  );
}
