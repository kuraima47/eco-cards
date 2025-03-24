const deckRepository = require('../repositories/DeckRepository');
const deckContentService = require('./DeckContentService');

class DeckService {
    async getAllDecks() {
        return await deckRepository.findAll();
    }

    async getDeckById(id) {
        return await deckRepository.findById(id);
    }

    async createDeck(deckData) {
        this.validateDeckData(deckData);

        const sanitizedData = {
            deckName: deckData.deckName.trim(),
            adminId: parseInt(deckData.adminId)
        };

        return await deckRepository.create(sanitizedData);
    }

    async addCardToDeck(deckId, cardId) {
        const deck = await this.getDeckById(deckId);
        if (!deck) {
            throw new Error('Deck not found');
        }

        const existing = await deckContentService.getDeckContentsByDeckId(deckId);
        if (existing.some(content => content.cardId === cardId)) {
            throw new Error('Card already exists in deck');
        }

        return await deckContentService.createDeckContent({ deckId, cardId });
    }

    async removeCardFromDeck(deckId, cardId) {
        const deck = await this.getDeckById(deckId);
        if (!deck) {
            throw new Error('Deck not found');
        }
        return await deckContentService.deleteDeckContent(deckId, cardId);
    }

    async getCardsInDeck(deckId) {
        const deck = await this.getDeckById(deckId);
        if (!deck) {
            throw new Error('Deck not found');
        }
        return await deckContentService.getDeckContentsByDeckId(deckId);
    }

    async updateDeck(id, deckData) {
        return await deckRepository.update(id, deckData);
    }

    async deleteDeck(id) {
        return await deckRepository.delete(id);
    }

    validateDeckData(deckData) {
        if (!deckData.adminId) {
            throw new Error('adminId is required');
        }
        if (!deckData.deckName) {
            throw new Error('deckName is required');
        }
    }
}

module.exports = new DeckService();