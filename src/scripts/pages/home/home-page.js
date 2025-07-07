// src/scripts/pages/home/home-page.js

import StoryAPI from '../../data/api'; // Untuk mengambil data dari API
// Import semua fungsi IndexedDB yang diperlukan
import { getAllStories, addStory, updateStory, deleteStory } from '../../data/story-db';
import { createStoryItemTemplate, renderMapForStory } from './templates/story-item';

class HomePage {
    constructor() {
        this._stories = []; // Untuk menyimpan daftar cerita yang sedang ditampilkan
        this._storiesContainer = null; // Akan diinisialisasi di render
    }

    async render(container) {
        // Tentukan struktur dasar HTML untuk halaman ini
        container.innerHTML = `
            <section id="stories-list" class="stories-list" aria-labelledby="stories-list-heading">
                <h2 id="stories-list-heading" class="sr-only">List of Stories</h2>
                <div id="stories-container" class="stories-grid">Loading stories...</div>
            </section>
        `;

        // Dapatkan referensi ke kontainer cerita setelah HTML di-render
        this._storiesContainer = document.getElementById('stories-container');

        // --- Strategi "Cache, then Network, Update Cache" ---

        // 1. Coba tampilkan data dari IndexedDB terlebih dahulu (sangat cepat, bekerja offline)
        await this._renderStoriesFromIndexedDB();

        // 2. Kemudian, secara independen, coba ambil data terbaru dari API
        //    Ini akan berjalan di latar belakang dan memperbarui UI jika ada data baru
        await this._fetchAndSyncStoriesFromAPI();
    }

    /**
     * Memuat dan menampilkan cerita dari IndexedDB.
     */
    async _renderStoriesFromIndexedDB() {
        try {
            this._stories = await getAllStories(); // Ambil semua cerita dari IndexedDB
            if (this._stories && this._stories.length > 0) {
                this._displayStories(this._stories); // Tampilkan cerita di UI
                console.log('Cerita dimuat dari IndexedDB:', this._stories.length, 'item.');
            } else {
                this._storiesContainer.innerHTML = '<p>No local stories found. Trying to fetch from network...</p>';
            }
        } catch (error) {
            console.error('Error loading stories from IndexedDB:', error);
            this._storiesContainer.innerHTML = '<p>Error loading local stories. Please try reloading or check your connection.</p>';
        }
    }

    /**
     * Mengambil cerita terbaru dari API, menyinkronkan dengan IndexedDB,
     * dan memperbarui tampilan jika ada perubahan.
     */
    async _fetchAndSyncStoriesFromAPI() {
        try {
            const apiStories = await StoryAPI.getAllStories(); // Ambil dari API
            console.log('Cerita dimuat dari API:', apiStories.length, 'item.');

            // Bandingkan data API dengan data di IndexedDB untuk memutuskan apakah perlu update
            const currentIndexedDBStories = await getAllStories(); // Ambil lagi untuk perbandingan akurat
            const isDataChanged = this._isStoryDataChanged(currentIndexedDBStories, apiStories);

            if (isDataChanged) {
                console.log('Data cerita dari API berbeda dengan lokal, melakukan sinkronisasi...');
                await this._syncStoriesToIndexedDB(apiStories);
                
                // Setelah sinkronisasi, ambil data terbaru dari IndexedDB dan render ulang
                this._stories = await getAllStories();
                this._displayStories(this._stories);
                alert('Daftar cerita telah diperbarui dengan data terbaru!');
            } else {
                console.log('Data cerita lokal sudah terbaru.');
            }

        } catch (error) {
            console.error('Error fetching stories from API:', error);
            // Jika ada error dari API (misal: offline), dan tidak ada data di IndexedDB sebelumnya
            if (this._stories.length === 0) {
                this._storiesContainer.innerHTML = `<p>Error loading stories from network: ${error.message}. Please check your connection.</p>`;
            } else {
                // Jika sudah ada data di IndexedDB, cukup beri tahu bahwa data mungkin tidak terbaru
                console.warn('Tidak dapat memuat cerita terbaru dari jaringan. Menampilkan cerita yang tersimpan secara lokal.');
            }
        }
    }

