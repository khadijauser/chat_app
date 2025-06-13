import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { MessageCircle, Users, Clock } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { roomService } from '@/services/roomService';

export default function RoomsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadRooms = async () => {
    try {
      const userRooms = await roomService.getUserRooms(user.id);
      setRooms(userRooms);
    } catch (error) {
      console.error('Erreur lors du chargement des salles:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadRooms();
    }
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    loadRooms();
  };

  const handleRoomPress = (room) => {
    router.push(`/chat/${room.id}`);
  };

  const renderRoom = ({ item }) => (
    <TouchableOpacity
      style={styles.roomCard}
      onPress={() => handleRoomPress(item)}
    >
      <View style={styles.roomHeader}>
        <View style={styles.roomIcon}>
          <MessageCircle size={24} color="#2563EB" />
        </View>
        <View style={styles.roomInfo}>
          <Text style={styles.roomName}>{item.name}</Text>
          <Text style={styles.roomCode}>Code: {item.code}</Text>
        </View>
      </View>
      
      <View style={styles.roomStats}>
        <View style={styles.stat}>
          <Users size={16} color="#6B7280" />
          <Text style={styles.statText}>{item.membersCount} membres</Text>
        </View>
        <View style={styles.stat}>
          <Clock size={16} color="#6B7280" />
          <Text style={styles.statText}>
            {new Date(item.lastActivity).toLocaleDateString()}
          </Text>
        </View>
      </View>

      {item.unreadCount > 0 && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadText}>{item.unreadCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (!user) {
    router.replace('/auth');
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mes Salles</Text>
      </View>

      <FlatList
        data={rooms}
        renderItem={renderRoom}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.roomsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MessageCircle size={64} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>Aucune salle</Text>
            <Text style={styles.emptyDescription}>
              Créez ou rejoignez une salle pour commencer à chatter
            </Text>
          </View>
        }
      />
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
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  roomsList: {
    padding: 20,
    gap: 12,
  },
  roomCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  roomHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  roomIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  roomInfo: {
    flex: 1,
  },
  roomName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  roomCode: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'monospace',
  },
  roomStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 14,
    color: '#6B7280',
  },
  unreadBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 20,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 40,
  },
});