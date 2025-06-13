import axios from 'axios';
import { authService } from './authService';

const API_URL = 'http://127.0.0.1:3001/api';

class RoomService {
  async createRoom(name, userId) {
    try {
      const token = await authService.getToken();
      const response = await axios.post(
        `${API_URL}/rooms`,
        { name, userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data.room;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erreur de création de salle');
    }
  }

  async joinRoom(code, userId) {
    try {
      const token = await authService.getToken();
      const response = await axios.post(
        `${API_URL}/rooms/join`,
        { code, userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data.room;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Salle introuvable');
    }
  }

  async getUserRooms(userId) {
    try {
      const token = await authService.getToken();
      const response = await axios.get(
        `${API_URL}/rooms/user/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data.rooms;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erreur de chargement des salles');
    }
  }
}

export const roomService = new RoomService();