// src/scripts/pages/auth/register-page.js
import AuthAPI from '../../auth/auth-api';

class RegisterPage {
    async render(container) {
        container.innerHTML = `
            <section class="auth-form-container" aria-labelledby="register-heading">
                <h2 id="register-heading">Register for Story App</h2>
                <form id="registerForm">
                    <div class="form-group">
                        <label for="name">Name:</label>
                        <input type="text" id="name" name="name" required aria-required="true" placeholder="Enter your name">
                    </div>
                    <div class="form-group">
                        <label for="email">Email:</label>
                        <input type="email" id="email" name="email" required aria-required="true" placeholder="Enter your email">
                    </div>
                    <div class="form-group">
                        <label for="password">Password:</label>
                        <input type="password" id="password" name="password" required aria-required="true" placeholder="Enter your password">
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="button-primary">Register</button>
                    </div>
                    <p class="text-center mt-3">Already have an account? <a href="#/login">Login here</a></p>
                </form>
            </section>
        `;
        this._setupFormListeners();
    }

    _setupFormListeners() {
        const form = document.getElementById('registerForm');
        form.addEventListener('submit', async (event) => {
            event.preventDefault();

            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                await AuthAPI.register({ name, email, password });
                alert('Registration successful! Please log in.');
                window.location.hash = '/login'; // Redirect ke halaman login setelah register
            } catch (error) {
                console.error('Registration failed:', error);
                // Error sudah di-handle di AuthAPI.js
            }
        });
    }

    onLeave() {
        // Bersihkan listener atau resource jika ada
    }
}

export default RegisterPage;