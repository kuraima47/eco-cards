const deckContentRepository = require('../repositories/DeckContentRepository');

class DeckContentService {
    async getAllDeckContents() {
        return await deckContentRepository.findAll();
    }

    async getDeckContentsByDeckId(deckId) {
        return await deckContentRepository.findByDeckId(deckId);
    }

    async createDeckContent(deckContentData) {
        return await deckContentRepository.create(deckContentData);
    }

    async deleteDeckContent(deckId, cardId) {
        return await deckContentRepository.delete(deckId, cardId);
    }
}

module.exports = new DeckContentService();