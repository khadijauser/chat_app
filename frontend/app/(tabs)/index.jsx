import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { MessageCircle, Plus, Hash } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';

export default function HomeScreen() {
  const router = useRouter();
  const { user, logout, loading } = useAuth();

  const handleCreateRoom = () => {
    router.push('/rooms/create');
  };

  const handleJoinRoom = () => {
    router.push('/rooms/join');
  };

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Oui', onPress: logout },
      ]
    );
  };

  // Handle navigation after auth state has settled
  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth');
    }
  }, [loading, user, router]);

  // Wait for auth state to load before making navigation decisions
  if (loading) {
    return null;
  }

  if (!user) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>ChatApp</Text>
        <Text style={styles.subtitle}>Bienvenue {user.username}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.actionCard}>
          <MessageCircle size={48} color="#2563EB" style={styles.cardIcon} />
          <Text style={styles.cardTitle}>Messagerie Temps Réel</Text>
          <Text style={styles.cardDescription}>
            Créez ou rejoignez une salle pour commencer à chatter
          </Text>
        </View>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleCreateRoom}>
            <Plus size={24} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>Créer une salle</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={handleJoinRoom}>
            <Hash size={24} color="#2563EB" />
            <Text style={styles.secondaryButtonText}>Rejoindre une salle</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Se déconnecter</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#2563EB',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#BFDBFE',
    textAlign: 'center',
    marginTop: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 40,
  },
  cardIcon: {
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  cardDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonsContainer: {
    gap: 16,
  },
  primaryButton: {
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    gap: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2563EB',
    gap: 8,
  },
  secondaryButtonText: {
    color: '#2563EB',
    fontSize: 18,
    fontWeight: '600',
  },
  logoutButton: {
    margin: 20,
    paddingVertical: 12,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '500',
  },
});