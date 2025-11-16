import React, { createContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/api';
import {
  requestAndRegisterPushToken,
  setupPushListeners,
} from '../push/PushTokenService';



export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [userToken, setUserToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('monity_token');
        if (storedToken) {
          setUserToken(storedToken);
          try {
            const res = await api.get('/api/me');
            setUser(res.data);
          } catch (e) {
            console.log('Nem sikerült usert lekérni bootstrapkor:', e.message);
          }
        }
      } catch (e) {
        console.log('Hiba token betöltésnél:', e.message);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrap();
  }, []);

  useEffect(() => {
    setupPushListeners();
  }, []);

  useEffect(() => {
    if (userToken) {
      requestAndRegisterPushToken();
    }
  }, [userToken]);

 const login = async (email, password) => {
  const res = await api.post('/api/auth/login', { email, password });

  const token = res.data?.token;
  const userData = res.data?.user;

  if (!token) {
    throw new Error('Nincs token a login válaszban.');
  }

  // 🔹 Itt logoljuk ki, hogy Postmanbe másolhasd
  console.log('Monity JWT token (Postmanhez):', token);

  await AsyncStorage.setItem('monity_token', token);
  setUserToken(token);
  setUser(userData || null);
};

  const logout = async () => {
    await AsyncStorage.removeItem('monity_token');
    setUserToken(null);
    setUser(null);
  };

  const value = {
    userToken,
    user,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
