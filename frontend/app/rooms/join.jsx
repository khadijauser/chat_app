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
