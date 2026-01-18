import React, { useContext, useCallback, useState } from 'react';
import { ScrollView, View, Dimensions } from 'react-native'; // Dimensions kell a diagramhoz
import { useFocusEffect } from '@react-navigation/native';
import {
  Text,
  Button,
  ActivityIndicator,
  Surface,
  useTheme,
} from 'react-native-paper';
import { PieChart } from 'react-native-chart-kit'; // 🔥 A diagram komponens
import api from '../../api/api';
import { AuthContext } from '../../context/AuthContext';

const screenWidth = Dimensions.get('window').width;

const getRandomColor = (index) => {
  const colors = ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
  return colors[index % colors.length];
};
export default function DashboardScreen({ navigation }) {
  const { user, logout } = useContext(AuthContext);

  const [exchangeRate, setExchangeRate] = useState(400);
  const [loading, setLoading] = useState(true);
  const [notifyData, setNotifyData] = useState(null); // Értesítési adatok
  const [chartData, setChartData] = useState([]); // Diagram adatok
  const [totalMonthly, setTotalMonthly] = useState(0); // Összes havi költség becslés

  const theme = useTheme();

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadData = async () => {
        try {
          // 1. Párhuzamosan lekérjük az értesítéseket ÉS az összes előfizetést
          const [notifyRes, subsRes, rateRes] = await Promise.all([
            api.get('/api/notifications/preview'),
            api.get('/api/subscriptions'),
            api.get('/api/exchange-rate')
          ]);

          if (isActive) {
            setNotifyData(notifyRes.data);
            setExchangeRate(rateRes.data.rate);
            processChartData(subsRes.data, rateRes.data.rate);
          }
        } catch (e) {
          console.log('Dashboard load hiba:', e.message);
        } finally {
          if (isActive) setLoading(false);
        }
      };

      loadData();

      return () => {
        isActive = false;
      };
    }, [])
  );

  // 🔥 Itt dolgozzuk fel az adatokat a diagramhoz
  const processChartData = (subscriptions, currentRate) => {
    if (!Array.isArray(subscriptions)) return;

    const categoryMap = {};
    let totalHufPerMonth = 0;

    subscriptions.forEach((sub) => {
      const cat = sub.category || 'Egyéb';
      
      // 1. Havi szintre hozás (ha éves az előfizetés, osztjuk 12-vel)
      let monthlyPrice = sub.price;
      if (sub.billingCycle === 'yearly') {
        monthlyPrice = sub.price / 12;
      }

      // 2. Deviza átszámítás HUF-ra a diagramhoz és az összesítéshez
      let priceInHuf = monthlyPrice;
      if (sub.currency === 'EUR') {
        priceInHuf = monthlyPrice * currentRate;
      } else if (sub.currency === 'USD') {
        // Itt egy fix dollár váltót (pl. 355) használunk, vagy a backendből ezt is leküldhetjük
        priceInHuf = monthlyPrice * (currentRate * 0.92); 
      }

      // 3. Kategória szerinti gyűjtés
      if (!categoryMap[cat]) categoryMap[cat] = 0;
      categoryMap[cat] += Math.round(priceInHuf);
      
      // 4. Havi összesen gyűjtése
      totalHufPerMonth += priceInHuf;
    });

    setTotalMonthly(Math.round(totalHufPerMonth));

    // Diagram adatok előkészítése
    const chartItems = Object.keys(categoryMap).map((cat, index) => ({
      name: cat,
      population: categoryMap[cat],
      color: getRandomColor(index),
      legendFontColor: '#e5e7ff',
      legendFontSize: 12,
    }));

    chartItems.sort((a, b) => b.population - a.population);
    setChartData(chartItems);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#050816', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color="#4c6ef5" />
      </View>
    );
  }

  const notifyDays = notifyData?.notifyDaysBefore ?? 7;
  const upcomingCount = notifyData?.count ?? 0;
  const upcomingTotal = notifyData?.totalAmount || 0;

  return (
    <View style={{ flex: 1, backgroundColor: '#050816' }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <View>
            <Text variant="bodySmall" style={{ color: '#9ca3ff' }}>Üdv újra,</Text>
            <Text variant="titleMedium" style={{ color: '#ffffff', fontWeight: '600' }}>
              {user?.username || 'Felhasználó'}
            </Text>
          </View>
          <Button 
            mode="outlined" 
            compact 
            onPress={logout} 
            textColor="#e5e7ff" 
            style={{ borderColor: '#2f3b83', borderRadius: 999 }}
          >
            Kijelentkezés
          </Button>
        </View>

        {/* 🔥 KÖRDIAGRAM KÁRTYA */}
        <Surface style={{ borderRadius: 24, padding: 10, marginBottom: 16, backgroundColor: '#111827', elevation: 4, alignItems: 'center' }}>
          <Text style={{ color: '#9ca3ff', alignSelf: 'flex-start', marginLeft: 10, marginTop: 10 }}>
            Havi költések kategóriánként (becsült)
          </Text>
          
          {chartData.length > 0 ? (
            <>
            <PieChart
              data={chartData}
              width={screenWidth - 60}
              height={220}
              chartConfig={{
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              }}
              accessor={"population"}
              backgroundColor={"transparent"}
              paddingLeft={"15"}
              center={[10, 0]}
              absolute 
            />
            <Text style={{ 
              color: '#4b5563', 
              fontSize: 10, 
              textAlign: 'center', 
              marginTop: -10, // A negatív margó miatt közelebb kerül a diagramhoz
              marginBottom: 10 
            }}>
              Alkalmazott árfolyam: 1 EUR = {exchangeRate} HUF (Élő adat)
            </Text>
            </>
          ) : (
            <View style={{ height: 150, justifyContent: 'center' }}>
              <Text style={{ color: '#555' }}>Nincs elég adat a diagramhoz.</Text>
            </View>
          )}

          <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 10 }}>
            <Text style={{ color: '#9ca3ff' }}>Összesen/hó:</Text>
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
              {totalMonthly.toLocaleString('hu-HU')} HUF
            </Text>
          </View>
        </Surface>

        <Surface style={{ 
          borderRadius: 24, 
          padding: 18, 
          marginBottom: 16, 
          backgroundColor: '#1d264f', // Sötétebb kék a kiemeléshez
          elevation: 6 
        }}>
          <Text variant="labelLarge" style={{ color: '#9ca3ff', marginBottom: 4 }}>
            Éves várható összköltség
          </Text>
          <Text variant="headlineMedium" style={{ color: '#ffffff', fontWeight: '800' }}>
            {Math.round(totalMonthly * 12).toLocaleString('hu-HU')} HUF
          </Text>
          <Text style={{ color: '#9ba0c8', fontSize: 12, marginTop: 4 }}>
            A jelenlegi előfizetéseid alapján számított 12 havi becslés.
          </Text>
        </Surface>

        {/* Értesítési összegző kártyák (a régi kód) */}
        <View style={{ flexDirection: 'row', marginBottom: 16 }}>
          <Surface style={{ flex: 1, borderRadius: 20, padding: 14, marginRight: 8, backgroundColor: '#111827' }}>
            <Text variant="bodySmall" style={{ color: '#9ca3ff' }}>Közelgő ({notifyDays} nap)</Text>
            <Text variant="titleLarge" style={{ color: '#ffffff', fontWeight: '700', marginTop: 4 }}>
              {upcomingCount} db
            </Text>
          </Surface>

          <Surface style={{ flex: 1, borderRadius: 20, padding: 14, marginLeft: 8, backgroundColor: '#111827' }}>
            <Text variant="bodySmall" style={{ color: '#9ca3ff' }}>Fizetendő</Text>
            <Text variant="titleLarge" style={{ color: '#ffffff', fontWeight: '700', marginTop: 4 }}>
              {upcomingTotal.toLocaleString('hu-HU')} Ft
            </Text>
          </Surface>
        </View>

        {/* CTA gombok */}
        <Button
          mode="contained"
          onPress={() => navigation.navigate('Subscriptions')}
          style={{ borderRadius: 999, marginTop: 4, backgroundColor: '#4c6ef5' }}
          contentStyle={{ paddingVertical: 8 }}
        >
          Előfizetések kezelése
        </Button>

        <Button
          mode="text"
          onPress={() => navigation.navigate('Settings')}
          textColor="#9ca3ff"
          style={{ marginTop: 12 }}
        >
          Beállítások
        </Button>
      </ScrollView>
    </View>
  );
}