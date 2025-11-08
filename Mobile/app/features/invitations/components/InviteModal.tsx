import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Modal } from "react-native";
import { createInvitation } from "../invitations.api";

interface InviteModalProps {
  visible: boolean;
  onClose: () => void;
  projectId: number;
  onCreated?: () => void;
}

export function InviteModal({
  visible,
  onClose,
  projectId,
  onCreated,
}: InviteModalProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("developer");

  async function handleSend() {
    await createInvitation(projectId, { email, role });
    onCreated?.();
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={{ flex: 1, justifyContent: "center", padding: 24 }}>
        <View style={{ backgroundColor: "#fff", padding: 16, borderRadius: 8 }}>
          <Text>Email:</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            style={{
              borderWidth: 1,
              borderRadius: 6,
              padding: 8,
              marginBottom: 12,
            }}
          />

          <Text>Rol:</Text>
          <TextInput
            value={role}
            onChangeText={setRole}
            style={{
              borderWidth: 1,
              borderRadius: 6,
              padding: 8,
              marginBottom: 12,
            }}
          />

          <TouchableOpacity
            onPress={handleSend}
            
            style={{
              backgroundColor: "#3B82F6",
              padding: 12,
              borderRadius: 6,
              marginBottom: 12,
            }}
          >
            <Text style={{ color: "white", textAlign: "center" }}>Invitar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onClose}
            style={{
              backgroundColor: "#E5E7EB",
              padding: 12,
              borderRadius: 6,
            }}
          >
            <Text style={{ textAlign: "center" }}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
