// src/screens/ReportsScreen.js

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { fetchAllSessions, fetchWeeklyData } from '../services/DatabaseService';
import { BarChart, PieChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

export default function ReportsScreen() {
  const [sessions, setSessions] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Veri çekme fonksiyonu
const loadData = async () => {
    setIsLoading(true);
    const allSessions = await fetchAllSessions();
    const weekly = await fetchWeeklyData();
    
    // ⚠️ KONTROL SATIRI: Buraya ekleyin
    console.log('--- ÇEKİLEN TÜM SEANSLAR ---', allSessions); 
    console.log('--- HAFTALIK ÖZET VERİSİ ---', weekly);

    setSessions(allSessions);
    setWeeklyData(weekly);
    setIsLoading(false);
};
  
  // Ekran her odaklandığında veriyi yenile
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  // Veri Hesaplamaları
  const today = new Date().toISOString().split('T')[0];
  const todaySessions = sessions.filter(s => s.date === today);

  const totalDurationToday = todaySessions.reduce((sum, s) => sum + s.duration, 0);
  const totalDurationAllTime = sessions.reduce((sum, s) => sum + s.duration, 0);
  const totalDistractions = sessions.reduce((sum, s) => sum + s.distractions, 0);

  // Kategoriye Göre Dağılım için Veri Hazırlama (Pasta Grafik)
  const categoryMap = sessions.reduce((map, s) => {
    map[s.category] = (map[s.category] || 0) + s.duration;
    return map;
  }, {});
  
  const categoryData = Object.keys(categoryMap).map((key, index) => ({
    name: key,
    duration: categoryMap[key],
    // Renkler, veri sayısı ne olursa olsun dinamik olarak atanır
    color: index === 0 ? '#4CAF50' : index === 1 ? '#2196F3' : index === 2 ? '#FF9800' : index === 3 ? '#9C27B0' : '#795548',
    legendFontColor: '#7F7F7F',
    legendFontSize: 15,
  }));
  
  // Haftalık Veri Hazırlama (Çubuk Grafik) - Son 7 günün tamamını gösterir
  const lastSevenDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i)); // Son 7 günü geriye doğru sayar
    return d.toISOString().split('T')[0];
  });
  
  const weeklyChartLabels = lastSevenDays.map(d => d.substring(5)); // Ay-Gün
  const weeklyChartDurations = lastSevenDays.map(day => {
      const dataPoint = weeklyData.find(d => d.date === day);
      // Data yoksa 0 döndürülür, hassasiyet için toFixed(1) kullanılır.
      return dataPoint ? parseFloat(dataPoint.totalDuration.toFixed(1)) : 0;
  });

  const weeklyChartData = {
    labels: weeklyChartLabels,
    datasets: [
      {
        data: weeklyChartDurations,
      },
    ],
  };
  
  if (isLoading) {
      return (
          <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2196F3" />
              <Text>Veriler yükleniyor...</Text>
          </View>
      );
  }
  
  // Eğer hiç seans kaydedilmediyse, kullanıcıyı bilgilendir
  if (sessions.length === 0) {
      return (
          <View style={styles.loadingContainer}>
              <Text style={styles.noDataTitle}>Henüz kaydedilmiş odaklanma seansı bulunmamaktadır.</Text>
              <Text style={styles.noDataText}>Lütfen Zamanlayıcı ekranında bir seans başlatıp kaydedin.</Text>
          </View>
      );
  }


  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Genel İstatistikler</Text>

      <View style={styles.statsCard}>
        <Text style={styles.statItem}>Bugün Toplam Odaklanma Süresi: <Text style={styles.statValue}>{totalDurationToday.toFixed(1)} dk</Text></Text>
        <Text style={styles.statItem}>Tüm Zamanların Toplam Odaklanma Süresi: <Text style={styles.statValue}>{totalDurationAllTime.toFixed(1)} dk</Text></Text>
        <Text style={styles.statItem}>Toplam Dikkat Dağıtımı Sayısı: <Text style={styles.statValue}>{totalDistractions}</Text></Text>
      </View>

      <Text style={styles.header}>Son 7 Günlük Odaklanma Süresi (dk)</Text>
      {weeklyChartDurations.some(d => d > 0) ? ( // Çubuk grafikte en az 1 veri varsa göster
        <ScrollView horizontal>
            <BarChart
              style={styles.chart}
              data={weeklyChartData}
              width={Math.max(screenWidth, weeklyChartLabels.length * 50)} 
              height={220}
              yAxisSuffix=" dk"
              chartConfig={{
                backgroundColor: '#fb8c00',
                backgroundGradientFrom: '#fb8c00',
                backgroundGradientTo: '#ffa726',
                decimalPlaces: 1, // Ondalık haneler korunur (0.5 dk gibi değerler için)
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
              }}
              verticalLabelRotation={30}
            />
        </ScrollView>
      ) : (
           <Text style={styles.noDataText}>Bu hafta için veri yok.</Text>
      )}

      <Text style={styles.header}>Kategorilere Göre Dağılım</Text>
      {categoryData.length > 0 && totalDurationAllTime > 0 ? ( // Pasta grafikte veri ve toplam süre varsa göster
          <PieChart
            data={categoryData}
            width={screenWidth - 20}
            height={220}
            chartConfig={{
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            accessor="duration"
            backgroundColor="transparent"
            paddingLeft="15"
            center={[10, 10]}
            absolute // Yüzdelik göstermek için
          />
        ) : (
             <Text style={styles.noDataText}>Grafik için yeterli veri yok.</Text>
        )}
        
        <View style={{height: 50}} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 15,
    paddingHorizontal: 5,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  statsCard: {
    backgroundColor: '#e8f5e9',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  statItem: {
    fontSize: 16,
    paddingVertical: 3,
  },
  statValue: {
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  noDataTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 10,
      textAlign: 'center'
  },
  noDataText: {
      textAlign: 'center',
      marginTop: 5,
      fontSize: 16,
      color: '#aaa'
  }
});