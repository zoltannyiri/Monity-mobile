import React, { useContext, useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import {
  Text,
  Button,
  ActivityIndicator,
  Surface,
  useTheme,
} from 'react-native-paper';
import api from '../../api/api';
import { AuthContext } from '../../context/AuthContext';

export default function DashboardScreen({ navigation }) {
  const { user, logout } = useContext(AuthContext);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    const loadPreview = async () => {
      try {
        const res = await api.get('/api/notifications/preview');
        setPreview(res.data);
      } catch (e) {
        console.log('Notifications preview hiba:', e.message);
      } finally {
        setLoading(false);
      }
    };

    loadPreview();
  }, []);

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
        <Text style={{ marginTop: 8, color: '#d1d5f0' }}>Betöltés...</Text>
      </View>
    );
  }

  const notifyDays = preview?.notifyDaysBefore ?? 7;
  const totalAmount = preview?.totalAmount || 0;
  const itemCount = preview?.count ?? 0;

  return (
    <View style={{ flex: 1, backgroundColor: '#050816' }}>
      <ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 32,
        }}
      >
        {/* Header sor */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 18,
          }}
        >
          <View>
            <Text
              variant="bodySmall"
              style={{ color: '#9ca3ff', marginBottom: 4 }}
            >
              Üdv újra,
            </Text>
            <Text
              variant="titleMedium"
              style={{ color: '#ffffff', fontWeight: '600' }}
            >
              {user?.email || 'Felhasználó'}
            </Text>
          </View>
          <Button
            mode="outlined"
            compact
            onPress={logout}
            textColor="#e5e7ff"
            style={{
              borderColor: '#2f3b83',
              borderRadius: 999,
            }}
          >
            Kijelentkezés
          </Button>
        </View>

        {/* Nagy fő kártya */}
        <Surface
          style={{
            borderRadius: 24,
            padding: 18,
            marginBottom: 16,
            backgroundColor: '#111827',
            elevation: 6,
          }}
        >
          <Text
            variant="bodySmall"
            style={{ color: '#9ca3ff', marginBottom: 6 }}
          >
            Értesítési időablak
          </Text>
          <Text
            variant="headlineSmall"
            style={{ color: '#ffffff', fontWeight: '700' }}
          >
            {notifyDays} nap
          </Text>
          <Text
            variant="bodySmall"
            style={{ color: '#9ba0c8', marginTop: 8 }}
          >
            A következő {notifyDays} napban várható terhelésekről kapsz emailt.
          </Text>
        </Surface>

        {/* 2 kis stat kártya egymás mellett */}
        <View
          style={{
            flexDirection: 'row',
            marginBottom: 16,
          }}
        >
          <Surface
            style={{
              flex: 1,
              borderRadius: 20,
              padding: 14,
              marginRight: 8,
              backgroundColor: '#111827',
              elevation: 4,
            }}
          >
            <Text variant="bodySmall" style={{ color: '#9ca3ff' }}>
              Közelgő terhelések
            </Text>
            <Text
              variant="titleLarge"
              style={{ color: '#ffffff', fontWeight: '700', marginTop: 4 }}
            >
              {itemCount} db
            </Text>
          </Surface>

          <Surface
            style={{
              flex: 1,
              borderRadius: 20,
              padding: 14,
              marginLeft: 8,
              backgroundColor: '#111827',
              elevation: 4,
            }}
          >
            <Text variant="bodySmall" style={{ color: '#9ca3ff' }}>
              Összes várható összeg
            </Text>
            <Text
              variant="titleLarge"
              style={{ color: '#ffffff', fontWeight: '700', marginTop: 4 }}
            >
              {totalAmount.toLocaleString('hu-HU')} Ft
            </Text>
          </Surface>
        </View>

        {/* CTA gomb */}
        <Button
          mode="contained"
          onPress={() => navigation.navigate('Subscriptions')}
          style={{
            borderRadius: 999,
            marginTop: 4,
          }}
          contentStyle={{ paddingVertical: 8 }}
        >
          Előfizetések megnyitása
        </Button>
        <Button
        mode="outlined"
        onPress={() => navigation.navigate('Settings')}
        style={{
          borderRadius: 999,
          marginTop: 12,
          borderColor: '#2f3b83',
        }}
        textColor="#e5e7ff"
        contentStyle={{ paddingVertical: 8 }}
      >
        Beállítások
      </Button>
      </ScrollView>
    </View>
  );
}
