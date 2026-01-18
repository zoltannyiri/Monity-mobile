import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { requestAndRegisterPushToken, setupPushListeners } from '../push/PushTokenService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userToken, setUserToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1. ADATOK BETÖLTÉSE (BOOTSTRAP) - Csak egyszer fut le indításkor
  useEffect(() => {
    const loadStoredData = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('monity_token');
        const storedUser = await AsyncStorage.getItem('monity_user');
        if (storedToken && storedUser) {
          setUserToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (e) {
        console.log('Betöltési hiba:', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadStoredData();
  }, []);

  // 2. PUSH LISTENERS - Ezt csak egyszer, az app indulásakor kell elindítani
  useEffect(() => {
    setupPushListeners();
  }, []); // Üres tömb: csak egyszer fut le az app életciklusában

  // 3. TOKEN REGISZTRÁCIÓ - Akkor fut le, ha megváltozik a userToken (belépés/kilépés)
  useEffect(() => {
    if (userToken) {
      requestAndRegisterPushToken();
    }
  }, [userToken]); // Csak userToken változásakor fut

  const login = async (token, userData) => {
    setUserToken(token);
    setUser(userData);
    await AsyncStorage.setItem('monity_token', token);
    await AsyncStorage.setItem('monity_user', JSON.stringify(userData));
  };

  const logout = async () => {
    setUserToken(null);
    setUser(null);
    await AsyncStorage.removeItem('monity_token');
    await AsyncStorage.removeItem('monity_user');
  };

  return (
    <AuthContext.Provider value={{ user, userToken, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};