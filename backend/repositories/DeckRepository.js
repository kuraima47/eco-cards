const { Deck } = require('../models');

class DeckRepository {
    async findAll() {
        return await Deck.findAll();
    }

    async findById(id) {
        return await Deck.findByPk(id);
    }

    async create(deckData) {
        try {
            const deck = await Deck.create(deckData);
            return {
                success: true,
                data: deck
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async update(id, deckData) {
        const deck = await Deck.findByPk(id);
        if (deck) {
            return await deck.update(deckData);
        }
        return null;
    }

    async delete(id) {
        const deck = await Deck.findByPk(id);
        if (deck) {
            await deck.destroy();
            return true;
        }
        return false;
    }
}

module.exports = new DeckRepository();