import React, { useContext, useState } from 'react';
import { View, KeyboardAvoidingView, Platform } from 'react-native';
import {
  TextInput,
  Button,
  Text,
  Surface,
  HelperText,
  useTheme,
} from 'react-native-paper';
import { AuthContext } from '../../context/AuthContext';

export default function LoginScreen() {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('demo@monity.local');
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
      await login(email, password);
    } catch (err) {
      console.log(err);
      setErrorText('Bejelentkezés sikertelen. Ellenőrizd az adataidat vagy a szervert.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#050816' }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Felső hero rész */}
        <View
          style={{
            flex: 1.2,
            paddingHorizontal: 24,
            paddingTop: 48,
            justifyContent: 'flex-end',
          }}
        >
          <Text
            variant="headlineMedium"
            style={{
              color: '#ffffff',
              fontWeight: '700',
              marginBottom: 8,
            }}
          >
            Monity
          </Text>
          <Text
            variant="bodyMedium"
            style={{
              color: '#a1a1c2',
              maxWidth: 280,
            }}
          >
            Előfizetések, terhelések, értesítések – egy helyen, átláthatóan.
          </Text>
        </View>

        {/* Alsó „card / sheet” rész */}
        <View style={{ flex: 1.4, justifyContent: 'flex-end' }}>
          <Surface
            style={{
              borderTopLeftRadius: 32,
              borderTopRightRadius: 32,
              paddingHorizontal: 24,
              paddingTop: 24,
              paddingBottom: 32,
              backgroundColor: theme.colors.surface,
              elevation: 6,
            }}
          >
            <Text
              variant="titleMedium"
              style={{ marginBottom: 12, color: theme.colors.onSurface }}
            >
              Bejelentkezés
            </Text>

            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              mode="outlined"
              left={<TextInput.Icon icon="email-outline" />}
              style={{ marginBottom: 12 }}
            />

            <TextInput
              label="Jelszó"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              mode="outlined"
              left={<TextInput.Icon icon="lock-outline" />}
              style={{ marginBottom: 4 }}
            />

            {!!errorText && (
              <HelperText type="error" visible={true}>
                {errorText}
              </HelperText>
            )}

            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={submitting}
              disabled={submitting}
              style={{ marginTop: 16, borderRadius: 999 }}
              contentStyle={{ paddingVertical: 8 }}
            >
              Belépés a Monity-be
            </Button>

            <Text
              variant="bodySmall"
              style={{
                marginTop: 16,
                color: '#777a99',
                textAlign: 'center',
              }}
            >
              A belépéssel elfogadod a Monity szolgáltatás használati feltételeit.
            </Text>
          </Surface>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
