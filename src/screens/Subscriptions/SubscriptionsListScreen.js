import React, { useCallback, useState } from 'react';
import { View, FlatList, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  Text,
  ActivityIndicator,
  Surface,
  FAB,
  useTheme,
  IconButton, // Hozzáadva az ikonokhoz
} from 'react-native-paper';
import api from '../../api/api';

const getCategoryIcon = (category) => {
  // Eltávolítjuk a felesleges szóközöket és kisbetűssé alakítjuk
  const cat = category?.toLowerCase().trim();

  switch (cat) {
    case 'streaming': return 'television-play';
    case 'zene': return 'music';
    case 'film': return 'movie-open-play';
    case 'gaming': return 'controller-classic';
    case 'rezsi': return 'home-lightning-bolt';
    case 'internet': return 'wifi';
    case 'telefon': return 'cellphone';
    case 'biztosítás': return 'shield-check';
    case 'szoftver': return 'microsoft-visual-studio-code';
    case 'tárhely': return 'cloud-upload';
    case 'oktatás': return 'school';
    case 'edzés': return 'dumbbell';
    case 'étel': return 'food-apple';
    default: return 'credit-card-outline'; 
  }
};

export default function SubscriptionsListScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

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
      return () => { isActive = false; };
    }, [])
  );

  const renderItem = ({ item }) => {
    const nextDateText = item.nextChargeDate
      ? new Date(item.nextChargeDate).toLocaleDateString('hu-HU')
      : '-';

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('SubscriptionDetail', { subscription: item })}
        activeOpacity={0.8}
      >
        <Surface
          style={{
            padding: 12,
            borderRadius: 22,
            marginBottom: 12,
            backgroundColor: '#111827',
            elevation: 3,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            
            {/* 🔥 IKON KONTÉNER */}
            <View style={{ 
              width: 50, 
              height: 50, 
              borderRadius: 15, 
              backgroundColor: '#1d264f', 
              justifyContent: 'center', 
              alignItems: 'center',
              marginRight: 14 
            }}>
               <IconButton 
                 icon={getCategoryIcon(item.category)} 
                 iconColor="#9ca3ff" 
                 size={26} 
                 style={{ margin: 0 }}
               />
            </View>

            {/* KÖZÉPSŐ INFÓ (Név, Ciklus) */}
            <View style={{ flex: 1, paddingRight: 8 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '700',
                  color: '#f9fafb',
                }}
                numberOfLines={1}
              >
                {item.name}
              </Text>
              <Text
                style={{
                  marginTop: 2,
                  fontSize: 12,
                  color: '#9ca3ff',
                }}
              >
                {item.billingCycle === 'yearly' ? 'Éves' : 'Havi'} • Köv.: {nextDateText}
              </Text>
            </View>

            {/* JOBB OLDAL (Ár) */}
            <View style={{ alignItems: 'flex-end' }}>
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: '800',
                  color: '#ffffff',
                }}
              >
                {item.price.toLocaleString('hu-HU')} {item.currency}
              </Text>
              {item.category ? (
                <Text style={{ fontSize: 10, color: '#4b5563', marginTop: 2, textTransform: 'uppercase' }}>
                  {item.category}
                </Text>
              ) : null}
            </View>

          </View>
        </Surface>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#050816', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color="#4c6ef5" size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#050816' }}>
      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={{ marginTop: 50, alignItems: 'center' }}>
            <Text style={{ color: '#e5e7ff', textAlign: 'center' }}>Még nincs felvéve előfizetés.</Text>
          </View>
        }
      />

      <FAB
        icon="plus"
        label="Hozzáadás"
        style={{
          position: 'absolute',
          margin: 16,
          right: 0,
          bottom: 0,
          backgroundColor: '#4c6ef5',
          borderRadius: 16,
        }}
        color="white"
        onPress={() => navigation.navigate('SubscriptionForm')}
      />
    </View>
  );
}