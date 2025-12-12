Projeyi Çalıştırmak İçin:

MOBILEODEV dizinine gidip ' npx expo start ' diyerek konsol ekranında çıkan karekodu telefonunuza
okutabilirsiniz. Telefonunuzda Expo GO uygulaması yüklü olmak zorundadır.

Ön Gereksinimler

-Node.js (LTS Sürümü)

-npm

-Expo CLI (npm install -g expo-cli)



focus/
├── App.js                  # Uygulamanın ana giriş noktası ve navigasyon kurulumu.
└── src/
    ├── services/
    │   └── DatabaseService.js  # SQLite bağlantısı, tablo oluşturma ve CRUD işlemleri.
    └── screens/
        ├── TimerScreen.js      # Odaklanma sayacı, AppState takibi ve kategori seçimi (SVG içerir).
        └── ReportsScreen.js    # Veri analizi, istatistik hesaplama ve grafik çizimi.
