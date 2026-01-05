// src/screens/Settings/SettingsScreen.js
import React, { useEffect, useState } from 'react';
import { View, ScrollView } from 'react-native';
import { Alert } from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Surface,
  ActivityIndicator,
  HelperText,
  Chip,
  Snackbar,
} from 'react-native-paper';
import api from '../../api/api';

export default function SettingsScreen() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingNotify, setTestingNotify] = useState(false);

  const [defaultCurrency, setDefaultCurrency] = useState('HUF');
  const [defaultBillingCycle, setDefaultBillingCycle] = useState('monthly');
  const [notifyDaysBefore, setNotifyDaysBefore] = useState('7');

  const [errorText, setErrorText] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await api.get('/api/settings');
        const data = res.data;

        if (data.defaultCurrency) {
          setDefaultCurrency(data.defaultCurrency);
        }
        if (data.defaultBillingCycle) {
          setDefaultBillingCycle(data.defaultBillingCycle);
        }
        if (
          data.notifyDaysBefore !== null &&
          data.notifyDaysBefore !== undefined
        ) {
          setNotifyDaysBefore(String(data.notifyDaysBefore));
        }
      } catch (e) {
        console.log('Settings GET hiba:', e.message);
        setErrorText('Nem sikerült betölteni a beállításokat.');
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleSendTest = async () => {
    try {
      setTestingNotify(true);
      const res = await api.post('/api/notifications/send-test');
      Alert.alert('Siker', res.data.message);
    } catch (e) {
      console.log('Teszt hiba:', e.response?.data || e.message);
      const msg = e.response?.data?.error || 'Nem sikerült elküldeni a tesztet.';
      Alert.alert('Hiba', msg);
    } finally {
      setTestingNotify(false);
    }
  };

  const handleFixDates = async () => {
    try {
      const res = await api.post('/api/subscriptions/fix-all-dates');
      Alert.alert('Siker', res.data.message);
    } catch (e) {
      Alert.alert('Hiba', 'Nem sikerült a dátumok frissítése.');
    }
  };

  const handleSave = async () => {
    setErrorText('');
    const numDays = Number(notifyDaysBefore);

    if (Number.isNaN(numDays) || numDays < 0 || numDays > 365) {
      setErrorText('Érvényes nap számot adj meg (0–365).');
      return;
    }

    try {
      setSaving(true);
      await api.put('/api/settings', {
        defaultCurrency,
        defaultBillingCycle,
        notifyDaysBefore: numDays,
      });
      setSnackbarVisible(true);
    } catch (e) {
      console.log('Settings PUT hiba:', e.message);
      setErrorText('Nem sikerült menteni a beállításokat.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#050816',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator />
        <Text style={{ marginTop: 8, color: '#d1d5f0' }}>
          Beállítások betöltése...
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#050816' }}>
      <ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 32,
        }}
      >
        <Surface
          style={{
            borderRadius: 24,
            padding: 18,
            marginBottom: 16,
            backgroundColor: '#111827',
            elevation: 4,
          }}
        >
          <Text
            style={{
              color: '#f9fafb',
              fontSize: 18,
              fontWeight: '600',
              marginBottom: 8,
            }}
          >
            Alapbeállítások
          </Text>
          <Text
            style={{
              color: '#9ba0c8',
              fontSize: 13,
              marginBottom: 16,
            }}
          >
            Ezeket az értékeket használjuk új előfizetések létrehozásánál, illetve
            az email értesítésekhez.
          </Text>

          {/* Alapértelmezett valuta */}
          <Text
            style={{
              color: '#e5e7ff',
              fontSize: 14,
              marginBottom: 8,
              fontWeight: '500',
            }}
          >
            Alapértelmezett valuta
          </Text>
          <View style={{ flexDirection: 'row', marginBottom: 16 }}>
            {['HUF', 'EUR'].map((cur) => (
              <Chip
                key={cur}
                selected={defaultCurrency === cur}
                onPress={() => setDefaultCurrency(cur)}
                style={{
                  marginRight: 8,
                  backgroundColor:
                    defaultCurrency === cur ? '#1d264f' : '#020617',
                }}
                textStyle={{
                  color:
                    defaultCurrency === cur ? '#e5e7ff' : '#9ba0c8',
                }}
              >
                {cur}
              </Chip>
            ))}
          </View>

          {/* Számlázási ciklus */}
          <Text
            style={{
              color: '#e5e7ff',
              fontSize: 14,
              marginBottom: 8,
              fontWeight: '500',
            }}
          >
            Alapértelmezett számlázási ciklus
          </Text>
          <View style={{ flexDirection: 'row', marginBottom: 16 }}>
            {[
              { value: 'monthly', label: 'Havi' },
              { value: 'yearly', label: 'Éves' },
            ].map((opt) => (
              <Chip
                key={opt.value}
                selected={defaultBillingCycle === opt.value}
                onPress={() => setDefaultBillingCycle(opt.value)}
                style={{
                  marginRight: 8,
                  backgroundColor:
                    defaultBillingCycle === opt.value
                      ? '#1d264f'
                      : '#020617',
                }}
                textStyle={{
                  color:
                    defaultBillingCycle === opt.value
                      ? '#e5e7ff'
                      : '#9ba0c8',
                }}
              >
                {opt.label}
              </Chip>
            ))}
          </View>

          {/* Értesítési napok */}
          <Text
            style={{
              color: '#e5e7ff',
              fontSize: 14,
              marginBottom: 8,
              fontWeight: '500',
            }}
          >
            Értesítési időablak (nap)
          </Text>
          <TextInput
            mode="outlined"
            value={notifyDaysBefore}
            onChangeText={setNotifyDaysBefore}
            keyboardType="number-pad"
            style={{ marginBottom: 4 }}
          />
          <HelperText
            type={errorText ? 'error' : 'info'}
            visible={true}
            style={{ marginBottom: 8 }}
          >
            {errorText
              ? errorText
              : 'Ennyivel előtte kapsz email értesítést a közelgő terhelésekről.'}
          </HelperText>

          <Button
            mode="contained"
            onPress={handleSave}
            loading={saving}
            disabled={saving}
            style={{ borderRadius: 999, marginTop: 8 }}
            contentStyle={{ paddingVertical: 8 }}
          >
            Beállítások mentése
          </Button>
        </Surface>
        <Surface style={{ borderRadius: 24, padding: 18, backgroundColor: '#111827', elevation: 4, marginTop: 8 }}>
          <Text style={{ color: '#f9fafb', fontSize: 18, fontWeight: '600', marginBottom: 8 }}>
            Rendszer tesztelése
          </Text>
          <Text style={{ color: '#9ba0c8', fontSize: 13, marginBottom: 16 }}>
            Ezzel a gombbal azonnali teszt emailt és push értesítést küldhetsz a fiókodhoz tartozó címre.
          </Text>

          <Button
            mode="outlined"
            onPress={handleSendTest}
            loading={testingNotify}
            disabled={testingNotify}
            icon="bell-ring-outline"
            textColor="#9ca3ff"
            style={{ borderColor: '#2f3b83', borderRadius: 999 }}
          >
            Teszt értesítés küldése
          </Button>

          <Button 
            mode="outlined" 
            onPress={handleFixDates}
            icon="calendar-sync"
            style={{ marginTop: 10, borderColor: '#2f3b83' }}
          >
            Dátumok szinkronizálása
          </Button>
        </Surface>
      </ScrollView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={2500}
        style={{ backgroundColor: '#16a34a' }}
      >
        Beállítások sikeresen elmentve.
      </Snackbar>
    </View>
  );
}
