// src/scripts/utils/push-notification.js

/* eslint-disable no-console */

// Kunci VAPID publik dari Dicoding Story API
// Pastikan ini adalah kunci yang benar dari dokumentasi API Anda.
const PUBLIC_VAPID_KEY = 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk';

// Pastikan untuk mengimpor AuthHelper dan config
import AuthHelper from './auth-helper';
import config from '../config'; // Asumsikan config ada di ../config.js

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

const PushNotification = {
  async init() {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Worker tidak didukung di browser ini.');
      return;
    }
    if (!('PushManager' in window)) {
      console.warn('Push API tidak didukung di browser ini.');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.register('./sw.js'); // Pastikan path ke sw.js benar
      console.log('Service Worker berhasil didaftarkan:', registration);

      // Cek apakah pengguna sudah login sebelum meminta izin notifikasi
      if (AuthHelper.isLoggedIn()) {
        await this._requestNotificationPermission(registration);
      } else {
        console.log('Pengguna belum login. Notifikasi push tidak akan diminta.');
        // Mungkin tambahkan logika untuk meminta notifikasi setelah login
        // atau tambahkan tombol "Aktifkan Notifikasi" di UI setelah login.
      }
    } catch (error) {
      console.error('Gagal mendaftarkan Service Worker:', error);
    }
  },

  async _requestNotificationPermission(registration) {
    // Pastikan ini hanya dipanggil jika pengguna ingin mengaktifkan notifikasi
    // dan jika mereka sudah login.
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('Izin notifikasi diberikan.');
      await this._subscribePush(registration);
    } else {
      console.warn('Izin notifikasi ditolak.');
    }
  },

  async _subscribePush(registration) {
    try {
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        console.log('Sudah berlangganan push notification:', existingSubscription);
        // Penting: Kirim subscription yang ada ke server juga,
        // karena mungkin server belum menyimpannya atau perlu memperbarui data.
        await this._sendSubscriptionToServer(existingSubscription);
        return existingSubscription;
      }

      const applicationServerKey = urlBase64ToUint8Array(PUBLIC_VAPID_KEY);
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey,
      });

      console.log('Berhasil berlangganan push notification:', subscription);
      // Kirim objek subscription ini ke backend Anda
      await this._sendSubscriptionToServer(subscription);
      return subscription;
    } catch (error) {
      console.error('Gagal berlangganan push notification:', error);
      alert('Gagal berlangganan notifikasi push: ' + error.message);
    }
  },

  async _sendSubscriptionToServer(subscription) {
    try {
      // Endpoint yang benar sesuai dengan Dicoding Story API
      const subscribeUrl = `${config.BASE_URL}/notifications/subscribe`;

      const response = await fetch(subscribeUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AuthHelper.getAccessToken()}`, // Token autentikasi
        },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          keys: {
            p256dh: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('p256dh')))),
            auth: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('auth')))),
          },
        }),
      });

      const responseJson = await response.json();

      if (!response.ok || responseJson.error) {
        throw new Error(responseJson.message || 'Gagal mengirim subscription ke server.');
      }

      console.log('Subscription berhasil dikirim ke server:', responseJson.message);
      return responseJson;
    } catch (error) {
      console.error('Error saat mengirim subscription ke server:', error);
      alert('Gagal mengirim subscription notifikasi: ' + error.message);
      throw error; // Re-throw untuk penanganan lebih lanjut jika diperlukan
    }
  },

  async unsubscribePush() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push API tidak didukung.');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        // Kirim permintaan DELETE ke server untuk menghapus subscription
        const unsubscribeUrl = `${config.BASE_URL}/notifications/subscribe`;

        const response = await fetch(unsubscribeUrl, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${AuthHelper.getAccessToken()}`,
          },
          body: JSON.stringify({
            endpoint: subscription.endpoint, // Hanya endpoint yang diperlukan untuk DELETE
          }),
        });

        const responseJson = await response.json();

        if (!response.ok || responseJson.error) {
          throw new Error(responseJson.message || 'Gagal menghapus subscription di server.');
        }

        const unsubscribed = await subscription.unsubscribe();
        if (unsubscribed) {
          console.log('Berhasil unsubscribe push notification dari browser dan server.');
          alert('Notifikasi push telah dinonaktifkan.');
          return true;
        } else {
          console.warn('Gagal unsubscribe dari browser.');
          return false;
        }
      } else {
        console.log('Tidak ada subscription push aktif.');
        return false;
      }
    } catch (error) {
      console.error('Error saat unsubscribe push notification:', error);
      alert('Gagal menonaktifkan notifikasi push: ' + error.message);
      throw error;
    }
  },
};

export default PushNotification;