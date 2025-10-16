import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Switch, ScrollView, SafeAreaView, Platform, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import performLogout from '@/app/features/profile/components/logout';
import { Ionicons } from '@expo/vector-icons';
import { getSavedUser, type LoginResponse } from '@/services/auth'; 


type User = LoginResponse['user']; //Se reutiliza el tipo de user ya definido en auth

export default function ProfileScreen() {
  const [darkMode, setDarkMode] = React.useState(false);
  const [pushEnabled, setPushEnabled] = React.useState(true);
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);
  const router = useRouter();

  //Cargar el usuario al montar la pantalla
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const u = await getSavedUser();
        if (mounted) setUser(u);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Mientras carga, muestra un spinner
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.container, { flex: 1, alignItems: 'center', justifyContent: 'center' }]}>
          <ActivityIndicator />
          <Text style={{ marginTop: 8 }}>Cargando perfil...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Valores seguros para mostrar
  const displayName = (user?.name?.trim() || 'Usuario');
  const displayEmail = (user?.email || '—');
  const avatarUri = user?.profilePicture || null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View style={styles.avatarWrap}>
            {/* 🆕 Si hay foto de perfil, muéstrala; si no, icono por defecto */}
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImg} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={48} color="#fff" />
              </View>
            )}
            <TouchableOpacity style={styles.avatarBtn} activeOpacity={0.8}>
              <Ionicons name="camera" size={18} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.userInfo}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {/* 🆕 Nombre real */}
              <Text style={styles.name}>{displayName}</Text>
              <TouchableOpacity style={{ marginLeft: 8 }}>
                <Ionicons name="pencil" size={18} color="#3B34FF" />
              </TouchableOpacity>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
              {/* 🆕 Correo real */}
              <Text style={styles.email}>{displayEmail}</Text>
              <TouchableOpacity style={{ marginLeft: 8 }}>
                <Ionicons name="pencil" size={14} color="#3B34FF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Apariencia</Text>
          <View style={styles.rowBetween}>
            <Text style={styles.cardText}>Modo oscuro</Text>
            <Switch value={darkMode} onValueChange={setDarkMode} />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Notificaciones</Text>
          <View style={styles.rowBetween}>
            <Text style={styles.cardText}>Notificaciones push</Text>
            <Switch value={pushEnabled} onValueChange={setPushEnabled} />
          </View>
          <TouchableOpacity style={{ marginTop: 10 }}>
            <Text style={styles.link}>Gestionar preferencias de notificación</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Seguridad</Text>
          <TouchableOpacity style={styles.rowBetween}>
            <Text style={styles.cardText}>Cambiar contraseña</Text>
            <Ionicons name="chevron-forward" size={18} color="#999" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.logoutBtn}
          activeOpacity={0.8}
          onPress={() => {
            Alert.alert(
              'Cerrar sesión',
              '¿Estás seguro de que quieres cerrar sesión?',
              [
                { text: 'No', style: 'cancel' },
                {
                  text: 'Sí',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      await performLogout(); // asume que borra tokens y usuario guardado
                      router.replace('/auth/login');
                    } catch (err) {
                      console.error('Logout error', err);
                    }
                  },
                },
              ],
              { cancelable: true }
            );
          }}
        >
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { padding: 16, backgroundColor: '#fff', paddingBottom: 40, paddingTop: Platform.OS === 'android' ? 32 : 18 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  avatarWrap: { position: 'relative' },
  avatarPlaceholder: { width: 88, height: 88, borderRadius: 44, backgroundColor: '#3B34FF', alignItems: 'center', justifyContent: 'center' },
  // 🆕 estilo para imagen de avatar real
  avatarImg: { width: 88, height: 88, borderRadius: 44, backgroundColor: '#e9e9ff' },
  avatarBtn: { position: 'absolute', right: -6, bottom: -6, width: 36, height: 36, borderRadius: 18, backgroundColor: '#4A45FF', alignItems: 'center', justifyContent: 'center', elevation: 2 },
  userInfo: { marginLeft: 14, flex: 1 },
  name: { fontSize: 22, fontWeight: '800' },
  email: { color: '#888' },

  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#f0f0f0' },
  cardTitle: { fontWeight: '700', marginBottom: 8 },
  cardText: { fontSize: 16 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  link: { color: '#3B34FF' },

  logoutBtn: { marginTop: 18, backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#ffd6d6', paddingVertical: 12, alignItems: 'center' },
  logoutText: { color: '#d9534f', fontWeight: '700' },
});
