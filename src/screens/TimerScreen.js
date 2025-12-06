// src/screens/TimerScreen.js

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Button, AppState } from 'react-native';
// Diğer bileşenler buraya import edilecek (Kategori Seçici, SaveSession, vb.)
import { saveSession } from '../db/database'; // Veri kaydetme fonksiyonu

const DEFAULT_FOCUS_TIME = 25 * 60; // 25 dakika saniye cinsinden

export default function TimerScreen() {
  const [timeRemaining, setTimeRemaining] = useState(DEFAULT_FOCUS_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const [distractionCount, setDistractionCount] = useState(0);
  const [currentCategory, setCurrentCategory] = useState('Genel');

  const appState = useRef(AppState.currentState);

  // ************ DİKKAT DAĞINIKLIĞI TAKİBİ (AppState API) ************
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      // Sayaç çalışıyorken ve kullanıcı uygulamadan ayrılırsa
      if (isRunning && appState.current.match(/active|inactive/) && nextAppState === 'background') {
        console.log("UYARI: Dikkat Dağıtıcı! Uygulamadan ayrıldı.");
        setIsRunning(false); // Sayacı otomatik duraklat
        setDistractionCount(prev => prev + 1); // Dağınıklık sayısını artır
        // Bu noktada kullanıcıya dönünce sormak yerine, direkt duraklatıp bekleyebiliriz (MVP gereksinimi).
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [isRunning]); // isRunning değiştiğinde dinleyiciyi yeniden kurar

  // ************ SAYACIN ÇALIŞMA MANTIĞI ************
  useEffect(() => {
    let interval = null;

    if (isRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prevTime => prevTime - 1);
      }, 1000);
    } else if (timeRemaining === 0) {
      setIsRunning(false);
      // Seans bitince veriyi kaydetme ve özet gösterme logic'i buraya gelecek
      console.log("Seans Tamamlandı!");
      // saveSession(başlangıçZamanı, DEFAULT_FOCUS_TIME, currentCategory, distractionCount, true);
    } else {
      clearInterval(interval);
    }
    
    return () => clearInterval(interval);
  }, [isRunning, timeRemaining]);


  // Zamanı dakika:saniye formatına dönüştüren basit bir yardımcı
  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleStartPause = () => {
      // Eğer sıfırlanmışsa, başlangıç zamanını kaydet
      if (!isRunning && timeRemaining === DEFAULT_FOCUS_TIME) {
          // const sessionStartTime = Date.now(); // Başlangıç zamanını kaydet
      }
      setIsRunning(prev => !prev);
  };
  
  const handleReset = () => {
      setIsRunning(false);
      setTimeRemaining(DEFAULT_FOCUS_TIME);
      setDistractionCount(0);
      // ... Diğer state'leri sıfırla
  };


  return (
    <View style={styles.container}>
        <Text style={styles.timerText}>{formatTime(timeRemaining)}</Text>
        
        {/* Kategori Seçici Bileşeni buraya gelecek */}
        <Text>Kategori: {currentCategory}</Text>
        
        <View style={styles.buttonContainer}>
            <Button title={isRunning ? "Duraklat" : "Başlat"} onPress={handleStartPause} />
            <Button title="Sıfırla" onPress={handleReset} color="red" />
        </View>

        <Text style={styles.distractionText}>
            Dikkat Dağınıklığı Sayısı: {distractionCount}
        </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  timerText: {
    fontSize: 80,
    fontWeight: '300',
    color: '#333',
    marginBottom: 40,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 15, // React Native'de genellikle 'margin' kullanılır ama Expo'da gap desteklenir.
    marginVertical: 20,
  },
  distractionText: {
    marginTop: 30,
    fontSize: 18,
    color: 'darkred',
    fontWeight: '500'
  }
});