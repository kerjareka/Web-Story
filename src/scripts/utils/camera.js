// src/scripts/utils/camera.js
class Camera {
    constructor(videoElement) {
        this._videoElement = videoElement;
        this._stream = null;
    }

    async startCapture() {
        try {
            this.stopCapture(); // Stop any existing stream first
            this._stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            this._videoElement.srcObject = this._stream;
            return true;
        } catch (error) {
            console.error('Error accessing camera:', error);
            // alert('Could not access camera. Please allow camera access.'); // Avoid multiple alerts
            return false;
        }
    }

    stopCapture() {
        if (this._stream) {
            this._stream.getTracks().forEach(track => track.stop());
            this._videoElement.srcObject = null;
            this._stream = null;
        }
    }

    takePicture() {
        if (!this._stream) {
            throw new Error('Camera not started.');
        }
        const canvas = document.createElement('canvas');
        canvas.width = this._videoElement.videoWidth;
        canvas.height = this._videoElement.videoHeight;
        const context = canvas.getContext('2d');
        context.drawImage(this._videoElement, 0, 0, canvas.width, canvas.height);

        return new Promise((resolve, reject) => {
            canvas.toBlob((blob) => {
                if (blob) {
                    resolve(blob);
                } else {
                    reject(new Error('Failed to create blob from canvas.'));
                }
            }, 'image/jpeg', 0.8); // 0.8 quality
        });
    }
}

export { Camera };