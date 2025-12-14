// src/services/DatabaseService.js

import { openDatabaseAsync } from 'expo-sqlite';

let db = null;

const DATABASE_NAME = 'focus_db.db';

export const initDatabase = async () => {
  try {
    db = await openDatabaseAsync(DATABASE_NAME);
    
    // DÜZELTME: Sorguyu tek satırda ve temiz tutun.
    const createTableQuery = "CREATE TABLE IF NOT EXISTS sessions (id INTEGER PRIMARY KEY AUTOINCREMENT, category TEXT NOT NULL, duration REAL NOT NULL, distractions INTEGER NOT NULL, date TEXT NOT NULL);";
    
    await db.execAsync(createTableQuery);

    console.log('Veri tabanı ve tablo başarıyla başlatıldı.');
  } catch (error) {
    console.error('Veri tabanı başlatılırken hata oluştu:', error);
  }
};
// Yeni bir seans kaydeder.
export const saveSession = async (category, duration, distractions) => {
  if (!db) {
      console.error('Veritabanı bağlantısı yok.');
      return false;
  }

  const date = new Date().toISOString().split('T')[0]; 

  try {
    await db.withTransactionAsync(async () => {
        await db.runAsync(
            'INSERT INTO sessions (category, duration, distractions, date) VALUES (?, ?, ?, ?);',
            [category, duration, distractions, date]
        );
    });

    console.log('Seans başarıyla kaydedildi ve taahhüt edildi.');
    return true;
  } catch (error) {
    console.error('Seans kaydedilirken veya transaction yapılırken hata oluştu:', error);
    return false;
  }
};

// Tüm seans verilerini çeker.
export const fetchAllSessions = async () => {
  if (!db) return [];
  try {
    const allRows = await db.getAllAsync('SELECT * FROM sessions ORDER BY id DESC;');
    return allRows;
  } catch (error) {
    console.error('Seanslar çekilirken hata oluştu:', error);
    return [];
  }
};

// Son 7 güne ait verileri çeker (Raporlama için)
export const fetchWeeklyData = async () => {
  if (!db) return [];
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const dateLimit = sevenDaysAgo.toISOString().split('T')[0];

    // Düzeltme: Sorguyu tek satırda ve daha kesin yazdık.
    const weeklyData = await db.getAllAsync(
      "SELECT date, SUM(duration) as totalDuration FROM sessions WHERE date >= ? GROUP BY date ORDER BY date ASC;",
      [dateLimit]
    );
    
    return weeklyData;
  } catch (error) {
    console.error('Haftalık veri çekilirken hata oluştu:', error);
    return [];
  }
};

// Yeni: Tüm seansları temizler.
export const clearAllSessions = async () => {
  if (!db) {
      console.error('Veritabanı bağlantısı yok.');
      return false;
  }
  try {
    await db.runAsync('DELETE FROM sessions;');
    console.log('Tüm seanslar başarıyla temizlendi.');
    return true;
  } catch (error) {
    console.error('Seanslar temizlenirken hata oluştu:', error);
    return false;
  }
};