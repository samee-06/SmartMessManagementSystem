import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// CRITICAL: Replace with your Mac's IP (ipconfig getifaddr en0)
const BASE_URL = 'http://192.168.0.149:3000/api';

const apiClient = axios.create({
  baseURL: BASE_URL,
});

// Automatically attach the JWT token to every request
apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('userToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;