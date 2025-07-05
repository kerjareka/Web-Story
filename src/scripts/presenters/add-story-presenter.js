// src/scripts/presenters/add-story-presenter.js
import StoryAPI from '../data/api';

const AddStoryPresenter = {
    async submitStory({ description, photo, lat, lon }) {
        try {
            const result = await StoryAPI.addStory({ description, photo, lat, lon });
            return { success: true, result };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }
};

export default AddStoryPresenter;
