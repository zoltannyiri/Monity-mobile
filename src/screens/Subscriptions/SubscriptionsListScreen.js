import React, { useEffect, useState } from 'react';
import { View, FlatList, TouchableOpacity } from 'react-native';
import {
  Text,
  ActivityIndicator,
  Surface,
  Chip,
} from 'react-native-paper';
import api from '../../api/api';

export default function SubscriptionsListScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSubscriptions = async () => {
      try {
        const res = await api.get('/api/subscriptions');
        setItems(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        console.log('Subscriptions hiba:', e.message);
      } finally {
        setLoading(false);
      }
    };

    loadSubscriptions();
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
        <Text style={{ marginTop: 8, color: '#d1d5f0' }}>
          Előfizetések betöltése...
        </Text>
      </View>
    );
  }

  if (!items.length) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#050816',
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 24,
        }}
      >
        <Text
          style={{
            textAlign: 'center',
            color: '#e5e7ff',
          }}
        >
          Még nincs egyetlen előfizetés sem. Vedd fel őket a webes Monity-ben,
          vagy később csinálunk ide is felviteli felületet. 🙂
        </Text>
      </View>
    );
  }

  const renderItem = ({ item }) => {
    const dateText = item.nextChargeDate
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
                {item.billingCycle === 'yearly' ? 'Éves' : 'Havi'} • Köv.
                terhelés: {dateText}
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

  return (
    <View style={{ flex: 1, backgroundColor: '#050816', padding: 16 }}>
      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
