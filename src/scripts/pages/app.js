// src/scripts/pages/app.js
import UrlParser from '../routes/url-parser';
import routes from '../routes/routes';
import { ViewTransition } from '../utils/view-transition';
import AuthHelper from '../utils/auth-helper'; // Import AuthHelper

class App {
    constructor({ mainContent, navElement }) {
        this._mainContent = mainContent;
        this._navElement = navElement; // Referensi ke elemen navigasi
        this._currentPage = null;
        this._setupSkipLink();
        this._setupEventListeners(); // Setup event listener untuk navigasi
    }

    _setupSkipLink() {
        const skipLink = document.querySelector('.skip-link');
        if (skipLink) {
            skipLink.addEventListener('click', (event) => {
                event.preventDefault();
                this._mainContent.focus();
            });
        }
    }

    _setupEventListeners() {
        // Update navigasi saat status autentikasi berubah
        window.addEventListener('auth:changed', () => {
            this._updateNav();
        });

        // Initial nav update on app start
        this._updateNav();
    }

    /**
     * Mengupdate elemen navigasi (header) berdasarkan status autentikasi pengguna.
     */
    _updateNav() {
        const isLoggedIn = AuthHelper.isLoggedIn();
        this._navElement.innerHTML = ''; // Bersihkan navigasi yang ada

        if (isLoggedIn) {
            // Tampilan untuk pengguna yang sudah login
            this._navElement.innerHTML = `
                <li><a href="#/stories">Stories</a></li>
                <li><a href="#/add">Add Story</a></li>
                <li><button id="logoutButton" class="button-danger">Logout</button></li>
            `;
            const logoutButton = this._navElement.querySelector('#logoutButton');
            if (logoutButton) {
                logoutButton.addEventListener('click', () => {
                    AuthHelper.clearAccessToken(); // Hapus token
                    alert('You have been logged out.');
                    window.location.hash = '/login'; // Redirect ke halaman login
                    window.dispatchEvent(new Event('auth:changed')); // Trigger update nav
                });
            }
        } else {
            // Tampilan untuk pengguna yang belum login
            this._navElement.innerHTML = `
                <li><a href="#/stories">Stories</a></li>
                <li><a href="#/login">Login</a></li>
                <li><a href="#/register">Register</a></li>
            `;
        }
    }


    async renderPage() {
        const url = UrlParser.parseActiveUrlWithCombiner();
        let PageClass = routes[url];

        // Proteksi rute yang memerlukan login
        const protectedRoutes = ['/add']; // Tambahkan rute lain yang memerlukan login di sini
        if (protectedRoutes.includes(url) && !AuthHelper.isLoggedIn()) {
            alert('You must be logged in to access this page.');
            window.location.hash = '/login'; // Redirect ke halaman login
            return; // Hentikan proses rendering
        }

        // Jika URL adalah '/login' atau '/register' dan user sudah login, redirect ke home
        if (['/login', '/register'].includes(url) && AuthHelper.isLoggedIn()) {
            alert('You are already logged in.');
            window.location.hash = '/'; // Redirect ke home
            return;
        }

        // Fallback jika PageClass tidak ditemukan (misal: rute "/").
        // Untuk memastikan '/home' selalu merujuk ke HomePage.
        if (!PageClass && url === '/') {
            PageClass = routes['/'];
        }

        if (PageClass) {
            if (this._currentPage && typeof this._currentPage.onLeave === 'function') {
                this._currentPage.onLeave();
            }

            const renderFunction = async () => {
                this._mainContent.innerHTML = '';
                this._currentPage = new PageClass();
                await this._currentPage.render(this._mainContent);
            };

            if (document.startViewTransition) {
                await ViewTransition.start(renderFunction);
            } else {
                await renderFunction();
            }
        } else {
            console.warn('Page not found:', url);
            window.location.hash = '/';
        }
    }
}

export default App;