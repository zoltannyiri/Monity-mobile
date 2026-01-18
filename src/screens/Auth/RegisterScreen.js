import React, { useState, useContext } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, Surface, HelperText } from 'react-native-paper';
import { AuthContext } from '../../context/AuthContext';
import api from '../../api/api';

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);

    const handleRegister = async () => {
    if (!email || !password || !username) return setError('Minden mezőt tölts ki!');
    
    setLoading(true);
    setError('');
    try {
        // 🔥 FONTOS: Itt /api/auth/register KELL legyen!
        const res = await api.post('/api/auth/register', { 
        email, 
        username, 
        password 
        });
        
        // A regisztráció után a backend tokent ad, amivel beléptetjük
        await login(res.data.token, res.data.user); 
    } catch (err) {
        console.log('Regisztrációs hiba:', err.response?.data || err.message);
        // Itt jelenik meg, ha foglalt az email (400-as hiba)
        setError(err.response?.data?.error || 'Sikertelen regisztráció.');
    } finally {
        setLoading(false);
    }
    };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <Surface style={styles.surface}>
          <Text variant="headlineMedium" style={styles.title}>Regisztráció</Text>
          <TextInput label="Felhasználónév" value={username} onChangeText={setUsername} mode="outlined" style={styles.input} />
          <TextInput label="Email" value={email} onChangeText={setEmail} mode="outlined" style={styles.input} />
          <TextInput label="Jelszó" value={password} onChangeText={setPassword} mode="outlined" secureTextEntry style={styles.input} />
          
          {!!error && <HelperText type="error">{error}</HelperText>}
          
          <Button mode="contained" onPress={handleRegister} loading={loading} style={styles.button}>
            Fiók létrehozása
          </Button>
          <Button onPress={() => navigation.goBack()} textColor="#9ca3ff">
            Vissza a belépéshez
          </Button>
        </Surface>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050816', justifyContent: 'center', padding: 20 },
  surface: { padding: 20, borderRadius: 24, backgroundColor: '#111827' },
  title: { color: '#fff', textAlign: 'center', marginBottom: 20, fontWeight: 'bold' },
  input: { marginBottom: 12 },
  button: { marginTop: 10, borderRadius: 12 }
});