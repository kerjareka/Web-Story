// src/scripts/data/api.js
import config from '../config';
import AuthHelper from '../utils/auth-helper'; // Import AuthHelper

class StoryAPI {
    static async _fetchWithAuth(url, options = {}) {
        const token = AuthHelper.getAccessToken(); // Dapatkan token dari AuthHelper

        const headers = {
            ...options.headers,
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(url, {
            ...options,
            headers: headers,
        });

        const responseJson = await response.json();
        if (responseJson.error) {
            // Periksa jika error adalah 401/403, mungkin token tidak valid atau expired
            if (response.status === 401 || response.status === 403) {
                AuthHelper.clearAccessToken(); // Hapus token yang tidak valid
                alert('Session expired or unauthorized. Please log in again.');
                window.location.hash = '/login'; // Redirect ke halaman login
            }
            throw new Error(responseJson.message);
        }
        return responseJson;
    }

    static async getAllStories() {
        try {
            // Endpoint ini biasanya publik, tapi kita akan tetap menggunakan _fetchWithAuth
            // untuk konsistensi atau jika API berubah.
            const responseJson = await StoryAPI._fetchWithAuth(`${config.BASE_URL}/stories`);
            return responseJson.listStory;
        } catch (error) {
            console.error('Error fetching stories:', error);
            // Jika error 401 saat mengambil stories, jangan langsung redirect ke login
            // karena stories bisa saja ditampilkan untuk public (sebelum login).
            // Hanya alert errornya saja.
            alert('Failed to load stories: ' + error.message);
            return [];
        }
    }

    static async addStory({ description, photo, lat, lon }) {
        try {
            const formData = new FormData();
            formData.append('description', description);
            formData.append('photo', photo);
            if (lat !== undefined && lon !== undefined) {
                formData.append('lat', lat);
                formData.append('lon', lon);
            }

            const responseJson = await StoryAPI._fetchWithAuth(`${config.BASE_URL}/stories`, {
                method: 'POST',
                body: formData,
            });
            return responseJson;
        } catch (error) {
            console.error('Error adding story:', error);
            // Error sudah di-handle di _fetchWithAuth jika 401
            alert('Failed to add story: ' + error.message);
            throw error;
        }
    }
}

export default StoryAPI;