    /**
     * Membandingkan dua daftar cerita untuk melihat apakah ada perubahan yang signifikan.
     * @param {Array} localStories Cerita yang ada di IndexedDB.
     * @param {Array} apiStories Cerita yang diterima dari API.
     * @returns {boolean} True jika data berbeda, false jika sama.
     */
    _isStoryDataChanged(localStories, apiStories) {
        if (localStories.length !== apiStories.length) {
            return true; // Jumlah item berbeda, pasti ada perubahan
        }
        // Ini adalah perbandingan sederhana. Untuk produksi, pertimbangkan 'updatedAt' atau hash data.
        const localIds = new Set(localStories.map(s => s.id));
        const apiIds = new Set(apiStories.map(s => s.id));

        // Cek apakah ada ID di API yang tidak ada di lokal, atau sebaliknya
        for (const id of apiIds) {
            if (!localIds.has(id)) return true;
        }
        for (const id of localIds) {
            if (!apiIds.has(id)) return true;
        }
        return false;
    }


    /**
     * Menyinkronkan data API ke IndexedDB.
     * Ini adalah logika sederhana: hapus semua yang lama, tambahkan semua yang baru.
     * Untuk kasus nyata, Anda bisa membandingkan per item dan hanya menambah/memperbarui/menghapus yang perlu.
     * @param {Array} newStories Array cerita terbaru dari API.
     */
    async _syncStoriesToIndexedDB(newStories) {
        try {
            // Hapus semua yang ada di IndexedDB
            const existingStories = await getAllStories();
            for (const story of existingStories) {
                await deleteStory(story.id);
            }
            console.log('Semua cerita lama di IndexedDB dihapus.');

            // Tambahkan semua cerita baru dari API
            for (const story of newStories) {
                // Pastikan setiap 'story' memiliki properti 'id' yang unik
                // yang akan digunakan sebagai keyPath di IndexedDB.
                await addStory(story);
            }
            console.log('Cerita baru dari API berhasil ditambahkan ke IndexedDB.');
        } catch (error) {
            console.error('Gagal sinkronisasi data ke IndexedDB:', error);
            alert('Gagal menyinkronkan cerita lokal dengan data terbaru.');
        }
    }


    /**
     * Menampilkan daftar cerita ke DOM.
     * @param {Array} stories Array objek cerita untuk ditampilkan.
     */
    _displayStories(stories) {
        if (stories.length === 0) {
            this._storiesContainer.innerHTML = '<p>No stories found. Start by adding a new one!</p>';
            return;
        }

        // Hapus konten sebelumnya dan render yang baru
        this._storiesContainer.innerHTML = stories.map(story => createStoryItemTemplate(story)).join('');

        // Render peta untuk setiap cerita (jika ada)
        stories.forEach(story => {
            renderMapForStory(story);
        });

        // Tambahkan event listener untuk tombol hapus (jika ada di template Anda)
        // Perhatikan: Tombol hapus di sini akan menghapus data dari IndexedDB saja.
        // Jika Anda ingin menghapus dari API juga, Anda perlu menambahkan logika API.
        this._storiesContainer.querySelectorAll('.delete-story-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const idToDelete = event.target.dataset.id;
                this._handleDeleteStory(idToDelete);
            });
        });
    }

    /**
     * Menangani penghapusan cerita dari IndexedDB.
     * @param {string} id ID cerita yang akan dihapus.
     */
    async _handleDeleteStory(id) {
        if (confirm('Apakah Anda yakin ingin menghapus cerita ini secara lokal?')) {
            try {
                await deleteStory(id);
                alert('Cerita berhasil dihapus secara lokal!');
                // Setelah dihapus, render ulang tampilan dengan data terbaru dari IndexedDB
                await this._renderStoriesFromIndexedDB();
                // Jika Anda juga ingin menghapus dari API, panggil StoryAPI.deleteStory(id) di sini
            } catch (error) {
                console.error('Gagal menghapus cerita dari IndexedDB:', error);
                alert('Terjadi kesalahan saat menghapus cerita.');
            }
        }
    }
}

export default HomePage;