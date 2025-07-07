// src/sw.js

/* eslint-disable no-console */
/* eslint-disable no-restricted-globals */

// Nama cache untuk Application Shell. Ubah setiap kali ada update aset
const CACHE_NAME = 'dicoding-story-app-v1'; //

// Daftar URL aset yang akan di-cache sebagai Application Shell
const urlsToCache = [
  '/', // Root URL, yang akan mengarah ke index.html
  '/index.html', //
  '/styles/main.css', //
  '/styles/responsive.css', //
  '/public/images/logo.png', //
  '/public/images/favicon.png', //
  // Tambahkan semua ikon dari manifest.json
  '/public/images/icons/icon-72x72.png', //
  '/public/images/icons/icon-96x96.png', //
  '/public/images/icons/icon-128x128.png', //
  '/public/images/icons/icon-144x144.png', //
  '/public/images/icons/icon-152x152.png', //
  '/public/images/icons/icon-192x192.png', //
  '/public/images/icons/icon-384x384.png', //
  '/public/images/icons/icon-512x512.png', //
  '/manifest.json', //
  // Perlu diingat, nama bundle JavaScript akan di-generate oleh Webpack (misalnya app.bundle.js)
  // Anda harus menemukan nama bundle yang tepat setelah build, atau menambahkan secara dinamis.
  // Untuk sementara, kita asumsikan namanya app.bundle.js
  '/app.bundle.js', // // Sesuaikan nama bundle JS Anda
];

self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing App Shell...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching App Shell assets:', urlsToCache);
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting()) // Mengaktifkan service worker baru dengan cepat
      .catch((error) => console.error('Service Worker: Gagal meng-cache aset:', error))
  );
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  // Hapus cache lama jika ada
  event.waitUntil(
    caches.keys().then((cacheNames) => Promise.all(
      cacheNames.map((cacheName) => {
        if (cacheName !== CACHE_NAME) {
          console.log('Service Worker: Menghapus cache lama:', cacheName);
          return caches.delete(cacheName);
        }
        return null;
      }),
    )).then(() => self.clients.claim()), // Mengklaim klien sehingga halaman yang sudah ada akan dikontrol oleh service worker baru
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request) // Coba cari di cache dulu
      .then((response) => {
        if (response) {
          console.log('Service Worker: Aset ditemukan di cache:', event.request.url);
          return response; // Jika ada di cache, langsung kembalikan
        }
        // Jika tidak ada di cache, ambil dari jaringan
        console.log('Service Worker: Aset tidak di cache, mengambil dari jaringan:', event.request.url);
        return fetch(event.request);
      })
      .catch((error) => {
        console.error('Service Worker: Gagal mengambil aset:', error);
        // Anda bisa menambahkan fallback untuk halaman offline di sini
        // return caches.match('/offline.html');
      }),
  );
});

// Listener Push Notification (yang sudah kita bahas sebelumnya)
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push received!', event);
  const notificationData = event.data.json();
  const { title, options } = notificationData;

  const promiseChain = self.registration.showNotification(title, options);
  event.waitUntil(promiseChain);
});

self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked!', event);
  event.notification.close();

  const targetUrl = event.notification.data ? event.notification.data.url : '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      return self.clients.openWindow(targetUrl);
    }),
  );
});