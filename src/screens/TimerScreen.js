// src/screens/TimerScreen.js (GÜNCEL VERSİYON)

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, AppState, StyleSheet, Alert, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import Svg, { Circle } from 'react-native-svg'; // SVG Bileşenleri Eklendi
import { saveSession } from '../services/DatabaseService';

const { width } = Dimensions.get('window');

// Sabitler
const INITIAL_TIME = 25 * 60; // 25 dakika
const CATEGORIES = ['Kodlama', 'Ders Çalışma', 'Proje', 'Kitap Okuma', 'Diğer'];

const FOCUS_COLOR = '#388E3C'; // Yeşil
const DANGER_COLOR = '#D32F2F'; // Kırmızı
const BASE_COLOR = '#E0E0E0'; // Gri (Arka plan)

// SVG Çember Ayarları
const CIRCLE_SIZE = width * 0.7; // Ekran genişliğinin %70'i
const STROKE_WIDTH = 12;
const RADIUS = (CIRCLE_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function TimerScreen() {
  const [time, setTime] = useState(INITIAL_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [distractionCount, setDistractionCount] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);
  const [lastDistractionTime, setLastDistractionTime] = useState(null); 

  const appState = useRef(AppState.currentState);
  const timerRef = useRef(null);
  
  // Sayaç Formatlama (MM:SS)
  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // İlerleme Çubuğu Hesaplaması
  const progress = time / INITIAL_TIME; // 1.0 (tam) dan 0.0 (boş) a
  const strokeDashoffset = CIRCUMFERENCE * progress; // Çemberin ne kadarının dolu olacağını belirler
  
  // AppState (Dikkat Dağınıklığı) Takibi (Önceki mantık aynı kalır)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (isRunning) {
        if (nextAppState === 'background' && appState.current === 'active') {
          setIsRunning(false);
          setIsPaused(true);
          setDistractionCount(prev => prev + 1);
          setLastDistractionTime(Date.now()); 
        } else if (nextAppState === 'active' && appState.current === 'background') {
          if (lastDistractionTime !== null) {
               Alert.alert(
                "Dikkat Dağınıklığı Tespit Edildi!", 
                "Uygulamadan ayrıldınız. Sayaç duraklatıldı. Devam etmek ister misiniz?",
                [
                    { text: 'Hayır, Sıfırla', onPress: handleReset, style: 'cancel' },
                    { text: 'Evet, Devam Et', onPress: handleStart },
                ]
              );
              setLastDistractionTime(null);
          }
        }
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, lastDistractionTime]); 

  // Sayaç Mantığı (Önceki mantık aynı kalır)
  useEffect(() => {
    if (isRunning && time > 0) {
      timerRef.current = setInterval(() => {
        setTime(prevTime => prevTime - 1);
      }, 1000);
    } else if (time === 0) {
      handleComplete();
    } else if (!isRunning) {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning, time]);

  // Buton Handler Fonksiyonları (Önceki mantık aynı kalır)
  const handleStart = () => { if (!isRunning && time > 0) { setIsRunning(true); setIsPaused(false); } };
  const handlePause = () => { setIsRunning(false); setIsPaused(true); };
  const handleReset = () => {
    clearInterval(timerRef.current);
    setTime(INITIAL_TIME);
    setIsRunning(false);
    setIsPaused(false);
    setDistractionCount(0);
  };
  
  const handleComplete = () => {
    clearInterval(timerRef.current);
    setIsRunning(false);
    setIsPaused(false);
    const elapsedDuration = INITIAL_TIME; 
    Alert.alert(
      'Mükemmel!',
      `Seans Başarıyla Tamamlandı!\nToplam Süre: ${formatTime(elapsedDuration)}\nKategori: ${selectedCategory}\nDağınıklık Sayısı: ${distractionCount}`,
      [
        { text: 'Sıfırla', onPress: handleReset },
        { 
          text: 'Kaydet', 
          onPress: async () => { await saveSession(selectedCategory, elapsedDuration / 60, distractionCount); handleReset(); } 
        },
      ]
    );
  };
  
  const handleStop = () => {
     clearInterval(timerRef.current);
     setIsRunning(false);
     const elapsedDuration = INITIAL_TIME - time; 
     
     if (elapsedDuration < 1) { handleReset(); return; }
     
     Alert.alert(
      'Seans Özeti',
      `Süre: ${formatTime(elapsedDuration)}\nKategori: ${selectedCategory}\nDağınıklık Sayısı: ${distractionCount}`,
      [
        { text: 'İptal Et/Sıfırla', onPress: handleReset },
        { 
          text: 'Seansı Kaydet', 
          onPress: async () => { await saveSession(selectedCategory, elapsedDuration / 60, distractionCount); handleReset(); } 
        },
        { text: 'Devam Et', onPress: handleStart },
      ]
    );
  }
  
  // Kategori Listesi Render Fonksiyonu (Önceki mantık aynı kalır)
  const renderCategoryItem = ({ item }) => {
    const isSelected = item === selectedCategory;
    return (
        <TouchableOpacity
            style={[
                styles.categoryItem, 
                isSelected ? styles.categoryItemSelected : styles.categoryItemDefault
            ]}
            onPress={() => setSelectedCategory(item)}
            disabled={isRunning || time !== INITIAL_TIME}
        >
            <Text style={isSelected ? styles.categoryTextSelected : styles.categoryTextDefault}>{item}</Text>
        </TouchableOpacity>
    );
  };
  // 
  
  return (
    <View style={styles.container}>
      
      <Text style={styles.sectionHeader}>Hedef</Text>
      
      {/* Kategori Seçimi */}
      <FlatList
          data={CATEGORIES}
          renderItem={renderCategoryItem}
          keyExtractor={item => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryList}
      />

      {/* SVG Sayaç Animasyonu */}
      <View style={styles.timerCircleContainer}>
        <Svg height={CIRCLE_SIZE} width={CIRCLE_SIZE}>
            {/* Arka plan çemberi (Gri) */}
            <Circle
                cx={CIRCLE_SIZE / 2}
                cy={CIRCLE_SIZE / 2}
                r={RADIUS}
                stroke={BASE_COLOR}
                strokeWidth={STROKE_WIDTH}
                fill="transparent"
            />
            {/* İlerleme çemberi (Yeşil - Dolu kısmı gösterir) */}
            <Circle
                cx={CIRCLE_SIZE / 2}
                cy={CIRCLE_SIZE / 2}
                r={RADIUS}
                stroke={isRunning ? FOCUS_COLOR : isPaused ? '#FFC107' : BASE_COLOR}
                strokeWidth={STROKE_WIDTH}
                fill="transparent"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round" // Çember ucunu yumuşatır
                transform={`rotate(-90, ${CIRCLE_SIZE / 2}, ${CIRCLE_SIZE / 2})`} // Yukarıdan başlatır
            />
        </Svg>
        {/* Sayaç Metinleri */}
        <View style={styles.timerTextOverlay}>
            <Text style={styles.timerText}>{formatTime(time)}</Text>
            <Text style={styles.timerSubText}>{isRunning ? 'ODAKLANIYOR' : isPaused ? 'DURAKLATILDI' : 'HAZIR'}</Text>
        </View>
      </View>
      
      {/* Butonlar */}
      <View style={styles.buttonContainer}>
        {isRunning ? (
          <TouchableOpacity style={[styles.controlButton, styles.pauseButton]} onPress={handlePause}>
            <Text style={styles.buttonText}>DURAKLAT</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[styles.controlButton, time === 0 ? styles.disabledButton : styles.startButton]} 
            onPress={handleStart} 
            disabled={time === 0}
          >
            <Text style={styles.buttonText}>BAŞLAT</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={[styles.controlButton, styles.stopButton]} 
          onPress={handleStop} 
          disabled={time === INITIAL_TIME}
        >
          <Text style={styles.buttonText}>DURDUR</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.controlButton, styles.resetButton]} onPress={handleReset}>
          <Text style={styles.buttonText}>SIFIRLA</Text>
        </TouchableOpacity>
      </View>

      {/* İstatistik Özeti */}
      <View style={styles.statsContainer}>
         <Text style={styles.statText}>Geçen Süre: {formatTime(INITIAL_TIME - time)}</Text>
         <Text style={[styles.statText, {color: distractionCount > 0 ? DANGER_COLOR : FOCUS_COLOR}]}>
             Dağınıklık Sayısı: {distractionCount}
         </Text>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F7F9FC', 
    paddingTop: 50,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  
  // Kategori Listesi Stilleri (Aynı)
  categoryList: { flexGrow: 0, marginBottom: 30, maxHeight: 50, },
  categoryItem: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, marginHorizontal: 5, borderWidth: 1, },
  categoryItemDefault: { borderColor: '#DDD', backgroundColor: '#FFF', },
  categoryItemSelected: { borderColor: FOCUS_COLOR, backgroundColor: FOCUS_COLOR, },
  categoryTextDefault: { color: '#333', fontWeight: '500', },
  categoryTextSelected: { color: '#FFF', fontWeight: 'bold', },
  
  // Sayaç Çemberi Stilleri (Yeni)
  timerCircleContainer: {
      width: CIRCLE_SIZE,
      height: CIRCLE_SIZE,
      marginBottom: 50,
      justifyContent: 'center',
      alignItems: 'center',
  },
  timerTextOverlay: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'transparent',
  },
  timerText: {
    fontSize: 68,
    fontWeight: '200',
    color: '#333',
  },
  timerSubText: {
    fontSize: 16,
    color: FOCUS_COLOR,
    fontWeight: '700',
    marginTop: -10,
  },
  
  // Buton Stilleri (Aynı)
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-around', width: '90%', paddingHorizontal: 10, marginBottom: 30, },
  controlButton: { paddingVertical: 12, paddingHorizontal: 15, borderRadius: 8, flex: 1, marginHorizontal: 5, alignItems: 'center', },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 14, },
  startButton: { backgroundColor: FOCUS_COLOR, },
  pauseButton: { backgroundColor: '#FFC107', },
  stopButton: { backgroundColor: DANGER_COLOR, },
  resetButton: { backgroundColor: '#9E9E9E', },
  disabledButton: { backgroundColor: '#BDBDBD', },
  
  // İstatistik Stilleri (Aynı)
  statsContainer: { padding: 15, borderRadius: 8, backgroundColor: '#E8F5E9', width: '85%', alignItems: 'center', marginTop: 20, },
  statText: { fontSize: 16, color: '#333', paddingVertical: 2, }
});