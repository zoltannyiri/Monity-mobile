// src/api/api.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ANDROID EMULÁTORRÓL:
// const API_BASE_URL = 'http://10.0.2.2:4000';
const API_BASE_URL = 'http://192.168.0.5:4000';

// Ha később fizikai telefonról akarod tesztelni LAN-on:
// const API_BASE_URL = 'http://<gép_ip_címe>:4000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Bearer token minden kéréshez
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('monity_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  console.log('API request:', config.method?.toUpperCase(), config.baseURL + config.url);
  return config;
});

export default api;
