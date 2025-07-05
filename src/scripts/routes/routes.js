// src/scripts/routes/routes.js
import HomePage from '../pages/home/home-page';
import AddStoryPage from '../pages/story/add-story-page'; // Path yang sudah diperbaiki
import LoginPage from '../pages/auth/login-page';       // NEW
import RegisterPage from '../pages/auth/register-page';   // NEW

const routes = {
    '/': HomePage,
    '/stories': HomePage,
    '/add': AddStoryPage,
    '/login': LoginPage,     // NEW
    '/register': RegisterPage, // NEW
    // Tambahkan rute lain jika ada halaman detail, dll.
};

export default routes;