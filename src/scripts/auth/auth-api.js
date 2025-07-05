// src/scripts/auth/auth-api.js

import config from '../config';

class AuthAPI {
    static async register({ name, email, password }) {
        try {
            const response = await fetch(`${config.BASE_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password }),
            });

            const responseJson = await response.json();
            if (responseJson.error) {
                throw new Error(responseJson.message);
            }
            return responseJson;
        } catch (error) {
            console.error('Error during registration:', error);
            alert('Registration failed: ' + error.message);
            throw error;
        }
    }

    static async login({ email, password }) {
        try {
            const response = await fetch(`${config.BASE_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const responseJson = await response.json();
            if (responseJson.error) {
                throw new Error(responseJson.message);
            }
            // PERBAIKAN DI SINI: ganti responseJson.data menjadi responseJson.loginResult
            return responseJson.loginResult; // <--- INI PERBAIKANNYA
        } catch (error) {
            console.error('Error during login:', error);
            alert('Login failed: ' + error.message);
            throw error;
        }
    }
}

export default AuthAPI;