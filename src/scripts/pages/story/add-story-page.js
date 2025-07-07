// src/scripts/pages/story/add-story-page.js

import { Camera } from '../../utils/camera';
import { MapComponent } from '../../utils/map-component';
import AddStoryPresenter from '../../presenters/add-story-presenter';
import { addStory } from '../../data/story-db'; // <--- IMPOR addStory dari modul IndexedDB Anda

class AddStoryPage {
    constructor() {
        this._camera = null;
        this._mapComponent = null;
        this._currentLatLng = null;
        this._photoBlob = null;
        this._marker = null;
        this._addStoryForm = null; // Tambahkan ini agar form bisa diakses di luar constructor
    }

    async render(container) {
        container.innerHTML = `
            <section class="add-story-section" aria-labelledby="add-story-heading">
                <h2 id="add-story-heading">Add New Story</h2>
                <form id="addStoryForm">
                    <div class="form-group">
                        <label for="description">Description:</label>
                        <textarea id="description" name="description" rows="5" required aria-required="true" placeholder="Enter story description"></textarea>
                    </div>

                    <div class="form-group">
                        <label for="cameraFeed">Take Photo:</label>
                        <video id="cameraFeed" autoplay playsinline muted style="display: none;"></video>
                        <button type="button" id="startCameraButton" class="button-primary">Start Camera</button>
                        <button type="button" id="takePictureButton" class="button-secondary" disabled>Take Picture</button>
                        <img id="photoPreview" alt="Photo preview" style="max-width: 100%; display: none;">
                    </div>

                    <div class="form-group">
                        <label for="latitude">Location (Click on Map):</label>
                        <input type="text" id="latitude" name="latitude" placeholder="Latitude" readonly aria-label="Selected Latitude" required>
                        <input type="text" id="longitude" name="longitude" placeholder="Longitude" readonly aria-label="Selected Longitude" required>
                        <div id="addStoryMap" style="height: 300px; width: 100%; margin-top: 10px;"></div>
                    </div>

                    <button type="submit" class="button-success">Submit Story</button>
                </form>
            </section>
        `;

        this._setupFormListeners();
    }

    _setupFormListeners() {
        this._addStoryForm = document.getElementById('addStoryForm'); // Inisialisasi di sini
        const cameraFeed = document.getElementById('cameraFeed');
        const startCameraButton = document.getElementById('startCameraButton');
        const takePictureButton = document.getElementById('takePictureButton');
        const photoPreview = document.getElementById('photoPreview');
        const latitudeInput = document.getElementById('latitude');
        const longitudeInput = document.getElementById('longitude');
        const mapContainer = document.getElementById('addStoryMap');

        this._camera = new Camera(cameraFeed);
        this._mapComponent = new MapComponent(mapContainer.id, { lat: -6.2088, lon: 106.8456 }, 10);

        startCameraButton.addEventListener('click', async () => {
            const started = await this._camera.startCapture();
            if (started) {
                startCameraButton.disabled = true;
                takePictureButton.disabled = false;
                cameraFeed.style.display = 'block';
                photoPreview.style.display = 'none';
            }
        });

        takePictureButton.addEventListener('click', async () => {
            try {
                this._photoBlob = await this._camera.takePicture();
                this._camera.stopCapture();
                takePictureButton.disabled = true;
                startCameraButton.disabled = false;

                const imageUrl = URL.createObjectURL(this._photoBlob);
                photoPreview.src = imageUrl;
                photoPreview.style.display = 'block';
                cameraFeed.style.display = 'none';
            } catch (error) {
                console.error('Error taking picture:', error);
                alert('Could not take picture. Please ensure camera is active.');
            }
        });

        this._mapComponent.addClickListener((latlng) => {
            this._currentLatLng = latlng;
            latitudeInput.value = latlng.lat.toFixed(6);
            longitudeInput.value = latlng.lng.toFixed(6);

            if (this._marker) {
                this._mapComponent.getMapInstance().removeLayer(this._marker);
            }

            if (typeof L !== 'undefined') {
                this._marker = L.marker([latlng.lat, latlng.lng]).addTo(this._mapComponent.getMapInstance());
                this._marker.bindPopup('Selected Location').openPopup();
            } else {
                console.warn('Leaflet (L) not available. Cannot add marker.');
            }
        });

        // MODIFIKASI PENTING DI SINI:
        this._addStoryForm.addEventListener('submit', async (event) => { // Menggunakan this._addStoryForm
            event.preventDefault();

            if (!this._photoBlob) {
                alert('Please take a photo!');
                return;
            }

            if (!this._currentLatLng) {
                alert('Please select a location on the map!');
                return;
            }

            const description = document.getElementById('description').value;

            // ===== BAGIAN UNTUK MENGIRIM KE API =====
            const apiResponse = await AddStoryPresenter.submitStory({
                description,
                photo: this._photoBlob,
                lat: this._currentLatLng.lat,
                lon: this._currentLatLng.lng,
            });

            if (apiResponse.success) {
                alert('Story added successfully to server!');
                // ===== BAGIAN UNTUK MENYIMPAN KE INDEXEDDB (SETELAH BERHASIL KE SERVER) =====
                try {
                    // Pastikan Anda mendapatkan ID dari server jika ada, atau gunakan ID unik baru
                    // Jika API mengembalikan ID baru, gunakan ID tersebut untuk menyimpan di IndexedDB
                    const storyDataToSave = {
                        id: apiResponse.storyId || `local-story-${Date.now()}`, // Gunakan ID dari API jika ada, atau ID lokal
                        description: description,
                        lat: this._currentLatLng.lat,
                        lon: this._currentLatLng.lng,
                        photoUrl: apiResponse.photoUrl || URL.createObjectURL(this._photoBlob), // Jika API mengembalikan URL foto
                        createdAt: new Date().toISOString(), // Tambahkan timestamp
                        // Tambahkan properti lain yang relevan dari API response
                    };
                    await addStory(storyDataToSave);
                    alert('Cerita juga berhasil disimpan secara lokal!');
                } catch (dbError) {
                    console.error('Gagal menyimpan cerita ke IndexedDB:', dbError);
                    alert('Cerita berhasil dikirim ke server, tapi gagal disimpan secara lokal.');
                }
                // =========================================================================

                window.location.hash = '/stories'; // Redirect setelah sukses
            } else {
                alert('Failed to add story to server: ' + apiResponse.message);
                // Opsi: Jika gagal ke server, Anda bisa tetap simpan ke IndexedDB
                // dan menandainya sebagai 'needs_sync' untuk background sync nanti.
            }
        });
    }

    onLeave() {
        if (this._camera) {
            this._camera.stopCapture();
        }
        if (this._mapComponent && this._mapComponent.getMapInstance()) {
            this._mapComponent.getMapInstance().remove();
            this._mapComponent = null;
        }
    }
}

export default AddStoryPage;