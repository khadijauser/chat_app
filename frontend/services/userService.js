import axios from 'axios';
import { authService } from './authService';

const API_URL = 'http://127.0.0.1:3001/api';

class UserService {
  async getUserStats(userId) {
    try {
      const token = await authService.getToken();
      const response = await axios.get(
        `${API_URL}/users/${userId}/stats`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data.stats;
    } catch (error) {
      console.error('Erreur stats utilisateur:', error);
      return {
        roomsCount: 0,
        messagesCount: 0,
        joinedAt: new Date(),
      };
    }
  }
}

export const userService = new UserService();