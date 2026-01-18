import React, { useContext, useState } from 'react';
import { View, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, Surface, HelperText, useTheme } from 'react-native-paper';
import { AuthContext } from '../../context/AuthContext';
import api from '../../api/api';

export default function LoginScreen({ navigation }) {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorText, setErrorText] = useState('');
  const theme = useTheme();

  const handleSubmit = async () => {
    setErrorText('');
    if (!email || !password) {
      setErrorText('Kérlek add meg az email címet és a jelszót.');
      return;
    }

    try {
      setSubmitting(true);
      // 🔥 FONTOS: A backend 'identifier' néven várja az emailt/felhasználónevet!
      const res = await api.post('/api/auth/login', { 
        identifier: email, 
        password: password 
      });
      
      // Az AuthContext login függvényét hívjuk
      await login(res.data.token, res.data.user);
    } catch (err) {
      console.log('Login hiba:', err.response?.data || err.message);
      setErrorText(err.response?.data?.error || 'Hibás adatok.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#050816' }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={{ flex: 1.2, paddingHorizontal: 24, paddingTop: 48, justifyContent: 'flex-end' }}>
          <Text variant="headlineMedium" style={{ color: '#fff', fontWeight: '700' }}>Monity</Text>
          <Text variant="bodyMedium" style={{ color: '#a1a1c2' }}>Minden pénzügyed egy helyen.</Text>
        </View>

        <View style={{ flex: 1.4, justifyContent: 'flex-end' }}>
          <Surface style={{ borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, backgroundColor: theme.colors.surface }}>
            <Text variant="titleMedium" style={{ marginBottom: 12 }}>Bejelentkezés</Text>
            <TextInput label="Email" value={email} onChangeText={setEmail} mode="outlined" style={{ marginBottom: 12 }} />
            <TextInput label="Jelszó" value={password} onChangeText={setPassword} secureTextEntry mode="outlined" />
            
            {!!errorText && <HelperText type="error">{errorText}</HelperText>}

            <Button mode="contained" onPress={handleSubmit} loading={submitting} disabled={submitting} style={{ marginTop: 16 }}>
              Belépés
            </Button>
            <Button onPress={() => navigation.navigate('Register')} textColor="#9ca3ff">
              Regisztráció
            </Button>
          </Surface>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}