// src/scripts/pages/auth/login-page.js
import AuthAPI from '../../auth/auth-api';
import AuthHelper from '../../utils/auth-helper';

class LoginPage {
    async render(container) {
        container.innerHTML = `
            <section class="auth-form-container" aria-labelledby="login-heading">
                <h2 id="login-heading">Login to Story App</h2>
                <form id="loginForm">
                    <div class="form-group">
                        <label for="email">Email:</label>
                        <input type="email" id="email" name="email" required aria-required="true" placeholder="Enter your email">
                    </div>
                    <div class="form-group">
                        <label for="password">Password:</label>
                        <input type="password" id="password" name="password" required aria-required="true" placeholder="Enter your password">
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="button-primary">Login</button>
                    </div>
                    <p class="text-center mt-3">Don't have an account? <a href="#/register">Register here</a></p>
                </form>
            </section>
        `;
        this._setupFormListeners();
    }

    _setupFormListeners() {
        const form = document.getElementById('loginForm');
        form.addEventListener('submit', async (event) => {
            event.preventDefault();

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                const data = await AuthAPI.login({ email, password });
                AuthHelper.setAccessToken(data.token); // Simpan token di localStorage
                alert('Login successful!');
                window.location.hash = '/stories'; // Redirect ke halaman stories
                window.dispatchEvent(new Event('auth:changed')); // Memberi tahu App.js untuk update nav
            } catch (error) {
                console.error('Login failed:', error);
                // Error sudah di-handle di AuthAPI.js
            }
        });
    }

    onLeave() {
        // Bersihkan listener atau resource jika ada
    }
}

export default LoginPage;