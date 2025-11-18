import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useProjectMembers } from '../hooks/useProjectMembers';
import { useUserStats, UserStats } from '../hooks/useUserStats';
import { useGroupStats, GroupStats } from '../hooks/useGroupStats';
import { StatsDatePicker } from '../components/StatsDatePicker';
import { StatsBurndownChart } from '../components/StatsBurndownChart';
import { useThemedColors } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';

interface StatsProjectScreenProps {
  projectId: string;
}

export default function StatsProjectScreen({ projectId }: StatsProjectScreenProps) {
  const { CARD_BG, CARD_BORDER, TEXT, SUBTEXT, BRAND, isDark, MUTED_BG, BG, CHART_BG } = useThemedColors();
  const { members, loading: loadingMembers, error: errorMembers } = useProjectMembers(projectId);

  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [isGroupView, setIsGroupView] = useState(false);
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
    <ScrollView style={{ flex: 1, paddingHorizontal: 8, backgroundColor: BG }}>
      {/* Fecha */}
      <StatsDatePicker label="Desde" value={fromDate} onChange={setFromDate} />
      <StatsDatePicker label="Hasta" value={toDate} onChange={setToDate} />

      {/* Botón para alternar vista */}
      <TouchableOpacity
        onPress={toggleView}
        style={{
          backgroundColor: BRAND,
          padding: 12,
          borderRadius: 8,
          alignItems: 'center',
          marginVertical: 10,
          flexDirection: 'row',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        <Ionicons 
          name={isGroupView ? "people-outline" : "person-outline"} 
          size={16} 
          color="white" 
        />
        <Text style={{ color: 'white', fontWeight: 'bold' }}>
          {isGroupView ? 'Ver estadísticas individuales' : 'Ver estadísticas grupales'}
        </Text>
      </TouchableOpacity>

      {/* Selector de usuario solo si no es vista grupal */}
      {!isGroupView && (
        loadingMembers ? (
          <ActivityIndicator color={BRAND} />
        ) : errorMembers ? (
          <Text style={{ color: TEXT }}>{errorMembers}</Text>
        ) : (
          <View
            style={{
              backgroundColor: CARD_BG,
              borderColor: CARD_BORDER,
              borderWidth: 1,
              borderRadius: 8,
              marginVertical: 8,
              overflow: 'hidden',
            }}
          >
            <Picker
              selectedValue={selectedUserId ?? members[0]?.user?.id}
              onValueChange={(itemValue: number) => setSelectedUserId(itemValue)}
              style={{ 
                padding: 8, 
                color: TEXT,
                backgroundColor: CARD_BG 
              }}
              dropdownIconColor={TEXT}
            >
              {members.map((member) => (
                <Picker.Item 
                  key={member.id} 
                  label={member.user.name} 
                  value={member.user.id} 
                  color={TEXT}
                  style={{ backgroundColor: CARD_BG }}
                />
              ))}
            </Picker>
          </View>
        )
      )}

      {/* Contenido de estadísticas */}
      {loading ? (
        <ActivityIndicator size="large" color={BRAND} style={{ marginTop: 20 }} />
      ) : error ? (
        <Text style={{ color: TEXT, textAlign: 'center', marginTop: 20 }}>{error}</Text>
      ) : stats ? (
        <View>
          {/* Resumen */}
          <View
            style={{
              marginTop: 16,
              backgroundColor: CARD_BG,
              borderColor: CARD_BORDER,
              borderWidth: 1,
              padding: 16,
              borderRadius: 8,
            }}
          >
            <Text style={{ 
              fontSize: 18, 
              fontWeight: 'bold', 
              marginBottom: 12,
              color: TEXT 
            }}>
              {isGroupView ? 'Resumen grupal' : 'Resumen'}
            </Text>

            {/* Campos comunes */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ fontSize: 16, color: TEXT }}>Tareas completadas:</Text>
              <Text style={{ fontSize: 16, fontWeight: '500', color: TEXT }}>
                {isGroupView ? groupStats!.completedCount : userStats!.completedTasksCount}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ fontSize: 16, color: TEXT }}>Horas trabajadas:</Text>
              <Text style={{ fontSize: 16, fontWeight: '500', color: TEXT }}>
                {isGroupView ? groupStats!.totalHours.toFixed(2) : userStats!.totalHours.toFixed(2)} h
              </Text>
            </View>
          </View>

          {/* Tabla de miembros si es vista grupal */}
          {isGroupView && groupStats!.teamMembers?.length > 0 && (
            <View
              style={{
                marginTop: 16,
                backgroundColor: MUTED_BG,
                borderColor: CARD_BORDER,
                borderWidth: 1,
                borderRadius: 8,
                padding: 12,
              }}
            >
              <Text style={{ 
                fontSize: 18, 
                fontWeight: 'bold', 
                marginBottom: 12,
                color: TEXT 
              }}>
                Detalle por integrante
              </Text>
              
              {/* Encabezados de la tabla */}
              <View style={{ 
                flexDirection: 'row', 
                justifyContent: 'space-between',
                marginBottom: 8,
                paddingHorizontal: 4 
              }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: SUBTEXT, flex: 1 }}>
                  Nombre
                </Text>
                <Text style={{ fontSize: 14, fontWeight: '600', color: SUBTEXT, flex: 1, textAlign: 'center' }}>
                  Tareas
                </Text>
                <Text style={{ fontSize: 14, fontWeight: '600', color: SUBTEXT, flex: 1, textAlign: 'right' }}>
                  Horas
                </Text>
              </View>

              {groupStats!.teamMembers.map((m, index) => (
                <View
                  key={m.userId}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    borderBottomWidth: index === groupStats!.teamMembers.length - 1 ? 0 : 1,
                    borderColor: isDark ? "#2a2a2a" : "#eee",
                    paddingVertical: 8,
                    paddingHorizontal: 4,
                  }}
                >
                  <Text style={{ fontSize: 14, flex: 1, color: TEXT }}>{m.name}</Text>
                  <Text style={{ fontSize: 14, flex: 1, textAlign: 'center', color: TEXT }}>
                    {m.completedTasks}
                  </Text>
                  <Text style={{ fontSize: 14, flex: 1, textAlign: 'right', color: TEXT }}>
                    {m.hours.toFixed(1)}h
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Gráficos */}
          {stats.burndown && Object.keys(stats.burndown).length > 0 && (
            <View style={{ marginTop: 24 }}>
              <Text style={{ 
                fontSize: 18, 
                fontWeight: 'bold', 
                marginBottom: 8,
                color: TEXT 
              }}>
                Tareas completadas acumuladas
              </Text>

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
                  color={BRAND}
                  label="Tareas Completadas"
                  type='bar'
                />

            </View>
          )}

          {stats.timeBurndown && Object.keys(stats.timeBurndown).length > 0 && (
            <View style={{ marginTop: 24, marginBottom: 24 }}>
              <Text style={{ 
                fontSize: 18, 
                fontWeight: 'bold', 
                marginBottom: 8,
                color: TEXT 
              }}>
                Horas trabajadas por día
              </Text>

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
          )}
        </View>
      ) : null}
    </ScrollView>
  );
}