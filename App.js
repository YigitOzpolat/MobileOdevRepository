// App.js

import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { initDatabase } from './src/services/DatabaseService';
import TimerScreen from './src/screens/TimerScreen';
import ReportsScreen from './src/screens/ReportsScreen';
import { Text, View, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

export default function App() {
  const [dbInitialized, setDbInitialized] = useState(false);

  useEffect(() => {
    const setupDB = async () => {
      await initDatabase();
      setDbInitialized(true);
    };
    setupDB();
  }, []);

  if (!dbInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Veri tabanı hazırlanıyor...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === 'Zamanlayıcı') {
              iconName = focused ? 'timer' : 'timer-outline';
            } else if (route.name === 'Raporlar') {
              iconName = focused ? 'stats-chart' : 'stats-chart-outline';
            }
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#4CAF50', // Yeşil
          tabBarInactiveTintColor: 'gray',
          headerTitleAlign: 'center',
        })}
      >
        <Tab.Screen name="Zamanlayıcı" component={TimerScreen} />
        <Tab.Screen name="Raporlar" component={ReportsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});