import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useProjectMembers } from '../hooks/useProjectMembers';
import { useUserStats } from '../hooks/useUserStats';
import { StatsDatePicker } from '../components/StatsDatePicker';
import { StatsBurndownChart } from '../components/StatsBurndownChart';

interface StatsProjectScreenProps {
  projectId: string;
}

export default function StatsProjectScreen({ projectId}: StatsProjectScreenProps) {
  const { members, loading: loadingMembers, error: errorMembers } = useProjectMembers(projectId);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const [fromDate, setFromDate] = useState<Date>(new Date());
  const [toDate, setToDate] = useState<Date>(new Date());

  // Set initial selected user when members are loaded
  useEffect(() => {
    if (members?.length > 0 && !selectedUserId) {
        console.log("selectedUserId", members[0].user.id)
      setSelectedUserId(members[0].user.id);
    }
  }, [members]);

  const from = fromDate.toISOString().slice(0, 10);
  const to = toDate.toISOString().slice(0, 10);
  
  const { stats, loading: loadingStats, error: errorStats } = useUserStats(
    projectId,
    selectedUserId!,
    from,
    to
  );


   return (
    <ScrollView style={{ flex: 1 }}>
      <StatsDatePicker label="Desde" value={fromDate} onChange={setFromDate} />
      <StatsDatePicker label="Hasta" value={toDate} onChange={setToDate} />

      {loadingMembers ? (
        <ActivityIndicator />
      ) : errorMembers ? (
        <Text>{errorMembers}</Text>
      ) : (
        <View style={{ 
          backgroundColor: '#f5f5f5',
          borderRadius: 8,
          marginVertical: 8,
          overflow: 'hidden'
        }}>
          <Picker
            selectedValue={selectedUserId ?? members[0]?.user?.id}
            onValueChange={(itemValue: number) => setSelectedUserId(itemValue)}
            style={{ padding: 8 }}
          >
            {members.map((member) => (
              <Picker.Item 
                key={member.id} 
                label={member.user.name} 
                value={member.user.id} 
              />
            ))}
          </Picker>
        </View>
      )}

      {loadingStats ? (
        <ActivityIndicator />
      ) : errorStats ? (
        <Text>{errorStats}</Text>
      ) : stats ? (
        
        
        <View>

          <View style={{ marginTop: 16, backgroundColor: '#f5f5f5', padding: 16, borderRadius: 8 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>Resumen</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ fontSize: 16 }}>Tareas asignadas:</Text>
              <Text style={{ fontSize: 16, fontWeight: '500' }}>{stats.assignedTasksCount}</Text>
            </View>
           <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ fontSize: 16 }}>Tareas completadas:</Text>
              <Text style={{ fontSize: 16, fontWeight: '500' }}>{stats.completedTasksCount}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 16 }}>Horas trabajadas:</Text>
              <Text style={{ fontSize: 16, fontWeight: '500' }}>{stats.totalHours.toFixed(2)}h</Text>
            </View>
          </View>
        

          {stats.burndown && Object.keys(stats.burndown).length > 0 && (
            <View style={{ marginTop: 24 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>Tareas completadas acumuladas</Text>
              <View style={{ backgroundColor: '#f5f5f5', padding: 12, borderRadius: 8, alignItems: 'center' }}>
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
              <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>Horas trabajadas por día</Text>
              <View style={{ backgroundColor: '#f5f5f5', padding: 12, borderRadius: 8, alignItems: 'center' }}>
                <StatsBurndownChart
                  data={Object.entries(stats.timeBurndown)
                    .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
                    .map(([date, minutes]) => ({
                      x: date,
                      y: Number((minutes / 60).toFixed(2))
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
