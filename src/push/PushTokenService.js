// src/push/PushTokenService.js
import messaging from '@react-native-firebase/messaging';
import { Alert, Platform } from 'react-native';
import api from '../api/api';

// Engedély kérés + token lekérése + elküldése backendnek
export async function requestAndRegisterPushToken() {
  try {
    // Androidon is hívhatjuk, legfeljebb warning, de működik
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (!enabled) {
      console.log('Push engedély NINCS megadva');
      return;
    }

    const fcmToken = await messaging().getToken();
    console.log('FCM token:', fcmToken);

    await api.post('/api/push/register', {
      pushToken: fcmToken,
    });

  } catch (err) {
    console.log('Push token regisztrációs hiba:', err?.message || err);
  }
}

// Listener-ek
export function setupPushListeners() {
  // FOREGROUND üzenetek
  messaging().onMessage(async remoteMessage => {
    console.log('Érkezett foreground push:', remoteMessage?.notification);

    const title = remoteMessage?.notification?.title ?? 'Monity';
    const body =
      remoteMessage?.notification?.body ??
      'Új értesítés érkezett a Monity-től.';

    // Ez CSAK előtérben fog látszani (amikor épp nyitva az app)
    Alert.alert(title, body);
  });

  // Token frissülés
  messaging().onTokenRefresh(async newToken => {
    console.log('FCM token frissült:', newToken);
    try {
      await api.post('/api/push/register', {
        pushToken: newToken,
      });
    } catch (err) {
      console.log('Token frissítés küldési hiba:', err?.message || err);
    }
  });
}
