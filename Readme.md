Projeyi Çalıştırmak İçin:

1-) MOBILEODEV dizinine gidin 
2-) "npx expo start -c"  komutunu çalıştırın
3-) Konsol ekranında çıkan karakodu telefonunza okutunuz.
== Telefonunuzda Expo Go uyguluması kurulu ve yüklü olmak zorundadır.

Ön Gereksinimler

-Node.js (LTS Sürümü)

-npm

-Expo CLI 


focus/
├── App.js                  # Uygulamanın ana giriş noktası ve navigasyon kurulumu.
└── src/
    ├── services/
    │   └── DatabaseService.js  # SQLite bağlantısı, tablo oluşturma ve CRUD işlemleri.
    └── screens/
        ├── TimerScreen.js      # Odaklanma sayacı, AppState takibi ve kategori seçimi (SVG içerir).
        └── ReportsScreen.js    # Veri analizi, istatistik hesaplama ve grafik çizimi.


Uygulamanın mantıksal akışı ve veri entegrasyon noktaları aşağıdaki şemada özetlenmiştir:

-Başlangıç: Uygulama açılışında DatabaseService.js ile SQLite bağlantısı kurulur.

-Timer: Sayaç başlatılır. AppState ile sürekli arka plan kontrolü yapılır.

-Kayıt: Seans tamamlandığında/durdurulduğunda, veri Transaction güvenliğiyle SQLite'a yazılır.

-Rapor: Raporlar ekranına geçildiğinde, SQLite'tan çekilen veriler anında analiz edilerek Chart-Kit ile görselleştirilir.