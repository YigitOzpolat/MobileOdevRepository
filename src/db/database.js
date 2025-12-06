// src/db/Database.js

import * as SQLite from 'expo-sqlite';

// Veritabanı dosyasını açma veya oluşturma
const db = SQLite.openDatabase('focus_tracker.db');

/**
 * Veritabanı tablolarını başlatır (oluşturur).
 */
export const initDatabase = () => {
  db.transaction(tx => {
    // sessions tablosu: süreleri, kategorileri ve dikkat dağınıklıklarını tutacak
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY NOT NULL,
        start_time REAL NOT NULL,
        duration INTEGER NOT NULL,
        category TEXT NOT NULL,
        distractions INTEGER NOT NULL,
        is_completed INTEGER NOT NULL
      );`,
      [],
      () => console.log("Veritabanı tablosu başarıyla oluşturuldu."),
      (txObj, error) => console.log("Tablo oluşturma hatası: ", error)
    );
  });
};

/**
 * Yeni bir seansı veritabanına kaydeder.
 */
export const saveSession = (startTime, duration, category, distractions, isCompleted) => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'INSERT INTO sessions (start_time, duration, category, distractions, is_completed) values (?, ?, ?, ?, ?)',
          [startTime, duration, category, distractions, isCompleted ? 1 : 0],
          (txObj, resultSet) => resolve(resultSet),
          (txObj, error) => reject(error)
        );
      });
    });
};

// ... Diğer sorgulama (raporlama) fonksiyonları buraya eklenecektir.