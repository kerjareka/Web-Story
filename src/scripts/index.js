import '../styles/main.css';
import '../styles/responsive.css';
import App from './pages/app';
import 'leaflet';
import AuthHelper from './utils/auth-helper'; // Import AuthHelper
import PushNotification from './utils/push-notification'; // Jalur yang benar // Import PushNotification
import { openDatabase } from './data/story-db';

// Initialize AuthHelper to check authentication status on load
AuthHelper.checkAuthStatus(); // Call this early to ensure auth status is reflected

openDatabase().then(() => {
  console.log('IndexedDB berhasil diinisialisasi dan siap digunakan.');
}).catch((error) => {
  console.error('Gagal menginisialisasi IndexedDB:', error);
});

const app = new App({
    mainContent: document.querySelector('#mainContent'),
    navElement: document.querySelector('#main-nav'), // Pass nav element to App
});

// Handle initial page load
window.addEventListener('load', async () => {
  await app.renderPage();
  // Daftarkan service worker dan minta notifikasi setelah halaman dimuat
  await PushNotification.init(); // Inisialisasi push notification
});

// Handle hash changes for routing
window.addEventListener('hashchange', async () => {
    await app.renderPage();
});