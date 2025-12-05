import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  Button, 
  StyleSheet, 
  SafeAreaView, 
  Alert,
  FlatList 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Veri depolama anahtarımız
const STORAGE_KEY = '@user_names';

// AsyncStorage'den listeyi okuyan fonksiyon
const getNamesList = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
    // Eğer veri varsa JSON'dan diziye çevir, yoksa boş dizi döndür
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error('Veri okuma hatası:', e);
    return [];
  }
};

// AsyncStorage'e listeyi (dizi) kaydeden fonksiyon
const storeNamesList = async (list) => {
  try {
    const jsonValue = JSON.stringify(list);
    await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
    console.log('Liste başarıyla kaydedildi.');
  } catch (e) {
    console.error('Liste kaydetme hatası:', e);
    Alert.alert('Hata', 'Liste kaydedilemedi.');
  }
};

// ----------------------------------------------------
// ⚛️ Ana Bileşen
// ----------------------------------------------------
const ListStorageExample = () => {
  const [currentName, setCurrentName] = useState('');
  const [nameList, setNameList] = useState([]);

  // Bileşen yüklendiğinde listeyi yükle
  useEffect(() => {
    loadNames();
  }, []);

  // Kayıtlı isimleri AsyncStorage'den çekip state'i güncelleyen fonksiyon
  const loadNames = async () => {
    const list = await getNamesList();
    setNameList(list);
  };

  // Yeni ismi listeye ekleyip kaydeden fonksiyon
  const handleSaveName = async () => {
    const name = currentName.trim();

    if (name === '') {
      Alert.alert('Uyarı', 'Lütfen bir isim girin.');
      return;
    }

    // 1. Mevcut listeyi çek
    const existingList = await getNamesList();
    
    // 2. Yeni ismi listenin başına ekle (veya sonuna ekleyebilirsiniz)
    const newList = [name, ...existingList];
    
    // 3. Güncellenmiş listeyi kaydet
    await storeNamesList(newList);
    
    // 4. State'i ve Input'u güncelle
    setNameList(newList);
    setCurrentName(''); 
  };
  
  // Tüm listeyi silen fonksiyon
  const clearAllNames = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setNameList([]);
      Alert.alert('Başarılı', 'Tüm isimler silindi.');
    } catch (e) {
      console.error('Silme hatası:', e);
      Alert.alert('Hata', 'İsimler silinemedi.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.header}>İsim Listesi Yönetimi (AsyncStorage)</Text>
        
        <TextInput
          style={styles.input}
          onChangeText={setCurrentName}
          value={currentName}
          placeholder="Yeni isim girin..."
        />
        
        <Button
          title="Listeye Ekle"
          onPress={handleSaveName}
          disabled={!currentName.trim()}
        />

        <Text style={styles.listHeader}>Kayıtlı İsimler ({nameList.length})</Text>
        
        {/* İsimleri listeleyen FlatList bileşeni */}
        <FlatList
          data={nameList}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <View style={styles.listItem}>
              <Text style={styles.listItemText}>{index + 1}. {item}</Text>
            </View>
          )}
          style={styles.flatList}
          ListEmptyComponent={() => (
            <Text style={styles.emptyText}>Henüz kayıtlı isim yok.</Text>
          )}
        />
        
        {nameList.length > 0 && (
            <Button
                title="Tüm Listeyi Sil"
                color="red"
                onPress={clearAllNames}
            />
        )}
      </View>
    </SafeAreaView>
  );
};

// Stil Tanımlamaları
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 50,
    alignItems: 'center',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    width: '90%',
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  listHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 30,
    marginBottom: 10,
  },
  flatList: {
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  listItem: {
    padding: 10,
    marginVertical: 4,
    backgroundColor: '#fff',
    borderColor: '#eee',
    borderWidth: 1,
    borderRadius: 5,
    width: '100%',
  },
  listItemText: {
    fontSize: 16,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#888',
  }
});

export default ListStorageExample;