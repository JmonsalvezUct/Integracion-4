import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  ActivityIndicator 
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getAccessToken } from "../lib/secure-store";
import { API_URL } from "../constants";

interface Project {
  id: number;
  name: string;
  description: string;
  status: string;
  startDate: string;
  endDate: string;
  members: Array<{
    id: number;
    name: string;
    role: string;
  }>;
}

export default function ProjectDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  const fetchProjectDetails = async () => {
    try {
      const token = await getAccessToken();
      const response = await fetch(`${API_URL}/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setProject(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3B34FF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalles del Proyecto</Text>
        <TouchableOpacity onPress={() => router.push(`/project/edit/${id}`)}>
          <Ionicons name="create" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Project Info */}
        <View style={styles.section}>
          <Text style={styles.title}>{project?.name}</Text>
          <Text style={styles.description}>{project?.description}</Text>
          
          <View style={styles.statusContainer}>
            <Text style={styles.label}>Estado:</Text>
            <Text style={styles.status}>{project?.status}</Text>
          </View>

          <View style={styles.dates}>
            <Text style={styles.label}>Inicio: {project?.startDate}</Text>
            <Text style={styles.label}>Fin: {project?.endDate}</Text>
          </View>
        </View>

        {/* Members */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Miembros</Text>
          {project?.members.map(member => (
            <View key={member.id} style={styles.memberRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {member.name[0].toUpperCase()}
                </Text>
              </View>
              <View>
                <Text style={styles.memberName}>{member.name}</Text>
                <Text style={styles.memberRole}>{member.role}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push(`/project/${id}/tasks/new`)}
          >
            <Text style={styles.actionText}>Nueva Tarea</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#3B34FF"
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  headerTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold"
  },
  content: {
    flex: 1,
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee"
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8
  },
  description: {
    fontSize: 16,
    color: "#666",
    marginBottom: 16
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8
  },
  label: {
    fontWeight: "bold",
    marginRight: 8
  },
  status: {
    color: "#3B34FF"
  },
  dates: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#3B34FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12
  },
  avatarText: {
    color: "white",
    fontWeight: "bold"
  },
  memberName: {
    fontWeight: "500"
  },
  memberRole: {
    color: "#666",
    fontSize: 14
  },
  actions: {
    padding: 16
  },
  actionButton: {
    backgroundColor: "#3B34FF",
    padding: 16,
    borderRadius: 8,
    alignItems: "center"
  },
  actionText: {
    color: "white",
    fontWeight: "bold"
  }
});