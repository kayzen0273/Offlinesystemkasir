# 🚀 Rafa Medica - Offline Ready Version

## 📋 Fitur Utama Offline

### 1. **Service Worker Caching**
- Semua assets (HTML, CSS, JS, fonts, icons) di-cache otomatis
- Akses aplikasi tetap cepat meskipun koneksi lambat
- First load membutuhkan internet, selanjutnya bisa offline

### 2. **Firebase Offline Persistence**
- Data Firebase otomatis tersimpan di device
- Firestore menggunakan IndexedDB internal
- Read/write tetap berfungsi saat offline
- Auto-sync saat koneksi kembali

### 3. **IndexedDB Backup**
- Backup lokal untuk semua data penting
- Fallback jika Firebase gagal load
- Menyimpan pending operations saat offline

### 4. **Auto Synchronization**
- Deteksi status online/offline otomatis
- Queue operasi yang dilakukan saat offline
- Sync otomatis setiap 30 detik saat online
- Retry mechanism untuk operasi gagal

### 5. **Visual Indicators**
- Banner offline saat tidak ada koneksi
- Status indicator (online/offline) di pojok kanan bawah
- Loading indicator saat syncing
- Timestamp sync terakhir

---

## 🔧 Cara Deploy

### Opsi 1: Firebase Hosting (Recommended)

```bash
# 1. Install Firebase CLI
npm install -g firebase-tools

# 2. Login ke Firebase
firebase login

# 3. Initialize Firebase Hosting
firebase init hosting

# 4. Pilih project: stok-barang-49c8e

# 5. Setup:
# - Public directory: ./
# - Configure as single-page app: No
# - Setup automatic builds: No

# 6. Copy files
# Pastikan Rafamwdica_V19_offline_ready.html dan sw.js ada di folder yang sama

# 7. Deploy
firebase deploy --only hosting
```

**Penting:** Pastikan file `sw.js` ada di root directory yang sama dengan HTML!

### Opsi 2: Netlify

```bash
# 1. Install Netlify CLI
npm install -g netlify-cli

# 2. Deploy
netlify deploy

# 3. Pilih folder yang berisi HTML dan sw.js
# 4. Publish directory: ./
```

### Opsi 3: GitHub Pages

```bash
# 1. Create repository baru di GitHub
# 2. Upload files:
#    - Rafamwdica_V19_offline_ready.html (rename ke index.html)
#    - sw.js
# 3. Enable GitHub Pages di Settings > Pages
# 4. Pilih branch main, root directory
```

### Opsi 4: Vercel

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Deploy
vercel

# 3. Follow prompts
```

---

## 📱 Install sebagai PWA (Progressive Web App)

### Chrome (Desktop)
1. Buka aplikasi di browser Chrome
2. Lihat icon install (⊕) di address bar
3. Klik "Install Rafa Medica"
4. Aplikasi akan muncul sebagai aplikasi standalone

### Chrome (Android)
1. Buka di Chrome mobile
2. Tap menu (⋮) > "Add to Home screen"
3. Konfirmasi nama app
4. Icon akan muncul di home screen

### Safari (iOS)
1. Buka di Safari
2. Tap Share button (□↑)
3. Scroll dan pilih "Add to Home Screen"
4. Konfirmasi nama
5. Icon muncul di home screen

---

## 🔍 Testing Offline Mode

### Test 1: Airplane Mode
```
1. Load aplikasi saat online
2. Aktifkan Airplane Mode
3. Refresh halaman → App tetap load
4. Test input data → Tersimpan lokal
5. Matikan Airplane Mode → Data auto-sync
```

### Test 2: Chrome DevTools
```
1. Buka Chrome DevTools (F12)
2. Tab Application > Service Workers
3. Centang "Offline" checkbox
4. Refresh halaman
5. Test aplikasi dalam mode offline
```

### Test 3: Network Throttling
```
1. Chrome DevTools > Network tab
2. Pilih "Slow 3G" atau "Offline"
3. Test loading speed dan functionality
```

---

## ⚙️ Konfigurasi Lanjutan

### 1. Cache Duration
Edit `sw.js` untuk mengubah durasi cache:

```javascript
const CACHE_NAME = 'rafa-medica-v19'; // Ubah version untuk force refresh
```

### 2. Sync Interval
Edit bagian useSyncManager di HTML:

```javascript
// Default: 30 detik
const interval = setInterval(syncPendingOperations, 30000);

