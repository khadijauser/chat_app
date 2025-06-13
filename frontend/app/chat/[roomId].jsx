import { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Send, ArrowLeft, Users, Wifi, WifiOff } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { useSocket } from '@/hooks/useSocket';
import { chatService } from '@/services/chatService';

export default function ChatScreen() {
  const router = useRouter();
  const { roomId } = useLocalSearchParams();
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [room, setRoom] = useState(null);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef(null);

  useEffect(() => {
    if (user && roomId) {
      loadRoomData();
      joinRoom();
    }

    return () => {
      if (socket && roomId) {
        socket.emit('leave-room', roomId);
      }
    };
  }, [user, roomId, socket]);

  const loadRoomData = async () => {
    try {
      const [roomData, roomMessages] = await Promise.all([
        chatService.getRoomDetails(roomId),
        chatService.getRoomMessages(roomId),
      ]);
      setRoom(roomData);
      setMessages(roomMessages);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const joinRoom = () => {
    if (socket && roomId) {
      socket.emit('join-room', roomId);
      
      socket.on('message', (message) => {
        setMessages(prev => [...prev, message]);
        scrollToBottom();
      });

      socket.on('user-joined', (data) => {
        setConnectedUsers(data.users);
      });

      socket.on('user-left', (data) => {
        setConnectedUsers(data.users);
      });

      socket.on('room-users', (users) => {
        setConnectedUsers(users);
      });
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !socket) return;

    const messageData = {
      roomId,
      text: newMessage.trim(),
      userId: user.id,
      username: user.username,
      timestamp: new Date().toISOString(),
    };

    try {
      socket.emit('send-message', messageData);
      setNewMessage('');
      scrollToBottom();
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const renderMessage = ({ item }) => {
    const isOwnMessage = item.userId === user.id;
    
    return (
      <View style={[
        styles.messageContainer,
        isOwnMessage ? styles.ownMessage : styles.otherMessage
      ]}>
        <View style={[
          styles.messageBubble,
          isOwnMessage ? styles.ownBubble : styles.otherBubble
        ]}>
          {!isOwnMessage && (
            <Text style={styles.messageUsername}>{item.username}</Text>
          )}
          <Text style={[
            styles.messageText,
            isOwnMessage ? styles.ownText : styles.otherText
          ]}>
            {item.text}
          </Text>
          <Text style={[
            styles.messageTime,
            isOwnMessage ? styles.ownTime : styles.otherTime
          ]}>
            {new Date(item.timestamp).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </Text>
        </View>
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <ArrowLeft size={24} color="#FFFFFF" />
      </TouchableOpacity>
      
      <View style={styles.headerInfo}>
        <Text style={styles.roomName}>{room?.name || 'Salon'}</Text>
        <View style={styles.statusContainer}>
          {isConnected ? (
            <Wifi size={16} color="#10B981" />
          ) : (
            <WifiOff size={16} color="#EF4444" />
          )}
          <Text style={styles.statusText}>
            {connectedUsers.length} connecté{connectedUsers.length > 1 ? 's' : ''}
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.usersButton}>
        <Users size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );

  if (!user) {
    router.replace('/auth');
    return null;
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {renderHeader()}
      
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item, index) => `${item.id || index}`}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={scrollToBottom}
        onLayout={scrollToBottom}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.messageInput}
          placeholder="Tapez votre message..."
          value={newMessage}
          onChangeText={setNewMessage}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendButton, !newMessage.trim() && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={!newMessage.trim()}
        >
          <Send size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  backButton: {
    marginRight: 16,
  },
  headerInfo: {
    flex: 1,
  },
  roomName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontSize: 14,
    color: '#BFDBFE',
  },
  usersButton: {
    marginLeft: 16,
  },
  messagesList: {
    padding: 16,
    paddingBottom: 80,
  },
  messageContainer: {
    marginBottom: 12,
  },
  ownMessage: {
    alignItems: 'flex-end',
  },
  otherMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
  },
  ownBubble: {
    backgroundColor: '#2563EB',
    borderBottomRightRadius: 6,
  },
  otherBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageUsername: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
    marginBottom: 4,
  },
  ownText: {
    color: '#FFFFFF',
  },
  otherText: {
    color: '#1F2937',
  },
  messageTime: {
    fontSize: 12,
    alignSelf: 'flex-end',
  },
  ownTime: {
    color: '#BFDBFE',
  },
  otherTime: {
    color: '#6B7280',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  messageInput: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 44,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sendButton: {
    backgroundColor: '#2563EB',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});