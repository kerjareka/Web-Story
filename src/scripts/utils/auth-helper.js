// src/scripts/utils/auth-helper.js
import config from '../config';

const AuthHelper = {
    /**
     * Menyimpan token akses ke localStorage.
     * @param {string} token - Token akses yang diterima dari server.
     */
    setAccessToken(token) {
        localStorage.setItem(config.AUTH_KEY, token);
    },

    /**
     * Mengambil token akses dari localStorage.
     * @returns {string|null} Token akses atau null jika tidak ada.
     */
    getAccessToken() {
        return localStorage.getItem(config.AUTH_KEY);
    },

    /**
     * Menghapus token akses dari localStorage.
     */
    clearAccessToken() {
        localStorage.removeItem(config.AUTH_KEY);
    },

    /**
     * Memeriksa apakah pengguna sudah login (memiliki token akses).
     * @returns {boolean} True jika sudah login, false jika tidak.
     */
    isLoggedIn() {
        return !!this.getAccessToken(); // Mengkonversi ke boolean
    },

    /**
     * Memeriksa status autentikasi saat aplikasi dimuat pertama kali.
     * Memastikan bahwa status di App.js sudah sesuai.
     */
    checkAuthStatus() {
        // Dispatch event untuk memberitahu App.js untuk update UI navigasi
        window.dispatchEvent(new Event('auth:changed'));
    },
};

export default AuthHelper;