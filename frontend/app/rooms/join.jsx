import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Hash, Users } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { roomService } from '@/services/roomService';

export default function JoinRoomScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoinRoom = async () => {
    if (!roomCode.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer le code de la salle');
      return;
    }

    setLoading(true);
    try {
      const room = await roomService.joinRoom(roomCode.trim().toUpperCase(), user.id);
      Alert.alert(
        'Salle rejointe !',
        `Vous avez rejoint la salle "${room.name}"`,
        [
          {
            text: 'OK',
            onPress: () => router.push(`/chat/${room.id}`),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Erreur', error.message || 'Impossible de rejoindre la salle');
      console.error('Erreur rejoindre salle:', error);
    } finally {
      setLoading(false);
    }
  };
return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Rejoindre une salle</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.infoCard}>
          <Users size={48} color="#10B981" />
          <Text style={styles.infoTitle}>Rejoindre une salle</Text>
          <Text style={styles.infoDescription}>
            Entrez le code de la salle partagé par un ami pour rejoindre la conversation
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Hash size={24} color="#6B7280" />
            <TextInput
              style={styles.input}
              placeholder="Code de la salle (ex: ABC123)"
              value={roomCode}
              onChangeText={setRoomCode}
              maxLength={6}
              autoCapitalize="characters"
            />
          </View>

          <TouchableOpacity
            style={[styles.joinButton, loading && styles.joinButtonDisabled]}
            onPress={handleJoinRoom}
            disabled={loading}
          >
            <Text style={styles.joinButtonText}>
              {loading ? 'Connexion...' : 'Rejoindre'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 30,
  },
  infoTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  infoDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    gap: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    gap: 12,
  },
  input: {  
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    fontFamily: 'monospace',
  },
  joinButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  joinButtonDisabled: {
    opacity: 0.6,
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});


