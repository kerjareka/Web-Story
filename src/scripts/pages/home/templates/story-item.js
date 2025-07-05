// src/scripts/pages/home/templates/story-item.js

// Import MapComponent dari direktori utils.
// Ini memungkinkan kita untuk menggunakan kelas MapComponent untuk membuat dan mengelola peta.
import { MapComponent } from '../../../utils/map-component';

/**
 * Fungsi ini membuat dan mengembalikan string HTML untuk satu item cerita.
 * Ini adalah 'template literal' JavaScript yang memungkinkan kita menyisipkan variabel dan ekspresi langsung ke dalam string HTML.
 *
 * @param {object} story - Objek cerita yang berisi data seperti photoUrl, name, description, createdAt, lat, lon, id.
 * @returns {string} String HTML yang merepresentasikan satu item cerita.
 */
const createStoryItemTemplate = (story) => {
    // Memformat tanggal dari 'createdAt' menjadi format yang lebih mudah dibaca,
    // misalnya "2 Juni 2025, 22.30"
    const formattedDate = new Date(story.createdAt).toLocaleDateString('id-ID', {
        year: 'numeric',    // Tahun (e.g., 2025)
        month: 'long',      // Nama bulan lengkap (e.g., Juni)
        day: 'numeric',     // Tanggal (e.g., 2)
        hour: '2-digit',    // Jam (e.g., 22)
        minute: '2-digit'   // Menit (e.g., 30)
    });

    return `
        <article class="story-item" tabindex="0">
            <img class="story-item__thumbnail"
                src="${story.photoUrl}"
                alt="Photo by ${story.name}, showing: ${story.description.substring(0, 100)}..."
                loading="lazy"
            >
            <div class="story-item__content">
                <h2 class="story-item__title" tabindex="0">${story.name}</h2>
                <p class="story-item__description" tabindex="0">${story.description}</p>
                <p class="story-item__date" tabindex="0"><i class="fas fa-calendar-alt"></i> ${formattedDate}</p>

                ${story.lat && story.lon ? `
                    <div class="story-item__map" id="map-${story.id}" style="height: 200px; width: 100%;" aria-label="Location of story by ${story.name}"></div>
                    <p class="story-item__location"><i class="fas fa-map-marker-alt"></i> Lat: ${story.lat.toFixed(4)}, Lon: ${story.lon.toFixed(4)}</p>
                ` : `
                    <p class="story-item__location"><i class="fas fa-map-marker-alt"></i> Location not available</p>
                `}
            </div>
        </article>
    `;
};

/**
 * Fungsi ini bertanggung jawab untuk merender (menginisialisasi) peta Leaflet
 * untuk sebuah item cerita tertentu, jika data lokasinya tersedia.
 *
 * Fungsi ini dipanggil setelah HTML item cerita sudah ada di DOM,
 * karena Leaflet perlu elemen DIV yang sudah ada di DOM untuk menginisialisasi peta.
 *
 * @param {object} story - Objek cerita yang berisi data lokasi (lat, lon, id).
 */
const renderMapForStory = (story) => {
    // Periksa apakah cerita memiliki data latitude dan longitude
    if (story.lat && story.lon) {
        // Dapatkan elemen kontainer peta berdasarkan ID uniknya (map-story.id)
        const mapContainer = document.getElementById(`map-${story.id}`);

        // Pastikan kontainer peta ditemukan di DOM
        if (mapContainer) {
            // Penting: Pastikan library Leaflet (L) sudah dimuat.
            // Walaupun kita sudah mengimpor 'leaflet' di main.js, kadang ada isu timing.
            // Pemeriksaan ini adalah fallback yang baik.
            if (typeof L === 'undefined') {
                console.error('Leaflet library (L) not loaded. Please ensure Leaflet.js is included and available.');
                return; // Hentikan eksekusi jika Leaflet belum siap
            }

            // Periksa apakah peta sudah diinisialisasi pada kontainer ini.
            // Leaflet menambahkan properti _leaflet_id ke elemen DOM setelah diinisialisasi.
            if (mapContainer._leaflet_id) {
                // Peta sudah ada, tidak perlu diinisialisasi ulang.
                // Ini mencegah error "Map already initialized" dari Leaflet.
                return;
            }

            // Buat instance baru dari MapComponent.
            // MapComponent akan menginisialisasi peta Leaflet di dalam 'mapContainer.id'.
            // Parameter ketiga (12) adalah zoom level awal untuk peta mini ini.
            const map = new MapComponent(mapContainer.id, { lat: story.lat, lon: story.lon }, 12);

            // Tambahkan marker (penanda) pada lokasi cerita di peta.
            // Parameter 'popupText' akan muncul ketika marker diklik.
            map.addMarker({ lat: story.lat, lon: story.lon, popupText: `Story by ${story.name}` });
        }
    }
};

// Ekspor kedua fungsi agar bisa digunakan oleh modul lain (misalnya home-page.js)
export { createStoryItemTemplate, renderMapForStory };