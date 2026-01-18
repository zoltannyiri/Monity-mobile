import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider, MD3LightTheme } from 'react-native-paper';
import { StatusBar } from 'react-native';

import { AuthProvider, AuthContext } from './src/context/AuthContext';

import LoginScreen from './src/screens/Auth/LoginScreen';
import DashboardScreen from './src/screens/Dashboard/DashboardScreen';
import SubscriptionsListScreen from './src/screens/Subscriptions/SubscriptionsListScreen';
import SettingsScreen from './src/screens/Settings/SettingsScreen';
import SubscriptionDetailScreen from './src/screens/Subscriptions/SubscriptionDetailScreen';
import SubscriptionFormScreen from './src/screens/Subscriptions/SubscriptionFormScreen';
import RegisterScreen from './src/screens/Auth/RegisterScreen';


const Stack = createNativeStackNavigator();

const theme = {
  ...MD3LightTheme,
  roundness: 18,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#0051ff',
    secondary: '#00d4ff',
    background: '#0b1020',
    surface: '#101425',
    onSurface: '#f5f5f5',
  },
};

function RootNavigator() {
  const { userToken, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return null;
  }

  return (
    <Stack.Navigator>
      {userToken == null ? (
        <>
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Register" 
            component={RegisterScreen} 
            options={{ 
              title: 'Új fiók', 
              headerStyle: { backgroundColor: '#050816' }, 
              headerTintColor: '#fff' 
            }} 
          />
        </>
      ) : (
        <>
          <Stack.Screen
            name="Dashboard"
            component={DashboardScreen}
            options={{
              title: 'Monity',
              headerStyle: { backgroundColor: '#050816' },
              headerTintColor: '#ffffff',
              headerShadowVisible: false,
            }}
          />
          <Stack.Screen
            name="Subscriptions"
            component={SubscriptionsListScreen}
            options={{
              title: 'Előfizetések',
              headerStyle: { backgroundColor: '#050816' },
              headerTintColor: '#ffffff',
              headerShadowVisible: false,
            }}
          />
          <Stack.Screen
            name="SubscriptionDetail"
            component={SubscriptionDetailScreen}
            options={{
              title: 'Előfizetés részletei',
              headerStyle: { backgroundColor: '#050816' },
              headerTintColor: '#ffffff',
              headerShadowVisible: false,
            }}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{
              title: 'Beállítások',
              headerStyle: { backgroundColor: '#050816' },
              headerTintColor: '#ffffff',
              headerShadowVisible: false,
            }}
          />
          <Stack.Screen 
            name="SubscriptionForm" 
            component={SubscriptionFormScreen} 
            options={{ title: 'Előfizetés' }} 
          />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <PaperProvider theme={theme}>
        <StatusBar barStyle="light-content" backgroundColor="#050816" />
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </PaperProvider>
    </AuthProvider>
  );
}
