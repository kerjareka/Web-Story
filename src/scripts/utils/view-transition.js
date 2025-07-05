// src/scripts/utils/view-transition.js
const ViewTransition = {
    async start(callback) {
        if (!document.startViewTransition) {
            console.warn('View Transitions API not supported.');
            await callback();
            return;
        }

        const transition = document.startViewTransition(callback);
        try {
            await transition.finished; // Wait for the transition to finish
        } catch (error) {
            console.error('View transition failed:', error);
        }
    }
};

export { ViewTransition };