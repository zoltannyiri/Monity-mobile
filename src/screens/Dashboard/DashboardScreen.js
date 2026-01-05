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

// Segédfüggvény véletlen színekhez a diagram szeleteinek
const getRandomColor = (index) => {
  const colors = ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
  return colors[index % colors.length];
};

export default function DashboardScreen({ navigation }) {
  const { user, logout } = useContext(AuthContext);
  
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
          const [notifyRes, subsRes] = await Promise.all([
            api.get('/api/notifications/preview'),
            api.get('/api/subscriptions')
          ]);

          if (isActive) {
            setNotifyData(notifyRes.data);
            processChartData(subsRes.data);
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
  const processChartData = (subscriptions) => {
    if (!Array.isArray(subscriptions)) return;

    const categoryMap = {};
    let total = 0;

    subscriptions.forEach((sub) => {
      // Ha nincs kategória, legyen "Egyéb"
      const cat = sub.category ? sub.category.trim() : 'Egyéb';
      
      // Egyszerűsített számítás: mindent havi költségre vetítünk
      // (Ha éves, osztjuk 12-vel, hogy reális legyen a diagram)
      let monthlyPrice = sub.price;
      if (sub.billingCycle === 'yearly') {
        monthlyPrice = Math.round(sub.price / 12);
      }

      if (!categoryMap[cat]) {
        categoryMap[cat] = 0;
      }
      categoryMap[cat] += monthlyPrice;
      total += monthlyPrice;
    });

    setTotalMonthly(total);

    // Átalakítás a ChartKit formátumára
    const chartItems = Object.keys(categoryMap).map((cat, index) => ({
      name: cat,
      population: categoryMap[cat], // Ez az érték
      color: getRandomColor(index),
      legendFontColor: '#e5e7ff',
      legendFontSize: 12,
    }));

    // Csökkenő sorrendbe rendezzük
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
              {user?.email?.split('@')[0] || 'Felhasználó'}
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
              absolute // Ha true, akkor az értéket írja ki, nem százalékot
            />
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