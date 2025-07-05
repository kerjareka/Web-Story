// src/scripts/pages/home/home-page.js
import StoryAPI from '../../data/api';
import { createStoryItemTemplate, renderMapForStory } from './templates/story-item';

class HomePage {
    constructor() {
        this._stories = [];
    }

    async render(container) {
        container.innerHTML = `
            <section id="stories-list" class="stories-list" aria-labelledby="stories-list-heading">
                <h2 id="stories-list-heading" class="sr-only">List of Stories</h2>
                <div id="stories-container" class="stories-grid">Loading stories...</div>
            </section>
        `;

        await this._fetchAndRenderStories();
    }

    async _fetchAndRenderStories() {
        const storiesContainer = document.getElementById('stories-container');
        storiesContainer.innerHTML = '<p>Loading stories...</p>';

        try {
            this._stories = await StoryAPI.getAllStories();

            if (this._stories && this._stories.length > 0) {
                storiesContainer.innerHTML = this._stories.map(story => createStoryItemTemplate(story)).join('');

                this._stories.forEach(story => {
                    renderMapForStory(story);
                });
            } else {
                storiesContainer.innerHTML = '<p>No stories found. Start by adding a new one!</p>';
            }
        } catch (error) {
            storiesContainer.innerHTML = `<p>Error loading stories: ${error.message}. Please try again.</p>`;
        }
    }
}

export default HomePage;