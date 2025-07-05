import '../styles/main.css';
import '../styles/responsive.css';
import App from './pages/app';
import 'leaflet';
import AuthHelper from './utils/auth-helper'; // Import AuthHelper

// Initialize AuthHelper to check authentication status on load
AuthHelper.checkAuthStatus(); // Call this early to ensure auth status is reflected

const app = new App({
    mainContent: document.querySelector('#mainContent'),
    navElement: document.querySelector('#main-nav'), // Pass nav element to App
});

// Handle initial page load
window.addEventListener('load', async () => {
    await app.renderPage();
});

// Handle hash changes for routing
window.addEventListener('hashchange', async () => {
    await app.renderPage();
});