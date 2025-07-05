// src/scripts/pages/story/add-story-page.js
import { Camera } from '../../utils/camera';
import { MapComponent } from '../../utils/map-component';
import AddStoryPresenter from '../../presenters/add-story-presenter';

class AddStoryPage {
    constructor() {
        this._camera = null;
        this._mapComponent = null;
        this._currentLatLng = null;
        this._photoBlob = null;
        this._marker = null;
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
        const form = document.getElementById('addStoryForm');
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

        form.addEventListener('submit', async (event) => {
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

            const response = await AddStoryPresenter.submitStory({
                description,
                photo: this._photoBlob,
                lat: this._currentLatLng.lat,
                lon: this._currentLatLng.lng,
            });

            if (response.success) {
                alert('Story added successfully!');
                window.location.hash = '/stories';
            } else {
                alert('Failed to add story: ' + response.message);
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
