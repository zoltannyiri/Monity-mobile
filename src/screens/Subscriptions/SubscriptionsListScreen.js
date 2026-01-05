import React, { useCallback, useState } from 'react';
import { View, FlatList, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  Text,
  ActivityIndicator,
  Surface,
  Chip,
  FAB,
  useTheme,
} from 'react-native-paper';
import api from '../../api/api';

export default function SubscriptionsListScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  // 🔥 Ez biztosítja, hogy ha visszajövünk a Create/Edit képernyőről,
  // újratöltődik a lista.
  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadSubscriptions = async () => {
        try {
          const res = await api.get('/api/subscriptions');
          if (isActive) {
            setItems(Array.isArray(res.data) ? res.data : []);
          }
        } catch (e) {
          console.log('Subscriptions hiba:', e.message);
        } finally {
          if (isActive) setLoading(false);
        }
      };

      loadSubscriptions();

      return () => {
        isActive = false;
      };
    }, [])
  );

  const renderItem = ({ item }) => {
    const nextDateText = item.nextChargeDate
      ? new Date(item.nextChargeDate).toLocaleDateString('hu-HU')
      : '-';

    return (
      <TouchableOpacity
        onPress={() =>
          navigation.navigate('SubscriptionDetail', { subscription: item })
        }
        activeOpacity={0.8}
      >
        <Surface
          style={{
            padding: 14,
            borderRadius: 20,
            marginBottom: 10,
            backgroundColor: '#111827',
            elevation: 3,
          }}
        >
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between' }}
          >
            {/* BAL OLDAL */}
            <View style={{ flex: 1, paddingRight: 8 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: '#f9fafb',
                }}
                numberOfLines={1}
              >
                {item.name}
              </Text>
              <Text
                style={{
                  marginTop: 4,
                  fontSize: 12,
                  color: '#9ca3ff',
                }}
              >
                {item.billingCycle === 'yearly' ? 'Éves' : 'Havi'} • Köv.:{' '}
                {nextDateText}
              </Text>
              {item.notes ? (
                <Text
                  style={{
                    marginTop: 4,
                    fontSize: 12,
                    color: '#9ba0c8',
                  }}
                  numberOfLines={1}
                >
                  {item.notes}
                </Text>
              ) : null}
            </View>

            {/* JOBB OLDAL (Ár) */}
            <View style={{ alignItems: 'flex-end' }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '700',
                  color: '#f9fafb',
                }}
              >
                {item.price.toLocaleString('hu-HU')} {item.currency || 'HUF'}
              </Text>
              {item.category ? (
                <Chip
                  style={{
                    marginTop: 6,
                    backgroundColor: '#1d264f',
                  }}
                  textStyle={{ color: '#e5e7ff', fontSize: 11 }}
                  compact
                >
                  {item.category}
                </Chip>
              ) : null}
            </View>
          </View>
        </Surface>
      </TouchableOpacity>
    );
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
        <ActivityIndicator color="#4c6ef5" />
        <Text style={{ marginTop: 8, color: '#d1d5f0' }}>
          Előfizetések betöltése...
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#050816' }}>
      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={{ marginTop: 50, alignItems: 'center' }}>
            <Text style={{ color: '#e5e7ff', textAlign: 'center' }}>
              Még nincs felvéve előfizetés.
            </Text>
            <Text style={{ color: '#9ca3ff', marginTop: 4 }}>
              Nyomd meg a + gombot a jobb alsó sarokban!
            </Text>
          </View>
        }
      />

      {/* LEBEGŐ GOMB (FAB) */}
      <FAB
        icon={() => (
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 24, color: 'white', fontWeight: 'bold', marginTop: -2 }}>
              +
            </Text>
          </View>
        )}
        style={{
          position: 'absolute',
          margin: 16,
          right: 0,
          bottom: 0,
          backgroundColor: '#4c6ef5',
        }}
        color="white"
        onPress={() => navigation.navigate('SubscriptionForm')}
      />
    </View>
  );
}