// Ubah ke 60 detik:
const interval = setInterval(syncPendingOperations, 60000);
```

### 3. Clear Cache Manual
Tambahkan button clear cache:

```javascript
// Di component App
const clearCache = async () => {
    if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (let registration of registrations) {
            registration.unregister();
        }
    }
    window.location.reload();
};
```

---

## 🐛 Troubleshooting

### Problem: Service Worker tidak register
**Solusi:**
1. Pastikan menggunakan HTTPS atau localhost
2. Check console untuk error messages
3. Pastikan `sw.js` ada di root directory
4. Coba hard refresh (Ctrl+Shift+R)

### Problem: Data tidak sync setelah online
**Solusi:**
1. Check console untuk error sync
2. Pastikan Firebase config benar
3. Check IndexedDB di DevTools > Application
4. Manual trigger sync dengan reload

### Problem: Cache tidak update
**Solusi:**
1. Ubah `CACHE_NAME` version di `sw.js`
2. Unregister service worker di DevTools
3. Hard refresh browser
4. Clear site data di browser settings

### Problem: Offline indicator tidak muncul
**Solusi:**
1. Check `useNetworkStatus` hook
2. Test dengan Airplane mode
3. Check browser compatibility (IE tidak support)
4. Lihat console untuk JavaScript errors

---

## 📊 Monitoring

### Check Service Worker Status
```javascript
// Di browser console
navigator.serviceWorker.ready.then((registration) => {
    console.log('Service Worker ready:', registration);
});
```

### Check Cache Size
```javascript
// Di browser console
caches.keys().then(async (keys) => {
    for (const key of keys) {
        const cache = await caches.open(key);
        const items = await cache.keys();
        console.log(`${key}: ${items.length} items`);
    }
});
```

### Check IndexedDB
```
1. DevTools > Application > IndexedDB
2. Expand "RafaMedicaOfflineDB"
3. View data di stores:
   - inventory
   - transactions
   - settings
   - pendingOps
```

---

## 🔐 Security Notes

1. **HTTPS Required:** PWA dan Service Worker butuh HTTPS (kecuali localhost)
2. **Firebase Rules:** Pastikan Firestore rules terconfig dengan benar
3. **Data Sensitivity:** Offline data tersimpan di device user
4. **Cache Policy:** Tentukan data mana yang boleh di-cache

---

## 📈 Performance Tips

1. **Preload Critical Assets:**
   - Tambahkan `<link rel="preload">` untuk assets penting
   
2. **Lazy Load Images:**
   - Gunakan lazy loading untuk images besar
   
3. **Minimize Bundle:**
   - Pertimbangkan build tools (Webpack, Vite) untuk production
   
4. **CDN Fallback:**
   - Tambahkan fallback untuk CDN yang gagal load

---

## 🆕 Update dari V18 ke V19

### Perubahan Major:
✅ Firebase Offline Persistence enabled
✅ IndexedDB integration untuk backup
✅ Service Worker untuk asset caching
✅ Auto-sync mechanism
✅ Network status detection
✅ Pending operations queue
✅ Visual offline indicators

### Migration Notes:
- Tidak ada breaking changes
- Data existing tetap kompatibel
- Install ulang tidak diperlukan
- Auto-upgrade dari v18

---

## 📞 Support

Jika ada masalah:
1. Check browser console untuk errors
2. Verify Firebase configuration
3. Test dengan browser berbeda
4. Check Service Worker registration
5. Verify network connectivity

---

## 📄 License

Aplikasi ini untuk internal use Rafa Medica.

---

**Versi:** 19.0 (Offline Ready)  
**Last Updated:** 2026-02-15  
**Compatibility:** Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
