const { DeckContent } = require('../models');

class DeckContentRepository {
    async findAll() {
        return await DeckContent.findAll();
    }

    async findByDeckId(deckId) {
        return await DeckContent.findAll({ where: { deckId } });
    }

    async create(deckContentData) {
        return await DeckContent.create(deckContentData);
    }

    async delete(deckId, cardId) {
        const deckContent = await DeckContent.findOne({ where: { deckId, cardId } });
        if (deckContent) {
            await deckContent.destroy();
            return true;
        }
        return false;
    }
}

module.exports = new DeckContentRepository();