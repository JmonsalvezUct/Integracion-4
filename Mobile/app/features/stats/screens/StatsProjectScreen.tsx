import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useProjectMembers } from '../hooks/useProjectMembers';
import { useUserStats, UserStats } from '../hooks/useUserStats';
import { useGroupStats, GroupStats } from '../hooks/useGroupStats';
import { StatsDatePicker } from '../components/StatsDatePicker';
import { StatsBurndownChart } from '../components/StatsBurndownChart';

interface StatsProjectScreenProps {
  projectId: string;
}

export default function StatsProjectScreen({ projectId }: StatsProjectScreenProps) {
  const { members, loading: loadingMembers, error: errorMembers } = useProjectMembers(projectId);

  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [isGroupView, setIsGroupView] = useState(false); // 👈 nuevo estado para alternar vista
  const [fromDate, setFromDate] = useState<Date>(new Date());
  const [toDate, setToDate] = useState<Date>(new Date());

  // Fechas en formato ISO corto
  const from = fromDate.toISOString().slice(0, 10);
  const to = toDate.toISOString().slice(0, 10);

  // Seleccionar primer usuario automáticamente
  useEffect(() => {
    if (members?.length > 0 && !selectedUserId) {
      setSelectedUserId(members[0].user.id);
    }
  }, [members]);

  // Hooks de datos
  const {
    stats: userStats,
    loading: loadingUserStats,
    error: errorUserStats,
  } = useUserStats(projectId, selectedUserId ?? 0, from, to);

  const {
    statsGroup: groupStats,
    loading: loadingGroupStats,
    error: errorGroupStats,
  } = useGroupStats(projectId, from, to);

  const stats = isGroupView ? groupStats : userStats;
  const loading = isGroupView ? loadingGroupStats : loadingUserStats;
  const error = isGroupView ? errorGroupStats : errorUserStats;

  // Función para cambiar modo
  const toggleView = () => setIsGroupView((prev) => !prev);

  return (
    <ScrollView style={{ flex: 1, paddingHorizontal: 8 }}>
      {/* Fecha */}
      <StatsDatePicker label="Desde" value={fromDate} onChange={setFromDate} />
      <StatsDatePicker label="Hasta" value={toDate} onChange={setToDate} />

      {/* Botón para alternar vista */}
      <TouchableOpacity
        onPress={toggleView}
        style={{
          backgroundColor: '#1976d2',
          padding: 10,
          borderRadius: 8,
          alignItems: 'center',
          marginVertical: 10,
        }}
      >
        <Text style={{ color: 'white', fontWeight: 'bold' }}>
          {isGroupView ? 'Ver estadísticas individuales' : 'Ver estadísticas grupales'}
        </Text>
      </TouchableOpacity>

      {/* Selector de usuario solo si no es vista grupal */}
      {!isGroupView && (
        loadingMembers ? (
          <ActivityIndicator />
        ) : errorMembers ? (
          <Text>{errorMembers}</Text>
        ) : (
          <View
            style={{
              backgroundColor: '#f5f5f5',
              borderRadius: 8,
              marginVertical: 8,
              overflow: 'hidden',
            }}
          >
            <Picker
              selectedValue={selectedUserId ?? members[0]?.user?.id}
              onValueChange={(itemValue: number) => setSelectedUserId(itemValue)}
              style={{ padding: 8 }}
            >
              {members.map((member) => (
                <Picker.Item key={member.id} label={member.user.name} value={member.user.id} />
              ))}
            </Picker>
          </View>
        )
      )}

      {/* Contenido de estadísticas */}
      {loading ? (
        <ActivityIndicator />
      ) : error ? (
        <Text>{error}</Text>
      ) : stats ? (
        <View>
          {/* Resumen */}
          <View
            style={{
              marginTop: 16,
              backgroundColor: '#f5f5f5',
              padding: 16,
              borderRadius: 8,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>
              {isGroupView ? 'Resumen grupal' : 'Resumen'}
            </Text>

            {/* Campos comunes */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ fontSize: 16 }}>Tareas completadas:</Text>
              <Text style={{ fontSize: 16, fontWeight: '500' }}>
                {isGroupView ? groupStats!.completedCount : userStats!.completedTasksCount}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ fontSize: 16 }}>Horas trabajadas:</Text>
              <Text style={{ fontSize: 16, fontWeight: '500' }}>
                {isGroupView ? groupStats!.totalHours.toFixed(2) : userStats!.totalHours.toFixed(2)} h
              </Text>
            </View>
          </View>

          {/* Tabla de miembros si es vista grupal */}
          {isGroupView && groupStats!.teamMembers?.length > 0 && (
            <View
              style={{
                marginTop: 16,
                backgroundColor: '#fafafa',
                borderRadius: 8,
                padding: 12,
              }}
            >
              <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>
                Detalle por integrante
              </Text>
              {groupStats!.teamMembers.map((m) => (
                <View
                  key={m.userId}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    borderBottomWidth: 0.5,
                    borderColor: '#ddd',
                    paddingVertical: 6,
                  }}
                >
                  <Text style={{ fontSize: 14, flex: 1 }}>{m.name}</Text>
                  <Text style={{ fontSize: 14, flex: 1, textAlign: 'center' }}>
                    {m.completedTasks}
                  </Text>
                  <Text style={{ fontSize: 14, flex: 1, textAlign: 'right' }}>
                    {m.hours.toFixed(1)}h
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Gráficos */}
          {stats.burndown && Object.keys(stats.burndown).length > 0 && (
            <View style={{ marginTop: 24 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>
                Tareas completadas acumuladas
              </Text>
              <View
                style={{
                  backgroundColor: '#f5f5f5',
                  padding: 12,
                  borderRadius: 8,
                  alignItems: 'center',
                }}
              >
                <StatsBurndownChart
                  data={Object.entries(stats.burndown)
                    .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
                    .reduce((acc, [date, value], index, array) => {
                      const sum = array
                        .slice(0, index + 1)
                        .reduce((sum, [_, val]) => sum + val, 0);
                      acc.push({ x: date, y: sum });
                      return acc;
                    }, [] as { x: string; y: number }[])}
                  color="#1976d2"
                  label="Tareas Completadas"
                />
              </View>
            </View>
          )}

          {stats.timeBurndown && Object.keys(stats.timeBurndown).length > 0 && (
            <View style={{ marginTop: 24, marginBottom: 24 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>
                Horas trabajadas por día
              </Text>
              <View
                style={{
                  backgroundColor: '#f5f5f5',
                  padding: 12,
                  borderRadius: 8,
                  alignItems: 'center',
                }}
              >
                <StatsBurndownChart
                  data={Object.entries(stats.timeBurndown)
                    .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
                    .map(([date, minutes]) => ({
                      x: date,
                      y: Number((minutes / 60).toFixed(2)),
                    }))}
                  color="#388e3c"
                  label="Horas"
                />
              </View>
            </View>
          )}
        </View>
      ) : null}
    </ScrollView>
  );
}
