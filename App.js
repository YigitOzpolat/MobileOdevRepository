// App.js

import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { initDatabase } from './src/db/Database'; // 1. Adımda yazdığımız dosya
import { Ionicons } from '@expo/vector-icons'; // İkonlar için

// Ekranları import edelim
import TimerScreen from './src/screens/TimerScreen';
import ReportsScreen from './src/screens/ReportsScreen';

const Tab = createBottomTabNavigator();

// Uygulama başladığında veritabanını başlatalım
initDatabase(); 

export default function App() {
  
  // Veritabanı başlatma işlemini burada yapabiliriz
  // useEffect(() => { initDatabase(); }, []);

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            
            if (route.name === 'Zamanlayıcı') {
              iconName = focused ? 'timer' : 'timer-outline';
            } else if (route.name === 'Raporlar') {
              iconName = focused ? 'bar-chart' : 'bar-chart-outline';
            }

            // 

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#3b82f6', // Mavi Tonu
          tabBarInactiveTintColor: 'gray',
          headerTitleStyle: { fontWeight: 'bold' },
        })}
      >
        <Tab.Screen 
          name="Zamanlayıcı" 
          component={TimerScreen} 
          options={{ title: 'Odaklanma Seansı' }}
        />
        <Tab.Screen 
          name="Raporlar" 
          component={ReportsScreen} 
          options={{ title: 'İstatistikler' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}