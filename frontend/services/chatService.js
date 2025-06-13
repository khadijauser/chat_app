import axios from 'axios';
import { authService } from './authService';

const API_URL = 'http://127.0.0.1:3001/api';

class ChatService {
  async getRoomDetails(roomId) {
    try {
      const token = await authService.getToken();
      const response = await axios.get(
        `${API_URL}/rooms/${roomId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data.room;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erreur de chargement de la salle');
    }
  }

  async getRoomMessages(roomId) {
    try {
      const token = await authService.getToken();
      const response = await axios.get(
        `${API_URL}/rooms/${roomId}/messages`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data.messages;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erreur de chargement des messages');
    }
  }
}

export const chatService = new ChatService();