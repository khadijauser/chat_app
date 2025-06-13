import axios from 'axios';

const API_URL = 'http://127.0.0.1:3001/api';

class AuthService {
  constructor() {
    this.token = null;
  }

  async login(email, password) {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });
      
      this.token = response.data.token;
      // En production, utiliser un stockage sécurisé
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', this.token);
      }
      
      return response.data.user;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erreur de connexion');
    }
  }

  async register(username, email, password) {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        username,
        email,
        password,
      });
      
      this.token = response.data.token;
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', this.token);
      }
      
      return response.data.user;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erreur d\'inscription');
    }
  }

  async getCurrentUser() {
    try {
      const token = await this.getToken();
      if (!token) return null;

      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      return response.data.user;
    } catch (error) {
      this.logout();
      throw error;
    }
  }

  async logout() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  }

  async getToken() {
    if (this.token) return this.token;
    
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
    
    return this.token;
  }
}

export const authService = new AuthService();