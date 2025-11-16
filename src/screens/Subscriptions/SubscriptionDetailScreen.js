// src/screens/Subscriptions/SubscriptionDetailScreen.js
import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import {
  Text,
  Surface,
  Button,
  Chip,
  ActivityIndicator,
  Snackbar,
} from 'react-native-paper';
import api from '../../api/api';

export default function SubscriptionDetailScreen({ route }) {
  const { subscription: initialSub } = route.params;

  const [sub, setSub] = useState(initialSub);
  const [bumping, setBumping] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const nextDateText = sub.nextChargeDate
    ? new Date(sub.nextChargeDate).toLocaleDateString('hu-HU')
    : '-';

  const createdAtText = sub.createdAt
    ? new Date(sub.createdAt).toLocaleDateString('hu-HU')
    : null;

  const billingLabel =
    sub.billingCycle === 'yearly'
      ? 'Éves előfizetés'
      : 'Havi előfizetés';

  const handleBumpNextCharge = async () => {
    setErrorText('');
    setBumping(true);
    try {
      const res = await api.post(
        `/api/subscriptions/${sub.id}/bump-next-charge`
      );
      const { nextChargeDate } = res.data || {};
      if (nextChargeDate) {
        setSub((old) => ({
          ...old,
          nextChargeDate,
        }));
      }
      setSnackbarVisible(true);
    } catch (e) {
      console.log('Bump next charge hiba:', e.response?.data || e.message);
      setErrorText(
        e.response?.data?.error ||
          'Nem sikerült frissíteni a következő terhelés dátumát.'
      );
    } finally {
      setBumping(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#050816' }}>
      <ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 32,
        }}
      >
        {/* Alap infók */}
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
              marginBottom: 4,
            }}
          >
            {sub.name}
          </Text>

          <Text
            style={{
              color: '#9ca3ff',
              fontSize: 13,
              marginBottom: 8,
            }}
          >
            {billingLabel}
          </Text>

          <Text
            style={{
              color: '#f9fafb',
              fontSize: 22,
              fontWeight: '700',
            }}
          >
            {sub.price.toLocaleString('hu-HU')} {sub.currency || 'HUF'}
          </Text>

          {sub.category ? (
            <Chip
              style={{
                marginTop: 10,
                alignSelf: 'flex-start',
                backgroundColor: '#1d264f',
              }}
              textStyle={{ color: '#e5e7ff', fontSize: 12 }}
              compact
            >
              {sub.category}
            </Chip>
          ) : null}

          {createdAtText ? (
            <Text
              style={{
                marginTop: 8,
                fontSize: 11,
                color: '#9ba0c8',
              }}
            >
              Létrehozva: {createdAtText}
            </Text>
          ) : null}

          {sub.notes ? (
            <Text
              style={{
                marginTop: 10,
                fontSize: 13,
                color: '#d1d5f0',
              }}
            >
              {sub.notes}
            </Text>
          ) : null}
        </Surface>

        {/* Következő terhelés kártya */}
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
              color: '#9ca3ff',
              fontSize: 13,
              marginBottom: 6,
            }}
          >
            Következő terhelés dátuma
          </Text>
          <Text
            style={{
              color: '#f9fafb',
              fontSize: 20,
              fontWeight: '700',
            }}
          >
            {nextDateText}
          </Text>

          <Text
            style={{
              marginTop: 8,
              color: '#9ba0c8',
              fontSize: 13,
            }}
          >
            A „Következő terhelés eltolása” gomb a jelenlegi dátum alapján
            lépteti tovább az előfizetést egy új ciklusra
            ({sub.billingCycle === 'yearly' ? '1 évvel' : '1 hónappal'}).
          </Text>

          {errorText ? (
            <Text
              style={{
                marginTop: 8,
                color: '#f97373',
                fontSize: 13,
              }}
            >
              {errorText}
            </Text>
          ) : null}

          <Button
            mode="contained"
            onPress={handleBumpNextCharge}
            loading={bumping}
            disabled={bumping}
            style={{
              borderRadius: 999,
              marginTop: 16,
            }}
            contentStyle={{ paddingVertical: 8 }}
          >
            Következő terhelés eltolása
          </Button>
        </Surface>
      </ScrollView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={2500}
        style={{ backgroundColor: '#16a34a' }}
      >
        Következő terhelés dátuma frissítve.
      </Snackbar>
    </View>
  );
}
