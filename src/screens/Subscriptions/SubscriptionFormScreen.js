import React, { useState, useEffect } from 'react';
import { View, ScrollView, Platform, KeyboardAvoidingView } from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Surface,
  HelperText,
  SegmentedButtons,
  Snackbar,
  useTheme,
  Appbar,
} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker'; // Ha felraktad
import api from '../../api/api';
import { Menu } from 'react-native-paper';
import { Portal } from 'react-native-paper';

export default function SubscriptionFormScreen({ navigation, route }) {
  const theme = useTheme();
  
  // Ha van params.subscription, akkor EDIT mód, amúgy CREATE
  const editingSub = route.params?.subscription;
  const isEditMode = !!editingSub;
  const [showCurrencyMenu, setShowCurrencyMenu] = useState(false);
  const currencies = ['HUF', 'EUR', 'USD'];
  const [name, setName] = useState(editingSub?.name || '');
  const [price, setPrice] = useState(editingSub?.price?.toString() || '');
  const [currency, setCurrency] = useState(editingSub?.currency || 'HUF');
  const [billingCycle, setBillingCycle] = useState(editingSub?.billingCycle || 'monthly');
  const [category, setCategory] = useState(editingSub?.category || '');
  const [notes, setNotes] = useState(editingSub?.notes || '');
  
  // Dátum kezelés
  const [nextChargeDate, setNextChargeDate] = useState(
    editingSub?.nextChargeDate ? new Date(editingSub.nextChargeDate) : new Date()
  );
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState('');

  // Fejléc beállítása (Cím)
  useEffect(() => {
    navigation.setOptions({
      title: isEditMode ? 'Előfizetés szerkesztése' : 'Új előfizetés',
      headerStyle: { backgroundColor: '#050816' },
      headerTintColor: '#fff',
    });
  }, [navigation, isEditMode]);

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setNextChargeDate(selectedDate);
    }
  };

  const handleSave = async () => {
    setErrorText('');
    
    if (!name || !price) {
      setErrorText('A név és az ár megadása kötelező.');
      return;
    }

    setLoading(true);
    const payload = {
      name,
      price: Number(price),
      currency,
      billingCycle,
      nextChargeDate,
      category,
      notes,
    };

    try {
      if (isEditMode) {
        // UPDATE
        await api.put(`/api/subscriptions/${editingSub.id}`, payload);
      } else {
        // CREATE
        await api.post('/api/subscriptions', payload);
      }
      
      // Visszalépés
      navigation.goBack();
      
    } catch (err) {
      console.log('Mentés hiba:', err);
      setErrorText('Nem sikerült menteni. Ellenőrizd az internetkapcsolatot.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!isEditMode) return;
    setLoading(true);
    try {
      await api.delete(`/api/subscriptions/${editingSub.id}`);
      navigation.pop(2); // Vissza a listához (átugorva a részleteket)
    } catch (err) {
      setErrorText('Nem sikerült törölni.');
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#050816' }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
          
          <Surface style={{ padding: 16, borderRadius: 16, backgroundColor: '#111827' }}>
            
            {/* NÉV */}
            <TextInput
              label="Szolgáltatás neve (pl. Netflix)"
              value={name}
              onChangeText={setName}
              mode="outlined"
              style={{ marginBottom: 12 }}
            />

            {/* ÁR + PÉNZNEM sor */}
            <View style={{ gap: 10, marginBottom: 12 }}>
              <TextInput
  label="Ár"
  value={price}
  onChangeText={setPrice}
  keyboardType="numeric"
  mode="outlined"
  style={{ marginBottom: 16 }} // Flex törölve, sima margó hozzáadva
/>

{/* PÉNZNEM VÁLASZTÓ - Most már külön sorban */}
<Text style={{ color: '#9ca3ff', marginBottom: 8, fontSize: 14 }}>
  Pénznem
</Text>
<SegmentedButtons
  value={currency}
  onValueChange={setCurrency}
  buttons={[
    { value: 'HUF', label: 'HUF'},
    { value: 'EUR', label: 'EUR'},
    { value: 'USD', label: 'USD'},
  ]}
  style={{ marginBottom: 16}}
  theme={{ 
    colors: { 
      secondaryContainer: '#2f3b83', 
      onSecondaryContainer: '#fff',
      outline: '#4b5563' 
    } 
  }}
/>
            </View>

            {/* CIKLUS */}
            <Text style={{ color: '#9ca3ff', marginBottom: 8, marginTop: 4 }}>Számlázási ciklus</Text>
            <SegmentedButtons
              value={billingCycle}
              onValueChange={setBillingCycle}
              buttons={[
                { value: 'monthly', label: 'Havi' },
                { value: 'yearly', label: 'Éves' },
              ]}
              style={{ marginBottom: 16 }}
              theme={{ colors: { secondaryContainer: '#2f3b83', onSecondaryContainer: '#fff' } }}
            />

            {/* DÁTUM */}
            <Text style={{ color: '#9ca3ff', marginBottom: 8 }}>Következő terhelés dátuma</Text>
            <Button 
              mode="outlined" 
              onPress={() => setShowDatePicker(true)}
              style={{ marginBottom: 16, borderColor: '#4b5563' }}
              textColor="#e5e7ff"
            >
              {nextChargeDate.toLocaleDateString('hu-HU')}
            </Button>

            {/* Itt jelenik meg a natív picker, ha a gombra nyomunk */}
            {showDatePicker && (
              <DateTimePicker
                value={nextChargeDate}
                mode="date"
                display="default"
                onChange={handleDateChange}
              />
            )}

            {/* KATEGÓRIA & MEGJEGYZÉS */}
            <TextInput
              label="Kategória (pl. Szórakozás)"
              value={category}
              onChangeText={setCategory}
              mode="outlined"
              style={{ marginBottom: 12 }}
            />

            <TextInput
              label="Megjegyzés"
              value={notes}
              onChangeText={setNotes}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={{ marginBottom: 12 }}
            />

            {/* HIBAÜZENET */}
            {!!errorText && (
              <HelperText type="error" visible={true}>
                {errorText}
              </HelperText>
            )}

            {/* MENTÉS GOMB */}
            <Button
              mode="contained"
              onPress={handleSave}
              loading={loading}
              disabled={loading}
              style={{ marginTop: 8, borderRadius: 999 }}
              contentStyle={{ paddingVertical: 6 }}
            >
              {isEditMode ? 'Módosítások mentése' : 'Hozzáadás'}
            </Button>

            {/* TÖRLÉS GOMB (csak szerkesztésnél) */}
            {isEditMode && (
              <Button
                mode="text"
                onPress={handleDelete}
                loading={loading}
                disabled={loading}
                textColor="#ef4444"
                style={{ marginTop: 12 }}
              >
                Előfizetés törlése
              </Button>
            )}

          </Surface>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}