// import React, { createContext, useState, useEffect } from 'react';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// export const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [userToken, setUserToken] = useState(null); // App.js ezt várja
//   const [isLoading, setIsLoading] = useState(true); // App.js ezt várja

//   useEffect(() => {
//     const loadStoredData = async () => {
//       try {
//         const storedToken = await AsyncStorage.getItem('monity_token');
//         const storedUser = await AsyncStorage.getItem('monity_user');
//         if (storedToken && storedUser) {
//           setUserToken(storedToken);
//           setUser(JSON.parse(storedUser));
//         }
//       } catch (e) {
//         console.log('Betöltési hiba:', e);
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     loadStoredData();
//   }, []);

//   const login = async (token, userData) => {
//     setUserToken(token);
//     setUser(userData);
//     await AsyncStorage.setItem('monity_token', token);
//     await AsyncStorage.setItem('monity_user', JSON.stringify(userData));
//   };

//   const logout = async () => {
//     setUserToken(null);
//     setUser(null);
//     await AsyncStorage.removeItem('monity_token');
//     await AsyncStorage.removeItem('monity_user');
//   };

//   return (
//     <AuthContext.Provider value={{ user, userToken, login, logout, isLoading }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };